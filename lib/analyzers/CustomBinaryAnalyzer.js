import ProtocolAnalyzer from '../ProtocolAnalyzer.js';

/**
 * Custom Binary Format Analyzer
 * Configurable analyzer for custom binary protocols
 */
class CustomBinaryAnalyzer extends ProtocolAnalyzer {
  constructor(config = {}) {
    super('CustomBinary');
    this.config = {
      patterns: [],
      fieldDefinitions: [],
      endianness: 'BE', // 'BE' for big-endian, 'LE' for little-endian
      ...config
    };
  }

  getProtocolInfo() {
    return {
      name: 'Custom Binary',
      description: 'Configurable analyzer for custom binary protocols',
      supportedPorts: this.config.ports || []
    };
  }

  /**
   * Add a pattern to identify this protocol
   * @param {Object} pattern - Pattern definition
   */
  addPattern(pattern) {
    this.config.patterns.push(pattern);
  }

  /**
   * Add a field definition for parsing
   * @param {Object} field - Field definition
   */
  addField(field) {
    this.config.fieldDefinitions.push(field);
  }

  /**
   * Configure protocol detection patterns
   * @param {Array} patterns - Array of pattern objects
   */
  setPatterns(patterns) {
    this.config.patterns = patterns;
  }

  /**
   * Configure field definitions
   * @param {Array} fields - Array of field definition objects
   */
  setFields(fields) {
    this.config.fieldDefinitions = fields;
  }

  canAnalyze(packet, metadata) {
    // Check port-based detection
    if (metadata.port && this.config.ports && this.config.ports.includes(metadata.port)) {
      return true;
    }

    // Check pattern-based detection
    for (const pattern of this.config.patterns) {
      if (this.matchesPattern(packet, pattern)) {
        return true;
      }
    }

    return false;
  }

  matchesPattern(packet, pattern) {
    if (packet.length < pattern.minLength || packet.length < pattern.offset + pattern.bytes.length) {
      return false;
    }

    for (let i = 0; i < pattern.bytes.length; i++) {
      const expectedByte = pattern.bytes[i];
      const actualByte = packet[pattern.offset + i];

      // Support wildcard bytes (0xFF means any byte)
      if (expectedByte !== 0xFF && expectedByte !== actualByte) {
        return false;
      }
    }

    return true;
  }

  analyze(packet, metadata) {
    const result = {
      protocol: 'CustomBinary',
      timestamp: new Date().toISOString(),
      sourcePort: metadata.sourcePort,
      destinationPort: metadata.destinationPort,
      packetSize: packet.length,
      analysis: {
        configName: this.config.name || 'Unnamed',
        fields: {},
        rawData: {}
      }
    };

    try {
      // Identify which pattern matched
      let matchedPattern = null;
      for (const pattern of this.config.patterns) {
        if (this.matchesPattern(packet, pattern)) {
          matchedPattern = pattern;
          break;
        }
      }

      if (matchedPattern) {
        result.analysis.matchedPattern = matchedPattern.name || 'Unnamed pattern';
      }

      // Parse fields according to field definitions
      for (const field of this.config.fieldDefinitions) {
        try {
          const value = this.parseField(packet, field);
          result.analysis.fields[field.name] = {
            value: value,
            type: field.type,
            offset: field.offset,
            description: field.description
          };
        } catch (error) {
          result.analysis.fields[field.name] = {
            error: error.message,
            type: field.type,
            offset: field.offset
          };
        }
      }

      // Extract raw data sections if configured
      if (this.config.rawSections) {
        for (const section of this.config.rawSections) {
          const start = section.offset;
          const end = section.length ? start + section.length : packet.length;
          
          if (start < packet.length) {
            const sectionData = packet.subarray(start, Math.min(end, packet.length));
            result.analysis.rawData[section.name] = {
              hex: sectionData.toString('hex'),
              ascii: this.toSafeAscii(sectionData),
              length: sectionData.length
            };
          }
        }
      }

      // Detect common patterns automatically
      this.detectCommonPatterns(packet, result.analysis);

    } catch (error) {
      result.analysis.error = `Custom binary analysis failed: ${error.message}`;
    }

    return result;
  }

