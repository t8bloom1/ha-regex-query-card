import { EntityMatcher, EntityMatchUtils } from './entity-matcher';
import { HomeAssistant, HassEntity } from './types';

// Mock Home Assistant instance with test entities
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
  connection: {} as any,
  connected: true
});

const createMockEntity = (entityId: string, state: string = 'on', attributes: any = {}): HassEntity => ({
  entity_id: entityId,
  state,
  attributes: {
    friendly_name: attributes.friendly_name || entityId.replace(/_/g, ' '),
    ...attributes
  },
  context: { id: 'test-context' },
  last_changed: '2023-01-01T00:00:00Z',
  last_updated: '2023-01-01T00:00:00Z'
});

describe('EntityMatcher', () => {
  let entityMatcher: EntityMatcher;
  let mockHass: HomeAssistant;

  beforeEach(() => {
    const testEntities = {
      'sensor.temperature': createMockEntity('sensor.temperature', '22.5', { unit_of_measurement: '°C' }),
      'sensor.humidity': createMockEntity('sensor.humidity', '45', { unit_of_measurement: '%' }),
      'sensor.battery_level': createMockEntity('sensor.battery_level', '85', { unit_of_measurement: '%' }),
      'light.living_room': createMockEntity('light.living_room', 'on'),
      'light.bedroom': createMockEntity('light.bedroom', 'off'),
      'switch.kitchen': createMockEntity('switch.kitchen', 'on'),
      'binary_sensor.door': createMockEntity('binary_sensor.door', 'off'),
      'binary_sensor.motion': createMockEntity('binary_sensor.motion', 'on'),
      'unavailable.entity': createMockEntity('unavailable.entity', 'unavailable')
    };

    mockHass = createMockHass(testEntities);
    entityMatcher = new EntityMatcher(mockHass);
  });

  describe('matchEntities', () => {
    test('should match entities with valid regex pattern', async () => {
      const result = await entityMatcher.matchEntities({
        pattern: '^sensor\\.'
      });

      expect(result.error).toBeUndefined();
      expect(result.entities).toHaveLength(3);
      expect(result.entities.map(e => e.entity_id)).toEqual([
        'sensor.temperature',
        'sensor.humidity', 
        'sensor.battery_level'
      ]);
      expect(result.matchedCount).toBe(3);
      expect(result.totalCount).toBe(9);
    });

    test('should exclude entities matching exclude pattern', async () => {
      const result = await entityMatcher.matchEntities({
        pattern: '^sensor\\.',
        excludePattern: '.*battery.*'
      });

      expect(result.error).toBeUndefined();
      expect(result.entities).toHaveLength(2);
      expect(result.entities.map(e => e.entity_id)).toEqual([
        'sensor.temperature',
        'sensor.humidity'
      ]);
    });

    test('should handle invalid main pattern', async () => {
      const result = await entityMatcher.matchEntities({
        pattern: '[invalid'
      });

      expect(result.error).toBeDefined();
      expect(result.entities).toHaveLength(0);
      expect(result.matchedCount).toBe(0);
    });

    test('should handle invalid exclude pattern', async () => {
      const result = await entityMatcher.matchEntities({
        pattern: '^sensor\\.',
        excludePattern: '[invalid'
      });

      expect(result.error).toBeDefined();
      expect(result.error).toContain('Exclude pattern error');
      expect(result.entities).toHaveLength(0);
    });

    test('should limit results when maxResults is specified', async () => {
      const result = await entityMatcher.matchEntities({
        pattern: '^sensor\\.',
        maxResults: 2
      });

      expect(result.error).toBeUndefined();
      expect(result.entities).toHaveLength(2);
      expect(result.matchedCount).toBe(3); // Total matches before limiting
    });

    test('should exclude unavailable entities by default', async () => {
      const result = await entityMatcher.matchEntities({
        pattern: '.*'
      });

      expect(result.entities.find(e => e.entity_id === 'unavailable.entity')).toBeUndefined();
    });

    test('should include unavailable entities when requested', async () => {
      const result = await entityMatcher.matchEntities({
        pattern: '.*',
        includeUnavailable: true
      });

      expect(result.entities.find(e => e.entity_id === 'unavailable.entity')).toBeDefined();
    });

    test('should handle empty hass.states', async () => {
      const emptyHass = createMockHass({});
      const emptyMatcher = new EntityMatcher(emptyHass);
      
      const result = await emptyMatcher.matchEntities({
        pattern: '^sensor\\.'
      });

      expect(result.entities).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.matchedCount).toBe(0);
    });

    test('should provide performance metrics', async () => {
      const result = await entityMatcher.matchEntities({
        pattern: '^sensor\\.'
      });

      expect(result.performanceMetrics).toBeDefined();
      expect(result.performanceMetrics.matchingTime).toBeGreaterThanOrEqual(0);
      expect(result.performanceMetrics.entityCount).toBe(9);
    });
  });

  describe('caching', () => {
    test('should cache results for identical queries', async () => {
      const options = { pattern: '^sensor\\.' };
      
      const result1 = await entityMatcher.matchEntities(options);
      const result2 = await entityMatcher.matchEntities(options);

      expect(result1.entities).toEqual(result2.entities);
      expect(result2.performanceMetrics.matchingTime).toBeLessThan(result1.performanceMetrics.matchingTime);
    });

    test('should clear cache when updateHass is called', async () => {
      const options = { pattern: '^sensor\\.' };
      
      await entityMatcher.matchEntities(options);
      
      const newHass = createMockHass({
        'sensor.new': createMockEntity('sensor.new', '100')
      });
      
      entityMatcher.updateHass(newHass);
      
      const result = await entityMatcher.matchEntities(options);
      expect(result.entities).toHaveLength(1);
      expect(result.entities[0].entity_id).toBe('sensor.new');
    });

    test('should manually clear cache', async () => {
      await entityMatcher.matchEntities({ pattern: '^sensor\\.' });
      
      entityMatcher.clearCache();
      
      // Cache should be cleared, but we can't easily test this without internal access
      expect(() => entityMatcher.clearCache()).not.toThrow();
    });
  });

  describe('getEntityStats', () => {
    test('should provide accurate entity statistics', () => {
      const stats = entityMatcher.getEntityStats();

      expect(stats.totalEntities).toBe(9);
      expect(stats.availableEntities).toBe(8); // Excluding unavailable entity
      expect(stats.domains).toEqual({
        'sensor': 3,
        'light': 2,
        'switch': 1,
        'binary_sensor': 2,
        'unavailable': 1
      });
    });
  });

  describe('testPatterns', () => {
    test('should provide pattern testing results', async () => {
      const result = await entityMatcher.testPatterns('^sensor\\.', '.*battery.*');

      expect(result.error).toBeUndefined();
      expect(result.sampleMatches).toEqual(['sensor.temperature', 'sensor.humidity']);
      expect(result.totalMatches).toBe(2);
    });

    test('should handle invalid patterns in testing', async () => {
      const result = await entityMatcher.testPatterns('[invalid');

      expect(result.error).toBeDefined();
      expect(result.sampleMatches).toEqual([]);
      expect(result.totalMatches).toBe(0);
    });
  });

  describe('getSuggestedPatterns', () => {
    test('should provide relevant pattern suggestions', () => {
      const suggestions = entityMatcher.getSuggestedPatterns();

      expect(suggestions).toBeInstanceOf(Array);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0]).toHaveProperty('pattern');
      expect(suggestions[0]).toHaveProperty('description');
      expect(suggestions[0]).toHaveProperty('matchCount');
      
      // Should be sorted by match count
      for (let i = 1; i < suggestions.length; i++) {
        expect(suggestions[i].matchCount).toBeLessThanOrEqual(suggestions[i-1].matchCount);
      }
    });
  });
});

