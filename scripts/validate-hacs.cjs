#!/usr/bin/env node

/**
 * HACS Structure Validation Script
 * Validates that the repository structure meets HACS requirements
 */

const fs = require('fs');
const path = require('path');

class HacsValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.rootDir = process.cwd();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '✅';
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

  fileExists(filePath) {
    const fullPath = path.join(this.rootDir, filePath);
    return fs.existsSync(fullPath);
  }

  readJsonFile(filePath) {
    try {
      const fullPath = path.join(this.rootDir, filePath);
      const content = fs.readFileSync(fullPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      this.error(`Failed to read/parse ${filePath}: ${error.message}`);
      return null;
    }
  }

  validateRequiredFiles() {
    this.log('Validating required files...');
    
    const requiredFiles = [
      'hacs.json',
      'info.md',
      'README.md'
    ];

    requiredFiles.forEach(file => {
      if (this.fileExists(file)) {
        this.success(`Required file exists: ${file}`);
      } else {
        this.error(`Missing required file: ${file}`);
      }
    });
  }

  validateHacsJson() {
    this.log('Validating hacs.json configuration...');
    
    const hacsConfig = this.readJsonFile('hacs.json');
    if (!hacsConfig) return;

    // Validate required fields
    const requiredFields = ['name', 'filename'];
    requiredFields.forEach(field => {
      if (hacsConfig[field]) {
        this.success(`hacs.json has required field: ${field}`);
      } else {
        this.error(`hacs.json missing required field: ${field}`);
      }
    });

    // Validate filename matches actual file
    const filename = hacsConfig.filename;
    const contentInRoot = hacsConfig.content_in_root !== false;
    const expectedPath = contentInRoot ? filename : `dist/${filename}`;
    
    if (this.fileExists(expectedPath)) {
      this.success(`Main file exists at expected location: ${expectedPath}`);
    } else {
      this.error(`Main file not found at expected location: ${expectedPath}`);
    }

    // Validate Home Assistant version format
    const haVersion = hacsConfig.homeassistant;
    if (haVersion && /^\d{4}\.\d{1,2}\.\d+$/.test(haVersion)) {
      this.success(`Valid Home Assistant version format: ${haVersion}`);
    } else if (haVersion) {
      this.warning(`Home Assistant version format may be invalid: ${haVersion}`);
    }
  }

  validateFileStructure() {
    this.log('Validating file structure...');
    
    const hacsConfig = this.readJsonFile('hacs.json');
    if (!hacsConfig) return;

    const contentInRoot = hacsConfig.content_in_root !== false;
    
    if (contentInRoot) {
      this.log('Checking root-level file structure...');
      if (this.fileExists(hacsConfig.filename)) {
        this.success('Main file found in root directory');
      } else {
        this.error('Main file not found in root directory');
      }
    } else {
      this.log('Checking subdirectory file structure...');
      if (this.fileExists('dist')) {
        this.success('dist/ directory exists');
        if (this.fileExists(`dist/${hacsConfig.filename}`)) {
          this.success('Main file found in dist/ directory');
        } else {
          this.error('Main file not found in dist/ directory');
        }
      } else {
        this.error('dist/ directory not found');
      }
    }
  }

  validateBuildOutput() {
    this.log('Validating build output...');
    
    const packageJson = this.readJsonFile('package.json');
    if (!packageJson) return;

    // Check if build script exists
    if (packageJson.scripts && packageJson.scripts.build) {
      this.success('Build script found in package.json');
    } else {
      this.warning('No build script found in package.json');
    }

    // Check main field matches HACS filename
    const hacsConfig = this.readJsonFile('hacs.json');
    if (hacsConfig && packageJson.main) {
      const expectedMain = hacsConfig.content_in_root !== false 
        ? hacsConfig.filename 
        : `dist/${hacsConfig.filename}`;
      
      if (packageJson.main === expectedMain) {
        this.success('package.json main field matches HACS filename');
      } else {
        this.warning(`package.json main (${packageJson.main}) doesn't match expected (${expectedMain})`);
      }
    }
  }

  validateDocumentation() {
    this.log('Validating documentation...');
    
    // Check README exists and has content
    if (this.fileExists('README.md')) {
      try {
        const readme = fs.readFileSync(path.join(this.rootDir, 'README.md'), 'utf8');
        if (readme.length > 100) {
          this.success('README.md has substantial content');
        } else {
          this.warning('README.md appears to be very short');
        }
        
        // Check for HACS installation instructions
        if (readme.toLowerCase().includes('hacs')) {
          this.success('README.md mentions HACS installation');
        } else {
          this.warning('README.md should include HACS installation instructions');
        }
      } catch (error) {
        this.error(`Failed to read README.md: ${error.message}`);
      }
    }

    // Check info.md
    if (this.fileExists('info.md')) {
      try {
        const info = fs.readFileSync(path.join(this.rootDir, 'info.md'), 'utf8');
        if (info.length > 50) {
          this.success('info.md has content for HACS display');
        } else {
          this.warning('info.md appears to be very short');
        }
      } catch (error) {
        this.error(`Failed to read info.md: ${error.message}`);
      }
    }
  }

  run() {
    console.log('🔍 Starting HACS validation...\n');
    
    this.validateRequiredFiles();
    console.log('');
    
    this.validateHacsJson();
    console.log('');
    
    this.validateFileStructure();
    console.log('');
    
    this.validateBuildOutput();
    console.log('');
    
    this.validateDocumentation();
    console.log('');
    
    // Summary
    console.log('📊 Validation Summary:');
    console.log(`✅ Passed: ${this.errors.length === 0 ? 'All checks' : 'Some checks'}`);
    console.log(`❌ Errors: ${this.errors.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ Errors found:');
      this.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning}`);
      });
    }
    
    if (this.errors.length === 0) {
      console.log('\n🎉 Repository structure is HACS compliant!');
      return true;
    } else {
      console.log('\n💥 Repository structure has HACS compliance issues that need to be fixed.');
      return false;
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new HacsValidator();
  const isValid = validator.run();
  process.exit(isValid ? 0 : 1);
}

module.exports = HacsValidator;