  parseField(packet, field) {
    if (packet.length <= field.offset) {
      throw new Error(`Packet too short for field ${field.name}`);
    }

    const data = packet.subarray(field.offset);

    switch (field.type) {
      case 'uint8':
        return data[0];

      case 'uint16':
        if (data.length < 2) throw new Error('Not enough data for uint16');
        return this.config.endianness === 'BE' ? data.readUInt16BE(0) : data.readUInt16LE(0);

      case 'uint32':
        if (data.length < 4) throw new Error('Not enough data for uint32');
        return this.config.endianness === 'BE' ? data.readUInt32BE(0) : data.readUInt32LE(0);

      case 'int8':
        return data.readInt8(0);

      case 'int16':
        if (data.length < 2) throw new Error('Not enough data for int16');
        return this.config.endianness === 'BE' ? data.readInt16BE(0) : data.readInt16LE(0);

      case 'int32':
        if (data.length < 4) throw new Error('Not enough data for int32');
        return this.config.endianness === 'BE' ? data.readInt32BE(0) : data.readInt32LE(0);

      case 'float':
        if (data.length < 4) throw new Error('Not enough data for float');
        return this.config.endianness === 'BE' ? data.readFloatBE(0) : data.readFloatLE(0);

      case 'double':
        if (data.length < 8) throw new Error('Not enough data for double');
        return this.config.endianness === 'BE' ? data.readDoubleBE(0) : data.readDoubleLE(0);

      case 'string':
        const length = field.length || (data.length - field.offset);
        const stringData = data.subarray(0, Math.min(length, data.length));
        return stringData.toString(field.encoding || 'utf8');

      case 'bytes':
        const bytesLength = field.length || (data.length - field.offset);
        return data.subarray(0, Math.min(bytesLength, data.length)).toString('hex');

      case 'bit_field':
        if (data.length < 1) throw new Error('Not enough data for bit field');
        const byte = data[0];
        const result = {};
        for (const bit of field.bits || []) {
          result[bit.name] = (byte & (1 << bit.position)) !== 0;
        }
        return result;

      case 'enum':
        const enumValue = data[0];
        const enumName = field.values && field.values[enumValue];
        return {
          value: enumValue,
          name: enumName || `Unknown (${enumValue})`
        };

      default:
        throw new Error(`Unknown field type: ${field.type}`);
    }
  }

  detectCommonPatterns(packet, analysis) {
    analysis.commonPatterns = {};

    // Check for magic numbers at the beginning
    if (packet.length >= 4) {
      const magicNumber = packet.readUInt32BE(0);
      analysis.commonPatterns.magicNumber = {
        hex: '0x' + magicNumber.toString(16).padStart(8, '0'),
        decimal: magicNumber
      };
    }

    // Check for length fields
    if (packet.length >= 2) {
      const possibleLength16BE = packet.readUInt16BE(0);
      const possibleLength16LE = packet.readUInt16LE(0);
      
      if (possibleLength16BE === packet.length - 2) {
        analysis.commonPatterns.lengthField = { type: 'uint16BE', offset: 0, value: possibleLength16BE };
      } else if (possibleLength16LE === packet.length - 2) {
        analysis.commonPatterns.lengthField = { type: 'uint16LE', offset: 0, value: possibleLength16LE };
      }
    }

    // Check for checksums at the end
    if (packet.length >= 2) {
      const lastTwo = packet.subarray(-2);
      analysis.commonPatterns.possibleChecksum = {
        crc16: this.calculateCRC16(packet.subarray(0, -2)),
        simple: (packet.subarray(0, -2).reduce((sum, byte) => sum + byte, 0) & 0xFFFF)
      };
    }

    // Detect ASCII strings
    const asciiStrings = this.findAsciiStrings(packet);
    if (asciiStrings.length > 0) {
      analysis.commonPatterns.asciiStrings = asciiStrings;
    }

    // Detect repeated patterns
    const repeatedPatterns = this.findRepeatedPatterns(packet);
    if (repeatedPatterns.length > 0) {
      analysis.commonPatterns.repeatedPatterns = repeatedPatterns;
    }
  }

