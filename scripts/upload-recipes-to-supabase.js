#!/usr/bin/env node

/**
 * Script para subir recetas e imágenes a Supabase
 * Maneja discrepancias entre nombres de recetas e imágenes
 * 
 * Uso:
 *   node scripts/upload-recipes-to-supabase.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuración - AJUSTA ESTAS RUTAS SEGÚN TU SISTEMA
const IMAGES_DIR = 'C:\\Users\\LENOVO\\Desktop\\recipies';
const RECIPES_FILE = path.join(__dirname, '..', 'recipes.json');

// Configuración de Supabase
// IMPORTANTE: Para crear buckets necesitas la SERVICE ROLE KEY, no la anon key
// La Service Role Key está en: Supabase Dashboard → Project Settings → API → service_role key
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://sloshvbfhlttgmaqgnvy.supabase.co';

// Intenta usar la SERVICE ROLE KEY primero (para operaciones admin como crear buckets)
// Si no existe, usa la ANON KEY (para operaciones normales)
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_jkMk51oqt2N9m2z-MMmUbQ_H3-ujkTx';

// Usar service key si está disponible, sino usar anon key
// NOTA: Para evitar problemas de RLS, usa la SERVICE ROLE KEY
// La puedes obtener en: Supabase Dashboard → Project Settings → API → service_role
const SUPABASE_KEY = SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.log('⚠️  ADVERTENCIA: No se encontró SERVICE ROLE KEY');
  console.log('   Usando ANON KEY. Es posible que no puedas crear el bucket automáticamente.');
  console.log('   Soluciones:');
  console.log('   1. Añade SUPABASE_SERVICE_ROLE_KEY a tu .env');
  console.log('   2. O crea el bucket manualmente en el dashboard de Supabase');
  console.log('   3. O ejecuta: export SUPABASE_SERVICE_ROLE_KEY=tu_clave_aqui\n');
}

// Crear cliente de Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Nombre del bucket y tabla
const BUCKET_NAME = 'recipe-images';
const TABLE_NAME = 'recipes';

// Mapeo manual para recetas con nombres diferentes
// Basado en el análisis de nombres de imágenes vs títulos de recetas
const MANUAL_MAPPINGS = {
  // Arroces
  'Arroz a la Piña': 'arroz_a_la_pina.png',
  'Arroz a la Reina': 'arroz_a_la_reina.png',
  'Arroz Almendrado': 'arroz_almendrado.png',
  'Arroz con Azafrán y Garbanzos': 'arroz_con_azafran_y_garbanzos.png',
  'Arroz con Plátano y Tocineta': 'arroz_platano_y_tocineta.png',
  'Croquetas de Arroz': 'croquetas_de_arroz.png',
  
  // Pollos
  'Cazuela de Pollo': 'cazuela_de_pollo.png',
  'Colombinas de Pollo': 'colombinas_de_pollo.png',
  'Corona de Arroz con Pollo': 'corona_arroz_con_pollo.png',
  'Pastel de Pollo': 'pastel_de_pollo.png',
  'Pastel de Pollo y Cerdo con Champiñones': 'pastel_de_pollo_cerdo_con_champinones.png',
  'Pato a la Naranja': 'pato_a_la_naranja.png',
  'Pavo o Gallina Rellena': 'pavo_o_gallina_rellena.png',
  'Pechugas a la Italiana': 'pechugas_a_la_italiana.png',
  'Pechugas con Crema de Espárragos': 'pechuga_con_crema_de_esparragos.png',
  'Pechugas con Tarragón o Albahaca': 'pechugas_tarragon_o_albaca.png',
  'Pechugas de Pollo a la Crema': 'pechugas_pollo_a_la_crema.png',
  'Pechugas de Pollo Rellenas': 'pechugas_pollo_rellenas.png',
  'Pechugas en Salsa de Crema y Queso Azul': 'pechugas_salsa_y_queso_azul.png',
  'Pollo a la Cazadora': 'pollo_a_la_cazadora.png',
  'Pollo a la Crema con Costillitas de Cerdo': 'pollo_a_la_crema_con_costillas_cerdo.png',
  'Pollo a la Mostaza': 'pollo_a_la_mostaza.png',
  'Pollo Agridulce': 'pollo_agridulce.png',
  'Pollo al Curry': 'pollo_al_curry.png',
  'Pollo al Curry con Miel': 'pollo_al_curry_con_miel.png',
  'Pollo al Strogonoff': 'pollo_strogonoff.png',
  'Pollo con Tocineta': 'pollo_con_tocineta.png',
  'Pollo Ensortijado': 'pollo_ensortijado.png',
  'Pollo o Cerdo con Cebolla Puerro (Microondas)': 'pollo_o_cerdo_con_cebolla_puerro.png',
  'Queso de Pollo y Jamón': 'queso_pollo_y_jamon.png',
  'Souflé de Pollo': 'soufle_de_pollo.png',
  'Torta de Pollo': 'torta_de_pollo.png',
  'Torta de Pollo (2)': 'torta_de_pollo_2.png',
  
  // Postres y masas
  'Bizcochuelo Relleno': 'bizcochuelo_relleno.png',
  'Masa para Strudel o Rollo de Carne': 'masa_para_strudel_o_rollo_de_carne.png',
  'Muffins': 'muffings.png',
  'Pie de Piña': 'pie_de_pina.png',
  
  // Carnes
  'Conejo a la Cazadora': 'conejo_a_la_cazadora.png',
  'Costillitas Agridulces': 'costillitas_agridulces.png',
  'Chuletas Ahumadas': 'chuletas_ahumadas.png',
  'Chuletas de Cerdo': 'chuletas_de_cerdo.png',
  'Chuletas de Cerdo a la Normanda': 'chuletas_de_cerdo_a_la_normandia.png',
  'Chuletas de Cerdo en Salsa de Ciruela': 'chuletas_de_cerd_en_salsa_de_ciruela.png',
  'Chuletas de Cerdo en Salsa de Ciruelas (2)': 'chuletas_de_cerd_en_salsa_de_ciruela_2.png',
  'Escalopes de Ternera': 'escalopes_de_ternera.png',
  'Estofado de Carne': 'estofado_de_carne.png',
  'Filet Mignon': 'filet_mignon.png',
  'Filet Mignon Estilo Americano': 'filet_mignon_estilo_americano.png',
  'Goulash a la Húngara': 'goulash_a_la_hungara.png',
  'Lengua en Salsa': 'lengua_en_salsa.png',
  'Lomo a la Naranja': 'lomo_a_la_naranja.png',
  'Lomo al Estragón': 'lomo_al_estragon.jpg',
  'Lomo con Champiñones': 'lomo_con_champinones.jpg',
  'Lomo de Cerdo con Cebolla Puerro': 'lomo_de_cerdo_con_cebolla_puerro.jpg',
  'Lomo de Cerdo con Salsa de Melocotones': 'lomo_de_cerdo_con_salsa_melocotones.jpg',
  'Medallones de Lomo': 'medallones_de_lomo.jpg',
  'Pepper Steak de Cerdo': 'pepper_steak_de_cerdo.jpg',
  'Pernil de Cerdo': 'pernil_de_cerdo.jpg',
  'Rollitos de Carne': 'rollito_de_carne.jpg',
  'Sobrebarriga Rellena': 'sobrebarriga_rellena.jpg',
  'Steak Pimienta': 'steak_pimienta.jpg',
  'Strogonoff de Pollo, Cerdo o Res': 'strogonoff_de_pollo_cerdo_o_res.jpg',
  'Ternera': 'ternera.jpg',
  'Torta de Carne': 'torta_de_carne.jpg',
  'Torta de Carne (2)': 'torta_de_carne_2.jpg',
  'Torta de Carne con Tomate': 'torta_de_carne_con_tomate.jpg',
  
  // Cocteles y bebidas
  'Coctel de Mora': 'coctel_de_mora.jpg',
  'Coctel de Naranja': 'cotel_de_naranja.jpg',
  'Sabajón': 'sabajon.jpg',
  
  // Ensaladas
  'Ensalada Agridulce': 'ensalada_agridulce.jpg',
  'Ensalada Americana': 'ensalada_americana.jpg',
  'Ensalada Arabe': 'ensalada_arabe.jpg',
  'Ensalada Bouquet de Langostinos': 'ensalada_bouquet_de_langostinos.jpg',
  'Ensalada con Salsa Verde': 'ensalada_con_salsa_verde.jpg',
  'Ensalada de Alverja y Manzana': 'ensalada_de _alverja_y_manzana.jpg',
  'Ensalada de Atún a la Romana': 'ensalada_de_atun_a_la_romana.jpg',
  'Ensalada de Champiñones': 'ensalada_de_champinones.jpg',
  'Ensalada de Picadillo (Olga)': 'ensalada_de_picarillo_olga.jpg',
  'Ensalada de Remolacha y Piña': 'ensalada_de_remolacha_y_pina.jpg',
  'Ensalada de Repollo y Piña': 'ensalada_de_repollo_y_piña.jpg',
  'Ensalada Gazpacho de Arroz': 'ensalada_gazpacho_de_arroz.jpg',
  'Ensalada Lujuria': 'ensalada_lujuria.jpg',
  'Ensalada Mexicana': 'ensalada_mexicana.jpg',
  'Ensalada Rusa de Verduras': 'ensalada_rusa_de_verduras.jpg',
  'Ensalada Variada': 'ensalada_variada.jpg',
  'Repollo Alemán': 'repollo_aleman.jpg',
  'Tomates Encurtidos': 'tomates_encurtidos.jpg',
  'Verduras Mixtas Calientes': 'verduras_mixtas_calientes.jpg',
  
  // Aperitivos
  'Antipasto': 'antipasto.jpg',
  'Aspic de Aguacate': 'aspic_de_aguacate.jpg',
  'Bolovanes': 'bolovanes.jpg',
  'Brócoli con Tocineta': 'brocoli_con_tocineta.jpg',
  'Cebollas Monigásque': 'cebollas_monigasque.jpg',
  'Ceviche': 'ceviche.jpg',
  'Champiñones': 'champinones.jpg',
  'Champiñones a la Griega': 'champinones_a_la_griega.jpg',
  'Dip de Apio y Tocineta': 'dip_de_apio_y_tocineta.jpg',
  'Dip de Queso con Champiñones': 'dip_de_queso_con_champinones.jpg',
  'Dip de Queso con Semillas de Amapola': 'dip_de_queso_con_semillas_de_amapola.jpg',
  'Empanadas Chilenas': 'empanadas_chilenas.jpg',
  'Empanadas de Pollo': 'empanadas_de_pollo.jpg',
  'Encurtido': 'encurtido.jpg',
  'Espárragos al Curry': 'esparragos_al_curry.jpg',
  'Kibbes': 'kibbes.jpg',
  'Langostinos Mariposa': 'langostinos_mariposa.jpg',
  'Casata Griega': 'casta_griega.jpg',
  'Pan Pizza': 'pan_pizza.jpg',
  'Paté de Hígado': 'pate_de_higado.jpg',
  'Quibbes (Kippes)': 'quibbes_kippes.jpg',
  'Quiche Lorraine': 'quiche_lorraine.jpg',
  'Relleno de Volovanes': 'relleno_de_volovanes.jpg',
  'Rollos Primavera': 'rollos_primavera.jpg',
  'Tomates Marinados': 'tomates_marinados.jpg',
  'Tomates Rellenos': 'tomates_rellenos.jpg',
  'Tortilla de Zuccini': 'tortilla_de_zuccini.jpg',
  
  // Galletas
  'Galletas de Limón': 'galletas_de_limon.jpg',
  'Galletas de Queso': 'galletas_de_queso.jpg',
  
  // Mariscos
  'Cazuela de Mariscos': 'cazuela_de_mariscos.jpg',
  'Mousse de Camarones': 'mousse_de_camarones.jpg',
  'Molde de Papa con Espinacas': 'molde_de_papa_con_espinacas.jpg',
  'Papas Olguina': 'papas_olguita.jpg',
  'Peras de Papa': 'peras_de_papa.jpg',
  'Rollo de Papa': 'rollo_de_papa.jpg',
  'Torrejas de Papa': 'torrejas_de_papa.jpg',
  
  // Pastas
  'Espaguetis Primavera': 'espaguetis_primavera.jpg',
  'Lasaña': 'lasagna.jpg',
  'Torta de Macarrones': 'torta_de_macarrones.jpg',
  'Torta de Tornillos Gratinada': 'torta_de_tornillos_gratinada.jpg',
  'Tortellini': 'tortelinni.jpg',
  
  // Pescados
  'Filete de Pescado con Moldecitos de Arroz': 'filete_de_pescado_con_modecitos_de_papa.jpg',
  'Filete de Pescado Gratinado': 'filete_de_pescado_gratinado.jpg',
  'Filete de Robalo al Limón': 'filete_de_robalo_al_limon.jpg',
  'Filete de Róbalo en Salsa de Queso': 'filete_de_robalo_en_salsa_de_queso.jpg',
  'Langosta a la Thermidor': 'langosta_a_la_thermidor.jpg',
  'Pescado a la Maria Margarita': 'pescado_a_la_maria_margarita.jpg',
  'Pescado en Salsa de Aceitunas': 'pescado_en_salsa_de_aceitunas.jpg',
  'Róbalo a la Maria Valeska': 'robalo_a_la_maria_valeska.jpg',
  'Rollitos de Salmón': 'rollitos_de_salmon.jpg',
  'Salmón Marinado': 'salmon_marinado.jpg',
  'Souflé de Atún': 'soufle_de_atun.jpg',
  'Trucha Almendrada': 'trucha_almendrada.jpg',
  'Trucha Sauté Meunière': 'trucha_saute_meuniere.jpg',
  
  // Callos y otros
  'Callos a la Madrileña': 'callos_a_la_madrilena.jpg',
  
  // Flanes
  'Flan de Caramelo': 'flan_de_caramelo.jpg',
  'Flan de Coco al Horno': 'flan_de_coco_al_horno.jpg',
  'Flan de Queso': 'flan_de_queso.jpg',
  
  // Postres
  'Dulce de Brevas': 'dulce_de_brevas.jpg',
  'Manzanas Merengadas': 'manzanas_merengadas.jpg',
  'Manzanas Monteblanco': 'manzanas_monteblanco.jpg',
  'Maria Luisa': 'maria_luisa.jpg',
  'Mousse de Chocolate': 'mousee_de_chocolate.jpg',
  'Ponqué de Novia': 'ponque_de_novia.jpg',
  
  // Soufflés
  'Souflé de Arroz': 'soufle_de_arroz.jpg',
  'Souflé de Atún': 'soufle_de_atun.jpg',
  'Souflé de Espinaca': 'soufle_de_espinaca.jpg',
  'Souflé de Verduras': 'soufle_de_verduras.jpg',
  
  // Tortillas
  'Tortilla Española': 'tortilla_espanola.jpg',
  
  // Chow mein
  'Chow Mein': 'chow_mein.jpg',
  
  // Tortas
  'Torta de Atún con Espárragos': 'torta_de_atun_y_esparragos.jpg',
  'Torta de Queso Mariana': 'torta_de_queso_mariana.jpg',
  'Timbal de Verduras': 'timbal_de_verduras.jpg',
  
  // Faltantes (movidos de carpeta errores)
  'Pechugas con Crema de Espárragos': 'pechugas_con_crema_de_esparragos.png',
  'Pechugas con Tarragón o Albahaca': 'pechugas_con_tarragon_o_albahaca.png',
  'Pechugas de Pollo a la Crema': 'pechugas_de_pollo_a_la_crema.png',
  'Pechugas de Pollo Rellenas': 'pechugas_de_pollo_rellenas.png',
  'Pechugas en Salsa de Crema y Queso Azul': 'pechugas_en_salsa _de_crema_y_queso_azul.png',
  'Pollo al Strogonoff': 'pollo_al_strogonoff.png',
  'Souflé de Atún': 'soufle_de_atun.jpg',
  'Tortilla Española': 'tortilla_espanola.jpg',
  'Cheesecake': 'cheese_cake.jpg',
  'Pancakes de Naranja': 'pancakes_de_naranja.jpg',
  'Pie de Limón': 'pie_de_limon.jpg',
  'Pie de Limón Versión 2': 'pie_de_limon_version_2.jpg',
  'Strudell de Manzana': 'strudell_de_manzana.jpg',
  'Ajillo para Pan': 'ajillo_para_pan.jpg',
  'Salsa Bechamel y Mornay': 'salsa_bechamel_y_mornay.jpg',
  'Salsa de Naranja': 'salsa_de_naranja.jpg',
  'Salsa Demiglasse': 'salsa_demiglasse.jpg',
  'Cazuela Exquisita': 'cazuela_exquisita.jpg',
  'Terrina de Atún con Espárragos': 'terrina_de_atun_con_esparragos.jpg',
  'Pan de Bananas': 'pan_de_bananas.jpg',
  'Pan de Zuccini': 'pan_de_zuccini.jpg',
  'Torta de Arroz': 'torta_de_arroz.jpg',
  'Torta de Arroz con Espinaca': 'torta_de_arroz_con_espinaca.jpg',
  'Torta de Banana': 'torta_de_banana.jpg',
  
  // Pan
  'Mogolla de Salvado': 'mogolla_de_salvado.jpg',
  
  // Postres individuales
  'Postre Alexandra': 'postre_alexandra.jpg',
  'Postre de Banano': 'postre_de_banano.jpg',
  'Postre de Café': 'postre_de_cafe.jpg',
  'Postre de Coco': 'postre_de_coco.jpg',
  'Postre de Coco con Deditos': 'postre_de_coco_con_deditos.jpg',
  'Postre de Limón': 'postre_de_limon.jpg',
  'Postre de Mango': 'postre_de_mango.jpg',
  'Postre de Naranja': 'postre_de_naranja.jpg',
  'Postre de Natas': 'postre_de_natas.jpg',
  'Postre de Natas sin Natas': 'postre_de_natas_sin_natas.jpg',
  'Postre de Peras': 'postre_de_peras.jpg',
  'Postre de Piña': 'postre_de_pina.jpg',
  'Pudin de Manzana': 'pudin_de_manzana.jpg',
  'Pudin de Vainilla y Albaricoque': 'pudin_de_vainilla_y_albaricoque.jpg',
  
  // Otros
  'Cheesecake': 'cheese_cake.jpg',
  'Pizza Mixta': 'pizza_mixta.jpg',
  'Sopa de Alverja': 'sopa_de_alverja.jpg',
  'Sopa de Cebolla': 'sopa_de_cebolla.jpg',
  'Strudel de Manzana': 'strudel_de_manzana.jpg',
  'Torta de Café': 'torta_de_cafe.jpg',
  'Torta de Mazorca': 'torta_de_mazorca.jpg',
  'Torta de Menudo': 'torta_de_menudo.jpg',
  'Torta de Plátano': 'torta_de_platano.jpg',
  'Torta de Queso': 'torta_de_queso.jpg',
};

// Caché de imágenes ya subidas para evitar duplicados
const uploadedImages = new Map();

/**
 * Convierte un título a formato snake_case
 */
