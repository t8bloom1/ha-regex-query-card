#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const REQUIRED_FILES = [
  'ha-regex-query-card.js',
  'ha-regex-query-card.min.js',
  'ha-regex-query-card.js.map',
  'ha-regex-query-card.min.js.map'
];

function validateBuild() {
  console.log('🔍 Validating build output...');
  
  // Check if dist directory exists
  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ Dist directory does not exist');
    process.exit(1);
  }
  
  // Check required files
  const missingFiles = [];
  for (const file of REQUIRED_FILES) {
    const filePath = path.join(DIST_DIR, file);
    if (!fs.existsSync(filePath)) {
      missingFiles.push(file);
    }
  }
  
  if (missingFiles.length > 0) {
    console.error('❌ Missing required files:', missingFiles.join(', '));
    process.exit(1);
  }
  
  // Check file sizes
  const stats = {};
  for (const file of REQUIRED_FILES) {
    const filePath = path.join(DIST_DIR, file);
    const stat = fs.statSync(filePath);
    stats[file] = stat.size;
  }
  
  console.log('📊 Build output sizes:');
  console.log(`  ha-regex-query-card.js: ${(stats['ha-regex-query-card.js'] / 1024).toFixed(2)} KB`);
  console.log(`  ha-regex-query-card.min.js: ${(stats['ha-regex-query-card.min.js'] / 1024).toFixed(2)} KB`);
  
  // Validate minified version is smaller
  if (stats['ha-regex-query-card.min.js'] >= stats['ha-regex-query-card.js']) {
    console.warn('⚠️  Minified version is not smaller than regular version');
  }
  
  // Check if files contain expected content
  const mainFile = fs.readFileSync(path.join(DIST_DIR, 'ha-regex-query-card.js'), 'utf8');
  if (!mainFile.includes('customElements.define')) {
    console.error('❌ Main file does not contain custom element definition');
    process.exit(1);
  }
  
  // Run HACS validation
  console.log('\n🔍 Running HACS compliance check...');
  try {
    const HacsValidator = require('./validate-hacs.cjs');
    const validator = new HacsValidator();
    const isHacsCompliant = validator.run();
    
    if (!isHacsCompliant) {
      console.error('❌ Build validation failed: HACS compliance issues detected');
      process.exit(1);
    }
  } catch (error) {
    console.warn('⚠️  Could not run HACS validation:', error.message);
  }
  
  console.log('✅ Build validation passed');
}

validateBuild();