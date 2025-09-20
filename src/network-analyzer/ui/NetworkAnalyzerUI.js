/**
 * NetworkAnalyzer Web Interface
 * Modern, user-friendly interface for network analysis
 */

export class NetworkAnalyzerUI {
  constructor(analyzer, options = {}) {
    this.analyzer = analyzer;
    this.config = {
      theme: options.theme || 'dark',
      refreshInterval: options.refreshInterval || 1000,
      maxDisplayPackets: options.maxDisplayPackets || 100,
      enableRealTimeUpdates: options.enableRealTimeUpdates !== false,
      ...options
    };

    this.components = {
      dashboard: null,
      capture: null,
      proxy: null,
      protocols: null,
      settings: null
    };

    this.state = {
      currentView: 'dashboard',
      realTimeEnabled: true,
      filters: {},
      selectedPackets: new Set(),
      notifications: []
    };

    this._initializeEventListeners();
  }

  /**
   * Initialize the UI
   */
  async initialize() {
    try {
      // Create main UI structure
      this._createMainLayout();
      this._createNavigationMenu();
      this._createDashboard();
      this._createCaptureInterface();
      this._createProxyInterface();
      this._createProtocolAnalysis();
      this._createSettingsPanel();

      // Set up real-time updates
      if (this.config.enableRealTimeUpdates) {
        this._startRealTimeUpdates();
      }

      // Show initial view
      this.showView('dashboard');

      return {
        success: true,
        message: 'NetworkAnalyzer UI initialized successfully'
      };

    } catch (error) {
      console.error('Failed to initialize UI:', error);
      throw new Error(`UI initialization failed: ${error.message}`);
    }
  }

  /**
   * Show specific view
   */
  showView(viewName) {
    // Hide all views
    Object.keys(this.components).forEach(view => {
      const element = document.getElementById(`${view}-view`);
      if (element) {
        element.style.display = 'none';
      }
    });

    // Show selected view
    const selectedView = document.getElementById(`${viewName}-view`);
    if (selectedView) {
      selectedView.style.display = 'block';
      this.state.currentView = viewName;
      this._updateActiveNavItem(viewName);
      this._refreshCurrentView();
    }
  }

  /**
   * Update dashboard with latest data
   */
  updateDashboard() {
    const stats = this.analyzer.getStats();
    
    // Update statistics cards
    this._updateStatCard('total-packets', stats.totalPackets);
    this._updateStatCard('buffer-size', stats.bufferSize);
    this._updateStatCard('uptime', this._formatUptime(stats.uptime));
    this._updateStatCard('capture-status', stats.isCapturing ? 'Active' : 'Inactive');

    // Update protocol distribution chart
    this._updateProtocolChart(stats.protocolCounts);

    // Update recent activity
    this._updateRecentActivity();
  }

