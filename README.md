# aero-coord-convert-cli

**aero-coord-convert-cli** is a command-line tool for converting between various geographic coordinate formats commonly used in aviation and navigation systems.

## Features

- Detects and parses multiple coordinate input formats:
  - DMS (Degrees, Minutes, Seconds): e.g., `34°01′59.740″N, 118°48′38.950″W`
  - Decimal degrees: e.g., `39.0533333, -123.2744444`
  - ICAO style: e.g., `354555N 1402308E`
  - Aeronautical style: e.g., `354614.07N 1402234.89E`
- Converts between supported formats
- Interactive CLI with auto-format detection
- Graceful error handling and retry support
- Works offline

## Installation

To install globally using npm:

```bash
npm install -g aero-coord-convert-cli
