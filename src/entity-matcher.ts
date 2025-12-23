import { HomeAssistant, HassEntity, EntityMatch, RegexQueryCardConfig, EntityFilter } from './types.js';
import { PatternValidator } from './pattern-validator.js';

/**
 * Result of entity matching operation
 */
export interface EntityMatchResult {
  entities: EntityMatch[];
  totalCount: number;
  matchedCount: number;
  error?: string;
  performanceMetrics: {
    matchingTime: number;
    entityCount: number;
  };
}

/**
 * Options for entity matching
 */
export interface EntityMatchOptions {
  pattern: string;
  excludePattern?: string;
  includeUnavailable?: boolean;
  maxResults?: number;
}

/**
 * Handles entity discovery and regex matching for the card
 */
export class EntityMatcher {
  private hass: HomeAssistant;
  private lastMatchTime: number = 0;
  private cachedResults: Map<string, EntityMatchResult> = new Map();
  private cacheTimeout: number = 5000; // 5 seconds cache

  constructor(hass: HomeAssistant) {
    this.hass = hass;
  }

  /**
   * Updates the Home Assistant instance
   * @param hass New Home Assistant instance
   */
  updateHass(hass: HomeAssistant): void {
    this.hass = hass;
    // Clear cache when hass instance changes
    this.cachedResults.clear();
  }

