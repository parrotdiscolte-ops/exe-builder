import TLSAnalyzer from './analyzers/TLSAnalyzer.js';
import MQTTAnalyzer from './analyzers/MQTTAnalyzer.js';
import CustomBinaryAnalyzer from './analyzers/CustomBinaryAnalyzer.js';

/**
 * NetworkAnalyzer - Main class for analyzing network packets
 * Coordinates multiple protocol analyzers and provides unified analysis interface
 */
class NetworkAnalyzer {
  constructor() {
    this.analyzers = new Map();
    this.initializeAnalyzers();
  }

  /**
   * Initialize default protocol analyzers
   */
  initializeAnalyzers() {
    // Add built-in analyzers
    this.addAnalyzer(new TLSAnalyzer());
    this.addAnalyzer(new MQTTAnalyzer());
    
    // Add some pre-configured custom analyzers
    this.addAnalyzer(CustomBinaryAnalyzer.createModbusAnalyzer());
    this.addAnalyzer(CustomBinaryAnalyzer.createDNSAnalyzer());
  }

  /**
   * Add a protocol analyzer
   * @param {ProtocolAnalyzer} analyzer - Protocol analyzer instance
   */
  addAnalyzer(analyzer) {
    this.analyzers.set(analyzer.name, analyzer);
  }

  /**
   * Remove a protocol analyzer
   * @param {string} name - Analyzer name
   */
  removeAnalyzer(name) {
    this.analyzers.delete(name);
  }

  /**
   * Get all registered analyzers
   * @returns {Array} Array of analyzer info
   */
  getAnalyzers() {
    return Array.from(this.analyzers.values()).map(analyzer => ({
      name: analyzer.name,
      info: analyzer.getProtocolInfo()
    }));
  }

  /**
   * Analyze a single packet with all applicable analyzers
   * @param {Buffer|string} packetData - Raw packet data (Buffer or hex string)
   * @param {Object} metadata - Packet metadata
   * @returns {Object} Analysis results
   */
  analyzePacket(packetData, metadata = {}) {
    const startTime = Date.now();
    
    // Convert hex string to Buffer if needed
    let packet;
    if (typeof packetData === 'string') {
      packet = Buffer.from(packetData, 'hex');
    } else if (Buffer.isBuffer(packetData)) {
      packet = packetData;
    } else {
      throw new Error('Packet data must be a Buffer or hex string');
    }

    const results = {
      timestamp: new Date().toISOString(),
      packetSize: packet.length,
      metadata: metadata,
      analyzers: [],
      summary: {
        totalAnalyzers: 0,
        successfulAnalyzes: 0,
        protocolsDetected: [],
        processingTimeMs: 0
      }
    };

    // Try each analyzer
    for (const [name, analyzer] of this.analyzers) {
      results.summary.totalAnalyzers++;
      
      try {
        if (analyzer.canAnalyze(packet, metadata)) {
          const analysis = analyzer.analyze(packet, metadata);
          results.analyzers.push({
            analyzer: name,
            success: true,
            result: analysis
          });
          
          results.summary.successfulAnalyzes++;
          results.summary.protocolsDetected.push(analysis.protocol);
        }
      } catch (error) {
        results.analyzers.push({
          analyzer: name,
          success: false,
          error: error.message
        });
      }
    }

    results.summary.processingTimeMs = Date.now() - startTime;
    
    // If no specific protocol detected, try generic analysis
    if (results.summary.successfulAnalyzes === 0) {
      results.genericAnalysis = this.performGenericAnalysis(packet, metadata);
    }

    return results;
  }

