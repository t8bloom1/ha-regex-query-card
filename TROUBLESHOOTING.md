# Troubleshooting Guide - Regex Query Card

This comprehensive guide covers solutions for common issues encountered when installing and using the Regex Query Card.

## Quick Fixes (Most Common Issues)

### 🔧 Card Not Appearing After HACS Installation

**Try these steps in order:**

1. **Restart Home Assistant** (Settings → System → Restart)
2. **Clear Browser Cache** (Ctrl+F5 or Cmd+Shift+R)
3. **Check HACS Installation** (HACS → Frontend → Verify "Regex Query Card" is installed)
4. **Verify File Exists** (Check `config/www/community/ha-regex-query-card/ha-regex-query-card.js`)

### 🔧 HACS Installation Fails

**"Repository structure for main is not compliant" Error:**
- This has been **fixed** in the current version
- Remove and re-add the repository in HACS
- Use repository URL: `https://github.com/yourusername/ha-regex-query-card`

## Detailed Troubleshooting

### HACS Installation Issues

#### Repository Structure Compliance Error

**Problem:** HACS shows "Repository structure for main is not compliant"

**Root Cause:** Earlier versions had incorrect file structure for HACS standards.

**Solution:**
```
✅ FIXED: Repository now has proper structure:
   - dist/ha-regex-query-card.js (correct location)
   - hacs.json with content_in_root: false
   - Proper filename specification
```

**Steps to Resolve:**
1. Remove repository from HACS custom repositories
2. Re-add using: `https://github.com/yourusername/ha-regex-query-card`
3. Install the card
4. Restart Home Assistant

#### HACS Installation Hangs or Fails

**Symptoms:**
- Installation process never completes
- "Installing..." message persists
- Network or download errors

**Solutions:**

1. **Update HACS**
   ```
   - Go to HACS → Settings
   - Check for HACS updates
   - Restart Home Assistant after updating
   ```

2. **Clear HACS Cache**
   ```
   - HACS → Settings → Clear cache
   - Restart Home Assistant
   - Try installation again
   ```

3. **Check Network Connectivity**
   ```
   - Verify Home Assistant can access GitHub
   - Test: Settings → System → Network
   - Check firewall/proxy settings
   ```

4. **Manual Installation Fallback**
   ```
   - Download ha-regex-query-card.js from releases
   - Copy to config/www/
   - Add resource manually
   ```

### Card Availability Issues

#### Card Not in Dashboard Editor

**Problem:** Card doesn't appear in "Add Card" dialog

**Diagnostic Steps:**

1. **Check HACS Installation Status**
   ```
   - Go to HACS → Frontend
   - Verify "Regex Query Card" shows as installed
   - Check version number is displayed
   ```

2. **Verify File Installation**
   ```bash
   # Check if file exists
   ls -la config/www/community/ha-regex-query-card/ha-regex-query-card.js
   
   # Check file size (should be > 10KB)
   ls -lh config/www/community/ha-regex-query-card/ha-regex-query-card.js
   ```

3. **Check Resource Registration**
   ```
   - Settings → Dashboards → Resources
   - Look for: /hacsfiles/ha-regex-query-card/ha-regex-query-card.js
   - Type should be: JavaScript Module
   ```

4. **Browser Console Check**
   ```
   - Open browser developer tools (F12)
   - Check Console tab for errors
   - Look for "Failed to load resource" or similar errors
   ```

**Solutions:**

1. **Restart Home Assistant** (Most common fix)
2. **Clear Browser Cache** (Second most common fix)
3. **Reinstall via HACS**
   ```
   - HACS → Frontend → Regex Query Card
   - Click "Redownload"
   - Restart Home Assistant
   ```

4. **Manual Resource Registration**
   ```yaml
   # Add to configuration.yaml if auto-registration fails
   lovelace:
     mode: yaml
     resources:
       - url: /hacsfiles/ha-regex-query-card/ha-regex-query-card.js
         type: module
   ```

### Card Functionality Issues

#### No Entities Displayed

**Problem:** Card shows "No entities found" or is empty

**Diagnostic Steps:**

1. **Test Simple Pattern**
   ```yaml
   type: custom:ha-regex-query-card
   pattern: ".*"  # Matches all entities
   max_entities: 5
   ```

2. **Check Entity IDs**
   ```
   - Go to Developer Tools → States
   - Verify entities exist
   - Check exact entity ID spelling
   ```

3. **Test Pattern in Browser Console**
   ```javascript
   // Open browser console (F12)
   const pattern = "^sensor\\.temperature_.*";
   const regex = new RegExp(pattern);
   console.log(regex.test("sensor.temperature_living_room"));
   ```

**Solutions:**

1. **Fix Regex Pattern**
   ```yaml
   # Common pattern fixes
   pattern: "sensor.temperature"     # Simple match
   pattern: "^sensor\\.temperature"  # Escape dots
   pattern: "^sensor\\..*temp.*"     # More flexible
   ```

2. **Check for Disabled Entities**
   ```
   - Settings → Devices & Services → Entities
   - Look for disabled entities
   - Enable if needed
   ```

3. **Use Exclude Pattern**
   ```yaml
   pattern: "^sensor\\..*"
   exclude_pattern: ".*(battery|unavailable).*"
   ```

#### Invalid Regex Pattern Error

**Problem:** Card shows "Invalid regex pattern" error

**Common Regex Mistakes:**
```yaml
# ❌ Wrong - unescaped dots
pattern: "sensor.temperature.*"

# ✅ Correct - escaped dots
pattern: "^sensor\\.temperature_.*"

# ❌ Wrong - invalid regex syntax
pattern: "sensor.temperature_[.*"

# ✅ Correct - valid regex syntax
pattern: "^sensor\\.temperature_.*$"
```

