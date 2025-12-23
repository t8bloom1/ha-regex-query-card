// Base Lovelace interfaces (normally from custom-card-helpers)
export interface LovelaceCardConfig {
  type: string;
  [key: string]: any;
}

export interface LovelaceCard {
  hass?: HomeAssistant;
  config?: LovelaceCardConfig;
  setConfig(config: LovelaceCardConfig): void;
  getCardSize?(): number;
}

export interface LovelaceCardEditor extends HTMLElement {
  hass?: HomeAssistant;
  setConfig(config: LovelaceCardConfig): void;
}

// Home Assistant core types
export interface HomeAssistant {
  states: { [entity_id: string]: HassEntity };
  config: HassConfig;
  themes: any;
  selectedTheme: any;
  resources: any;
  panels: any;
  panelUrl: string;
  language: string;
  selectedLanguage: string | null;
  translationMetadata: any;
  suspendWhenHidden: boolean;
  enableShortcuts: boolean;
  vibrate: boolean;
  debugMode: boolean;
  dockedSidebar: 'docked' | 'always_hidden' | 'auto';
  defaultPanel: string;
  moreInfoEntityId: string | null;
  user?: HassUser;
  userData?: any;
  hassUrl(path?: string): string;
  callService(domain: string, service: string, serviceData?: any, target?: any): Promise<any>;
  callApi<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, parameters?: any): Promise<T>;
  fetchWithAuth(path: string, init?: any): Promise<Response>;
  sendWS(msg: any): void;
  callWS<T>(msg: any): Promise<T>;
  connection: any;
  connected: boolean;
  // Add other properties as needed
}

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: { [key: string]: any };
  context: {
    id: string;
    parent_id?: string;
    user_id?: string;
  };
  last_changed: string;
  last_updated: string;
}

export interface HassConfig {
  latitude: number;
  longitude: number;
  elevation: number;
  unit_system: {
    length: string;
    mass: string;
    temperature: string;
    volume: string;
  };
  location_name: string;
  time_zone: string;
  components: string[];
  config_dir: string;
  whitelist_external_dirs: string[];
  allowlist_external_dirs: string[];
  allowlist_external_urls: string[];
  version: string;
  config_source: string;
  safe_mode: boolean;
  state: 'NOT_RUNNING' | 'STARTING' | 'RUNNING' | 'STOPPING' | 'FINAL_WRITE';
  external_url?: string;
  internal_url?: string;
}

export interface HassUser {
  id: string;
  name: string;
  is_owner: boolean;
  is_admin: boolean;
  credentials: Array<{
    auth_provider_type: string;
    auth_provider_id: string;
  }>;
  mfa_modules: Array<{
    id: string;
    name: string;
    enabled: boolean;
  }>;
}

// Card-specific configuration interface
export interface RegexQueryCardConfig extends LovelaceCardConfig {
  type: 'custom:ha-regex-query-card';
  pattern: string;
  exclude_pattern?: string;
  display_type: 'list' | 'grid';
  columns?: number;
  sort_by?: 'name' | 'state' | 'last_changed';
  sort_order?: 'asc' | 'desc';
  max_entities?: number;
  show_name?: boolean;
  show_state?: boolean;
  show_icon?: boolean;
  title?: string;
  secondary_info?: 'entity_id' | 'last_changed' | 'last_updated' | 'none';
}

// Interface for matched entity data structure
export interface EntityMatch {
  entity_id: string;
  entity: HassEntity;
  display_name: string;
  sort_value: any;
}

// Interface for component state management
export interface CardState {
  entities: EntityMatch[];
  loading: boolean;
  error?: string;
  pattern_valid: boolean;
}

// Display mode types
export type DisplayType = 'list' | 'grid';
export type SortBy = 'name' | 'state' | 'last_changed';
export type SortOrder = 'asc' | 'desc';

// Error types for better error handling
export interface RegexError {
  type: 'pattern' | 'entity' | 'connection' | 'config';
  message: string;
  details?: string;
}

// Configuration validation result
export interface ConfigValidationResult {
  valid: boolean;
  errors: RegexError[];
  warnings: string[];
}

// Entity action types for interaction handling
export type EntityAction = 'toggle' | 'more-info' | 'call-service' | 'navigate' | 'url';

export interface EntityActionConfig {
  action: EntityAction;
  service?: string;
  service_data?: any;
  target?: any;
  navigation_path?: string;
  url_path?: string;
  confirmation?: boolean;
}

// Card editor interface extension
export interface RegexQueryCardEditor extends LovelaceCardEditor {
  setConfig(config: RegexQueryCardConfig): void;
}

// Custom card interface extension
export interface RegexQueryCard extends LovelaceCard {
  hass?: HomeAssistant;
  config?: RegexQueryCardConfig;
  setConfig(config: RegexQueryCardConfig): void;
  getCardSize(): number;
}

// Event types for card interactions
export interface EntityClickEvent extends CustomEvent {
  detail: {
    entity_id: string;
    entity: HassEntity;
    action: EntityAction;
  };
}

export interface ConfigChangedEvent extends CustomEvent {
  detail: {
    config: RegexQueryCardConfig;
  };
}

// Utility type for entity filtering and sorting
export interface EntityFilter {
  pattern: RegExp;
  excludePattern?: RegExp;
  sortBy: SortBy;
  sortOrder: SortOrder;
  maxEntities?: number;
}

// Theme and styling types
export interface CardTheme {
  primary_color: string;
  accent_color: string;
  divider_color: string;
  primary_text_color: string;
  secondary_text_color: string;
  paper_card_background_color: string;
  card_background_color: string;
  state_icon_color: string;
  state_icon_active_color: string;
}

// Performance monitoring types
export interface PerformanceMetrics {
  entityCount: number;
  matchingTime: number;
  renderTime: number;
  lastUpdate: number;
}