# NetworkAnalyzer - Example Usage

This document provides practical examples of using the NetworkAnalyzer API endpoints and web interface.

## Quick Start

1. Start the server:
```bash
node server.js
```

2. Access the web interface at `http://localhost:3000`

3. Or use the API endpoints directly:

## API Examples

### 1. List Available Analyzers

```bash
curl -X GET http://localhost:3000/api/analyzers
```

Response:
```json
{
  "analyzers": [
    {
      "name": "TLS",
      "info": {
        "name": "TLS/SSL",
        "description": "Transport Layer Security protocol analyzer",
        "supportedPorts": [443, 993, 995, 465]
      }
    },
    {
      "name": "MQTT",
      "info": {
        "name": "MQTT",
        "description": "Message Queuing Telemetry Transport protocol analyzer",
        "supportedPorts": [1883, 8883, 1884, 8884]
      }
    },
    {
      "name": "CustomBinary",
      "info": {
        "name": "Custom Binary",
        "description": "Configurable analyzer for custom binary protocols",
        "supportedPorts": [53]
      }
    }
  ]
}
```

### 2. Analyze a TLS Client Hello Packet

```bash
curl -X POST http://localhost:3000/api/analyze-packet \
  -H "Content-Type: application/json" \
  -d '{
    "packetData": "160301003e0100003a030352d63925c7c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8000002c030010000",
    "metadata": {"port": 443}
  }'
```

The analyzer will detect:
- Content Type: Handshake
- TLS Version: TLS 1.2
- Message Type: Client Hello
- Cipher Suites Count: 128
- Session ID Length: 2

### 3. Create a Custom Modbus Analyzer

```bash
curl -X POST http://localhost:3000/api/custom-analyzer \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "name": "Modbus TCP",
      "ports": [502],
      "patterns": [{
        "name": "Modbus MBAP Header",
        "offset": 0,
        "bytes": [255, 255], 
        "minLength": 12
      }],
      "fieldDefinitions": [
        {"name": "transactionId", "type": "uint16", "offset": 0, "description": "Transaction identifier"},
        {"name": "protocolId", "type": "uint16", "offset": 2, "description": "Protocol identifier"},
        {"name": "length", "type": "uint16", "offset": 4, "description": "Length field"},
        {"name": "unitId", "type": "uint8", "offset": 6, "description": "Unit identifier"},
        {"name": "functionCode", "type": "uint8", "offset": 7, "description": "Function code"}
      ]
    }
  }'
```

### 4. Batch Analysis of Multiple Packets

```bash
curl -X POST http://localhost:3000/api/analyze-packets \
  -H "Content-Type: application/json" \
  -d '{
    "packets": [
      {
        "data": "160301003e0100003a030352d63925c7c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8000002c030010000",
        "metadata": {"port": 443, "description": "TLS Client Hello"}
      },
      {
        "data": "474554202f20485454502f312e310d0a486f73743a206578616d706c652e636f6d0d0a0d0a",
        "metadata": {"port": 80, "description": "HTTP GET Request"}
      }
    ]
  }'
```

## Sample Packet Data

### TLS Client Hello
```
160301003e0100003a030352d63925c7c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8000002c030010000
```

### MQTT Connect (full packet)
```
101a0004MQTT04c2003c0008746573746362656e74
```
- Fixed Header: 10 1a
- Protocol Name: MQTT (0004 MQTT)
- Protocol Level: 04
- Connect Flags: c2
- Keep Alive: 003c (60 seconds)
- Client ID: testclient (0008 746573746362656e74)

### HTTP GET Request
```
474554202f20485454502f312e310d0a486f73743a206578616d706c652e636f6d0d0a0d0a
```
Decoded: `GET / HTTP/1.1\r\nHost: example.com\r\n\r\n`

### DNS Query
```
12340100000100000000000003777777076578616d706c6503636f6d0000010001
```
- Transaction ID: 1234
- Flags: 0100 (standard query)
- Questions: 1
- Query: www.example.com A record

## Web Interface Features

The web interface at `http://localhost:3000` provides:

1. **Packet Analysis Tab**: Input hex data and analyze packets
2. **Available Analyzers Tab**: View all loaded protocol analyzers
3. **Custom Analyzer Tab**: Create custom binary protocol analyzers
4. **Test Samples Tab**: Pre-loaded sample packets for testing

### Protocol Detection Priority

1. **Port-based detection**: If metadata includes a port number, appropriate analyzers are tried first
2. **Pattern-based detection**: Analyzers examine packet headers for protocol signatures
3. **Fallback analysis**: If no specific protocol is detected, generic binary analysis is performed

### Analysis Results Structure

Each analysis returns:
```json
{
  "timestamp": "ISO timestamp",
  "packetSize": "size in bytes",
  "metadata": "input metadata",
  "analyzers": [
    {
      "analyzer": "analyzer name",
      "success": true/false,
      "result": "detailed analysis" || "error": "error message"
    }
  ],
  "summary": {
    "totalAnalyzers": "number",
    "successfulAnalyzes": "number", 
    "protocolsDetected": ["protocol names"],
    "processingTimeMs": "processing time"
  }
}
```

## Integration Examples

### Node.js Integration
```javascript
const fetch = require('node-fetch');

async function analyzePacket(hexData, port) {
  const response = await fetch('http://localhost:3000/api/analyze-packet', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      packetData: hexData,
      metadata: {port: port}
    })
  });
  
  return await response.json();
}

// Usage
analyzePacket('160301003e...', 443)
  .then(result => console.log(result));
```

### Python Integration
```python
import requests

def analyze_packet(hex_data, port=None):
    url = 'http://localhost:3000/api/analyze-packet'
    payload = {
        'packetData': hex_data,
        'metadata': {'port': port} if port else {}
    }
    
    response = requests.post(url, json=payload)
    return response.json()

# Usage
result = analyze_packet('160301003e...', 443)
print(result)
```

This comprehensive protocol analyzer supports extensible analysis of network traffic with both built-in and custom protocol analyzers.