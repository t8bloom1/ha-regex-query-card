import { EntitySorter, SortUtils } from './entity-sorter';
import { EntityMatch, HassEntity, SortBy, SortOrder } from './types';

const createMockEntity = (entityId: string, state: string = 'on', lastChanged: string = '2023-01-01T00:00:00Z', attributes: any = {}): HassEntity => ({
  entity_id: entityId,
  state,
  attributes: {
    friendly_name: attributes.friendly_name || entityId.replace(/_/g, ' '),
    ...attributes
  },
  context: { id: 'test-context' },
  last_changed: lastChanged,
  last_updated: lastChanged
});

const createEntityMatch = (entityId: string, state: string = 'on', displayName?: string, lastChanged: string = '2023-01-01T00:00:00Z'): EntityMatch => {
  const entity = createMockEntity(entityId, state, lastChanged);
  return {
    entity_id: entityId,
    entity,
    display_name: displayName || entityId.replace(/_/g, ' '),
    sort_value: displayName || entityId.replace(/_/g, ' ')
  };
};

describe('EntitySorter', () => {
  let testEntities: EntityMatch[];

  beforeEach(() => {
    testEntities = [
      createEntityMatch('sensor.temperature', '22.5', 'Temperature Sensor', '2023-01-01T10:00:00Z'),
      createEntityMatch('sensor.humidity', '45', 'Humidity Sensor', '2023-01-01T09:00:00Z'),
      createEntityMatch('light.living_room', 'on', 'Living Room Light', '2023-01-01T11:00:00Z'),
      createEntityMatch('light.bedroom', 'off', 'Bedroom Light', '2023-01-01T08:00:00Z'),
      createEntityMatch('switch.kitchen', 'on', 'Kitchen Switch', '2023-01-01T12:00:00Z'),
      createEntityMatch('sensor.unavailable', 'unavailable', 'Unavailable Sensor', '2023-01-01T07:00:00Z')
    ];
  });

  describe('sortAndLimitEntities', () => {
    test('should sort entities by name in ascending order', () => {
      const result = EntitySorter.sortAndLimitEntities(testEntities, {
        sortBy: 'name',
        sortOrder: 'asc'
      });

      expect(result.entities).toHaveLength(6);
      expect(result.entities[0].display_name).toBe('Bedroom Light');
      expect(result.entities[1].display_name).toBe('Humidity Sensor');
      expect(result.entities[2].display_name).toBe('Kitchen Switch');
      expect(result.sortedBy).toBe('name');
      expect(result.sortOrder).toBe('asc');
    });

    test('should sort entities by name in descending order', () => {
      const result = EntitySorter.sortAndLimitEntities(testEntities, {
        sortBy: 'name',
        sortOrder: 'desc'
      });

      expect(result.entities[0].display_name).toBe('Unavailable Sensor');
      expect(result.entities[1].display_name).toBe('Temperature Sensor');
      expect(result.entities[2].display_name).toBe('Living Room Light');
    });

    test('should sort entities by state', () => {
      const result = EntitySorter.sortAndLimitEntities(testEntities, {
        sortBy: 'state',
        sortOrder: 'asc'
      });

      // States should be sorted: numbers first, then alphabetically
      const states = result.entities.map(e => e.entity.state);
      expect(states).toEqual(['22.5', '45', 'off', 'on', 'on', 'unavailable']);
    });

    test('should sort entities by last_changed timestamp', () => {
      const result = EntitySorter.sortAndLimitEntities(testEntities, {
        sortBy: 'last_changed',
        sortOrder: 'asc'
      });

      // Should be sorted by timestamp (earliest first)
      expect(result.entities[0].entity_id).toBe('sensor.unavailable'); // 07:00
      expect(result.entities[1].entity_id).toBe('light.bedroom'); // 08:00
      expect(result.entities[2].entity_id).toBe('sensor.humidity'); // 09:00
      expect(result.entities[5].entity_id).toBe('switch.kitchen'); // 12:00
    });

    test('should limit entities when maxEntities is specified', () => {
      const result = EntitySorter.sortAndLimitEntities(testEntities, {
        sortBy: 'name',
        sortOrder: 'asc',
        maxEntities: 3
      });

      expect(result.entities).toHaveLength(3);
      expect(result.totalCount).toBe(6);
      expect(result.limitedCount).toBe(3);
    });

    test('should handle empty entity array', () => {
      const result = EntitySorter.sortAndLimitEntities([], {
        sortBy: 'name',
        sortOrder: 'asc'
      });

      expect(result.entities).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.limitedCount).toBe(0);
    });

    test('should use custom sort function when provided', () => {
      const customSort = (a: EntityMatch, b: EntityMatch) => {
        // Sort by entity_id length
        return a.entity_id.length - b.entity_id.length;
      };

      const result = EntitySorter.sortAndLimitEntities(testEntities, {
        sortBy: 'name',
        sortOrder: 'asc',
        customSortFunction: customSort
      });

      // Shortest entity_id should be first
      expect(result.entities[0].entity_id.length).toBeLessThanOrEqual(result.entities[1].entity_id.length);
    });

    test('should provide performance metrics', () => {
      const result = EntitySorter.sortAndLimitEntities(testEntities, {
        sortBy: 'name',
        sortOrder: 'asc'
      });

      expect(result.performanceMetrics).toBeDefined();
      expect(result.performanceMetrics.sortingTime).toBeGreaterThanOrEqual(0);
      expect(result.performanceMetrics.originalCount).toBe(6);
    });

    test('should handle sorting errors gracefully', () => {
      // Create entities with problematic sort values
      const problematicEntities = [
        { ...testEntities[0], sort_value: null },
        { ...testEntities[1], sort_value: undefined },
        testEntities[2]
      ];

      const result = EntitySorter.sortAndLimitEntities(problematicEntities, {
        sortBy: 'name',
        sortOrder: 'asc'
      });

      expect(result.entities).toHaveLength(3);
      // Should not throw error and return some result
    });
  });

  describe('intelligentLimit', () => {
    test('should prioritize available entities', () => {
      const mixedEntities = [
        createEntityMatch('sensor.unavailable1', 'unavailable'),
        createEntityMatch('sensor.available1', 'on'),
        createEntityMatch('sensor.unavailable2', 'unknown'),
        createEntityMatch('sensor.available2', 'off')
      ];

      const result = EntitySorter.intelligentLimit(mixedEntities, 3, true);

      expect(result).toHaveLength(3);
      // Available entities should come first
      expect(result[0].entity.state).toBe('on');
      expect(result[1].entity.state).toBe('off');
      expect(result[2].entity.state).toBe('unavailable');
    });

    test('should not prioritize when prioritizeAvailable is false', () => {
      const mixedEntities = [
        createEntityMatch('sensor.unavailable1', 'unavailable'),
        createEntityMatch('sensor.available1', 'on')
      ];

      const result = EntitySorter.intelligentLimit(mixedEntities, 1, false);

      expect(result).toHaveLength(1);
      expect(result[0].entity.state).toBe('unavailable'); // First in original order
    });

    test('should return all entities when limit is higher than count', () => {
      const result = EntitySorter.intelligentLimit(testEntities, 10, true);
      expect(result).toHaveLength(testEntities.length);
    });
  });

  describe('createMultiLevelSort', () => {
    test('should create multi-level sort function', () => {
      const multiSort = EntitySorter.createMultiLevelSort(
        { sortBy: 'state', sortOrder: 'asc' },
        { sortBy: 'name', sortOrder: 'asc' }
      );

      const entitiesWithSameState = [
        createEntityMatch('sensor.z_sensor', 'on', 'Z Sensor'),
        createEntityMatch('sensor.a_sensor', 'on', 'A Sensor'),
        createEntityMatch('sensor.m_sensor', 'off', 'M Sensor')
      ];

      const sorted = [...entitiesWithSameState].sort(multiSort);

      // Should sort by state first, then by name
      expect(sorted[0].entity.state).toBe('off'); // M Sensor
      expect(sorted[1].display_name).toBe('A Sensor'); // 'on' state, A comes before Z
      expect(sorted[2].display_name).toBe('Z Sensor'); // 'on' state, Z comes after A
    });
  });

  describe('groupAndSort', () => {
    test('should group entities by domain', () => {
      const grouped = EntitySorter.groupAndSort(testEntities, 'domain', {
        sortBy: 'name',
        sortOrder: 'asc'
      });

      expect(grouped).toHaveProperty('sensor');
      expect(grouped).toHaveProperty('light');
      expect(grouped).toHaveProperty('switch');
      expect(grouped.sensor).toHaveLength(2);
      expect(grouped.light).toHaveLength(2);
      expect(grouped.switch).toHaveLength(1);
    });

    test('should group entities by state', () => {
      const grouped = EntitySorter.groupAndSort(testEntities, 'state', {
        sortBy: 'name',
        sortOrder: 'asc'
      });

      expect(grouped).toHaveProperty('on');
      expect(grouped).toHaveProperty('off');
      expect(grouped).toHaveProperty('22.5');
      expect(grouped).toHaveProperty('45');
      expect(grouped).toHaveProperty('unavailable');
    });
  });

  describe('validateSortConfig', () => {
    test('should validate correct sort configuration', () => {
      const result = EntitySorter.validateSortConfig({
        sortBy: 'name',
        sortOrder: 'asc',
        maxEntities: 50
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject invalid sortBy', () => {
      const result = EntitySorter.validateSortConfig({
        sortBy: 'invalid' as SortBy,
        sortOrder: 'asc'
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Invalid sortBy value');
    });

    test('should reject invalid sortOrder', () => {
      const result = EntitySorter.validateSortConfig({
        sortBy: 'name',
        sortOrder: 'invalid' as SortOrder
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Invalid sortOrder value');
    });

    test('should reject invalid maxEntities', () => {
      const result = EntitySorter.validateSortConfig({
        sortBy: 'name',
        sortOrder: 'asc',
        maxEntities: -1
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('non-negative integer');
    });

    test('should warn about excessive maxEntities', () => {
      const result = EntitySorter.validateSortConfig({
        sortBy: 'name',
        sortOrder: 'asc',
        maxEntities: 1500
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('should not exceed 1000');
    });
  });

  describe('getOptimizedSortConfig', () => {
    test('should optimize for large entity sets', () => {
      const config = EntitySorter.getOptimizedSortConfig(600);
      
      expect(config.sortBy).toBe('name');
      expect(config.maxEntities).toBe(100);
    });

    test('should optimize for medium entity sets', () => {
      const config = EntitySorter.getOptimizedSortConfig(200);
      
      expect(config.maxEntities).toBe(200);
    });

    test('should not optimize for small entity sets', () => {
      const config = EntitySorter.getOptimizedSortConfig(50);
      
      expect(Object.keys(config)).toHaveLength(0);
    });
  });
});

describe('SortUtils', () => {
  describe('createStableSort', () => {
    test('should maintain relative order for equal elements', () => {
      const items = [
        { value: 1, id: 'a' },
        { value: 2, id: 'b' },
        { value: 1, id: 'c' },
        { value: 2, id: 'd' }
      ];

      const stableSort = SortUtils.createStableSort<typeof items[0]>((a, b) => a.value - b.value);
      const sorted = stableSort(items);

      // Items with same value should maintain original order
      expect(sorted[0].id).toBe('a'); // First item with value 1
      expect(sorted[1].id).toBe('c'); // Second item with value 1
      expect(sorted[2].id).toBe('b'); // First item with value 2
      expect(sorted[3].id).toBe('d'); // Second item with value 2
    });
  });

  describe('calculateSortPerformance', () => {
    test('should rate excellent performance', () => {
      const result = SortUtils.calculateSortPerformance(1000, 50); // 0.05ms per entity
      expect(result.rating).toBe('excellent');
      expect(result.recommendation).toBeUndefined();
    });

    test('should rate good performance', () => {
      const result = SortUtils.calculateSortPerformance(1000, 300); // 0.3ms per entity
      expect(result.rating).toBe('good');
    });

    test('should rate fair performance with recommendation', () => {
      const result = SortUtils.calculateSortPerformance(1000, 1500); // 1.5ms per entity
      expect(result.rating).toBe('fair');
      expect(result.recommendation).toBeDefined();
    });

    test('should rate poor performance with recommendation', () => {
      const result = SortUtils.calculateSortPerformance(1000, 3000); // 3ms per entity
      expect(result.rating).toBe('poor');
      expect(result.recommendation).toBeDefined();
    });
  });

  describe('estimateMemoryUsage', () => {
    test('should estimate memory usage correctly', () => {
      const usage = SortUtils.estimateMemoryUsage(1000);
      expect(usage).toBeCloseTo(0.976, 2); // ~1MB for 1000 entities
    });

    test('should handle zero entities', () => {
      const usage = SortUtils.estimateMemoryUsage(0);
      expect(usage).toBe(0);
    });
  });
});