#!/usr/bin/env node

/**
 * HACS Installation Test Script
 * Simulates the HACS installation process and validates card availability
 */

const fs = require('fs');
const path = require('path');

class HacsInstallationTester {
  constructor() {
    this.rootDir = process.cwd();
    this.errors = [];
    this.warnings = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  error(message) {
    this.errors.push(message);
    this.log(message, 'error');
  }

  warning(message) {
    this.warnings.push(message);
    this.log(message, 'warning');
  }

  success(message) {
    this.log(message, 'success');
  }

  info(message) {
    this.log(message, 'info');
  }

  fileExists(filePath) {
    const fullPath = path.join(this.rootDir, filePath);
    return fs.existsSync(fullPath);
  }

  readFile(filePath) {
    try {
      const fullPath = path.join(this.rootDir, filePath);
      return fs.readFileSync(fullPath, 'utf8');
    } catch (error) {
      this.error(`Failed to read ${filePath}: ${error.message}`);
      return null;
    }
  }

  readJsonFile(filePath) {
    try {
      const content = this.readFile(filePath);
      return content ? JSON.parse(content) : null;
    } catch (error) {
      this.error(`Failed to parse JSON ${filePath}: ${error.message}`);
      return null;
    }
  }

  simulateHacsDownload() {
    this.info('Simulating HACS download process...');
    
    const hacsConfig = this.readJsonFile('hacs.json');
    if (!hacsConfig) {
      this.error('Cannot simulate download without valid hacs.json');
      return false;
    }

    // Check if HACS would find the main file
    const expectedFile = hacsConfig.content_in_root !== false 
      ? hacsConfig.filename 
      : `dist/${hacsConfig.filename}`;
    
    if (this.fileExists(expectedFile)) {
      this.success(`HACS would successfully download: ${expectedFile}`);
    } else {
      this.error(`HACS would fail to find main file: ${expectedFile}`);
      return false;
    }

    // Check file size (HACS has limits)
    try {
      const filePath = path.join(this.rootDir, expectedFile);
      const stats = fs.statSync(filePath);
      const sizeKB = stats.size / 1024;
      
      if (sizeKB > 1000) {
        this.warning(`File size is large (${sizeKB.toFixed(2)} KB) - may cause slow downloads`);
      } else {
        this.success(`File size is reasonable (${sizeKB.toFixed(2)} KB)`);
      }
    } catch (error) {
      this.error(`Failed to check file size: ${error.message}`);
    }

    return true;
  }

  validateCardRegistration() {
    this.info('Validating card registration...');
    
    const hacsConfig = this.readJsonFile('hacs.json');
    const expectedFile = hacsConfig.content_in_root !== false 
      ? hacsConfig.filename 
      : `dist/${hacsConfig.filename}`;
    
    const cardContent = this.readFile(expectedFile);
    if (!cardContent) return false;

    // Check for custom element definition
    if (cardContent.includes('customElements.define')) {
      this.success('Card contains custom element definition');
    } else {
      this.error('Card missing custom element definition - will not register');
      return false;
    }

    // Check for card type
    const cardTypeMatch = cardContent.match(/customElements\.define\(['"`]([^'"`]+)['"`]/);
    if (cardTypeMatch) {
      const cardType = cardTypeMatch[1];
      this.success(`Card type detected: ${cardType}`);
      
      // Validate card type follows convention
      if (cardType.startsWith('ha-') || cardType.includes('custom:')) {
        this.warning('Card type may not follow Home Assistant conventions');
      }
    } else {
      this.warning('Could not detect card type from custom element definition');
    }

    // Check for LitElement or similar base class
    if (cardContent.includes('LitElement') || cardContent.includes('HTMLElement')) {
      this.success('Card extends proper base class');
    } else {
      this.warning('Card may not extend proper base class');
    }

    return true;
  }

  validateDashboardAvailability() {
    this.info('Validating dashboard editor availability...');
    
    const hacsConfig = this.readJsonFile('hacs.json');
    const expectedFile = hacsConfig.content_in_root !== false 
      ? hacsConfig.filename 
      : `dist/${hacsConfig.filename}`;
    
    const cardContent = this.readFile(expectedFile);
    if (!cardContent) return false;

    // Check for getConfigElement (visual editor)
    if (cardContent.includes('getConfigElement')) {
      this.success('Card provides visual configuration editor');
    } else {
      this.warning('Card may not have visual configuration editor');
    }

    // Check for getStubConfig (default configuration)
    if (cardContent.includes('getStubConfig')) {
      this.success('Card provides default configuration');
    } else {
      this.warning('Card may not provide default configuration');
    }

    // Check for card description/metadata
    if (cardContent.includes('description') || cardContent.includes('name')) {
      this.success('Card likely includes metadata for dashboard picker');
    } else {
      this.warning('Card may not include proper metadata for dashboard picker');
    }

    return true;
  }

  validateBrowserCacheHandling() {
    this.info('Validating browser cache handling...');
    
    const hacsConfig = this.readJsonFile('hacs.json');
    const expectedFile = hacsConfig.content_in_root !== false 
      ? hacsConfig.filename 
      : `dist/${hacsConfig.filename}`;
    
    // Check if source maps exist (helps with debugging)
    const sourceMapFile = expectedFile + '.map';
    if (this.fileExists(sourceMapFile)) {
      this.success('Source maps available for debugging');
    } else {
      this.warning('No source maps found - debugging may be difficult');
    }

    // Check for version information in the file
    const cardContent = this.readFile(expectedFile);
    if (cardContent && cardContent.includes('version')) {
      this.success('Card likely includes version information');
    } else {
      this.warning('Card may not include version information for cache busting');
    }

    return true;
  }

  simulateInstallationFlow() {
    this.info('Simulating complete HACS installation flow...');
    
    let success = true;
    
    // Step 1: HACS discovers and downloads files
    if (!this.simulateHacsDownload()) {
      success = false;
    }
    
    // Step 2: Home Assistant registers the card
    if (!this.validateCardRegistration()) {
      success = false;
    }
    
    // Step 3: Card becomes available in dashboard editor
    if (!this.validateDashboardAvailability()) {
      success = false;
    }
    
    // Step 4: Browser cache handling
    if (!this.validateBrowserCacheHandling()) {
      success = false;
    }
    
    return success;
  }

  run() {
    console.log('🧪 Starting HACS installation simulation...\n');
    
    const success = this.simulateInstallationFlow();
    
    console.log('\n📊 Installation Test Summary:');
    console.log(`✅ Overall: ${success ? 'PASS' : 'FAIL'}`);
    console.log(`❌ Errors: ${this.errors.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ Critical Issues:');
      this.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  Potential Issues:');
      this.warnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning}`);
      });
    }
    
    if (success && this.errors.length === 0) {
      console.log('\n🎉 HACS installation simulation successful!');
      console.log('The card should install and be available in Home Assistant dashboard editor.');
    } else {
      console.log('\n💥 HACS installation simulation found issues that may prevent proper installation.');
    }
    
    return success && this.errors.length === 0;
  }
}

// Run test if called directly
if (require.main === module) {
  const tester = new HacsInstallationTester();
  const success = tester.run();
  process.exit(success ? 0 : 1);
}

module.exports = HacsInstallationTester;