  /**
   * Discovers and matches entities based on regex patterns
   * @param options Matching options including patterns and filters
   * @returns Promise resolving to match results
   */
  async matchEntities(options: EntityMatchOptions): Promise<EntityMatchResult> {
    const startTime = performance.now();
    
    // Create cache key
    const cacheKey = this.createCacheKey(options);
    
    // Check cache first
    const cached = this.getCachedResult(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Validate the main pattern
      const patternValidation = PatternValidator.validatePattern(options.pattern);
      if (!patternValidation.valid || !patternValidation.compiledPattern) {
        return {
          entities: [],
          totalCount: 0,
          matchedCount: 0,
          error: patternValidation.error?.message || 'Invalid pattern',
          performanceMetrics: {
            matchingTime: performance.now() - startTime,
            entityCount: 0
          }
        };
      }

      // Validate exclude pattern if provided
      let excludeRegex: RegExp | undefined;
      if (options.excludePattern && options.excludePattern.trim().length > 0) {
        const excludeValidation = PatternValidator.validatePattern(options.excludePattern);
        if (!excludeValidation.valid || !excludeValidation.compiledPattern) {
          return {
            entities: [],
            totalCount: 0,
            matchedCount: 0,
            error: `Exclude pattern error: ${excludeValidation.error?.message || 'Invalid exclude pattern'}`,
            performanceMetrics: {
              matchingTime: performance.now() - startTime,
              entityCount: 0
            }
          };
        }
        excludeRegex = excludeValidation.compiledPattern;
      }

      // Get all entities from Home Assistant
      const allEntities = this.getAllEntities();
      const totalCount = allEntities.length;

      console.log(`RegexQueryCard: Matching pattern "${options.pattern}" against ${totalCount} entities`);

      // Filter entities based on patterns
      const matchedEntities = this.filterEntities(
        allEntities,
        patternValidation.compiledPattern,
        excludeRegex,
        options.includeUnavailable || false
      );

      console.log(`RegexQueryCard: Found ${matchedEntities.length} matches for pattern "${options.pattern}"`);
      if (matchedEntities.length > 0) {
        console.log('RegexQueryCard: Sample matches:', matchedEntities.slice(0, 3).map(e => e.entity_id));
      }

      // Limit results if specified
      const limitedEntities = options.maxResults 
        ? matchedEntities.slice(0, options.maxResults)
        : matchedEntities;

      const result: EntityMatchResult = {
        entities: limitedEntities,
        totalCount,
        matchedCount: matchedEntities.length,
        performanceMetrics: {
          matchingTime: performance.now() - startTime,
          entityCount: totalCount
        }
      };

      // Cache the result
      this.cacheResult(cacheKey, result);

      return result;
    } catch (error) {
      return {
        entities: [],
        totalCount: 0,
        matchedCount: 0,
        error: `Entity matching failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        performanceMetrics: {
          matchingTime: performance.now() - startTime,
          entityCount: 0
        }
      };
    }
  }

  /**
   * Gets all entities from Home Assistant states
   * @returns Array of entity IDs and their corresponding entities
   */
  private getAllEntities(): Array<{ entityId: string; entity: HassEntity }> {
    if (!this.hass || !this.hass.states) {
      console.warn('RegexQueryCard: No hass or hass.states available');
      return [];
    }

    const entities: Array<{ entityId: string; entity: HassEntity }> = [];
    
    for (const [entityId, entity] of Object.entries(this.hass.states)) {
      // Skip entities that don't have proper structure
      if (!entity || !entity.entity_id) {
        continue;
      }

      entities.push({ entityId, entity });
    }

    console.log(`RegexQueryCard: Found ${entities.length} total entities`);
    if (entities.length > 0) {
      console.log('RegexQueryCard: Sample entity IDs:', entities.slice(0, 5).map(e => e.entityId));
    }

    return entities;
  }

  /**
   * Filters entities based on include and exclude patterns
   * @param entities Array of entities to filter
   * @param includePattern Compiled regex for inclusion
   * @param excludePattern Optional compiled regex for exclusion
   * @param includeUnavailable Whether to include unavailable entities
   * @returns Filtered array of EntityMatch objects
   */
  private filterEntities(
    entities: Array<{ entityId: string; entity: HassEntity }>,
    includePattern: RegExp,
    excludePattern?: RegExp,
    includeUnavailable: boolean = false
  ): EntityMatch[] {
    const matches: EntityMatch[] = [];

    for (const { entityId, entity } of entities) {
      try {
        // Skip unavailable entities if not requested
        if (!includeUnavailable && this.isEntityUnavailable(entity)) {
          continue;
        }

        // Test against include pattern
        if (!includePattern.test(entityId)) {
          continue;
        }

        // Test against exclude pattern if provided
        if (excludePattern && excludePattern.test(entityId)) {
          continue;
        }

        // Create EntityMatch object
        const entityMatch: EntityMatch = {
          entity_id: entityId,
          entity: entity,
          display_name: this.getEntityDisplayName(entity),
          sort_value: this.getEntitySortValue(entity, 'name') // Default sort by name
        };

        matches.push(entityMatch);
      } catch (error) {
        // Skip entities that cause errors during processing
        console.warn(`Error processing entity ${entityId}:`, error);
        continue;
      }
    }

    return matches;
  }

  /**
   * Determines if an entity is unavailable
   * @param entity The entity to check
   * @returns True if entity is unavailable
   */
  private isEntityUnavailable(entity: HassEntity): boolean {
    const unavailableStates = ['unavailable', 'unknown', 'none', ''];
    return unavailableStates.includes(entity.state.toLowerCase());
  }

  /**
   * Gets the display name for an entity
   * @param entity The entity
   * @returns Display name (friendly name or entity ID)
   */
  private getEntityDisplayName(entity: HassEntity): string {
    // Try to get friendly name from attributes
    if (entity.attributes && entity.attributes.friendly_name) {
      return entity.attributes.friendly_name;
    }

    // Fall back to entity ID, but make it more readable
    return entity.entity_id
      .split('.')
      .map(part => part.replace(/_/g, ' '))
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' - ');
  }

  /**
   * Gets the sort value for an entity based on sort criteria
   * @param entity The entity
   * @param sortBy Sort criteria
   * @returns Sort value
   */
  private getEntitySortValue(entity: HassEntity, sortBy: string): any {
    switch (sortBy) {
      case 'name':
        return this.getEntityDisplayName(entity).toLowerCase();
      
      case 'state':
        return entity.state.toLowerCase();
      
      case 'last_changed':
        return new Date(entity.last_changed).getTime();
      
      case 'entity_id':
        return entity.entity_id.toLowerCase();
      
      default:
        return entity.entity_id.toLowerCase();
    }
  }

  /**
   * Creates a cache key for the given options
   * @param options Matching options
   * @returns Cache key string
   */
  private createCacheKey(options: EntityMatchOptions): string {
    return JSON.stringify({
      pattern: options.pattern,
      excludePattern: options.excludePattern || '',
      includeUnavailable: options.includeUnavailable || false,
      maxResults: options.maxResults || 0,
      stateCount: Object.keys(this.hass.states || {}).length
    });
  }

  /**
   * Gets cached result if available and not expired
   * @param cacheKey Cache key
   * @returns Cached result or undefined
   */
  private getCachedResult(cacheKey: string): EntityMatchResult | undefined {
    const cached = this.cachedResults.get(cacheKey);
    if (!cached) {
      return undefined;
    }

    // Check if cache is expired
    const now = Date.now();
    if (now - this.lastMatchTime > this.cacheTimeout) {
      this.cachedResults.delete(cacheKey);
      return undefined;
    }

    return cached;
  }

  /**
   * Caches a result
   * @param cacheKey Cache key
   * @param result Result to cache
   */
  private cacheResult(cacheKey: string, result: EntityMatchResult): void {
    this.lastMatchTime = Date.now();
    this.cachedResults.set(cacheKey, result);

    // Limit cache size
    if (this.cachedResults.size > 10) {
      const firstKey = this.cachedResults.keys().next().value;
      if (firstKey) {
        this.cachedResults.delete(firstKey);
      }
    }
  }

  /**
   * Clears the entity matching cache
   */
  clearCache(): void {
    this.cachedResults.clear();
  }

  /**
   * Gets the current cache size
   */
  getCacheSize(): number {
    return this.cachedResults.size;
  }

  /**
   * Gets statistics about current entities
   * @returns Entity statistics
   */
  getEntityStats(): {
    totalEntities: number;
    availableEntities: number;
    domains: { [domain: string]: number };
  } {
    const allEntities = this.getAllEntities();
    const stats = {
      totalEntities: allEntities.length,
      availableEntities: 0,
      domains: {} as { [domain: string]: number }
    };

    for (const { entityId, entity } of allEntities) {
      // Count available entities
      if (!this.isEntityUnavailable(entity)) {
        stats.availableEntities++;
      }

      // Count by domain
      const domain = entityId.split('.')[0];
      stats.domains[domain] = (stats.domains[domain] || 0) + 1;
    }

    return stats;
  }

  /**
   * Tests patterns against current entities to provide feedback
   * @param pattern Pattern to test
   * @param excludePattern Optional exclude pattern
   * @returns Test results with sample matches
   */
  async testPatterns(pattern: string, excludePattern?: string): Promise<{
    sampleMatches: string[];
    totalMatches: number;
    error?: string;
  }> {
    try {
      const result = await this.matchEntities({
        pattern,
        excludePattern,
        maxResults: 10 // Limit for testing
      });

      if (result.error) {
        return {
          sampleMatches: [],
          totalMatches: 0,
          error: result.error
        };
      }

      return {
        sampleMatches: result.entities.map(e => e.entity_id),
        totalMatches: result.matchedCount
      };
    } catch (error) {
      return {
        sampleMatches: [],
        totalMatches: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Gets suggested patterns based on available entities
   * @returns Array of suggested patterns with descriptions
   */
  getSuggestedPatterns(): Array<{ pattern: string; description: string; matchCount: number }> {
    const stats = this.getEntityStats();
    const suggestions: Array<{ pattern: string; description: string; matchCount: number }> = [];

    // Suggest patterns based on available domains
    for (const [domain, count] of Object.entries(stats.domains)) {
      if (count > 0) {
        suggestions.push({
          pattern: `^${domain}\\.`,
          description: `All ${domain} entities`,
          matchCount: count
        });
      }
    }

    // Sort by match count (most common domains first)
    suggestions.sort((a, b) => b.matchCount - a.matchCount);

    return suggestions.slice(0, 8); // Return top 8 suggestions
  }
}

/**
 * Utility functions for entity matching
 */
export class EntityMatchUtils {
  /**
   * Converts a simple glob pattern to regex
   * @param glob Glob pattern (e.g., "sensor.*_temperature")
   * @returns Regex pattern
   */
  static globToRegex(glob: string): string {
    return glob
      .replace(/\./g, '\\.')  // Escape dots
      .replace(/\*/g, '.*')   // Convert * to .*
      .replace(/\?/g, '.')    // Convert ? to .
      .replace(/\[/g, '\\[')  // Escape brackets
      .replace(/\]/g, '\\]');
  }

  /**
   * Validates entity ID format
   * @param entityId Entity ID to validate
   * @returns True if valid format
   */
  static isValidEntityId(entityId: string): boolean {
    const entityIdPattern = /^[a-z_]+\.[a-z0-9_]+$/;
    return entityIdPattern.test(entityId);
  }

  /**
   * Extracts domain from entity ID
   * @param entityId Entity ID
   * @returns Domain name
   */
  static getDomain(entityId: string): string {
    return entityId.split('.')[0];
  }

  /**
   * Extracts object ID from entity ID
   * @param entityId Entity ID
   * @returns Object ID
   */
  static getObjectId(entityId: string): string {
    const parts = entityId.split('.');
    return parts.slice(1).join('.');
  }

  /**
   * Checks if an entity is controllable (can be toggled/changed)
   * @param entity The entity to check
   * @returns True if controllable
   */
  static isControllable(entity: HassEntity): boolean {
    const controllableDomains = [
      'light', 'switch', 'fan', 'cover', 'lock', 'climate',
      'media_player', 'vacuum', 'water_heater', 'humidifier'
    ];
    
    const domain = this.getDomain(entity.entity_id);
    return controllableDomains.includes(domain);
  }

  /**
   * Gets appropriate icon for an entity based on its domain and state
   * @param entity The entity
   * @returns Icon name (mdi:icon-name format)
   */
  static getEntityIcon(entity: HassEntity): string {
    // Use custom icon if specified
    if (entity.attributes.icon) {
      return entity.attributes.icon;
    }

    const domain = this.getDomain(entity.entity_id);
    const state = entity.state.toLowerCase();

    // Domain-based icons
    const domainIcons: { [key: string]: string } = {
      'light': state === 'on' ? 'mdi:lightbulb' : 'mdi:lightbulb-outline',
      'switch': state === 'on' ? 'mdi:toggle-switch' : 'mdi:toggle-switch-off',
      'sensor': 'mdi:eye',
      'binary_sensor': state === 'on' ? 'mdi:checkbox-marked-circle' : 'mdi:checkbox-blank-circle-outline',
      'climate': 'mdi:thermostat',
      'fan': state === 'on' ? 'mdi:fan' : 'mdi:fan-off',
      'cover': 'mdi:window-shutter',
      'lock': state === 'locked' ? 'mdi:lock' : 'mdi:lock-open',
      'media_player': 'mdi:cast',
      'camera': 'mdi:camera',
      'vacuum': 'mdi:robot-vacuum',
      'person': 'mdi:account',
      'device_tracker': 'mdi:cellphone',
      'zone': 'mdi:map-marker-radius',
      'automation': 'mdi:robot',
      'script': 'mdi:script-text',
      'scene': 'mdi:palette'
    };

    return domainIcons[domain] || 'mdi:help-circle';
  }
}