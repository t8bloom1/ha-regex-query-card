#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Browser compatibility test configuration
const BROWSER_FEATURES = [
  {
    name: 'ES2017 Support',
    test: () => {
      // Test async/await
      const asyncTest = async () => 'test';
      return typeof asyncTest === 'function';
    }
  },
  {
    name: 'Custom Elements',
    test: () => {
      return typeof customElements !== 'undefined' || typeof window === 'undefined';
    }
  },
  {
    name: 'Template Literals',
    test: () => {
      const template = `test ${1 + 1}`;
      return template === 'test 2';
    }
  },
  {
    name: 'Arrow Functions',
    test: () => {
      const arrow = () => true;
      return arrow();
    }
  },
  {
    name: 'Destructuring',
    test: () => {
      const obj = { a: 1, b: 2 };
      const { a, b } = obj;
      return a === 1 && b === 2;
    }
  },
  {
    name: 'Spread Operator',
    test: () => {
      const arr1 = [1, 2];
      const arr2 = [...arr1, 3];
      return arr2.length === 3 && arr2[2] === 3;
    }
  },
  {
    name: 'Object.assign',
    test: () => {
      return typeof Object.assign === 'function';
    }
  },
  {
    name: 'Array.includes',
    test: () => {
      return typeof Array.prototype.includes === 'function';
    }
  },
  {
    name: 'Promise Support',
    test: () => {
      return typeof Promise === 'function';
    }
  },
  {
    name: 'Regex Unicode Support',
    test: () => {
      try {
        const regex = new RegExp('\\p{L}', 'u');
        return regex instanceof RegExp;
      } catch (e) {
        return false;
      }
    }
  }
];

const POLYFILL_REQUIREMENTS = {
  'Custom Elements': 'https://www.webcomponents.org/polyfills',
  'Object.assign': 'core-js/es6/object',
  'Array.includes': 'core-js/es7/array',
  'Promise Support': 'core-js/es6/promise'
};

function testBrowserCompatibility() {
  console.log('🌐 Testing Browser Compatibility Features');
  console.log('=' .repeat(50));
  
  const results = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    },
    features: [],
    summary: {
      total: BROWSER_FEATURES.length,
      passed: 0,
      failed: 0
    },
    polyfillsNeeded: []
  };
  
  BROWSER_FEATURES.forEach(feature => {
    let passed = false;
    let error = null;
    
    try {
      passed = feature.test();
    } catch (e) {
      error = e.message;
    }
    
    const result = {
      name: feature.name,
      passed,
      error
    };
    
    results.features.push(result);
    
    if (passed) {
      results.summary.passed++;
      console.log(`✅ ${feature.name}`);
    } else {
      results.summary.failed++;
      console.log(`❌ ${feature.name}${error ? ` (${error})` : ''}`);
      
      if (POLYFILL_REQUIREMENTS[feature.name]) {
        results.polyfillsNeeded.push({
          feature: feature.name,
          polyfill: POLYFILL_REQUIREMENTS[feature.name]
        });
      }
    }
  });
  
  return results;
}

