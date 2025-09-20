# NetworkAnalyzer - Advanced Protocol Analysis

A powerful network packet analysis tool with support for TLS, MQTT, and custom binary protocols. This tool extends the existing exe-builder service with comprehensive protocol analysis capabilities.

## Features

### 🔒 **TLS/SSL Protocol Analyzer**
- **Handshake Analysis**: Detects and parses TLS handshake messages (Client Hello, Server Hello, Certificate, etc.)
- **Version Detection**: Supports TLS 1.0, 1.1, 1.2, and 1.3
- **Certificate Analysis**: Basic certificate parsing and length detection
- **Alert Analysis**: Comprehensive TLS alert message parsing
- **Cipher Suite Detection**: Identifies cipher suites in handshake messages

### 📡 **MQTT Protocol Analyzer**
- **Message Type Detection**: Supports all MQTT message types (CONNECT, PUBLISH, SUBSCRIBE, etc.)
- **QoS Analysis**: Quality of Service level detection
- **Topic Parsing**: Topic name and filter extraction
- **Payload Analysis**: JSON and text payload detection
- **Keep-Alive Monitoring**: Connection keep-alive analysis

### 🛠️ **Custom Binary Protocol Analyzer**
- **Pattern-Based Detection**: Configurable byte patterns for protocol identification
- **Field Definitions**: Support for various data types (integers, floats, strings, bit fields)
- **Endianness Support**: Big-endian and little-endian byte order
- **Common Pattern Detection**: Automatic detection of magic numbers, checksums, and ASCII strings
- **Pre-configured Analyzers**: Built-in support for Modbus RTU and DNS protocols

## API Endpoints

### Get Available Analyzers
```http
GET /api/analyzers
```
Returns list of all available protocol analyzers.

### Analyze Single Packet
```http
POST /api/analyze-packet
Content-Type: application/json

{
  "packetData": "160301003e0100003a...",
  "metadata": {
    "port": 443,
    "sourcePort": 12345
  }
}
```

### Analyze Multiple Packets
```http
POST /api/analyze-packets
Content-Type: application/json

{
  "packets": [
    {
      "data": "160301003e...",
      "metadata": {"port": 443}
    },
    {
      "data": "101a0004...",
      "metadata": {"port": 1883}
    }
  ]
}
```

### Create Custom Analyzer
```http
POST /api/custom-analyzer
Content-Type: application/json

{
  "config": {
    "name": "My Protocol",
    "ports": [8080, 8443],
    "patterns": [{
      "name": "Magic Number",
      "offset": 0,
      "bytes": [0xDE, 0xAD, 0xBE, 0xEF],
      "minLength": 8
    }],
    "fieldDefinitions": [{
      "name": "messageType",
      "type": "uint8",
      "offset": 4,
      "description": "Message type field"
    }]
  }
}
```

### Test Endpoint
```http
GET /api/test
```
Returns sample analysis results for TLS and MQTT packets.

## Usage Examples

### 1. Analyzing a TLS Client Hello

```javascript
const tlsPacket = "160301003e0100003a030352d63925...";
const response = await fetch('/api/analyze-packet', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    packetData: tlsPacket,
    metadata: { port: 443 }
  })
});
const result = await response.json();
```

### 2. Creating a Custom Protocol Analyzer

```javascript
const customConfig = {
  name: "Industrial Protocol",
  ports: [502],
  patterns: [{
    name: "Header Pattern",
    offset: 0,
    bytes: [0x01, 0x03], // Function code 3 (Read Holding Registers)
    minLength: 8
  }],
  fieldDefinitions: [
    { name: "deviceId", type: "uint8", offset: 0 },
    { name: "functionCode", type: "uint8", offset: 1 },
    { name: "dataAddress", type: "uint16", offset: 2 },
    { name: "dataLength", type: "uint16", offset: 4 }
  ]
};
```

### 3. Batch Analysis

```javascript
const packets = [
  { data: "tls_packet_hex", metadata: { port: 443 } },
  { data: "mqtt_packet_hex", metadata: { port: 1883 } },
  { data: "dns_packet_hex", metadata: { port: 53 } }
];

const results = await fetch('/api/analyze-packets', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({ packets })
});
```

## Web Interface

Access the web interface at `http://localhost:3000` to:

- 🔍 **Analyze packets** with a user-friendly interface
- 📋 **View available analyzers** and their capabilities  
- 🛠️ **Create custom analyzers** with configuration wizard
- 🧪 **Test with sample data** for common protocols

## Installation and Running

```bash
# Install dependencies
npm install

# Start the server
node server.js
```

The server will start on port 3000 and display available analyzers and endpoints.

## Protocol Support Details

### TLS Analysis Results
- Content type (Handshake, Application Data, Alert, Change Cipher Spec)
- TLS version detection
- Handshake message parsing (Client Hello, Server Hello, Certificate)
- Cipher suite identification
- Alert message details

### MQTT Analysis Results
- Message type and flags (DUP, QoS, RETAIN)
- Protocol version and keep-alive settings
- Topic names and subscription filters
- Payload content detection (JSON, text, binary)
- Connection flags and status codes

### Custom Binary Analysis Results
- Pattern matching results
- Field extraction based on data types
- Automatic pattern detection (magic numbers, checksums, strings)
- Raw data sections with hex and ASCII representation

## Architecture

The NetworkAnalyzer uses a modular architecture:

```
NetworkAnalyzer (main coordinator)
├── TLSAnalyzer (handles SSL/TLS traffic)
├── MQTTAnalyzer (handles MQTT messages)  
├── CustomBinaryAnalyzer (configurable for any protocol)
└── ProtocolAnalyzer (base class for all analyzers)
```

Each analyzer implements:
- `canAnalyze(packet, metadata)` - Protocol detection
- `analyze(packet, metadata)` - Protocol parsing
- `getProtocolInfo()` - Analyzer information

## Extending the System

To add a new protocol analyzer:

1. Extend the `ProtocolAnalyzer` base class
2. Implement the required methods (`canAnalyze`, `analyze`, `getProtocolInfo`)
3. Add the analyzer to the `NetworkAnalyzer` constructor
4. The analyzer will automatically be available via the API

Example:
```javascript
import ProtocolAnalyzer from './ProtocolAnalyzer.js';

class HTTPAnalyzer extends ProtocolAnalyzer {
  constructor() {
    super('HTTP');
  }

  canAnalyze(packet, metadata) {
    // HTTP detection logic
    return packet.toString('ascii').startsWith('GET ') || 
           packet.toString('ascii').startsWith('POST ');
  }

  analyze(packet, metadata) {
    // HTTP parsing logic
    return {
      protocol: 'HTTP',
      // ... analysis results
    };
  }
}
```

This modular design makes it easy to add support for new protocols while maintaining a consistent API interface.