-- =====================================================
-- Mi Famoso Libro Verde - Seed Data
-- =====================================================
-- Run this after schema.sql to populate with sample recipes

-- Clear existing data (optional - be careful in production!)
-- DELETE FROM public.favorites;
-- DELETE FROM public.recipes;

-- =====================================================
-- SAMPLE RECIPES (Public - user_id is NULL)
-- =====================================================

-- Recipe 1: Ensalada Verde / Green Salad
INSERT INTO public.recipes (
    user_id,
    title_es, title_en,
    description_es, description_en,
    ingredients_es, ingredients_en,
    steps_es, steps_en,
    image_url, tags,
    prep_time_minutes, servings, difficulty, category
) VALUES (
    NULL,
    'Ensalada Verde Primavera',
    'Spring Green Salad',
    'Una ensalada fresca y nutritiva perfecta para los días de primavera. Rica en vitaminas y antioxidantes.',
    'A fresh and nutritious salad perfect for spring days. Rich in vitamins and antioxidants.',
    '["2 tazas de espinaca fresca", "1 aguacate maduro", "1/2 taza de semillas de calabaza", "1/4 taza de queso feta", "2 cucharadas de aceite de oliva", "1 limón (jugo)", "Sal y pimienta al gusto"]'::jsonb,
    '["2 cups fresh spinach", "1 ripe avocado", "1/2 cup pumpkin seeds", "1/4 cup feta cheese", "2 tablespoons olive oil", "1 lemon (juice)", "Salt and pepper to taste"]'::jsonb,
    '["Lavar y secar bien las hojas de espinaca", "Cortar el aguacate en cubos medianos", "Tostar ligeramente las semillas de calabaza en una sartén", "Mezclar el aceite de oliva con el jugo de limón para el aderezo", "Combinar todos los ingredientes en un bowl grande", "Agregar el queso feta desmenuzado", "Aliñar con el aderezo y sazonar al gusto"]'::jsonb,
    '["Wash and dry the spinach leaves thoroughly", "Cut the avocado into medium cubes", "Lightly toast the pumpkin seeds in a pan", "Mix olive oil with lemon juice for the dressing", "Combine all ingredients in a large bowl", "Add crumbled feta cheese", "Dress with the vinaigrette and season to taste"]'::jsonb,
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
    '["vegano", "saludable", "rápido", "sin gluten"]'::jsonb,
    15, 2, 'easy', 'lunch'
),

-- Recipe 2: Pasta al Pesto / Pesto Pasta
(
    NULL,
    'Pasta al Pesto Cremoso',
    'Creamy Pesto Pasta',
    'Una deliciosa pasta con salsa de pesto casera. El sabor fresco de la albahaca combinado con piñones tostados.',
    'A delicious pasta with homemade pesto sauce. The fresh flavor of basil combined with toasted pine nuts.',
    '["400g de pasta penne", "2 tazas de hojas de albahaca fresca", "1/2 taza de queso parmesano rallado", "3 dientes de ajo", "1/4 taza de piñones", "1/2 taza de aceite de oliva extra virgen", "Sal al gusto"]'::jsonb,
    '["400g penne pasta", "2 cups fresh basil leaves", "1/2 cup grated parmesan cheese", "3 cloves garlic", "1/4 cup pine nuts", "1/2 cup extra virgin olive oil", "Salt to taste"]'::jsonb,
    '["Cocinar la pasta según las instrucciones del paquete", "Tostar los piñones en una sartén seca hasta dorar", "En un procesador, combinar albahaca, ajo y piñones", "Agregar el aceite de oliva gradualmente mientras procesa", "Incorporar el queso parmesano y mezclar bien", "Escurrir la pasta reservando 1/2 taza del agua de cocción", "Mezclar la pasta con el pesto, agregando agua si es necesario", "Servir inmediatamente con parmesano extra"]'::jsonb,
    '["Cook pasta according to package instructions", "Toast pine nuts in a dry pan until golden", "In a food processor, combine basil, garlic and pine nuts", "Gradually add olive oil while processing", "Add parmesan cheese and mix well", "Drain pasta, reserving 1/2 cup of cooking water", "Mix pasta with pesto, adding water if needed", "Serve immediately with extra parmesan"]'::jsonb,
    'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800',
    '["italiano", "pasta", "vegetariano", "clásico"]'::jsonb,
    25, 4, 'medium', 'dinner'
),