describe('EntityMatchUtils', () => {
  describe('globToRegex', () => {
    test('should convert glob patterns to regex', () => {
      expect(EntityMatchUtils.globToRegex('sensor.*')).toBe('sensor\\..*');
      expect(EntityMatchUtils.globToRegex('sensor.?')).toBe('sensor\\..');
      expect(EntityMatchUtils.globToRegex('sensor[0-9]')).toBe('sensor\\[0-9\\]');
    });
  });

  describe('isValidEntityId', () => {
    test('should validate entity ID format', () => {
      expect(EntityMatchUtils.isValidEntityId('sensor.temperature')).toBe(true);
      expect(EntityMatchUtils.isValidEntityId('light.living_room_1')).toBe(true);
      expect(EntityMatchUtils.isValidEntityId('invalid')).toBe(false);
      expect(EntityMatchUtils.isValidEntityId('SENSOR.TEMP')).toBe(false);
      expect(EntityMatchUtils.isValidEntityId('sensor.')).toBe(false);
    });
  });

  describe('getDomain', () => {
    test('should extract domain from entity ID', () => {
      expect(EntityMatchUtils.getDomain('sensor.temperature')).toBe('sensor');
      expect(EntityMatchUtils.getDomain('binary_sensor.door')).toBe('binary_sensor');
    });
  });

  describe('getObjectId', () => {
    test('should extract object ID from entity ID', () => {
      expect(EntityMatchUtils.getObjectId('sensor.temperature')).toBe('temperature');
      expect(EntityMatchUtils.getObjectId('climate.living_room.thermostat')).toBe('living_room.thermostat');
    });
  });

  describe('isControllable', () => {
    test('should identify controllable entities', () => {
      const lightEntity = createMockEntity('light.living_room');
      const sensorEntity = createMockEntity('sensor.temperature');
      
      expect(EntityMatchUtils.isControllable(lightEntity)).toBe(true);
      expect(EntityMatchUtils.isControllable(sensorEntity)).toBe(false);
    });
  });

  describe('getEntityIcon', () => {
    test('should return custom icon if specified', () => {
      const entity = createMockEntity('sensor.test', 'on', { icon: 'mdi:custom-icon' });
      expect(EntityMatchUtils.getEntityIcon(entity)).toBe('mdi:custom-icon');
    });

    test('should return domain-based icons', () => {
      const lightOn = createMockEntity('light.test', 'on');
      const lightOff = createMockEntity('light.test', 'off');
      const sensor = createMockEntity('sensor.test');
      
      expect(EntityMatchUtils.getEntityIcon(lightOn)).toBe('mdi:lightbulb');
      expect(EntityMatchUtils.getEntityIcon(lightOff)).toBe('mdi:lightbulb-outline');
      expect(EntityMatchUtils.getEntityIcon(sensor)).toBe('mdi:eye');
    });

    test('should return default icon for unknown domains', () => {
      const unknownEntity = createMockEntity('unknown.test');
      expect(EntityMatchUtils.getEntityIcon(unknownEntity)).toBe('mdi:help-circle');
    });
  });
});