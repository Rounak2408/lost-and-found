-- Create finds table for items that users have found
CREATE TABLE IF NOT EXISTS finds (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  item_description TEXT NOT NULL,
  location_found TEXT NOT NULL,
  date_found DATE NOT NULL,
  image_url TEXT,
  contact_info TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'claimed', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create losses table for items that users have lost
CREATE TABLE IF NOT EXISTS losses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  item_description TEXT NOT NULL,
  location_lost TEXT NOT NULL,
  date_lost DATE NOT NULL,
  owner_name TEXT NOT NULL,
  contact_info TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'found', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_finds_user_id ON finds(user_id);
CREATE INDEX IF NOT EXISTS idx_finds_status ON finds(status);
CREATE INDEX IF NOT EXISTS idx_finds_location ON finds(location_found);
CREATE INDEX IF NOT EXISTS idx_finds_date ON finds(date_found);

CREATE INDEX IF NOT EXISTS idx_losses_user_id ON losses(user_id);
CREATE INDEX IF NOT EXISTS idx_losses_status ON losses(status);
CREATE INDEX IF NOT EXISTS idx_losses_location ON losses(location_lost);
CREATE INDEX IF NOT EXISTS idx_losses_date ON losses(date_lost);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_finds_losses_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
DROP TRIGGER IF EXISTS update_finds_updated_at ON finds;
CREATE TRIGGER update_finds_updated_at
  BEFORE UPDATE ON finds
  FOR EACH ROW
  EXECUTE FUNCTION update_finds_losses_updated_at_column();

DROP TRIGGER IF EXISTS update_losses_updated_at ON losses;
CREATE TRIGGER update_losses_updated_at
  BEFORE UPDATE ON losses
  FOR EACH ROW
  EXECUTE FUNCTION update_finds_losses_updated_at_column();

-- Insert some test data (optional)
INSERT INTO finds (user_id, item_name, item_description, location_found, date_found, contact_info) VALUES 
(1, 'iPhone 13', 'Black iPhone 13 with cracked screen', 'Central Park, New York', '2024-01-15', 'Call: 555-0123'),
(2, 'Red Wallet', 'Leather wallet containing ID and credit cards', 'Downtown Mall', '2024-01-16', 'Email: finder@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO losses (user_id, item_name, item_description, location_lost, date_lost, owner_name, contact_info) VALUES 
(1, 'Blue Backpack', 'Nike backpack with laptop inside', 'University Campus', '2024-01-14', 'John Smith', 'Call: 555-0456'),
(2, 'Gold Watch', 'Vintage gold watch with leather strap', 'Coffee Shop Downtown', '2024-01-13', 'Sarah Johnson', 'Email: sarah@example.com')
ON CONFLICT DO NOTHING;

-- Verify the tables were created
SELECT 'finds and losses tables created successfully!' as status;
