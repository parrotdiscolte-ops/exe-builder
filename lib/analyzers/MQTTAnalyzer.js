import ProtocolAnalyzer from '../ProtocolAnalyzer.js';

/**
 * MQTT Protocol Analyzer
 * Analyzes MQTT (Message Queuing Telemetry Transport) protocol messages
 */
class MQTTAnalyzer extends ProtocolAnalyzer {
  constructor() {
    super('MQTT');
  }

  getProtocolInfo() {
    return {
      name: 'MQTT',
      description: 'Message Queuing Telemetry Transport protocol analyzer',
      supportedPorts: [1883, 8883, 1884, 8884]
    };
  }

  canAnalyze(packet, metadata) {
    // Check for MQTT on common ports
    if (metadata.port && this.getProtocolInfo().supportedPorts.includes(metadata.port)) {
      return true;
    }

    // Check for MQTT packet signature
    if (packet.length >= 2) {
      const firstByte = packet[0];
      const messageType = (firstByte >> 4) & 0x0F;
      
      // Valid MQTT message types: 1-14 (0 and 15 are reserved)
      return messageType >= 1 && messageType <= 14;
    }

    return false;
  }

  analyze(packet, metadata) {
    const result = {
      protocol: 'MQTT',
      timestamp: new Date().toISOString(),
      sourcePort: metadata.sourcePort,
      destinationPort: metadata.destinationPort,
      packetSize: packet.length,
      analysis: {}
    };

    try {
      if (packet.length < 2) {
        result.analysis.error = 'Packet too short for MQTT analysis';
        return result;
      }

      const fixedHeader = this.parseFixedHeader(packet);
      result.analysis.fixedHeader = fixedHeader;

      let offset = fixedHeader.headerLength;

      // Parse variable header and payload based on message type
      switch (fixedHeader.messageType) {
        case 1: // CONNECT
          this.parseConnect(packet, offset, result.analysis);
          break;
        case 2: // CONNACK
          this.parseConnack(packet, offset, result.analysis);
          break;
        case 3: // PUBLISH
          this.parsePublish(packet, offset, result.analysis, fixedHeader);
          break;
        case 4: // PUBACK
        case 5: // PUBREC
        case 6: // PUBREL
        case 7: // PUBCOMP
          this.parsePubAck(packet, offset, result.analysis, fixedHeader.messageType);
          break;
        case 8: // SUBSCRIBE
          this.parseSubscribe(packet, offset, result.analysis);
          break;
        case 9: // SUBACK
          this.parseSuback(packet, offset, result.analysis);
          break;
        case 10: // UNSUBSCRIBE
          this.parseUnsubscribe(packet, offset, result.analysis);
          break;
        case 11: // UNSUBACK
          this.parseUnsuback(packet, offset, result.analysis);
          break;
        case 12: // PINGREQ
        case 13: // PINGRESP
          // No variable header or payload
          result.analysis.message = 'Keep-alive message';
          break;
        case 14: // DISCONNECT
          result.analysis.message = 'Client disconnection';
          break;
      }

    } catch (error) {
      result.analysis.error = `MQTT analysis failed: ${error.message}`;
    }

    return result;
  }

  parseFixedHeader(packet) {
    const firstByte = packet[0];
    const messageType = (firstByte >> 4) & 0x0F;
    const dupFlag = (firstByte >> 3) & 0x01;
    const qosLevel = (firstByte >> 1) & 0x03;
    const retainFlag = firstByte & 0x01;

    // Parse remaining length
    let remainingLength = 0;
    let multiplier = 1;
    let offset = 1;

    while (offset < packet.length) {
      const byte = packet[offset];
      remainingLength += (byte & 0x7F) * multiplier;
      offset++;
      
      if ((byte & 0x80) === 0) break;
      
      multiplier *= 128;
      if (multiplier > 128 * 128 * 128) {
        throw new Error('Malformed remaining length');
      }
    }

    return {
      messageType: messageType,
      messageTypeName: this.getMessageTypeName(messageType),
      dupFlag: dupFlag === 1,
      qosLevel: qosLevel,
      retainFlag: retainFlag === 1,
      remainingLength: remainingLength,
      headerLength: offset
    };
  }