function titleToSnakeCase(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_');
}

/**
 * Busca una imagen que coincida con el título de la receta
 */
function findImageForRecipe(title) {
  // Primero revisar mapeo manual
  if (MANUAL_MAPPINGS[title]) {
    const manualFile = MANUAL_MAPPINGS[title];
    const manualPath = path.join(IMAGES_DIR, manualFile);
    if (fs.existsSync(manualPath)) {
      return { filename: manualFile, filepath: manualPath, matchType: 'MANUAL' };
    }
  }
  
  const snakeTitle = titleToSnakeCase(title);
  const files = fs.readdirSync(IMAGES_DIR);
  
  // 1. Buscar coincidencia exacta
  for (const file of files) {
    const fileSnake = titleToSnakeCase(file.replace(/\.[^.]+$/, ''));
    if (fileSnake === snakeTitle) {
      return { 
        filename: file, 
        filepath: path.join(IMAGES_DIR, file),
        matchType: 'EXACT'
      };
    }
  }
  
  // 2. Buscar coincidencia parcial (contiene el título completo)
  for (const file of files) {
    const fileSnake = titleToSnakeCase(file.replace(/\.[^.]+$/, ''));
    if (fileSnake.includes(snakeTitle) || snakeTitle.includes(fileSnake)) {
      return { 
        filename: file, 
        filepath: path.join(IMAGES_DIR, file),
        matchType: 'PARTIAL'
      };
    }
  }
  
  // 3. Buscar por palabras clave (al menos 2 palabras coincidentes)
  const titleWords = snakeTitle.split('_').filter(w => w.length > 3);
  for (const file of files) {
    const fileSnake = titleToSnakeCase(file.replace(/\.[^.]+$/, ''));
    const fileWords = fileSnake.split('_').filter(w => w.length > 3);
    const matches = titleWords.filter(w => fileWords.includes(w)).length;
    if (matches >= 2) {
      return { 
        filename: file, 
        filepath: path.join(IMAGES_DIR, file),
        matchType: 'KEYWORDS'
      };
    }
  }
  
  return null;
}

