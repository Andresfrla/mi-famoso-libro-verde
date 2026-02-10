#!/usr/bin/env node

/**
 * Script para subir SOLO las imágenes faltantes
 * Actualiza recetas que no tienen image_url
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = 'C:\\Users\\LENOVO\\Desktop\\recipies';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://sloshvbfhlttgmaqgnvy.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_jkMk51oqt2N9m2z-MMmUbQ_H3-ujkTx';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const BUCKET_NAME = 'recipe-images';

// Mapeos de las recetas que faltan
const MANUAL_MAPPINGS = {
  'Pechugas con Crema de Espárragos': 'pechugas_con_crema_de_esparragos.png',
  'Pechugas con Tarragón o Albahaca': 'pechugas_con_tarragon_o_albahaca.png',
  'Pechugas de Pollo a la Crema': 'pechugas_de_pollo_a_la_crema.png',
  'Pechugas de Pollo Rellenas': 'pechugas_de_pollo_rellenas.png',
  'Pechugas en Salsa de Crema y Queso Azul': 'pechugas_en_salsa_de_crema_y_queso_azul.png',
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
};

function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const types = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
  return types[ext] || 'image/jpeg';
}

async function uploadMissingImages() {
  console.log('🔍 Buscando recetas sin imagen...\n');
  
  // Obtener recetas sin imagen
  const { data: recipesWithoutImage, error } = await supabase
    .from('recipes')
    .select('title_es')
    .is('image_url', null);
  
  if (error) {
    console.error('❌ Error consultando recetas:', error.message);
    return;
  }
  
  if (!recipesWithoutImage || recipesWithoutImage.length === 0) {
    console.log('✅ Todas las recetas ya tienen imágenes');
    return;
  }
  
  console.log(`📸 Encontradas ${recipesWithoutImage.length} recetas sin imagen\n`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const recipe of recipesWithoutImage) {
    const title = recipe.title_es;
    const imageFile = MANUAL_MAPPINGS[title];
    
    if (!imageFile) {
      console.log(`⚠️  No hay mapeo para: ${title}`);
      continue;
    }
    
    const imagePath = path.join(IMAGES_DIR, imageFile);
    
    if (!fs.existsSync(imagePath)) {
      console.log(`❌ No existe imagen: ${imageFile}`);
      continue;
    }
    
    console.log(`📤 Subiendo: ${title} → ${imageFile}`);
    
    // Subir imagen
    const fileBuffer = fs.readFileSync(imagePath);
    const { error: uploadError } = await supabase
      .storage
      .from(BUCKET_NAME)
      .upload(imageFile, fileBuffer, {
        contentType: getContentType(imageFile),
        upsert: true
      });
    
    if (uploadError) {
      console.error(`   ❌ Error subiendo imagen: ${uploadError.message}`);
      errorCount++;
      continue;
    }
    
    // Obtener URL
    const { data: { publicUrl } } = supabase
      .storage
      .from(BUCKET_NAME)
      .getPublicUrl(imageFile);
    
    // Actualizar receta
    const { error: updateError } = await supabase
      .from('recipes')
      .update({ image_url: publicUrl })
      .eq('title_es', title);
    
    if (updateError) {
      console.error(`   ❌ Error actualizando receta: ${updateError.message}`);
      errorCount++;
    } else {
      console.log(`   ✅ Completado`);
      successCount++;
    }
  }
  
  console.log(`\n📊 RESUMEN:`);
  console.log(`✅ Actualizadas: ${successCount}`);
  console.log(`❌ Errores: ${errorCount}`);
  console.log(`📸 Total pendientes: ${recipesWithoutImage.length}`);
}

uploadMissingImages().catch(console.error);
