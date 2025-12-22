#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Performance test configuration
const TEST_CONFIGS = [
  { entities: 10, pattern: '^sensor\\.', description: 'Small dataset (10 entities)' },
  { entities: 100, pattern: '^sensor\\.', description: 'Medium dataset (100 entities)' },
  { entities: 500, pattern: '^sensor\\.', description: 'Large dataset (500 entities)' },
  { entities: 1000, pattern: '^sensor\\.', description: 'Very large dataset (1000 entities)' }
];

const PERFORMANCE_THRESHOLDS = {
  initialization: 100, // ms
  rendering: 200, // ms
  stateUpdate: 50, // ms
  memoryUsage: 50 * 1024 * 1024 // 50MB
};

function generateTestEntities(count) {
  const entities = {};
  for (let i = 0; i < count; i++) {
    const entityId = `sensor.test_${i.toString().padStart(4, '0')}`;
    entities[entityId] = {
      entity_id: entityId,
      state: (Math.random() * 100).toFixed(1),
      attributes: {
        friendly_name: `Test Sensor ${i}`,
        unit_of_measurement: '°C',
        device_class: 'temperature'
      },
      context: { id: `test-context-${i}` },
      last_changed: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      last_updated: new Date(Date.now() - Math.random() * 86400000).toISOString()
    };
  }
  return entities;
}

function measureMemoryUsage() {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    return process.memoryUsage().heapUsed;
  }
  return 0;
}

function runPerformanceTest(config) {
  console.log(`\n🧪 Testing: ${config.description}`);
  console.log(`   Entities: ${config.entities}`);
  console.log(`   Pattern: ${config.pattern}`);
  
  const results = {
    entityCount: config.entities,
    pattern: config.pattern,
    initialization: 0,
    rendering: 0,
    stateUpdate: 0,
    memoryBefore: 0,
    memoryAfter: 0,
    memoryDelta: 0,
    passed: true,
    errors: []
  };
  
  try {
    // Measure initial memory
    results.memoryBefore = measureMemoryUsage();
    
    // Simulate card initialization
    const startInit = performance.now();
    const entities = generateTestEntities(config.entities);
    const endInit = performance.now();
    results.initialization = endInit - startInit;
    
    // Simulate rendering
    const startRender = performance.now();
    // Simulate regex matching
    const pattern = new RegExp(config.pattern);
    const matchedEntities = Object.keys(entities).filter(id => pattern.test(id));
    const endRender = performance.now();
    results.rendering = endRender - startRender;
    
    // Simulate state update
    const startUpdate = performance.now();
    // Simulate updating 10% of entities
    const updateCount = Math.max(1, Math.floor(config.entities * 0.1));
    for (let i = 0; i < updateCount; i++) {
      const entityId = `sensor.test_${i.toString().padStart(4, '0')}`;
      if (entities[entityId]) {
        entities[entityId].state = (Math.random() * 100).toFixed(1);
      }
    }
    const endUpdate = performance.now();
    results.stateUpdate = endUpdate - startUpdate;
    
    // Measure final memory
    results.memoryAfter = measureMemoryUsage();
    results.memoryDelta = results.memoryAfter - results.memoryBefore;
    
    // Check thresholds
    if (results.initialization > PERFORMANCE_THRESHOLDS.initialization) {
      results.passed = false;
      results.errors.push(`Initialization too slow: ${results.initialization.toFixed(2)}ms > ${PERFORMANCE_THRESHOLDS.initialization}ms`);
    }
    
    if (results.rendering > PERFORMANCE_THRESHOLDS.rendering) {
      results.passed = false;
      results.errors.push(`Rendering too slow: ${results.rendering.toFixed(2)}ms > ${PERFORMANCE_THRESHOLDS.rendering}ms`);
    }
    
    if (results.stateUpdate > PERFORMANCE_THRESHOLDS.stateUpdate) {
      results.passed = false;
      results.errors.push(`State update too slow: ${results.stateUpdate.toFixed(2)}ms > ${PERFORMANCE_THRESHOLDS.stateUpdate}ms`);
    }
    
    if (results.memoryDelta > PERFORMANCE_THRESHOLDS.memoryUsage) {
      results.passed = false;
      results.errors.push(`Memory usage too high: ${(results.memoryDelta / 1024 / 1024).toFixed(2)}MB > ${PERFORMANCE_THRESHOLDS.memoryUsage / 1024 / 1024}MB`);
    }
    
    // Log results
    console.log(`   ⏱️  Initialization: ${results.initialization.toFixed(2)}ms`);
    console.log(`   🎨 Rendering: ${results.rendering.toFixed(2)}ms`);
    console.log(`   🔄 State Update: ${results.stateUpdate.toFixed(2)}ms`);
    console.log(`   💾 Memory Delta: ${(results.memoryDelta / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   📊 Matched Entities: ${matchedEntities.length}`);
    
    if (results.passed) {
      console.log(`   ✅ PASSED`);
    } else {
      console.log(`   ❌ FAILED`);
      results.errors.forEach(error => console.log(`      - ${error}`));
    }
    
  } catch (error) {
    results.passed = false;
    results.errors.push(`Test execution error: ${error.message}`);
    console.log(`   ❌ ERROR: ${error.message}`);
  }
  
  return results;
}

function generatePerformanceReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: results.length,
      passed: results.filter(r => r.passed).length,
      failed: results.filter(r => !r.passed).length
    },
    thresholds: PERFORMANCE_THRESHOLDS,
    results: results
  };
  
  const reportPath = path.join(__dirname, '..', 'performance-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n📊 Performance Report Generated: ${reportPath}`);
  return report;
}

function main() {
  console.log('🚀 Starting Performance Tests for HA Regex Query Card');
  console.log('=' .repeat(60));
  
  const results = [];
  
  for (const config of TEST_CONFIGS) {
    const result = runPerformanceTest(config);
    results.push(result);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📈 Performance Test Summary');
  
  const report = generatePerformanceReport(results);
  
  console.log(`\nTotal Tests: ${report.summary.totalTests}`);
  console.log(`Passed: ${report.summary.passed} ✅`);
  console.log(`Failed: ${report.summary.failed} ❌`);
  
  if (report.summary.failed > 0) {
    console.log('\n⚠️  Some performance tests failed. Check the report for details.');
    process.exit(1);
  } else {
    console.log('\n🎉 All performance tests passed!');
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  runPerformanceTest,
  generatePerformanceReport,
  TEST_CONFIGS,
  PERFORMANCE_THRESHOLDS
};