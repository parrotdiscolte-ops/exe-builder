/**
 * NetworkAnalyzer Usage Examples
 * Demonstrates various ways to use the NetworkAnalyzer system
 */

import NetworkAnalyzerManager from '../src/network-analyzer/NetworkAnalyzerManager.js';

// Example 1: Basic Network Monitoring
async function basicMonitoringExample() {
  console.log('=== Basic Network Monitoring Example ===');
  
  const analyzer = new NetworkAnalyzerManager({
    enableUI: false,
    enableCapture: true,
    captureConfig: {
      interface: 'any',
      bufferSize: 5000,
      filters: ['tcp port 80', 'tcp port 443']
    }
  });

  try {
    await analyzer.initialize();
    console.log('✓ NetworkAnalyzer initialized');

    await analyzer.start();
    console.log('✓ Network monitoring started');

    // Monitor for 5 seconds
    console.log('Monitoring traffic for 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    const analysis = await analyzer.analyzeTraffic();
    console.log('📊 Analysis Results:');
    console.log(`  Total Packets: ${analysis.overall.totalPackets}`);
    console.log(`  Protocol Distribution:`, analysis.overall.protocols);

    await analyzer.stop();
    console.log('✓ Monitoring stopped\n');

  } catch (error) {
    console.error('❌ Error in basic monitoring:', error.message);
  }
}

// Example 2: Advanced Protocol Analysis
async function protocolAnalysisExample() {
  console.log('=== Advanced Protocol Analysis Example ===');
  
  const analyzer = new NetworkAnalyzerManager({
    enableUI: false,
    enableCapture: true,
    captureConfig: {
      bufferSize: 10000
    }
  });

  try {
    await analyzer.initialize();
    
    // Add custom protocol analyzer
    analyzer.addProtocolAnalyzer('custom', (packet) => {
      if (packet.port === 9999) {
        return {
          type: 'custom-protocol',
          customData: 'Detected custom protocol on port 9999',
          timestamp: packet.timestamp
        };
      }
      return null;
    });
    
    console.log('✓ Custom protocol analyzer added');

    await analyzer.start();

    // Simulate some custom protocol traffic
    const coreAnalyzer = analyzer.getAnalyzer();
    coreAnalyzer.simulatePacket({
      protocol: 'CUSTOM',
      port: 9999,
      source: '192.168.1.100',
      destination: '192.168.1.1',
      size: 512
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    const analysis = await analyzer.analyzeTraffic({
      analyzeTLS: true,
      analyzeMQTT: true
    });

    console.log('🔍 Protocol Analysis:');
    console.log(`  TLS Packets: ${analysis.protocols.tls?.packets || 0}`);
    console.log(`  MQTT Packets: ${analysis.protocols.mqtt?.packets || 0}`);
    
    if (analysis.overall.totalPackets > 0) {
      console.log('  Protocol breakdown:', analysis.overall.protocols);
    }

    await analyzer.stop();
    console.log('✓ Protocol analysis completed\n');

  } catch (error) {
    console.error('❌ Error in protocol analysis:', error.message);
  }
}

// Run all examples
async function runExamples() {
  console.log('🚀 NetworkAnalyzer Usage Examples\n');
  
  try {
    await basicMonitoringExample();
    await protocolAnalysisExample();
    
    console.log('✅ All examples completed successfully!');
  } catch (error) {
    console.error('❌ Example execution failed:', error.message);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runExamples();
}