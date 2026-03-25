-- ==========================================
-- SUPREME AUTOMATION: GLOBAL TRIGGERS
-- ==========================================

-- 1. Helper Function to notify all Admins
CREATE OR REPLACE FUNCTION notify_admins(p_title TEXT, p_message TEXT, p_type TEXT) 
RETURNS void AS $$
DECLARE
    admin_record RECORD;
BEGIN
    FOR admin_record IN SELECT id FROM users WHERE role = 'admin' LOOP
        INSERT INTO notifications (user_id, type, title, message)
        VALUES (admin_record.id, p_type, p_title, p_message);
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger: New User Welcome
CREATE OR REPLACE FUNCTION notify_new_user() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notifications (user_id, type, title, message)
    VALUES (NEW.id, 'system', 'Welcome to Suraj Sewing!', 'Thank you for joining our community! We are excited to have you on board.');
    
    -- Also notify Admins about new signup
    PERFORM notify_admins('New User Alert', 'A new user just registered: ' || NEW.name || ' (' || NEW.email || ')', 'system');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_new_user ON users;
CREATE TRIGGER trigger_new_user AFTER INSERT ON users FOR EACH ROW EXECUTE FUNCTION notify_new_user();

-- 3. Trigger: New Feedback Alert for Admins
CREATE OR REPLACE FUNCTION notify_new_feedback() RETURNS TRIGGER AS $$
BEGIN
    PERFORM notify_admins('New Feedback Received', 'Category: ' || NEW.category || ' - From: ' || NEW.name || ' (' || NEW.email || ')', 'system');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_new_feedback ON feedback;
CREATE TRIGGER trigger_new_feedback AFTER INSERT ON feedback FOR EACH ROW EXECUTE FUNCTION notify_new_feedback();

-- 4. Trigger: Low Stock Alert for Admins
CREATE OR REPLACE FUNCTION check_low_stock() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stock <= 3 AND OLD.stock > 3 THEN
        PERFORM notify_admins('Low Stock Alert', 'Product: ' || NEW.name || ' is low on stock (' || NEW.stock || ' items left)!', 'system');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_low_stock ON products;
CREATE TRIGGER trigger_low_stock AFTER UPDATE OF stock ON products FOR EACH ROW EXECUTE FUNCTION check_low_stock();

-- 5. Trigger: New Service Request Alert for Admins
CREATE OR REPLACE FUNCTION notify_admin_new_service() RETURNS TRIGGER AS $$
BEGIN
    PERFORM notify_admins('New Service Request', 'Token: ' || NEW.token_number || ' - Model: ' || NEW.machine_model || '. View in Repair Matrix.', 'system');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_admin_new_service ON service_tokens;
CREATE TRIGGER trigger_admin_new_service AFTER INSERT ON service_tokens FOR EACH ROW EXECUTE FUNCTION notify_admin_new_service();
