
CREATE POLICY "Users can read own lgpd exports"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'lgpd-exports'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Service role manages lgpd exports"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'lgpd-exports')
WITH CHECK (bucket_id = 'lgpd-exports');

CREATE POLICY "Admins read ripd reports"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'lgpd-exports'
  AND (storage.foldername(name))[1] = 'ripd'
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.role IN ('admin','ceo')
  )
);
