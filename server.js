// EXE Builder - HTTP API for compiling C++ code
// Accepts C++ source code and returns downloadable executables

import express from 'express'
import cors from 'cors'
import fs from 'fs'
import { exec } from 'child_process'
import path from 'path'

const app = express()

// Enable CORS for all origins
app.use(cors())
// Parse JSON request bodies
app.use(express.json())

// Configuration
const BUILD_DIR = './build'
const OUTPUT_EXE = 'output.exe'
const PORT = process.env.PORT || 3000

// Create build directory if it doesn't exist
if (!fs.existsSync(BUILD_DIR)) fs.mkdirSync(BUILD_DIR)

// POST /sse - Compile C++ code endpoint
app.post('/sse', (req, res) => {
  // Extract source code from request body
  const code = req.body.inputs?.source
  if (!code) return res.status(400).json({ error: 'Brak kodu źródłowego' })

  // Create temporary source file
  const srcPath = path.join(BUILD_DIR, 'main.cpp')
  const outPath = path.join(BUILD_DIR, OUTPUT_EXE)
  fs.writeFileSync(srcPath, code)

  // Compile with g++
  exec(`g++ ${srcPath} -o ${outPath}`, (err, stdout, stderr) => {
    if (err) {
      // Return compilation errors
      return res.json({ outputs: { error: stderr } })
    }
    // Return download URL for successful compilation
    return res.json({
      outputs: { download: `${req.protocol}://${req.get('host')}/${OUTPUT_EXE}` }
    })
  })
})

// Serve the compiled executable as static file
app.use(`/${OUTPUT_EXE}`, express.static(path.join(BUILD_DIR, OUTPUT_EXE)))

// Start the server
app.listen(PORT, () => console.log(`EXE Builder server running on port ${PORT}`))