  getMessageTypeName(type) {
    const types = {
      1: 'CONNECT',
      2: 'CONNACK', 
      3: 'PUBLISH',
      4: 'PUBACK',
      5: 'PUBREC',
      6: 'PUBREL',
      7: 'PUBCOMP',
      8: 'SUBSCRIBE',
      9: 'SUBACK',
      10: 'UNSUBSCRIBE',
      11: 'UNSUBACK',
      12: 'PINGREQ',
      13: 'PINGRESP',
      14: 'DISCONNECT'
    };
    return types[type] || `Unknown (${type})`;
  }

  parseConnect(packet, offset, analysis) {
    if (packet.length < offset + 10) {
      analysis.error = 'CONNECT packet too short';
      return;
    }

    // Protocol name length (2 bytes) + protocol name + protocol level (1 byte) + connect flags (1 byte) + keep alive (2 bytes)
    const protocolNameLength = packet.readUInt16BE(offset);
    const protocolName = packet.subarray(offset + 2, offset + 2 + protocolNameLength).toString('utf8');
    const protocolLevel = packet[offset + 2 + protocolNameLength];
    const connectFlags = packet[offset + 3 + protocolNameLength];
    const keepAlive = packet.readUInt16BE(offset + 4 + protocolNameLength);

    analysis.connect = {
      protocolName: protocolName,
      protocolLevel: protocolLevel,
      keepAlive: keepAlive,
      cleanSession: (connectFlags & 0x02) !== 0,
      willFlag: (connectFlags & 0x04) !== 0,
      willQoS: (connectFlags >> 3) & 0x03,
      willRetain: (connectFlags & 0x20) !== 0,
      passwordFlag: (connectFlags & 0x40) !== 0,
      usernameFlag: (connectFlags & 0x80) !== 0
    };

    // Parse client ID
    let payloadOffset = offset + 6 + protocolNameLength;
    if (packet.length > payloadOffset + 2) {
      const clientIdLength = packet.readUInt16BE(payloadOffset);
      if (packet.length >= payloadOffset + 2 + clientIdLength) {
        analysis.connect.clientId = packet.subarray(payloadOffset + 2, payloadOffset + 2 + clientIdLength).toString('utf8');
      }
    }
  }

  parseConnack(packet, offset, analysis) {
    if (packet.length < offset + 2) {
      analysis.error = 'CONNACK packet too short';
      return;
    }

    const acknowledgeFlags = packet[offset];
    const returnCode = packet[offset + 1];

    analysis.connack = {
      sessionPresent: (acknowledgeFlags & 0x01) !== 0,
      returnCode: returnCode,
      returnCodeName: this.getConnackReturnCodeName(returnCode)
    };
  }

  getConnackReturnCodeName(code) {
    const codes = {
      0: 'Connection Accepted',
      1: 'Unacceptable protocol version',
      2: 'Identifier rejected',
      3: 'Server unavailable',
      4: 'Bad user name or password',
      5: 'Not authorized'
    };
    return codes[code] || `Unknown (${code})`;
  }

