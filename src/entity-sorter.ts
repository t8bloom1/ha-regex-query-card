import { EntityMatch, SortBy, SortOrder, HassEntity } from './types.js';

/**
 * Configuration for entity sorting
 */
export interface SortConfig {
  sortBy: SortBy;
  sortOrder: SortOrder;
  maxEntities?: number;
  customSortFunction?: (a: EntityMatch, b: EntityMatch) => number;
}

/**
 * Result of sorting operation
 */
export interface SortResult {
  entities: EntityMatch[];
  totalCount: number;
  limitedCount: number;
  sortedBy: SortBy;
  sortOrder: SortOrder;
  performanceMetrics: {
    sortingTime: number;
    originalCount: number;
  };
}

/**
 * Handles entity sorting and limiting functionality
 */
export class EntitySorter {
  /**
   * Sorts and limits entities based on configuration
   * @param entities Array of entities to sort
   * @param config Sorting configuration
   * @returns Sorted and limited entities with metadata
   */
  static sortAndLimitEntities(entities: EntityMatch[], config: SortConfig): SortResult {
    const startTime = performance.now();
    const originalCount = entities.length;

    try {
      // Update sort values for all entities based on sort criteria
      const entitiesWithSortValues = entities.map(entity => ({
        ...entity,
        sort_value: this.getSortValue(entity, config.sortBy)
      }));

      // Sort entities
      const sortedEntities = this.sortEntities(entitiesWithSortValues, config);

      // Apply entity limit if specified
      const limitedEntities = config.maxEntities && config.maxEntities > 0
        ? sortedEntities.slice(0, config.maxEntities)
        : sortedEntities;

      return {
        entities: limitedEntities,
        totalCount: originalCount,
        limitedCount: limitedEntities.length,
        sortedBy: config.sortBy,
        sortOrder: config.sortOrder,
        performanceMetrics: {
          sortingTime: performance.now() - startTime,
          originalCount
        }
      };
    } catch (error) {
      console.error('Error sorting entities:', error);
      
      // Return original entities if sorting fails
      const limitedEntities = config.maxEntities && config.maxEntities > 0
        ? entities.slice(0, config.maxEntities)
        : entities;

      return {
        entities: limitedEntities,
        totalCount: originalCount,
        limitedCount: limitedEntities.length,
        sortedBy: config.sortBy,
        sortOrder: config.sortOrder,
        performanceMetrics: {
          sortingTime: performance.now() - startTime,
          originalCount
        }
      };
    }
  }

  /**
   * Sorts entities based on configuration
   * @param entities Entities with updated sort values
   * @param config Sort configuration
   * @returns Sorted entities
   */
  private static sortEntities(entities: EntityMatch[], config: SortConfig): EntityMatch[] {
    // Use custom sort function if provided
    if (config.customSortFunction) {
      return [...entities].sort(config.customSortFunction);
    }

    // Standard sorting
    return [...entities].sort((a, b) => {
      const result = this.compareEntities(a, b, config.sortBy);
      return config.sortOrder === 'desc' ? -result : result;
    });
  }

  /**
   * Compares two entities for sorting
   * @param a First entity
   * @param b Second entity
   * @param sortBy Sort criteria
   * @returns Comparison result (-1, 0, 1)
   */
  private static compareEntities(a: EntityMatch, b: EntityMatch, sortBy: SortBy): number {
    const aValue = a.sort_value;
    const bValue = b.sort_value;

    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;

    // Type-specific comparison
    switch (sortBy) {
      case 'name':
        return this.compareStrings(aValue, bValue);
      
      case 'state':
        return this.compareStates(aValue, bValue, a.entity, b.entity);
      
      case 'last_changed':
        return this.compareNumbers(aValue, bValue);
      
      default:
        return this.compareStrings(String(aValue), String(bValue));
    }
  }

  /**
   * Compares two strings for sorting
   * @param a First string
   * @param b Second string
   * @returns Comparison result
   */
  private static compareStrings(a: string, b: string): number {
    return a.localeCompare(b, undefined, { 
      numeric: true, 
      sensitivity: 'base' 
    });
  }

  /**
   * Compares two numbers for sorting
   * @param a First number
   * @param b Second number
   * @returns Comparison result
   */
  private static compareNumbers(a: number, b: number): number {
    return a - b;
  }

  /**
   * Compares entity states with intelligent handling of different state types
   * @param aState First state value
   * @param bState Second state value
   * @param aEntity First entity (for context)
   * @param bEntity Second entity (for context)
   * @returns Comparison result
   */
  private static compareStates(
    aState: any, 
    bState: any, 
    aEntity: HassEntity, 
    bEntity: HassEntity
  ): number {
    // Convert states to comparable values
    const aComparable = this.getComparableStateValue(aState, aEntity);
    const bComparable = this.getComparableStateValue(bState, bEntity);

    // Compare based on type
    if (typeof aComparable === 'number' && typeof bComparable === 'number') {
      return aComparable - bComparable;
    }

    return this.compareStrings(String(aComparable), String(bComparable));
  }