  /**
   * Analyze multiple packets in batch
   * @param {Array} packets - Array of packet objects with data and metadata
   * @returns {Array} Array of analysis results
   */
  analyzePackets(packets) {
    const results = [];
    const batchStartTime = Date.now();

    for (let i = 0; i < packets.length; i++) {
      const packet = packets[i];
      try {
        const analysis = this.analyzePacket(packet.data, {
          ...packet.metadata,
          packetIndex: i
        });
        results.push(analysis);
      } catch (error) {
        results.push({
          packetIndex: i,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    return {
      batchResults: results,
      summary: {
        totalPackets: packets.length,
        successfulPackets: results.filter(r => !r.error).length,
        batchProcessingTimeMs: Date.now() - batchStartTime,
        protocolDistribution: this.calculateProtocolDistribution(results)
      }
    };
  }

  /**
   * Perform generic analysis when no specific protocol is detected
   * @param {Buffer} packet - Raw packet data
   * @param {Object} metadata - Packet metadata
   * @returns {Object} Generic analysis results
   */
  performGenericAnalysis(packet, metadata) {
    const analysis = {
      type: 'generic',
      packetSize: packet.length,
      hexDump: this.createHexDump(packet),
      statistics: this.calculatePacketStatistics(packet),
      patterns: this.findBasicPatterns(packet)
    };

    // Add port-based protocol suggestions
    if (metadata.port || metadata.destinationPort) {
      const port = metadata.port || metadata.destinationPort;
      analysis.portSuggestions = this.getProtocolSuggestionsByPort(port);
    }

    return analysis;
  }

  /**
   * Create a hex dump of the packet
   * @param {Buffer} packet - Raw packet data
   * @param {number} maxBytes - Maximum bytes to dump (default: 256)
   * @returns {string} Hex dump string
   */
  createHexDump(packet, maxBytes = 256) {
    const bytesToShow = Math.min(packet.length, maxBytes);
    const lines = [];
    
    for (let i = 0; i < bytesToShow; i += 16) {
      const offset = i.toString(16).padStart(8, '0');
      const hex = [];
      const ascii = [];
      
      for (let j = 0; j < 16 && i + j < bytesToShow; j++) {
        const byte = packet[i + j];
        hex.push(byte.toString(16).padStart(2, '0'));
        ascii.push((byte >= 32 && byte <= 126) ? String.fromCharCode(byte) : '.');
      }
      
      // Pad hex section
      while (hex.length < 16) {
        hex.push('  ');
      }
      
      lines.push(`${offset}  ${hex.slice(0, 8).join(' ')}  ${hex.slice(8).join(' ')}  |${ascii.join('')}|`);
    }
    
    if (packet.length > maxBytes) {
      lines.push(`... (${packet.length - maxBytes} more bytes)`);
    }
    
    return lines.join('\n');
  }

  /**
   * Calculate basic packet statistics
   * @param {Buffer} packet - Raw packet data
   * @returns {Object} Statistics
   */
  calculatePacketStatistics(packet) {
    const stats = {
      length: packet.length,
      entropy: 0,
      byteFrequency: new Array(256).fill(0),
      printableChars: 0,
      nullBytes: 0
    };

    // Calculate byte frequency and other stats
    for (let i = 0; i < packet.length; i++) {
      const byte = packet[i];
      stats.byteFrequency[byte]++;
      
      if (byte === 0) {
        stats.nullBytes++;
      } else if (byte >= 32 && byte <= 126) {
        stats.printableChars++;
      }
    }

    // Calculate entropy
    stats.entropy = this.calculateEntropy(stats.byteFrequency, packet.length);
    
    // Calculate percentages
    stats.printablePercentage = (stats.printableChars / packet.length) * 100;
    stats.nullPercentage = (stats.nullBytes / packet.length) * 100;

    // Most common bytes
    stats.mostCommonBytes = stats.byteFrequency
      .map((count, byte) => ({ byte, count, percentage: (count / packet.length) * 100 }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return stats;
  }

  /**
   * Calculate Shannon entropy
   * @param {Array} frequencies - Byte frequency array
   * @param {number} totalBytes - Total number of bytes
   * @returns {number} Entropy value
   */
  calculateEntropy(frequencies, totalBytes) {
    let entropy = 0;
    
    for (const freq of frequencies) {
      if (freq > 0) {
        const probability = freq / totalBytes;
        entropy -= probability * Math.log2(probability);
      }
    }
    
    return entropy;
  }

  /**
   * Find basic patterns in packet data
   * @param {Buffer} packet - Raw packet data
   * @returns {Object} Pattern analysis
   */
  findBasicPatterns(packet) {
    const patterns = {
      hasRepeatedBytes: false,
      hasSequentialBytes: false,
      possibleHeaders: [],
      possibleStrings: []
    };

    // Check for repeated bytes
    if (packet.length >= 4) {
      for (let i = 0; i < packet.length - 3; i++) {
        if (packet[i] === packet[i + 1] && packet[i] === packet[i + 2] && packet[i] === packet[i + 3]) {
          patterns.hasRepeatedBytes = true;
          break;
        }
      }
    }

    // Check for sequential bytes
    if (packet.length >= 4) {
      for (let i = 0; i < packet.length - 3; i++) {
        if (packet[i] + 1 === packet[i + 1] && 
            packet[i + 1] + 1 === packet[i + 2] && 
            packet[i + 2] + 1 === packet[i + 3]) {
          patterns.hasSequentialBytes = true;
          break;
        }
      }
    }

    // Look for possible headers (first 16 bytes)
    if (packet.length >= 4) {
      patterns.possibleHeaders = [
        { name: 'First 4 bytes', hex: packet.subarray(0, 4).toString('hex') },
        { name: 'First 8 bytes', hex: packet.subarray(0, Math.min(8, packet.length)).toString('hex') }
      ];
    }

    // Find possible strings
    patterns.possibleStrings = this.findPossibleStrings(packet);

    return patterns;
  }

  /**
   * Find possible text strings in packet data
   * @param {Buffer} packet - Raw packet data
   * @returns {Array} Array of possible strings
   */
  findPossibleStrings(packet) {
    const strings = [];
    let currentString = '';
    let startPos = 0;

    for (let i = 0; i < packet.length; i++) {
      const byte = packet[i];
      
      if ((byte >= 32 && byte <= 126) || byte === 9 || byte === 10 || byte === 13) {
        if (currentString.length === 0) {
          startPos = i;
        }
        currentString += String.fromCharCode(byte);
      } else {
        if (currentString.length >= 4) {
          strings.push({
            value: currentString.trim(),
            offset: startPos,
            length: currentString.length
          });
        }
        currentString = '';
      }
    }

    // Handle string at end of packet
    if (currentString.length >= 4) {
      strings.push({
        value: currentString.trim(),
        offset: startPos,
        length: currentString.length
      });
    }

    return strings.slice(0, 10); // Limit to 10 strings
  }

  /**
   * Get protocol suggestions based on port number
   * @param {number} port - Port number
   * @returns {Array} Array of protocol suggestions
   */
  getProtocolSuggestionsByPort(port) {
    const commonPorts = {
      21: ['FTP'],
      22: ['SSH'],
      23: ['Telnet'],
      25: ['SMTP'],
      53: ['DNS'],
      80: ['HTTP'],
      110: ['POP3'],
      143: ['IMAP'],
      443: ['HTTPS', 'TLS'],
      465: ['SMTPS'],
      993: ['IMAPS'],
      995: ['POP3S'],
      1883: ['MQTT'],
      8883: ['MQTT over TLS'],
      3306: ['MySQL'],
      5432: ['PostgreSQL'],
      6379: ['Redis'],
      27017: ['MongoDB']
    };

    return commonPorts[port] || [`Unknown service on port ${port}`];
  }

  /**
   * Calculate protocol distribution from analysis results
   * @param {Array} results - Analysis results
   * @returns {Object} Protocol distribution
   */
  calculateProtocolDistribution(results) {
    const distribution = {};
    
    for (const result of results) {
      if (!result.error && result.summary) {
        for (const protocol of result.summary.protocolsDetected) {
          distribution[protocol] = (distribution[protocol] || 0) + 1;
        }
      }
    }

    return distribution;
  }

  /**
   * Create a custom analyzer with configuration
   * @param {Object} config - Analyzer configuration
   * @returns {CustomBinaryAnalyzer} Configured analyzer
   */
  createCustomAnalyzer(config) {
    const analyzer = new CustomBinaryAnalyzer(config);
    this.addAnalyzer(analyzer);
    return analyzer;
  }

  /**
   * Export analyzer configuration
   * @returns {Object} Configuration object
   */
  exportConfiguration() {
    const config = {
      analyzers: {},
      timestamp: new Date().toISOString()
    };

    for (const [name, analyzer] of this.analyzers) {
      config.analyzers[name] = {
        type: analyzer.constructor.name,
        info: analyzer.getProtocolInfo(),
        config: analyzer.config || null
      };
    }

    return config;
  }

  /**
   * Import analyzer configuration
   * @param {Object} config - Configuration object
   */
  importConfiguration(config) {
    // This is a simplified version - in practice, you'd need to properly
    // reconstruct analyzer instances from configuration
    console.log('Configuration import not fully implemented');
    console.log('Available configuration:', config);
  }
}

export default NetworkAnalyzer;