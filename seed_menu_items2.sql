-- Saravana Bhavan (f706a043-f0a7-4b4c-8a14-271c93364e40)
INSERT INTO menu_items ("Id", "VendorId", "Name", "Description", "Price", "Category", "DietType", "ImageUrl", "IsAvailable", "PrepTimeMinutes", "Tags", "CreatedAt") VALUES
(gen_random_uuid(), 'f706a043-f0a7-4b4c-8a14-271c93364e40', 'Masala Dosa', 'Crispy rice crepe with spiced potato filling, served with sambar and chutney', 12000, 'Breakfast', 'Veg', 'https://example.com/masala-dosa.jpg', true, 15, ARRAY['popular','south-indian','breakfast'], NOW()),
(gen_random_uuid(), 'f706a043-f0a7-4b4c-8a14-271c93364e40', 'Plain Dosa', 'Thin crispy rice crepe served with sambar and coconut chutney', 8000, 'Breakfast', 'Veg', 'https://example.com/plain-dosa.jpg', true, 10, ARRAY['south-indian','breakfast'], NOW()),
(gen_random_uuid(), 'f706a043-f0a7-4b4c-8a14-271c93364e40', 'Idli Sambar', 'Steamed rice cakes with lentil sambar and chutney', 6000, 'Breakfast', 'Veg', 'https://example.com/idli.jpg', true, 10, ARRAY['healthy','south-indian','breakfast'], NOW()),
(gen_random_uuid(), 'f706a043-f0a7-4b4c-8a14-271c93364e40', 'Medu Vada', 'Crispy lentil donuts served with sambar and chutney', 7000, 'Breakfast', 'Veg', 'https://example.com/medu-vada.jpg', true, 12, ARRAY['popular','south-indian','snack'], NOW()),
(gen_random_uuid(), 'f706a043-f0a7-4b4c-8a14-271c93364e40', 'Uttapam', 'Thick rice pancake topped with vegetables', 9000, 'Breakfast', 'Veg', 'https://example.com/uttapam.jpg', true, 15, ARRAY['south-indian','breakfast'], NOW()),
(gen_random_uuid(), 'f706a043-f0a7-4b4c-8a14-271c93364e40', 'Filter Coffee', 'Traditional South Indian filter coffee', 3000, 'Beverages', 'Veg', 'https://example.com/filter-coffee.jpg', true, 5, ARRAY['popular','beverage'], NOW()),
(gen_random_uuid(), 'f706a043-f0a7-4b4c-8a14-271c93364e40', 'Masala Tea', 'Spiced Indian tea with milk', 2000, 'Beverages', 'Veg', 'https://example.com/masala-tea.jpg', true, 5, ARRAY['beverage'], NOW());

-- Murugan Idli Shop (9b4224e7-43f6-4420-ad10-462b9c27ccab)
INSERT INTO menu_items ("Id", "VendorId", "Name", "Description", "Price", "Category", "DietType", "ImageUrl", "IsAvailable", "PrepTimeMinutes", "Tags", "CreatedAt") VALUES
(gen_random_uuid(), '9b4224e7-43f6-4420-ad10-462b9c27ccab', 'Soft Idli', 'Fluffy steamed rice cakes with sambar and 3 chutneys', 5000, 'Breakfast', 'Veg', 'https://example.com/soft-idli.jpg', true, 8, ARRAY['popular','healthy','breakfast'], NOW()),
(gen_random_uuid(), '9b4224e7-43f6-4420-ad10-462b9c27ccab', 'Ghee Podi Idli', 'Idli tossed in ghee and spicy podi powder', 7000, 'Breakfast', 'Veg', 'https://example.com/ghee-podi-idli.jpg', true, 10, ARRAY['spicy','popular'], NOW()),
(gen_random_uuid(), '9b4224e7-43f6-4420-ad10-462b9c27ccab', 'Mini Tiffin', '2 Idli + 1 Vada + 1 Mini Dosa with sambar', 9000, 'Breakfast', 'Veg', 'https://example.com/mini-tiffin.jpg', true, 12, ARRAY['combo','value'], NOW()),
(gen_random_uuid(), '9b4224e7-43f6-4420-ad10-462b9c27ccab', 'Rava Kesari', 'Semolina halwa with ghee and nuts', 5000, 'Desserts', 'Veg', 'https://example.com/rava-kesari.jpg', true, 10, ARRAY['sweet','dessert'], NOW());