  /**
   * Converts a state value to a comparable format
   * @param state State value
   * @param entity Entity for context
   * @returns Comparable value
   */
  private static getComparableStateValue(state: any, entity: HassEntity): any {
    const stateStr = String(state).toLowerCase();

    // Handle numeric states
    const numericValue = parseFloat(stateStr);
    if (!isNaN(numericValue)) {
      return numericValue;
    }

    // Handle boolean-like states
    const booleanStates: { [key: string]: number } = {
      'on': 1,
      'off': 0,
      'true': 1,
      'false': 0,
      'open': 1,
      'closed': 0,
      'locked': 1,
      'unlocked': 0,
      'home': 1,
      'away': 0,
      'available': 1,
      'unavailable': 0,
      'unknown': -1
    };

    if (stateStr in booleanStates) {
      return booleanStates[stateStr];
    }

    // Handle special states
    if (stateStr === 'unavailable' || stateStr === 'unknown') {
      return -999; // Sort unavailable/unknown to end
    }

    // Return string for text comparison
    return stateStr;
  }

  /**
   * Gets the sort value for an entity based on sort criteria
   * @param entity Entity to get sort value for
   * @param sortBy Sort criteria
   * @returns Sort value
   */
  private static getSortValue(entity: EntityMatch, sortBy: SortBy): any {
    switch (sortBy) {
      case 'name':
        return entity.display_name.toLowerCase();
      
      case 'state':
        return entity.entity.state;
      
      case 'last_changed':
        return new Date(entity.entity.last_changed).getTime();
      
      default:
        return entity.entity_id.toLowerCase();
    }
  }

  /**
   * Creates a multi-level sort configuration
   * @param primarySort Primary sort criteria
   * @param secondarySort Optional secondary sort criteria
   * @param tertiarySort Optional tertiary sort criteria
   * @returns Custom sort function
   */
  static createMultiLevelSort(
    primarySort: { sortBy: SortBy; sortOrder: SortOrder },
    secondarySort?: { sortBy: SortBy; sortOrder: SortOrder },
    tertiarySort?: { sortBy: SortBy; sortOrder: SortOrder }
  ): (a: EntityMatch, b: EntityMatch) => number {
    return (a: EntityMatch, b: EntityMatch): number => {
      // Update sort values for primary sort
      const aPrimary = this.getSortValue(a, primarySort.sortBy);
      const bPrimary = this.getSortValue(b, primarySort.sortBy);
      
      let result = this.compareEntities(
        { ...a, sort_value: aPrimary },
        { ...b, sort_value: bPrimary },
        primarySort.sortBy
      );
      
      if (primarySort.sortOrder === 'desc') {
        result = -result;
      }

      // If primary sort is equal, try secondary sort
      if (result === 0 && secondarySort) {
        const aSecondary = this.getSortValue(a, secondarySort.sortBy);
        const bSecondary = this.getSortValue(b, secondarySort.sortBy);
        
        result = this.compareEntities(
          { ...a, sort_value: aSecondary },
          { ...b, sort_value: bSecondary },
          secondarySort.sortBy
        );
        
        if (secondarySort.sortOrder === 'desc') {
          result = -result;
        }

        // If secondary sort is equal, try tertiary sort
        if (result === 0 && tertiarySort) {
          const aTertiary = this.getSortValue(a, tertiarySort.sortBy);
          const bTertiary = this.getSortValue(b, tertiarySort.sortBy);
          
          result = this.compareEntities(
            { ...a, sort_value: aTertiary },
            { ...b, sort_value: bTertiary },
            tertiarySort.sortBy
          );
          
          if (tertiarySort.sortOrder === 'desc') {
            result = -result;
          }
        }
      }

      return result;
    };
  }

  /**
   * Applies intelligent limiting based on entity importance
   * @param entities Sorted entities
   * @param maxEntities Maximum number of entities
   * @param prioritizeAvailable Whether to prioritize available entities
   * @returns Limited entities with priority handling
   */
  static intelligentLimit(
    entities: EntityMatch[], 
    maxEntities: number,
    prioritizeAvailable: boolean = true
  ): EntityMatch[] {
    if (entities.length <= maxEntities) {
      return entities;
    }

    if (!prioritizeAvailable) {
      return entities.slice(0, maxEntities);
    }

    // Separate available and unavailable entities
    const available: EntityMatch[] = [];
    const unavailable: EntityMatch[] = [];

    for (const entity of entities) {
      const state = entity.entity.state.toLowerCase();
      if (state === 'unavailable' || state === 'unknown') {
        unavailable.push(entity);
      } else {
        available.push(entity);
      }
    }

    // Prioritize available entities
    const result: EntityMatch[] = [];
    
    // Add available entities first
    const availableToAdd = Math.min(available.length, maxEntities);
    result.push(...available.slice(0, availableToAdd));

    // Fill remaining slots with unavailable entities if needed
    const remainingSlots = maxEntities - result.length;
    if (remainingSlots > 0) {
      result.push(...unavailable.slice(0, remainingSlots));
    }

    return result;
  }

