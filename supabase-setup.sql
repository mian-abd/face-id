-- Face Academy Database Schema
-- Run this in your Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  model_status TEXT DEFAULT 'not_trained' CHECK (model_status IN ('not_trained', 'training', 'trained', 'failed')),
  model_trained_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create training_images table
CREATE TABLE IF NOT EXISTS training_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  image_data TEXT NOT NULL, -- base64 encoded image
  image_type TEXT DEFAULT 'positive' CHECK (image_type IN ('anchor', 'positive', 'negative')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_model_status ON users(model_status);
CREATE INDEX IF NOT EXISTS idx_training_images_user_id ON training_images(user_id);
CREATE INDEX IF NOT EXISTS idx_training_images_type ON training_images(image_type);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_images ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for demo purposes)
-- In production, you'd want more restrictive policies

-- Users table policies
CREATE POLICY "Allow public to read users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public to insert users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public to update users" ON users FOR UPDATE USING (true);

-- Training images table policies  
CREATE POLICY "Allow public to read training images" ON training_images FOR SELECT USING (true);
CREATE POLICY "Allow public to insert training images" ON training_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public to update training images" ON training_images FOR UPDATE USING (true);

-- Create a function to get user stats (optional, for analytics)
CREATE OR REPLACE FUNCTION get_user_stats()
RETURNS TABLE (
  total_users BIGINT,
  trained_models BIGINT,
  total_images BIGINT,
  avg_images_per_user NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_users,
    COUNT(CASE WHEN model_status = 'trained' THEN 1 END)::BIGINT as trained_models,
    (SELECT COUNT(*)::BIGINT FROM training_images) as total_images,
    CASE 
      WHEN COUNT(*) > 0 THEN (SELECT COUNT(*)::NUMERIC FROM training_images) / COUNT(*)::NUMERIC
      ELSE 0::NUMERIC
    END as avg_images_per_user
  FROM users;
END;
$$ LANGUAGE plpgsql;

-- Insert some sample data for testing (optional)
-- INSERT INTO users (username, email, model_status) VALUES 
-- ('demo_user', 'demo@faceacademy.com', 'trained'),
-- ('test_user', 'test@faceacademy.com', 'not_trained');

-- Verify the setup
SELECT 'Database setup completed successfully!' as status;
