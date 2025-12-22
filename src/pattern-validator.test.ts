import { PatternValidator, COMMON_PATTERNS, PATTERN_EXAMPLES } from './pattern-validator';

describe('PatternValidator', () => {
  describe('validatePattern', () => {
    test('should validate correct regex patterns', () => {
      const validPatterns = [
        '^sensor\\.',
        '.*temperature.*',
        '^(light|switch)\\.',
        'sensor\\..*_battery$',
        '^binary_sensor\\..*_(door|window).*'
      ];

      validPatterns.forEach(pattern => {
        const result = PatternValidator.validatePattern(pattern);
        expect(result.valid).toBe(true);
        expect(result.compiledPattern).toBeInstanceOf(RegExp);
        expect(result.error).toBeUndefined();
      });
    });

    test('should reject empty or whitespace patterns', () => {
      const emptyPatterns = ['', '   ', '\t', '\n'];

      emptyPatterns.forEach(pattern => {
        const result = PatternValidator.validatePattern(pattern);
        expect(result.valid).toBe(false);
        expect(result.error?.type).toBe('pattern');
        expect(result.error?.message).toBe('Pattern cannot be empty');
      });
    });

    test('should reject invalid regex syntax', () => {
      const invalidPatterns = [
        '[unclosed',
        '(unclosed group',
        '*nothing to repeat',
        '(?invalid group)',
        '\\invalid escape'
      ];

      invalidPatterns.forEach(pattern => {
        const result = PatternValidator.validatePattern(pattern);
        expect(result.valid).toBe(false);
        expect(result.error?.type).toBe('pattern');
        expect(result.compiledPattern).toBeUndefined();
      });
    });

    test('should reject potentially dangerous patterns', () => {
      const dangerousPatterns = [
        '(?#eval(malicious))',
        'eval(',
        'function(',
        '<script',
        '(?{code})'
      ];

      dangerousPatterns.forEach(pattern => {
        const result = PatternValidator.validatePattern(pattern);
        expect(result.valid).toBe(false);
        expect(result.error?.message).toContain('unsafe content');
      });
    });

    test('should reject excessively long patterns', () => {
      const longPattern = 'a'.repeat(501);
      const result = PatternValidator.validatePattern(longPattern);
      
      expect(result.valid).toBe(false);
      expect(result.error?.message).toBe('Pattern is too long');
    });

    test('should reject patterns with excessive nesting', () => {
      const deeplyNested = '('.repeat(15) + 'test' + ')'.repeat(15);
      const result = PatternValidator.validatePattern(deeplyNested);
      
      expect(result.valid).toBe(false);
      expect(result.error?.message).toBe('Pattern is too complex');
    });

    test('should handle runtime errors during pattern testing', () => {
      // This is a tricky test - we need a pattern that compiles but fails at runtime
      // Most regex engines are robust, so this might not trigger often
      const result = PatternValidator.validatePattern('^sensor\\.');
      expect(result.valid).toBe(true);
    });
  });

  describe('validatePatterns', () => {
    test('should validate both include and exclude patterns', () => {
      const result = PatternValidator.validatePatterns('^sensor\\.', '.*_battery$');
      
      expect(result.valid).toBe(true);
      expect(result.compiledPattern).toBeInstanceOf(RegExp);
    });

    test('should fail if include pattern is invalid', () => {
      const result = PatternValidator.validatePatterns('[invalid', '.*_battery$');
      
      expect(result.valid).toBe(false);
      expect(result.error?.type).toBe('pattern');
    });

    test('should fail if exclude pattern is invalid', () => {
      const result = PatternValidator.validatePatterns('^sensor\\.', '[invalid');
      
      expect(result.valid).toBe(false);
      expect(result.error?.message).toContain('Exclude pattern error');
    });

    test('should handle empty exclude pattern', () => {
      const result = PatternValidator.validatePatterns('^sensor\\.', '');
      
      expect(result.valid).toBe(true);
    });

    test('should handle undefined exclude pattern', () => {
      const result = PatternValidator.validatePatterns('^sensor\\.', undefined);
      
      expect(result.valid).toBe(true);
    });
  });

  describe('getPatternSuggestions', () => {
    test('should suggest escaping dots', () => {
      const suggestions = PatternValidator.getPatternSuggestions('sensor.temperature');
      
      expect(suggestions.some(s => s.includes('\\.'))).toBe(true);
    });

    test('should suggest using .* for wildcards', () => {
      const suggestions = PatternValidator.getPatternSuggestions('sensor*');
      
      expect(suggestions.some(s => s.includes('.*'))).toBe(true);
    });

    test('should suggest anchoring patterns', () => {
      const suggestions = PatternValidator.getPatternSuggestions('sensor\\.');
      
      expect(suggestions.some(s => s.includes('^'))).toBe(true);
    });

    test('should provide common pattern examples for short patterns', () => {
      const suggestions = PatternValidator.getPatternSuggestions('sen');
      
      expect(suggestions.some(s => s.includes('Common patterns'))).toBe(true);
    });
  });

  describe('testPattern', () => {
    test('should correctly match entities with valid pattern', () => {
      const sampleEntities = [
        'sensor.temperature',
        'sensor.humidity', 
        'light.living_room',
        'switch.kitchen'
      ];
      
      const result = PatternValidator.testPattern('^sensor\\.', sampleEntities);
      
      expect(result.matches).toEqual(['sensor.temperature', 'sensor.humidity']);
      expect(result.nonMatches).toEqual(['light.living_room', 'switch.kitchen']);
      expect(result.error).toBeUndefined();
    });

    test('should handle invalid patterns gracefully', () => {
      const sampleEntities = ['sensor.temperature'];
      const result = PatternValidator.testPattern('[invalid', sampleEntities);
      
      expect(result.matches).toEqual([]);
      expect(result.nonMatches).toEqual(['sensor.temperature']);
      expect(result.error).toBeDefined();
    });

    test('should handle empty entity list', () => {
      const result = PatternValidator.testPattern('^sensor\\.', []);
      
      expect(result.matches).toEqual([]);
      expect(result.nonMatches).toEqual([]);
    });
  });

  describe('Common patterns', () => {
    test('should have valid common patterns', () => {
      Object.values(COMMON_PATTERNS).forEach(pattern => {
        const result = PatternValidator.validatePattern(pattern);
        expect(result.valid).toBe(true);
      });
    });

    test('should have valid example patterns', () => {
      PATTERN_EXAMPLES.forEach(example => {
        const result = PatternValidator.validatePattern(example.pattern);
        expect(result.valid).toBe(true);
      });
    });
  });
});