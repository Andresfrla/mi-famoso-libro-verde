const fs = require('fs');
const path = require('path');

const recipesFile = path.join(__dirname, '..', 'recipes.json');
const imagesDir = 'C:\\Users\\LENOVO\\Desktop\\recipies';

const recipes = JSON.parse(fs.readFileSync(recipesFile, 'utf8')).recipes;
const images = fs.readdirSync(imagesDir);

console.log('=== ANÁLISIS DE COINCIDENCIAS ===\n');
console.log(`Recetas: ${recipes.length}`);
console.log(`Imágenes: ${images.length}\n`);

function toSnake(str) {
  return str.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_');
}

const unmatched = [];

recipes.forEach((recipe, i) => {
  const titleSnake = toSnake(recipe.title_es);
  const matches = images.filter(img => {
    const imgSnake = toSnake(img.replace(/\.[^.]+$/, ''));
    return imgSnake === titleSnake || 
           imgSnake.includes(titleSnake) || 
           titleSnake.includes(imgSnake);
  });
  
  if (matches.length === 0) {
    console.log(`${i+1}. ❌ ${recipe.title_es}`);
    console.log(`   snake: ${titleSnake}`);
    unmatched.push({recipe: recipe.title_es, snake: titleSnake});
  } else if (matches.length === 1) {
    console.log(`${i+1}. ✅ ${recipe.title_es} → ${matches[0]}`);
  } else {
    console.log(`${i+1}. 🟡 ${recipe.title_es} → ${matches.join(', ')}`);
  }
});

console.log(`\n=== RESUMEN ===`);
console.log(`Sin coincidencias: ${unmatched.length}`);

if (unmatched.length > 0) {
  console.log(`\n=== MAPEOS MANUALES NECESARIOS ===`);
  console.log(`Agrega estos al objeto MANUAL_MAPPINGS en el script:`);
  unmatched.forEach(({recipe, snake}) => {
    // Buscar imagen similar
    const similar = images.find(img => {
      const imgSnake = toSnake(img.replace(/\.[^.]+$/, ''));
      const words = snake.split('_').filter(w => w.length > 3);
      return words.some(w => imgSnake.includes(w));
    });
    if (similar) {
      console.log(`  '${recipe}': '${similar}',`);
    } else {
      console.log(`  // '${recipe}': 'NO_IMAGE_FOUND',`);
    }
  });
}