**Pattern Testing:**
```javascript
// Test in browser console
try {
  const regex = new RegExp("your_pattern_here");
  console.log("Pattern is valid");
} catch (e) {
  console.log("Pattern error:", e.message);
}
```

### Performance Issues

#### Slow Loading or Browser Lag

**Problem:** Card causes dashboard to load slowly or browser to lag

**Solutions:**

1. **Limit Entity Count**
   ```yaml
   max_entities: 20  # Reduce number of displayed entities
   ```

2. **Optimize Regex Pattern**
   ```yaml
   # ✅ Good - specific pattern
   pattern: "^sensor\\.temperature_.*"
   
   # ❌ Avoid - broad pattern that matches many entities
   pattern: ".*"
   ```

3. **Use Exclude Patterns**
   ```yaml
   pattern: "^sensor\\..*"
   exclude_pattern: ".*(battery|last_seen|signal_strength).*"
   ```

4. **Choose Appropriate Display Mode**
   ```yaml
   display_type: list    # Faster for many entities
   columns: 2           # Fewer columns = better performance
   ```

#### High Memory Usage

**Problem:** Browser memory usage increases significantly

**Solutions:**

1. **Reduce Entity Count**
   ```yaml
   max_entities: 15
   ```

2. **Simplify Display**
   ```yaml
   show_icon: false     # Reduces memory usage
   display_type: list   # More memory efficient than grid
   ```

3. **Use More Specific Patterns**
   ```yaml
   # Target specific entity types
   pattern: "^(sensor|binary_sensor)\\.temperature_.*"
   ```

### Browser Compatibility Issues

#### Card Not Loading in Older Browsers

**Supported Browsers:**
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ❌ Internet Explorer (not supported)

**Solutions:**

1. **Update Browser**
   - Use latest version of supported browser
   - Enable JavaScript

2. **Check Browser Console**
   ```
   - Open developer tools (F12)
   - Look for JavaScript errors
   - Common issues: "Module not supported" or syntax errors
   ```

3. **Disable Browser Extensions**
   ```
   - Try in incognito/private mode
   - Disable ad blockers temporarily
   - Check if extensions interfere
   ```

### Advanced Troubleshooting

#### Enable Debug Logging

Add to `configuration.yaml`:
```yaml
logger:
  default: warning
  logs:
    frontend.js.latest.202X: debug
    homeassistant.components.lovelace: debug
```

#### Network Debugging

Check Home Assistant network connectivity:
```bash
# Test GitHub access from Home Assistant
curl -I https://github.com/yourusername/ha-regex-query-card

# Check DNS resolution
nslookup github.com
```

#### File Permission Issues

Check file permissions:
```bash
# Verify file is readable
ls -la config/www/community/ha-regex-query-card/ha-regex-query-card.js

# Fix permissions if needed
chmod 644 config/www/community/ha-regex-query-card/ha-regex-query-card.js
```

## Validation Commands

For developers with repository access:

```bash
# Install dependencies
npm install

# Validate HACS compliance
npm run validate-hacs

# Test HACS installation structure
npm run test-hacs

# Run full validation suite
npm run validate

# Build and check output
npm run build && ls -la dist/
```

## Getting Help

### Before Reporting Issues

1. **Try Quick Fixes** (restart HA, clear cache)
2. **Check Browser Console** for JavaScript errors
3. **Test with Simple Configuration** to isolate the problem
4. **Verify Installation** using the verification steps

### When Reporting Issues

Include this information:

1. **Environment Details**
   ```
   - Home Assistant version
   - HACS version
   - Browser and version
   - Operating system
   ```

2. **Installation Method**
   ```
   - HACS or manual installation
   - Steps followed
   - Any error messages
   ```

3. **Card Configuration**
   ```yaml
   # Include your card configuration
   type: custom:ha-regex-query-card
   pattern: "your_pattern_here"
   # ... other settings
   ```

4. **Browser Console Errors**
   ```
   - Open developer tools (F12)
   - Copy any JavaScript errors
   - Include full error messages
   ```

5. **Home Assistant Logs**
   ```
   - Settings → System → Logs
   - Include relevant log entries
   - Look for frontend or Lovelace errors
   ```

### Support Channels

1. **GitHub Issues**: [Repository Issues](https://github.com/yourusername/ha-regex-query-card/issues)
2. **Home Assistant Community**: [Community Forum](https://community.home-assistant.io/)
3. **Discord**: Home Assistant Discord server
4. **Reddit**: r/homeassistant subreddit

## Common Error Messages

### "Failed to load resource"
- **Cause**: File not found or network issue
- **Fix**: Verify file exists, restart HA, clear cache

### "Module not found"
- **Cause**: Resource not registered or incorrect path
- **Fix**: Check Settings → Dashboards → Resources

### "Unexpected token"
- **Cause**: Corrupted or incomplete file download
- **Fix**: Reinstall via HACS or redownload manually

### "Invalid regex pattern"
- **Cause**: Malformed regular expression
- **Fix**: Test pattern syntax, escape special characters

### "No entities found"
- **Cause**: Pattern doesn't match any entities
- **Fix**: Check entity IDs, test with broader pattern

## Prevention Tips

1. **Always restart Home Assistant** after HACS installations
2. **Clear browser cache** after updates
3. **Test patterns** with simple configurations first
4. **Keep HACS updated** to latest version
5. **Use specific regex patterns** for better performance
6. **Limit entity count** for large installations
7. **Check browser compatibility** before reporting issues