/**
 * NetworkAnalyzer Core Tests
 * Basic functionality tests for the NetworkAnalyzer system
 */

import NetworkAnalyzerManager from '../src/network-analyzer/NetworkAnalyzerManager.js';
import NetworkAnalyzer from '../src/network-analyzer/core/NetworkAnalyzer.js';
import TLSAnalyzer from '../src/network-analyzer/protocols/TLSAnalyzer.js';
import MQTTAnalyzer from '../src/network-analyzer/protocols/MQTTAnalyzer.js';
import CaptureModule from '../src/network-analyzer/modules/CaptureModule.js';
import ProxyModule from '../src/network-analyzer/modules/ProxyModule.js';

// Simple test runner
class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log('Running NetworkAnalyzer Tests...\n');
    
    for (const test of this.tests) {
      try {
        await test.fn();
        console.log(`✓ ${test.name}`);
        this.passed++;
      } catch (error) {
        console.log(`✗ ${test.name}: ${error.message}`);
        this.failed++;
      }
    }

    console.log(`\nTest Results: ${this.passed} passed, ${this.failed} failed`);
    return this.failed === 0;
  }
}

const runner = new TestRunner();

// Core NetworkAnalyzer Tests
runner.test('NetworkAnalyzer should initialize correctly', async () => {
  const analyzer = new NetworkAnalyzer();
  
  if (!analyzer.config) throw new Error('Config not initialized');
  if (analyzer.isCapturing) throw new Error('Should not be capturing initially');
  if (analyzer.stats.totalPackets !== 0) throw new Error('Initial packet count should be 0');
});

runner.test('NetworkAnalyzer should start and stop capture', async () => {
  const analyzer = new NetworkAnalyzer();
  
  const startResult = await analyzer.startCapture();
  if (!startResult.success) throw new Error('Failed to start capture');
  if (!analyzer.isCapturing) throw new Error('Should be capturing after start');
  
  const stopResult = await analyzer.stopCapture();
  if (!stopResult.success) throw new Error('Failed to stop capture');
  if (analyzer.isCapturing) throw new Error('Should not be capturing after stop');
});

runner.test('NetworkAnalyzer should simulate packet capture', async () => {
  const analyzer = new NetworkAnalyzer();
  await analyzer.startCapture();
  
  const packet = {
    protocol: 'HTTP',
    source: '192.168.1.10',
    destination: '192.168.1.1',
    port: 80,
    size: 1024
  };
  
  const result = analyzer.simulatePacket(packet);
  if (!result) throw new Error('Packet simulation failed');
  if (analyzer.stats.totalPackets !== 1) throw new Error('Packet count not updated');
  
  await analyzer.stopCapture();
});

runner.test('NetworkAnalyzer should analyze packets correctly', async () => {
  const analyzer = new NetworkAnalyzer();
  await analyzer.startCapture();
  
  // Add some test packets
  analyzer.simulatePacket({ protocol: 'HTTP', port: 80, size: 500 });
  analyzer.simulatePacket({ protocol: 'HTTPS', port: 443, size: 700 });
  analyzer.simulatePacket({ protocol: 'HTTP', port: 80, size: 300 });
  
  const analysis = analyzer.analyzePackets();
  if (analysis.totalPackets !== 3) throw new Error('Incorrect packet count in analysis');
  if (analysis.protocols['HTTP'] !== 2) throw new Error('Incorrect HTTP packet count');
  if (analysis.protocols['HTTPS/TLS'] !== 1) throw new Error('Incorrect HTTPS packet count');
  
  await analyzer.stopCapture();
});

// TLS Analyzer Tests
runner.test('TLS Analyzer should analyze handshake', async () => {
  const tlsAnalyzer = new TLSAnalyzer();
  
  const packet = { port: 443, protocol: 'HTTPS' };
  const analysis = tlsAnalyzer.analyzeHandshake(packet);
  
  if (!analysis.version) throw new Error('TLS version not detected');
  if (!analysis.cipherSuites || analysis.cipherSuites.length === 0) {
    throw new Error('Cipher suites not extracted');
  }
  if (typeof analysis.security.score !== 'number') {
    throw new Error('Security score not calculated');
  }
});

runner.test('TLS Analyzer should analyze certificate', async () => {
  const tlsAnalyzer = new TLSAnalyzer();
  
  const certData = { /* mock certificate data */ };
  const analysis = tlsAnalyzer.analyzeCertificate(certData);
  
  if (!analysis.subject) throw new Error('Certificate subject not extracted');
  if (!analysis.issuer) throw new Error('Certificate issuer not extracted');
  if (!analysis.validity) throw new Error('Certificate validity not checked');
  if (!analysis.trustStatus) throw new Error('Certificate trust status not determined');
});

// MQTT Analyzer Tests
runner.test('MQTT Analyzer should analyze connection', async () => {
  const mqttAnalyzer = new MQTTAnalyzer();
  
  const packet = { port: 1883, protocol: 'MQTT' };
  const analysis = mqttAnalyzer.analyzeConnection(packet);
  
  if (!analysis.version) throw new Error('MQTT version not detected');
  if (!analysis.clientId) throw new Error('Client ID not extracted');
  if (!analysis.flags) throw new Error('Connection flags not extracted');
});

runner.test('MQTT Analyzer should analyze publish message', async () => {
  const mqttAnalyzer = new MQTTAnalyzer();
  
  const packet = { 
    protocol: 'MQTT', 
    topic: 'sensors/temperature',
    payload: '{"temperature": 23.5}'
  };
  const analysis = mqttAnalyzer.analyzePublish(packet);
  
  if (!analysis.topic) throw new Error('Topic not extracted');
  if (typeof analysis.qos !== 'number') throw new Error('QoS not determined');
  if (!analysis.payload) throw new Error('Payload not analyzed');
});

