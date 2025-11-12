-- Auto Slot Generation for 3 Days
-- Automatically generates slots for next 3 days when charger is added

BEGIN;

-- Function: Auto-generate slots for next 3 days when charger is created
CREATE OR REPLACE FUNCTION auto_generate_slots_3days()
RETURNS TRIGGER AS $$
DECLARE
    i INT := 0;
BEGIN
    -- Generate slots for today and next 2 days (total 3 days)
    WHILE i < 3 LOOP
        PERFORM generate_slots(NEW.charger_id, CURRENT_DATE + i);
        i := i + 1;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Fire after charger is inserted
DROP TRIGGER IF EXISTS trg_auto_generate_slots_3days ON chargers_new;
CREATE TRIGGER trg_auto_generate_slots_3days
AFTER INSERT ON chargers_new
FOR EACH ROW
EXECUTE FUNCTION auto_generate_slots_3days();

-- Function: Check if booking date is within 3-day range
CREATE OR REPLACE FUNCTION is_booking_date_valid(booking_date DATE)
RETURNS BOOLEAN AS $$
BEGIN
    -- Allow bookings only for today and next 2 days (3 days total)
    RETURN booking_date >= CURRENT_DATE AND booking_date <= CURRENT_DATE + INTERVAL '2 days';
END;
$$ LANGUAGE plpgsql STABLE;

COMMIT;

