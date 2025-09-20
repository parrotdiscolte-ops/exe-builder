/**
 * NetworkAnalyzer Integration Module
 * Main entry point that combines all NetworkAnalyzer components
 */

import NetworkAnalyzer from './core/NetworkAnalyzer.js';
import TLSAnalyzer from './protocols/TLSAnalyzer.js';
import MQTTAnalyzer from './protocols/MQTTAnalyzer.js';
import CaptureModule from './modules/CaptureModule.js';
import ProxyModule from './modules/ProxyModule.js';

export class NetworkAnalyzerManager {
  constructor(options = {}) {
    this.config = {
      enableUI: options.enableUI !== false,
      autoStart: options.autoStart || false,
      captureConfig: options.captureConfig || {},
      proxyConfig: options.proxyConfig || {},
      uiConfig: options.uiConfig || {},
      ...options
    };

    this.analyzer = null;
    this.ui = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the NetworkAnalyzer system
   */
  async initialize() {
    try {
      // Initialize core analyzer
      this.analyzer = new NetworkAnalyzer({
        maxCaptureSize: this.config.maxCaptureSize || 10000,
        enabledProtocols: this.config.enabledProtocols || ['tcp', 'udp', 'http', 'https', 'tls', 'mqtt']
      });

      // Add protocol analyzers
      this._initializeProtocolAnalyzers();

      // Initialize capture module
      this.analyzer.captureModule = new CaptureModule(this.config.captureConfig);
      
      // Initialize proxy module
      this.analyzer.proxyModule = new ProxyModule(this.config.proxyConfig);

      // Initialize UI if enabled (browser only)
      if (this.config.enableUI && typeof window !== 'undefined') {
        const { NetworkAnalyzerUI } = await import('./ui/NetworkAnalyzerUI.js');
        this.ui = new NetworkAnalyzerUI(this.analyzer, this.config.uiConfig);
        await this.ui.initialize();
      }

      // Set up event forwarding
      this._setupEventForwarding();

      this.isInitialized = true;

      // Auto-start if configured
      if (this.config.autoStart) {
        await this.start();
      }

      return {
        success: true,
        message: 'NetworkAnalyzer initialized successfully',
        components: {
          analyzer: !!this.analyzer,
          capture: !!this.analyzer.captureModule,
          proxy: !!this.analyzer.proxyModule,
          ui: !!this.ui
        }
      };

    } catch (error) {
      throw new Error(`NetworkAnalyzer initialization failed: ${error.message}`);
    }
  }

  /**
   * Start network analysis
   */
  async start() {
    if (!this.isInitialized) {
      throw new Error('NetworkAnalyzer not initialized. Call initialize() first.');
    }

    try {
      // Start core analyzer
      await this.analyzer.startCapture();

      // Start capture module if configured
      if (this.config.enableCapture !== false) {
        await this.analyzer.captureModule.startCapture();
      }

      // Start proxy module if configured
      if (this.config.enableProxy) {
        await this.analyzer.proxyModule.startProxy();
      }

      return {
        success: true,
        message: 'NetworkAnalyzer started successfully'
      };

    } catch (error) {
      throw new Error(`Failed to start NetworkAnalyzer: ${error.message}`);
    }
  }

  /**
   * Stop network analysis
   */
  async stop() {
    if (!this.isInitialized) {
      return { success: false, message: 'NetworkAnalyzer not initialized' };
    }

    try {
      // Stop capture module
      if (this.analyzer.captureModule.isCapturing) {
        await this.analyzer.captureModule.stopCapture();
      }

      // Stop proxy module
      if (this.analyzer.proxyModule.isRunning) {
        await this.analyzer.proxyModule.stopProxy();
      }

      // Stop core analyzer
      if (this.analyzer.isCapturing) {
        await this.analyzer.stopCapture();
      }

      return {
        success: true,
        message: 'NetworkAnalyzer stopped successfully'
      };

    } catch (error) {
      throw new Error(`Failed to stop NetworkAnalyzer: ${error.message}`);
    }
  }

  /**
   * Get comprehensive status
   */
  getStatus() {
    if (!this.isInitialized) {
      return { initialized: false, components: {} };
    }

    return {
      initialized: this.isInitialized,
      components: {
        analyzer: {
          running: this.analyzer.isCapturing,
          stats: this.analyzer.getStats()
        },
        capture: {
          running: this.analyzer.captureModule.isCapturing,
          stats: this.analyzer.captureModule.getStats()
        },
        proxy: {
          running: this.analyzer.proxyModule.isRunning,
          stats: this.analyzer.proxyModule.getStats()
        },
        ui: {
          enabled: !!this.ui,
          theme: this.ui?.config.theme
        }
      }
    };
  }

  /**
   * Analyze network traffic
   */
  async analyzeTraffic(options = {}) {
    if (!this.isInitialized) {
      throw new Error('NetworkAnalyzer not initialized');
    }

    const analysis = {
      timestamp: new Date().toISOString(),
      overall: this.analyzer.analyzePackets(),
      protocols: {},
      capture: null,
      proxy: null
    };

    // Protocol-specific analysis
    if (options.analyzeTLS !== false) {
      analysis.protocols.tls = this._analyzeTLSTraffic();
    }

    if (options.analyzeMQTT !== false) {
      analysis.protocols.mqtt = this._analyzeMQTTTraffic();
    }

    // Capture analysis
    if (this.analyzer.captureModule.captureBuffer.length > 0) {
      analysis.capture = {
        packets: this.analyzer.captureModule.getPackets(options.captureOptions || {}),
        stats: this.analyzer.captureModule.getStats()
      };
    }

    // Proxy analysis
    if (this.analyzer.proxyModule.interceptedRequests.length > 0) {
      analysis.proxy = {
        requests: this.analyzer.proxyModule.getInterceptedRequests(options.proxyOptions || {}),
        responses: this.analyzer.proxyModule.getInterceptedResponses(options.proxyOptions || {}),
        stats: this.analyzer.proxyModule.getStats()
      };
    }

    return analysis;
  }

  /**
   * Export analysis data
   */
  async exportData(format = 'json', options = {}) {
    if (!this.isInitialized) {
      throw new Error('NetworkAnalyzer not initialized');
    }

    const data = {
      metadata: {
        exportTime: new Date().toISOString(),
        version: '1.0.0',
        format: format,
        analyzer: 'NetworkAnalyzer'
      },
      analysis: await this.analyzeTraffic(options.analysisOptions || {}),
      rawData: {}
    };

    // Include raw data if requested
    if (options.includeRawData) {
      data.rawData.analyzer = this.analyzer.exportData(format);
      
      if (this.analyzer.captureModule.captureBuffer.length > 0) {
        data.rawData.capture = this.analyzer.captureModule.exportData?.(format);
      }
    }

    return data;
  }

  /**
   * Add custom protocol analyzer
   */
  addProtocolAnalyzer(protocolName, analyzer) {
    if (!this.isInitialized) {
      throw new Error('NetworkAnalyzer not initialized');
    }

    return this.analyzer.addProtocolAnalyzer(protocolName, analyzer);
  }

  /**
   * Initialize protocol analyzers
   */
  _initializeProtocolAnalyzers() {
    // Add TLS analyzer
    const tlsAnalyzer = new TLSAnalyzer();
    this.analyzer.addProtocolAnalyzer('tls', (packet) => {
      if (packet.protocol === 'HTTPS/TLS' || packet.port === 443) {
        return tlsAnalyzer.analyzeHandshake(packet);
      }
      return null;
    });

    // Add MQTT analyzer
    const mqttAnalyzer = new MQTTAnalyzer();
    this.analyzer.addProtocolAnalyzer('mqtt', (packet) => {
      if (packet.protocol === 'MQTT' || packet.port === 1883) {
        return mqttAnalyzer.analyzeConnection(packet);
      }
      return null;
    });

    // Add custom analyzers for common protocols
    this._addCommonProtocolAnalyzers();
  }

  /**
   * Add common protocol analyzers
   */
  _addCommonProtocolAnalyzers() {
    // HTTP analyzer
    this.analyzer.addProtocolAnalyzer('http', (packet) => {
      if (packet.protocol === 'HTTP' || packet.port === 80) {
        return {
          type: 'http-request',
          method: packet.method || 'GET',
          url: packet.url || '/',
          headers: packet.headers || {},
          timestamp: packet.timestamp
        };
      }
      return null;
    });

    // DNS analyzer
    this.analyzer.addProtocolAnalyzer('dns', (packet) => {
      if (packet.protocol === 'DNS' || packet.port === 53) {
        return {
          type: 'dns-query',
          query: packet.query || 'unknown',
          queryType: packet.queryType || 'A',
          timestamp: packet.timestamp
        };
      }
      return null;
    });
  }

  /**
   * Set up event forwarding between components
   */
  _setupEventForwarding() {
    // Forward capture events to main analyzer
    this.analyzer.captureModule.on('packet:captured', (packet) => {
      this.analyzer.simulatePacket(packet);
    });

    // Forward proxy events to main analyzer
    this.analyzer.proxyModule.on('request:intercepted', (request) => {
      this.analyzer.simulatePacket({
        protocol: 'HTTP',
        method: request.method,
        url: request.url,
        size: JSON.stringify(request).length,
        source: request.clientIP,
        destination: new URL(request.url).hostname,
        port: request.url.includes('https') ? 443 : 80
      });
    });
  }

  /**
   * Analyze TLS traffic
   */
  _analyzeTLSTraffic() {
    const tlsAnalyzer = new TLSAnalyzer();
    const tlsPackets = this.analyzer.captureBuffer.filter(p => 
      p.protocol === 'HTTPS/TLS' || p.port === 443
    );

    if (tlsPackets.length === 0) {
      return { packets: 0, analysis: null };
    }

    return {
      packets: tlsPackets.length,
      analysis: tlsAnalyzer.analyzeDataFlow(tlsPackets),
      certificates: tlsPackets.map(p => tlsAnalyzer.analyzeCertificate(p))
    };
  }

  /**
   * Analyze MQTT traffic
   */
  _analyzeMQTTTraffic() {
    const mqttAnalyzer = new MQTTAnalyzer();
    const mqttPackets = this.analyzer.captureBuffer.filter(p => 
      p.protocol === 'MQTT' || p.port === 1883
    );

    if (mqttPackets.length === 0) {
      return { packets: 0, analysis: null };
    }

    return {
      packets: mqttPackets.length,
      subscriptions: mqttAnalyzer.analyzeSubscriptions(mqttPackets),
      messageFlow: mqttAnalyzer.analyzeMessageFlow(mqttPackets)
    };
  }

  /**
   * Reset all components
   */
  reset() {
    if (this.analyzer) {
      this.analyzer.reset();
    }
    if (this.analyzer?.captureModule) {
      this.analyzer.captureModule.clearBuffer();
    }
    if (this.analyzer?.proxyModule) {
      this.analyzer.proxyModule.clearInterceptedData();
    }
  }

  /**
   * Get analyzer instance (for direct access)
   */
  getAnalyzer() {
    return this.analyzer;
  }

  /**
   * Get UI instance (for direct access)
   */
  getUI() {
    return this.ui;
  }
}

export default NetworkAnalyzerManager;