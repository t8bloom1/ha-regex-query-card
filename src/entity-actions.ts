import { HomeAssistant, HassEntity, EntityMatch } from './types.js';

/**
 * Entity action handler for managing entity interactions
 */
export class EntityActionHandler {
  private hass: HomeAssistant;

  constructor(hass: HomeAssistant) {
    this.hass = hass;
  }

  /**
   * Updates the Home Assistant instance
   */
  public updateHass(hass: HomeAssistant): void {
    this.hass = hass;
  }

  /**
   * Handles entity click with appropriate action based on entity type
   */
  public async handleEntityClick(entityMatch: EntityMatch): Promise<void> {
    const { entity_id, entity } = entityMatch;
    
    if (!this.hass) {
      console.warn('Home Assistant instance not available');
      return;
    }

    // Check if entity is available and not read-only
    if (!this.isEntityInteractable(entity)) {
      this.showMoreInfo(entity_id);
      return;
    }

    const domain = entity_id.split('.')[0];
    
    try {
      switch (domain) {
        case 'light':
        case 'switch':
        case 'fan':
        case 'input_boolean':
          await this.toggleEntity(entity_id);
          break;
          
        case 'cover':
          await this.toggleCover(entity_id, entity);
          break;
          
        case 'lock':
          await this.toggleLock(entity_id, entity);
          break;
          
        case 'media_player':
          await this.toggleMediaPlayer(entity_id, entity);
          break;
          
        case 'climate':
          // Climate entities typically show more-info for complex controls
          this.showMoreInfo(entity_id);
          break;
          
        case 'automation':
        case 'script':
          await this.triggerAutomationOrScript(entity_id);
          break;
          
        case 'scene':
          await this.activateScene(entity_id);
          break;
          
        default:
          // For sensors and other read-only entities, show more-info
          this.showMoreInfo(entity_id);
          break;
      }
    } catch (error) {
      console.error(`Error handling entity action for ${entity_id}:`, error);
      // Fallback to more-info on error
      this.showMoreInfo(entity_id);
    }
  }

  /**
   * Checks if an entity can be interacted with (not read-only or unavailable)
   */
  public isEntityInteractable(entity: HassEntity): boolean {
    // Check if entity is available
    if (entity.state === 'unavailable' || entity.state === 'unknown') {
      return false;
    }

    // Check for read-only attributes
    if (entity.attributes?.assumed_state === true) {
      return false;
    }

    // Check domain-specific read-only conditions
    const domain = entity.entity_id.split('.')[0];
    const readOnlyDomains = [
      'sensor', 'binary_sensor', 'device_tracker', 'person', 
      'zone', 'weather', 'sun', 'calendar', 'camera'
    ];
    
    if (readOnlyDomains.includes(domain)) {
      return false;
    }

    // Check for disabled entities
    if (entity.attributes?.disabled === true) {
      return false;
    }

    return true;
  }

  /**
   * Toggles a simple on/off entity (light, switch, fan, input_boolean)
   */
  private async toggleEntity(entityId: string): Promise<void> {
    const entity = this.hass.states[entityId];
    if (!entity) return;

    const domain = entityId.split('.')[0];
    const isOn = entity.state === 'on';
    const service = isOn ? 'turn_off' : 'turn_on';

    await this.hass.callService(domain, service, {
      entity_id: entityId
    });
  }

  /**
   * Toggles a cover entity (open/close)
   */
  private async toggleCover(entityId: string, entity: HassEntity): Promise<void> {
    const state = entity.state;
    let service: string;

    if (state === 'open') {
      service = 'close_cover';
    } else if (state === 'closed') {
      service = 'open_cover';
    } else {
      // If opening or closing, stop it
      service = 'stop_cover';
    }

    await this.hass.callService('cover', service, {
      entity_id: entityId
    });
  }

  /**
   * Toggles a lock entity (lock/unlock)
   */
  private async toggleLock(entityId: string, entity: HassEntity): Promise<void> {
    const isLocked = entity.state === 'locked';
    const service = isLocked ? 'unlock' : 'lock';

    await this.hass.callService('lock', service, {
      entity_id: entityId
    });
  }

