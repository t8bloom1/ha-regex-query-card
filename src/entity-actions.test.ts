import { EntityActionHandler } from './entity-actions.js';
import { HomeAssistant, HassEntity, EntityMatch } from './types.js';

// Mock Home Assistant instance
const createMockHass = (): HomeAssistant => ({
  states: {},
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

const createEntityMatch = (entityId: string, state: string = 'on', attributes: any = {}): EntityMatch => {
  const entity = createMockEntity(entityId, state, attributes);
  return {
    entity_id: entityId,
    entity,
    display_name: entity.attributes.friendly_name || entityId,
    sort_value: entityId
  };
};

describe('EntityActionHandler', () => {
  let handler: EntityActionHandler;
  let mockHass: HomeAssistant;

  beforeEach(() => {
    mockHass = createMockHass();
    handler = new EntityActionHandler(mockHass);
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock document.dispatchEvent for more-info events
    jest.spyOn(document, 'dispatchEvent').mockImplementation(() => true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Entity Interactability Checks', () => {
    test('should identify interactable light entity', () => {
      const entity = createMockEntity('light.living_room', 'on');
      expect(handler.isEntityInteractable(entity)).toBe(true);
    });

    test('should identify interactable switch entity', () => {
      const entity = createMockEntity('switch.kitchen', 'off');
      expect(handler.isEntityInteractable(entity)).toBe(true);
    });

    test('should identify non-interactable sensor entity', () => {
      const entity = createMockEntity('sensor.temperature', '22.5');
      expect(handler.isEntityInteractable(entity)).toBe(false);
    });

    test('should identify unavailable entity as non-interactable', () => {
      const entity = createMockEntity('light.bedroom', 'unavailable');
      expect(handler.isEntityInteractable(entity)).toBe(false);
    });

    test('should identify unknown state entity as non-interactable', () => {
      const entity = createMockEntity('switch.garage', 'unknown');
      expect(handler.isEntityInteractable(entity)).toBe(false);
    });

    test('should identify assumed_state entity as non-interactable', () => {
      const entity = createMockEntity('light.assumed', 'on', { assumed_state: true });
      expect(handler.isEntityInteractable(entity)).toBe(false);
    });

    test('should identify disabled entity as non-interactable', () => {
      const entity = createMockEntity('switch.disabled', 'on', { disabled: true });
      expect(handler.isEntityInteractable(entity)).toBe(false);
    });

    test('should identify read-only domains as non-interactable', () => {
      const readOnlyDomains = ['sensor', 'binary_sensor', 'device_tracker', 'person', 'zone', 'weather', 'sun', 'calendar', 'camera'];
      
      readOnlyDomains.forEach(domain => {
        const entity = createMockEntity(`${domain}.test`, 'on');
        expect(handler.isEntityInteractable(entity)).toBe(false);
      });
    });
  });

  describe('Toggle Support Checks', () => {
    test('should support toggle for light entities', () => {
      const entity = createMockEntity('light.living_room', 'on');
      expect(handler.supportsToggle(entity)).toBe(true);
    });

    test('should support toggle for switch entities', () => {
      const entity = createMockEntity('switch.kitchen', 'off');
      expect(handler.supportsToggle(entity)).toBe(true);
    });

    test('should support toggle for cover entities', () => {
      const entity = createMockEntity('cover.garage', 'closed');
      expect(handler.supportsToggle(entity)).toBe(true);
    });

    test('should not support toggle for sensor entities', () => {
      const entity = createMockEntity('sensor.temperature', '22.5');
      expect(handler.supportsToggle(entity)).toBe(false);
    });

    test('should not support toggle for unavailable entities', () => {
      const entity = createMockEntity('light.bedroom', 'unavailable');
      expect(handler.supportsToggle(entity)).toBe(false);
    });
  });

  describe('Entity Click Handling', () => {
    beforeEach(() => {
      // Add entities to hass.states for service calls
      mockHass.states = {
        'light.living_room': createMockEntity('light.living_room', 'on'),
        'switch.kitchen': createMockEntity('switch.kitchen', 'off'),
        'cover.garage': createMockEntity('cover.garage', 'closed'),
        'lock.front_door': createMockEntity('lock.front_door', 'locked'),
        'media_player.tv': createMockEntity('media_player.tv', 'playing'),
        'automation.test': createMockEntity('automation.test', 'on'),
        'script.test': createMockEntity('script.test', 'off'),
        'scene.evening': createMockEntity('scene.evening', 'scening'),
        'sensor.temperature': createMockEntity('sensor.temperature', '22.5')
      };
    });

    test('should toggle light entity when clicked', async () => {
      const entityMatch = createEntityMatch('light.living_room', 'on');
      
      await handler.handleEntityClick(entityMatch);
      
      expect(mockHass.callService).toHaveBeenCalledWith('light', 'turn_off', {
        entity_id: 'light.living_room'
      });
    });

    test('should toggle switch entity when clicked', async () => {
      const entityMatch = createEntityMatch('switch.kitchen', 'off');
      
      await handler.handleEntityClick(entityMatch);
      
      expect(mockHass.callService).toHaveBeenCalledWith('switch', 'turn_on', {
        entity_id: 'switch.kitchen'
      });
    });

    test('should handle cover entity click', async () => {
      const entityMatch = createEntityMatch('cover.garage', 'closed');
      
      await handler.handleEntityClick(entityMatch);
      
      expect(mockHass.callService).toHaveBeenCalledWith('cover', 'open_cover', {
        entity_id: 'cover.garage'
      });
    });

    test('should handle lock entity click', async () => {
      const entityMatch = createEntityMatch('lock.front_door', 'locked');
      
      await handler.handleEntityClick(entityMatch);
      
      expect(mockHass.callService).toHaveBeenCalledWith('lock', 'unlock', {
        entity_id: 'lock.front_door'
      });
    });

    test('should handle media player entity click', async () => {
      const entityMatch = createEntityMatch('media_player.tv', 'playing');
      
      await handler.handleEntityClick(entityMatch);
      
      expect(mockHass.callService).toHaveBeenCalledWith('media_player', 'media_pause', {
        entity_id: 'media_player.tv'
      });
    });

    test('should trigger automation when clicked', async () => {
      const entityMatch = createEntityMatch('automation.test', 'on');
      
      await handler.handleEntityClick(entityMatch);
      
      expect(mockHass.callService).toHaveBeenCalledWith('automation', 'trigger', {
        entity_id: 'automation.test'
      });
    });

    test('should run script when clicked', async () => {
      const entityMatch = createEntityMatch('script.test', 'off');
      
      await handler.handleEntityClick(entityMatch);
      
      expect(mockHass.callService).toHaveBeenCalledWith('script', 'turn_on', {
        entity_id: 'script.test'
      });
    });

    test('should activate scene when clicked', async () => {
      const entityMatch = createEntityMatch('scene.evening', 'scening');
      
      await handler.handleEntityClick(entityMatch);
      
      expect(mockHass.callService).toHaveBeenCalledWith('scene', 'turn_on', {
        entity_id: 'scene.evening'
      });
    });

    test('should show more-info for sensor entities', async () => {
      const entityMatch = createEntityMatch('sensor.temperature', '22.5');
      
      await handler.handleEntityClick(entityMatch);
      
      expect(document.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hass-more-info',
          detail: { entityId: 'sensor.temperature' }
        })
      );
      expect(mockHass.callService).not.toHaveBeenCalled();
    });

    test('should show more-info for non-interactable entities', async () => {
      const entityMatch = createEntityMatch('light.unavailable', 'unavailable');
      
      await handler.handleEntityClick(entityMatch);
      
      expect(document.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hass-more-info',
          detail: { entityId: 'light.unavailable' }
        })
      );
      expect(mockHass.callService).not.toHaveBeenCalled();
    });

    test('should handle service call errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (mockHass.callService as jest.Mock).mockRejectedValue(new Error('Service call failed'));
      
      const entityMatch = createEntityMatch('light.living_room', 'on');
      
      await handler.handleEntityClick(entityMatch);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error handling entity action for light.living_room:',
        expect.any(Error)
      );
      expect(document.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hass-more-info',
          detail: { entityId: 'light.living_room' }
        })
      );
      
      consoleSpy.mockRestore();
    });

    test('should handle missing hass gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      handler.updateHass(undefined as any);
      
      const entityMatch = createEntityMatch('light.living_room', 'on');
      
      await handler.handleEntityClick(entityMatch);
      
      expect(consoleSpy).toHaveBeenCalledWith('Home Assistant instance not available');
      expect(mockHass.callService).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Action Descriptions', () => {
    test('should provide correct action description for light entities', () => {
      const onLight = createMockEntity('light.living_room', 'on');
      const offLight = createMockEntity('light.living_room', 'off');
      
      expect(handler.getEntityActionDescription(onLight)).toBe('Turn off');
      expect(handler.getEntityActionDescription(offLight)).toBe('Turn on');
    });

    test('should provide correct action description for cover entities', () => {
      const openCover = createMockEntity('cover.garage', 'open');
      const closedCover = createMockEntity('cover.garage', 'closed');
      const openingCover = createMockEntity('cover.garage', 'opening');
      
      expect(handler.getEntityActionDescription(openCover)).toBe('Close');
      expect(handler.getEntityActionDescription(closedCover)).toBe('Open');
      expect(handler.getEntityActionDescription(openingCover)).toBe('Stop');
    });

    test('should provide correct action description for lock entities', () => {
      const lockedLock = createMockEntity('lock.front_door', 'locked');
      const unlockedLock = createMockEntity('lock.front_door', 'unlocked');
      
      expect(handler.getEntityActionDescription(lockedLock)).toBe('Unlock');
      expect(handler.getEntityActionDescription(unlockedLock)).toBe('Lock');
    });

    test('should provide correct action description for media player entities', () => {
      const playingPlayer = createMockEntity('media_player.tv', 'playing');
      const pausedPlayer = createMockEntity('media_player.tv', 'paused');
      const offPlayer = createMockEntity('media_player.tv', 'off');
      const idlePlayer = createMockEntity('media_player.tv', 'idle');
      
      expect(handler.getEntityActionDescription(playingPlayer)).toBe('Pause');
      expect(handler.getEntityActionDescription(pausedPlayer)).toBe('Play');
      expect(handler.getEntityActionDescription(offPlayer)).toBe('Turn on');
      expect(handler.getEntityActionDescription(idlePlayer)).toBe('View details');
    });

    test('should provide correct action description for automation and script entities', () => {
      const automation = createMockEntity('automation.test', 'on');
      const script = createMockEntity('script.test', 'off');
      
      expect(handler.getEntityActionDescription(automation)).toBe('Trigger');
      expect(handler.getEntityActionDescription(script)).toBe('Run');
    });

    test('should provide correct action description for scene entities', () => {
      const scene = createMockEntity('scene.evening', 'scening');
      
      expect(handler.getEntityActionDescription(scene)).toBe('Activate');
    });

    test('should provide view details for non-interactable entities', () => {
      const sensor = createMockEntity('sensor.temperature', '22.5');
      const unavailableLight = createMockEntity('light.bedroom', 'unavailable');
      
      expect(handler.getEntityActionDescription(sensor)).toBe('View details');
      expect(handler.getEntityActionDescription(unavailableLight)).toBe('View details');
    });
  });

  describe('Entity State Classes', () => {
    test('should return correct state class for active entities', () => {
      const activeStates = ['on', 'open', 'unlocked', 'playing', 'home', 'active'];
      
      activeStates.forEach(state => {
        const entity = createMockEntity('test.entity', state);
        expect(handler.getEntityStateClass(entity)).toBe('active');
      });
    });

    test('should return correct state class for inactive entities', () => {
      const inactiveStates = ['off', 'closed', 'locked', 'paused', 'not_home', 'idle'];
      
      inactiveStates.forEach(state => {
        const entity = createMockEntity('test.entity', state);
        expect(handler.getEntityStateClass(entity)).toBe('inactive');
      });
    });

    test('should return correct state class for unavailable entities', () => {
      const entity = createMockEntity('test.entity', 'unavailable');
      expect(handler.getEntityStateClass(entity)).toBe('unavailable');
    });

    test('should return correct state class for unknown entities', () => {
      const entity = createMockEntity('test.entity', 'unknown');
      expect(handler.getEntityStateClass(entity)).toBe('unknown');
    });

    test('should return transitioning class for cover entities', () => {
      const openingCover = createMockEntity('cover.garage', 'opening');
      const closingCover = createMockEntity('cover.garage', 'closing');
      
      expect(handler.getEntityStateClass(openingCover)).toBe('transitioning');
      expect(handler.getEntityStateClass(closingCover)).toBe('transitioning');
    });

    test('should return standby class for media player standby state', () => {
      const standbyPlayer = createMockEntity('media_player.tv', 'standby');
      
      expect(handler.getEntityStateClass(standbyPlayer)).toBe('standby');
    });

    test('should return default class for other states', () => {
      const entity = createMockEntity('test.entity', 'custom_state');
      expect(handler.getEntityStateClass(entity)).toBe('default');
    });
  });

  describe('More Info Dialog', () => {
    test('should dispatch more-info event correctly', () => {
      handler.showMoreInfo('sensor.temperature');
      
      expect(document.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hass-more-info',
          detail: { entityId: 'sensor.temperature' },
          bubbles: true,
          composed: true
        })
      );
    });
  });

  describe('Hass Instance Updates', () => {
    test('should update hass instance correctly', () => {
      const newHass = createMockHass();
      handler.updateHass(newHass);
      
      // Verify the handler uses the new hass instance
      expect((handler as any).hass).toBe(newHass);
    });
  });

  describe('Complex Entity State Handling', () => {
    test('should handle cover in opening state', async () => {
      const entityMatch = createEntityMatch('cover.garage', 'opening');
      mockHass.states['cover.garage'] = entityMatch.entity;
      
      await handler.handleEntityClick(entityMatch);
      
      expect(mockHass.callService).toHaveBeenCalledWith('cover', 'stop_cover', {
        entity_id: 'cover.garage'
      });
    });

    test('should handle cover in closing state', async () => {
      const entityMatch = createEntityMatch('cover.garage', 'closing');
      mockHass.states['cover.garage'] = entityMatch.entity;
      
      await handler.handleEntityClick(entityMatch);
      
      expect(mockHass.callService).toHaveBeenCalledWith('cover', 'stop_cover', {
        entity_id: 'cover.garage'
      });
    });

    test('should handle media player in off state', async () => {
      const entityMatch = createEntityMatch('media_player.tv', 'off');
      mockHass.states['media_player.tv'] = entityMatch.entity;
      
      await handler.handleEntityClick(entityMatch);
      
      expect(mockHass.callService).toHaveBeenCalledWith('media_player', 'turn_on', {
        entity_id: 'media_player.tv'
      });
    });

    test('should handle media player in paused state', async () => {
      const entityMatch = createEntityMatch('media_player.tv', 'paused');
      mockHass.states['media_player.tv'] = entityMatch.entity;
      
      await handler.handleEntityClick(entityMatch);
      
      expect(mockHass.callService).toHaveBeenCalledWith('media_player', 'media_play', {
        entity_id: 'media_player.tv'
      });
    });

    test('should show more-info for media player in unknown state', async () => {
      const entityMatch = createEntityMatch('media_player.tv', 'buffering');
      mockHass.states['media_player.tv'] = entityMatch.entity;
      
      await handler.handleEntityClick(entityMatch);
      
      expect(document.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hass-more-info',
          detail: { entityId: 'media_player.tv' }
        })
      );
      expect(mockHass.callService).not.toHaveBeenCalled();
    });

    test('should show more-info for climate entities', async () => {
      const entityMatch = createEntityMatch('climate.thermostat', 'heat');
      mockHass.states['climate.thermostat'] = entityMatch.entity;
      
      await handler.handleEntityClick(entityMatch);
      
      expect(document.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hass-more-info',
          detail: { entityId: 'climate.thermostat' }
        })
      );
      expect(mockHass.callService).not.toHaveBeenCalled();
    });
  });
});