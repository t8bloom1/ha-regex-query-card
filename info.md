# Regex Query Card

A powerful Home Assistant custom card that dynamically displays entities based on regular expression patterns.

## Features

- **Dynamic Entity Discovery**: Automatically finds and displays entities matching regex patterns
- **Real-time Updates**: Automatically updates when entities are added or removed
- **Multiple Display Modes**: Choose between list and grid layouts
- **Entity Interactions**: Click to toggle switches/lights or view sensor details
- **Advanced Filtering**: Exclude patterns, sorting, and entity limits
- **Visual Configuration**: Easy-to-use configuration editor in the dashboard UI

## Installation

### HACS (Recommended)

**The repository structure has been optimized for HACS compliance to ensure smooth installation.**

1. **Add Repository**: Open HACS → Frontend → "+" → Add repository URL
2. **Install Card**: Search for "Regex Query Card" → Install
3. **Restart Home Assistant** ⚠️ **Required step**
4. **Clear Browser Cache** ⚠️ **Required step** (Ctrl+F5 or Cmd+Shift+R)
5. **Verify**: Card appears in dashboard editor's card picker

**HACS Compliance Features:**
- ✅ Correct file structure (`dist/ha-regex-query-card.js`)
- ✅ Proper `hacs.json` configuration
- ✅ HACS validation passing
- ✅ Automated resource registration

### Manual Installation

1. Download `ha-regex-query-card.js` from the latest release
2. Copy it to `config/www/` directory
3. Add the resource in your Lovelace configuration:
   ```yaml
   resources:
     - url: /local/ha-regex-query-card.js
       type: module
   ```

## Configuration

Add the card to your dashboard with a configuration like:

```yaml
type: custom:ha-regex-query-card
pattern: "^sensor\\.temperature_.*"
display_type: grid
columns: 3
title: "Temperature Sensors"
```

## Documentation

- **[Installation Guide](INSTALL.md)** - Complete installation instructions and verification
- **[Troubleshooting Guide](TROUBLESHOOTING.md)** - Solutions for common issues
- **[README](README.md)** - Full documentation and configuration options

## Support

For issues and feature requests:
- **[GitHub Issues](https://github.com/yourusername/ha-regex-query-card/issues)** - Bug reports and feature requests
- **[Troubleshooting Guide](TROUBLESHOOTING.md)** - Self-service solutions
- **[Home Assistant Community](https://community.home-assistant.io/)** - Community support