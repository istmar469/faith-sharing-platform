ALTER TABLE public.pages
ADD COLUMN display_order INTEGER;

-- Set a default order for existing pages based on creation date to avoid issues with null values.
-- This ensures that pages that already exist will have a defined order.
WITH ordered_pages AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY organization_id ORDER BY created_at ASC) as rn
  FROM
    public.pages
)
UPDATE
  public.pages
SET
  display_order = ordered_pages.rn
FROM
  ordered_pages
WHERE
  public.pages.id = ordered_pages.id;

-- Now that all rows have a value, we can enforce that the column cannot be null.
ALTER TABLE public.pages
ALTER COLUMN display_order SET NOT NULL; 