-- Paradise Biryani (100777cb-2120-4193-a14f-fe20925839dd)
INSERT INTO menu_items ("Id", "VendorId", "Name", "Description", "Price", "Category", "DietType", "ImageUrl", "IsAvailable", "PrepTimeMinutes", "Tags", "CreatedAt") VALUES
(gen_random_uuid(), '100777cb-2120-4193-a14f-fe20925839dd', 'Chicken Biryani', 'Aromatic basmati rice with tender chicken, served with raita', 25000, 'Main Course', 'NonVeg', 'https://example.com/chicken-biryani.jpg', true, 25, ARRAY['popular','signature','lunch','dinner'], NOW()),
(gen_random_uuid(), '100777cb-2120-4193-a14f-fe20925839dd', 'Mutton Biryani', 'Premium basmati rice with succulent mutton pieces', 32000, 'Main Course', 'NonVeg', 'https://example.com/mutton-biryani.jpg', true, 30, ARRAY['premium','signature'], NOW()),
(gen_random_uuid(), '100777cb-2120-4193-a14f-fe20925839dd', 'Veg Biryani', 'Fragrant basmati rice with mixed vegetables and paneer', 18000, 'Main Course', 'Veg', 'https://example.com/veg-biryani.jpg', true, 20, ARRAY['vegetarian','popular'], NOW()),
(gen_random_uuid(), '100777cb-2120-4193-a14f-fe20925839dd', 'Chicken 65', 'Spicy deep-fried chicken appetizer', 18000, 'Starters', 'NonVeg', 'https://example.com/chicken-65.jpg', true, 15, ARRAY['spicy','appetizer'], NOW()),
(gen_random_uuid(), '100777cb-2120-4193-a14f-fe20925839dd', 'Double Ka Meetha', 'Hyderabadi bread pudding with dry fruits', 8000, 'Desserts', 'Veg', 'https://example.com/double-ka-meetha.jpg', true, 10, ARRAY['signature','sweet'], NOW());

-- Cafe Coffee Day (c8415062-abe6-4fc6-abe4-dc40df73f21e)
INSERT INTO menu_items ("Id", "VendorId", "Name", "Description", "Price", "Category", "DietType", "ImageUrl", "IsAvailable", "PrepTimeMinutes", "Tags", "CreatedAt") VALUES
(gen_random_uuid(), 'c8415062-abe6-4fc6-abe4-dc40df73f21e', 'Cappuccino', 'Espresso with steamed milk and foam', 14000, 'Beverages', 'Veg', 'https://example.com/cappuccino.jpg', true, 5, ARRAY['popular','coffee'], NOW()),
(gen_random_uuid(), 'c8415062-abe6-4fc6-abe4-dc40df73f21e', 'Cold Coffee', 'Chilled coffee with ice cream', 16000, 'Beverages', 'Veg', 'https://example.com/cold-coffee.jpg', true, 5, ARRAY['popular','cold'], NOW()),
(gen_random_uuid(), 'c8415062-abe6-4fc6-abe4-dc40df73f21e', 'Chocolate Frappe', 'Blended chocolate and coffee frappe', 18000, 'Beverages', 'Veg', 'https://example.com/chocolate-frappe.jpg', true, 5, ARRAY['cold','sweet'], NOW()),
(gen_random_uuid(), 'c8415062-abe6-4fc6-abe4-dc40df73f21e', 'Veg Club Sandwich', 'Grilled sandwich with vegetables and cheese', 15000, 'Snacks', 'Veg', 'https://example.com/veg-club-sandwich.jpg', true, 10, ARRAY['popular','sandwich'], NOW()),
(gen_random_uuid(), 'c8415062-abe6-4fc6-abe4-dc40df73f21e', 'Chicken Sandwich', 'Grilled chicken sandwich with mayo', 18000, 'Snacks', 'NonVeg', 'https://example.com/chicken-sandwich.jpg', true, 10, ARRAY['sandwich'], NOW()),
(gen_random_uuid(), 'c8415062-abe6-4fc6-abe4-dc40df73f21e', 'Brownie with Ice Cream', 'Warm chocolate brownie with vanilla ice cream', 14000, 'Desserts', 'Veg', 'https://example.com/brownie-icecream.jpg', true, 8, ARRAY['popular','dessert'], NOW());

-- Subway (b80e05af-e768-47c4-9217-cb57c625e5bc)
INSERT INTO menu_items ("Id", "VendorId", "Name", "Description", "Price", "Category", "DietType", "ImageUrl", "IsAvailable", "PrepTimeMinutes", "Tags", "CreatedAt") VALUES
(gen_random_uuid(), 'b80e05af-e768-47c4-9217-cb57c625e5bc', 'Veggie Delite Sub', 'Fresh vegetables on choice of bread with sauces', 18000, 'Main Course', 'Veg', 'https://example.com/veggie-delite.jpg', true, 5, ARRAY['healthy','customizable'], NOW()),
(gen_random_uuid(), 'b80e05af-e768-47c4-9217-cb57c625e5bc', 'Chicken Teriyaki Sub', 'Grilled chicken with teriyaki sauce and vegetables', 24000, 'Main Course', 'NonVeg', 'https://example.com/chicken-teriyaki.jpg', true, 8, ARRAY['popular','protein'], NOW()),
(gen_random_uuid(), 'b80e05af-e768-47c4-9217-cb57c625e5bc', 'Paneer Tikka Sub', 'Grilled paneer with tikka marinade and vegetables', 22000, 'Main Course', 'Veg', 'https://example.com/paneer-tikka.jpg', true, 8, ARRAY['vegetarian','protein'], NOW()),
(gen_random_uuid(), 'b80e05af-e768-47c4-9217-cb57c625e5bc', 'Cookie', 'Freshly baked chocolate chip cookie', 4000, 'Desserts', 'Veg', 'https://example.com/cookie.jpg', true, 2, ARRAY['sweet','snack'], NOW());