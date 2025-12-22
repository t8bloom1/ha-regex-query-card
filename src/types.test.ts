import {
  RegexQueryCardConfig,
  EntityMatch,
  CardState,
  HomeAssistant,
  HassEntity,
  DisplayType,
  SortBy,
  SortOrder,
  RegexError,
  ConfigValidationResult,
  EntityActionConfig,
  EntityFilter,
  PerformanceMetrics
} from './types';

// Test that all required interfaces are properly defined and can be used
describe('TypeScript Interfaces', () => {
  test('RegexQueryCardConfig interface should have all required properties', () => {
    const config: RegexQueryCardConfig = {
      type: 'custom:ha-regex-query-card',
      pattern: '^sensor\\.',
      display_type: 'list'
    };

    expect(config.type).toBe('custom:ha-regex-query-card');
    expect(config.pattern).toBe('^sensor\\.');
    expect(config.display_type).toBe('list');
  });

  test('RegexQueryCardConfig interface should support all optional properties', () => {
    const config: RegexQueryCardConfig = {
      type: 'custom:ha-regex-query-card',
      pattern: '^light\\.',
      exclude_pattern: '.*_battery$',
      display_type: 'grid',
      columns: 3,
      sort_by: 'name',
      sort_order: 'asc',
      max_entities: 20,
      show_name: true,
      show_state: true,
      show_icon: true,
      title: 'My Lights'
    };

    expect(config.exclude_pattern).toBe('.*_battery$');
    expect(config.columns).toBe(3);
    expect(config.sort_by).toBe('name');
    expect(config.sort_order).toBe('asc');
    expect(config.max_entities).toBe(20);
    expect(config.show_name).toBe(true);
    expect(config.show_state).toBe(true);
    expect(config.show_icon).toBe(true);
    expect(config.title).toBe('My Lights');
  });

  test('EntityMatch interface should structure matched entity data correctly', () => {
    const mockEntity: HassEntity = {
      entity_id: 'sensor.temperature',
      state: '22.5',
      attributes: { unit_of_measurement: '°C' },
      context: { id: 'test-context' },
      last_changed: '2023-01-01T00:00:00Z',
      last_updated: '2023-01-01T00:00:00Z'
    };

    const entityMatch: EntityMatch = {
      entity_id: 'sensor.temperature',
      entity: mockEntity,
      display_name: 'Temperature Sensor',
      sort_value: 'Temperature Sensor'
    };

    expect(entityMatch.entity_id).toBe('sensor.temperature');
    expect(entityMatch.entity).toBe(mockEntity);
    expect(entityMatch.display_name).toBe('Temperature Sensor');
    expect(entityMatch.sort_value).toBe('Temperature Sensor');
  });

  test('CardState interface should manage component state correctly', () => {
    const cardState: CardState = {
      entities: [],
      loading: false,
      error: undefined,
      pattern_valid: true
    };

    expect(cardState.entities).toEqual([]);
    expect(cardState.loading).toBe(false);
    expect(cardState.error).toBeUndefined();
    expect(cardState.pattern_valid).toBe(true);
  });

  test('CardState interface should handle error states', () => {
    const cardState: CardState = {
      entities: [],
      loading: false,
      error: 'Invalid regex pattern',
      pattern_valid: false
    };

    expect(cardState.error).toBe('Invalid regex pattern');
    expect(cardState.pattern_valid).toBe(false);
  });

  test('Type aliases should work correctly', () => {
    const displayType: DisplayType = 'grid';
    const sortBy: SortBy = 'last_changed';
    const sortOrder: SortOrder = 'desc';

    expect(displayType).toBe('grid');
    expect(sortBy).toBe('last_changed');
    expect(sortOrder).toBe('desc');
  });

  test('RegexError interface should structure error information', () => {
    const error: RegexError = {
      type: 'pattern',
      message: 'Invalid regex syntax',
      details: 'Unclosed group at position 5'
    };

    expect(error.type).toBe('pattern');
    expect(error.message).toBe('Invalid regex syntax');
    expect(error.details).toBe('Unclosed group at position 5');
  });

  test('ConfigValidationResult interface should structure validation results', () => {
    const result: ConfigValidationResult = {
      valid: false,
      errors: [{
        type: 'pattern',
        message: 'Invalid regex'
      }],
      warnings: ['Pattern may be too broad']
    };

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.warnings).toHaveLength(1);
  });

  test('EntityActionConfig interface should define entity actions', () => {
    const actionConfig: EntityActionConfig = {
      action: 'toggle',
      confirmation: true
    };

    expect(actionConfig.action).toBe('toggle');
    expect(actionConfig.confirmation).toBe(true);
  });

  test('EntityFilter interface should define filtering options', () => {
    const filter: EntityFilter = {
      pattern: /^sensor\./,
      excludePattern: /.*_battery$/,
      sortBy: 'name',
      sortOrder: 'asc',
      maxEntities: 50
    };

    expect(filter.pattern).toBeInstanceOf(RegExp);
    expect(filter.excludePattern).toBeInstanceOf(RegExp);
    expect(filter.sortBy).toBe('name');
    expect(filter.sortOrder).toBe('asc');
    expect(filter.maxEntities).toBe(50);
  });

  test('PerformanceMetrics interface should track performance data', () => {
    const metrics: PerformanceMetrics = {
      entityCount: 150,
      matchingTime: 25.5,
      renderTime: 12.3,
      lastUpdate: Date.now()
    };

    expect(metrics.entityCount).toBe(150);
    expect(metrics.matchingTime).toBe(25.5);
    expect(metrics.renderTime).toBe(12.3);
    expect(typeof metrics.lastUpdate).toBe('number');
  });
});