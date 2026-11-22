-- Create vendor profiles
WITH vendor_users AS (
  SELECT "Id", "Email" FROM users
  WHERE "Email" IN (
    'owner@saravanabhavan.com',
    'owner@muruganidli.com',
    'owner@paradisebiryani.com',
    'owner@cafecoffeeday.com',
    'owner@subwayindia.com'
  )
)
INSERT INTO vendor_profiles ("Id", "UserId", "BusinessName", "GstNumber", "Address", "OperatingHours", "IsApproved", "Rating", "TotalOrders", "CreatedAt")
SELECT
  gen_random_uuid(),
  vu."Id",
  CASE
    WHEN vu."Email" = 'owner@saravanabhavan.com' THEN 'Saravana Bhavan'
    WHEN vu."Email" = 'owner@muruganidli.com' THEN 'Murugan Idli Shop'
    WHEN vu."Email" = 'owner@paradisebiryani.com' THEN 'Paradise Biryani'
    WHEN vu."Email" = 'owner@cafecoffeeday.com' THEN 'Cafe Coffee Day'
    WHEN vu."Email" = 'owner@subwayindia.com' THEN 'Subway'
  END,
  CASE
    WHEN vu."Email" = 'owner@saravanabhavan.com' THEN '29AABCS1234A1Z5'
    WHEN vu."Email" = 'owner@muruganidli.com' THEN '29AABCM5678B1Z5'
    WHEN vu."Email" = 'owner@paradisebiryani.com' THEN '29AABCP9012C1Z5'
    WHEN vu."Email" = 'owner@cafecoffeeday.com' THEN '29AABCC3456D1Z5'
    WHEN vu."Email" = 'owner@subwayindia.com' THEN '29AABCS7890E1Z5'
  END,
  jsonb_build_object(
    'street', CASE
      WHEN vu."Email" = 'owner@saravanabhavan.com' THEN '12, 80 Feet Road, Koramangala'
      WHEN vu."Email" = 'owner@muruganidli.com' THEN '45, Brigade Road'
      WHEN vu."Email" = 'owner@paradisebiryani.com' THEN '78, Residency Road'
      WHEN vu."Email" = 'owner@cafecoffeeday.com' THEN '23, MG Road'
      WHEN vu."Email" = 'owner@subwayindia.com' THEN '56, Indiranagar 100 Feet Road'
    END,
    'city', 'Bangalore',
    'state', 'Karnataka',
    'pincode', '560001'
  ),
  jsonb_build_object('open', '07:00', 'close', '23:00'),
  true,
  ROUND((4.0 + random() * 1.0)::numeric, 1),
  FLOOR(random() * 500)::int,
  NOW()
FROM vendor_users vu;

-- Update users with vendor profile IDs
UPDATE users u
SET "VendorProfileId" = vp."Id"
FROM vendor_profiles vp
WHERE u."Id" = vp."UserId";