  /**
   * Toggles a media player (play/pause)
   */
  private async toggleMediaPlayer(entityId: string, entity: HassEntity): Promise<void> {
    const state = entity.state;
    let service: string;

    if (state === 'playing') {
      service = 'media_pause';
    } else if (state === 'paused') {
      service = 'media_play';
    } else if (state === 'off') {
      service = 'turn_on';
    } else {
      // For other states, show more info
      this.showMoreInfo(entityId);
      return;
    }

    await this.hass.callService('media_player', service, {
      entity_id: entityId
    });
  }

  /**
   * Triggers an automation or script
   */
  private async triggerAutomationOrScript(entityId: string): Promise<void> {
    const domain = entityId.split('.')[0];
    
    if (domain === 'automation') {
      await this.hass.callService('automation', 'trigger', {
        entity_id: entityId
      });
    } else if (domain === 'script') {
      await this.hass.callService('script', 'turn_on', {
        entity_id: entityId
      });
    }
  }

  /**
   * Activates a scene
   */
  private async activateScene(entityId: string): Promise<void> {
    await this.hass.callService('scene', 'turn_on', {
      entity_id: entityId
    });
  }

  /**
   * Shows the more-info dialog for an entity
   */
  public showMoreInfo(entityId: string): void {
    // Dispatch event to show more-info dialog
    const event = new CustomEvent('hass-more-info', {
      detail: { entityId },
      bubbles: true,
      composed: true
    });

    // The event will be caught by the Home Assistant frontend
    document.dispatchEvent(event);
  }

  /**
   * Gets the appropriate action description for an entity
   */
  public getEntityActionDescription(entity: HassEntity): string {
    if (!this.isEntityInteractable(entity)) {
      return 'View details';
    }

    const domain = entity.entity_id.split('.')[0];
    const state = entity.state;

    switch (domain) {
      case 'light':
      case 'switch':
      case 'fan':
      case 'input_boolean':
        return state === 'on' ? 'Turn off' : 'Turn on';
        
      case 'cover':
        if (state === 'open') return 'Close';
        if (state === 'closed') return 'Open';
        return 'Stop';
        
      case 'lock':
        return state === 'locked' ? 'Unlock' : 'Lock';
        
      case 'media_player':
        if (state === 'playing') return 'Pause';
        if (state === 'paused') return 'Play';
        if (state === 'off') return 'Turn on';
        return 'View details';
        
      case 'automation':
        return 'Trigger';
        
      case 'script':
        return 'Run';
        
      case 'scene':
        return 'Activate';
        
      default:
        return 'View details';
    }
  }

  /**
   * Checks if an entity supports toggle action
   */
  public supportsToggle(entity: HassEntity): boolean {
    if (!this.isEntityInteractable(entity)) {
      return false;
    }

    const domain = entity.entity_id.split('.')[0];
    const toggleDomains = [
      'light', 'switch', 'fan', 'input_boolean', 
      'cover', 'lock', 'media_player'
    ];
    
    return toggleDomains.includes(domain);
  }

  /**
   * Gets visual feedback class for entity state
   */
  public getEntityStateClass(entity: HassEntity): string {
    const state = entity.state.toLowerCase();
    const domain = entity.entity_id.split('.')[0];

    if (state === 'unavailable') return 'unavailable';
    if (state === 'unknown') return 'unknown';

    // Active states
    const activeStates = ['on', 'open', 'unlocked', 'playing', 'home', 'active'];
    if (activeStates.includes(state)) return 'active';

    // Inactive states
    const inactiveStates = ['off', 'closed', 'locked', 'paused', 'not_home', 'idle'];
    if (inactiveStates.includes(state)) return 'inactive';

    // Domain-specific states
    if (domain === 'cover' && ['opening', 'closing'].includes(state)) {
      return 'transitioning';
    }

    if (domain === 'media_player' && state === 'standby') {
      return 'standby';
    }

    return 'default';
  }
}