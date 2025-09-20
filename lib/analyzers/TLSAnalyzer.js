import ProtocolAnalyzer from '../ProtocolAnalyzer.js';

/**
 * TLS/SSL Protocol Analyzer
 * Analyzes TLS handshakes, certificates, and encrypted traffic
 */
class TLSAnalyzer extends ProtocolAnalyzer {
  constructor() {
    super('TLS');
  }

  getProtocolInfo() {
    return {
      name: 'TLS/SSL',
      description: 'Transport Layer Security protocol analyzer',
      supportedPorts: [443, 993, 995, 465]
    };
  }

  canAnalyze(packet, metadata) {
    // Check for TLS on common ports or by packet signature
    if (metadata.port && this.getProtocolInfo().supportedPorts.includes(metadata.port)) {
      return true;
    }
    
    // Check for TLS handshake signature
    if (packet.length >= 5) {
      const contentType = packet[0];
      const version = packet.readUInt16BE(1);
      
      // TLS Record header: Content Type (1 byte) + Version (2 bytes)
      // Content Type: 22 = Handshake, 23 = Application Data, 21 = Alert, 20 = Change Cipher Spec
      const validContentTypes = [20, 21, 22, 23];
      // TLS versions: 0x0301 (TLS 1.0), 0x0302 (TLS 1.1), 0x0303 (TLS 1.2), 0x0304 (TLS 1.3)
      const validVersions = [0x0301, 0x0302, 0x0303, 0x0304];
      
      return validContentTypes.includes(contentType) && validVersions.includes(version);
    }
    
    return false;
  }

  analyze(packet, metadata) {
    const result = {
      protocol: 'TLS',
      timestamp: new Date().toISOString(),
      sourcePort: metadata.sourcePort,
      destinationPort: metadata.destinationPort,
      packetSize: packet.length,
      analysis: {}
    };

    try {
      if (packet.length < 5) {
        result.analysis.error = 'Packet too short for TLS analysis';
        return result;
      }

      const contentType = packet[0];
      const version = packet.readUInt16BE(1);
      const length = packet.readUInt16BE(3);

      result.analysis.contentType = this.getContentTypeName(contentType);
      result.analysis.version = this.getTLSVersionName(version);
      result.analysis.recordLength = length;

      // Analyze handshake messages
      if (contentType === 22 && packet.length >= 6) {
        this.analyzeHandshake(packet.subarray(5), result.analysis);
      }

      // Analyze application data
      if (contentType === 23) {
        result.analysis.encrypted = true;
        result.analysis.applicationDataLength = length;
      }

      // Analyze alerts
      if (contentType === 21 && packet.length >= 7) {
        this.analyzeAlert(packet.subarray(5), result.analysis);
      }

    } catch (error) {
      result.analysis.error = `TLS analysis failed: ${error.message}`;
    }

    return result;
  }

  getContentTypeName(type) {
    const types = {
      20: 'Change Cipher Spec',
      21: 'Alert',
      22: 'Handshake',
      23: 'Application Data'
    };
    return types[type] || `Unknown (${type})`;
  }

  getTLSVersionName(version) {
    const versions = {
      0x0301: 'TLS 1.0',
      0x0302: 'TLS 1.1',
      0x0303: 'TLS 1.2',
      0x0304: 'TLS 1.3'
    };
    return versions[version] || `Unknown (0x${version.toString(16)})`;
  }

  analyzeHandshake(handshakeData, analysis) {
    if (handshakeData.length < 4) return;

    const messageType = handshakeData[0];
    const messageLength = (handshakeData[1] << 16) | (handshakeData[2] << 8) | handshakeData[3];

    analysis.handshake = {
      messageType: this.getHandshakeMessageType(messageType),
      messageLength: messageLength
    };

    // Analyze Client Hello
    if (messageType === 1 && handshakeData.length >= 38) {
      this.analyzeClientHello(handshakeData.subarray(4), analysis.handshake);
    }

    // Analyze Server Hello
    if (messageType === 2 && handshakeData.length >= 38) {
      this.analyzeServerHello(handshakeData.subarray(4), analysis.handshake);
    }

    // Analyze Certificate
    if (messageType === 11) {
      this.analyzeCertificate(handshakeData.subarray(4), analysis.handshake);
    }
  }

