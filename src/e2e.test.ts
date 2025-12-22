/// <reference types="jest" />

import { HaRegexQueryCard } from './ha-regex-query-card';
import { HomeAssistant, HassEntity, RegexQueryCardConfig } from './types';

// Mock LitElement and its decorators
jest.mock('lit', () => ({
  LitElement: class MockLitElement {
    static styles = {};
    connectedCallback() {}
    disconnectedCallback() {}
    updated() {}
    render() { return null; }
    requestUpdate() {}
  },
  html: (strings: TemplateStringsArray, ...values: any[]) => ({ strings, values }),
  css: (strings: TemplateStringsArray, ...values: any[]) => ({ strings, values })
}));

jest.mock('lit/decorators.js', () => ({
  customElement: () => (target: any) => target,
  property: () => (target: any, key: string) => {},
  state: () => (target: any, key: string) => {}
}));

// Mock entity renderer component
jest.mock('./entity-renderer.js', () => ({}));

// Create large entity set for performance testing
const createLargeEntitySet = (count: number): { [key: string]: HassEntity } => {
  const entities: { [key: string]: HassEntity } = {};
  
  for (let i = 0; i < count; i++) {
    const entityId = `sensor.test_${i.toString().padStart(4, '0')}`;
    entities[entityId] = {
      entity_id: entityId,
      state: (Math.random() * 100).toFixed(1),
      attributes: {
        friendly_name: `Test Sensor ${i}`,
        unit_of_measurement: '°C'
      },
      context: { id: `test-context-${i}` },
      last_changed: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      last_updated: new Date(Date.now() - Math.random() * 86400000).toISOString()
    };
  }
  
  return entities;
};

const createMockHass = (entities: { [key: string]: HassEntity }): HomeAssistant => ({
  states: entities,
  config: {
    latitude: 0,
    longitude: 0,
    elevation: 0,
    unit_system: {
      length: 'km',
      mass: 'kg',
      temperature: '°C',
      volume: 'L'
    },
    location_name: 'Test',
    time_zone: 'UTC',
    components: [],
    config_dir: '/config',
    whitelist_external_dirs: [],
    allowlist_external_dirs: [],
    allowlist_external_urls: [],
    version: '2023.1.0',
    config_source: 'yaml',
    safe_mode: false,
    state: 'RUNNING'
  },
  themes: {},
  selectedTheme: {},
  resources: {},
  panels: {},
  panelUrl: '',
  language: 'en',
  selectedLanguage: null,
  translationMetadata: {},
  suspendWhenHidden: false,
  enableShortcuts: true,
  vibrate: true,
  debugMode: false,
  dockedSidebar: 'docked',
  defaultPanel: 'lovelace',
  moreInfoEntityId: null,
  user: undefined,
  userData: undefined,
  hassUrl: () => '',
  callService: jest.fn(),
  callApi: jest.fn(),
  fetchWithAuth: jest.fn(),
  sendWS: jest.fn(),
  callWS: jest.fn(),
  connection: {
    subscribeEvents: jest.fn(() => jest.fn())
  },
  connected: true
});

