# Installation Guide - Regex Query Card

This guide provides detailed instructions for installing the Regex Query Card in Home Assistant via HACS or manual installation. The repository structure has been optimized for HACS compliance to ensure smooth installation.

## Repository Structure

The repository follows HACS frontend standards with the following structure:

```
ha-regex-query-card/
├── dist/                           # Built files (HACS compliant location)
│   └── ha-regex-query-card.js      # Main card file
├── src/                            # Source TypeScript files
│   ├── ha-regex-query-card.ts      # Main card implementation
│   ├── types.ts                    # Type definitions
│   └── utils.ts                    # Utility functions
├── scripts/                        # Build and validation scripts
│   ├── validate-hacs.cjs           # HACS structure validation
│   ├── validate-build.cjs          # Build output validation
│   └── test-hacs-installation.cjs  # Installation testing
├── hacs.json                       # HACS metadata configuration
├── info.md                         # HACS information page
├── README.md                       # Main documentation
├── INSTALL.md                      # This installation guide
├── package.json                    # Node.js project configuration
├── rollup.config.js                # Build configuration
└── tsconfig.json                   # TypeScript configuration
```

**Key HACS Compliance Features:**
- `content_in_root: false` - Files are in `dist/` subdirectory
- `filename: "ha-regex-query-card.js"` - Matches actual file location
- Built file is at `dist/ha-regex-query-card.js` (HACS expected location)
- All metadata files are properly configured

## HACS Installation (Recommended)

### Prerequisites
- Home Assistant 2023.1.0 or later
- HACS (Home Assistant Community Store) installed and configured

### Step-by-Step Installation

1. **Open HACS**
   - Navigate to HACS in your Home Assistant sidebar
   - Click on "Frontend" section

2. **Add Repository** (if not already available)
   - Click the "⋮" menu in the top right corner
   - Select "Custom repositories"
   - Enter repository URL: `https://github.com/yourusername/ha-regex-query-card`
   - Select "Lovelace" as the category
   - Click "Add"

