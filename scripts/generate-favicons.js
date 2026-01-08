/**
 * Favicon Generation Script
 * 
 * This script generates PNG favicons from the SVG source.
 * 
 * Prerequisites:
 * npm install sharp
 * 
 * Usage:
 * node scripts/generate-favicons.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svgPath = path.join(__dirname, '../public/favicon.svg');
const publicDir = path.join(__dirname, '../public');

// Read SVG content
const svgContent = fs.readFileSync(svgPath, 'utf8');

// Replace media queries with light theme for PNG generation
const lightThemeSvg = svgContent.replace(
  /@media \(prefers-color-scheme: light\) \{[^}]+\}/g,
  ''
).replace(
  /@media \(prefers-color-scheme: dark\) \{[^}]+\}/g,
  ''
).replace(
  '<style>',
  '<style>.clock-face { fill: #1976d2; } .clock-hand { fill: #ffffff; } .clock-center { fill: #ffffff; } .clock-tick { fill: #4285f4; }'
);

const sizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'android-chrome-192x192.png' },
  { size: 512, name: 'android-chrome-512x512.png' },
];

async function generateFavicons() {
  console.log('Generating favicons...');
  
  for (const { size, name } of sizes) {
    const outputPath = path.join(publicDir, name);
    
    try {
      await sharp(Buffer.from(lightThemeSvg))
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`✓ Generated ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`✗ Failed to generate ${name}:`, error.message);
    }
  }
  
  console.log('\nFavicon generation complete!');
}

generateFavicons().catch(console.error);
