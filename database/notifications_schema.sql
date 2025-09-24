-- Create notifications table for community alerts
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('find', 'loss', 'match', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  item_name TEXT,
  location TEXT,
  date_occurred DATE,
  contact_info TEXT,
  image_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notifications_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at_column();

-- Insert some test notifications (optional)
INSERT INTO notifications (user_id, type, title, message, item_name, location, date_occurred, contact_info) VALUES 
(1, 'find', '🔍 Item Found: iPhone 13', 'Someone found "iPhone 13" in Central Park. Check if this might be yours!', 'iPhone 13', 'Central Park', '2024-01-15', 'Call: 555-0123'),
(2, 'loss', '📱 Item Lost: Red Wallet', 'Someone lost "Red Wallet" in Downtown Mall. Help them find it!', 'Red Wallet', 'Downtown Mall', '2024-01-16', 'Email: owner@example.com')
ON CONFLICT DO NOTHING;

-- Verify the table was created
SELECT 'notifications table created successfully!' as status;
