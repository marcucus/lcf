const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Check if sharp is available
try {
  require.resolve('sharp');
} catch (e) {
  console.error('❌ Error: "sharp" package is not installed.');
  console.error('Please run: npm install --save-dev sharp');
  process.exit(1);
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputFile = path.join(__dirname, '../public/logo.jpg');
const outputDir = path.join(__dirname, '../public/icons');

// Check if input file exists
if (!fs.existsSync(inputFile)) {
  console.error(`❌ Error: Input file not found: ${inputFile}`);
  console.error('Please ensure logo.jpg exists in the public directory.');
  process.exit(1);
}

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate icons
async function generateIcons() {
  console.log('🎨 Generating PWA icons...\n');
  
  for (const size of sizes) {
    const outputFile = path.join(outputDir, `icon-${size}x${size}.png`);
    
    try {
      await sharp(inputFile)
        .resize(size, size, {
          fit: 'cover',
          position: 'center'
        })
        .png()
        .toFile(outputFile);
      
      console.log(`✓ Generated ${size}x${size} icon`);
    } catch (error) {
      console.error(`✗ Error generating ${size}x${size} icon:`, error.message);
      process.exit(1);
    }
  }
  
  console.log('\n✅ All icons generated successfully!');
  console.log(`📁 Icons saved to: ${outputDir}`);
}

generateIcons().catch((error) => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
