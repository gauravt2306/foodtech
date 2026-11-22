-- Get vendor profile IDs
WITH vendor_data AS (
  SELECT vp."Id", vp."BusinessName" FROM vendor_profiles vp
  WHERE vp."BusinessName" IN ('Saravana Bhavan', 'Murugan Idli Shop', 'Paradise Biryani', 'Cafe Coffee Day', 'Subway')
)

-- Saravana Bhavan - South Indian Vegetarian
INSERT INTO menu_items ("Id", "VendorId", "Name", "Description", "Price", "Category", "DietType", "ImageUrl", "IsAvailable", "PrepTimeMinutes", "Tags", "CreatedAt")
SELECT
  gen_random_uuid(),
  vd."Id",
  item.name,
  item.description,
  item.price,
  item.category,
  item.diet_type,
  item.image_url,
  true,
  item.prep_time,
  item.tags,
  NOW()
FROM vendor_data vd
CROSS JOIN LATERAL (
  VALUES
  -- Saravana Bhavan
  ('Saravana Bhavan', 'Masala Dosa', 'Crispy rice crepe with spiced potato filling, served with sambar and chutney', 12000, 'Breakfast', 'Veg', 'https://example.com/masala-dosa.jpg', 15, ARRAY['popular','south-indian','breakfast']),
  ('Saravana Bhavan', 'Plain Dosa', 'Thin crispy rice crepe served with sambar and coconut chutney', 8000, 'Breakfast', 'Veg', 'https://example.com/plain-dosa.jpg', 10, ARRAY['south-indian','breakfast']),
  ('Saravana Bhavan', 'Idli Sambar', 'Steamed rice cakes with lentil sambar and chutney', 6000, 'Breakfast', 'Veg', 'https://example.com/idli.jpg', 10, ARRAY['healthy','south-indian','breakfast']),
  ('Saravana Bhavan', 'Medu Vada', 'Crispy lentil donuts served with sambar and chutney', 7000, 'Breakfast', 'Veg', 'https://example.com/medu-vada.jpg', 12, ARRAY['popular','south-indian','snack']),
  ('Saravana Bhavan', 'Uttapam', 'Thick rice pancake topped with vegetables', 9000, 'Breakfast', 'Veg', 'https://example.com/uttapam.jpg', 15, ARRAY['south-indian','breakfast']),
  ('Saravana Bhavan', 'Filter Coffee', 'Traditional South Indian filter coffee', 3000, 'Beverages', 'Veg', 'https://example.com/filter-coffee.jpg', 5, ARRAY['popular','beverage']),
  ('Saravana Bhavan', 'Masala Tea', 'Spiced Indian tea with milk', 2000, 'Beverages', 'Veg', 'https://example.com/masala-tea.jpg', 5, ARRAY['beverage']),
  -- Murugan Idli Shop
  ('Murugan Idli Shop', 'Soft Idli', 'Fluffy steamed rice cakes with sambar and 3 chutneys', 5000, 'Breakfast', 'Veg', 'https://example.com/soft-idli.jpg', 8, ARRAY['popular','healthy','breakfast']),
  ('Murugan Idli Shop', 'Ghee Podi Idli', 'Idli tossed in ghee and spicy podi powder', 7000, 'Breakfast', 'Veg', 'https://example.com/ghee-podi-idli.jpg', 10, ARRAY['spicy','popular']),
  ('Murugan Idli Shop', 'Mini Tiffin', '2 Idli + 1 Vada + 1 Mini Dosa with sambar', 9000, 'Breakfast', 'Veg', 'https://example.com/mini-tiffin.jpg', 12, ARRAY['combo','value']),
  ('Murugan Idli Shop', 'Rava Kesari', 'Semolina halwa with ghee and nuts', 5000, 'Desserts', 'Veg', 'https://example.com/rava-kesari.jpg', 10, ARRAY['sweet','dessert']),
  -- Paradise Biryani
  ('Paradise Biryani', 'Chicken Biryani', 'Aromatic basmati rice with tender chicken, served with raita', 25000, 'Main Course', 'NonVeg', 'https://example.com/chicken-biryani.jpg', 25, ARRAY['popular','signature','lunch','dinner']),
  ('Paradise Biryani', 'Mutton Biryani', 'Premium basmati rice with succulent mutton pieces', 32000, 'Main Course', 'NonVeg', 'https://example.com/mutton-biryani.jpg', 30, ARRAY['premium','signature']),
  ('Paradise Biryani', 'Veg Biryani', 'Fragrant basmati rice with mixed vegetables and paneer', 18000, 'Main Course', 'Veg', 'https://example.com/veg-biryani.jpg', 20, ARRAY['vegetarian','popular']),
  ('Paradise Biryani', 'Chicken 65', 'Spicy deep-fried chicken appetizer', 18000, 'Starters', 'NonVeg', 'https://example.com/chicken-65.jpg', 15, ARRAY['spicy','appetizer']),
  ('Paradise Biryani', 'Double Ka Meetha', 'Hyderabadi bread pudding with dry fruits', 8000, 'Desserts', 'Veg', 'https://example.com/double-ka-meetha.jpg', 10, ARRAY['signature','sweet']),
  -- Cafe Coffee Day
  ('Cafe Coffee Day', 'Cappuccino', 'Espresso with steamed milk and foam', 14000, 'Beverages', 'Veg', 'https://example.com/cappuccino.jpg', 5, ARRAY['popular','coffee']),
  ('Cafe Coffee Day', 'Cold Coffee', 'Chilled coffee with ice cream', 16000, 'Beverages', 'Veg', 'https://example.com/cold-coffee.jpg', 5, ARRAY['popular','cold']),
  ('Cafe Coffee Day', 'Chocolate Frappe', 'Blended chocolate and coffee frappe', 18000, 'Beverages', 'Veg', 'https://example.com/chocolate-frappe.jpg', 5, ARRAY['cold','sweet']),
  ('Cafe Coffee Day', 'Veg Club Sandwich', 'Grilled sandwich with vegetables and cheese', 15000, 'Snacks', 'Veg', 'https://example.com/veg-club-sandwich.jpg', 10, ARRAY['popular','sandwich']),
  ('Cafe Coffee Day', 'Chicken Sandwich', 'Grilled chicken sandwich with mayo', 18000, 'Snacks', 'NonVeg', 'https://example.com/chicken-sandwich.jpg', 10, ARRAY['sandwich']),
  ('Cafe Coffee Day', 'Brownie with Ice Cream', 'Warm chocolate brownie with vanilla ice cream', 14000, 'Desserts', 'Veg', 'https://example.com/brownie-icecream.jpg', 8, ARRAY['popular','dessert']),
  -- Subway
  ('Subway', 'Veggie Delite Sub', 'Fresh vegetables on choice of bread with sauces', 18000, 'Main Course', 'Veg', 'https://example.com/veggie-delite.jpg', 5, ARRAY['healthy','customizable']),
  ('Subway', 'Chicken Teriyaki Sub', 'Grilled chicken with teriyaki sauce and vegetables', 24000, 'Main Course', 'NonVeg', 'https://example.com/chicken-teriyaki.jpg', 8, ARRAY['popular','protein']),
  ('Subway', 'Paneer Tikka Sub', 'Grilled paneer with tikka marinade and vegetables', 22000, 'Main Course', 'Veg', 'https://example.com/paneer-tikka.jpg', 8, ARRAY['vegetarian','protein']),
  ('Subway', 'Cookie', 'Freshly baked chocolate chip cookie', 4000, 'Desserts', 'Veg', 'https://example.com/cookie.jpg', 2, ARRAY['sweet','snack'])
) AS item(business_name, name, description, price, category, diet_type, image_url, prep_time, tags)
WHERE vd."BusinessName" = item.business_name;

EOF