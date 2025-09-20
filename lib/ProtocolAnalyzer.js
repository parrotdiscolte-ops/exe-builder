/**
 * Base class for protocol analyzers
 * Provides common interface for analyzing network packets
 */
class ProtocolAnalyzer {
  constructor(name) {
    this.name = name;
  }

  /**
   * Check if this analyzer can handle the given packet
   * @param {Buffer} packet - Raw packet data
   * @param {Object} metadata - Packet metadata (port, protocol, etc.)
   * @returns {boolean} True if this analyzer can handle the packet
   */
  canAnalyze(packet, metadata) {
    throw new Error('canAnalyze must be implemented by subclasses');
  }

  /**
   * Analyze the packet and extract protocol-specific information
   * @param {Buffer} packet - Raw packet data
   * @param {Object} metadata - Packet metadata
   * @returns {Object} Analysis results
   */
  analyze(packet, metadata) {
    throw new Error('analyze must be implemented by subclasses');
  }

  /**
   * Get supported protocol information
   * @returns {Object} Protocol information
   */
  getProtocolInfo() {
    return {
      name: this.name,
      description: 'Base protocol analyzer',
      supportedPorts: []
    };
  }
}

export default ProtocolAnalyzer;