3. **Install the Card**
   - Search for "Regex Query Card" in HACS Frontend section
   - Click on the card when it appears in search results
   - Click "Download" or "Install"
   - Wait for the installation to complete (you'll see a success message)

4. **Restart Home Assistant** ⚠️ **Critical Step**
   - Go to Settings → System → Restart
   - Wait for Home Assistant to fully restart (usually 1-2 minutes)
   - **This step is required** - the card won't appear without restart

5. **Clear Browser Cache** ⚠️ **Critical Step**
   - **Hard refresh**: Ctrl+F5 (Windows/Linux) or Cmd+Shift+R (Mac)
   - **Or clear cache**: Browser settings → Clear browsing data → Cached files
   - **This step is required** - browsers cache JavaScript modules

6. **Verify Installation**
   - Go to any dashboard
   - Click "Edit Dashboard" (pencil icon)
   - Click "Add Card" (+ button)
   - Search for "Regex Query Card" in the card picker
   - The card should appear in the available cards list

### Installation Verification Checklist

After installation, verify these items:

- [ ] **HACS Shows Installed**: HACS → Frontend → "Regex Query Card" shows as installed
- [ ] **File Exists**: Check that `config/www/community/ha-regex-query-card/ha-regex-query-card.js` exists
- [ ] **Resource Registered**: Settings → Dashboards → Resources shows the card resource
- [ ] **Card Available**: Card appears in dashboard editor's card picker
- [ ] **No Console Errors**: Browser developer tools (F12) show no JavaScript errors

### Post-Installation Validation

You can run these validation commands if you have the repository cloned:

```bash
# Validate HACS compliance
npm run validate-hacs

# Test HACS installation structure
npm run test-hacs

# Full validation suite
npm run validate
```

## Manual Installation

### Prerequisites
- Home Assistant 2023.1.0 or later
- Access to your Home Assistant configuration directory

### Step-by-Step Installation

1. **Download the Card**
   - Go to the [releases page](https://github.com/yourusername/ha-regex-query-card/releases)
   - Download the latest `ha-regex-query-card.js` file

2. **Copy to www Directory**
   ```bash
   # Create www directory if it doesn't exist
   mkdir -p config/www
   
   # Copy the downloaded file
   cp ha-regex-query-card.js config/www/
   ```

3. **Add Resource to Lovelace**
   - Go to Settings → Dashboards → Resources
   - Click "Add Resource"
   - Enter URL: `/local/ha-regex-query-card.js`
   - Select Resource Type: "JavaScript Module"
   - Click "Create"

4. **Restart Home Assistant**
   - Go to Settings → System → Restart
   - Wait for Home Assistant to fully restart

5. **Clear Browser Cache**
   - Hard refresh your browser (Ctrl+F5 or Cmd+Shift+R)

6. **Verify Installation**
   - Follow step 6 from HACS installation above

## Configuration

Once installed, you can add the card to any dashboard:

### Basic Configuration
```yaml
type: custom:ha-regex-query-card
pattern: "^sensor\\.temperature_.*"
title: "Temperature Sensors"
```

### Advanced Configuration
```yaml
type: custom:ha-regex-query-card
pattern: "^(sensor|binary_sensor)\\..*_temperature.*"
exclude_pattern: ".*_battery$"
title: "Temperature Sensors"
display_type: grid
columns: 3
sort_by: name
sort_order: asc
max_entities: 20
show_name: true
show_state: true
show_icon: true
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `pattern` | string | **Required** | Regular expression to match entity IDs |
| `exclude_pattern` | string | Optional | Regular expression to exclude entities |
| `title` | string | Optional | Card title |
| `display_type` | string | `list` | Display mode: `list` or `grid` |
| `columns` | number | `3` | Number of columns for grid display |
| `sort_by` | string | `name` | Sort criteria: `name`, `state`, or `last_changed` |
| `sort_order` | string | `asc` | Sort order: `asc` or `desc` |
| `max_entities` | number | Optional | Maximum number of entities to display |
| `show_name` | boolean | `true` | Show entity names |
| `show_state` | boolean | `true` | Show entity states |
| `show_icon` | boolean | `true` | Show entity icons |

## Troubleshooting

### HACS Installation Issues

#### "Repository structure for main is not compliant" Error

**Symptoms:**
- HACS shows this error when trying to install
- Installation fails with compliance message

**Root Cause:**
This error occurred in earlier versions due to incorrect file structure. The repository has been fixed to comply with HACS standards.

**Solutions:**
1. **Use Latest Version**
   ```
   - Ensure you're using the latest repository version
   - The file structure has been corrected to place files in dist/ directory
   - hacs.json now correctly specifies content_in_root: false
   ```

2. **Remove and Re-add Repository**
   ```
   - Go to HACS → Frontend → ⋮ → Custom repositories
   - Remove the old repository entry
   - Re-add using: https://github.com/yourusername/ha-regex-query-card
   - Try installation again
   ```

3. **Verify Repository Structure**
   ```
   The repository now has HACS-compliant structure:
   ✅ dist/ha-regex-query-card.js (main file in correct location)
   ✅ hacs.json with content_in_root: false
   ✅ info.md for HACS information page
   ✅ Proper filename specification matching actual file
   ```

#### HACS Installation Fails or Hangs

**Symptoms:**
- Installation process starts but never completes
- HACS shows "Installing..." indefinitely
- Download fails with network errors

**Solutions:**
1. **Check HACS Version**
   ```
   - Ensure HACS is updated to latest version
   - Go to HACS → Settings → Check for updates
   - Restart Home Assistant after HACS updates
   ```

2. **Network Connectivity**
   ```
   - Verify Home Assistant can access GitHub
   - Check firewall/proxy settings
   - Test with: Settings → System → Network
   ```

3. **Clear HACS Cache**
   ```
   - Go to HACS → Settings
   - Click "Clear cache"
   - Restart Home Assistant
   - Try installation again
   ```

4. **Manual Installation Fallback**
   ```
   - If HACS continues to fail, use manual installation
   - Download ha-regex-query-card.js from releases
   - Follow manual installation steps below
   ```

### Card Not Appearing in Card Picker

**Symptoms:**
- Card is not visible in the "Add Card" dialog
- No "Regex Query Card" option when adding cards
- HACS shows card as installed but it's not available

**Solutions:**

1. **Restart Home Assistant** ⚠️ **Most Common Fix**
   ```
   - Go to Settings → System → Restart
   - Wait for complete restart (1-2 minutes)
   - This is REQUIRED after HACS installation
   ```

2. **Clear Browser Cache** ⚠️ **Second Most Common Fix**
   ```
   - Hard refresh: Ctrl+F5 (Windows/Linux) or Cmd+Shift+R (Mac)
   - Or clear browser cache completely
   - Try in incognito/private browsing mode to test
   ```

3. **Verify File Installation**
   ```bash
   # Check if HACS installed the file correctly
   ls -la config/www/community/ha-regex-query-card/ha-regex-query-card.js
   
   # File should exist and be readable
   # If missing, try reinstalling via HACS
   ```

4. **Check Resource Registration**
   ```
   - Go to Settings → Dashboards → Resources
   - Look for entry like: /hacsfiles/ha-regex-query-card/ha-regex-query-card.js
   - If missing, try: HACS → Frontend → Regex Query Card → Redownload
   ```

5. **Browser Developer Tools Check**
   ```
   - Open browser developer tools (F12)
   - Go to Console tab
   - Look for JavaScript errors related to the card
   - Common errors:
     * "Failed to load resource"
     * "Module not found"
     * "Unexpected token" (indicates file corruption)
   ```

### Card Shows Error Messages

**Symptoms:**
- Card displays but shows error messages
- "Invalid regex pattern" error
- "No entities found" message
- Card functionality doesn't work

**Solutions:**

1. **Validate Regex Pattern**
   ```javascript
   // Test your pattern in browser console (F12)
   const pattern = "^sensor\\.temperature_.*";
   const regex = new RegExp(pattern);
   console.log(regex.test("sensor.temperature_living_room")); // Should be true
   ```

2. **Check Entity IDs**
   ```
   - Go to Developer Tools → States
   - Verify your entities exist and match the pattern
   - Check for typos in entity IDs
   - Ensure entities are not disabled
   ```

3. **Simplify Pattern for Testing**
   ```yaml
   # Start with simple pattern
   pattern: "sensor.temperature"
   
   # Then make it more specific
   pattern: "^sensor\\.temperature_.*"
   
   # Avoid overly complex patterns initially
   ```

4. **Check Card Configuration**
   ```yaml
   # Minimal working configuration
   type: custom:ha-regex-query-card
   pattern: "^sensor\\..*"  # Match all sensors
   title: "Test Card"
   ```

### Performance Issues

**Symptoms:**
- Dashboard loads slowly
- Browser becomes unresponsive
- High memory usage
- Card takes long time to render

**Solutions:**

1. **Limit Entity Count**
   ```yaml
   type: custom:ha-regex-query-card
   pattern: "^sensor\\.temperature_.*"
   max_entities: 20  # Limit displayed entities
   ```

2. **Optimize Regex Pattern**
   ```yaml
   # More specific patterns are faster
   pattern: "^sensor\\.temperature_.*"  # Good - specific
   pattern: ".*temperature.*"           # Slower - broad search
   ```

3. **Use Exclude Patterns**
   ```yaml
   pattern: "^sensor\\..*"
   exclude_pattern: ".*(battery|signal_strength|last_seen).*"
   ```

4. **Choose Appropriate Display Mode**
   ```yaml
   display_type: list    # Faster for many entities
   # vs
   display_type: grid    # More resource intensive
   columns: 2           # Fewer columns = better performance
   ```

### Browser Compatibility Issues

**Symptoms:**
- Card doesn't load in older browsers
- JavaScript errors in console
- Card appears broken or unstyled

**Solutions:**

1. **Update Browser**
   ```
   Supported browsers:
   ✅ Chrome 90+ (recommended)
   ✅ Firefox 88+
   ✅ Safari 14+
   ✅ Edge 90+
   
   ❌ Internet Explorer (not supported)
   ❌ Very old browser versions
   ```

2. **Enable JavaScript**
   ```
   - Ensure JavaScript is enabled in browser settings
   - Check if ad blockers are interfering
   - Try disabling browser extensions temporarily
   ```

3. **Check Console Errors**
   ```
   - Open browser developer tools (F12)
   - Look for JavaScript errors in console
   - Report errors with browser version if issues persist
   ```

### Installation Verification Steps

After installation, systematically verify each step:

#### 1. HACS Installation Verification
- [ ] **HACS Shows Installed**: HACS → Frontend → "Regex Query Card" appears in installed list
- [ ] **Version Displayed**: Version number shows correctly
- [ ] **No Error Messages**: No red error indicators in HACS

#### 2. File System Verification
```bash
# Check if files were installed correctly
ls -la config/www/community/ha-regex-query-card/
# Should show: ha-regex-query-card.js

# Check file size (should be > 10KB)
ls -lh config/www/community/ha-regex-query-card/ha-regex-query-card.js
```

#### 3. Resource Registration Verification
- [ ] **Resource Listed**: Settings → Dashboards → Resources shows card resource
- [ ] **Correct Path**: Path shows `/hacsfiles/ha-regex-query-card/ha-regex-query-card.js`
- [ ] **Type Correct**: Type shows "JavaScript Module"

#### 4. Dashboard Integration Verification
- [ ] **Card Picker**: Card appears when clicking "Add Card"
- [ ] **Search Works**: Searching "regex" finds the card
- [ ] **Configuration Opens**: Card configuration dialog opens without errors

#### 5. Functionality Verification
- [ ] **Basic Configuration**: Simple pattern works (e.g., `sensor.*`)
- [ ] **Entity Display**: Entities matching pattern are displayed
- [ ] **Real-time Updates**: Card updates when entity states change
- [ ] **Interactions Work**: Clicking entities triggers appropriate actions

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

#### Manual Resource Registration

If HACS resource registration fails:
```yaml
# Add to configuration.yaml
lovelace:
  mode: yaml
  resources:
    - url: /hacsfiles/ha-regex-query-card/ha-regex-query-card.js
      type: module
```

#### Test with Minimal Configuration

Create a test card with minimal configuration:
```yaml
type: custom:ha-regex-query-card
pattern: ".*"
title: "All Entities Test"
max_entities: 5
```

### Card Shows Error Messages

**Symptoms:**
- "Invalid regex pattern" error
- "No entities found" message
- Card displays but shows errors

**Solutions:**
1. **Validate Regex Pattern**
   ```javascript
   // Test your pattern in browser console
   const pattern = "^sensor\\.temperature_.*";
   const regex = new RegExp(pattern);
   console.log(regex.test("sensor.temperature_living_room")); // Should be true
   ```

2. **Check Entity IDs**
   - Go to Developer Tools → States
   - Verify your entities exist and match the pattern
   - Check for typos in entity IDs

3. **Simplify Pattern**
   ```yaml
   # Start with simple pattern
   pattern: "sensor.temperature"
   
   # Then make it more specific
   pattern: "^sensor\\.temperature_.*"
   ```

### Performance Issues

**Symptoms:**
- Dashboard loads slowly
- Browser becomes unresponsive
- High memory usage

**Solutions:**
1. **Limit Entity Count**
   ```yaml
   max_entities: 20  # Limit displayed entities
   ```

2. **Optimize Regex Pattern**
   ```yaml
   # More specific patterns are faster
   pattern: "^sensor\\.temperature_.*"  # Good
   pattern: ".*temperature.*"           # Slower
   ```

3. **Use Exclude Patterns**
   ```yaml
   pattern: "^sensor\\..*"
   exclude_pattern: ".*(battery|signal_strength).*"
   ```

### Browser Compatibility Issues

**Symptoms:**
- Card doesn't load in older browsers
- JavaScript errors in console

**Solutions:**
1. **Update Browser**
   - Use modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
   - Enable JavaScript

2. **Check Console Errors**
   - Open browser developer tools (F12)
   - Look for JavaScript errors in console
   - Report errors with browser version

## Complete Installation Verification

### Automated Verification (For Developers)

If you have the repository cloned, run these validation commands:

```bash
# Install dependencies
npm install

# Validate HACS compliance
npm run validate-hacs

# Test HACS installation structure
npm run test-hacs

# Run full validation suite
npm run validate

# Check build output
npm run build && ls -la dist/
```

### Manual Verification Steps

#### Step 1: HACS Installation Verification
- [ ] **HACS Frontend**: Card appears in HACS → Frontend → Installed
- [ ] **Version Shown**: Version number displays correctly
- [ ] **No Errors**: No red error indicators or warning messages
- [ ] **File Installed**: File exists at `config/www/community/ha-regex-query-card/ha-regex-query-card.js`

#### Step 2: Home Assistant Integration
- [ ] **Resource Registered**: Settings → Dashboards → Resources shows the card
- [ ] **Correct Path**: Resource path is `/hacsfiles/ha-regex-query-card/ha-regex-query-card.js`
- [ ] **Module Type**: Resource type is "JavaScript Module"
- [ ] **No Console Errors**: Browser developer tools (F12) show no JavaScript errors

#### Step 3: Dashboard Availability
- [ ] **Card Picker**: Card appears when clicking "Add Card" in dashboard editor
- [ ] **Search Function**: Searching "regex" or "query" finds the card
- [ ] **Icon Display**: Card shows with proper icon and name
- [ ] **Configuration Opens**: Clicking card opens configuration dialog

#### Step 4: Basic Functionality Test

Create a test card with this configuration:
```yaml
type: custom:ha-regex-query-card
pattern: "^sensor\\..*"
title: "Test - All Sensors"
display_type: list
max_entities: 10
```

Verify:
- [ ] **Entities Display**: Card shows sensor entities
- [ ] **Pattern Matching**: Only sensors are displayed (entity IDs start with "sensor.")
- [ ] **Entity Count**: Respects max_entities limit
- [ ] **Real-time Updates**: Card updates when sensor states change

#### Step 5: Advanced Features Test

Test advanced configuration:
```yaml
type: custom:ha-regex-query-card
pattern: "^(sensor|binary_sensor)\\..*temperature.*"
exclude_pattern: ".*battery.*"
title: "Temperature Sensors"
display_type: grid
columns: 3
sort_by: name
sort_order: asc
show_name: true
show_state: true
show_icon: true
```

Verify:
- [ ] **Complex Pattern**: Matches sensors and binary_sensors with "temperature" in name
- [ ] **Exclude Pattern**: Filters out entities with "battery" in name
- [ ] **Grid Display**: Shows entities in grid layout with 3 columns
- [ ] **Sorting**: Entities are sorted alphabetically by name
- [ ] **Visual Elements**: Names, states, and icons are displayed

#### Step 6: Interaction Testing
- [ ] **Switch Toggle**: Clicking switches toggles them on/off
- [ ] **Light Control**: Clicking lights opens light control dialog
- [ ] **Sensor Details**: Clicking sensors shows more-info dialog
- [ ] **State Updates**: Card reflects state changes immediately

### Performance Verification

#### Load Time Test
- [ ] **Fast Loading**: Card appears within 2 seconds of dashboard load
- [ ] **No Lag**: Dashboard remains responsive while card loads
- [ ] **Memory Usage**: Browser memory usage remains reasonable

#### Stress Test
Create a card with many entities:
```yaml
type: custom:ha-regex-query-card
pattern: ".*"
max_entities: 50
```

Verify:
- [ ] **Handles Load**: Card displays without freezing browser
- [ ] **Responsive**: Card remains interactive with many entities
- [ ] **Performance**: No significant slowdown in dashboard

### Troubleshooting Verification

Test common issues are resolved:

#### Cache Issues
- [ ] **Hard Refresh**: Ctrl+F5 shows latest card version
- [ ] **Incognito Mode**: Card works in private/incognito browsing
- [ ] **Multiple Browsers**: Card works in different browsers

#### Configuration Issues
- [ ] **Invalid Regex**: Card shows helpful error for invalid patterns
- [ ] **No Matches**: Card displays "No entities found" when pattern matches nothing
- [ ] **Empty Config**: Card shows configuration help when required fields missing

#### Update Process
- [ ] **HACS Updates**: Card updates properly through HACS
- [ ] **Version Display**: New version number shows after update
- [ ] **Functionality Preserved**: Existing card configurations continue working

## Additional Resources

### Documentation
- **[Troubleshooting Guide](TROUBLESHOOTING.md)** - Comprehensive solutions for all issues
- **[README.md](README.md)** - Main documentation and usage examples
- **[GitHub Repository](https://github.com/yourusername/ha-regex-query-card)** - Source code and releases

### Getting Help

If you continue to experience issues:

1. **Check Troubleshooting Guide**
   - Review [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for detailed solutions
   - Follow the diagnostic steps for your specific issue

2. **Search Existing Issues**
   - Visit [GitHub Issues](https://github.com/yourusername/ha-regex-query-card/issues)
   - Search for similar problems and solutions

3. **Report New Issues**
   Include this information when creating a new issue:
   - Home Assistant version
   - HACS version
   - Browser and version
   - Card configuration (YAML)
   - Browser console errors (F12 → Console)
   - Home Assistant logs (Settings → System → Logs)
   - Steps to reproduce the problem

4. **Community Support**
   - [Home Assistant Community Forum](https://community.home-assistant.io/)
   - Home Assistant Discord server
   - Reddit r/homeassistant

## Version Compatibility

| Card Version | Home Assistant Version | HACS Version |
|--------------|------------------------|--------------|
| 1.0.x        | 2023.1.0+             | 1.30.0+      |

## Update Instructions

### HACS Updates
- HACS will notify you of available updates
- Click "Update" in HACS when prompted
- Restart Home Assistant after update

### Manual Updates
- Download new version from releases
- Replace the old file in `config/www/`
- Clear browser cache
- Restart Home Assistant