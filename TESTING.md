# Testing Guide

This document describes the comprehensive testing strategy for the HA Regex Query Card.

## Test Types

### Unit Tests
Located in `src/*.test.ts` files, these test individual components and functions:
- Pattern validation
- Entity matching logic
- Sorting algorithms
- Configuration validation
- Component rendering

Run with: `npm test`

### Integration Tests
Located in `src/ha-regex-query-card.integration.test.ts`, these test component interactions:
- Card lifecycle management
- Home Assistant integration
- State management
- Event handling
- Configuration updates

Run with: `npm test`

### End-to-End Tests
Located in `src/e2e.test.ts`, these test complete user workflows:
- Card installation and configuration
- Cross-browser compatibility scenarios
- Performance with large datasets
- HACS installation validation
- Error recovery and resilience

Run with: `npm run test:e2e`

### Performance Tests
Located in `scripts/performance-test.js`, these test performance characteristics:
- Entity processing speed
- Memory usage
- Rendering performance
- State update efficiency

Run with: `npm run test:performance`

### Browser Compatibility Tests
Located in `scripts/browser-compat-test.js`, these test browser support:
- ES2017+ feature support
- Bundle compatibility
- Polyfill requirements
- Syntax validation

Run with: `npm run test:compat`

## Test Scenarios

### Complete Card Installation and Configuration
Tests the full lifecycle from installation to rendering:
1. Card instantiation
2. Configuration validation
3. Home Assistant connection
4. Entity discovery and matching
5. Rendering in different display modes
6. User interactions

### Cross-browser Compatibility
Validates support across different browser environments:
- Modern ES2017+ features
- Custom Elements API
- Regex implementations
- DOM manipulation consistency

### Performance with Large Entity Sets
Tests performance characteristics with varying dataset sizes:
- 10 entities (small dataset)
- 100 entities (medium dataset)
- 500 entities (large dataset)
- 1000 entities (very large dataset)

Performance thresholds:
- Initialization: < 100ms
- Rendering: < 200ms
- State updates: < 50ms
- Memory usage: < 50MB

### HACS Installation Process
Validates HACS compatibility:
- Required metadata presence
- Installation without Home Assistant connection
- Card registration and discovery
- Version compatibility
- Resource loading and dependencies

## Running Tests

### All Tests
```bash
npm run validate
```

### Individual Test Suites
```bash
# Unit and integration tests
npm test

# End-to-end tests
npm run test:e2e

# Performance tests
npm run test:performance

# Browser compatibility tests
npm run test:compat

# Test coverage
npm run test:coverage
```

### Continuous Integration
Tests are automatically run on:
- Pull requests
- Pushes to main/develop branches
- Release builds

See `.github/workflows/validate.yml` for CI configuration.

## Test Reports

### Performance Report
Generated at `performance-report.json` with:
- Test execution times
- Memory usage metrics
- Entity processing statistics
- Pass/fail status for each scenario

### Compatibility Report
Generated at `compatibility-report.json` with:
- Browser feature support status
- Bundle validation results
- Polyfill recommendations
- Optimization suggestions

### Coverage Report
Generated in `coverage/` directory with:
- Line coverage statistics
- Branch coverage analysis
- Function coverage metrics
- Uncovered code identification

## Test Data

### Mock Entities
Tests use generated mock entities with realistic data:
- Various entity types (sensor, light, switch, binary_sensor)
- Proper state and attribute structures
- Timestamp data for sorting tests
- Large datasets for performance testing

### Mock Home Assistant
Tests use a comprehensive Home Assistant mock with:
- Complete configuration object
- Entity state management
- Event subscription system
- Service call simulation
- Connection state handling

## Debugging Tests

### Running Individual Tests
```bash
# Run specific test file
npx jest src/entity-matcher.test.ts

# Run specific test case
npx jest -t "should match entities with regex pattern"

# Run tests in watch mode
npm run test:watch
```

### Debug Output
Enable debug output by setting environment variables:
```bash
DEBUG=true npm test
VERBOSE=true npm run test:performance
```

### Test Debugging Tips
1. Use `console.log` in test files for debugging
2. Check generated reports for detailed metrics
3. Run tests individually to isolate issues
4. Use Jest's `--verbose` flag for detailed output
5. Check browser developer tools for DOM-related issues

## Contributing Tests

When adding new features:
1. Add unit tests for new functions/methods
2. Update integration tests for component changes
3. Add e2e tests for new user workflows
4. Update performance tests if affecting performance
5. Ensure all tests pass before submitting PR

### Test Naming Conventions
- Test files: `*.test.ts`
- Test descriptions: Use "should" statements
- Test groups: Use `describe` blocks for logical grouping
- Mock data: Prefix with `mock` or `create`

### Test Structure
```typescript
describe('Component Name', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  describe('Feature Group', () => {
    test('should perform expected behavior', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```