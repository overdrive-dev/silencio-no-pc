-- Soft delete for pcs table
-- Instead of hard-deleting devices, we set deleted_at timestamp.
-- All queries filter by deleted_at IS NULL to exclude soft-deleted rows.

ALTER TABLE pcs ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
