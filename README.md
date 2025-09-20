# NetworkAnalyzer - Advanced Network Protocol Analysis

NetworkAnalyzer is a comprehensive web-based network analysis tool that provides packet capture, protocol analysis, HTTP/HTTPS proxy capabilities, and C++ code compilation services.

## Features

### 🔍 Packet Capture
- **Real-time packet capture** from multiple network interfaces
- **BPF filtering** support for targeted packet analysis
- **Live statistics** showing packet count, bytes, and capture duration
- **Interactive packet browser** with detailed packet inspection

### 📊 Protocol Analyzers
- **🔒 TLS Analyzer**: Analyze TLS/SSL handshakes, cipher suites, and certificate chains
- **📱 MQTT Analyzer**: Monitor MQTT publish/subscribe patterns and message content
- **⚙️ Custom Protocol Analyzer**: Define and analyze custom network protocols

### 🌐 HTTP/HTTPS Proxy Module
- **Transparent proxy** with configurable port
- **Upstream proxy** support for corporate environments
- **Real-time logging** of HTTP/HTTPS traffic
- **WebSocket tunneling** support

### 💻 C++ Code Builder
- **Online C++ compilation** with GCC
- **Instant executable download**
- **Error reporting** with detailed compilation messages
- **Syntax highlighting** and code editing

## Quick Start

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/parrotdiscolte-ops/exe-builder.git
   cd exe-builder
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   node server.js
   ```

4. Open your browser and navigate to `http://localhost:3000`

### Using Packet Capture

1. Select a **network interface** from the dropdown menu
2. Optionally enter a **BPF filter** (e.g., `tcp port 80` for HTTP traffic)
3. Click **Start Capture** to begin packet analysis
4. View real-time packets in the capture window
5. Click on any packet to view detailed information

### Protocol Analysis

1. Navigate to the **Protocol Analyzers** tab
2. Click **Enable** for the desired protocol analyzer (TLS, MQTT, or Custom)
3. The analyzer will automatically process captured packets
4. View analysis results in the respective protocol panels

### HTTP/HTTPS Proxy

1. Go to the **Proxy Module** tab
2. Configure the **proxy port** (default: 8080)
3. Optionally set an **upstream proxy** for corporate environments
4. Click **Start Proxy** to begin proxying traffic
5. Configure your applications to use `localhost:8080` as HTTP/HTTPS proxy
6. Monitor traffic in the proxy activity log

### C++ Code Builder

1. Navigate to the **Code Builder** tab
2. Enter your C++ code in the editor
3. Click **Build Executable**
4. Download the compiled executable if compilation succeeds
5. View error messages if compilation fails

## API Reference

### Packet Capture API

- `POST /api/capture/start` - Start packet capture
- `POST /api/capture/stop` - Stop packet capture

### Protocol Analyzers API

- `POST /api/analyzers/enable` - Enable protocol analyzer
- `GET /api/protocols/custom` - List custom protocols
- `POST /api/protocols/custom` - Create custom protocol analyzer

### Proxy API

- `POST /api/proxy/start` - Start HTTP/HTTPS proxy
- `POST /api/proxy/stop` - Stop HTTP/HTTPS proxy

### Code Builder API

- `POST /sse` - Compile C++ code

### WebSocket Events

The application uses WebSocket for real-time communication:

- `packet` - New packet captured
- `tls-analysis` - TLS analysis result
- `mqtt-analysis` - MQTT analysis result
- `proxy-log` - Proxy activity log
- `error` - Error message

## Architecture

### Backend Components

- **Express.js Server**: REST API and static file serving
- **WebSocket Server**: Real-time communication with clients
- **NetworkAnalyzer Class**: Core network analysis logic
- **Protocol Analyzers**: Modular protocol analysis engines
- **Proxy Module**: HTTP/HTTPS proxy implementation

### Frontend Components

- **React-style UI**: Modern, responsive web interface
- **WebSocket Client**: Real-time data streaming
- **Tab-based Navigation**: Organized feature access
- **Interactive Visualizations**: Real-time charts and graphs

## Configuration

### Environment Variables

- `PORT` - Server port (default: 3000)
- `WS_PORT` - WebSocket port (default: same as HTTP)

### Docker Support

Build and run with Docker:

```bash
docker build -t networkanalyzer .
docker run -p 3000:3000 networkanalyzer
```

## Security Considerations

- **Network Permissions**: Packet capture requires elevated privileges
- **Proxy Security**: Use authentication for production proxy deployments
- **Code Compilation**: C++ compilation runs in isolated environment
- **HTTPS Support**: Enable TLS for production deployments

## Troubleshooting

### Common Issues

1. **Permission Denied (Packet Capture)**
   - Run with elevated privileges: `sudo node server.js`
   - Ensure network interfaces are accessible

2. **WebSocket Connection Failed**
   - Check firewall settings
   - Verify WebSocket port is not blocked

3. **Compilation Errors**
   - Ensure GCC is installed: `apt-get install g++`
   - Check C++ syntax and includes

4. **Proxy Not Working**
   - Verify port is not in use: `netstat -tulpn | grep :8080`
   - Check client proxy configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review existing issues and discussions

---

**NetworkAnalyzer** - Making network analysis accessible and powerful for everyone.