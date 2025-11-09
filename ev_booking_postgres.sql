-- ev_booking_postgres.sql
-- EV Charging Station Booking schema + sample data + functions + triggers
BEGIN;

-- USERS
CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ADMINS
CREATE TABLE IF NOT EXISTS admins (
  admin_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password TEXT NOT NULL
);

-- STATIONS
CREATE TABLE IF NOT EXISTS stations (
  station_id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  total_ports INT NOT NULL CHECK (total_ports >= 0),
  rate_per_hour NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- PORTS
CREATE TABLE IF NOT EXISTS ports (
  port_id SERIAL PRIMARY KEY,
  station_id INT NOT NULL REFERENCES stations(station_id) ON DELETE CASCADE,
  port_label VARCHAR(20) NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  CONSTRAINT port_uniquelabel UNIQUE (station_id, port_label),
  CONSTRAINT port_status_check CHECK (status IN ('available','booked','maintenance'))
);

-- BOOKINGS
CREATE TABLE IF NOT EXISTS bookings (
  booking_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  port_id INT NOT NULL REFERENCES ports(port_id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'booked',
  bill NUMERIC(12,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT booking_time_check CHECK (end_time > start_time),
  CONSTRAINT booking_status_check CHECK (status IN ('booked','completed','cancelled'))
);

-- PAYMENTS (optional)
CREATE TABLE IF NOT EXISTS payments (
  payment_id SERIAL PRIMARY KEY,
  booking_id INT NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  method VARCHAR(50)
);

-- LOGS (for triggers)
CREATE TABLE IF NOT EXISTS logs (
  log_id SERIAL PRIMARY KEY,
  event_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  event_type VARCHAR(100),
  details TEXT
);

COMMIT;

-- ===== Insert sample stations and ports (idempotent) =====
BEGIN;

INSERT INTO stations (name, address, city, total_ports, rate_per_hour)
VALUES
('GreenCharge Station - MG Road', '12 MG Road', 'Bengaluru', 4, 30.00),
('RapidVolt Station - Whitefield', '88 Whitefield Rd', 'Bengaluru', 6, 45.00)
ON CONFLICT DO NOTHING;

-- Insert ports only if ports table empty
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM ports) = 0 THEN
    INSERT INTO ports (station_id, port_label)
    SELECT s.station_id, 'P' || gs.i::text
    FROM stations s, generate_series(1, s.total_ports) AS gs(i);
  END IF;
END$$;

INSERT INTO users (name, email, phone)
VALUES
('Anagha','anagha@example.com','9999000001'),
('Ani','ani@example.com','9999000002')
ON CONFLICT (email) DO NOTHING;

INSERT INTO admins (name, email, password)
VALUES ('Prof','prof@example.com','pass123')
ON CONFLICT (email) DO NOTHING;

COMMIT;

-- ===== Function: compute_bill =====
CREATE OR REPLACE FUNCTION compute_bill(start_dt TIMESTAMP WITH TIME ZONE, end_dt TIMESTAMP WITH TIME ZONE, station_rate NUMERIC)
RETURNS NUMERIC AS $$
DECLARE
  hours NUMERIC;
  res NUMERIC;
BEGIN
  IF end_dt <= start_dt THEN
    RETURN 0;
  END IF;
  hours := EXTRACT(EPOCH FROM (end_dt - start_dt)) / 3600.0;
  res := ROUND(hours * station_rate::numeric, 2);
  RETURN res;
END;
$$ LANGUAGE plpgsql STABLE;

-- ===== Function: make_booking =====
CREATE OR REPLACE FUNCTION make_booking(p_user_id INT, p_port_id INT, p_start TIMESTAMP WITH TIME ZONE, p_end TIMESTAMP WITH TIME ZONE)
RETURNS INT AS $$
DECLARE
  cur_status TEXT;
  station_rate NUMERIC;
  b_id INT;
  overlap_count INT;
  port_station_id INT;
BEGIN
  IF p_end <= p_start THEN
    RAISE EXCEPTION 'end_time must be after start_time';
  END IF;

  -- lock port row
  SELECT status, station_id INTO cur_status, port_station_id FROM ports WHERE port_id = p_port_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Port not found';
  END IF;
  IF cur_status <> 'available' THEN
    RAISE EXCEPTION 'Port % is not available (status=%)', p_port_id, cur_status;
  END IF;

  -- overlapping check
  SELECT COUNT(*) INTO overlap_count
  FROM bookings
  WHERE port_id = p_port_id
    AND status = 'booked'
    AND p_start < end_time
    AND start_time < p_end;

  IF overlap_count > 0 THEN
    RAISE EXCEPTION 'Time slot overlaps existing booking';
  END IF;

  -- get station rate
  SELECT rate_per_hour INTO station_rate FROM stations WHERE station_id = port_station_id;
  IF station_rate IS NULL THEN
    RAISE EXCEPTION 'Station rate not found';
  END IF;

  -- insert booking and compute bill
  INSERT INTO bookings (user_id, port_id, start_time, end_time, bill, status)
  VALUES (p_user_id, p_port_id, p_start, p_end, compute_bill(p_start, p_end, station_rate), 'booked')
  RETURNING booking_id INTO b_id;

  -- set port as booked
  UPDATE ports SET status = 'booked' WHERE port_id = p_port_id;

  -- log
  INSERT INTO logs (event_type, details)
  VALUES ('booking_created', 'Booking ' || b_id || ' user=' || p_user_id || ' port=' || p_port_id || ' bill=' || (SELECT bill FROM bookings WHERE booking_id = b_id)::text);

  RETURN b_id;
END;
$$ LANGUAGE plpgsql;

-- ===== Function: cancel_booking =====
CREATE OR REPLACE FUNCTION cancel_booking(p_booking_id INT, p_by_user INT)
RETURNS VOID AS $$
DECLARE
  cur_port INT;
  cur_status TEXT;
BEGIN
  SELECT port_id, status INTO cur_port, cur_status FROM bookings WHERE booking_id = p_booking_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;
  IF cur_status = 'cancelled' THEN
    RAISE EXCEPTION 'Already cancelled';
  END IF;

  UPDATE bookings SET status = 'cancelled' WHERE booking_id = p_booking_id;
  UPDATE ports SET status = 'available' WHERE port_id = cur_port;

  INSERT INTO logs (event_type, details) VALUES ('booking_cancelled', 'Booking ' || p_booking_id || ' cancelled by user=' || p_by_user);
END;
$$ LANGUAGE plpgsql;

-- ===== Triggers: logging & freeing ports =====
-- After insert: log
CREATE OR REPLACE FUNCTION trg_booking_after_insert_fn()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO logs (event_type, details)
  VALUES ('booking_insert', 'Booking ' || NEW.booking_id || ' created for port=' || NEW.port_id || ' user=' || NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_booking_after_insert ON bookings;
CREATE TRIGGER trg_booking_after_insert AFTER INSERT ON bookings
FOR EACH ROW EXECUTE FUNCTION trg_booking_after_insert_fn();

-- After update: free port when completed or cancelled
CREATE OR REPLACE FUNCTION trg_booking_after_update_fn()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.status IN ('completed','cancelled')) AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    UPDATE ports SET status = 'available' WHERE port_id = NEW.port_id;
    INSERT INTO logs (event_type, details) VALUES ('booking_status_change', 'Booking ' || NEW.booking_id || ' status ' || OLD.status || '->' || NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_booking_after_update ON bookings;
CREATE TRIGGER trg_booking_after_update AFTER UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION trg_booking_after_update_fn();

-- After delete: log deletion
CREATE OR REPLACE FUNCTION trg_booking_after_delete_fn()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO logs (event_type, details) VALUES ('booking_deleted', 'Booking ' || OLD.booking_id || ' for port=' || OLD.port_id || ' user=' || OLD.user_id);
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_booking_after_delete ON bookings;
CREATE TRIGGER trg_booking_after_delete AFTER DELETE ON bookings
FOR EACH ROW EXECUTE FUNCTION trg_booking_after_delete_fn();

COMMIT;

-- ===== Helpful sample query notes =====
-- To create a booking:
-- SELECT make_booking(1, 1, '2025-11-06 10:00:00+05:30', '2025-11-06 11:30:00+05:30');
-- To cancel:
-- SELECT cancel_booking(<booking_id>, 1);

