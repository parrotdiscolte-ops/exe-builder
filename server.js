import express from 'express'
import cors from 'cors'
import fs from 'fs'
import { exec } from 'child_process'
import path from 'path'
import { WebSocketServer } from 'ws'
import { createServer } from 'http'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const server = createServer(app)
const wss = new WebSocketServer({ server })

app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

const BUILD_DIR = './build'
const OUTPUT_EXE = 'output.exe'
if (!fs.existsSync(BUILD_DIR)) fs.mkdirSync(BUILD_DIR)

// NetworkAnalyzer state management
class NetworkAnalyzer {
  constructor() {
    this.captureProcess = null
    this.proxyProcess = null
    this.enabledAnalyzers = new Set()
    this.customProtocols = []
    this.clients = new Set()
  }

  addClient(ws) {
    this.clients.add(ws)
  }

  removeClient(ws) {
    this.clients.delete(ws)
  }

  broadcast(data) {
    this.clients.forEach(client => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(JSON.stringify(data))
      }
    })
  }

  startCapture(interface_, filter = '') {
    if (this.captureProcess) {
      throw new Error('Capture already in progress')
    }

    // Simulate packet capture with mock data for demonstration
    this.captureProcess = setInterval(() => {
      const mockPacket = {
        timestamp: Date.now(),
        protocol: ['TCP', 'UDP', 'HTTP', 'HTTPS', 'DNS'][Math.floor(Math.random() * 5)],
        src: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
        dst: `10.0.0.${Math.floor(Math.random() * 254) + 1}`,
        size: Math.floor(Math.random() * 1500) + 64,
        payload: 'Mock packet data...'
      }
      
      this.broadcast({ type: 'packet', packet: mockPacket })
      
      // Simulate protocol analysis
      this.analyzePacket(mockPacket)
    }, 1000 + Math.random() * 2000) // Random intervals between 1-3 seconds

    return true
  }

  stopCapture() {
    if (this.captureProcess) {
      clearInterval(this.captureProcess)
      this.captureProcess = null
      return true
    }
    return false
  }

  analyzePacket(packet) {
    // TLS Analysis
    if (this.enabledAnalyzers.has('tls') && packet.protocol === 'HTTPS') {
      const tlsAnalysis = {
        server: packet.dst,
        version: 'TLS 1.3',
        cipherSuite: 'TLS_AES_256_GCM_SHA384',
        certificateCN: `*.example.com`
      }
      this.broadcast({ type: 'tls-analysis', analysis: tlsAnalysis })
    }

    // MQTT Analysis
    if (this.enabledAnalyzers.has('mqtt') && packet.protocol === 'TCP' && Math.random() > 0.8) {
      const mqttAnalysis = {
        messageType: ['PUBLISH', 'SUBSCRIBE', 'CONNECT'][Math.floor(Math.random() * 3)],
        topic: '/sensors/temperature',
        qos: Math.floor(Math.random() * 3),
        payloadSize: packet.size
      }
      this.broadcast({ type: 'mqtt-analysis', analysis: mqttAnalysis })
    }
  }

  enableAnalyzer(type) {
    this.enabledAnalyzers.add(type)
    return true
  }

  startProxy(port, upstreamProxy = '') {
    if (this.proxyProcess) {
      throw new Error('Proxy already running')
    }

    // Simulate proxy with mock logs
    this.proxyProcess = setInterval(() => {
      const mockLogs = [
        `GET https://example.com/ - 200 OK`,
        `POST https://api.example.com/data - 201 Created`,
        `GET https://cdn.example.com/image.jpg - 304 Not Modified`,
        `WebSocket connection established to ws://localhost:8080`
      ]
      
      const logEntry = mockLogs[Math.floor(Math.random() * mockLogs.length)]
      this.broadcast({ type: 'proxy-log', log: logEntry })
    }, 2000 + Math.random() * 3000) // Random intervals

    return true
  }

  stopProxy() {
    if (this.proxyProcess) {
      clearInterval(this.proxyProcess)
      this.proxyProcess = null
      return true
    }
    return false
  }

  addCustomProtocol(protocol) {
    this.customProtocols.push({
      id: Date.now(),
      ...protocol,
      created: new Date()
    })
    return true
  }
}

const networkAnalyzer = new NetworkAnalyzer()

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('WebSocket client connected')
  networkAnalyzer.addClient(ws)
  
  ws.on('close', () => {
    console.log('WebSocket client disconnected')
    networkAnalyzer.removeClient(ws)
  })
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error)
  })
})

// API Routes for NetworkAnalyzer
app.post('/api/capture/start', (req, res) => {
  try {
    const { interface: interface_, filter } = req.body
    const success = networkAnalyzer.startCapture(interface_, filter)
    res.json({ success, message: 'Capture started successfully' })
  } catch (error) {
    res.json({ success: false, error: error.message })
  }
})

app.post('/api/capture/stop', (req, res) => {
  try {
    const success = networkAnalyzer.stopCapture()
    res.json({ success, message: success ? 'Capture stopped' : 'No active capture' })
  } catch (error) {
    res.json({ success: false, error: error.message })
  }
})

app.post('/api/analyzers/enable', (req, res) => {
  try {
    const { analyzer } = req.body
    const success = networkAnalyzer.enableAnalyzer(analyzer)
    res.json({ success, message: `${analyzer} analyzer enabled` })
  } catch (error) {
    res.json({ success: false, error: error.message })
  }
})

app.post('/api/proxy/start', (req, res) => {
  try {
    const { port, upstreamProxy } = req.body
    const success = networkAnalyzer.startProxy(port, upstreamProxy)
    res.json({ success, message: `Proxy started on port ${port}` })
  } catch (error) {
    res.json({ success: false, error: error.message })
  }
})

app.post('/api/proxy/stop', (req, res) => {
  try {
    const success = networkAnalyzer.stopProxy()
    res.json({ success, message: success ? 'Proxy stopped' : 'No active proxy' })
  } catch (error) {
    res.json({ success: false, error: error.message })
  }
})

app.post('/api/protocols/custom', (req, res) => {
  try {
    const success = networkAnalyzer.addCustomProtocol(req.body)
    res.json({ success, message: 'Custom protocol analyzer created' })
  } catch (error) {
    res.json({ success: false, error: error.message })
  }
})

app.get('/api/protocols/custom', (req, res) => {
  res.json({ protocols: networkAnalyzer.customProtocols })
})

// Original exe-builder functionality
app.post('/sse', (req, res) => {
  const code = req.body.inputs?.source
  if (!code) return res.status(400).json({ error: 'Brak kodu źródłowego' })

  const srcPath = path.join(BUILD_DIR, 'main.cpp')
  const outPath = path.join(BUILD_DIR, OUTPUT_EXE)
  fs.writeFileSync(srcPath, code)

  exec(`g++ ${srcPath} -o ${outPath}`, (err, stdout, stderr) => {
    if (err) return res.json({ outputs: { error: stderr } })
    return res.json({
      outputs: { download: `${req.protocol}://${req.get('host')}/${OUTPUT_EXE}` }
    })
  })
})

app.use(`/${OUTPUT_EXE}`, express.static(path.join(BUILD_DIR, OUTPUT_EXE)))

// Serve the main NetworkAnalyzer interface as default
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

server.listen(3000, () => {
  console.log('🌐 NetworkAnalyzer server online at http://localhost:3000')
  console.log('📊 Features: Packet Capture | Protocol Analysis | HTTP Proxy | C++ Builder')
})
