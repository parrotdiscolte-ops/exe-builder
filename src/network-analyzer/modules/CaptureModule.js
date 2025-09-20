/**
 * CaptureModule - Network packet capture functionality
 * Handles network traffic capture with filtering and buffering
 */

import EventEmitter from 'events';

export class CaptureModule extends EventEmitter {
  constructor(options = {}) {
    super();
    this.config = {
      interface: options.interface || 'any',
      bufferSize: options.bufferSize || 10000,
      promiscuousMode: options.promiscuousMode || false,
      snapLength: options.snapLength || 65535,
      timeout: options.timeout || 1000,
      filters: options.filters || [],
      ...options
    };

    this.isCapturing = false;
    this.captureBuffer = [];
    this.stats = {
      packetsCapture: 0,
      packetsDropped: 0,
      bytesCapture: 0,
      startTime: null,
      lastPacketTime: null,
      interfaceStats: new Map()
    };

    this.activeFilters = new Set();
    this._initializeFilters();
  }

  /**
   * Initialize capture filters
   */
  _initializeFilters() {
    this.config.filters.forEach(filter => {
      this.addFilter(filter);
    });
  }

  /**
   * Start packet capture
   */
  async startCapture() {
    if (this.isCapturing) {
      throw new Error('Capture already in progress');
    }

    try {
      this.isCapturing = true;
      this.stats.startTime = new Date();
      this.stats.packetsCapture = 0;
      this.stats.packetsDropped = 0;
      this.stats.bytesCapture = 0;
      this.captureBuffer = [];

      // Simulate interface initialization
      await this._initializeInterface();
      
      this.emit('capture:started', {
        interface: this.config.interface,
        filters: Array.from(this.activeFilters),
        timestamp: this.stats.startTime.toISOString()
      });

      // Start capture simulation
      this._simulateCapture();

      return {
        success: true,
        message: `Started capture on interface ${this.config.interface}`,
        config: this.config
      };

    } catch (error) {
      this.isCapturing = false;
      this.emit('capture:error', { 
        error: error.message, 
        timestamp: new Date().toISOString() 
      });
      throw error;
    }
  }

  /**
   * Stop packet capture
   */
  async stopCapture() {
    if (!this.isCapturing) {
      throw new Error('No capture in progress');
    }

    try {
      this.isCapturing = false;
      const endTime = new Date();
      const duration = endTime - this.stats.startTime;

      this.emit('capture:stopped', {
        duration: duration,
        totalPackets: this.stats.packetsCapture,
        totalBytes: this.stats.bytesCapture,
        packetsDropped: this.stats.packetsDropped,
        timestamp: endTime.toISOString()
      });

      return {
        success: true,
        stats: {
          ...this.stats,
          duration,
          endTime,
          captureRate: this.stats.packetsCapture / (duration / 1000)
        }
      };

    } catch (error) {
      this.emit('capture:error', { 
        error: error.message, 
        timestamp: new Date().toISOString() 
      });
      throw error;
    }
  }

  /**
   * Add capture filter
   */
  addFilter(filter) {
    if (typeof filter === 'string') {
      // Simple string filter (e.g., "tcp port 80", "host 192.168.1.1")
      this.activeFilters.add(filter);
    } else if (typeof filter === 'object') {
      // Object filter with properties
      const filterString = this._buildFilterString(filter);
      this.activeFilters.add(filterString);
    } else {
      throw new Error('Filter must be a string or object');
    }

    this.emit('filter:added', { 
      filter, 
      activeFilters: Array.from(this.activeFilters),
      timestamp: new Date().toISOString() 
    });

    return true;
  }

  /**
   * Remove capture filter
   */
  removeFilter(filter) {
    const filterString = typeof filter === 'object' ? this._buildFilterString(filter) : filter;
    const removed = this.activeFilters.delete(filterString);

    if (removed) {
      this.emit('filter:removed', { 
        filter: filterString, 
        activeFilters: Array.from(this.activeFilters),
        timestamp: new Date().toISOString() 
      });
    }

    return removed;
  }

