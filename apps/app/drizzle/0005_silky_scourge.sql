-- Convert text to jsonb with proper casting
ALTER TABLE "sites" ALTER COLUMN "allowed_domains" SET DATA TYPE jsonb USING 
  CASE 
    WHEN "allowed_domains" IS NULL THEN NULL
    WHEN "allowed_domains" = '' THEN NULL
    ELSE "allowed_domains"::jsonb
  END;