  /**
   * Groups entities by a specific criteria before sorting
   * @param entities Entities to group and sort
   * @param groupBy Grouping criteria
   * @param sortConfig Sort configuration for each group
   * @returns Grouped and sorted entities
   */
  static groupAndSort(
    entities: EntityMatch[],
    groupBy: 'domain' | 'state' | 'area',
    sortConfig: SortConfig
  ): { [group: string]: EntityMatch[] } {
    // Group entities
    const groups: { [group: string]: EntityMatch[] } = {};

    for (const entity of entities) {
      let groupKey: string;

      switch (groupBy) {
        case 'domain':
          groupKey = entity.entity_id.split('.')[0];
          break;
        case 'state':
          groupKey = entity.entity.state;
          break;
        case 'area':
          groupKey = entity.entity.attributes.area_id || 'no_area';
          break;
        default:
          groupKey = 'default';
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(entity);
    }

    // Sort each group
    const sortedGroups: { [group: string]: EntityMatch[] } = {};
    for (const [groupKey, groupEntities] of Object.entries(groups)) {
      const sortResult = this.sortAndLimitEntities(groupEntities, sortConfig);
      sortedGroups[groupKey] = sortResult.entities;
    }

    return sortedGroups;
  }

  /**
   * Validates sort configuration
   * @param config Sort configuration to validate
   * @returns Validation result with any errors
   */
  static validateSortConfig(config: SortConfig): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validate sortBy
    const validSortBy: SortBy[] = ['name', 'state', 'last_changed'];
    if (!validSortBy.includes(config.sortBy)) {
      errors.push(`Invalid sortBy value: ${config.sortBy}. Must be one of: ${validSortBy.join(', ')}`);
    }

    // Validate sortOrder
    const validSortOrder: SortOrder[] = ['asc', 'desc'];
    if (!validSortOrder.includes(config.sortOrder)) {
      errors.push(`Invalid sortOrder value: ${config.sortOrder}. Must be one of: ${validSortOrder.join(', ')}`);
    }

    // Validate maxEntities
    if (config.maxEntities !== undefined) {
      if (!Number.isInteger(config.maxEntities) || config.maxEntities < 0) {
        errors.push('maxEntities must be a non-negative integer');
      }
      if (config.maxEntities > 1000) {
        errors.push('maxEntities should not exceed 1000 for performance reasons');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Gets performance-optimized sort configuration for large entity sets
   * @param entityCount Number of entities to sort
   * @returns Optimized sort configuration
   */
  static getOptimizedSortConfig(entityCount: number): Partial<SortConfig> {
    if (entityCount > 500) {
      // For large sets, use simpler sorting and limit results
      return {
        sortBy: 'name', // Name sorting is generally fastest
        maxEntities: 100 // Limit to prevent UI performance issues
      };
    }

    if (entityCount > 100) {
      return {
        maxEntities: 200
      };
    }

    // No optimization needed for small sets
    return {};
  }
}

/**
 * Utility functions for entity sorting and limiting
 */
export class SortUtils {
  /**
   * Creates a stable sort function that maintains relative order for equal elements
   * @param compareFn Comparison function
   * @returns Stable sort function
   */
  static createStableSort<T>(compareFn: (a: T, b: T) => number): (array: T[]) => T[] {
    return (array: T[]): T[] => {
      const indexed = array.map((item, index) => ({ item, index }));
      
      indexed.sort((a, b) => {
        const result = compareFn(a.item, b.item);
        return result !== 0 ? result : a.index - b.index;
      });
      
      return indexed.map(({ item }) => item);
    };
  }

  /**
   * Calculates sort performance metrics
   * @param entityCount Number of entities
   * @param sortTime Time taken to sort in milliseconds
   * @returns Performance assessment
   */
  static calculateSortPerformance(entityCount: number, sortTime: number): {
    rating: 'excellent' | 'good' | 'fair' | 'poor';
    recommendation?: string;
  } {
    const timePerEntity = sortTime / entityCount;

    if (timePerEntity < 0.1) {
      return { rating: 'excellent' };
    } else if (timePerEntity < 0.5) {
      return { rating: 'good' };
    } else if (timePerEntity < 2) {
      return { 
        rating: 'fair',
        recommendation: 'Consider reducing entity count or using simpler sort criteria'
      };
    } else {
      return { 
        rating: 'poor',
        recommendation: 'Reduce entity count or use name-based sorting for better performance'
      };
    }
  }

  /**
   * Estimates memory usage for entity sorting
   * @param entityCount Number of entities
   * @returns Estimated memory usage in MB
   */
  static estimateMemoryUsage(entityCount: number): number {
    // Rough estimate: each EntityMatch object is approximately 1KB
    return (entityCount * 1024) / (1024 * 1024); // Convert to MB
  }
}