  findAsciiStrings(packet, minLength = 4) {
    const strings = [];
    let currentString = '';
    let startOffset = 0;

    for (let i = 0; i < packet.length; i++) {
      const byte = packet[i];
      
      if ((byte >= 32 && byte <= 126) || byte === 9 || byte === 10 || byte === 13) {
        if (currentString.length === 0) {
          startOffset = i;
        }
        currentString += String.fromCharCode(byte);
      } else {
        if (currentString.length >= minLength) {
          strings.push({
            value: currentString.trim(),
            offset: startOffset,
            length: currentString.length
          });
        }
        currentString = '';
      }
    }

    if (currentString.length >= minLength) {
      strings.push({
        value: currentString.trim(),
        offset: startOffset,
        length: currentString.length
      });
    }

    return strings;
  }

  findRepeatedPatterns(packet, minLength = 2, minOccurrences = 2) {
    const patterns = new Map();

    for (let len = minLength; len <= Math.min(16, packet.length / 2); len++) {
      for (let offset = 0; offset <= packet.length - len; offset++) {
        const pattern = packet.subarray(offset, offset + len);
        const patternHex = pattern.toString('hex');
        
        if (!patterns.has(patternHex)) {
          patterns.set(patternHex, { 
            pattern: patternHex, 
            length: len, 
            occurrences: [],
            bytes: Array.from(pattern)
          });
        }
        
        patterns.get(patternHex).occurrences.push(offset);
      }
    }

    return Array.from(patterns.values())
      .filter(p => p.occurrences.length >= minOccurrences)
      .sort((a, b) => b.occurrences.length - a.occurrences.length)
      .slice(0, 10); // Limit to top 10 patterns
  }

  calculateCRC16(data) {
    let crc = 0xFFFF;
    
    for (let i = 0; i < data.length; i++) {
      crc ^= data[i];
      
      for (let j = 0; j < 8; j++) {
        if (crc & 0x0001) {
          crc = (crc >> 1) ^ 0xA001;
        } else {
          crc = crc >> 1;
        }
      }
    }
    
    return crc;
  }

  toSafeAscii(buffer) {
    return Array.from(buffer)
      .map(byte => (byte >= 32 && byte <= 126) ? String.fromCharCode(byte) : '.')
      .join('');
  }

  // Static method to create pre-configured analyzers for common protocols
  static createModbusAnalyzer() {
    const config = {
      name: 'Modbus RTU',
      ports: [502],
      patterns: [
        {
          name: 'Modbus RTU',
          offset: 0,
          bytes: [0xFF], // Any device address
          minLength: 4
        }
      ],
      fieldDefinitions: [
        { name: 'deviceAddress', type: 'uint8', offset: 0, description: 'Modbus device address' },
        { name: 'functionCode', type: 'uint8', offset: 1, description: 'Modbus function code' },
        { name: 'crc', type: 'uint16', offset: -2, description: 'CRC-16 checksum' }
      ],
      rawSections: [
        { name: 'data', offset: 2, length: -2 }
      ]
    };
    
    return new CustomBinaryAnalyzer(config);
  }

  static createDNSAnalyzer() {
    const config = {
      name: 'DNS Protocol',
      ports: [53],
      patterns: [
        {
          name: 'DNS Query/Response',
          offset: 2,
          bytes: [0xFF, 0xFF], // Any flags
          minLength: 12
        }
      ],
      fieldDefinitions: [
        { name: 'transactionId', type: 'uint16', offset: 0, description: 'DNS transaction ID' },
        { name: 'flags', type: 'uint16', offset: 2, description: 'DNS flags' },
        { name: 'questions', type: 'uint16', offset: 4, description: 'Number of questions' },
        { name: 'answers', type: 'uint16', offset: 6, description: 'Number of answers' },
        { name: 'authority', type: 'uint16', offset: 8, description: 'Number of authority records' },
        { name: 'additional', type: 'uint16', offset: 10, description: 'Number of additional records' }
      ]
    };
    
    return new CustomBinaryAnalyzer(config);
  }
}

export default CustomBinaryAnalyzer;