-- Recipe 3: Tacos Veganos / Vegan Tacos
(
    NULL,
    'Tacos Veganos de Coliflor',
    'Vegan Cauliflower Tacos',
    'Tacos saludables con coliflor asada especiada. Una alternativa deliciosa y llena de sabor.',
    'Healthy tacos with spiced roasted cauliflower. A delicious and flavorful alternative.',
    '["1 coliflor mediana", "8 tortillas de maíz", "1 aguacate", "1/2 taza de cilantro fresco", "1 lima", "2 cucharadas de aceite de oliva", "1 cucharadita de comino", "1 cucharadita de pimentón", "1/2 cucharadita de chile en polvo", "Salsa picante al gusto"]'::jsonb,
    '["1 medium cauliflower", "8 corn tortillas", "1 avocado", "1/2 cup fresh cilantro", "1 lime", "2 tablespoons olive oil", "1 teaspoon cumin", "1 teaspoon paprika", "1/2 teaspoon chili powder", "Hot sauce to taste"]'::jsonb,
    '["Precalentar el horno a 200°C (400°F)", "Cortar la coliflor en floretes pequeños", "Mezclar con aceite de oliva y especias", "Asar en el horno por 25-30 minutos hasta dorar", "Calentar las tortillas en una sartén", "Preparar el guacamole machacando el aguacate con lima y sal", "Armar los tacos con coliflor, guacamole y cilantro", "Servir con salsa picante y gajos de lima"]'::jsonb,
    '["Preheat oven to 400°F (200°C)", "Cut cauliflower into small florets", "Toss with olive oil and spices", "Roast in oven for 25-30 minutes until golden", "Warm tortillas in a skillet", "Prepare guacamole by mashing avocado with lime and salt", "Assemble tacos with cauliflower, guacamole and cilantro", "Serve with hot sauce and lime wedges"]'::jsonb,
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800',
    '["vegano", "mexicano", "saludable", "picante"]'::jsonb,
    35, 4, 'medium', 'dinner'
),

-- Recipe 4: Smoothie Bowl
(
    NULL,
    'Smoothie Bowl Verde',
    'Green Smoothie Bowl',
    'Un bowl nutritivo y refrescante para empezar el día con energía. Lleno de frutas y superalimentos.',
    'A nutritious and refreshing bowl to start the day with energy. Packed with fruits and superfoods.',
    '["1 plátano congelado", "1 taza de espinaca", "1/2 taza de leche de almendras", "1/2 aguacate", "1 cucharada de mantequilla de almendras", "Toppings: granola, fresas, coco rallado, semillas de chía"]'::jsonb,
    '["1 frozen banana", "1 cup spinach", "1/2 cup almond milk", "1/2 avocado", "1 tablespoon almond butter", "Toppings: granola, strawberries, shredded coconut, chia seeds"]'::jsonb,
    '["Agregar el plátano congelado a la licuadora", "Añadir la espinaca, aguacate y leche de almendras", "Agregar la mantequilla de almendras", "Licuar hasta obtener una consistencia cremosa y espesa", "Verter en un bowl", "Decorar con granola, fresas cortadas, coco y semillas de chía", "Servir inmediatamente"]'::jsonb,
    '["Add frozen banana to blender", "Add spinach, avocado and almond milk", "Add almond butter", "Blend until creamy and thick consistency", "Pour into a bowl", "Top with granola, sliced strawberries, coconut and chia seeds", "Serve immediately"]'::jsonb,
    'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800',
    '["desayuno", "vegano", "saludable", "fresco"]'::jsonb,
    10, 1, 'easy', 'breakfast'
),

