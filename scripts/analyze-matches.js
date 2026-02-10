const fs = require('fs');
const path = require('path');

// Rutas
const recipesFile = path.join(__dirname, '..', 'recipes.json');
const imagesDir = 'C:\\Users\\LENOVO\\Desktop\\recipies';

// Leer datos
const recipesData = JSON.parse(fs.readFileSync(recipesFile, 'utf8'));
const images = fs.readdirSync(imagesDir);

console.log('=== ANÁLISIS DE COINCIDENCIAS RECETAS VS IMÁGENES ===\n');
console.log(`Total recetas: ${recipesData.recipes.length}`);
console.log(`Total imágenes: ${images.length}\n`);

// Función para convertir a snake_case
function toSnakeCase(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_');
}

// Función para encontrar coincidencias
function findMatch(recipeTitle) {
  const snakeTitle = toSnakeCase(recipeTitle);
  
  // Buscar coincidencia exacta
  for (const img of images) {
    const imgSnake = toSnakeCase(img.replace(/\.[^.]+$/, ''));
    if (imgSnake === snakeTitle) return { type: 'EXACT', image: img };
  }
  
  // Buscar coincidencia parcial
  for (const img of images) {
    const imgSnake = toSnakeCase(img.replace(/\.[^.]+$/, ''));
    if (imgSnake.includes(snakeTitle) || snakeTitle.includes(imgSnake)) {
      return { type: 'PARTIAL', image: img };
    }
  }
  
  // Buscar palabras clave
  const words = snakeTitle.split('_').filter(w => w.length > 3);
  for (const img of images) {
    const imgSnake = toSnakeCase(img.replace(/\.[^.]+$/, ''));
    const matches = words.filter(w => imgSnake.includes(w)).length;
    if (matches >= 2) return { type: 'KEYWORDS', image: img };
  }
  
  return null;
}

// Analizar todas las recetas
let exactMatches = 0;
let partialMatches = 0;
let keywordMatches = 0;
let noMatches = 0;
const unmatched = [];

console.log('=== PRIMERAS 30 RECETAS ===\n');
recipesData.recipes.slice(0, 30).forEach((recipe, i) => {
  const match = findMatch(recipe.title_es);
  const snakeTitle = toSnakeCase(recipe.title_es);
  
  if (!match) {
    console.log(`${i+1}. ❌ ${recipe.title_es}`);
    console.log(`   snake: ${snakeTitle}`);
    noMatches++;
    unmatched.push(recipe.title_es);
  } else if (match.type === 'EXACT') {
    console.log(`${i+1}. ✅ ${recipe.title_es}`);
    exactMatches++;
  } else if (match.type === 'PARTIAL') {
    console.log(`${i+1}. 🟡 ${recipe.title_es}`);
    console.log(`   → match parcial con: ${match.image}`);
    partialMatches++;
  } else {
    console.log(`${i+1}. 🟠 ${recipe.title_es}`);
    console.log(`   → match por keywords con: ${match.image}`);
    keywordMatches++;
  }
});

console.log('\n=== RESUMEN ===');
console.log(`Coincidencias exactas: ${exactMatches}`);
console.log(`Coincidencias parciales: ${partialMatches}`);
console.log(`Coincidencias por keywords: ${keywordMatches}`);
console.log(`Sin coincidencia: ${noMatches}`);

if (unmatched.length > 0) {
  console.log('\n=== RECETAS SIN COINCIDENCIA ===');
  unmatched.forEach(title => console.log(`- ${title}`));
}
