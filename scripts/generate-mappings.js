const fs = require('fs');
const path = require('path');

const recipesFile = path.join(__dirname, '..', 'recipes.json');
const imagesDir = 'C:\\Users\\LENOVO\\Desktop\\recipies';

const recipes = JSON.parse(fs.readFileSync(recipesFile, 'utf8')).recipes;
const images = fs.readdirSync(imagesDir);

function toSnake(str) {
  return str.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_');
}

console.log('=== GENERANDO MAPEOS MANUALES ===\n');
console.log('const MANUAL_MAPPINGS = {');

const mappings = [];

recipes.forEach((recipe) => {
  const titleSnake = toSnake(recipe.title_es);
  
  // Buscar coincidencia exacta
  let match = images.find(img => {
    const imgSnake = toSnake(img.replace(/\.[^.]+$/, ''));
    return imgSnake === titleSnake;
  });
  
  if (!match) {
    // Buscar coincidencia parcial fuerte
    match = images.find(img => {
      const imgSnake = toSnake(img.replace(/\.[^.]+$/, ''));
      return imgSnake.includes(titleSnake) || titleSnake.includes(imgSnake);
    });
  }
  
  if (!match) {
    // Buscar por palabras clave principales (más de 4 caracteres)
    const keyWords = titleSnake.split('_').filter(w => w.length >= 4);
    const candidates = images.filter(img => {
      const imgSnake = toSnake(img.replace(/\.[^.]+$/, ''));
      return keyWords.some(kw => imgSnake.includes(kw));
    });
    
    if (candidates.length === 1) {
      match = candidates[0];
    }
  }
  
  if (match) {
    mappings.push(`  '${recipe.title_es}': '${match}',`);
  } else {
    // No se encontró imagen
    mappings.push(`  // '${recipe.title_es}': 'IMAGEN_NO_ENCONTRADA',`);
  }
});

// Imprimir solo los que tienen match o necesitan atención
mappings.forEach(m => console.log(m));

console.log('};');
console.log(`\n=== RESUMEN ===`);
console.log(`Total mapeos: ${mappings.filter(m => !m.includes('//')).length}`);
console.log(`Sin imagen: ${mappings.filter(m => m.includes('//')).length}`);
