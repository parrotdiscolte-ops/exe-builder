# NetworkAnalyzer Documentation

## Overview

NetworkAnalyzer is a comprehensive network traffic analysis and monitoring tool designed to provide deep insights into network communications. It features advanced protocol support, real-time packet capture, proxy functionality, and an intuitive web-based user interface.

## Features

### Core Capabilities
- **Real-time Network Capture**: Monitor live network traffic with configurable filters
- **Advanced Protocol Analysis**: Deep packet inspection for TLS, MQTT, HTTP, DNS, and custom protocols
- **HTTP/HTTPS Proxy**: Intercept and modify HTTP/HTTPS traffic with custom rules
- **Modern Web UI**: Responsive, user-friendly interface with real-time updates
- **Data Export**: Export captured data and analysis results in multiple formats

### Supported Protocols
- **HTTP/HTTPS**: Complete request/response analysis with header inspection
- **TLS/SSL**: Certificate analysis, cipher suite evaluation, security assessment
- **MQTT**: Message flow analysis, topic subscription patterns, QoS monitoring
- **DNS**: Query analysis and response monitoring
- **TCP/UDP**: Basic packet analysis and flow tracking
- **Custom Protocols**: Extensible architecture for adding new protocol analyzers

## Installation

### Prerequisites
- Node.js 14+ with ES6 module support
- Modern web browser for UI access

### Setup
```bash
# Install dependencies
npm install

# Start the server
node server.js
```

The server will start on port 3000, and the NetworkAnalyzer UI will be available at:
`http://localhost:3000/network-analyzer`

## API Reference

### Core Endpoints

#### GET /network-analyzer/status
Get current status of all NetworkAnalyzer components.

**Response:**
```json
{
  "success": true,
  "status": {
    "initialized": true,
    "components": {
      "analyzer": {
        "running": true,
        "stats": {
          "totalPackets": 1250,
          "protocolCounts": {
            "HTTP": 450,
            "HTTPS": 800
          },
          "uptime": 125000
        }
      },
      "capture": {
        "running": true,
        "stats": {
          "packetsCapture": 1250,
          "packetsDropped": 0,
          "bytesCapture": 2048576
        }
      },
      "proxy": {
        "running": false,
        "stats": {
          "totalRequests": 0,
          "totalResponses": 0
        }
      }
    }
  }
}
```

#### POST /network-analyzer/start
Start network analysis (capture and/or proxy).

**Response:**
```json
{
  "success": true,
  "message": "NetworkAnalyzer started successfully"
}
```

#### POST /network-analyzer/stop
Stop all network analysis activities.

**Response:**
```json
{
  "success": true,
  "message": "NetworkAnalyzer stopped successfully"
}
```

#### GET /network-analyzer/analyze
Get comprehensive traffic analysis.

**Query Parameters:**
- `tls` (boolean): Include TLS analysis (default: true)
- `mqtt` (boolean): Include MQTT analysis (default: true)
- `limit` (integer): Limit number of packets to analyze (default: 100)

**Response:**
```json
{
  "success": true,
  "analysis": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "overall": {
      "totalPackets": 1250,
      "protocols": {
        "HTTP": 450,
        "HTTPS": 800
      },
      "summary": {
        "topProtocols": [["HTTPS", 800], ["HTTP", 450]],
        "timespan": {
          "start": "2024-01-15T10:00:00.000Z",
          "end": "2024-01-15T10:30:00.000Z"
        }
      }
    },
    "protocols": {
      "tls": {
        "packets": 800,
        "analysis": {
          "totalBytes": 2048576,
          "patterns": [],
          "metadata": {
            "averagePacketSize": 2560,
            "suspiciousActivity": []
          }
        }
      },
      "mqtt": {
        "packets": 0,
        "analysis": null
      }
    }
  }
}
```

#### GET /network-analyzer/export
Export analysis data in various formats.

**Query Parameters:**
- `format` (string): Export format - 'json' or 'pcap' (default: 'json')
- `raw` (boolean): Include raw packet data (default: false)

