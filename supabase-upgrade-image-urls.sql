-- =====================================================
-- Migration one-shot : remonter toutes les URLs d'image
-- stockées en base vers leur version HD.
--
-- Couvre :
--   * Mascus        (img.mascus.*)
--     /thumbprofile/                    -> /fullsize/
--     /thumbprofile_<W>x<H>/            -> /thumbprofile_1920x1440/
--     /mediaprofile/                    -> /fullsize/
--     /imageservice/<id>/<W>x<H>/       -> /imageservice/<id>/1920x1440/
--   * Ritchie Bros  (*.cloudfront.net/image/product/)
--     /image/product/(small|medium|thumb|thumbnail)/ -> /image/product/large/
--   * Le Bon Coin   (img.leboncoin.*)
--     ?rule=ad-(small|thumb|image|listing)           -> ?rule=ad-large
--     ?rule=classified-(thumb|small)                 -> ?rule=classified-large
--
-- Colonnes traitées : public.machines.images (TEXT[]) et .photos (TEXT[])
-- si elles existent.
--
-- IDÉMPOTENT : rejouer le script est sûr (les URLs déjà HD ne changent pas).
-- =====================================================

BEGIN;

-- -----------------------------------------------------
-- 1) Fonction utilitaire : remonte UNE URL vers sa version HD.
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION public.upgrade_image_url(url TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  out_url TEXT := url;
BEGIN
  IF out_url IS NULL OR out_url = '' THEN
    RETURN out_url;
  END IF;

  -- Mascus (img.mascus.com / img.mascus.fr)
  IF out_url ~* 'img\.mascus\.(com|fr)' THEN
    out_url := regexp_replace(out_url, '/thumbprofile/', '/fullsize/', 'gi');
    out_url := regexp_replace(out_url, '/thumbprofile_\d+x\d+/', '/thumbprofile_1920x1440/', 'gi');
    out_url := regexp_replace(out_url, '/mediaprofile/', '/fullsize/', 'gi');
    out_url := regexp_replace(
      out_url,
      '/imageservice/([^/]+)/\d+x\d+/',
      '/imageservice/\1/1920x1440/',
      'gi'
    );
  END IF;

  -- Ritchie Bros / RBAuction (CloudFront /image/product/<size>/)
  IF out_url ~* 'cloudfront\.net/image/product/' THEN
    out_url := regexp_replace(
      out_url,
      '/image/product/(small|medium|thumb|thumbnail)/',
      '/image/product/large/',
      'gi'
    );
  END IF;

  -- Le Bon Coin
  IF out_url ~* 'img\.leboncoin\.' THEN
    out_url := regexp_replace(
      out_url,
      '([?&])rule=(ad-small|ad-thumb|ad-image|ad-listing)([&#]|$)',
      '\1rule=ad-large\3',
      'gi'
    );
    out_url := regexp_replace(
      out_url,
      '([?&])rule=(classified-thumb|classified-small)([&#]|$)',
      '\1rule=classified-large\3',
      'gi'
    );
  END IF;

  RETURN out_url;
END;
$$;

-- -----------------------------------------------------
-- 2) Helper : applique upgrade_image_url() à tous les éléments d'un tableau.
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION public.upgrade_image_url_array(urls TEXT[])
RETURNS TEXT[]
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN urls IS NULL THEN urls
    ELSE ARRAY(
      SELECT public.upgrade_image_url(u)
      FROM unnest(urls) AS t(u)
    )
  END;
$$;

-- -----------------------------------------------------
-- 3) Aperçu AVANT migration (contrôle qualité).
-- -----------------------------------------------------
SELECT
  COUNT(*)                                                       AS total_rows,
  COUNT(*) FILTER (
    WHERE EXISTS (
      SELECT 1 FROM unnest(COALESCE(images, ARRAY[]::TEXT[])) AS u(x)
      WHERE x ~* '/(thumbprofile|mediaprofile)/'
         OR x ~* '/image/product/(small|medium|thumb|thumbnail)/'
         OR x ~* 'rule=ad-(small|thumb|image|listing)'
    )
  )                                                              AS rows_with_thumbnails_in_images,
  COUNT(*) FILTER (
    WHERE EXISTS (
      SELECT 1 FROM unnest(COALESCE(photos, ARRAY[]::TEXT[])) AS u(x)
      WHERE x ~* '/(thumbprofile|mediaprofile)/'
         OR x ~* '/image/product/(small|medium|thumb|thumbnail)/'
         OR x ~* 'rule=ad-(small|thumb|image|listing)'
    )
  )                                                              AS rows_with_thumbnails_in_photos
FROM public.machines;

-- -----------------------------------------------------
-- 4) Migration : on ne touche que les lignes qui changent réellement.
-- -----------------------------------------------------

-- images (TEXT[])
UPDATE public.machines
SET images = public.upgrade_image_url_array(images)
WHERE images IS NOT NULL
  AND images <> public.upgrade_image_url_array(images);

-- photos (TEXT[]) — si la colonne existe dans votre schéma
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'machines'
      AND column_name  = 'photos'
  ) THEN
    EXECUTE $u$
      UPDATE public.machines
      SET photos = public.upgrade_image_url_array(photos)
      WHERE photos IS NOT NULL
        AND photos <> public.upgrade_image_url_array(photos);
    $u$;
  END IF;
END $$;

-- -----------------------------------------------------
-- 5) Aperçu APRÈS migration (doit retomber à ~0).
-- -----------------------------------------------------
SELECT
  COUNT(*) FILTER (
    WHERE EXISTS (
      SELECT 1 FROM unnest(COALESCE(images, ARRAY[]::TEXT[])) AS u(x)
      WHERE x ~* '/(thumbprofile|mediaprofile)/'
         OR x ~* '/image/product/(small|medium|thumb|thumbnail)/'
         OR x ~* 'rule=ad-(small|thumb|image|listing)'
    )
  ) AS remaining_thumbnails_images
FROM public.machines;

-- Échantillon de 5 URLs post-migration pour contrôle visuel.
SELECT id, source, images[1] AS first_image
FROM public.machines
WHERE images IS NOT NULL AND array_length(images, 1) > 0
ORDER BY created_at DESC
LIMIT 5;

COMMIT;

-- =====================================================
-- ROLLBACK (si besoin, à exécuter AVANT le COMMIT ci-dessus)
-- =====================================================
-- BEGIN;
--   -- Pas de rollback URL par URL possible (les anciennes URLs "medium"
--   -- ne sont pas conservées). Il faudrait restaurer depuis un backup
--   -- Supabase Point-in-Time.
-- ROLLBACK;