  /**
   * Get captured packets
   */
  getPackets(options = {}) {
    const {
      limit = this.captureBuffer.length,
      offset = 0,
      filterBy = null
    } = options;

    let packets = this.captureBuffer.slice(offset);

    if (filterBy) {
      packets = packets.filter(packet => this._applyPacketFilter(packet, filterBy));
    }

    return {
      packets: packets.slice(0, limit),
      total: this.captureBuffer.length,
      filtered: packets.length,
      stats: this.getStats()
    };
  }

  /**
   * Save capture to file
   */
  async saveCapture(filename, format = 'pcap') {
    if (!this.captureBuffer.length) {
      throw new Error('No packets to save');
    }

    try {
      const data = this._formatCaptureData(format);
      
      // Simulate file write
      const result = {
        success: true,
        filename: filename,
        format: format,
        packetCount: this.captureBuffer.length,
        fileSize: JSON.stringify(data).length,
        timestamp: new Date().toISOString()
      };

      this.emit('capture:saved', result);
      return result;

    } catch (error) {
      this.emit('capture:error', { 
        error: error.message, 
        operation: 'save',
        timestamp: new Date().toISOString() 
      });
      throw error;
    }
  }

  /**
   * Load capture from file
   */
  async loadCapture(filename) {
    try {
      // Simulate file load
      const mockData = this._generateMockCaptureData();
      this.captureBuffer = mockData.packets;
      this.stats.packetsCapture = mockData.packets.length;
      this.stats.bytesCapture = mockData.packets.reduce((sum, p) => sum + (p.size || 0), 0);

      const result = {
        success: true,
        filename: filename,
        packetCount: this.captureBuffer.length,
        timestamp: new Date().toISOString()
      };

      this.emit('capture:loaded', result);
      return result;

    } catch (error) {
      this.emit('capture:error', { 
        error: error.message, 
        operation: 'load',
        timestamp: new Date().toISOString() 
      });
      throw error;
    }
  }

  /**
   * Get capture statistics
   */
  getStats() {
    return {
      ...this.stats,
      isCapturing: this.isCapturing,
      bufferUsage: (this.captureBuffer.length / this.config.bufferSize) * 100,
      activeFilters: Array.from(this.activeFilters),
      memoryUsage: this._estimateMemoryUsage()
    };
  }

  /**
   * Clear capture buffer
   */
  clearBuffer() {
    const previousCount = this.captureBuffer.length;
    this.captureBuffer = [];
    
    this.emit('buffer:cleared', { 
      previousCount,
      timestamp: new Date().toISOString() 
    });

    return { success: true, clearedPackets: previousCount };
  }

