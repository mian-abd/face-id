-- Add storage columns to training_images table
-- This adds support for storing images in Supabase Storage instead of base64

-- Add storage columns if they don't exist
ALTER TABLE training_images 
ADD COLUMN IF NOT EXISTS storage_path text,
ADD COLUMN IF NOT EXISTS public_url text;

-- Add comments for clarity
COMMENT ON COLUMN training_images.image_data IS 'Either storage path or base64 fallback data';
COMMENT ON COLUMN training_images.storage_path IS 'Path in Supabase Storage bucket';
COMMENT ON COLUMN training_images.public_url IS 'Public URL for the stored image';

-- Create index on storage_path for performance
CREATE INDEX IF NOT EXISTS idx_training_images_storage_path ON training_images(storage_path);

SELECT '✅ Storage columns added successfully!' as status;