  parsePublish(packet, offset, analysis, fixedHeader) {
    if (packet.length < offset + 2) {
      analysis.error = 'PUBLISH packet too short';
      return;
    }

    // Topic name
    const topicLength = packet.readUInt16BE(offset);
    if (packet.length < offset + 2 + topicLength) {
      analysis.error = 'PUBLISH packet topic name incomplete';
      return;
    }

    const topicName = packet.subarray(offset + 2, offset + 2 + topicLength).toString('utf8');
    offset += 2 + topicLength;

    analysis.publish = {
      topicName: topicName,
      qosLevel: fixedHeader.qosLevel,
      retainFlag: fixedHeader.retainFlag,
      dupFlag: fixedHeader.dupFlag
    };

    // Packet identifier (only present if QoS > 0)
    if (fixedHeader.qosLevel > 0) {
      if (packet.length < offset + 2) {
        analysis.error = 'PUBLISH packet identifier missing';
        return;
      }
      analysis.publish.packetId = packet.readUInt16BE(offset);
      offset += 2;
    }

    // Payload
    if (packet.length > offset) {
      const payload = packet.subarray(offset);
      analysis.publish.payloadLength = payload.length;
      
      // Try to detect payload type
      try {
        const payloadStr = payload.toString('utf8');
        analysis.publish.payload = payloadStr;
        analysis.publish.payloadType = 'text';
        
        // Try to parse as JSON
        try {
          JSON.parse(payloadStr);
          analysis.publish.payloadType = 'json';
        } catch (e) {
          // Not JSON, keep as text
        }
      } catch (e) {
        analysis.publish.payloadType = 'binary';
        analysis.publish.payloadHex = payload.toString('hex');
      }
    }
  }

  parsePubAck(packet, offset, analysis, messageType) {
    if (packet.length < offset + 2) {
      analysis.error = 'PUB* packet too short';
      return;
    }

    const packetId = packet.readUInt16BE(offset);
    const messageTypeName = this.getMessageTypeName(messageType);

    analysis[messageTypeName.toLowerCase()] = {
      packetId: packetId
    };
  }

  parseSubscribe(packet, offset, analysis) {
    if (packet.length < offset + 2) {
      analysis.error = 'SUBSCRIBE packet too short';
      return;
    }

    const packetId = packet.readUInt16BE(offset);
    offset += 2;

    analysis.subscribe = {
      packetId: packetId,
      topics: []
    };

    // Parse topic filters
    while (offset < packet.length) {
      if (packet.length < offset + 3) break;

      const topicLength = packet.readUInt16BE(offset);
      if (packet.length < offset + 2 + topicLength + 1) break;

      const topicFilter = packet.subarray(offset + 2, offset + 2 + topicLength).toString('utf8');
      const qos = packet[offset + 2 + topicLength];

      analysis.subscribe.topics.push({
        topicFilter: topicFilter,
        qos: qos
      });

      offset += 2 + topicLength + 1;
    }
  }

  parseSuback(packet, offset, analysis) {
    if (packet.length < offset + 2) {
      analysis.error = 'SUBACK packet too short';
      return;
    }

    const packetId = packet.readUInt16BE(offset);
    offset += 2;

    analysis.suback = {
      packetId: packetId,
      returnCodes: []
    };

    // Parse return codes
    while (offset < packet.length) {
      const returnCode = packet[offset];
      analysis.suback.returnCodes.push({
        code: returnCode,
        name: this.getSubackReturnCodeName(returnCode)
      });
      offset++;
    }
  }

  getSubackReturnCodeName(code) {
    if (code <= 2) {
      return `Maximum QoS ${code}`;
    } else if (code === 0x80) {
      return 'Failure';
    } else {
      return `Unknown (${code})`;
    }
  }

  parseUnsubscribe(packet, offset, analysis) {
    if (packet.length < offset + 2) {
      analysis.error = 'UNSUBSCRIBE packet too short';
      return;
    }

    const packetId = packet.readUInt16BE(offset);
    offset += 2;

    analysis.unsubscribe = {
      packetId: packetId,
      topics: []
    };

    // Parse topic filters
    while (offset < packet.length) {
      if (packet.length < offset + 2) break;

      const topicLength = packet.readUInt16BE(offset);
      if (packet.length < offset + 2 + topicLength) break;

      const topicFilter = packet.subarray(offset + 2, offset + 2 + topicLength).toString('utf8');
      analysis.unsubscribe.topics.push(topicFilter);

      offset += 2 + topicLength;
    }
  }

  parseUnsuback(packet, offset, analysis) {
    if (packet.length < offset + 2) {
      analysis.error = 'UNSUBACK packet too short';
      return;
    }

    const packetId = packet.readUInt16BE(offset);

    analysis.unsuback = {
      packetId: packetId
    };
  }
}

export default MQTTAnalyzer;