  /**
   * Initialize network interface (simulated)
   */
  async _initializeInterface() {
    // Simulate interface setup delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    this.stats.interfaceStats.set(this.config.interface, {
      name: this.config.interface,
      mtu: 1500,
      speed: '1 Gbps',
      status: 'up'
    });
  }

  /**
   * Simulate packet capture
   */
  _simulateCapture() {
    if (!this.isCapturing) return;

    // Generate random packets
    const packet = this._generateRandomPacket();
    
    if (this._passesFilters(packet)) {
      this._addPacketToBuffer(packet);
    }

    // Schedule next packet (simulate network activity)
    const delay = Math.random() * 100 + 10; // 10-110ms
    setTimeout(() => this._simulateCapture(), delay);
  }

  /**
   * Generate random packet for simulation
   */
  _generateRandomPacket() {
    const protocols = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'DNS', 'MQTT'];
    const sourceIPs = ['192.168.1.10', '10.0.0.5', '172.16.1.100', '8.8.8.8'];
    const destIPs = ['192.168.1.1', '10.0.0.1', '172.16.1.1', '1.1.1.1'];
    
    return {
      id: this.stats.packetsCapture + 1,
      timestamp: new Date().toISOString(),
      protocol: protocols[Math.floor(Math.random() * protocols.length)],
      source: sourceIPs[Math.floor(Math.random() * sourceIPs.length)],
      destination: destIPs[Math.floor(Math.random() * destIPs.length)],
      port: Math.floor(Math.random() * 65535) + 1,
      size: Math.floor(Math.random() * 1500) + 64,
      flags: ['SYN', 'ACK', 'FIN', 'RST'][Math.floor(Math.random() * 4)],
      data: `Packet data ${this.stats.packetsCapture + 1}`
    };
  }

  /**
   * Add packet to capture buffer
   */
  _addPacketToBuffer(packet) {
    // Check buffer limit
    if (this.captureBuffer.length >= this.config.bufferSize) {
      // Remove oldest packet
      this.captureBuffer.shift();
      this.stats.packetsDropped++;
    }

    this.captureBuffer.push(packet);
    this.stats.packetsCapture++;
    this.stats.bytesCapture += packet.size || 0;
    this.stats.lastPacketTime = new Date(packet.timestamp);

    this.emit('packet:captured', packet);
  }

  /**
   * Check if packet passes active filters
   */
  _passesFilters(packet) {
    if (this.activeFilters.size === 0) return true;

    for (const filter of this.activeFilters) {
      if (this._matchesFilter(packet, filter)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if packet matches a specific filter
   */
  _matchesFilter(packet, filter) {
    // Simple filter matching logic
    const filterLower = filter.toLowerCase();
    
    if (filterLower.includes('tcp') && packet.protocol === 'TCP') return true;
    if (filterLower.includes('udp') && packet.protocol === 'UDP') return true;
    if (filterLower.includes('http') && packet.protocol === 'HTTP') return true;
    if (filterLower.includes(`port ${packet.port}`)) return true;
    if (filterLower.includes(`host ${packet.source}`) || filterLower.includes(`host ${packet.destination}`)) return true;

    return false;
  }

  /**
   * Build filter string from object
   */
  _buildFilterString(filterObj) {
    const parts = [];
    
    if (filterObj.protocol) parts.push(filterObj.protocol.toLowerCase());
    if (filterObj.port) parts.push(`port ${filterObj.port}`);
    if (filterObj.host) parts.push(`host ${filterObj.host}`);
    if (filterObj.src) parts.push(`src ${filterObj.src}`);
    if (filterObj.dst) parts.push(`dst ${filterObj.dst}`);

    return parts.join(' and ');
  }

  /**
   * Apply packet filter for retrieval
   */
  _applyPacketFilter(packet, filter) {
    if (filter.protocol && packet.protocol !== filter.protocol) return false;
    if (filter.source && packet.source !== filter.source) return false;
    if (filter.destination && packet.destination !== filter.destination) return false;
    if (filter.port && packet.port !== filter.port) return false;
    
    return true;
  }

  /**
   * Format capture data for export
   */
  _formatCaptureData(format) {
    const metadata = {
      format: format,
      captureTime: this.stats.startTime?.toISOString(),
      interface: this.config.interface,
      filters: Array.from(this.activeFilters),
      stats: this.getStats()
    };

    switch (format) {
      case 'json':
        return { metadata, packets: this.captureBuffer };
      case 'pcap':
        return { metadata, packets: this._convertToPcapFormat() };
      default:
        return { metadata, packets: this.captureBuffer };
    }
  }

  /**
   * Convert packets to PCAP-like format
   */
  _convertToPcapFormat() {
    return this.captureBuffer.map(packet => ({
      timestamp: packet.timestamp,
      length: packet.size || 0,
      protocol: packet.protocol,
      src: packet.source,
      dst: packet.destination,
      port: packet.port,
      data: packet.data
    }));
  }

  /**
   * Generate mock capture data
   */
  _generateMockCaptureData() {
    const packets = [];
    for (let i = 0; i < 100; i++) {
      packets.push(this._generateRandomPacket());
    }
    return { packets };
  }

  /**
   * Estimate memory usage
   */
  _estimateMemoryUsage() {
    const avgPacketSize = this.captureBuffer.reduce((sum, p) => 
      sum + JSON.stringify(p).length, 0) / this.captureBuffer.length || 0;
    
    return {
      packets: this.captureBuffer.length,
      estimatedBytes: Math.round(avgPacketSize * this.captureBuffer.length),
      bufferUtilization: (this.captureBuffer.length / this.config.bufferSize) * 100
    };
  }
}

export default CaptureModule;