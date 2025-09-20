// NetworkAnalyzer Frontend JavaScript

class NetworkAnalyzer {
    constructor() {
        this.captureActive = false;
        this.proxyActive = false;
        this.captureStartTime = null;
        this.packetCount = 0;
        this.byteCount = 0;
        this.captureInterval = null;
        this.enabledAnalyzers = new Set();
        this.websocket = null;
        
        this.initializeWebSocket();
        this.setupEventListeners();
    }

    initializeWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        
        this.websocket = new WebSocket(wsUrl);
        
        this.websocket.onopen = () => {
            console.log('WebSocket connected');
        };
        
        this.websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleWebSocketMessage(data);
        };
        
        this.websocket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
        
        this.websocket.onclose = () => {
            console.log('WebSocket disconnected');
            setTimeout(() => this.initializeWebSocket(), 5000); // Reconnect after 5 seconds
        };
    }

    setupEventListeners() {
        // Custom protocol form
        const customForm = document.getElementById('custom-protocol-form');
        if (customForm) {
            customForm.addEventListener('submit', (e) => this.handleCustomProtocolSubmit(e));
        }
    }

    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'packet':
                this.displayPacket(data.packet);
                break;
            case 'tls-analysis':
                this.displayTLSAnalysis(data.analysis);
                break;
            case 'mqtt-analysis':
                this.displayMQTTAnalysis(data.analysis);
                break;
            case 'proxy-log':
                this.displayProxyLog(data.log);
                break;
            case 'error':
                this.displayError(data.message);
                break;
        }
    }

    displayPacket(packet) {
        this.packetCount++;
        this.byteCount += packet.size || 0;
        
        document.getElementById('packet-count').textContent = this.packetCount;
        document.getElementById('byte-count').textContent = this.formatBytes(this.byteCount);
        
        const packetList = document.getElementById('packet-list');
        const packetElement = document.createElement('div');
        packetElement.className = 'packet-entry';
        packetElement.innerHTML = `
            <div class="packet-header">
                <span class="packet-time">${new Date(packet.timestamp).toLocaleTimeString()}</span>
                <span class="packet-protocol">${packet.protocol || 'Unknown'}</span>
                <span class="packet-size">${this.formatBytes(packet.size || 0)}</span>
            </div>
            <div class="packet-summary">${packet.src || 'Unknown'} → ${packet.dst || 'Unknown'}</div>
        `;
        
        packetElement.addEventListener('click', () => this.showPacketDetails(packet));
        packetList.appendChild(packetElement);
        
        // Auto-scroll to bottom
        packetList.scrollTop = packetList.scrollHeight;
        
        // Limit displayed packets to prevent memory issues
        if (packetList.children.length > 1000) {
            packetList.removeChild(packetList.firstChild);
        }
    }

    displayTLSAnalysis(analysis) {
        const resultsPanel = document.getElementById('tls-results');
        const analysisElement = document.createElement('div');
        analysisElement.className = 'analysis-entry';
        analysisElement.innerHTML = `
            <div class="analysis-header">
                <strong>TLS Connection: ${analysis.server || 'Unknown'}</strong>
                <span class="analysis-time">${new Date().toLocaleTimeString()}</span>
            </div>
            <div class="analysis-details">
                <p>Version: ${analysis.version || 'Unknown'}</p>
                <p>Cipher Suite: ${analysis.cipherSuite || 'Unknown'}</p>
                <p>Certificate CN: ${analysis.certificateCN || 'Unknown'}</p>
            </div>
        `;
        resultsPanel.appendChild(analysisElement);
        resultsPanel.scrollTop = resultsPanel.scrollHeight;
    }

    displayMQTTAnalysis(analysis) {
        const resultsPanel = document.getElementById('mqtt-results');
        const analysisElement = document.createElement('div');
        analysisElement.className = 'analysis-entry';
        analysisElement.innerHTML = `
            <div class="analysis-header">
                <strong>MQTT ${analysis.messageType || 'Message'}</strong>
                <span class="analysis-time">${new Date().toLocaleTimeString()}</span>
            </div>
            <div class="analysis-details">
                <p>Topic: ${analysis.topic || 'Unknown'}</p>
                <p>QoS: ${analysis.qos !== undefined ? analysis.qos : 'Unknown'}</p>
                <p>Payload Size: ${analysis.payloadSize || 0} bytes</p>
            </div>
        `;
        resultsPanel.appendChild(analysisElement);
        resultsPanel.scrollTop = resultsPanel.scrollHeight;
    }

    displayProxyLog(logEntry) {
        const proxyLog = document.getElementById('proxy-log');
        const logElement = document.createElement('div');
        logElement.className = 'log-entry';
        logElement.textContent = `[${new Date().toLocaleTimeString()}] ${logEntry}`;
        proxyLog.appendChild(logElement);
        proxyLog.scrollTop = proxyLog.scrollHeight;
        
        // Limit log entries
        if (proxyLog.children.length > 500) {
            proxyLog.removeChild(proxyLog.firstChild);
        }
    }

    displayError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 6px;
            border: 2px solid #f5c6cb;
            z-index: 1000;
            max-width: 400px;
        `;
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    showPacketDetails(packet) {
        alert(`Packet Details:\n\nTimestamp: ${new Date(packet.timestamp).toLocaleString()}\nProtocol: ${packet.protocol || 'Unknown'}\nSource: ${packet.src || 'Unknown'}\nDestination: ${packet.dst || 'Unknown'}\nSize: ${this.formatBytes(packet.size || 0)}\n\nPayload: ${packet.payload || 'No payload data'}`);
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    updateCaptureDuration() {
        if (this.captureStartTime) {
            const duration = Math.floor((Date.now() - this.captureStartTime) / 1000);
            const minutes = Math.floor(duration / 60);
            const seconds = duration % 60;
            document.getElementById('capture-duration').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    handleCustomProtocolSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const protocolData = {
            name: formData.get('protocol-name'),
            port: parseInt(formData.get('protocol-port')),
            pattern: formData.get('protocol-pattern')
        };

        fetch('/api/protocols/custom', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(protocolData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.displaySuccess('Custom protocol analyzer created successfully');
                this.hideCustomProtocolDialog();
                event.target.reset();
            } else {
                this.displayError(data.error || 'Failed to create custom protocol analyzer');
            }
        })
        .catch(error => {
            this.displayError('Network error: ' + error.message);
        });
    }

    displaySuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 6px;
            border: 2px solid #c3e6cb;
            z-index: 1000;
            max-width: 400px;
        `;
        successDiv.textContent = message;
        
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 3000);
    }
}

