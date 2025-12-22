import { HaRegexQueryCardEditor } from './editor';
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
    dispatchEvent() { return true; }
  },
  html: (strings: TemplateStringsArray, ...values: any[]) => ({ strings, values }),
  css: (strings: TemplateStringsArray, ...values: any[]) => ({ strings, values })
}));

jest.mock('lit/decorators.js', () => ({
  customElement: () => (target: any) => target,
  property: () => (target: any, key: string) => {},
  state: () => (target: any, key: string) => {}
}));

// Mock Home Assistant instance
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

describe('HaRegexQueryCardEditor', () => {
  let editor: HaRegexQueryCardEditor;
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
      'binary_sensor.motion': createMockEntity('binary_sensor.motion', 'on')
    };

    mockHass = createMockHass(testEntities);
    editor = new HaRegexQueryCardEditor();
    editor.hass = mockHass;
  });

  describe('Configuration Management', () => {
    test('should initialize with default configuration', () => {
      const defaultConfig: RegexQueryCardConfig = {
        type: 'custom:ha-regex-query-card',
        pattern: '^sensor\\.',
        display_type: 'list'
      };

      editor.setConfig(defaultConfig);

      expect(editor.config).toEqual({
        type: 'custom:ha-regex-query-card',
        pattern: '^sensor\\.',
        display_type: 'list',
        columns: 3,
        sort_by: 'name',
        sort_order: 'asc',
        show_name: true,
        show_state: true,
        show_icon: true
      });
    });

    test('should preserve existing configuration values', () => {
      const customConfig: RegexQueryCardConfig = {
        type: 'custom:ha-regex-query-card',
        pattern: '^light\\.',
        display_type: 'grid',
        columns: 4,
        sort_by: 'state',
        sort_order: 'desc',
        show_name: false,
        title: 'My Lights',
        max_entities: 20
      };

      editor.setConfig(customConfig);

      expect(editor.config).toEqual({
        ...customConfig,
        show_state: true, // Default value
        show_icon: true   // Default value
      });
    });

    test('should dispatch config-changed event when configuration updates', () => {
      const mockDispatchEvent = jest.spyOn(editor, 'dispatchEvent' as any);
      
      editor.setConfig({
        type: 'custom:ha-regex-query-card',
        pattern: '^sensor\\.',
        display_type: 'list'
      });

      // Simulate pattern change
      const patternInput = { target: { value: '^light\\.' } } as any;
      (editor as any)._handlePatternChange(patternInput);

      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'config-changed',
          detail: expect.objectContaining({
            config: expect.objectContaining({
              pattern: '^light\\.'
            })
          })
        })
      );
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      editor.setConfig({
        type: 'custom:ha-regex-query-card',
        pattern: '',
        display_type: 'list'
      });
    });

    test('should validate required pattern field', () => {
      // Pattern validation should be triggered on setConfig
      expect((editor as any)._patternError).toEqual({
        type: 'pattern',
        message: 'Pattern is required',
        details: 'Please enter a valid regular expression pattern'
      });
    });

    test('should validate regex pattern syntax', () => {
      const invalidPatternInput = { target: { value: '[invalid' } } as any;
      (editor as any)._handlePatternChange(invalidPatternInput);

      expect((editor as any)._patternError).toBeDefined();
      expect((editor as any)._patternError.type).toBe('pattern');
    });

    test('should clear validation errors for valid patterns', () => {
      const validPatternInput = { target: { value: '^sensor\\.' } } as any;
      (editor as any)._handlePatternChange(validPatternInput);

      expect((editor as any)._patternError).toBeUndefined();
    });

    test('should validate max_entities range', () => {
      // Test valid range
      const validInput = { target: { value: '50' } } as any;
      (editor as any)._handleMaxEntitiesChange(validInput);
      expect(editor.config?.max_entities).toBe(50);

      // Test invalid range (too low)
      const tooLowInput = { target: { value: '0' } } as any;
      (editor as any)._handleMaxEntitiesChange(tooLowInput);
      expect(editor.config?.max_entities).toBe(50); // Should not change

      // Test invalid range (too high)
      const tooHighInput = { target: { value: '2000' } } as any;
      (editor as any)._handleMaxEntitiesChange(tooHighInput);
      expect(editor.config?.max_entities).toBe(50); // Should not change
    });
  });

  describe('Form Input Handling', () => {
    beforeEach(() => {
      editor.setConfig({
        type: 'custom:ha-regex-query-card',
        pattern: '^sensor\\.',
        display_type: 'list'
      });
    });

    test('should handle title changes', () => {
      const titleInput = { target: { value: 'My Custom Title' } } as any;
      (editor as any)._handleTitleChange(titleInput);

      expect(editor.config?.title).toBe('My Custom Title');
    });

    test('should handle empty title as undefined', () => {
      const emptyTitleInput = { target: { value: '' } } as any;
      (editor as any)._handleTitleChange(emptyTitleInput);

      expect(editor.config?.title).toBeUndefined();
    });

    test('should handle display type changes', () => {
      const gridInput = { target: { value: 'grid' } } as any;
      (editor as any)._handleDisplayTypeChange(gridInput);

      expect(editor.config?.display_type).toBe('grid');
    });

    test('should handle columns changes', () => {
      const columnsInput = { target: { value: '4' } } as any;
      (editor as any)._handleColumnsChange(columnsInput);

      expect(editor.config?.columns).toBe(4);
    });

    test('should handle show options toggles', () => {
      // Test show_icon toggle
      const showIconInput = { target: { checked: false } } as any;
      (editor as any)._handleShowIconChange(showIconInput);
      expect(editor.config?.show_icon).toBe(false);

      // Test show_name toggle
      const showNameInput = { target: { checked: false } } as any;
      (editor as any)._handleShowNameChange(showNameInput);
      expect(editor.config?.show_name).toBe(false);

      // Test show_state toggle
      const showStateInput = { target: { checked: false } } as any;
      (editor as any)._handleShowStateChange(showStateInput);
      expect(editor.config?.show_state).toBe(false);
    });

    test('should handle sorting option changes', () => {
      // Test sort_by change
      const sortByInput = { target: { value: 'state' } } as any;
      (editor as any)._handleSortByChange(sortByInput);
      expect(editor.config?.sort_by).toBe('state');

      // Test sort_order change
      const sortOrderInput = { target: { value: 'desc' } } as any;
      (editor as any)._handleSortOrderChange(sortOrderInput);
      expect(editor.config?.sort_order).toBe('desc');
    });

    test('should handle exclude pattern changes', () => {
      const excludeInput = { target: { value: '.*_battery$' } } as any;
      (editor as any)._handleExcludePatternChange(excludeInput);

      expect(editor.config?.exclude_pattern).toBe('.*_battery$');
    });

    test('should handle empty exclude pattern as undefined', () => {
      const emptyExcludeInput = { target: { value: '' } } as any;
      (editor as any)._handleExcludePatternChange(emptyExcludeInput);

      expect(editor.config?.exclude_pattern).toBeUndefined();
    });
  });

  describe('Pattern Examples', () => {
    beforeEach(() => {
      editor.setConfig({
        type: 'custom:ha-regex-query-card',
        pattern: '',
        display_type: 'list'
      });
    });

    test('should use example patterns when clicked', () => {
      const examplePattern = '^sensor\\.';
      (editor as any)._useExamplePattern(examplePattern);

      expect(editor.config?.pattern).toBe(examplePattern);
      expect((editor as any)._patternError).toBeUndefined();
    });

    test('should trigger preview update when using example pattern', () => {
      const schedulePreviewSpy = jest.spyOn(editor as any, '_schedulePreviewUpdate');
      
      const examplePattern = '^light\\.';
      (editor as any)._useExamplePattern(examplePattern);

      expect(schedulePreviewSpy).toHaveBeenCalled();
    });
  });

  describe('Real-time Preview', () => {
    beforeEach(() => {
      editor.setConfig({
        type: 'custom:ha-regex-query-card',
        pattern: '^sensor\\.',
        display_type: 'list'
      });
    });

    test('should toggle preview visibility', () => {
      expect((editor as any)._showPreview).toBe(false);
      
      (editor as any)._togglePreview();
      expect((editor as any)._showPreview).toBe(true);
      
      (editor as any)._togglePreview();
      expect((editor as any)._showPreview).toBe(false);
    });

    test('should update preview when toggled on with valid pattern', () => {
      const updatePreviewSpy = jest.spyOn(editor as any, '_updatePreview');
      
      (editor as any)._togglePreview();
      
      expect(updatePreviewSpy).toHaveBeenCalled();
    });

    test('should schedule preview updates with debouncing', () => {
      jest.useFakeTimers();
      
      const updatePreviewSpy = jest.spyOn(editor as any, '_updatePreview');
      
      // Trigger multiple rapid updates
      (editor as any)._schedulePreviewUpdate();
      (editor as any)._schedulePreviewUpdate();
      (editor as any)._schedulePreviewUpdate();
      
      // Should not have called update yet
      expect(updatePreviewSpy).not.toHaveBeenCalled();
      
      // Fast-forward time
      jest.advanceTimersByTime(500);
      
      // Should have called update only once
      expect(updatePreviewSpy).toHaveBeenCalledTimes(1);
      
      jest.useRealTimers();
    });

    test('should handle preview update errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock entity matcher to throw error
      (editor as any)._entityMatcher = {
        testPatterns: jest.fn().mockRejectedValue(new Error('Test error'))
      };
      
      await (editor as any)._updatePreview();
      
      expect((editor as any)._previewEntities).toEqual([]);
      expect((editor as any)._totalMatches).toBe(0);
      expect((editor as any)._previewLoading).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Error updating preview:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    test('should clear preview for invalid patterns', async () => {
      // Set invalid pattern
      (editor as any)._patternError = { type: 'pattern', message: 'Invalid pattern' };
      
      await (editor as any)._updatePreview();
      
      expect((editor as any)._previewEntities).toEqual([]);
      expect((editor as any)._totalMatches).toBe(0);
    });
  });

  describe('Entity Icon and State Helpers', () => {
    test('should get correct entity icons', () => {
      // Test custom icon
      expect((editor as any)._getEntityIcon('sensor.temperature')).toBe('mdi:eye');
      
      // Test domain-based icon
      expect((editor as any)._getEntityIcon('light.living_room')).toBe('mdi:lightbulb');
      
      // Test unknown entity
      expect((editor as any)._getEntityIcon('unknown.entity')).toBe('mdi:help-circle');
    });

    test('should format entity states correctly', () => {
      // Test numeric state with unit
      expect((editor as any)._getEntityState('sensor.temperature')).toBe('22.5 °C');
      
      // Test simple state
      expect((editor as any)._getEntityState('light.living_room')).toBe('On');
      
      // Test unknown entity
      expect((editor as any)._getEntityState('unknown.entity')).toBe('Unknown');
    });

    test('should handle entities with custom icons', () => {
      // Add entity with custom icon
      mockHass.states['sensor.custom'] = createMockEntity('sensor.custom', '100', { 
        icon: 'mdi:custom-icon' 
      });
      
      expect((editor as any)._getEntityIcon('sensor.custom')).toBe('mdi:custom-icon');
    });
  });

  describe('Advanced Options', () => {
    test('should toggle advanced options visibility', () => {
      expect((editor as any)._showAdvanced).toBe(false);
      
      (editor as any)._toggleAdvanced();
      expect((editor as any)._showAdvanced).toBe(true);
      
      (editor as any)._toggleAdvanced();
      expect((editor as any)._showAdvanced).toBe(false);
    });
  });

  describe('Configuration Persistence', () => {
    test('should maintain configuration state across updates', () => {
      const initialConfig: RegexQueryCardConfig = {
        type: 'custom:ha-regex-query-card',
        pattern: '^sensor\\.',
        display_type: 'grid',
        columns: 4,
        title: 'Test Title'
      };

      editor.setConfig(initialConfig);

      // Make a change
      const patternInput = { target: { value: '^light\\.' } } as any;
      (editor as any)._handlePatternChange(patternInput);

      // Verify other settings are preserved
      expect(editor.config?.display_type).toBe('grid');
      expect(editor.config?.columns).toBe(4);
      expect(editor.config?.title).toBe('Test Title');
      expect(editor.config?.pattern).toBe('^light\\.');
    });
  });

  describe('Rendering', () => {
    test('should render loading state when hass is not available', () => {
      editor.hass = undefined;
      const result = editor.render();
      
      expect(result).toBeDefined();
      // In a real test environment, we would check the rendered content
    });

    test('should render configuration form when hass is available', () => {
      editor.setConfig({
        type: 'custom:ha-regex-query-card',
        pattern: '^sensor\\.',
        display_type: 'list'
      });
      
      const result = editor.render();
      
      expect(result).toBeDefined();
      // In a real test environment, we would check for form elements
    });
  });
});