  getHandshakeMessageType(type) {
    const types = {
      1: 'Client Hello',
      2: 'Server Hello',
      4: 'New Session Ticket',
      8: 'Encrypted Extensions',
      11: 'Certificate',
      12: 'Server Key Exchange',
      13: 'Certificate Request',
      14: 'Server Hello Done',
      15: 'Certificate Verify',
      16: 'Client Key Exchange',
      20: 'Finished'
    };
    return types[type] || `Unknown (${type})`;
  }

  analyzeClientHello(data, handshakeAnalysis) {
    if (data.length < 34) return;

    const clientVersion = data.readUInt16BE(0);
    const randomStart = 2;
    const sessionIdLength = data[34];

    handshakeAnalysis.clientHello = {
      version: this.getTLSVersionName(clientVersion),
      sessionIdLength: sessionIdLength,
      hasExtensions: data.length > 35 + sessionIdLength
    };

    // Extract cipher suites if available
    if (data.length > 35 + sessionIdLength + 2) {
      const cipherSuitesLength = data.readUInt16BE(35 + sessionIdLength);
      handshakeAnalysis.clientHello.cipherSuitesCount = cipherSuitesLength / 2;
    }
  }

  analyzeServerHello(data, handshakeAnalysis) {
    if (data.length < 34) return;

    const serverVersion = data.readUInt16BE(0);
    const sessionIdLength = data[34];

    handshakeAnalysis.serverHello = {
      version: this.getTLSVersionName(serverVersion),
      sessionIdLength: sessionIdLength
    };

    // Extract selected cipher suite if available
    if (data.length > 35 + sessionIdLength + 2) {
      const cipherSuite = data.readUInt16BE(35 + sessionIdLength);
      handshakeAnalysis.serverHello.selectedCipherSuite = `0x${cipherSuite.toString(16).padStart(4, '0')}`;
    }
  }

  analyzeCertificate(data, handshakeAnalysis) {
    if (data.length < 3) return;

    const certificatesLength = (data[0] << 16) | (data[1] << 8) | data[2];
    handshakeAnalysis.certificate = {
      certificatesLength: certificatesLength,
      hasCertificates: certificatesLength > 0
    };

    // Basic certificate parsing - in a real implementation, you'd use a proper ASN.1 parser
    if (certificatesLength > 3 && data.length > 6) {
      const firstCertLength = (data[3] << 16) | (data[4] << 8) | data[5];
      handshakeAnalysis.certificate.firstCertificateLength = firstCertLength;
    }
  }

  analyzeAlert(alertData, analysis) {
    if (alertData.length < 2) return;

    const alertLevel = alertData[0];
    const alertDescription = alertData[1];

    analysis.alert = {
      level: alertLevel === 1 ? 'Warning' : alertLevel === 2 ? 'Fatal' : `Unknown (${alertLevel})`,
      description: this.getAlertDescription(alertDescription)
    };
  }

  getAlertDescription(code) {
    const descriptions = {
      0: 'Close Notify',
      10: 'Unexpected Message',
      20: 'Bad Record MAC',
      21: 'Decryption Failed',
      22: 'Record Overflow',
      30: 'Decompression Failure',
      40: 'Handshake Failure',
      41: 'No Certificate',
      42: 'Bad Certificate',
      43: 'Unsupported Certificate',
      44: 'Certificate Revoked',
      45: 'Certificate Expired',
      46: 'Certificate Unknown',
      47: 'Illegal Parameter',
      48: 'Unknown CA',
      49: 'Access Denied',
      50: 'Decode Error',
      51: 'Decrypt Error',
      60: 'Export Restriction',
      70: 'Protocol Version',
      71: 'Insufficient Security',
      80: 'Internal Error',
      90: 'User Canceled',
      100: 'No Renegotiation'
    };
    return descriptions[code] || `Unknown (${code})`;
  }
}

export default TLSAnalyzer;