// Global functions for HTML event handlers
let networkAnalyzer;

window.addEventListener('DOMContentLoaded', () => {
    networkAnalyzer = new NetworkAnalyzer();
});

function switchTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Remove active class from all buttons
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(button => button.classList.remove('active'));
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

function startCapture() {
    const interface_ = document.getElementById('interface-select').value;
    const filter = document.getElementById('filter-input').value;
    
    if (!interface_) {
        networkAnalyzer.displayError('Please select a network interface');
        return;
    }
    
    const requestData = { interface: interface_, filter };
    
    fetch('/api/capture/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            networkAnalyzer.captureActive = true;
            networkAnalyzer.captureStartTime = Date.now();
            networkAnalyzer.packetCount = 0;
            networkAnalyzer.byteCount = 0;
            
            document.getElementById('start-capture').disabled = true;
            document.getElementById('stop-capture').disabled = false;
            
            // Start duration timer
            networkAnalyzer.captureInterval = setInterval(() => {
                networkAnalyzer.updateCaptureDuration();
            }, 1000);
            
            networkAnalyzer.displaySuccess('Packet capture started');
        } else {
            networkAnalyzer.displayError(data.error || 'Failed to start capture');
        }
    })
    .catch(error => {
        networkAnalyzer.displayError('Network error: ' + error.message);
    });
}

