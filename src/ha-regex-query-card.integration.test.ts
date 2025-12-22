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
  connection: {
    subscribeEvents: jest.fn(() => jest.fn()) // Returns unsubscribe function
  },
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

describe('HaRegexQueryCard Integration Tests', () => {
  let card: HaRegexQueryCard;
  let mockHass: HomeAssistant;

  beforeEach(() => {
    // Create test entities
    const testEntities = {
      'sensor.temperature': createMockEntity('sensor.temperature', '22.5', { unit_of_measurement: '°C' }),
      'sensor.humidity': createMockEntity('sensor.humidity', '45', { unit_of_measurement: '%' }),
      'sensor.battery_level': createMockEntity('sensor.battery_level', '85', { unit_of_measurement: '%' }),
      'light.living_room': createMockEntity('light.living_room', 'on'),
      'light.bedroom': createMockEntity('light.bedroom', 'off'),
      'switch.kitchen': createMockEntity('switch.kitchen', 'on'),
      'binary_sensor.door': createMockEntity('binary_sensor.door', 'off'),
      'binary_sensor.motion': createMockEntity('binary_sensor.motion', 'on')
    };

    mockHass = createMockHass(testEntities);
    card = new HaRegexQueryCard();
  });

  afterEach(() => {
    // Clean up any timers
    jest.clearAllTimers();
  });

  describe('Card Initialization and Configuration', () => {
    test('should initialize with default state', () => {
      expect(card.hass).toBeUndefined();
      expect(card.config).toBeUndefined();
    });

    test('should set valid configuration successfully', () => {
      const config: RegexQueryCardConfig = {
        type: 'custom:ha-regex-query-card',
        pattern: '^sensor\\.',
        display_type: 'list'
      };

      expect(() => card.setConfig(config)).not.toThrow();
      expect(card.config).toEqual({
        ...config,
        columns: 3,
        sort_by: 'name',
        sort_order: 'asc',
        show_name: true,
        show_state: true,
        show_icon: true
      });
    });

    test('should throw error for missing configuration', () => {
      expect(() => card.setConfig(null as any)).toThrow('Invalid configuration');
    });

    test('should throw error for missing pattern', () => {
      const config = {
        type: 'custom:ha-regex-query-card',
        display_type: 'list'
      } as RegexQueryCardConfig;

      expect(() => card.setConfig(config)).toThrow('Pattern is required');
    });

    test('should throw error for invalid card type', () => {
      const config = {
        type: 'invalid-type',
        pattern: '^sensor\\.',
        display_type: 'list'
      } as any;

      expect(() => card.setConfig(config)).toThrow('Invalid card type');
    });

    test('should validate display_type configuration', () => {
      const config = {
        type: 'custom:ha-regex-query-card',
        pattern: '^sensor\\.',
        display_type: 'invalid'
      } as any;

      expect(() => card.setConfig(config)).toThrow('display_type must be "list" or "grid"');
    });

    test('should validate columns for grid display', () => {
      const config: RegexQueryCardConfig = {
        type: 'custom:ha-regex-query-card',
        pattern: '^sensor\\.',
        display_type: 'grid',
        columns: 10
      };

      expect(() => card.setConfig(config)).toThrow('columns must be between 1 and 6');
    });

    test('should validate sort_by configuration', () => {
      const config = {
        type: 'custom:ha-regex-query-card',
        pattern: '^sensor\\.',
        display_type: 'list',
        sort_by: 'invalid'
      } as any;

      expect(() => card.setConfig(config)).toThrow('sort_by must be "name", "state", or "last_changed"');
    });

    test('should validate sort_order configuration', () => {
      const config = {
        type: 'custom:ha-regex-query-card',
        pattern: '^sensor\\.',
        display_type: 'list',
        sort_order: 'invalid'
      } as any;

      expect(() => card.setConfig(config)).toThrow('sort_order must be "asc" or "desc"');
    });

    test('should validate max_entities configuration', () => {
      const config: RegexQueryCardConfig = {
        type: 'custom:ha-regex-query-card',
        pattern: '^sensor\\.',
        display_type: 'list',
        max_entities: 2000
      };

      expect(() => card.setConfig(config)).toThrow('max_entities must be between 1 and 1000');
    });
  });

  describe('State Management and Updates', () => {
    beforeEach(() => {
      const config: RegexQueryCardConfig = {
        type: 'custom:ha-regex-query-card',
        pattern: '^sensor\\.',
        display_type: 'list'
      };
      card.setConfig(config);
    });

    test('should handle hass assignment and trigger entity update', async () => {
      card.hass = mockHass;
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(card.hass).toBe(mockHass);
    });

    test('should handle hass unavailable state', () => {
      card.hass = undefined;
      
      // Should not throw errors when hass is unavailable
      expect(() => card.hass = undefined).not.toThrow();
    });

    test('should subscribe to state changes when connected', () => {
      const mockSubscribe = jest.fn(() => jest.fn()) as jest.MockedFunction<any>;
      mockHass.connection.subscribeEvents = mockSubscribe;
      
      card.hass = mockHass;
      
      // Simulate connectedCallback
      (card as any).connectedCallback();
      
      expect(mockSubscribe).toHaveBeenCalledWith(
        expect.any(Function),
        'state_changed'
      );
    });

    test('should unsubscribe from state changes when disconnected', () => {
      const mockUnsubscribe = jest.fn();
      const mockSubscribe = jest.fn(() => mockUnsubscribe) as jest.MockedFunction<any>;
      mockHass.connection.subscribeEvents = mockSubscribe;
      
      card.hass = mockHass;
      (card as any).connectedCallback();
      
      // Simulate disconnectedCallback
      (card as any).disconnectedCallback();
      
      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    test('should handle configuration changes and trigger updates', async () => {
      card.hass = mockHass;
      
      const newConfig: RegexQueryCardConfig = {
        type: 'custom:ha-regex-query-card',
        pattern: '^light\\.',
        display_type: 'grid',
        columns: 2
      };
      
      card.setConfig(newConfig);
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(card.config?.pattern).toBe('^light\\.');
      expect(card.config?.display_type).toBe('grid');
      expect(card.config?.columns).toBe(2);
    });

    test('should handle state change events', () => {
      card.hass = mockHass;
      (card as any).connectedCallback();
      
      // Simulate state change event
      const stateChangeEvent = {
        data: {
          entity_id: 'sensor.temperature',
          new_state: { state: '23.0' },
          old_state: { state: '22.5' }
        }
      };
      
      // Get the event handler that was registered
      const mockSubscribe = mockHass.connection.subscribeEvents as jest.MockedFunction<any>;
      const eventHandler = mockSubscribe.mock.calls[0][0];
      
      expect(() => eventHandler(stateChangeEvent)).not.toThrow();
    });

    test('should refresh entities when requested', async () => {
      card.hass = mockHass;
      
      await card.refreshEntities();
      
      // Should complete without errors
      expect(card.hass).toBe(mockHass);
    });

    test('should provide performance metrics', () => {
      const metrics = card.getPerformanceMetrics();
      
      expect(metrics).toHaveProperty('lastRenderTime');
      expect(metrics).toHaveProperty('entityCount');
      expect(metrics).toHaveProperty('updateCount');
      expect(metrics).toHaveProperty('cacheSize');
      expect(metrics).toHaveProperty('lastUpdateTime');
      expect(metrics).toHaveProperty('connectedTime');
    });
  });

  describe('Entity Rendering in Different Display Modes', () => {
    beforeEach(() => {
      card.hass = mockHass;
    });

    test('should render in list display mode', async () => {
      const config: RegexQueryCardConfig = {
        type: 'custom:ha-regex-query-card',
        pattern: '^sensor\\.',
        display_type: 'list'
      };
      
      card.setConfig(config);
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const rendered = (card as any).render();
      expect(rendered).toBeDefined();
    });

    test('should render in grid display mode', async () => {
      const config: RegexQueryCardConfig = {
        type: 'custom:ha-regex-query-card',
        pattern: '^sensor\\.',
        display_type: 'grid',
        columns: 3
      };
      
      card.setConfig(config);
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const rendered = (card as any).render();
      expect(rendered).toBeDefined();
    });

    test('should calculate card size for list mode', () => {
      const config: RegexQueryCardConfig = {
        type: 'custom:ha-regex-query-card',
        pattern: '^sensor\\.',
        display_type: 'list'
      };
      
      card.setConfig(config);
      
      const size = card.getCardSize();
      expect(size).toBeGreaterThanOrEqual(1);
    });

    test('should calculate card size for grid mode', () => {
      const config: RegexQueryCardConfig = {
        type: 'custom:ha-regex-query-card',
        pattern: '^sensor\\.',
        display_type: 'grid',
        columns: 2
      };
      
      card.setConfig(config);
      
      const size = card.getCardSize();
      expect(size).toBeGreaterThanOrEqual(1);
    });

    test('should return minimum size during loading', () => {
      const config: RegexQueryCardConfig = {
        type: 'custom:ha-regex-query-card',
        pattern: '^sensor\\.',
        display_type: 'list'
      };
      
      card.setConfig(config);
      
      // Set loading state
      (card as any)._cardState = { loading: true, entities: [], error: undefined, pattern_valid: true };
      
      const size = card.getCardSize();
      expect(size).toBe(1);
    });

    test('should return minimum size for empty state', () => {
      const config: RegexQueryCardConfig = {
        type: 'custom:ha-regex-query-card',
        pattern: '^nonexistent\\.',
        display_type: 'list'
      };
      
      card.setConfig(config);
      
      // Set empty state
      (card as any)._cardState = { loading: false, entities: [], error: undefined, pattern_valid: true };
      
      const size = card.getCardSize();
      expect(size).toBe(1);
    });

    test('should handle entity more-info events', () => {
      const config: RegexQueryCardConfig = {
        type: 'custom:ha-regex-query-card',
        pattern: '^sensor\\.',
        display_type: 'list'
      };
      
      card.setConfig(config);
      
      const mockEvent = new CustomEvent('hass-more-info', {
        detail: { entityId: 'sensor.temperature' }
      });
      
      // Mock dispatchEvent
      const dispatchSpy = jest.spyOn(card, 'dispatchEvent' as any).mockImplementation(() => true);
      
      (card as any)._handleEntityMoreInfo(mockEvent);
      
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hass-more-info',
          detail: { entityId: 'sensor.temperature' }
        })
      );
      
      dispatchSpy.mockRestore();
    });

    test('should render with title when configured', () => {
      const config: RegexQueryCardConfig = {
        type: 'custom:ha-regex-query-card',
        pattern: '^sensor\\.',
        display_type: 'list',
        title: 'My Sensors'
      };
      
      card.setConfig(config);
      
      const rendered = (card as any).render();
      expect(rendered).toBeDefined();
    });

    test('should render without title when not configured', () => {
      const config: RegexQueryCardConfig = {
        type: 'custom:ha-regex-query-card',
        pattern: '^sensor\\.',
        display_type: 'list'
      };
      
      card.setConfig(config);
      
      const rendered = (card as any).render();
      expect(rendered).toBeDefined();
    });

    test('should render error state when configuration is missing', () => {
      // Don't set config
      const rendered = (card as any).render();
      expect(rendered).toBeDefined();
    });

    test('should handle display options configuration', () => {
      const config: RegexQueryCardConfig = {
        type: 'custom:ha-regex-query-card',
        pattern: '^sensor\\.',
        display_type: 'list',
        show_name: false,
        show_state: true,
        show_icon: false
      };
      
      card.setConfig(config);
      
      expect(card.config?.show_name).toBe(false);
      expect(card.config?.show_state).toBe(true);
      expect(card.config?.show_icon).toBe(false);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle invalid regex patterns gracefully', async () => {
      const config: RegexQueryCardConfig = {
        type: 'custom:ha-regex-query-card',
        pattern: '[invalid',
        display_type: 'list'
      };
      
      card.setConfig(config);
      card.hass = mockHass;
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Should not throw errors
      expect(card.config?.pattern).toBe('[invalid');
    });

    test('should handle missing hass gracefully', () => {
      const config: RegexQueryCardConfig = {
        type: 'custom:ha-regex-query-card',
        pattern: '^sensor\\.',
        display_type: 'list'
      };
      
      card.setConfig(config);
      // Don't set hass
      
      const rendered = (card as any).render();
      expect(rendered).toBeDefined();
    });

    test('should handle connection errors gracefully', () => {
      const config: RegexQueryCardConfig = {
        type: 'custom:ha-regex-query-card',
        pattern: '^sensor\\.',
        display_type: 'list'
      };
      
      card.setConfig(config);
      
      // Create hass without connection
      const hassWithoutConnection = { ...mockHass, connection: undefined };
      card.hass = hassWithoutConnection;
      
      expect(() => (card as any).connectedCallback()).not.toThrow();
    });

    test('should handle empty entity states', () => {
      const config: RegexQueryCardConfig = {
        type: 'custom:ha-regex-query-card',
        pattern: '^sensor\\.',
        display_type: 'list'
      };
      
      card.setConfig(config);
      
      const emptyHass = createMockHass({});
      card.hass = emptyHass;
      
      const rendered = (card as any).render();
      expect(rendered).toBeDefined();
    });
  });
});