  /**
   * Create main layout structure
   */
  _createMainLayout() {
    const html = `
      <div id="network-analyzer-ui" class="na-container">
        <header class="na-header">
          <h1 class="na-title">
            <i class="na-icon">📡</i>
            NetworkAnalyzer
          </h1>
          <div class="na-status-indicators">
            <span id="capture-indicator" class="na-indicator">
              <span class="na-dot"></span> Capture: Idle
            </span>
            <span id="proxy-indicator" class="na-indicator">
              <span class="na-dot"></span> Proxy: Stopped
            </span>
          </div>
        </header>

        <nav class="na-nav" id="main-navigation">
          <!-- Navigation items will be inserted here -->
        </nav>

        <main class="na-main">
          <div id="dashboard-view" class="na-view">
            <!-- Dashboard content -->
          </div>
          <div id="capture-view" class="na-view">
            <!-- Capture interface -->
          </div>
          <div id="proxy-view" class="na-view">
            <!-- Proxy interface -->
          </div>
          <div id="protocols-view" class="na-view">
            <!-- Protocol analysis -->
          </div>
          <div id="settings-view" class="na-view">
            <!-- Settings panel -->
          </div>
        </main>

        <div id="notifications" class="na-notifications">
          <!-- Notifications will be inserted here -->
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
    this._applyStyles();
  }

  /**
   * Create navigation menu
   */
  _createNavigationMenu() {
    const navigation = document.getElementById('main-navigation');
    const navItems = [
      { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'capture', label: 'Capture', icon: '🎯' },
      { id: 'proxy', label: 'Proxy', icon: '🔄' },
      { id: 'protocols', label: 'Protocols', icon: '🔍' },
      { id: 'settings', label: 'Settings', icon: '⚙️' }
    ];

    const navHTML = navItems.map(item => `
      <button class="na-nav-item" data-view="${item.id}" onclick="window.networkAnalyzerUI.showView('${item.id}')">
        <span class="na-nav-icon">${item.icon}</span>
        <span class="na-nav-label">${item.label}</span>
      </button>
    `).join('');

    navigation.innerHTML = navHTML;
  }

  /**
   * Create dashboard view
   */
  _createDashboard() {
    const dashboardView = document.getElementById('dashboard-view');
    const html = `
      <div class="na-dashboard">
        <div class="na-stats-grid">
          <div class="na-stat-card">
            <h3>Total Packets</h3>
            <div class="na-stat-value" id="total-packets">0</div>
          </div>
          <div class="na-stat-card">
            <h3>Buffer Size</h3>
            <div class="na-stat-value" id="buffer-size">0</div>
          </div>
          <div class="na-stat-card">
            <h3>Uptime</h3>
            <div class="na-stat-value" id="uptime">00:00:00</div>
          </div>
          <div class="na-stat-card">
            <h3>Status</h3>
            <div class="na-stat-value" id="capture-status">Inactive</div>
          </div>
        </div>

        <div class="na-charts-grid">
          <div class="na-chart-container">
            <h3>Protocol Distribution</h3>
            <canvas id="protocol-chart" width="400" height="200"></canvas>
          </div>
          <div class="na-chart-container">
            <h3>Traffic Timeline</h3>
            <canvas id="timeline-chart" width="400" height="200"></canvas>
          </div>
        </div>

        <div class="na-recent-activity">
          <h3>Recent Activity</h3>
          <div id="activity-log" class="na-activity-log">
            <!-- Activity items will be inserted here -->
          </div>
        </div>

        <div class="na-quick-actions">
          <button class="na-btn na-btn-primary" onclick="window.networkAnalyzerUI.startCapture()">
            Start Capture
          </button>
          <button class="na-btn na-btn-secondary" onclick="window.networkAnalyzerUI.stopCapture()">
            Stop Capture
          </button>
          <button class="na-btn na-btn-secondary" onclick="window.networkAnalyzerUI.clearData()">
            Clear Data
          </button>
        </div>
      </div>
    `;

    dashboardView.innerHTML = html;
  }

  /**
   * Apply CSS styles
   */
  _applyStyles() {
    const styles = `
      <style>
        .na-container {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 0;
          background: #1a1a1a;
          color: #ffffff;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .na-header {
          background: #2d2d2d;
          padding: 1rem 2rem;
          border-bottom: 1px solid #444;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .na-title {
          margin: 0;
          font-size: 1.8rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .na-icon {
          font-size: 2rem;
        }

        .na-status-indicators {
          display: flex;
          gap: 1rem;
        }

        .na-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }

        .na-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #666;
        }

        .na-nav {
          background: #252525;
          padding: 0;
          display: flex;
          border-bottom: 1px solid #444;
        }

        .na-nav-item {
          background: none;
          border: none;
          color: #ccc;
          padding: 1rem 1.5rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }

        .na-nav-item:hover {
          background: #333;
          color: #fff;
        }

        .na-nav-item.active {
          background: #0078d4;
          color: #fff;
        }

        .na-main {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
        }

        .na-view {
          display: none;
        }

        .na-dashboard {
          display: grid;
          gap: 2rem;
        }

        .na-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .na-stat-card {
          background: #2d2d2d;
          padding: 1.5rem;
          border-radius: 8px;
          border: 1px solid #444;
        }

