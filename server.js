import express from 'express'
import cors from 'cors'
import fs from 'fs'
import { exec } from 'child_process'
import path from 'path'
import crypto from 'crypto'

const app = express()
app.use(cors())
app.use(express.json())

const BUILD_DIR = './build'
if (!fs.existsSync(BUILD_DIR)) fs.mkdirSync(BUILD_DIR, { recursive: true })

// Cleanup old files on startup
function cleanupOldFiles() {
  if (!fs.existsSync(BUILD_DIR)) return
  
  const now = Date.now()
  const files = fs.readdirSync(BUILD_DIR)
  
  files.forEach(file => {
    const filePath = path.join(BUILD_DIR, file)
    const stats = fs.statSync(filePath)
    const ageInMinutes = (now - stats.mtime.getTime()) / (1000 * 60)
    
    // Remove files older than 30 minutes
    if (ageInMinutes > 30) {
      try {
        fs.unlinkSync(filePath)
        console.log(`Cleaned up old file: ${file}`)
      } catch (err) {
        console.warn(`Failed to cleanup file ${file}:`, err.message)
      }
    }
  })
}

// Run cleanup on startup and every 15 minutes
cleanupOldFiles()
setInterval(cleanupOldFiles, 15 * 60 * 1000)

app.post('/compile', (req, res) => {
  const code = req.body.inputs?.source
  if (!code) return res.status(400).json({ error: 'Missing source code' })

  // Generate unique filenames to prevent race conditions
  const timestamp = Date.now()
  const hash = crypto.randomBytes(8).toString('hex')
  const uniqueId = `${timestamp}-${hash}`
  
  const srcFilename = `main-${uniqueId}.cpp`
  const exeFilename = `output-${uniqueId}.exe`
  const srcPath = path.join(BUILD_DIR, srcFilename)
  const outPath = path.join(BUILD_DIR, exeFilename)

  try {
    fs.writeFileSync(srcPath, code)
  } catch (writeErr) {
    return res.status(500).json({ error: 'Failed to write source file' })
  }

  exec(`g++ "${srcPath}" -o "${outPath}"`, (err, stdout, stderr) => {
    // Clean up source file after compilation attempt
    try {
      fs.unlinkSync(srcPath)
    } catch (cleanupErr) {
      console.warn(`Failed to cleanup source file ${srcPath}:`, cleanupErr.message)
    }

    if (err) {
      return res.json({ outputs: { error: stderr } })
    }
    
    // Check if the executable was actually created
    if (!fs.existsSync(outPath)) {
      return res.json({ outputs: { error: 'Compilation failed - no executable generated' } })
    }

    return res.json({
      outputs: { download: `${req.protocol}://${req.get('host')}/download/${exeFilename}` }
    })
  })
})

// Serve compiled executables with proper error handling
app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename
  
  // Basic security check - only allow .exe files with expected pattern
  if (!filename.match(/^output-\d+-[a-f0-9]+\.exe$/)) {
    return res.status(404).json({ error: 'File not found' })
  }
  
  const filePath = path.join(BUILD_DIR, filename)
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' })
  }
  
  res.download(filePath, filename, (err) => {
    if (err) {
      console.warn(`Download error for ${filename}:`, err.message)
    }
  })
})

app.listen(3000, () => console.log('C++ Compilation server online on port 3000'))