function stopCapture() {
    fetch('/api/capture/stop', { method: 'POST' })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            networkAnalyzer.captureActive = false;
            networkAnalyzer.captureStartTime = null;
            
            document.getElementById('start-capture').disabled = false;
            document.getElementById('stop-capture').disabled = true;
            
            if (networkAnalyzer.captureInterval) {
                clearInterval(networkAnalyzer.captureInterval);
                networkAnalyzer.captureInterval = null;
            }
            
            networkAnalyzer.displaySuccess('Packet capture stopped');
        } else {
            networkAnalyzer.displayError(data.error || 'Failed to stop capture');
        }
    })
    .catch(error => {
        networkAnalyzer.displayError('Network error: ' + error.message);
    });
}

function enableAnalyzer(type) {
    fetch('/api/analyzers/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analyzer: type })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            networkAnalyzer.enabledAnalyzers.add(type);
            const resultsPanel = document.getElementById(`${type}-results`);
            resultsPanel.classList.add('active');
            resultsPanel.innerHTML = `<p>✅ ${type.toUpperCase()} analyzer enabled and monitoring...</p>`;
            networkAnalyzer.displaySuccess(`${type.toUpperCase()} analyzer enabled`);
        } else {
            networkAnalyzer.displayError(data.error || `Failed to enable ${type} analyzer`);
        }
    })
    .catch(error => {
        networkAnalyzer.displayError('Network error: ' + error.message);
    });
}

function startProxy() {
    const port = parseInt(document.getElementById('proxy-port').value);
    const upstreamProxy = document.getElementById('upstream-proxy').value;
    
    const requestData = { port, upstreamProxy };
    
    fetch('/api/proxy/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            networkAnalyzer.proxyActive = true;
            document.getElementById('start-proxy').disabled = true;
            document.getElementById('stop-proxy').disabled = false;
            networkAnalyzer.displaySuccess(`Proxy started on port ${port}`);
        } else {
            networkAnalyzer.displayError(data.error || 'Failed to start proxy');
        }
    })
    .catch(error => {
        networkAnalyzer.displayError('Network error: ' + error.message);
    });
}

function stopProxy() {
    fetch('/api/proxy/stop', { method: 'POST' })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            networkAnalyzer.proxyActive = false;
            document.getElementById('start-proxy').disabled = false;
            document.getElementById('stop-proxy').disabled = true;
            networkAnalyzer.displaySuccess('Proxy stopped');
        } else {
            networkAnalyzer.displayError(data.error || 'Failed to stop proxy');
        }
    })
    .catch(error => {
        networkAnalyzer.displayError('Network error: ' + error.message);
    });
}

function buildCode() {
    const code = document.getElementById('code-input').value;
    if (!code.trim()) {
        networkAnalyzer.displayError('Please enter some C++ code');
        return;
    }
    
    fetch('/sse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: { source: code } })
    })
    .then(response => response.json())
    .then(data => {
        const resultDiv = document.getElementById('build-result');
        if (data.outputs && data.outputs.download) {
            resultDiv.className = 'build-result success';
            resultDiv.innerHTML = `
                <strong>✅ Build Successful!</strong><br>
                <a href="${data.outputs.download}" download="output.exe">Download Executable</a>
            `;
        } else if (data.outputs && data.outputs.error) {
            resultDiv.className = 'build-result error';
            resultDiv.innerHTML = `
                <strong>❌ Build Failed</strong><br>
                <pre>${data.outputs.error}</pre>
            `;
        }
    })
    .catch(error => {
        const resultDiv = document.getElementById('build-result');
        resultDiv.className = 'build-result error';
        resultDiv.innerHTML = `
            <strong>❌ Network Error</strong><br>
            ${error.message}
        `;
    });
}

function showCustomProtocolDialog() {
    document.getElementById('custom-protocol-dialog').style.display = 'flex';
}

function hideCustomProtocolDialog() {
    document.getElementById('custom-protocol-dialog').style.display = 'none';
}