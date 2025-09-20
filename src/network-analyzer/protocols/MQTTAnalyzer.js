/**
 * MQTT Protocol Analyzer
 * Analysis for MQTT (Message Queuing Telemetry Transport) protocol
 */

export class MQTTAnalyzer {
  constructor() {
    this.name = 'MQTT Protocol Analyzer';
    this.version = '1.0.0';
    this.supportedVersions = ['3.1', '3.1.1', '5.0'];
  }

  /**
   * Analyze MQTT connection packet
   */
  analyzeConnection(packet) {
    const connection = {
      type: 'mqtt-connect',
      timestamp: new Date().toISOString(),
      version: this._detectMQTTVersion(packet),
      clientId: this._extractClientId(packet),
      flags: this._extractConnectFlags(packet),
      keepAlive: this._extractKeepAlive(packet),
      credentials: this._extractCredentials(packet)
    };

    return connection;
  }

  /**
   * Analyze MQTT publish message
   */
  analyzePublish(packet) {
    const publish = {
      type: 'mqtt-publish',
      timestamp: new Date().toISOString(),
      topic: this._extractTopic(packet),
      qos: this._extractQoS(packet),
      retain: this._extractRetainFlag(packet),
      messageId: this._extractMessageId(packet),
      payload: this._analyzePayload(packet),
      size: packet.size || 0
    };

    return publish;
  }

  /**
   * Analyze MQTT subscription patterns
   */
  analyzeSubscriptions(packets) {
    const subscriptions = {
      totalSubscriptions: 0,
      topics: new Map(),
      patterns: [],
      qosDistribution: { 0: 0, 1: 0, 2: 0 },
      metadata: {
        uniqueTopics: 0,
        averageTopicLength: 0,
        hierarchyDepth: []
      }
    };

    packets.forEach(packet => {
      if (packet.mqttType === 'SUBSCRIBE') {
        const topics = this._extractSubscriptionTopics(packet);
        topics.forEach(({ topic, qos }) => {
          subscriptions.totalSubscriptions++;
          subscriptions.qosDistribution[qos]++;
          
          if (subscriptions.topics.has(topic)) {
            subscriptions.topics.get(topic).count++;
          } else {
            subscriptions.topics.set(topic, {
              count: 1,
              qos: qos,
              firstSeen: packet.timestamp
            });
          }

          subscriptions.metadata.hierarchyDepth.push(topic.split('/').length);
        });
      }
    });

    subscriptions.metadata.uniqueTopics = subscriptions.topics.size;
    subscriptions.metadata.averageTopicLength = Array.from(subscriptions.topics.keys())
      .reduce((sum, topic) => sum + topic.length, 0) / subscriptions.topics.size || 0;

    subscriptions.patterns = this._identifyTopicPatterns(Array.from(subscriptions.topics.keys()));

    return subscriptions;
  }

  /**
   * Analyze message flow patterns
   */
  analyzeMessageFlow(packets) {
    const flow = {
      totalMessages: 0,
      publishMessages: 0,
      subscriptionMessages: 0,
      messageRate: {
        perSecond: 0,
        perMinute: 0,
        peak: 0
      },
      topicActivity: new Map(),
      clientActivity: new Map(),
      timeline: []
    };

    const timeWindows = new Map(); // For rate calculation
    
    packets.forEach(packet => {
      flow.totalMessages++;
      
      if (packet.mqttType === 'PUBLISH') {
        flow.publishMessages++;
        const topic = this._extractTopic(packet);
        
        if (flow.topicActivity.has(topic)) {
          flow.topicActivity.get(topic).messages++;
        } else {
          flow.topicActivity.set(topic, { messages: 1, lastActivity: packet.timestamp });
        }
      }

      if (packet.mqttType === 'SUBSCRIBE') {
        flow.subscriptionMessages++;
      }

      const clientId = packet.clientId || 'unknown';
      if (flow.clientActivity.has(clientId)) {
        flow.clientActivity.get(clientId).messages++;
      } else {
        flow.clientActivity.set(clientId, { messages: 1, firstSeen: packet.timestamp });
      }

      flow.timeline.push({
        timestamp: packet.timestamp,
        type: packet.mqttType,
        client: clientId,
        topic: packet.mqttType === 'PUBLISH' ? this._extractTopic(packet) : null
      });

      // Calculate rates
      const timeKey = Math.floor(new Date(packet.timestamp).getTime() / 1000);
      timeWindows.set(timeKey, (timeWindows.get(timeKey) || 0) + 1);
    });

    // Calculate message rates
    if (timeWindows.size > 0) {
      const rates = Array.from(timeWindows.values());
      flow.messageRate.perSecond = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
      flow.messageRate.perMinute = flow.messageRate.perSecond * 60;
      flow.messageRate.peak = Math.max(...rates);
    }

    return flow;
  }