        .na-stat-card h3 {
          margin: 0 0 0.5rem 0;
          color: #ccc;
          font-size: 0.9rem;
          text-transform: uppercase;
        }

        .na-stat-value {
          font-size: 2rem;
          font-weight: bold;
          color: #0078d4;
        }

        .na-btn {
          background: #0078d4;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background 0.2s;
        }

        .na-btn:hover {
          background: #106ebe;
        }

        .na-btn-secondary {
          background: #666;
        }

        .na-btn-secondary:hover {
          background: #777;
        }

        .na-quick-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .na-notifications {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
        }

        .na-notification {
          background: #2d2d2d;
          border: 1px solid #444;
          border-radius: 4px;
          padding: 1rem;
          margin-bottom: 0.5rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
          transition: opacity 0.3s;
        }

        .na-notification.success {
          border-left: 4px solid #28a745;
        }

        .na-notification.error {
          border-left: 4px solid #dc3545;
        }

        .na-notification.info {
          border-left: 4px solid #17a2b8;
        }
      </style>
    `;

    document.head.insertAdjacentHTML('beforeend', styles);
  }

  /**
   * Initialize event listeners
   */
  _initializeEventListeners() {
    // Listen to analyzer events
    this.analyzer.on('packet:captured', (packet) => {
      if (this.state.currentView === 'capture') {
        this._addPacketToTable(packet);
      }
    });

    this.analyzer.on('capture:started', () => {
      this._updateCaptureIndicator(true);
      this._showNotification('Capture started successfully', 'success');
    });

    this.analyzer.on('capture:stopped', () => {
      this._updateCaptureIndicator(false);
      this._showNotification('Capture stopped', 'info');
    });
  }

  /**
   * Start real-time updates
   */
  _startRealTimeUpdates() {
    setInterval(() => {
      if (this.config.enableRealTimeUpdates) {
        this._refreshCurrentView();
      }
    }, this.config.refreshInterval);
  }

  /**
   * Refresh current view data
   */
  _refreshCurrentView() {
    switch (this.state.currentView) {
      case 'dashboard':
        this.updateDashboard();
        break;
    }
  }

  /**
   * Update active navigation item
   */
  _updateActiveNavItem(viewName) {
    document.querySelectorAll('.na-nav-item').forEach(item => {
      item.classList.remove('active');
    });
    
    const activeItem = document.querySelector(`[data-view="${viewName}"]`);
    if (activeItem) {
      activeItem.classList.add('active');
    }
  }

  /**
   * Show notification
   */
  _showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `na-notification ${type}`;
    notification.textContent = message;
    
    document.getElementById('notifications').appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /**
   * Update capture indicator
   */
  _updateCaptureIndicator(isActive) {
    const indicator = document.getElementById('capture-indicator');
    const dot = indicator.querySelector('.na-dot');
    
    if (isActive) {
      dot.style.background = '#28a745';
      indicator.innerHTML = '<span class="na-dot" style="background: #28a745;"></span> Capture: Active';
    } else {
      dot.style.background = '#666';
      indicator.innerHTML = '<span class="na-dot" style="background: #666;"></span> Capture: Idle';
    }
  }

  /**
   * Update statistics card
   */
  _updateStatCard(cardId, value) {
    const card = document.getElementById(cardId);
    if (card) {
      card.textContent = value;
    }
  }

  /**
   * Format uptime
   */
  _formatUptime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Public API methods for UI interactions
  async startCapture() {
    try {
      await this.analyzer.startCapture();
    } catch (error) {
      this._showNotification(`Failed to start capture: ${error.message}`, 'error');
    }
  }

  async stopCapture() {
    try {
      await this.analyzer.stopCapture();
    } catch (error) {
      this._showNotification(`Failed to stop capture: ${error.message}`, 'error');
    }
  }

  clearData() {
    this.analyzer.reset();
    this._showNotification('Data cleared successfully', 'success');
  }
}

// Make UI globally accessible for onclick handlers (browser only)
if (typeof window !== 'undefined') {
  window.NetworkAnalyzerUI = NetworkAnalyzerUI;
}