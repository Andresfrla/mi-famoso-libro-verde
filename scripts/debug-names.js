const fs = require('fs');

const imagesDir = 'C:\\Users\\LENOVO\\Desktop\\recipies';
const images = fs.readdirSync(imagesDir);

console.log('=== VERIFICACIÓN DE NOMBRES ===\n');

const arrozImages = images.filter(i => i.toLowerCase().includes('arroz'));
console.log('Imágenes con "arroz":');
arrozImages.slice(0, 5).forEach(img => {
  console.log(`  ${img}`);
  console.log(`    chars: ${[...img].map(c => c.charCodeAt(0).toString(16)).join(' ')}`);
});

// Probar la conversión
const test = 'Arroz a la Piña';
const converted = test
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9\s]/g, '')
  .replace(/\s+/g, '_');

console.log('\nConversión de prueba:');
console.log('Original:', test);
console.log('Convertido:', converted);
console.log('Char codes:', [...converted].map(c => c.charCodeAt(0).toString(16)).join(' '));

// Verificar si alguna imagen coincide
const match = images.find(i => i.toLowerCase().replace(/\.[^.]+$/, '') === converted);
console.log('\n¿Coincidencia exacta?', match || 'NO');
