import { HaRegexEntityRenderer } from './entity-renderer.js';
import { EntityMatch, RegexQueryCardConfig, HassEntity } from './types.js';

// Mock LitElement for testing
class MockLitElement {
  dispatchEvent(event: Event): boolean {
    return true;
  }
  
  render() {
    return '';
  }
}

// Mock the LitElement import
jest.mock('lit', () => ({
  LitElement: MockLitElement,
  html: (strings: TemplateStringsArray, ...values: any[]) => `${strings.join('')}${values.join('')}`,
  css: (strings: TemplateStringsArray, ...values: any[]) => strings.join('') + values.join('')
}));

jest.mock('lit/decorators.js', () => ({
  customElement: () => (target: any) => target,
  property: () => (target: any, propertyKey: string) => {}
}));

describe('HaRegexEntityRenderer', () => {
  let renderer: HaRegexEntityRenderer;
  let mockConfig: RegexQueryCardConfig;
  let mockEntities: EntityMatch[];

  beforeEach(() => {
    renderer = new HaRegexEntityRenderer();
    
    mockConfig = {
      type: 'custom:ha-regex-query-card',
      pattern: 'sensor\\..*',
      display_type: 'list',
      columns: 3,
      show_name: true,
      show_state: true,
      show_icon: true
    };

    const mockEntity: HassEntity = {
      entity_id: 'sensor.temperature',
      state: '23.5',
      attributes: {
        unit_of_measurement: '°C',
        icon: 'mdi:thermometer'
      },
      context: { id: '1', user_id: 'user1' },
      last_changed: '2023-01-01T00:00:00Z',
      last_updated: '2023-01-01T00:00:00Z'
    };

    mockEntities = [{
      entity_id: 'sensor.temperature',
      entity: mockEntity,
      display_name: 'Temperature',
      sort_value: 'temperature'
    }];

    renderer.config = mockConfig;
    renderer.entities = mockEntities;
  });

  describe('Entity Icon Logic', () => {
    test('should return custom icon when available', () => {
      const entity: HassEntity = {
        entity_id: 'sensor.test',
        state: 'on',
        attributes: { icon: 'mdi:custom-icon' },
        context: { id: '1' },
        last_changed: '2023-01-01T00:00:00Z',
        last_updated: '2023-01-01T00:00:00Z'
      };

      const icon = (renderer as any)._getEntityIcon(entity);
      expect(icon).toBe('mdi:custom-icon');
    });

    test('should return domain-based icon when no custom icon', () => {
      const entity: HassEntity = {
        entity_id: 'light.living_room',
        state: 'on',
        attributes: {},
        context: { id: '1' },
        last_changed: '2023-01-01T00:00:00Z',
        last_updated: '2023-01-01T00:00:00Z'
      };

      const icon = (renderer as any)._getEntityIcon(entity);
      expect(icon).toBe('mdi:lightbulb');
    });

    test('should return default icon for unknown domain', () => {
      const entity: HassEntity = {
        entity_id: 'unknown.test',
        state: 'on',
        attributes: {},
        context: { id: '1' },
        last_changed: '2023-01-01T00:00:00Z',
        last_updated: '2023-01-01T00:00:00Z'
      };

      const icon = (renderer as any)._getEntityIcon(entity);
      expect(icon).toBe('mdi:help-circle');
    });
  });

  describe('Entity Icon Color Logic', () => {
    test('should return accent color for active light', () => {
      const entity: HassEntity = {
        entity_id: 'light.living_room',
        state: 'on',
        attributes: {},
        context: { id: '1' },
        last_changed: '2023-01-01T00:00:00Z',
        last_updated: '2023-01-01T00:00:00Z'
      };

      const color = (renderer as any)._getEntityIconColor(entity);
      expect(color).toBe('var(--accent-color, #03a9f4)');
    });

    test('should return disabled color for inactive switch', () => {
      const entity: HassEntity = {
        entity_id: 'switch.test',
        state: 'off',
        attributes: {},
        context: { id: '1' },
        last_changed: '2023-01-01T00:00:00Z',
        last_updated: '2023-01-01T00:00:00Z'
      };

      const color = (renderer as any)._getEntityIconColor(entity);
      expect(color).toBe('var(--disabled-text-color, #9e9e9e)');
    });

    test('should return warning color for unavailable entity', () => {
      const entity: HassEntity = {
        entity_id: 'sensor.test',
        state: 'unavailable',
        attributes: {},
        context: { id: '1' },
        last_changed: '2023-01-01T00:00:00Z',
        last_updated: '2023-01-01T00:00:00Z'
      };

      const color = (renderer as any)._getEntityIconColor(entity);
      expect(color).toBe('var(--warning-color, #ff9800)');
    });
  });

  describe('State Formatting', () => {
    test('should format numeric state with unit', () => {
      const entity: HassEntity = {
        entity_id: 'sensor.temperature',
        state: '23.456',
        attributes: { unit_of_measurement: '°C' },
        context: { id: '1' },
        last_changed: '2023-01-01T00:00:00Z',
        last_updated: '2023-01-01T00:00:00Z'
      };

      const formatted = (renderer as any)._formatEntityState(entity);
      expect(formatted).toBe('23.46 °C');
    });

    test('should format boolean states', () => {
      const entity: HassEntity = {
        entity_id: 'switch.test',
        state: 'on',
        attributes: {},
        context: { id: '1' },
        last_changed: '2023-01-01T00:00:00Z',
        last_updated: '2023-01-01T00:00:00Z'
      };

      const formatted = (renderer as any)._formatEntityState(entity);
      expect(formatted).toBe('On');
    });

    test('should handle unavailable state', () => {
      const entity: HassEntity = {
        entity_id: 'sensor.test',
        state: 'unavailable',
        attributes: {},
        context: { id: '1' },
        last_changed: '2023-01-01T00:00:00Z',
        last_updated: '2023-01-01T00:00:00Z'
      };

      const formatted = (renderer as any)._formatEntityState(entity);
      expect(formatted).toBe('Unavailable');
    });

    test('should capitalize and format other states', () => {
      const entity: HassEntity = {
        entity_id: 'sensor.test',
        state: 'some_custom_state',
        attributes: {},
        context: { id: '1' },
        last_changed: '2023-01-01T00:00:00Z',
        last_updated: '2023-01-01T00:00:00Z'
      };

      const formatted = (renderer as any)._formatEntityState(entity);
      expect(formatted).toBe('Some custom state');
    });
  });

  describe('Display Configuration', () => {
    test('should handle list display mode', () => {
      renderer.config = { ...mockConfig, display_type: 'list' };
      const result = renderer.render();
      expect(result).toBeDefined();
    });

    test('should handle grid display mode with columns', () => {
      renderer.config = { ...mockConfig, display_type: 'grid', columns: 4 };
      const result = renderer.render();
      expect(result).toBeDefined();
    });

    test('should handle empty entities array', () => {
      renderer.entities = [];
      const result = renderer.render();
      expect(result).toBeDefined();
    });

    test('should handle loading state', () => {
      renderer.loading = true;
      const result = renderer.render();
      expect(result).toBeDefined();
    });

    test('should handle error state', () => {
      renderer.error = 'Test error message';
      const result = renderer.render();
      expect(result).toBeDefined();
    });
  });

  describe('Entity Interaction', () => {
    test('should handle entity click events', () => {
      const mockDispatchEvent = jest.fn();
      renderer.dispatchEvent = mockDispatchEvent;

      const entityMatch = mockEntities[0];
      (renderer as any)._handleEntityClick(entityMatch);

      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hass-more-info',
          detail: { entityId: 'sensor.temperature' }
        })
      );
    });

    test('should handle keyboard events', () => {
      const mockDispatchEvent = jest.fn();
      renderer.dispatchEvent = mockDispatchEvent;

      const entityMatch = mockEntities[0];
      const mockEvent = {
        key: 'Enter',
        preventDefault: jest.fn()
      } as any;

      (renderer as any)._handleEntityKeydown(mockEvent, entityMatch);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockDispatchEvent).toHaveBeenCalled();
    });

    test('should ignore non-action keyboard events', () => {
      const mockDispatchEvent = jest.fn();
      renderer.dispatchEvent = mockDispatchEvent;

      const entityMatch = mockEntities[0];
      const mockEvent = {
        key: 'Tab',
        preventDefault: jest.fn()
      } as any;

      (renderer as any)._handleEntityKeydown(mockEvent, entityMatch);

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(mockDispatchEvent).not.toHaveBeenCalled();
    });
  });

  describe('Responsive Design', () => {
    test('should handle show/hide configuration options', () => {
      renderer.config = {
        ...mockConfig,
        show_name: false,
        show_state: false,
        show_icon: false
      };
      
      const result = renderer.render();
      expect(result).toBeDefined();
    });

    test('should handle undefined configuration gracefully', () => {
      renderer.config = undefined;
      const result = renderer.render();
      expect(result).toBeDefined();
    });
  });
});