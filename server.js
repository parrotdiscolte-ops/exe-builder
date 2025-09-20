import express from 'express'
import cors from 'cors'
import fs from 'fs'
import { exec } from 'child_process'
import path from 'path'
import NetworkAnalyzerManager from './src/network-analyzer/NetworkAnalyzerManager.js'

const app = express()
app.use(cors())
app.use(express.json())

const BUILD_DIR = './build'
const OUTPUT_EXE = 'output.exe'
if (!fs.existsSync(BUILD_DIR)) fs.mkdirSync(BUILD_DIR)

// Initialize NetworkAnalyzer
const networkAnalyzer = new NetworkAnalyzerManager({
  enableUI: true,
  enableCapture: true,
  enableProxy: true,
  captureConfig: {
    interface: 'any',
    bufferSize: 10000
  },
  proxyConfig: {
    port: 8080,
    httpsPort: 8443
  }
})

// Initialize NetworkAnalyzer on server startup
networkAnalyzer.initialize()
  .then(result => {
    console.log('NetworkAnalyzer initialized:', result.message)
  })
  .catch(error => {
    console.error('NetworkAnalyzer initialization failed:', error.message)
  })

// Existing C++ compilation endpoint
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
app.get('/network-analyzer/status', async (req, res) => {
  try {
    const status = networkAnalyzer.getStatus()
    res.json({ success: true, status })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.post('/network-analyzer/start', async (req, res) => {
  try {
    const result = await networkAnalyzer.start()
    res.json(result)
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.post('/network-analyzer/stop', async (req, res) => {
  try {
    const result = await networkAnalyzer.stop()
    res.json(result)
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.get('/network-analyzer/analyze', async (req, res) => {
  try {
    const options = {
      analyzeTLS: req.query.tls !== 'false',
      analyzeMQTT: req.query.mqtt !== 'false',
      captureOptions: {
        limit: parseInt(req.query.limit) || 100
      }
    }
    const analysis = await networkAnalyzer.analyzeTraffic(options)
    res.json({ success: true, analysis })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.get('/network-analyzer/export', async (req, res) => {
  try {
    const format = req.query.format || 'json'
    const includeRawData = req.query.raw === 'true'
    const data = await networkAnalyzer.exportData(format, { includeRawData })
    
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename="network-analysis-${new Date().toISOString().slice(0, 19)}.json"`)
    res.json(data)
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.post('/network-analyzer/reset', (req, res) => {
  try {
    networkAnalyzer.reset()
    res.json({ success: true, message: 'NetworkAnalyzer reset successfully' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Serve NetworkAnalyzer UI
app.get('/network-analyzer', (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NetworkAnalyzer</title>
</head>
<body>
    <script type="module">
        import NetworkAnalyzerManager from './src/network-analyzer/NetworkAnalyzerManager.js';
        
        // Initialize NetworkAnalyzer UI
        const manager = new NetworkAnalyzerManager({
            enableUI: true,
            enableCapture: false, // Server-side capture
            enableProxy: false,   // Server-side proxy
        });
        
        manager.initialize().then(() => {
            console.log('NetworkAnalyzer UI initialized');
            window.networkAnalyzerUI = manager.getUI();
        });
    </script>
</body>
</html>
  `
  res.send(html)
})

// Serve static files for NetworkAnalyzer
app.use('/src', express.static('src'))

app.use(`/${OUTPUT_EXE}`, express.static(path.join(BUILD_DIR, OUTPUT_EXE)))
app.listen(3000, () => {
  console.log('Server online on port 3000')
  console.log('NetworkAnalyzer UI available at: http://localhost:3000/network-analyzer')
})