-- Recipe 5: Toast de Aguacate / Avocado Toast
(
    NULL,
    'Toast de Aguacate con Huevo',
    'Avocado Toast with Egg',
    'El clásico desayuno moderno: pan tostado crujiente con aguacate cremoso y huevo pochado.',
    'The modern breakfast classic: crispy toast with creamy avocado and poached egg.',
    '["2 rebanadas de pan integral", "1 aguacate maduro", "2 huevos", "Hojuelas de chile rojo", "Sal marina", "Pimienta negra", "1 cucharada de vinagre (para pochar)", "Microgreens para decorar"]'::jsonb,
    '["2 slices whole grain bread", "1 ripe avocado", "2 eggs", "Red pepper flakes", "Sea salt", "Black pepper", "1 tablespoon vinegar (for poaching)", "Microgreens for garnish"]'::jsonb,
    '["Tostar el pan hasta que esté dorado y crujiente", "Cortar el aguacate por la mitad y retirar el hueso", "Machacar el aguacate con un tenedor, sazonar con sal y pimienta", "Hervir agua con vinagre para los huevos pochados", "Crear un remolino y agregar el huevo, cocinar 3-4 minutos", "Untar el aguacate sobre el pan tostado", "Colocar el huevo pochado encima", "Decorar con hojuelas de chile, sal marina y microgreens"]'::jsonb,
    '["Toast bread until golden and crispy", "Cut avocado in half and remove pit", "Mash avocado with a fork, season with salt and pepper", "Boil water with vinegar for poached eggs", "Create a swirl and add egg, cook 3-4 minutes", "Spread avocado on toasted bread", "Place poached egg on top", "Garnish with red pepper flakes, sea salt and microgreens"]'::jsonb,
    'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=800',
    '["desayuno", "rápido", "saludable", "proteína"]'::jsonb,
    10, 2, 'easy', 'breakfast'
),

-- Recipe 6: Sopa de Lentejas / Lentil Soup
(
    NULL,
    'Sopa de Lentejas Reconfortante',
    'Comforting Lentil Soup',
    'Una sopa caliente y nutritiva perfecta para los días fríos. Rica en proteínas y fibra.',
    'A warm and nutritious soup perfect for cold days. Rich in protein and fiber.',
    '["2 tazas de lentejas secas", "1 cebolla grande", "3 zanahorias", "3 tallos de apio", "4 dientes de ajo", "1 lata de tomates triturados", "6 tazas de caldo de verduras", "2 cucharaditas de comino", "1 cucharadita de cúrcuma", "Hojas de laurel", "Espinaca fresca"]'::jsonb,
    '["2 cups dried lentils", "1 large onion", "3 carrots", "3 celery stalks", "4 garlic cloves", "1 can crushed tomatoes", "6 cups vegetable broth", "2 teaspoons cumin", "1 teaspoon turmeric", "Bay leaves", "Fresh spinach"]'::jsonb,
    '["Enjuagar las lentejas y reservar", "Picar la cebolla, zanahorias, apio y ajo", "Saltear las verduras en aceite de oliva hasta que estén suaves", "Agregar el ajo y las especias, cocinar 1 minuto", "Añadir las lentejas, tomates y caldo de verduras", "Agregar las hojas de laurel", "Hervir y luego reducir el fuego, cocinar 30-35 minutos", "Añadir espinaca al final y cocinar hasta que se marchite", "Retirar las hojas de laurel y servir caliente"]'::jsonb,
    '["Rinse lentils and set aside", "Dice onion, carrots, celery and garlic", "Sauté vegetables in olive oil until soft", "Add garlic and spices, cook 1 minute", "Add lentils, tomatoes and vegetable broth", "Add bay leaves", "Bring to boil then reduce heat, cook 30-35 minutes", "Add spinach at the end and cook until wilted", "Remove bay leaves and serve hot"]'::jsonb,
    'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800',
    '["sopa", "vegano", "proteína", "reconfortante"]'::jsonb,
    40, 6, 'easy', 'lunch'
);

-- Verify the data was inserted
SELECT id, title_es, title_en, category, difficulty, prep_time_minutes
FROM public.recipes
ORDER BY created_at;
