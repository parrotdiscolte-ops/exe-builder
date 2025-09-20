/**
 * ProxyModule - Network proxy functionality
 * Handles HTTP/HTTPS proxy with traffic interception and modification
 */

import EventEmitter from 'events';

export class ProxyModule extends EventEmitter {
  constructor(options = {}) {
    super();
    this.config = {
      port: options.port || 8080,
      httpsPort: options.httpsPort || 8443,
      enableLogging: options.enableLogging !== false,
      interceptRequests: options.interceptRequests || false,
      interceptResponses: options.interceptResponses || false,
      maxBufferSize: options.maxBufferSize || 50 * 1024 * 1024, // 50MB
      timeout: options.timeout || 30000,
      ...options
    };

    this.isRunning = false;
    this.activeConnections = new Map();
    this.interceptedRequests = [];
    this.interceptedResponses = [];
    this.stats = {
      totalRequests: 0,
      totalResponses: 0,
      bytesProxied: 0,
      activeConnections: 0,
      errors: 0,
      startTime: null,
      uptime: 0
    };

    this.requestFilters = new Map();
    this.responseFilters = new Map();
    this.modificationRules = new Map();
  }

  /**
   * Start proxy server
   */
  async startProxy() {
    if (this.isRunning) {
      throw new Error('Proxy is already running');
    }

    try {
      this.isRunning = true;
      this.stats.startTime = new Date();
      this.stats.totalRequests = 0;
      this.stats.totalResponses = 0;
      this.stats.bytesProxied = 0;
      this.stats.errors = 0;

      // Simulate proxy server startup
      await this._initializeProxyServer();

      this.emit('proxy:started', {
        httpPort: this.config.port,
        httpsPort: this.config.httpsPort,
        timestamp: this.stats.startTime.toISOString()
      });

      // Start connection simulation
      this._simulateProxyActivity();

      return {
        success: true,
        message: `Proxy started on ports ${this.config.port} (HTTP) and ${this.config.httpsPort} (HTTPS)`,
        config: this.config
      };

    } catch (error) {
      this.isRunning = false;
      this.emit('proxy:error', { 
        error: error.message, 
        timestamp: new Date().toISOString() 
      });
      throw error;
    }
  }

  /**
   * Stop proxy server
   */
  async stopProxy() {
    if (!this.isRunning) {
      throw new Error('Proxy is not running');
    }

    try {
      this.isRunning = false;
      const endTime = new Date();
      this.stats.uptime = endTime - this.stats.startTime;

      // Close all active connections
      for (const [connectionId, connection] of this.activeConnections) {
        await this._closeConnection(connectionId);
      }

      this.emit('proxy:stopped', {
        uptime: this.stats.uptime,
        totalRequests: this.stats.totalRequests,
        totalResponses: this.stats.totalResponses,
        timestamp: endTime.toISOString()
      });

      return {
        success: true,
        stats: this.getStats()
      };

    } catch (error) {
      this.emit('proxy:error', { 
        error: error.message, 
        timestamp: new Date().toISOString() 
      });
      throw error;
    }
  }

