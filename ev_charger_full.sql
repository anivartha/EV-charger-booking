-- EV CHARGER BOOKING SYSTEM (MySQL DDL + Sample Objects)

DROP DATABASE IF EXISTS ev_charger;
CREATE DATABASE ev_charger;
USE ev_charger;

-- USERS TABLE
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    phone VARCHAR(15),
    vehicle_number VARCHAR(20)
);

-- ADMIN TABLE
CREATE TABLE admin (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    role VARCHAR(20) DEFAULT 'admin'
);

-- OWNER TABLE
CREATE TABLE owner (
    owner_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    verified BOOLEAN DEFAULT FALSE
);

-- CHARGING STATION
CREATE TABLE charging_station (
    station_id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT,
    station_name VARCHAR(100),
    location VARCHAR(255),
    latitude DECIMAL(10,6),
    longitude DECIMAL(10,6),
    status ENUM('pending','approved','rejected') DEFAULT 'pending',
    FOREIGN KEY(owner_id) REFERENCES owner(owner_id)
);

-- BOOTH
CREATE TABLE booth (
    booth_id INT AUTO_INCREMENT PRIMARY KEY,
    station_id INT,
    booth_name VARCHAR(100),
    charger_type VARCHAR(50),
    price_per_hour DECIMAL(10,2),
    FOREIGN KEY(station_id) REFERENCES charging_station(station_id)
);

-- SLOT
CREATE TABLE slot (
    slot_id INT AUTO_INCREMENT PRIMARY KEY,
    booth_id INT,
    slot_date DATE,
    start_time TIME,
    end_time TIME,
    is_booked BOOLEAN DEFAULT FALSE,
    FOREIGN KEY(booth_id) REFERENCES booth(booth_id)
);

-- BOOKING
CREATE TABLE booking (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    slot_id INT,
    user_id INT,
    payment_status ENUM('pending','paid','failed') DEFAULT 'pending',
    booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(slot_id) REFERENCES slot(slot_id),
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);

-- PAYMENT
CREATE TABLE payment (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT,
    amount DECIMAL(10,2),
    mode VARCHAR(20),
    transaction_id VARCHAR(100),
    payment_status ENUM('pending','success','failed'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(booking_id) REFERENCES booking(booking_id)
);

-- COMPLAINT
CREATE TABLE complaint (
    complaint_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    station_id INT,
    issue TEXT,
    status ENUM('pending','resolved') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(user_id),
    FOREIGN KEY(station_id) REFERENCES charging_station(station_id)
);

-- =====================================================
-- TRIGGERS, PROCEDURES, NESTED QUERIES
-- =====================================================

USE ev_charger;

-- ============================
-- 1) TRIGGERS
-- ============================

-- TRIGGER 1: When a booking is created, mark the slot as booked
DELIMITER $$
CREATE TRIGGER trg_after_booking
AFTER INSERT ON booking
FOR EACH ROW
BEGIN
    UPDATE slot
    SET is_booked = TRUE
    WHERE slot_id = NEW.slot_id;
END$$
DELIMITER ;

-- TRIGGER 2: When a payment succeeds, update booking payment_status
DELIMITER $$
CREATE TRIGGER trg_payment_success
AFTER INSERT ON payment
FOR EACH ROW
BEGIN
    IF NEW.payment_status = 'success' THEN
        UPDATE booking
        SET payment_status = 'paid'
        WHERE booking_id = NEW.booking_id;
    END IF;
END$$
DELIMITER ;

-- TRIGGER 3: Auto-approve station if owner is verified
DELIMITER $$
CREATE TRIGGER trg_auto_approve_station
BEFORE INSERT ON charging_station
FOR EACH ROW
BEGIN
    DECLARE isVer BOOLEAN DEFAULT FALSE;
    SELECT verified INTO isVer FROM owner WHERE owner_id = NEW.owner_id;
    IF isVer = TRUE THEN
        SET NEW.status = 'approved';
    END IF;
END$$
DELIMITER ;

-- ============================
-- 2) STORED PROCEDURES
-- ============================

-- Procedure 1: Add new slot
DELIMITER $$
CREATE PROCEDURE add_slot(
    IN b_id INT,
    IN s_date DATE,
    IN s_start TIME,
    IN s_end TIME
)
BEGIN
    INSERT INTO slot (booth_id, slot_date, start_time, end_time)
    VALUES (b_id, s_date, s_start, s_end);
END$$
DELIMITER ;

-- Procedure 2: Get available slots
DELIMITER $$
CREATE PROCEDURE get_available_slots(IN st_id INT)
BEGIN
    SELECT booth.booth_name, slot.*
    FROM slot
    JOIN booth ON booth.booth_id = slot.booth_id
    WHERE booth.station_id = st_id
      AND slot.is_booked = FALSE;
END$$
DELIMITER ;

-- Procedure 3: Count bookings of a user
DELIMITER $$
CREATE PROCEDURE user_booking_count(IN u_id INT)
BEGIN
    SELECT COUNT(*) AS total_bookings
    FROM booking
    WHERE user_id = u_id;
END$$
DELIMITER ;

-- ============================
-- 3) NESTED QUERIES
-- ============================

-- Query 1
SELECT name FROM users
WHERE user_id IN (SELECT user_id FROM booking);

-- Query 2
SELECT station_name FROM charging_station
WHERE station_id IN (
    SELECT station_id FROM booth
    GROUP BY station_id
    HAVING COUNT(*) > 3
);

-- Query 3
SELECT * FROM payment
WHERE amount > (SELECT AVG(amount) FROM payment);

-- Query 4
SELECT name FROM owner
WHERE owner_id IN (
    SELECT owner_id FROM charging_station
    WHERE status = 'approved'
);

-- Query 5
SELECT booth_name FROM booth
WHERE booth_id IN (
    SELECT booth_id FROM slot
    WHERE is_booked = TRUE
);