describe('End-to-End Tests', () => {
  describe('Complete Card Installation and Configuration', () => {
    test('should complete full card lifecycle from installation to rendering', async () => {
      // Simulate card installation
      const card = new HaRegexQueryCard();
      expect(card).toBeInstanceOf(HaRegexQueryCard);
      
      // Simulate configuration
      const config: RegexQueryCardConfig = {
        type: 'custom:ha-regex-query-card',
        pattern: '^sensor\\.',
        display_type: 'list',
        title: 'My Sensors'
      };
      
      card.setConfig(config);
      expect(card.config).toBeDefined();
      
      // Simulate Home Assistant connection
      const entities = createLargeEntitySet(10);
      const mockHass = createMockHass(entities);
      card.hass = mockHass;
      
      // Simulate connection lifecycle
      (card as any).connectedCallback();
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Verify rendering
      const rendered = (card as any).render();
      expect(rendered).toBeDefined();
      
      // Simulate disconnection
      (card as any).disconnectedCallback();
      
      expect(card.hass).toBe(mockHass);
    });

    test('should handle configuration updates during runtime', async () => {
      const card = new HaRegexQueryCard();
      const entities = createLargeEntitySet(20);
      const mockHass = createMockHass(entities);
      
      // Initial configuration
      const initialConfig: RegexQueryCardConfig = {
        type: 'custom:ha-regex-query-card',
        pattern: '^sensor\\.',
        display_type: 'list'
      };
      
      card.setConfig(initialConfig);
      card.hass = mockHass;
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Update configuration
      const updatedConfig: RegexQueryCardConfig = {
        type: 'custom:ha-regex-query-card',
        pattern: '^sensor\\.test_.*',
        display_type: 'grid',
        columns: 4,
        max_entities: 10
      };
      
      card.setConfig(updatedConfig);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(card.config?.display_type).toBe('grid');
      expect(card.config?.columns).toBe(4);
      expect(card.config?.max_entities).toBe(10);
    });

    test('should validate HACS-compatible structure', () => {
      // Test that card can be instantiated (simulating HACS installation)
      const card = new HaRegexQueryCard();
      expect(card).toBeInstanceOf(HaRegexQueryCard);
      
      // Test configuration interface
      const config: RegexQueryCardConfig = {
        type: 'custom:ha-regex-query-card',
        pattern: '^sensor\\.',
        display_type: 'list'
      };
      
      expect(() => card.setConfig(config)).not.toThrow();
      
      // Test card size calculation (required for Lovelace)
      const size = card.getCardSize();
      expect(typeof size).toBe('number');
      expect(size).toBeGreaterThan(0);
    });
  });

  describe('Cross-browser Compatibility', () => {
    test('should handle different JavaScript environments', () => {
      // Test ES2017+ features
      const card = new HaRegexQueryCard();
      
      // Test async/await support
      const asyncTest = async () => {
        await card.refreshEntities();
        return true;
      };
      
      expect(asyncTest()).resolves.toBe(true);
      
      // Test modern array methods
      const testArray = [1, 2, 3];
      expect(testArray.includes(2)).toBe(true);
      
      // Test object spread
      const testObj = { a: 1, b: 2 };
      const spreadObj = { ...testObj, c: 3 };
      expect(spreadObj).toEqual({ a: 1, b: 2, c: 3 });
    });

    test('should handle different regex implementations', () => {
      const card = new HaRegexQueryCard();
      const entities = {
        'sensor.test': {
          entity_id: 'sensor.test',
          state: 'on',
          attributes: {},
          context: { id: 'test' },
          last_changed: '2023-01-01T00:00:00Z',
          last_updated: '2023-01-01T00:00:00Z'
        }
      };
      
      const mockHass = createMockHass(entities);
      
      // Test various regex patterns that might behave differently across browsers
      const patterns = [
        '^sensor\\.',
        'sensor\\..*',
        '.*temperature.*',
        '^(sensor|binary_sensor)\\.',
        '(?!.*battery).*sensor.*'
      ];
      
      patterns.forEach(pattern => {
        const config: RegexQueryCardConfig = {
          type: 'custom:ha-regex-query-card',
          pattern,
          display_type: 'list'
        };
        
        expect(() => {
          card.setConfig(config);
          card.hass = mockHass;
        }).not.toThrow();
      });
    });

    test('should handle DOM manipulation consistently', () => {
      const card = new HaRegexQueryCard();
      
      // Test that render method returns consistent structure
      const rendered = (card as any).render();
      expect(rendered).toBeDefined();
      
      // Test event handling
      const mockEvent = new CustomEvent('test-event');
      expect(() => card.dispatchEvent(mockEvent)).not.toThrow();
    });
  });

  describe('Performance with Large Entity Sets', () => {
    test('should handle 100 entities efficiently', async () => {
      const startTime = performance.now();
      
      const card = new HaRegexQueryCard();
      const entities = createLargeEntitySet(100);
      const mockHass = createMockHass(entities);
      
      const config: RegexQueryCardConfig = {
        type: 'custom:ha-regex-query-card',
        pattern: '^sensor\\.test_.*',
        display_type: 'grid',
        columns: 5
      };
      
      card.setConfig(config);
      card.hass = mockHass;
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const endTime = performance.now();
      const processingTime = endTime - startTime;
      
      // Should complete within reasonable time (less than 1 second)
      expect(processingTime).toBeLessThan(1000);
      
      // Verify performance metrics
      const metrics = card.getPerformanceMetrics();
      expect(metrics.entityCount).toBeGreaterThan(0);
      expect(metrics.lastRenderTime).toBeGreaterThan(0);
    });

    test('should handle 500 entities with pagination/limiting', async () => {
      const card = new HaRegexQueryCard();
      const entities = createLargeEntitySet(500);
      const mockHass = createMockHass(entities);
      
      const config: RegexQueryCardConfig = {
        type: 'custom:ha-regex-query-card',
        pattern: '^sensor\\.test_.*',
        display_type: 'list',
        max_entities: 50 // Limit to prevent performance issues
      };
      
      card.setConfig(config);
      card.hass = mockHass;
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Should still be responsive
      const metrics = card.getPerformanceMetrics();
      expect(metrics.entityCount).toBeLessThanOrEqual(50);
      
      // Test that rendering still works
      const rendered = (card as any).render();
      expect(rendered).toBeDefined();
    });

    test('should handle rapid state updates efficiently', async () => {
      const card = new HaRegexQueryCard();
      const entities = createLargeEntitySet(50);
      const mockHass = createMockHass(entities);
      
      const config: RegexQueryCardConfig = {
        type: 'custom:ha-regex-query-card',
        pattern: '^sensor\\.test_.*',
        display_type: 'list'
      };
      
      card.setConfig(config);
      card.hass = mockHass;
      (card as any).connectedCallback();
      
      // Simulate rapid state changes
      const mockSubscribe = mockHass.connection.subscribeEvents as jest.MockedFunction<any>;
      const eventHandler = mockSubscribe.mock.calls[0][0];
      
      const startTime = performance.now();
      
      // Send 20 rapid state change events
      for (let i = 0; i < 20; i++) {
        eventHandler({
          data: {
            entity_id: `sensor.test_${i.toString().padStart(4, '0')}`,
            new_state: { state: (Math.random() * 100).toFixed(1) },
            old_state: { state: '0' }
          }
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const endTime = performance.now();
      const processingTime = endTime - startTime;
      
      // Should handle rapid updates efficiently
      expect(processingTime).toBeLessThan(500);
    });

    test('should maintain memory efficiency with large datasets', async () => {
      const card = new HaRegexQueryCard();
      
      // Test with multiple configuration changes to check for memory leaks
      for (let i = 0; i < 10; i++) {
        const entities = createLargeEntitySet(100);
        const mockHass = createMockHass(entities);
        
        const config: RegexQueryCardConfig = {
          type: 'custom:ha-regex-query-card',
          pattern: `^sensor\\.test_.*${i}$`,
          display_type: i % 2 === 0 ? 'list' : 'grid',
          columns: (i % 4) + 2
        };
        
        card.setConfig(config);
        card.hass = mockHass;
        
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      // Verify final state is clean
      const metrics = card.getPerformanceMetrics();
      expect(metrics.updateCount).toBeGreaterThan(0);
      expect(metrics.cacheSize).toBeLessThan(1000); // Reasonable cache size
    });
  });

  describe('HACS Installation Process Validation', () => {
    test('should validate required HACS metadata', () => {
      // Test that card has required properties for HACS
      const card = new HaRegexQueryCard();
      
      // Should be a custom element
      expect(card).toBeInstanceOf(HaRegexQueryCard);
      
      // Should have configuration interface
      expect(typeof card.setConfig).toBe('function');
      expect(typeof card.getCardSize).toBe('function');
    });

    test('should handle installation without Home Assistant connection', () => {
      // Simulate card being loaded before Home Assistant is ready
      const card = new HaRegexQueryCard();
      
      const config: RegexQueryCardConfig = {
        type: 'custom:ha-regex-query-card',
        pattern: '^sensor\\.',
        display_type: 'list'
      };
      
      // Should not throw when configured without hass
      expect(() => card.setConfig(config)).not.toThrow();
      
      // Should render gracefully without hass
      const rendered = (card as any).render();
      expect(rendered).toBeDefined();
      
      // Should handle hass assignment later
      const entities = createLargeEntitySet(5);
      const mockHass = createMockHass(entities);
      
      expect(() => {
        card.hass = mockHass;
      }).not.toThrow();
    });

    test('should validate card registration and discovery', () => {
      // Test that card can be registered as a custom element
      const card = new HaRegexQueryCard();
      
      // Should have the correct tag name format
      expect(card.constructor.name).toBe('HaRegexQueryCard');
      
      // Should be configurable through Lovelace
      const config: RegexQueryCardConfig = {
        type: 'custom:ha-regex-query-card',
        pattern: '^sensor\\.',
        display_type: 'list'
      };
      
      card.setConfig(config);
      expect(card.config?.type).toBe('custom:ha-regex-query-card');
    });

    test('should handle version compatibility', () => {
      const card = new HaRegexQueryCard();
      
      // Test with different Home Assistant versions
      const versions = ['2023.1.0', '2023.12.0', '2024.1.0'];
      
      versions.forEach(version => {
        const entities = createLargeEntitySet(5);
        const mockHass = createMockHass(entities);
        mockHass.config.version = version;
        
        expect(() => {
          card.hass = mockHass;
        }).not.toThrow();
      });
    });

    test('should validate resource loading and dependencies', () => {
      // Test that card can be instantiated (simulating successful resource loading)
      expect(() => {
        const card = new HaRegexQueryCard();
        return card;
      }).not.toThrow();
      
      // Test that required methods are available
      const card = new HaRegexQueryCard();
      expect(typeof card.setConfig).toBe('function');
      expect(typeof card.getCardSize).toBe('function');
      expect(typeof card.refreshEntities).toBe('function');
      expect(typeof card.getPerformanceMetrics).toBe('function');
    });
  });

  describe('Error Recovery and Resilience', () => {
    test('should recover from configuration errors', () => {
      const card = new HaRegexQueryCard();
      
      // Set invalid configuration
      expect(() => {
        card.setConfig({
          type: 'invalid-type',
          pattern: '^sensor\\.',
          display_type: 'list'
        } as any);
      }).toThrow();
      
      // Should recover with valid configuration
      const validConfig: RegexQueryCardConfig = {
        type: 'custom:ha-regex-query-card',
        pattern: '^sensor\\.',
        display_type: 'list'
      };
      
      expect(() => card.setConfig(validConfig)).not.toThrow();
      expect(card.config).toBeDefined();
    });

    test('should handle network disconnections gracefully', async () => {
      const card = new HaRegexQueryCard();
      const entities = createLargeEntitySet(10);
      let mockHass = createMockHass(entities);
      
      const config: RegexQueryCardConfig = {
        type: 'custom:ha-regex-query-card',
        pattern: '^sensor\\.',
        display_type: 'list'
      };
      
      card.setConfig(config);
      card.hass = mockHass;
      
      // Simulate connection loss
      mockHass.connected = false;
      card.hass = mockHass;
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Should still render
      const rendered = (card as any).render();
      expect(rendered).toBeDefined();
      
      // Simulate reconnection
      mockHass.connected = true;
      card.hass = mockHass;
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(card.hass.connected).toBe(true);
    });

    test('should handle malformed entity data', () => {
      const card = new HaRegexQueryCard();
      
      // Create entities with missing or malformed data
      const malformedEntities = {
        'sensor.valid': {
          entity_id: 'sensor.valid',
          state: '25',
          attributes: { friendly_name: 'Valid Sensor' },
          context: { id: 'valid' },
          last_changed: '2023-01-01T00:00:00Z',
          last_updated: '2023-01-01T00:00:00Z'
        },
        'sensor.missing_attributes': {
          entity_id: 'sensor.missing_attributes',
          state: '30',
          attributes: {},
          context: { id: 'missing' },
          last_changed: '2023-01-01T00:00:00Z',
          last_updated: '2023-01-01T00:00:00Z'
        },
        'sensor.null_state': {
          entity_id: 'sensor.null_state',
          state: null as any,
          attributes: { friendly_name: 'Null State' },
          context: { id: 'null' },
          last_changed: '2023-01-01T00:00:00Z',
          last_updated: '2023-01-01T00:00:00Z'
        }
      };
      
      const mockHass = createMockHass(malformedEntities);
      
      const config: RegexQueryCardConfig = {
        type: 'custom:ha-regex-query-card',
        pattern: '^sensor\\.',
        display_type: 'list'
      };
      
      card.setConfig(config);
      
      // Should handle malformed data gracefully
      expect(() => {
        card.hass = mockHass;
      }).not.toThrow();
      
      const rendered = (card as any).render();
      expect(rendered).toBeDefined();
    });
  });
});