  /**
   * Add request interceptor
   */
  addRequestInterceptor(name, interceptor) {
    if (typeof interceptor !== 'function') {
      throw new Error('Request interceptor must be a function');
    }

    this.requestFilters.set(name, interceptor);
    this.emit('interceptor:added', { 
      type: 'request', 
      name, 
      timestamp: new Date().toISOString() 
    });

    return true;
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(name, interceptor) {
    if (typeof interceptor !== 'function') {
      throw new Error('Response interceptor must be a function');
    }

    this.responseFilters.set(name, interceptor);
    this.emit('interceptor:added', { 
      type: 'response', 
      name, 
      timestamp: new Date().toISOString() 
    });

    return true;
  }

  /**
   * Add request/response modification rule
   */
  addModificationRule(name, rule) {
    if (!rule.match || !rule.action) {
      throw new Error('Modification rule must have match and action properties');
    }

    this.modificationRules.set(name, rule);
    this.emit('rule:added', { 
      name, 
      rule, 
      timestamp: new Date().toISOString() 
    });

    return true;
  }

  /**
   * Remove modification rule
   */
  removeModificationRule(name) {
    const removed = this.modificationRules.delete(name);
    
    if (removed) {
      this.emit('rule:removed', { 
        name, 
        timestamp: new Date().toISOString() 
      });
    }

    return removed;
  }

  /**
   * Get intercepted requests
   */
  getInterceptedRequests(options = {}) {
    const {
      limit = this.interceptedRequests.length,
      offset = 0,
      filterBy = null
    } = options;

    let requests = this.interceptedRequests.slice(offset);

    if (filterBy) {
      requests = requests.filter(request => this._matchesRequestFilter(request, filterBy));
    }

    return {
      requests: requests.slice(0, limit),
      total: this.interceptedRequests.length,
      filtered: requests.length
    };
  }

  /**
   * Get intercepted responses
   */
  getInterceptedResponses(options = {}) {
    const {
      limit = this.interceptedResponses.length,
      offset = 0,
      filterBy = null
    } = options;

    let responses = this.interceptedResponses.slice(offset);

    if (filterBy) {
      responses = responses.filter(response => this._matchesResponseFilter(response, filterBy));
    }

    return {
      responses: responses.slice(0, limit),
      total: this.interceptedResponses.length,
      filtered: responses.length
    };
  }

  /**
   * Modify intercepted request
   */
  modifyRequest(requestId, modifications) {
    const request = this.interceptedRequests.find(r => r.id === requestId);
    if (!request) {
      throw new Error(`Request with ID ${requestId} not found`);
    }

    // Apply modifications
    if (modifications.url) request.url = modifications.url;
    if (modifications.method) request.method = modifications.method;
    if (modifications.headers) Object.assign(request.headers, modifications.headers);
    if (modifications.body) request.body = modifications.body;

    request.modified = true;
    request.modifiedAt = new Date().toISOString();

    this.emit('request:modified', { 
      requestId, 
      modifications, 
      timestamp: request.modifiedAt 
    });

    return request;
  }

  /**
   * Modify intercepted response
   */
  modifyResponse(responseId, modifications) {
    const response = this.interceptedResponses.find(r => r.id === responseId);
    if (!response) {
      throw new Error(`Response with ID ${responseId} not found`);
    }

    // Apply modifications
    if (modifications.statusCode) response.statusCode = modifications.statusCode;
    if (modifications.headers) Object.assign(response.headers, modifications.headers);
    if (modifications.body) response.body = modifications.body;

    response.modified = true;
    response.modifiedAt = new Date().toISOString();

    this.emit('response:modified', { 
      responseId, 
      modifications, 
      timestamp: response.modifiedAt 
    });

    return response;
  }

  /**
   * Get proxy statistics
   */
  getStats() {
    return {
      ...this.stats,
      isRunning: this.isRunning,
      activeConnections: this.activeConnections.size,
      interceptedRequests: this.interceptedRequests.length,
      interceptedResponses: this.interceptedResponses.length,
      requestInterceptors: this.requestFilters.size,
      responseInterceptors: this.responseFilters.size,
      modificationRules: this.modificationRules.size,
      uptime: this.isRunning ? Date.now() - this.stats.startTime : this.stats.uptime
    };
  }

  /**
   * Clear intercepted data
   */
  clearInterceptedData() {
    const requestCount = this.interceptedRequests.length;
    const responseCount = this.interceptedResponses.length;
    
    this.interceptedRequests = [];
    this.interceptedResponses = [];

    this.emit('data:cleared', { 
      requestCount, 
      responseCount, 
      timestamp: new Date().toISOString() 
    });

    return { 
      success: true, 
      clearedRequests: requestCount, 
      clearedResponses: responseCount 
    };
  }

  /**
   * Initialize proxy server (simulated)
   */
  async _initializeProxyServer() {
    // Simulate server setup delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Simulate binding to ports
    console.log(`Proxy server binding to ports ${this.config.port} and ${this.config.httpsPort}`);
  }

  /**
   * Simulate proxy activity
   */
  _simulateProxyActivity() {
    if (!this.isRunning) return;

    // Simulate incoming request
    const request = this._generateRandomRequest();
    this._processRequest(request);

    // Schedule next activity
    const delay = Math.random() * 2000 + 500; // 500-2500ms
    setTimeout(() => this._simulateProxyActivity(), delay);
  }

  /**
   * Generate random HTTP request for simulation
   */
  _generateRandomRequest() {
    const methods = ['GET', 'POST', 'PUT', 'DELETE'];
    const domains = ['api.example.com', 'service.test.org', 'data.company.net'];
    const paths = ['/api/users', '/data/metrics', '/service/status', '/health'];
    
    const request = {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      method: methods[Math.floor(Math.random() * methods.length)],
      url: `https://${domains[Math.floor(Math.random() * domains.length)]}${paths[Math.floor(Math.random() * paths.length)]}`,
      headers: {
        'User-Agent': 'NetworkAnalyzer-Proxy/1.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: Math.random() > 0.5 ? '{"data": "sample"}' : null,
      timestamp: new Date().toISOString(),
      clientIP: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
      modified: false
    };

    return request;
  }

  /**
   * Process incoming request
   */
  _processRequest(request) {
    this.stats.totalRequests++;
    
    // Apply request interceptors
    let modifiedRequest = request;
    for (const [name, interceptor] of this.requestFilters) {
      try {
        modifiedRequest = interceptor(modifiedRequest) || modifiedRequest;
      } catch (error) {
        this.stats.errors++;
        this.emit('interceptor:error', { 
          type: 'request', 
          name, 
          error: error.message 
        });
      }
    }

    // Apply modification rules
    modifiedRequest = this._applyModificationRules(modifiedRequest, 'request');

    // Store intercepted request
    if (this.config.interceptRequests) {
      this.interceptedRequests.push(modifiedRequest);
      
      // Maintain buffer size
      if (this.interceptedRequests.length > 1000) {
        this.interceptedRequests.shift();
      }
    }

    this.emit('request:intercepted', modifiedRequest);

    // Generate corresponding response
    setTimeout(() => {
      const response = this._generateResponseForRequest(modifiedRequest);
      this._processResponse(response, modifiedRequest);
    }, Math.random() * 1000 + 100);
  }

  /**
   * Generate response for request
   */
  _generateResponseForRequest(request) {
    const statusCodes = [200, 201, 400, 401, 404, 500];
    const response = {
      id: `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      requestId: request.id,
      statusCode: statusCodes[Math.floor(Math.random() * statusCodes.length)],
      headers: {
        'Content-Type': 'application/json',
        'Server': 'NetworkAnalyzer-Proxy/1.0',
        'X-Response-Time': `${Math.random() * 1000 + 10}ms`
      },
      body: JSON.stringify({ 
        status: 'success', 
        data: 'response data',
        timestamp: new Date().toISOString()
      }),
      timestamp: new Date().toISOString(),
      size: Math.floor(Math.random() * 5000) + 100,
      modified: false
    };

    return response;
  }

  /**
   * Process response
   */
  _processResponse(response, originalRequest) {
    this.stats.totalResponses++;
    this.stats.bytesProxied += response.size || 0;

    // Apply response interceptors
    let modifiedResponse = response;
    for (const [name, interceptor] of this.responseFilters) {
      try {
        modifiedResponse = interceptor(modifiedResponse, originalRequest) || modifiedResponse;
      } catch (error) {
        this.stats.errors++;
        this.emit('interceptor:error', { 
          type: 'response', 
          name, 
          error: error.message 
        });
      }
    }

    // Apply modification rules
    modifiedResponse = this._applyModificationRules(modifiedResponse, 'response');

    // Store intercepted response
    if (this.config.interceptResponses) {
      this.interceptedResponses.push(modifiedResponse);
      
      // Maintain buffer size
      if (this.interceptedResponses.length > 1000) {
        this.interceptedResponses.shift();
      }
    }

    this.emit('response:intercepted', { response: modifiedResponse, request: originalRequest });
  }

  /**
   * Apply modification rules
   */
  _applyModificationRules(data, type) {
    let modifiedData = { ...data };

    for (const [name, rule] of this.modificationRules) {
      try {
        if (rule.type === type || rule.type === 'both') {
          if (this._matchesRule(modifiedData, rule.match)) {
            modifiedData = rule.action(modifiedData) || modifiedData;
            modifiedData.modified = true;
          }
        }
      } catch (error) {
        this.stats.errors++;
        this.emit('rule:error', { 
          name, 
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    return modifiedData;
  }

  /**
   * Check if data matches rule conditions
   */
  _matchesRule(data, match) {
    if (match.url && !data.url?.includes(match.url)) return false;
    if (match.method && data.method !== match.method) return false;
    if (match.statusCode && data.statusCode !== match.statusCode) return false;
    if (match.header && !data.headers?.[match.header.name]?.includes(match.header.value)) return false;
    
    return true;
  }

  /**
   * Check if request matches filter
   */
  _matchesRequestFilter(request, filter) {
    if (filter.method && request.method !== filter.method) return false;
    if (filter.url && !request.url.includes(filter.url)) return false;
    if (filter.clientIP && request.clientIP !== filter.clientIP) return false;
    
    return true;
  }

  /**
   * Check if response matches filter
   */
  _matchesResponseFilter(response, filter) {
    if (filter.statusCode && response.statusCode !== filter.statusCode) return false;
    if (filter.minSize && response.size < filter.minSize) return false;
    if (filter.maxSize && response.size > filter.maxSize) return false;
    
    return true;
  }

  /**
   * Close connection
   */
  async _closeConnection(connectionId) {
    const connection = this.activeConnections.get(connectionId);
    if (connection) {
      // Simulate connection cleanup
      this.activeConnections.delete(connectionId);
      this.emit('connection:closed', { 
        connectionId, 
        timestamp: new Date().toISOString() 
      });
    }
  }
}

export default ProxyModule;