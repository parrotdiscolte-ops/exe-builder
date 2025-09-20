import express from 'express'
import cors from 'cors'
import fs from 'fs'
import { exec } from 'child_process'
import path from 'path'
import NetworkAnalyzer from './lib/NetworkAnalyzer.js'

const app = express()
app.use(cors())
app.use(express.json())

// Initialize NetworkAnalyzer
const networkAnalyzer = new NetworkAnalyzer()

const BUILD_DIR = './build'
const OUTPUT_EXE = 'output.exe'
if (!fs.existsSync(BUILD_DIR)) fs.mkdirSync(BUILD_DIR)

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

// NetworkAnalyzer API endpoints

// Get available analyzers
app.get('/api/analyzers', (req, res) => {
  try {
    const analyzers = networkAnalyzer.getAnalyzers()
    res.json({ analyzers })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Analyze a single packet
app.post('/api/analyze-packet', (req, res) => {
  try {
    const { packetData, metadata = {} } = req.body
    
    if (!packetData) {
      return res.status(400).json({ error: 'Packet data is required' })
    }

    const result = networkAnalyzer.analyzePacket(packetData, metadata)
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Analyze multiple packets
app.post('/api/analyze-packets', (req, res) => {
  try {
    const { packets } = req.body
    
    if (!Array.isArray(packets)) {
      return res.status(400).json({ error: 'Packets must be an array' })
    }

    const results = networkAnalyzer.analyzePackets(packets)
    res.json(results)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create custom analyzer
app.post('/api/custom-analyzer', (req, res) => {
  try {
    const { config } = req.body
    
    if (!config) {
      return res.status(400).json({ error: 'Analyzer configuration is required' })
    }

    const analyzer = networkAnalyzer.createCustomAnalyzer(config)
    res.json({ 
      success: true, 
      analyzer: {
        name: analyzer.name,
        info: analyzer.getProtocolInfo()
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Export analyzer configuration
app.get('/api/export-config', (req, res) => {
  try {
    const config = networkAnalyzer.exportConfiguration()
    res.json(config)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Test endpoint with sample data
app.get('/api/test', (req, res) => {
  try {
    // Sample TLS Client Hello packet data
    const tlsClientHello = '160301003e0100003a0303' + 
      '52d63925' + // timestamp
      'c7c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8' + // random
      '00' + // session ID length
      '0002' + // cipher suites length
      'c030' + // TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
      '01' + // compression methods length
      '00' // no compression

    // Sample MQTT CONNECT packet data
    const mqttConnect = '101a' + // fixed header
      '0004' + 'MQTT' + // protocol name
      '04' + // protocol level
      'c2' + // connect flags
      '003c' + // keep alive
      '0008' + 'testclient' // client ID

    const testResults = {
      tls: networkAnalyzer.analyzePacket(tlsClientHello, { port: 443 }),
      mqtt: networkAnalyzer.analyzePacket(mqttConnect, { port: 1883 })
    }

    res.json({
      message: 'NetworkAnalyzer test successful',
      sampleAnalyses: testResults,
      availableAnalyzers: networkAnalyzer.getAnalyzers()
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.use(`/${OUTPUT_EXE}`, express.static(path.join(BUILD_DIR, OUTPUT_EXE)))

// Static middleware for serving test HTML
app.use(express.static('public'))

app.listen(3000, () => {
  console.log('MCP server online')
  console.log('NetworkAnalyzer loaded with analyzers:', networkAnalyzer.getAnalyzers().map(a => a.name))
  console.log('API endpoints available:')
  console.log('  GET  /api/analyzers - List available analyzers')  
  console.log('  POST /api/analyze-packet - Analyze single packet')
  console.log('  POST /api/analyze-packets - Analyze multiple packets') 
  console.log('  POST /api/custom-analyzer - Create custom analyzer')
  console.log('  GET  /api/export-config - Export configuration')
  console.log('  GET  /api/test - Test with sample data')
})
