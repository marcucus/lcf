#!/usr/bin/env node

/**
 * Image Optimization Script
 * Converts images to WebP format for better performance
 * Uses Sharp library for high-quality image processing
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '../public');

/**
 * Optimize a single image file
 * @param {string} inputPath - Path to input image
 * @param {string} outputPath - Path to output WebP image
 */
async function optimizeImage(inputPath, outputPath) {
  try {
    const info = await sharp(inputPath)
      .webp({ quality: 85, effort: 6 })
      .toFile(outputPath);
    
    const inputStats = fs.statSync(inputPath);
    const outputStats = fs.statSync(outputPath);
    const savings = ((inputStats.size - outputStats.size) / inputStats.size * 100).toFixed(2);
    
    console.log(`✓ Optimized: ${path.basename(inputPath)}`);
    console.log(`  Size: ${(inputStats.size / 1024).toFixed(2)}KB → ${(outputStats.size / 1024).toFixed(2)}KB (${savings}% reduction)`);
    
    return { success: true, savings };
  } catch (error) {
    console.error(`✗ Failed to optimize ${inputPath}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Process all images in a directory
 * @param {string} dir - Directory to process
 */
async function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  const results = [];
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Recursively process subdirectories
      const subResults = await processDirectory(filePath);
      results.push(...subResults);
    } else if (/\.(jpg|jpeg|png)$/i.test(file)) {
      // Process image files
      const webpPath = filePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      
      // Skip if WebP version already exists and is newer
      if (fs.existsSync(webpPath)) {
        const originalTime = fs.statSync(filePath).mtime;
        const webpTime = fs.statSync(webpPath).mtime;
        
        if (webpTime > originalTime) {
          console.log(`⊘ Skipping ${file} (WebP version is up to date)`);
          continue;
        }
      }
      
      const result = await optimizeImage(filePath, webpPath);
      results.push(result);
    }
  }
  
  return results;
}

/**
 * Main execution
 */
async function main() {
  console.log('🖼️  Image Optimization Tool\n');
  console.log('Processing images in public directory...\n');
  
  if (!fs.existsSync(PUBLIC_DIR)) {
    console.error('Error: Public directory not found');
    process.exit(1);
  }
  
  const startTime = Date.now();
  const results = await processDirectory(PUBLIC_DIR);
  const endTime = Date.now();
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('Optimization Summary:');
  console.log('='.repeat(50));
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const totalTime = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log(`✓ Successfully optimized: ${successful} images`);
  if (failed > 0) {
    console.log(`✗ Failed: ${failed} images`);
  }
  console.log(`⏱️  Total time: ${totalTime}s`);
  console.log('='.repeat(50));
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { optimizeImage, processDirectory };