/**
 * Sube una imagen al storage de Supabase
 */
async function uploadImage(filepath, filename, recipeTitle) {
  try {
    // Verificar si ya se subió esta imagen
    if (uploadedImages.has(filename)) {
      console.log(`   ℹ️  Imagen ya subida, reutilizando: ${filename}`);
      return uploadedImages.get(filename);
    }
    
    const fileBuffer = fs.readFileSync(filepath);
    const contentType = getContentType(filename);
    
    const { data, error } = await supabase
      .storage
      .from(BUCKET_NAME)
      .upload(filename, fileBuffer, {
        contentType,
        upsert: true
      });
    
    if (error) {
      console.error(`   ❌ Error subiendo ${filename}:`, error.message);
      return null;
    }
    
    // Obtener URL pública
    const { data: { publicUrl } } = supabase
      .storage
      .from(BUCKET_NAME)
      .getPublicUrl(filename);
    
    // Guardar en caché
    uploadedImages.set(filename, publicUrl);
    
    console.log(`   ✅ Imagen subida: ${filename}`);
    return publicUrl;
  } catch (error) {
    console.error(`   ❌ Error subiendo ${filename}:`, error.message);
    return null;
  }
}

/**
 * Obtiene el content type según la extensión
 */
function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const types = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp'
  };
  return types[ext] || 'image/jpeg';
}

