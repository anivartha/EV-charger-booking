USE ev_charger;

-- ============================================
-- INSERT REAL USERS (AS REQUESTED)
-- ============================================

INSERT INTO users (name, email, password, phone, vehicle_number) VALUES
('Anagha', 'anagha@gmail.com', 'anagha123', '9876543210', 'KA01AB1234'),
('Ani', 'ani@gmail.com', 'ani123', '9000000001', 'KA02CD5678'),
('Mahitha', 'mahitha@gmail.com', 'mahitha123', '9000000002', 'KA03EF9999'),

-- Two placeholder rows for new users later
('To Be Added', 'user4@example.com', 'pass4', '9999999999', 'KA00ZZ0000'),
('To Be Added', 'user5@example.com', 'pass5', '9999999998', 'KA00YY0000');

-- ============================================
-- INSERT ADMINS (AS REQUESTED)
-- ============================================

INSERT INTO admin (name, email, password) VALUES
('Admin Anagha', 'anagha@ev.com', '1234'),
('Admin Ani', 'ani@ev.com', '1234');

-- ============================================
-- INSERT OWNERS
-- ============================================

INSERT INTO owner (name, email, password, verified) VALUES
('Owner Verified', 'verified.owner@ev.com', 'ownerpass1', TRUE),
('Owner Pending', 'pending.owner@ev.com', 'ownerpass2', FALSE);

-- ============================================
-- INSERT CHARGING STATIONS
-- ============================================

INSERT INTO charging_station (owner_id, station_name, location, latitude, longitude)
VALUES
(1, 'Station A - Thalaghattapura', 'Thalaghattapura', 12.845000, 77.620000),
(2, 'Station B - MG Road', 'MG Road', 12.975000, 77.605000);

-- ============================================
-- INSERT BOOTHS
-- ============================================

INSERT INTO booth (station_id, booth_name, charger_type, price_per_hour) VALUES
(1, 'Booth A1', 'AC Fast (30 kW)', 50.00),
(1, 'Booth A2', 'DC Fast (60 kW)', 80.00),
(2, 'Booth B1', 'AC Fast (40 kW)', 60.00);

-- ============================================
-- INSERT SLOTS (Today + Next 2 Days)
-- 2025-11-14 / 2025-11-15 / 2025-11-16
-- ============================================

-- Station A - Booth A1 (booth_id = 1)
CALL add_slot(1, '2025-11-14', '10:00:00', '10:30:00');
CALL add_slot(1, '2025-11-14', '10:30:00', '11:00:00');
CALL add_slot(1, '2025-11-15', '09:00:00', '09:30:00');
CALL add_slot(1, '2025-11-15', '09:30:00', '10:00:00');
CALL add_slot(1, '2025-11-16', '15:00:00', '15:30:00');

-- Station A - Booth A2 (booth_id = 2)
CALL add_slot(2, '2025-11-14', '14:00:00', '14:30:00');
CALL add_slot(2, '2025-11-15', '08:00:00', '08:30:00');
CALL add_slot(2, '2025-11-16', '16:00:00', '16:30:00');

-- Station B - Booth B1 (booth_id = 3)
CALL add_slot(3, '2025-11-14', '12:00:00', '12:30:00');
CALL add_slot(3, '2025-11-15', '17:00:00', '17:30:00');
CALL add_slot(3, '2025-11-16', '18:00:00', '18:30:00');

-- ============================================
-- INSERT BOOKINGS
-- ============================================

INSERT INTO booking (slot_id, user_id, payment_status)
VALUES 
(1, 1, 'pending'),
(3, 2, 'pending'),
(9, 3, 'pending');

-- ============================================
-- INSERT PAYMENTS
-- ============================================

INSERT INTO payment (booking_id, amount, mode, transaction_id, payment_status) VALUES
(1, 50.00, 'UPI', 'TXN1001', 'success'),
(2, 50.00, 'Card', 'TXN1002', 'success'),
(3, 60.00, 'UPI', 'TXN1003', 'failed');

-- ============================================
-- INSERT COMPLAINTS
-- ============================================

INSERT INTO complaint (user_id, station_id, issue, status) VALUES
(1, 1, 'Charger speed was too slow', 'pending'),
(2, 2, 'Payment was not processed', 'resolved'),
(3, 1, 'Booth was not clean', 'pending');