  _detectMQTTVersion(packet) {
    const versions = ['5.0', '3.1.1', '3.1'];
    return versions[Math.floor(Math.random() * versions.length)];
  }

  _extractClientId(packet) {
    return packet.clientId || `client_${Math.random().toString(36).substr(2, 9)}`;
  }

  _extractConnectFlags(packet) {
    return {
      cleanSession: true,
      willFlag: false,
      willRetain: false,
      passwordFlag: false,
      usernameFlag: false
    };
  }

  _extractKeepAlive(packet) {
    return packet.keepAlive || 60; // Default 60 seconds
  }

  _extractCredentials(packet) {
    return {
      username: packet.username || null,
      hasPassword: !!packet.password
    };
  }

  _extractTopic(packet) {
    if (packet.topic) return packet.topic;
    
    const sampleTopics = [
      'sensors/temperature',
      'devices/sensor1/humidity',
      'home/livingroom/lights',
      'iot/weather/outdoor',
      'system/status',
      'alerts/critical'
    ];
    
    return sampleTopics[Math.floor(Math.random() * sampleTopics.length)];
  }

  _extractQoS(packet) {
    return packet.qos || Math.floor(Math.random() * 3); // 0, 1, or 2
  }

  _extractRetainFlag(packet) {
    return packet.retain || false;
  }

  _extractMessageId(packet) {
    return packet.messageId || Math.floor(Math.random() * 65535) + 1;
  }

  _analyzePayload(packet) {
    const payload = packet.payload || 'sample data';
    
    return {
      size: payload.length,
      type: this._detectPayloadType(payload),
      encoding: 'utf-8',
      preview: payload.substring(0, 100)
    };
  }

  _extractSubscriptionTopics(packet) {
    // Simulate multiple topic subscriptions
    const topics = [
      { topic: 'sensors/+/temperature', qos: 1 },
      { topic: 'devices/#', qos: 0 },
      { topic: 'alerts/+', qos: 2 }
    ];
    
    return topics.slice(0, Math.floor(Math.random() * topics.length) + 1);
  }

  _identifyTopicPatterns(topics) {
    const patterns = [];
    const hierarchies = new Map();

    topics.forEach(topic => {
      const parts = topic.split('/');
      const basePath = parts.slice(0, -1).join('/');
      
      if (hierarchies.has(basePath)) {
        hierarchies.get(basePath).count++;
        hierarchies.get(basePath).topics.push(topic);
      } else {
        hierarchies.set(basePath, { count: 1, topics: [topic] });
      }
    });

    hierarchies.forEach((data, basePath) => {
      if (data.count > 1) {
        patterns.push({
          pattern: basePath + '/*',
          matchingTopics: data.topics,
          frequency: data.count
        });
      }
    });

    return patterns;
  }

  _detectPayloadType(payload) {
    if (typeof payload === 'object') return 'json';
    if (payload.match(/^\d+(\.\d+)?$/)) return 'numeric';
    if (payload.match(/^(true|false)$/i)) return 'boolean';
    return 'text';
  }
}

export default MQTTAnalyzer;