// Capture Module Tests
runner.test('Capture Module should initialize correctly', async () => {
  const captureModule = new CaptureModule({
    interface: 'test',
    bufferSize: 1000
  });
  
  if (captureModule.config.interface !== 'test') throw new Error('Interface config not set');
  if (captureModule.config.bufferSize !== 1000) throw new Error('Buffer size config not set');
  if (captureModule.isCapturing) throw new Error('Should not be capturing initially');
});

runner.test('Capture Module should start and stop capture', async () => {
  const captureModule = new CaptureModule();
  
  const startResult = await captureModule.startCapture();
  if (!startResult.success) throw new Error('Failed to start capture');
  if (!captureModule.isCapturing) throw new Error('Should be capturing after start');
  
  const stopResult = await captureModule.stopCapture();
  if (!stopResult.success) throw new Error('Failed to stop capture');
  if (captureModule.isCapturing) throw new Error('Should not be capturing after stop');
});

runner.test('Capture Module should handle filters', async () => {
  const captureModule = new CaptureModule();
  
  const filterResult = captureModule.addFilter('tcp port 80');
  if (!filterResult) throw new Error('Failed to add filter');
  
  const stats = captureModule.getStats();
  if (!stats.activeFilters.includes('tcp port 80')) {
    throw new Error('Filter not in active filters');
  }
  
  const removeResult = captureModule.removeFilter('tcp port 80');
  if (!removeResult) throw new Error('Failed to remove filter');
});

// Proxy Module Tests
runner.test('Proxy Module should initialize correctly', async () => {
  const proxyModule = new ProxyModule({
    port: 8080,
    httpsPort: 8443
  });
  
  if (proxyModule.config.port !== 8080) throw new Error('HTTP port config not set');
  if (proxyModule.config.httpsPort !== 8443) throw new Error('HTTPS port config not set');
  if (proxyModule.isRunning) throw new Error('Should not be running initially');
});

runner.test('Proxy Module should start and stop proxy', async () => {
  const proxyModule = new ProxyModule();
  
  const startResult = await proxyModule.startProxy();
  if (!startResult.success) throw new Error('Failed to start proxy');
  if (!proxyModule.isRunning) throw new Error('Should be running after start');
  
  const stopResult = await proxyModule.stopProxy();
  if (!stopResult.success) throw new Error('Failed to stop proxy');
  if (proxyModule.isRunning) throw new Error('Should not be running after stop');
});

runner.test('Proxy Module should handle interceptors', async () => {
  const proxyModule = new ProxyModule();
  
  const interceptor = (request) => {
    request.headers['X-Test'] = 'test-value';
    return request;
  };
  
  const result = proxyModule.addRequestInterceptor('test-interceptor', interceptor);
  if (!result) throw new Error('Failed to add request interceptor');
  
  const stats = proxyModule.getStats();
  if (stats.requestInterceptors !== 1) throw new Error('Request interceptor not counted');
});

// Integration Tests
runner.test('NetworkAnalyzer Manager should initialize all components', async () => {
  const manager = new NetworkAnalyzerManager({
    enableUI: false, // Disable UI for testing
    enableCapture: true,
    enableProxy: true
  });
  
  const result = await manager.initialize();
  if (!result.success) throw new Error('Failed to initialize manager');
  
  const status = manager.getStatus();
  if (!status.initialized) throw new Error('Manager not marked as initialized');
  if (!status.components.analyzer) throw new Error('Analyzer component not initialized');
  if (!status.components.capture) throw new Error('Capture component not initialized');
  if (!status.components.proxy) throw new Error('Proxy component not initialized');
});

runner.test('NetworkAnalyzer Manager should start and stop all services', async () => {
  const manager = new NetworkAnalyzerManager({
    enableUI: false,
    enableCapture: true,
    enableProxy: true
  });
  
  await manager.initialize();
  
  const startResult = await manager.start();
  if (!startResult.success) throw new Error('Failed to start services');
  
  const status = manager.getStatus();
  if (!status.components.analyzer.running) throw new Error('Analyzer not running');
  if (!status.components.capture.running) throw new Error('Capture not running');
  if (!status.components.proxy.running) throw new Error('Proxy not running');
  
  const stopResult = await manager.stop();
  if (!stopResult.success) throw new Error('Failed to stop services');
});

runner.test('NetworkAnalyzer Manager should provide traffic analysis', async () => {
  const manager = new NetworkAnalyzerManager({
    enableUI: false,
    enableCapture: true
  });
  
  await manager.initialize();
  await manager.start();
  
  // Allow some time for packet simulation
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const analysis = await manager.analyzeTraffic();
  if (!analysis.timestamp) throw new Error('Analysis timestamp missing');
  if (!analysis.overall) throw new Error('Overall analysis missing');
  if (typeof analysis.overall.totalPackets !== 'number') {
    throw new Error('Total packets count invalid');
  }
  
  await manager.stop();
});

// Export functionality test
runner.test('NetworkAnalyzer Manager should export data', async () => {
  const manager = new NetworkAnalyzerManager({
    enableUI: false,
    enableCapture: true
  });
  
  await manager.initialize();
  await manager.start();
  
  // Allow some time for data collection
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const exportData = await manager.exportData('json', { includeRawData: true });
  
  if (!exportData.metadata) throw new Error('Export metadata missing');
  if (!exportData.analysis) throw new Error('Export analysis missing');
  if (!exportData.rawData) throw new Error('Export raw data missing');
  if (exportData.metadata.format !== 'json') throw new Error('Export format incorrect');
  
  await manager.stop();
});

// Run all tests
runner.run().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});