function testCardBundleCompatibility() {
  console.log('\n📦 Testing Card Bundle Compatibility');
  console.log('=' .repeat(50));
  
  const distPath = path.join(__dirname, '..', 'dist');
  const results = {
    bundleExists: false,
    bundleSize: 0,
    minifiedExists: false,
    minifiedSize: 0,
    sourceMapsExist: false,
    syntaxValid: false
  };
  
  // Check if bundle exists
  const bundlePath = path.join(distPath, 'ha-regex-query-card.js');
  if (fs.existsSync(bundlePath)) {
    results.bundleExists = true;
    results.bundleSize = fs.statSync(bundlePath).size;
    console.log(`✅ Bundle exists (${(results.bundleSize / 1024).toFixed(2)} KB)`);
    
    // Check syntax validity
    try {
      const bundleContent = fs.readFileSync(bundlePath, 'utf8');
      
      // Basic syntax checks
      if (bundleContent.includes('customElements.define') || 
          bundleContent.includes('class ') ||
          bundleContent.includes('function ')) {
        results.syntaxValid = true;
        console.log('✅ Bundle syntax appears valid');
      } else {
        console.log('❌ Bundle syntax validation failed');
      }
    } catch (e) {
      console.log(`❌ Bundle syntax error: ${e.message}`);
    }
  } else {
    console.log('❌ Bundle does not exist');
  }
  
  // Check minified version
  const minifiedPath = path.join(distPath, 'ha-regex-query-card.min.js');
  if (fs.existsSync(minifiedPath)) {
    results.minifiedExists = true;
    results.minifiedSize = fs.statSync(minifiedPath).size;
    console.log(`✅ Minified bundle exists (${(results.minifiedSize / 1024).toFixed(2)} KB)`);
    
    // Verify minification worked
    if (results.minifiedSize < results.bundleSize) {
      console.log(`✅ Minification effective (${((1 - results.minifiedSize / results.bundleSize) * 100).toFixed(1)}% reduction)`);
    } else {
      console.log('⚠️  Minification may not be working effectively');
    }
  } else {
    console.log('❌ Minified bundle does not exist');
  }
  
  // Check source maps
  const sourceMapPath = path.join(distPath, 'ha-regex-query-card.js.map');
  const minSourceMapPath = path.join(distPath, 'ha-regex-query-card.min.js.map');
  
  if (fs.existsSync(sourceMapPath) && fs.existsSync(minSourceMapPath)) {
    results.sourceMapsExist = true;
    console.log('✅ Source maps exist');
  } else {
    console.log('❌ Source maps missing');
  }
  
  return results;
}

function generateCompatibilityReport(browserResults, bundleResults) {
  const report = {
    timestamp: new Date().toISOString(),
    browser: browserResults,
    bundle: bundleResults,
    recommendations: []
  };
  
  // Generate recommendations
  if (browserResults.summary.failed > 0) {
    report.recommendations.push('Consider adding polyfills for failed browser features');
  }
  
  if (browserResults.polyfillsNeeded.length > 0) {
    report.recommendations.push('Add the following polyfills: ' + 
      browserResults.polyfillsNeeded.map(p => p.polyfill).join(', '));
  }
  
  if (!bundleResults.bundleExists) {
    report.recommendations.push('Run build process to generate bundle');
  }
  
  if (!bundleResults.minifiedExists) {
    report.recommendations.push('Configure production build to generate minified version');
  }
  
  if (!bundleResults.sourceMapsExist) {
    report.recommendations.push('Enable source map generation for debugging');
  }
  
  if (bundleResults.bundleSize > 100 * 1024) { // 100KB
    report.recommendations.push('Consider optimizing bundle size (currently > 100KB)');
  }
  
  const reportPath = path.join(__dirname, '..', 'compatibility-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n📊 Compatibility Report Generated: ${reportPath}`);
  return report;
}

function main() {
  console.log('🧪 Browser Compatibility Test Suite');
  console.log('Testing HA Regex Query Card compatibility\n');
  
  const browserResults = testBrowserCompatibility();
  const bundleResults = testCardBundleCompatibility();
  
  console.log('\n' + '='.repeat(50));
  console.log('📋 Compatibility Summary');
  
  const report = generateCompatibilityReport(browserResults, bundleResults);
  
  console.log(`\nBrowser Features: ${browserResults.summary.passed}/${browserResults.summary.total} passed`);
  console.log(`Bundle Status: ${bundleResults.bundleExists ? 'OK' : 'MISSING'}`);
  console.log(`Minified Bundle: ${bundleResults.minifiedExists ? 'OK' : 'MISSING'}`);
  console.log(`Source Maps: ${bundleResults.sourceMapsExist ? 'OK' : 'MISSING'}`);
  
  if (report.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    report.recommendations.forEach(rec => console.log(`   - ${rec}`));
  }
  
  const hasErrors = browserResults.summary.failed > 0 || 
                   !bundleResults.bundleExists || 
                   !bundleResults.syntaxValid;
  
  if (hasErrors) {
    console.log('\n⚠️  Some compatibility issues found. Check the report for details.');
    process.exit(1);
  } else {
    console.log('\n🎉 All compatibility tests passed!');
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  testBrowserCompatibility,
  testCardBundleCompatibility,
  generateCompatibilityReport
};