**Response:** File download with comprehensive analysis data.

#### POST /network-analyzer/reset
Reset all captured data and analysis state.

**Response:**
```json
{
  "success": true,
  "message": "NetworkAnalyzer reset successfully"
}
```

## Usage Examples

### Basic Network Monitoring

```javascript
import NetworkAnalyzerManager from './src/network-analyzer/NetworkAnalyzerManager.js';

// Initialize with default settings
const analyzer = new NetworkAnalyzerManager({
  enableUI: true,
  enableCapture: true,
  captureConfig: {
    interface: 'eth0',
    bufferSize: 10000,
    filters: ['tcp port 80', 'tcp port 443']
  }
});

// Start monitoring
await analyzer.initialize();
await analyzer.start();

// Get analysis after some time
setTimeout(async () => {
  const analysis = await analyzer.analyzeTraffic();
  console.log('Network Analysis:', analysis);
}, 30000);
```

### HTTP/HTTPS Proxy with Modification

```javascript
const analyzer = new NetworkAnalyzerManager({
  enableProxy: true,
  proxyConfig: {
    port: 8080,
    httpsPort: 8443,
    interceptRequests: true,
    interceptResponses: true
  }
});

await analyzer.initialize();

// Add request modification rule
const proxyModule = analyzer.getAnalyzer().proxyModule;
proxyModule.addModificationRule('add-header', {
  type: 'request',
  match: { url: 'api.example.com' },
  action: (request) => {
    request.headers['X-Custom-Header'] = 'NetworkAnalyzer';
    return request;
  }
});

await analyzer.start();
```

### Custom Protocol Analysis

```javascript
// Add custom protocol analyzer
analyzer.addProtocolAnalyzer('custom-protocol', (packet) => {
  if (packet.port === 9999) {
    return {
      type: 'custom-protocol',
      customField: extractCustomField(packet.data),
      timestamp: packet.timestamp,
      analysis: 'Custom protocol detected'
    };
  }
  return null;
});

function extractCustomField(data) {
  // Custom protocol parsing logic
  return data.substring(0, 10);
}
```

### TLS Certificate Analysis

```javascript
import TLSAnalyzer from './src/network-analyzer/protocols/TLSAnalyzer.js';

const tlsAnalyzer = new TLSAnalyzer();

// Analyze TLS handshake
const handshakeAnalysis = tlsAnalyzer.analyzeHandshake(tlsPacket);
console.log('TLS Version:', handshakeAnalysis.version);
console.log('Cipher Suites:', handshakeAnalysis.cipherSuites);
console.log('Security Score:', handshakeAnalysis.security.score);

// Analyze certificate
const certAnalysis = tlsAnalyzer.analyzeCertificate(certificateData);
console.log('Certificate Subject:', certAnalysis.subject);
console.log('Trust Status:', certAnalysis.trustStatus);
```

### MQTT Traffic Monitoring

```javascript
import MQTTAnalyzer from './src/network-analyzer/protocols/MQTTAnalyzer.js';

const mqttAnalyzer = new MQTTAnalyzer();

// Analyze MQTT subscriptions
const subscriptionAnalysis = mqttAnalyzer.analyzeSubscriptions(mqttPackets);
console.log('Total Subscriptions:', subscriptionAnalysis.totalSubscriptions);
console.log('Topic Patterns:', subscriptionAnalysis.patterns);

// Analyze message flow
const flowAnalysis = mqttAnalyzer.analyzeMessageFlow(mqttPackets);
console.log('Message Rate:', flowAnalysis.messageRate.perSecond);
console.log('Top Active Topics:', Array.from(flowAnalysis.topicActivity.entries()));
```

## Web UI Usage

### Accessing the Interface
1. Start the server: `node server.js`
2. Open browser to: `http://localhost:3000/network-analyzer`
3. Use the navigation menu to access different features

### Dashboard
- View real-time statistics
- Monitor protocol distribution
- Check system status
- Quick start/stop controls

