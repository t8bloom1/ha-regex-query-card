import { RegexError } from './types.js';

/**
 * Result of pattern validation
 */
export interface PatternValidationResult {
  valid: boolean;
  error?: RegexError;
  compiledPattern?: RegExp;
}

/**
 * Validates a regex pattern and provides user-friendly error messages
 */
export class PatternValidator {
  /**
   * Validates a regex pattern string
   * @param pattern The regex pattern to validate
   * @returns Validation result with error details if invalid
   */
  static validatePattern(pattern: string): PatternValidationResult {
    // Check for empty or whitespace-only patterns
    if (!pattern || pattern.trim().length === 0) {
      return {
        valid: false,
        error: {
          type: 'pattern',
          message: 'Pattern cannot be empty',
          details: 'Please provide a valid regular expression pattern'
        }
      };
    }

    // Check for potentially dangerous patterns
    const dangerousPatterns = [
      /\(\?\#.*\)/,  // Comments that might contain code
      /\(\?\{.*\}\)/, // Code execution patterns
      /eval\(/i,     // Eval function calls
      /function\(/i, // Function definitions
      /\<script/i    // Script tags
    ];

    for (const dangerous of dangerousPatterns) {
      if (dangerous.test(pattern)) {
        return {
          valid: false,
          error: {
            type: 'pattern',
            message: 'Pattern contains potentially unsafe content',
            details: 'Regular expressions cannot contain code execution patterns for security reasons'
          }
        };
      }
    }

    // Check for excessively complex patterns that might cause performance issues
    if (pattern.length > 500) {
      return {
        valid: false,
        error: {
          type: 'pattern',
          message: 'Pattern is too long',
          details: 'Regular expression patterns should be under 500 characters for performance reasons'
        }
      };
    }

    // Check for patterns with excessive nesting that could cause catastrophic backtracking
    const nestingLevel = this.calculateNestingLevel(pattern);
    if (nestingLevel > 10) {
      return {
        valid: false,
        error: {
          type: 'pattern',
          message: 'Pattern is too complex',
          details: 'Regular expression has too many nested groups which could cause performance issues'
        }
      };
    }

    // Attempt to compile the regex pattern
    try {
      const compiledPattern = new RegExp(pattern, 'i');
      
      // Test the pattern with a simple string to catch some runtime issues
      try {
        compiledPattern.test('test.entity_id');
      } catch (runtimeError) {
        return {
          valid: false,
          error: {
            type: 'pattern',
            message: 'Pattern causes runtime error',
            details: `The pattern fails during execution: ${runtimeError instanceof Error ? runtimeError.message : 'Unknown error'}`
          }
        };
      }

      return {
        valid: true,
        compiledPattern
      };
    } catch (syntaxError) {
      return {
        valid: false,
        error: {
          type: 'pattern',
          message: this.getReadableErrorMessage(syntaxError),
          details: syntaxError instanceof Error ? syntaxError.message : 'Invalid regular expression syntax'
        }
      };
    }
  }

  /**
   * Validates both include and exclude patterns
   * @param includePattern The main regex pattern
   * @param excludePattern Optional exclude pattern
   * @returns Combined validation result
   */
  static validatePatterns(includePattern: string, excludePattern?: string): PatternValidationResult {
    // Validate the main pattern
    const includeResult = this.validatePattern(includePattern);
    if (!includeResult.valid) {
      return includeResult;
    }

    // Validate exclude pattern if provided
    if (excludePattern && excludePattern.trim().length > 0) {
      const excludeResult = this.validatePattern(excludePattern);
      if (!excludeResult.valid) {
        return {
          valid: false,
          error: {
            type: 'pattern',
            message: `Exclude pattern error: ${excludeResult.error?.message}`,
            details: excludeResult.error?.details
          }
        };
      }
    }

    return includeResult;
  }

  /**
   * Provides suggestions for common pattern mistakes
   * @param pattern The pattern to analyze
   * @returns Array of helpful suggestions
   */
  static getPatternSuggestions(pattern: string): string[] {
    const suggestions: string[] = [];

    // Check for common mistakes
    if (pattern.includes('.') && !pattern.includes('\\.')) {
      suggestions.push('Use \\. to match literal dots in entity IDs (e.g., "sensor\\.temperature" instead of "sensor.temperature")');
    }

    if (pattern.includes('*') && !pattern.includes('.*')) {
      suggestions.push('Use .* for wildcard matching instead of just * (e.g., "sensor.*" instead of "sensor*")');
    }

    if (!pattern.startsWith('^') && !pattern.includes('|')) {
      suggestions.push('Consider starting with ^ to match from the beginning of entity IDs (e.g., "^sensor\\." instead of "sensor\\.")');
    }

    if (!pattern.endsWith('$') && !pattern.includes('|')) {
      suggestions.push('Consider ending with $ to match to the end of entity IDs for more precise matching');
    }

    if (pattern.includes('\\\\')) {
      suggestions.push('Double backslashes (\\\\) might not be necessary - use single backslashes for escaping');
    }

    // Suggest common entity patterns
    if (pattern.length < 5) {
      suggestions.push('Common patterns: "^sensor\\." (all sensors), ".*_temperature$" (temperature entities), "^light\\." (all lights)');
    }

    return suggestions;
  }

  /**
   * Calculates the nesting level of groups in a regex pattern
   * @param pattern The regex pattern
   * @returns Maximum nesting depth
   */
  private static calculateNestingLevel(pattern: string): number {
    let maxDepth = 0;
    let currentDepth = 0;
    let inCharClass = false;
    let escaped = false;

    for (let i = 0; i < pattern.length; i++) {
      const char = pattern[i];

      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === '\\') {
        escaped = true;
        continue;
      }

      if (char === '[') {
        inCharClass = true;
        continue;
      }

      if (char === ']' && inCharClass) {
        inCharClass = false;
        continue;
      }

      if (!inCharClass) {
        if (char === '(') {
          currentDepth++;
          maxDepth = Math.max(maxDepth, currentDepth);
        } else if (char === ')') {
          currentDepth = Math.max(0, currentDepth - 1);
        }
      }
    }

    return maxDepth;
  }

  /**
   * Converts technical regex errors to user-friendly messages
   * @param error The regex compilation error
   * @returns User-friendly error message
   */
  private static getReadableErrorMessage(error: unknown): string {
    if (!(error instanceof Error)) {
      return 'Invalid regular expression';
    }

    const message = error.message.toLowerCase();

    if (message.includes('unterminated character class')) {
      return 'Unclosed character class - missing closing bracket ]';
    }

    if (message.includes('unterminated group')) {
      return 'Unclosed group - missing closing parenthesis )';
    }

    if (message.includes('invalid group')) {
      return 'Invalid group syntax - check parentheses and group modifiers';
    }

    if (message.includes('invalid escape')) {
      return 'Invalid escape sequence - check backslash usage';
    }

    if (message.includes('invalid quantifier')) {
      return 'Invalid quantifier - check usage of *, +, ?, {n,m}';
    }

    if (message.includes('nothing to repeat')) {
      return 'Quantifier has nothing to repeat - check placement of *, +, ?';
    }

    if (message.includes('invalid range')) {
      return 'Invalid character range in character class - check [a-z] syntax';
    }

    // Default fallback
    return 'Invalid regular expression syntax';
  }

  /**
   * Tests a pattern against sample entity IDs to verify it works as expected
   * @param pattern The regex pattern to test
   * @param sampleEntities Array of sample entity IDs to test against
   * @returns Test results with matches and non-matches
   */
  static testPattern(pattern: string, sampleEntities: string[]): {
    matches: string[];
    nonMatches: string[];
    error?: string;
  } {
    const validation = this.validatePattern(pattern);
    
    if (!validation.valid || !validation.compiledPattern) {
      return {
        matches: [],
        nonMatches: sampleEntities,
        error: validation.error?.message
      };
    }

    const matches: string[] = [];
    const nonMatches: string[] = [];

    for (const entityId of sampleEntities) {
      try {
        if (validation.compiledPattern.test(entityId)) {
          matches.push(entityId);
        } else {
          nonMatches.push(entityId);
        }
      } catch (testError) {
        nonMatches.push(entityId);
      }
    }

    return { matches, nonMatches };
  }
}

/**
 * Common regex patterns for Home Assistant entities
 */
export const COMMON_PATTERNS = {
  ALL_SENSORS: '^sensor\\.',
  ALL_LIGHTS: '^light\\.',
  ALL_SWITCHES: '^switch\\.',
  ALL_BINARY_SENSORS: '^binary_sensor\\.',
  TEMPERATURE_SENSORS: '.*temperature.*',
  BATTERY_SENSORS: '.*battery.*',
  MOTION_SENSORS: '.*motion.*',
  DOOR_SENSORS: '.*door.*',
  WINDOW_SENSORS: '.*window.*',
  CLIMATE_ENTITIES: '^(climate|fan|humidifier)\\.',
  MEDIA_PLAYERS: '^media_player\\.',
  CAMERAS: '^camera\\.',
  COVERS: '^cover\\.',
  LOCKS: '^lock\\.',
  VACUUM_CLEANERS: '^vacuum\\.',
  WEATHER_ENTITIES: '^weather\\.',
  SUN_ENTITIES: '^sun\\.',
  PERSON_ENTITIES: '^person\\.',
  DEVICE_TRACKER_ENTITIES: '^device_tracker\\.',
  ZONE_ENTITIES: '^zone\\.',
  AUTOMATION_ENTITIES: '^automation\\.',
  SCRIPT_ENTITIES: '^script\\.',
  SCENE_ENTITIES: '^scene\\.',
  INPUT_ENTITIES: '^input_(boolean|datetime|number|select|text)\\.',
  TIMER_ENTITIES: '^timer\\.',
  COUNTER_ENTITIES: '^counter\\.'
} as const;

/**
 * Pattern examples with descriptions for the UI
 */
export const PATTERN_EXAMPLES = [
  {
    pattern: '^sensor\\.',
    description: 'All sensor entities',
    example: 'sensor.temperature, sensor.humidity'
  },
  {
    pattern: '.*temperature.*',
    description: 'All entities with "temperature" in the name',
    example: 'sensor.living_room_temperature, climate.bedroom_temperature'
  },
  {
    pattern: '^(light|switch)\\.',
    description: 'All lights and switches',
    example: 'light.living_room, switch.kitchen'
  },
  {
    pattern: '^sensor\\..*_(temperature|humidity)$',
    description: 'Temperature and humidity sensors',
    example: 'sensor.bedroom_temperature, sensor.kitchen_humidity'
  },
  {
    pattern: '^binary_sensor\\..*_(door|window).*',
    description: 'Door and window sensors',
    example: 'binary_sensor.front_door, binary_sensor.bedroom_window'
  }
] as const;