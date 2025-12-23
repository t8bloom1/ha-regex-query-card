import { html, css, LitElement, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { 
  HomeAssistant, 
  EntityMatch, 
  RegexQueryCardConfig,
  HassEntity 
} from './types.js';
import { EntityActionHandler } from './entity-actions.js';

/**
 * Entity renderer component for displaying matched entities in list or grid layouts
 */
@customElement('ha-regex-entity-renderer')
export class HaRegexEntityRenderer extends LitElement {
  @property({ attribute: false })
  public hass?: HomeAssistant;

  @property({ attribute: false })
  public config?: RegexQueryCardConfig;

  @property({ attribute: false })
  public entities: EntityMatch[] = [];

  @property({ type: Boolean })
  public loading = false;

  @property({ type: String })
  public error?: string;

  // Action handler for entity interactions
  private _actionHandler?: EntityActionHandler;

  // Track entities being acted upon for loading states
  @state()
  private _actingEntities: Set<string> = new Set();

  // Track hover states for enhanced feedback
  @state()
  private _hoveredEntity?: string;

  // Track focus states for accessibility
  @state()
  private _focusedEntity?: string;

  /**
   * Called when properties change
   */
  protected updated(changedProps: Map<string, unknown>): void {
    super.updated(changedProps);
    console.log('HaRegexEntityRenderer: updated called with:', {
      entityCount: this.entities.length,
      entities: this.entities.slice(0, 3).map(e => e.entity_id),
      hasHass: !!this.hass,
      hasConfig: !!this.config,
      loading: this.loading,
      error: this.error
    });

    // Initialize or update action handler when hass changes
    if (changedProps.has('hass') && this.hass) {
      if (!this._actionHandler) {
        this._actionHandler = new EntityActionHandler(this.hass);
      } else {
        this._actionHandler.updateHass(this.hass);
      }
    }
  }

  /**
   * Renders the entity display based on configuration
   */
  protected render(): TemplateResult {
    console.log('EntityRenderer: render() called with:', {
      loading: this.loading,
      error: this.error,
      entitiesLength: this.entities.length,
      hasConfig: !!this.config,
      hasHass: !!this.hass
    });

    if (this.loading) {
      return this._renderLoading();
    }

    if (this.error) {
      return this._renderError();
    }

    if (this.entities.length === 0) {
      return this._renderEmpty();
    }

    return this._renderEntities();
  }

  /**
   * Renders loading state
   */
  private _renderLoading(): TemplateResult {
    return html`
      <div class="loading">
        <ha-circular-progress active></ha-circular-progress>
        <div class="loading-text">Loading entities...</div>
      </div>
    `;
  }

  /**
   * Renders error state
   */
  private _renderError(): TemplateResult {
    return html`
      <div class="error">
        <ha-icon icon="mdi:alert-circle"></ha-icon>
        <div class="error-text">${this.error}</div>
      </div>
    `;
  }

  /**
   * Renders empty state
   */
  private _renderEmpty(): TemplateResult {
    return html`
      <div class="empty">
        <ha-icon icon="mdi:magnify"></ha-icon>
        <div class="empty-text">
          No entities match the pattern "${this.config?.pattern || ''}"
        </div>
      </div>
    `;
  }

  /**
   * Renders entities based on display mode
   */
  private _renderEntities(): TemplateResult {
    if (!this.config) return html``;

    const displayMode = this.config.display_type || 'list';
    
    if (displayMode === 'grid') {
      return this._renderGridLayout();
    } else {
      return this._renderListLayout();
    }
  }

  /**
   * Renders entities in list layout
   */
  private _renderListLayout(): TemplateResult {
    return html`
      <div class="entity-list">
        ${this.entities.map(entityMatch => 
          this._renderEntityItem(entityMatch, 'list')
        )}
      </div>
    `;
  }

  /**
   * Renders entities in grid layout with configurable columns
   */
  private _renderGridLayout(): TemplateResult {
    const columns = this.config?.columns || 3;
    
    return html`
      <div class="entity-grid" style="--columns: ${columns}">
        ${this.entities.map(entityMatch => 
          this._renderEntityItem(entityMatch, 'grid')
        )}
      </div>
    `;
  }

  /**
   * Renders a single entity item with icon, name, and state
   */
  private _renderEntityItem(entityMatch: EntityMatch, displayMode: 'list' | 'grid'): TemplateResult {
    const { entity, display_name, entity_id } = entityMatch;
    const config = this.config!;
    const isActing = this._actingEntities.has(entity_id);
    const isHovered = this._hoveredEntity === entity_id;
    const isFocused = this._focusedEntity === entity_id;
    const isInteractable = this._actionHandler?.isEntityInteractable(entity) ?? false;
    const stateClass = this._actionHandler?.getEntityStateClass(entity) ?? 'default';
    const actionDescription = this._actionHandler?.getEntityActionDescription(entity) ?? 'View details';
    const supportsToggle = this._actionHandler?.supportsToggle(entity) ?? false;

    return html`
      <div 
        class="entity-item ${displayMode} ${stateClass} ${isInteractable ? 'interactable' : 'read-only'} ${isActing ? 'acting' : ''} ${isHovered ? 'hovered' : ''} ${isFocused ? 'focused' : ''}"
        @click=${() => this._handleEntityClick(entityMatch)}
        @keydown=${(e: KeyboardEvent) => this._handleEntityKeydown(e, entityMatch)}
        @mouseenter=${() => this._handleEntityMouseEnter(entity_id)}
        @mouseleave=${() => this._handleEntityMouseLeave()}
        @focus=${() => this._handleEntityFocus(entity_id)}
        @blur=${() => this._handleEntityBlur()}
        tabindex="0"
        role="button"
        aria-label="${actionDescription} ${display_name}"
        aria-disabled=${isActing ? 'true' : 'false'}
        aria-describedby="entity-${entity_id}-description"
        title="${actionDescription}"
      >
        ${config.show_icon !== false ? html`
          <div class="entity-icon">
            ${isActing ? html`
              <div class="loading-container">
                <ha-circular-progress 
                  active 
                  size="small"
                  style="--mdc-theme-primary: ${this._getEntityIconColor(entity)}"
                ></ha-circular-progress>
              </div>
            ` : html`
              <ha-icon 
                icon=${this._getEntityIcon(entity)}
                style="color: ${this._getEntityIconColor(entity)}"
              ></ha-icon>
            `}
            
            ${supportsToggle && isInteractable && !isActing ? html`
              <div class="action-indicator">
                <ha-icon 
                  icon="mdi:gesture-tap" 
                  class="tap-indicator"
                ></ha-icon>
              </div>
            ` : ''}
          </div>
        ` : ''}
        
        <div class="entity-info">
          ${config.show_name !== false ? html`
            <div class="entity-name">${display_name}</div>
          ` : ''}
          
          ${config.show_state !== false ? html`
            <div class="entity-state">${this._formatEntityState(entity)}</div>
          ` : ''}
          
          ${isActing ? html`
            <div class="action-feedback">Processing...</div>
          ` : ''}
        </div>

        ${!isInteractable ? html`
          <div class="read-only-indicator">
            <ha-icon icon="mdi:eye" title="Read-only"></ha-icon>
          </div>
        ` : ''}

        <!-- Screen reader description -->
        <div id="entity-${entity_id}-description" class="sr-only">
          ${entity.state === 'unavailable' ? 'Entity is unavailable' : 
            entity.state === 'unknown' ? 'Entity state is unknown' :
            isInteractable ? `${actionDescription} this ${entity.entity_id.split('.')[0]}` :
            'View details for this read-only entity'}
        </div>

        <!-- Visual feedback overlay -->
        ${isActing ? html`
          <div class="action-overlay"></div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Handles entity click events with proper action handling
   */
  private async _handleEntityClick(entityMatch: EntityMatch): Promise<void> {
    if (!this.hass || !this._actionHandler) return;

    const { entity_id } = entityMatch;

    // Prevent multiple simultaneous actions on the same entity
    if (this._actingEntities.has(entity_id)) {
      return;
    }

    try {
      // Add to acting entities for visual feedback
      this._actingEntities.add(entity_id);
      this.requestUpdate();

      // Handle the entity action
      await this._actionHandler.handleEntityClick(entityMatch);

      // Dispatch success event and show visual feedback
      this._dispatchActionEvent('success', entityMatch);
      this._showActionFeedback(entity_id, 'success');

    } catch (error) {
      console.error(`Error handling entity click for ${entity_id}:`, error);
      
      // Dispatch error event and show visual feedback
      this._dispatchActionEvent('error', entityMatch, error);
      this._showActionFeedback(entity_id, 'error');
      
      // Fallback to more-info on error
      this._actionHandler.showMoreInfo(entity_id);
      
    } finally {
      // Remove from acting entities after a short delay for visual feedback
      setTimeout(() => {
        this._actingEntities.delete(entity_id);
        this.requestUpdate();
      }, 800);
    }
  }

  /**
   * Handles entity keyboard events for accessibility
   */
  private _handleEntityKeydown(event: KeyboardEvent, entityMatch: EntityMatch): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this._handleEntityClick(entityMatch);
    }
  }

  /**
   * Handles mouse enter events for hover feedback
   */
  private _handleEntityMouseEnter(entityId: string): void {
    this._hoveredEntity = entityId;
  }

  /**
   * Handles mouse leave events
   */
  private _handleEntityMouseLeave(): void {
    this._hoveredEntity = undefined;
  }

  /**
   * Handles focus events for accessibility
   */
  private _handleEntityFocus(entityId: string): void {
    this._focusedEntity = entityId;
  }

  /**
   * Handles blur events
   */
  private _handleEntityBlur(): void {
    this._focusedEntity = undefined;
  }

  /**
   * Shows visual feedback for successful or failed actions
   */
  private _showActionFeedback(entityId: string, type: 'success' | 'error'): void {
    const entityElement = this.shadowRoot?.querySelector(`[aria-describedby="entity-${entityId}-description"]`) as HTMLElement;
    
    if (entityElement) {
      const feedbackClass = `${type}-feedback`;
      entityElement.classList.add(feedbackClass);
      
      // Remove the feedback class after animation completes
      setTimeout(() => {
        entityElement.classList.remove(feedbackClass);
      }, 600);
    }
  }

  /**
   * Dispatches action events for external handling
   */
  private _dispatchActionEvent(type: 'success' | 'error', entityMatch: EntityMatch, error?: any): void {
    const event = new CustomEvent('entity-action', {
      detail: {
        type,
        entity_id: entityMatch.entity_id,
        entity: entityMatch.entity,
        error
      },
      bubbles: true,
      composed: true
    });
    
    this.dispatchEvent(event);
  }

  /**
   * Gets the appropriate icon for an entity
   */
  private _getEntityIcon(entity: HassEntity): string {
    // Use entity's custom icon if available
    if (entity.attributes?.icon) {
      return entity.attributes.icon;
    }

    // Default icons based on domain
    const domain = entity.entity_id.split('.')[0];
    const iconMap: { [key: string]: string } = {
      'light': 'mdi:lightbulb',
      'switch': 'mdi:toggle-switch',
      'sensor': 'mdi:eye',
      'binary_sensor': 'mdi:checkbox-marked-circle',
      'climate': 'mdi:thermostat',
      'fan': 'mdi:fan',
      'cover': 'mdi:window-shutter',
      'lock': 'mdi:lock',
      'media_player': 'mdi:cast',
      'camera': 'mdi:camera',
      'device_tracker': 'mdi:account',
      'person': 'mdi:account',
      'zone': 'mdi:map-marker-radius',
      'automation': 'mdi:robot',
      'script': 'mdi:script-text',
      'scene': 'mdi:palette',
      'input_boolean': 'mdi:toggle-switch',
      'input_number': 'mdi:ray-vertex',
      'input_select': 'mdi:format-list-bulleted',
      'input_text': 'mdi:textbox',
      'timer': 'mdi:timer',
      'counter': 'mdi:counter',
      'weather': 'mdi:weather-cloudy',
      'sun': 'mdi:white-balance-sunny',
      'alarm_control_panel': 'mdi:shield-home'
    };

    return iconMap[domain] || 'mdi:help-circle';
  }

  /**
   * Gets the appropriate icon color for an entity based on state
   */
  private _getEntityIconColor(entity: HassEntity): string {
    const state = entity.state.toLowerCase();
    const domain = entity.entity_id.split('.')[0];
    
    // Special handling for different domains
    switch (domain) {
      case 'light':
      case 'switch':
      case 'fan':
        return state === 'on' ? 'var(--accent-color, #03a9f4)' : 'var(--disabled-text-color, #9e9e9e)';
      
      case 'cover':
        return ['open', 'opening'].includes(state) ? 'var(--accent-color, #03a9f4)' : 'var(--disabled-text-color, #9e9e9e)';
      
      case 'lock':
        return state === 'unlocked' ? 'var(--accent-color, #03a9f4)' : 'var(--disabled-text-color, #9e9e9e)';
      
      case 'binary_sensor':
        return state === 'on' ? 'var(--accent-color, #03a9f4)' : 'var(--disabled-text-color, #9e9e9e)';
      
      case 'media_player':
        return ['playing', 'paused'].includes(state) ? 'var(--accent-color, #03a9f4)' : 'var(--disabled-text-color, #9e9e9e)';
      
      case 'device_tracker':
      case 'person':
        return state === 'home' ? 'var(--accent-color, #03a9f4)' : 'var(--disabled-text-color, #9e9e9e)';
      
      default:
        // Active states get accent color
        if (['on', 'open', 'unlocked', 'playing', 'home', 'active'].includes(state)) {
          return 'var(--accent-color, #03a9f4)';
        }
        
        // Unavailable state gets warning color
        if (state === 'unavailable') {
          return 'var(--warning-color, #ff9800)';
        }
        
        // Unknown state gets error color
        if (state === 'unknown') {
          return 'var(--error-color, #f44336)';
        }
        
        // Inactive states get muted color
        return 'var(--disabled-text-color, #9e9e9e)';
    }
  }

  /**
   * Formats entity state for display with units
   */
  private _formatEntityState(entity: HassEntity): string {
    const state = entity.state;
    const unit = entity.attributes?.unit_of_measurement;
    const deviceClass = entity.attributes?.device_class;
    
    // Handle special state formatting
    if (state === 'unavailable') {
      return 'Unavailable';
    }
    
    if (state === 'unknown') {
      return 'Unknown';
    }
    
    // Format numeric states with units
    if (unit) {
      const numericState = parseFloat(state);
      if (!isNaN(numericState)) {
        // Round to reasonable precision
        const rounded = Math.round(numericState * 100) / 100;
        return `${rounded} ${unit}`;
      }
      return `${state} ${unit}`;
    }
    
    // Format boolean-like states
    const booleanStates: { [key: string]: string } = {
      'on': 'On',
      'off': 'Off',
      'open': 'Open',
      'closed': 'Closed',
      'locked': 'Locked',
      'unlocked': 'Unlocked',
      'home': 'Home',
      'not_home': 'Away',
      'playing': 'Playing',
      'paused': 'Paused',
      'idle': 'Idle',
      'standby': 'Standby'
    };
    
    if (booleanStates[state.toLowerCase()]) {
      return booleanStates[state.toLowerCase()];
    }
    
    // Capitalize first letter for other states
    return state.charAt(0).toUpperCase() + state.slice(1).replace(/_/g, ' ');
  }

  /**
   * Component styles with responsive design
   */
  static styles = css`
    :host {
      display: block;
      width: 100%;
    }

    /* Loading state */
    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px 16px;
      color: var(--secondary-text-color);
    }

    .loading-text {
      margin-top: 16px;
      font-size: 0.9em;
    }

    /* Error state */
    .error {
      display: flex;
      align-items: center;
      padding: 16px;
      background: var(--error-color, #f44336);
      color: white;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .error ha-icon {
      margin-right: 8px;
      --mdc-icon-size: 20px;
    }

    .error-text {
      flex: 1;
      font-size: 0.9em;
    }

    /* Empty state */
    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px 16px;
      color: var(--secondary-text-color);
      text-align: center;
    }

    .empty ha-icon {
      --mdc-icon-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-text {
      font-size: 0.9em;
      line-height: 1.4;
      max-width: 300px;
    }

    /* Entity layouts */
    .entity-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .entity-grid {
      display: grid;
      grid-template-columns: repeat(var(--columns, 3), 1fr);
      gap: 12px;
    }

    /* Entity items */
    .entity-item {
      display: flex;
      align-items: center;
      padding: 12px;
      background: var(--card-background-color, var(--paper-card-background-color, white));
      border-radius: 8px;
      border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      overflow: hidden;
      min-height: 48px;
    }

    .entity-item:hover {
      background: var(--secondary-background-color, var(--paper-grey-50));
      border-color: var(--accent-color, #03a9f4);
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .entity-item:focus {
      outline: none;
      border-color: var(--accent-color, #03a9f4);
      box-shadow: 0 0 0 2px rgba(3, 169, 244, 0.2);
    }

    .entity-item:active {
      transform: translateY(0);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    }

    /* Entity state classes */
    .entity-item.active {
      border-color: var(--accent-color, #03a9f4);
    }

    .entity-item.inactive {
      opacity: 0.7;
    }

    .entity-item.unavailable {
      opacity: 0.5;
      cursor: default;
    }

    .entity-item.unavailable:hover {
      transform: none;
      box-shadow: none;
      border-color: var(--divider-color, rgba(0, 0, 0, 0.12));
    }

    .entity-item.unknown {
      border-color: var(--warning-color, #ff9800);
    }

    .entity-item.transitioning {
      border-color: var(--info-color, #2196f3);
    }

    /* Read-only entities */
    .entity-item.read-only {
      cursor: default;
    }

    .entity-item.read-only:hover {
      background: var(--secondary-background-color, var(--paper-grey-50));
      border-color: var(--divider-color, rgba(0, 0, 0, 0.12));
      transform: none;
      box-shadow: none;
    }

    /* Enhanced hover states */
    .entity-item.hovered.interactable {
      background: var(--secondary-background-color, var(--paper-grey-50));
      border-color: var(--accent-color, #03a9f4);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .entity-item.hovered.interactable .entity-icon ha-icon {
      transform: scale(1.1);
      transition: transform 0.2s ease;
    }

    .entity-item.hovered .action-indicator {
      opacity: 1;
      transform: scale(1);
    }

    /* Enhanced focus states for accessibility */
    .entity-item.focused {
      outline: none;
      border-color: var(--accent-color, #03a9f4);
      box-shadow: 0 0 0 3px rgba(3, 169, 244, 0.3);
      z-index: 1;
    }

    /* Acting state (loading) */
    .entity-item.acting {
      pointer-events: none;
      position: relative;
    }

    .entity-item.acting .entity-icon {
      position: relative;
    }

    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
    }

    .action-feedback {
      font-size: 0.75em;
      color: var(--accent-color, #03a9f4);
      font-weight: 500;
      animation: fadeInOut 2s ease-in-out;
    }

    .action-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(3, 169, 244, 0.1);
      border-radius: 8px;
      animation: shimmer 1.5s ease-in-out infinite;
    }

    @keyframes fadeInOut {
      0%, 100% { opacity: 0; }
      50% { opacity: 1; }
    }

    @keyframes shimmer {
      0%, 100% { opacity: 0.1; }
      50% { opacity: 0.3; }
    }

    /* Action indicators */
    .action-indicator {
      position: absolute;
      top: -2px;
      right: -2px;
      opacity: 0;
      transform: scale(0.8);
      transition: all 0.2s ease;
      background: var(--accent-color, #03a9f4);
      border-radius: 50%;
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .tap-indicator {
      --mdc-icon-size: 10px;
      color: white;
    }

    /* Read-only indicator */
    .read-only-indicator {
      margin-left: auto;
      opacity: 0.5;
      transition: opacity 0.2s ease;
    }

    .entity-item.hovered .read-only-indicator {
      opacity: 0.8;
    }

    .read-only-indicator ha-icon {
      --mdc-icon-size: 16px;
    }

    /* Screen reader only content */
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    /* Success/Error feedback animations */
    .entity-item.success-feedback {
      animation: successPulse 0.6s ease-out;
    }

    .entity-item.error-feedback {
      animation: errorPulse 0.6s ease-out;
    }

    @keyframes successPulse {
      0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); }
      70% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
      100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
    }

    @keyframes errorPulse {
      0% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7); }
      70% { box-shadow: 0 0 0 10px rgba(244, 67, 54, 0); }
      100% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0); }
    }

    /* Grid specific styling */
    .entity-item.grid {
      flex-direction: column;
      text-align: center;
      min-height: 80px;
      justify-content: center;
    }

    .entity-item.grid .entity-icon {
      margin-bottom: 8px;
      margin-right: 0;
    }

    .entity-item.grid .entity-info {
      width: 100%;
    }

    /* List specific styling */
    .entity-item.list .entity-icon {
      margin-right: 12px;
    }

    .entity-item.list .entity-info {
      flex: 1;
      min-width: 0;
    }

    /* Entity icon */
    .entity-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .entity-icon ha-icon {
      --mdc-icon-size: 24px;
      transition: color 0.2s ease;
    }

    /* Entity info */
    .entity-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .entity-name {
      font-weight: 500;
      color: var(--primary-text-color);
      font-size: 0.9em;
      line-height: 1.2;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .entity-state {
      color: var(--secondary-text-color);
      font-size: 0.8em;
      line-height: 1.2;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Responsive design for different screen sizes */
    @media (max-width: 768px) {
      .entity-grid {
        grid-template-columns: repeat(min(var(--columns, 3), 2), 1fr);
      }
      
      .entity-item {
        padding: 10px;
      }
      
      .entity-icon ha-icon {
        --mdc-icon-size: 20px;
      }
      
      .entity-name {
        font-size: 0.85em;
      }
      
      .entity-state {
        font-size: 0.75em;
      }
    }

    @media (max-width: 480px) {
      .entity-grid {
        grid-template-columns: repeat(min(var(--columns, 3), 1), 1fr);
      }
      
      .entity-item {
        padding: 8px;
        min-height: 44px;
      }
      
      .entity-item.grid {
        min-height: 72px;
      }
      
      .entity-icon ha-icon {
        --mdc-icon-size: 18px;
      }
    }

    /* High contrast mode support */
    @media (prefers-contrast: high) {
      .entity-item {
        border-width: 2px;
      }
      
      .entity-item:focus {
        box-shadow: 0 0 0 3px rgba(3, 169, 244, 0.5);
      }
    }

    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      .entity-item {
        transition: none;
      }
      
      .entity-item:hover {
        transform: none;
      }
      
      .entity-item:active {
        transform: none;
      }
    }

    /* Dark theme adjustments */
    @media (prefers-color-scheme: dark) {
      .entity-item {
        border-color: var(--divider-color, rgba(255, 255, 255, 0.12));
      }
      
      .entity-item:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      }
    }
  `;
}

// Register the custom element
declare global {
  interface HTMLElementTagNameMap {
    'ha-regex-entity-renderer': HaRegexEntityRenderer;
  }
}