### Capture Interface
- Configure network interfaces
- Set capture filters
- View live packet stream
- Export captured data

### Proxy Interface
- Start/stop HTTP/HTTPS proxy
- View intercepted requests and responses
- Add modification rules
- Monitor proxy statistics

### Protocol Analysis
- Select specific protocols to analyze
- View detailed protocol breakdowns
- Add custom protocol analyzers
- Export analysis results

### Settings
- Configure UI preferences
- Set capture parameters
- Import/export configurations
- View system information

## Configuration

### NetworkAnalyzer Options
```javascript
const config = {
  // Core settings
  maxCaptureSize: 10000,        // Maximum packets in buffer
  enabledProtocols: [           // Protocols to analyze
    'tcp', 'udp', 'http', 'https', 'tls', 'mqtt'
  ],
  
  // UI settings
  enableUI: true,               // Enable web interface
  uiConfig: {
    theme: 'dark',              // UI theme
    refreshInterval: 1000,      // Update frequency (ms)
    maxDisplayPackets: 100      // Max packets in UI tables
  },
  
  // Capture settings
  enableCapture: true,          // Enable packet capture
  captureConfig: {
    interface: 'any',           // Network interface
    bufferSize: 10000,          // Capture buffer size
    promiscuousMode: false,     // Promiscuous mode
    snapLength: 65535,          // Packet snap length
    timeout: 1000,              // Capture timeout
    filters: []                 // BPF-style filters
  },
  
  // Proxy settings
  enableProxy: false,           // Enable HTTP proxy
  proxyConfig: {
    port: 8080,                 // HTTP proxy port
    httpsPort: 8443,            // HTTPS proxy port
    interceptRequests: true,    // Intercept requests
    interceptResponses: true,   // Intercept responses
    maxBufferSize: 50000000,    // 50MB buffer limit
    timeout: 30000              // Request timeout
  }
};
```

### Capture Filters
Use BPF-style filter expressions:

```javascript
const filters = [
  'tcp port 80',              // HTTP traffic
  'tcp port 443',             // HTTPS traffic
  'host 192.168.1.1',         // Specific host
  'tcp and port 22',          // SSH traffic
  'udp and port 53',          // DNS queries
  'not port 22'               // Exclude SSH
];
```

## Troubleshooting

### Common Issues

**NetworkAnalyzer fails to initialize:**
- Check Node.js version (requires 14+)
- Verify ES6 module support
- Check console for specific error messages

**Capture not working:**
- Ensure proper network interface selection
- Check permissions for network capture
- Verify filters are correctly formatted

**Proxy not intercepting traffic:**
- Configure browser/application to use proxy
- Check proxy ports are available
- Verify certificate trust for HTTPS

**UI not loading:**
- Check server is running on correct port
- Verify static file serving is enabled
- Check browser console for JavaScript errors

### Performance Optimization

**For high-traffic environments:**
```javascript
const config = {
  maxCaptureSize: 50000,        // Increase buffer size
  captureConfig: {
    bufferSize: 100000,         // Large capture buffer
    snapLength: 1500,           // Limit packet size
    filters: ['tcp port 80']    // Specific traffic only
  },
  uiConfig: {
    refreshInterval: 2000,      // Reduce update frequency
    maxDisplayPackets: 50       // Limit UI packet display
  }
};
```

## Security Considerations

- NetworkAnalyzer can capture sensitive data - use appropriate access controls
- HTTPS proxy requires certificate trust - implement proper certificate management
- Filter sensitive protocols/hosts when not needed for analysis
- Regularly export and clear captured data to manage storage
- Use secure authentication for production deployments

## Contributing

To extend NetworkAnalyzer with new protocol analyzers:

1. Create a new analyzer class in `src/network-analyzer/protocols/`
2. Implement required analysis methods
3. Register the analyzer in `NetworkAnalyzerManager.js`
4. Add UI components if needed
5. Update documentation

## License

NetworkAnalyzer is part of the exe-builder project. Please refer to the project's license file for usage terms.