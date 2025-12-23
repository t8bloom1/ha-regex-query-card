import { LitElement, html, css, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { 
  HomeAssistant, 
  RegexQueryCardConfig, 
  CardState, 
  EntityMatch,
  LovelaceCard,
  RegexError
} from './types.js';
import { EntityMatcher, EntityMatchResult } from './entity-matcher.js';
import { EntitySorter } from './entity-sorter.js';
import './entity-renderer.js';

/**
 * Main card component that extends LitElement with Home Assistant card interface
 */
@customElement('ha-regex-query-card')
export class HaRegexQueryCard extends LitElement implements LovelaceCard {
  // Home Assistant instance - reactive property
  @property({ attribute: false })
  public hass?: HomeAssistant;

  // Card configuration - reactive property
  @property({ attribute: false })
  public config?: RegexQueryCardConfig;

  // Internal card state - reactive state
  @state()
  private _cardState: CardState = {
    entities: [],
    loading: false,
    error: undefined,
    pattern_valid: true
  };

  // Entity matcher instance
  private _entityMatcher?: EntityMatcher;



  // Debounce timer for entity updates
  private _updateTimer?: number;

  // Connection state tracking


  // Last known entity count for change detection
  private _lastEntityCount: number = 0;

  // State change subscription
  private _unsubscribeStateChanges?: () => void;

  // Entity state tracking for change detection
  private _entityStates: Map<string, string> = new Map();

  // Update frequency control
  private _lastUpdateTime: number = 0;
  private _minUpdateInterval: number = 1000; // Minimum 1 second between updates

  // Performance monitoring
  private _performanceMetrics = {
    lastRenderTime: 0,
    entityCount: 0,
    updateCount: 0
  };

  /**
   * Provides default configuration for card picker
   * Required by LovelaceCard interface
   */
  public static getStubConfig(): RegexQueryCardConfig {
    return {
      type: 'custom:ha-regex-query-card',
      pattern: '.*',
      title: 'All Entities (Debug)',
      display_type: 'list',
      sort_by: 'name',
      max_entities: 10
    };
  }

  /**
   * Sets the card configuration
   * Required by LovelaceCard interface
   */
  public setConfig(config: RegexQueryCardConfig): void {
    console.log('RegexQueryCard: setConfig called with:', config);
    
    if (!config) {
      throw new Error('Invalid configuration');
    }

    if (!config.pattern) {
      throw new Error('Pattern is required');
    }

    if (!config.type || config.type !== 'custom:ha-regex-query-card') {
      throw new Error('Invalid card type');
    }

    // Validate display_type
    const displayType = config.display_type || 'list';
    if (!['list', 'grid'].includes(displayType)) {
      throw new Error('display_type must be "list" or "grid"');
    }

    // Validate columns for grid display
    if (displayType === 'grid' && config.columns) {
      if (config.columns < 1 || config.columns > 6) {
        throw new Error('columns must be between 1 and 6');
      }
    }

    // Validate sort options
    if (config.sort_by && !['name', 'state', 'last_changed'].includes(config.sort_by)) {
      throw new Error('sort_by must be "name", "state", or "last_changed"');
    }

    if (config.sort_order && !['asc', 'desc'].includes(config.sort_order)) {
      throw new Error('sort_order must be "asc" or "desc"');
    }

    // Validate max_entities
    if (config.max_entities && (config.max_entities < 1 || config.max_entities > 1000)) {
      throw new Error('max_entities must be between 1 and 1000');
    }

    this.config = {
      // Set defaults
      columns: 3,
      sort_by: 'name',
      sort_order: 'asc',
      show_name: true,
      show_state: true,
      show_icon: true,
      ...config,
      display_type: config.display_type || 'list'
    };

    // Reset state when config changes
    this._cardState = {
      entities: [],
      loading: false,
      error: undefined,
      pattern_valid: true
    };

    // Trigger entity update if we have hass
    if (this.hass) {
      console.log('RegexQueryCard: Hass available, scheduling entity update');
      this._scheduleEntityUpdate();
    } else {
      console.log('RegexQueryCard: No hass available yet');
    }
  }

  /**
   * Gets the card size for layout purposes
   * Required by LovelaceCard interface
   */
  public getCardSize(): number {
    if (!this.config || this._cardState.loading) {
      return 1; // Minimum size during loading
    }

    const entityCount = this._cardState.entities.length;
    
    if (entityCount === 0) {
      return 1; // Empty state
    }

    // Calculate size based on display mode
    if (this.config.display_type === 'grid') {
      const columns = this.config.columns || 3;
      const rows = Math.ceil(entityCount / columns);
      return Math.max(1, Math.min(rows + 1, 10)); // +1 for header, max 10
    } else {
      // List mode: each entity takes about 0.5 card units
      const listSize = Math.ceil(entityCount * 0.5) + 1; // +1 for header
      return Math.max(1, Math.min(listSize, 15)); // Max 15 for very long lists
    }
  }

  /**
   * Called when the element is connected to the DOM
   */
  connectedCallback(): void {
    super.connectedCallback();
    console.log('RegexQueryCard: connectedCallback - element connected to DOM');
    
    // Initialize entity matcher if we have hass
    if (this.hass) {
      console.log('RegexQueryCard: Hass available in connectedCallback, initializing');
      this._initializeEntityMatcher();
      this._subscribeToStateChanges();
    } else {
      console.log('RegexQueryCard: No hass in connectedCallback');
    }
  }

  /**
   * Called when the element is disconnected from the DOM
   */
  disconnectedCallback(): void {
    super.disconnectedCallback();
    
    // Clear any pending timers
    if (this._updateTimer) {
      clearTimeout(this._updateTimer);
      this._updateTimer = undefined;
    }

    // Unsubscribe from state changes
    this._unsubscribeFromStateChanges();
  }

  /**
   * Called when properties change
   */
  protected updated(changedProps: PropertyValues): void {
    super.updated(changedProps);
    console.log('RegexQueryCard: updated called with changed props:', Array.from(changedProps.keys()));

    // Handle hass changes
    if (changedProps.has('hass')) {
      console.log('RegexQueryCard: Hass property changed');
      this._handleHassChange(changedProps);
    }

    // Handle config changes
    if (changedProps.has('config')) {
      console.log('RegexQueryCard: Config property changed');
      this._handleConfigChange();
    }
  }

  /**
   * Handles Home Assistant instance changes
   */
  private _handleHassChange(changedProps?: PropertyValues): void {
    const oldHass = changedProps?.get('hass') as HomeAssistant | undefined;
    
    if (!this.hass) {
      this._cardState = {
        ...this._cardState,
        loading: false,
        error: 'Home Assistant not available'
      };
      this._unsubscribeFromStateChanges();
      return;
    }

    // Initialize or update entity matcher
    if (!this._entityMatcher) {
      this._initializeEntityMatcher();
    } else {
      this._entityMatcher.updateHass(this.hass);
    }

    // Subscribe to state changes if this is a new hass instance
    if (!oldHass || oldHass !== this.hass) {
      this._subscribeToStateChanges();
    }

    // Check for entity changes
    this._checkForEntityChanges();

    // Clear connection errors
    if (this._cardState.error === 'Home Assistant not available') {
      this._cardState = {
        ...this._cardState,
        error: undefined
      };
    }
  }

  /**
   * Handles configuration changes
   */
  private _handleConfigChange(): void {
    if (this.config && this.hass) {
      this._scheduleEntityUpdate();
    }
  }

  /**
   * Initializes the entity matcher
   */
  private _initializeEntityMatcher(): void {
    if (!this.hass) return;

    this._entityMatcher = new EntityMatcher(this.hass);
    this._lastEntityCount = Object.keys(this.hass.states || {}).length;

    // Trigger initial entity update
    if (this.config) {
      this._scheduleEntityUpdate();
    }
  }

  /**
   * Schedules an entity update with debouncing
   */
  private _scheduleEntityUpdate(): void {
    if (this._updateTimer) {
      clearTimeout(this._updateTimer);
    }

    this._updateTimer = window.setTimeout(() => {
      this._updateEntities();
    }, 100); // 100ms debounce
  }

  /**
   * Updates the entity list based on current configuration
   */
  private async _updateEntities(): Promise<void> {
    console.log('RegexQueryCard: _updateEntities called');
    
    if (!this.config || !this._entityMatcher || !this.isConnected) {
      console.log('RegexQueryCard: Skipping update - missing config, matcher, or not connected', {
        hasConfig: !!this.config,
        hasMatcher: !!this._entityMatcher,
        connected: this.isConnected
      });
      return;
    }

    console.log('RegexQueryCard: Starting entity update with pattern:', this.config.pattern);

    // Throttle updates to prevent excessive re-rendering
    const now = Date.now();
    if (now - this._lastUpdateTime < this._minUpdateInterval) {
      console.log('RegexQueryCard: Throttling update');
      return;
    }
    this._lastUpdateTime = now;

    // Set loading state
    this._cardState = {
      ...this._cardState,
      loading: true,
      error: undefined
    };

    try {
      // Match entities using the configured pattern
      const matchResult: EntityMatchResult = await this._entityMatcher.matchEntities({
        pattern: this.config.pattern,
        excludePattern: this.config.exclude_pattern,
        includeUnavailable: false,
        maxResults: this.config.max_entities
      });

      console.log('RegexQueryCard: Match result:', {
        entityCount: matchResult.entities.length,
        totalCount: matchResult.totalCount,
        error: matchResult.error
      });

      if (matchResult.error) {
        this._cardState = {
          ...this._cardState,
          loading: false,
          error: matchResult.error,
          pattern_valid: false,
          entities: []
        };
        return;
      }

      // Sort the matched entities
      const sortResult = EntitySorter.sortAndLimitEntities(matchResult.entities, {
        sortBy: this.config.sort_by || 'name',
        sortOrder: this.config.sort_order || 'asc',
        maxEntities: this.config.max_entities
      });
      const sortedEntities = sortResult.entities;

      // Update performance metrics
      this._performanceMetrics = {
        lastRenderTime: matchResult.performanceMetrics.matchingTime,
        entityCount: sortedEntities.length,
        updateCount: this._performanceMetrics.updateCount + 1
      };

      // Update entity state tracking
      this._updateEntityStateTracking(sortedEntities);

      // Update state with successful results
      this._cardState = {
        entities: sortedEntities,
        loading: false,
        error: undefined,
        pattern_valid: true
      };

      console.log('RegexQueryCard: Updated card state with entities, forcing render');
      this.requestUpdate();

    } catch (error) {
      console.error('Error updating entities:', error);
      
      this._cardState = {
        ...this._cardState,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        pattern_valid: false,
        entities: []
      };
    }
  }

  /**
   * Subscribes to Home Assistant state changes
   */
  private _subscribeToStateChanges(): void {
    if (!this.hass || !this.hass.connection) {
      return;
    }

    // Unsubscribe from previous subscription
    this._unsubscribeFromStateChanges();

    try {
      // Subscribe to state changes
      this._unsubscribeStateChanges = this.hass.connection.subscribeEvents(
        (event: any) => this._handleStateChanged(event),
        'state_changed'
      );
    } catch (error) {
      console.warn('Failed to subscribe to state changes:', error);
    }
  }

  /**
   * Unsubscribes from Home Assistant state changes
   */
  private _unsubscribeFromStateChanges(): void {
    if (this._unsubscribeStateChanges && typeof this._unsubscribeStateChanges === 'function') {
      this._unsubscribeStateChanges();
      this._unsubscribeStateChanges = undefined;
    }
  }

  /**
   * Handles individual state change events
   */
  private _handleStateChanged(event: any): void {
    if (!this.config || !event.data) {
      return;
    }

    const { entity_id, new_state, old_state } = event.data;

    // Check if this entity might be relevant to our pattern
    if (this._isEntityRelevant(entity_id)) {
      // Schedule an update, but debounced
      this._scheduleEntityUpdate();
    }
  }

  /**
   * Checks if an entity is potentially relevant to our current pattern
   */
  private _isEntityRelevant(entityId: string): boolean {
    if (!this.config?.pattern) {
      return false;
    }

    try {
      // Quick check if entity might match our pattern
      const regex = new RegExp(this.config.pattern, 'i');
      return regex.test(entityId);
    } catch (error) {
      // If pattern is invalid, assume all entities are relevant
      return true;
    }
  }

  /**
   * Checks for entity additions and removals
   */
  private _checkForEntityChanges(): void {
    if (!this.hass) {
      return;
    }

    const currentEntityCount = Object.keys(this.hass.states || {}).length;
    
    // If entity count changed significantly, update immediately
    if (Math.abs(currentEntityCount - this._lastEntityCount) > 0) {
      this._lastEntityCount = currentEntityCount;
      this._scheduleEntityUpdate();
    }
  }

  /**
   * Updates entity state tracking for change detection
   */
  private _updateEntityStateTracking(entities: EntityMatch[]): void {
    const newStates = new Map<string, string>();
    
    for (const entityMatch of entities) {
      newStates.set(entityMatch.entity_id, entityMatch.entity.state);
    }
    
    this._entityStates = newStates;
  }

  /**
   * Checks if any tracked entity states have changed
   */
  private _hasEntityStatesChanged(entities: EntityMatch[]): boolean {
    for (const entityMatch of entities) {
      const oldState = this._entityStates.get(entityMatch.entity_id);
      if (oldState !== entityMatch.entity.state) {
        return true;
      }
    }
    return false;
  }

  /**
   * Gets performance metrics for debugging
   */
  public getPerformanceMetrics() {
    return {
      ...this._performanceMetrics,
      cacheSize: this._entityMatcher?.getCacheSize?.() || 0,
      lastUpdateTime: this._lastUpdateTime,
      connectedTime: this._connected ? Date.now() - this._lastUpdateTime : 0
    };
  }

  /**
   * Forces a refresh of entity data
   */
  public async refreshEntities(): Promise<void> {
    if (this._entityMatcher) {
      this._entityMatcher.clearCache();
    }
    this._lastUpdateTime = 0; // Reset throttle
    await this._updateEntities();
  }

  /**
   * Renders the card content
   */
  protected render() {
    console.log('RegexQueryCard: render() called with config:', !!this.config);
    
    if (!this.config) {
      console.log('RegexQueryCard: Rendering no config state');
      return html`
        <ha-card>
          <div class="card-content">
            <div class="error">
              Card configuration is required
            </div>
          </div>
        </ha-card>
      `;
    }

    console.log('RegexQueryCard: Rendering main card with title:', this.config.title);
    return html`
      <ha-card>
        ${this.config.title ? html`
          <div class="card-header">
            <div class="name">${this.config.title}</div>
          </div>
        ` : ''}
        
        <div class="card-content">
          ${this._renderCardContent()}
        </div>
      </ha-card>
    `;
  }

  /**
   * Renders the main card content based on current state
   */
  private _renderCardContent() {
    console.log('RegexQueryCard: _renderCardContent called with state:', {
      loading: this._cardState.loading,
      error: this._cardState.error,
      entityCount: this._cardState.entities.length,
      entities: this._cardState.entities.slice(0, 3).map(e => e.entity_id)
    });

    // Show loading state
    if (this._cardState.loading) {
      console.log('RegexQueryCard: Rendering loading state');
      return html`
        <div class="loading">
          <ha-circular-progress active></ha-circular-progress>
          <div class="loading-text">Loading entities...</div>
        </div>
      `;
    }

    // Show error state
    if (this._cardState.error) {
      console.log('RegexQueryCard: Rendering error state:', this._cardState.error);
      return html`
        <div class="error">
          <ha-icon icon="mdi:alert-circle"></ha-icon>
          <div class="error-text">${this._cardState.error}</div>
        </div>
      `;
    }

    // Show empty state
    if (this._cardState.entities.length === 0) {
      console.log('RegexQueryCard: Rendering empty state - no entities');
      return html`
        <div class="empty">
          <ha-icon icon="mdi:magnify"></ha-icon>
          <div class="empty-text">
            No entities match the pattern "${this.config?.pattern}"
          </div>
        </div>
      `;
    }

    // Show entities based on display mode
    console.log('RegexQueryCard: Rendering entities');
    return this._renderEntities();
  }

  /**
   * Renders entities using the entity renderer component
   */
  private _renderEntities() {
    console.log('RegexQueryCard: _renderEntities called with:', {
      entityCount: this._cardState.entities.length,
      entities: this._cardState.entities.slice(0, 3).map(e => e.entity_id),
      hasHass: !!this.hass,
      hasConfig: !!this.config
    });
    
    return html`
      <ha-regex-entity-renderer
        .hass=${this.hass}
        .config=${this.config}
        .entities=${this._cardState.entities}
        .loading=${this._cardState.loading}
        .error=${this._cardState.error}
        @hass-more-info=${this._handleEntityMoreInfo}
        @entity-action=${this._handleEntityAction}
      ></ha-regex-entity-renderer>
    `;
  }

  /**
   * Handles entity more-info events from the renderer
   */
  private _handleEntityMoreInfo(event: CustomEvent): void {
    // Re-dispatch the event to bubble up to Home Assistant
    const newEvent = new CustomEvent('hass-more-info', {
      detail: event.detail,
      bubbles: true,
      composed: true
    });
    
    this.dispatchEvent(newEvent);
  }

  /**
   * Handles entity action events from the renderer
   */
  private _handleEntityAction(event: CustomEvent): void {
    const { type, entity_id, error } = event.detail;
    
    if (type === 'success') {
      // Optionally show success feedback
      console.debug(`Entity action successful for ${entity_id}`);
    } else if (type === 'error') {
      // Handle action errors
      console.error(`Entity action failed for ${entity_id}:`, error);
      
      // Optionally show error toast or notification
      // This could be extended to show user-visible error messages
    }
    
    // Re-dispatch for external handling if needed
    const newEvent = new CustomEvent('regex-card-entity-action', {
      detail: event.detail,
      bubbles: true,
      composed: true
    });
    
    this.dispatchEvent(newEvent);
  }

  /**
   * Card styles
   */
  static styles = css`
    :host {
      display: block;
    }

    ha-card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .card-header {
      padding: 16px 16px 0;
    }

    .card-header .name {
      font-size: 1.2em;
      font-weight: 500;
      color: var(--primary-text-color);
    }

    .card-content {
      padding: 16px;
      flex: 1;
      display: flex;
      flex-direction: column;
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
      border-radius: 4px;
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
    }

    /* Responsive design */
    @media (max-width: 600px) {
      .card-content {
        padding: 12px;
      }
    }
  `;
}

// Register the custom element
declare global {
  interface HTMLElementTagNameMap {
    'ha-regex-query-card': HaRegexQueryCard;
  }
}

// Register with Home Assistant's card registry
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'ha-regex-query-card',
  name: 'Regex Query Card',
  description: 'Display entities matching regex patterns',
  preview: false,
  documentationURL: 'https://github.com/t8bloom1/ha-regex-query-card',
  getConfigElement: () => document.createElement('ha-regex-query-card-editor'),
  getStubConfig: () => ({
    type: 'custom:ha-regex-query-card',
    pattern: '.*',
    title: 'All Entities (Debug)',
    display_type: 'list',
    sort_by: 'name',
    max_entities: 10
  })
});

console.info(
  `%c  REGEX-QUERY-CARD  %c  v1.0.1  `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);