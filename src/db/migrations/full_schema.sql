-- Full Database Schema for EV Charger Booking System
-- Includes stations, chargers, slots, bookings, and booking_logs

BEGIN;

-- ============================================
-- TABLES
-- ============================================

-- Stations Table
CREATE TABLE IF NOT EXISTS stations (
    station_id SERIAL PRIMARY KEY,
    station_name TEXT NOT NULL,
    location TEXT NOT NULL,
    total_revenue NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chargers Table (new schema)
CREATE TABLE IF NOT EXISTS chargers_new (
    charger_id SERIAL PRIMARY KEY,
    station_id INT NOT NULL REFERENCES stations(station_id) ON DELETE CASCADE,
    charger_type TEXT NOT NULL,
    power_kw INT NOT NULL,
    status TEXT DEFAULT 'Available' CHECK (status IN ('Available', 'Occupied', 'Maintenance')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Slots Table (30-minute time slots)
CREATE TABLE IF NOT EXISTS slots (
    slot_id SERIAL PRIMARY KEY,
    charger_id INT NOT NULL REFERENCES chargers_new(charger_id) ON DELETE CASCADE,
    slot_date DATE NOT NULL,
    slot_time TIME NOT NULL,
    is_booked BOOLEAN DEFAULT FALSE,
    UNIQUE(charger_id, slot_date, slot_time)
);

-- Bookings Table (updated to work with new schema)
-- Note: user_id references users table (which uses UUID, but we'll use INT for new users)
CREATE TABLE IF NOT EXISTS bookings_new (
    booking_id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL, -- Using TEXT to handle both UUID and potential INT user IDs
    charger_id INT NOT NULL REFERENCES chargers_new(charger_id) ON DELETE CASCADE,
    slot_start TIMESTAMP NOT NULL,
    slot_end TIMESTAMP NOT NULL,
    amount NUMERIC(8,2) DEFAULT 0,
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Booking Logs Table
CREATE TABLE IF NOT EXISTS booking_logs (
    log_id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES bookings_new(booking_id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    log_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chargers_new_station ON chargers_new(station_id);
CREATE INDEX IF NOT EXISTS idx_slots_charger_date ON slots(charger_id, slot_date);
CREATE INDEX IF NOT EXISTS idx_bookings_new_user ON bookings_new(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_new_charger ON bookings_new(charger_id);
CREATE INDEX IF NOT EXISTS idx_booking_logs_booking ON booking_logs(booking_id);

COMMIT;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function: Generate 30-minute slots for a charger on a given date
CREATE OR REPLACE FUNCTION generate_slots(charger INT, slot_date DATE)
RETURNS VOID AS $$
DECLARE
    start_time TIME := '00:00';
    end_time   TIME := '23:30';
    slot_time_var TIME;
BEGIN
    -- Delete existing slots for this charger and date
    DELETE FROM slots WHERE charger_id = charger AND slot_date = slot_date;
    
    -- Generate slots every 30 minutes
    slot_time_var := start_time;
    WHILE slot_time_var <= end_time LOOP
        INSERT INTO slots (charger_id, slot_date, slot_time, is_booked)
        VALUES (charger, slot_date, slot_time_var, FALSE)
        ON CONFLICT (charger_id, slot_date, slot_time) DO NOTHING;
        
        slot_time_var := slot_time_var + INTERVAL '30 minutes';
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function: Mark slot as booked when booking is created
CREATE OR REPLACE FUNCTION mark_slot_booked()
RETURNS TRIGGER AS $$
DECLARE
    slot_start_time TIME;
    slot_end_time TIME;
    current_slot_time TIME;
BEGIN
    slot_start_time := TO_CHAR(NEW.slot_start, 'HH24:MI')::TIME;
    slot_end_time := TO_CHAR(NEW.slot_end, 'HH24:MI')::TIME;
    
    -- Mark all slots in the booking time range as booked
    current_slot_time := slot_start_time;
    WHILE current_slot_time < slot_end_time LOOP
        UPDATE slots
        SET is_booked = TRUE
        WHERE charger_id = NEW.charger_id
          AND slot_date = DATE(NEW.slot_start)
          AND slot_time = current_slot_time;
        
        current_slot_time := current_slot_time + INTERVAL '30 minutes';
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Log booking changes
CREATE OR REPLACE FUNCTION log_booking_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO booking_logs (booking_id, action)
        VALUES (OLD.booking_id, 'DELETE');
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO booking_logs (booking_id, action)
        VALUES (NEW.booking_id, 'UPDATE');
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO booking_logs (booking_id, action)
        VALUES (NEW.booking_id, 'INSERT');
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function: Update station revenue when booking is created
CREATE OR REPLACE FUNCTION update_station_revenue()
RETURNS TRIGGER AS $$
DECLARE
    charger_station INT;
BEGIN
    SELECT station_id INTO charger_station
    FROM chargers_new WHERE charger_id = NEW.charger_id;
    
    IF charger_station IS NOT NULL THEN
        UPDATE stations
        SET total_revenue = total_revenue + NEW.amount
        WHERE station_id = charger_station;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: Mark slots as booked when booking is created
DROP TRIGGER IF EXISTS trg_slot_booked ON bookings_new;
CREATE TRIGGER trg_slot_booked
AFTER INSERT ON bookings_new
FOR EACH ROW EXECUTE FUNCTION mark_slot_booked();

-- Trigger: Log booking changes
DROP TRIGGER IF EXISTS trg_booking_log ON bookings_new;
CREATE TRIGGER trg_booking_log
AFTER INSERT OR UPDATE OR DELETE ON bookings_new
FOR EACH ROW EXECUTE FUNCTION log_booking_changes();

-- Trigger: Update station revenue
DROP TRIGGER IF EXISTS trg_revenue_update ON bookings_new;
CREATE TRIGGER trg_revenue_update
AFTER INSERT ON bookings_new
FOR EACH ROW EXECUTE FUNCTION update_station_revenue();

COMMIT;