/**
 * Inserta una receta en la base de datos
 */
async function insertRecipe(recipe, imageUrl) {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .upsert({
        title_es: recipe.title_es,
        title_en: recipe.title_en,
        description_es: recipe.description_es,
        description_en: recipe.description_en,
        ingredients_es: recipe.ingredients_es,
        ingredients_en: recipe.ingredients_en,
        steps_es: recipe.steps_es,
        steps_en: recipe.steps_en,
        category: recipe.category,
        difficulty: recipe.difficulty,
        servings: recipe.servings,
        prep_time_minutes: recipe.prep_time_minutes,
        tags: recipe.tags,
        image_url: imageUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'title_es'
      });
    
    if (error) {
      console.error(`   ❌ Error insertando:`, error.message);
      return false;
    }
    
    console.log(`   ✅ Receta guardada`);
    return true;
  } catch (error) {
    console.error(`   ❌ Error insertando:`, error.message);
    return false;
  }
}

/**
 * Verifica si el bucket existe, si no lo crea
 * Si falla la creación pero el usuario confirma que existe, continúa
 */
async function ensureBucketExists() {
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.warn('⚠️  No se pudo verificar buckets:', listError.message);
      console.log('   Asumiendo que el bucket ya existe...');
      return true;
    }
    
    const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);
    
    if (!bucketExists) {
      console.log(`📦 Bucket "${BUCKET_NAME}" no existe. Intentando crear...`);
      const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true
      });
      
      if (error) {
        console.error('❌ Error creando bucket:', error.message);
        console.log('\n⚠️  El bucket no se pudo crear automáticamente.');
        console.log('   Si ya lo creaste manualmente, presiona cualquier tecla para continuar...');
        console.log('   Si no lo has creado, cancela (Ctrl+C) y créalo primero en el dashboard de Supabase.');
        
        // Preguntar al usuario
        const readline = require('readline');
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        await new Promise(resolve => {
          rl.question('\n¿Continuar asumiendo que el bucket existe? (s/n): ', (answer) => {
            rl.close();
            if (answer.toLowerCase() === 's' || answer.toLowerCase() === 'si' || answer === '') {
              resolve(true);
            } else {
              console.log('❌ Cancelado por el usuario');
              process.exit(0);
            }
          });
        });
        
        return true;
      }
      console.log(`✅ Bucket "${BUCKET_NAME}" creado`);
    } else {
      console.log(`✅ Bucket "${BUCKET_NAME}" ya existe`);
    }
    return true;
  } catch (error) {
    console.error('❌ Error verificando bucket:', error.message);
    console.log('   Continuando de todos modos...');
    return true;
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Iniciando subida de recetas a Supabase...\n');
  
  // Verificar archivos
  if (!fs.existsSync(RECIPES_FILE)) {
    console.error('❌ No se encontró el archivo recipes.json');
    process.exit(1);
  }
  
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error('❌ No se encontró el directorio de imágenes:', IMAGES_DIR);
    process.exit(1);
  }
  
  // Leer recetas
  const recipesData = JSON.parse(fs.readFileSync(RECIPES_FILE, 'utf8'));
  const recipes = recipesData.recipes;
  
  console.log(`📚 Total de recetas: ${recipes.length}`);
  console.log(`🖼️  Directorio de imágenes: ${IMAGES_DIR}\n`);
  
  // Verificar/crear bucket
  await ensureBucketExists();
  
  console.log('   Continuando con la subida...\n');
  
  console.log('\n📤 Comenzando subida...\n');
  
  let successCount = 0;
  let errorCount = 0;
  let skipCount = 0;
  let noImageCount = 0;
  const unmatchedRecipes = [];
  
  for (let i = 0; i < recipes.length; i++) {
    const recipe = recipes[i];
    console.log(`\n[${i + 1}/${recipes.length}] ${recipe.title_es}`);
    console.log(`   Categoría: ${recipe.category} | Dificultad: ${recipe.difficulty}`);
    
    // Buscar imagen
    const imageInfo = findImageForRecipe(recipe.title_es);
    
    let imageUrl = null;
    if (imageInfo) {
      console.log(`   🖼️  Imagen encontrada (${imageInfo.matchType}): ${imageInfo.filename}`);
      imageUrl = await uploadImage(imageInfo.filepath, imageInfo.filename, recipe.title_es);
    } else {
      console.log(`   ⚠️  No se encontró imagen para esta receta`);
      noImageCount++;
      unmatchedRecipes.push(recipe.title_es);
    }
    
    // Insertar receta
    const inserted = await insertRecipe(recipe, imageUrl);
    
    if (inserted) {
      successCount++;
    } else {
      errorCount++;
    }
    
    // Pequeña pausa para no saturar la API
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  
  // Reporte final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN FINAL');
  console.log('='.repeat(60));
  console.log(`✅ Recetas guardadas exitosamente: ${successCount}`);
  console.log(`❌ Errores: ${errorCount}`);
  console.log(`📦 Total procesadas: ${recipes.length}`);
  console.log(`🖼️  Imágenes únicas subidas: ${uploadedImages.size}`);
  console.log(`⚠️  Recetas sin imagen: ${noImageCount}`);
  console.log('='.repeat(60));
  
  if (unmatchedRecipes.length > 0) {
    console.log('\n📋 RECETAS SIN IMAGEN:');
    console.log('Añade estas recetas al objeto MANUAL_MAPPINGS al inicio del script:');
    unmatchedRecipes.forEach(title => {
      console.log(`  '${title}': 'nombre_imagen.jpg',`);
    });
    console.log('\nPara actualizar los mapeos, edita el script y vuelve a ejecutar.');
  }
  
  console.log('\n✨ Proceso completado!');
}

// Ejecutar
main().catch(error => {
  console.error('💥 Error fatal:', error);
  process.exit(1);
});
