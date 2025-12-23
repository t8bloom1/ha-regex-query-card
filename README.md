# Home Assistant Regex Query Card

A custom Lovelace card for Home Assistant that dynamically displays entities based on regular expression patterns.

## Features

- 🔍 **Regex Pattern Matching**: Automatically discover entities using regular expressions
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Multiple Display Modes**: List and grid layouts with customizable columns
- 🔧 **Interactive Controls**: Click to toggle lights/switches or view sensor details
- ⚙️ **Visual Configuration**: Easy setup through Home Assistant's UI
- 🚀 **Real-time Updates**: Automatically updates when entities are added/removed

## Installation

### HACS Installation (Recommended)

**Prerequisites:**
- Home Assistant 2023.1.0 or later
- HACS (Home Assistant Community Store) installed

**Installation Steps:**
1. **Add Repository to HACS**
   - Open HACS → Frontend
   - Click "+" → "Custom repositories" (if needed)
   - Add repository URL: `https://github.com/yourusername/ha-regex-query-card`
   - Category: "Lovelace"

2. **Install the Card**
   - Search for "Regex Query Card" in HACS
   - Click "Install"
   - **Important**: Restart Home Assistant
   - **Important**: Clear browser cache (Ctrl+F5)

3. **Verify Installation**
   - Go to any dashboard → Edit → Add Card
   - Search for "Regex Query Card"
   - Card should appear in the picker

**Repository Structure:**
```
ha-regex-query-card/
├── dist/
│   └── ha-regex-query-card.js    # Main card file (HACS compliant location)
├── src/                          # Source files
├── hacs.json                     # HACS metadata
├── info.md                       # HACS info page
└── README.md                     # This file
```

### Manual Installation

1. **Download Release**
   - Get `ha-regex-query-card.js` from [latest release](https://github.com/yourusername/ha-regex-query-card/releases)

2. **Install File**
   - Copy to `config/www/ha-regex-query-card.js`
   - Add resource: Settings → Dashboards → Resources
   - URL: `/local/ha-regex-query-card.js`
   - Type: "JavaScript Module"

3. **Complete Setup**
   - Restart Home Assistant
   - Clear browser cache

📖 **[Complete Installation Guide](INSTALL.md)** - Detailed instructions, troubleshooting, and verification steps

## Quick Configuration

```yaml
type: custom:ha-regex-query-card
pattern: "^sensor\\.temperature_.*"
title: "Temperature Sensors"
display_type: grid
columns: 3
```

**Configuration Options:**
- `pattern` - Regex to match entity IDs and display names (required)
- `value_filter` - Filter by entity state values (e.g., "<55", ">20", "=on")
- `exclude_pattern` - Regex to exclude entities

**Pattern Search Examples:**
```yaml
# Search by entity ID
pattern: "^sensor\\.temperature_.*"

# Search by display name (friendly name)
pattern: "XS Sensor Battery Level"

# Search for entities with "Battery" in the name
pattern: "Battery"

# Search for temperature sensors by name or ID
pattern: "(temperature|Temperature)"

# Complex pattern matching multiple criteria
pattern: "(battery|Battery|XS.*Sensor)"
```

**Value Filter Examples:**
```yaml
# Battery levels less than 55%
pattern: "Battery"
value_filter: "<55"

# Temperature above 20 degrees
pattern: "temperature"
value_filter: ">20"

# Entities with specific state
pattern: "light"
value_filter: "=on"

# Humidity not equal to 0
pattern: "humidity"
value_filter: "!=0"

# Power consumption less than or equal to 100W
pattern: "power"
value_filter: "<=100"
```

**Supported Value Filter Operators:**
- `<` - Less than
- `<=` - Less than or equal
- `>` - Greater than  
- `>=` - Greater than or equal
- `=` - Equal to
- `!=` - Not equal to

**Note**: Patterns search both entity IDs and display names (friendly names). Value filters work on numeric values and string states.
- `exclude_pattern` - Regex to exclude entities
- `display_type` - `list` or `grid` layout
- `columns` - Grid columns (1-6)
- `sort_by` - Sort by `name`, `state`, or `last_changed`
- `max_entities` - Limit displayed entities

See [INSTALL.md](INSTALL.md) for all configuration options and examples.

## Troubleshooting

### HACS Installation Issues

**"Repository structure for main is not compliant" error:**
- This has been fixed in the latest version
- Ensure you're using the correct repository URL
- Try removing and re-adding the repository

**Card not appearing after HACS installation:**
1. **Restart Home Assistant** (required after HACS installation)
2. **Clear browser cache** (Ctrl+F5 or Cmd+Shift+R)
3. **Verify installation**: Check HACS → Frontend → Installed

**HACS installation fails:**
- Verify repository URL: `https://github.com/yourusername/ha-regex-query-card`
- Check HACS logs: Settings → System → Logs
- Ensure HACS is up to date
- Try manual installation as fallback

### Card Usage Issues

**Card not appearing in dashboard editor:**
- Clear browser cache (Ctrl+F5)
- Restart Home Assistant
- Check Settings → Dashboards → Resources for the card resource

**No entities showing:**
- Verify regex pattern matches your entity IDs
- Check Developer Tools → States for entity names
- Start with simple pattern like `sensor.temperature`
- Use exclude patterns to filter unwanted entities

**Performance issues:**
- Limit entities with `max_entities: 20`
- Use specific regex patterns instead of broad ones
- Consider using exclude patterns to reduce matches

### Installation Verification

Run these commands to verify your installation:

```bash
# Check HACS installation
npm run validate-hacs

# Verify build output
npm run validate

# Test HACS structure
npm run test-hacs
```

📖 **[Complete Troubleshooting Guide](TROUBLESHOOTING.md)** - Comprehensive solutions for all common issues
📖 **[Installation Guide](INSTALL.md)** - Detailed installation instructions and verification steps

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Validate HACS compliance
npm run validate-hacs
```

## License

Apache License 2.0 - see LICENSE file for details.