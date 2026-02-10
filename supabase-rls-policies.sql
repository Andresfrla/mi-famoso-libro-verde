-- Enable RLS on the bucket (if not already enabled)
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows authenticated users to upload/insert images
CREATE POLICY "Allow authenticated users to upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'recipe-images'  -- Replace with your bucket name
);

-- Optional: Allow authenticated users to view their own uploaded images
CREATE POLICY "Allow authenticated users to view images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'recipe-images'  -- Replace with your bucket name
  AND auth.uid() = owner  -- Only view images they uploaded
);

-- Optional: Allow authenticated users to delete their own images
CREATE POLICY "Allow authenticated users to delete images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'recipe-images'  -- Replace with your bucket name
  AND auth.uid() = owner  -- Only delete images they uploaded
);

-- For PUBLIC bucket (anyone can view, only auth users can upload)
-- If you want a completely public bucket for viewing:
CREATE POLICY "Public access to view images"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'recipe-images'  -- Replace with your bucket name
);
