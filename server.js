import express from 'express'
import cors from 'cors'
import fs from 'fs'
import { exec } from 'child_process'
import path from 'path'
import { randomUUID } from 'crypto'

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' })) // Add size limit for request body

const BUILD_DIR = './build'
if (!fs.existsSync(BUILD_DIR)) fs.mkdirSync(BUILD_DIR, { recursive: true })

// Constants for input validation
const MAX_SOURCE_LENGTH = 100000 // 100KB max source code
const COMPILATION_TIMEOUT = 30000 // 30 seconds timeout

// Cleanup function for temporary files
function cleanupTempFiles(srcPath, outPath) {
  try {
    if (fs.existsSync(srcPath)) fs.unlinkSync(srcPath)
    if (fs.existsSync(outPath)) fs.unlinkSync(outPath)
  } catch (error) {
    console.error('Error cleaning up temp files:', error.message)
  }
}

// Input validation function
function validateSourceCode(source) {
  if (!source || typeof source !== 'string') {
    return { valid: false, error: 'Missing or invalid source code' }
  }
  
  if (source.length === 0) {
    return { valid: false, error: 'Source code cannot be empty' }
  }
  
  if (source.length > MAX_SOURCE_LENGTH) {
    return { valid: false, error: `Source code too large. Maximum ${MAX_SOURCE_LENGTH} characters allowed` }
  }
  
  // Basic sanitization - check for suspicious patterns
  const dangerousPatterns = [
    /system\s*\(/,
    /exec[vl]?\s*\(/,
    /popen\s*\(/,
    /#include\s*<unistd\.h>/,
    /#include\s*<sys\/stat\.h>/
  ]
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(source)) {
      return { valid: false, error: 'Source code contains potentially dangerous system calls' }
    }
  }
  
  return { valid: true }
}

app.post('/sse', (req, res) => {
  const source = req.body.inputs?.source
  
  // Validate input
  const validation = validateSourceCode(source)
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error })
  }

  // Generate unique filenames to prevent race conditions
  const requestId = randomUUID()
  const srcPath = path.join(BUILD_DIR, `main_${requestId}.cpp`)
  const outPath = path.join(BUILD_DIR, `output_${requestId}.exe`)
  
  try {
    // Write source code to file
    fs.writeFileSync(srcPath, source, 'utf8')
  } catch (writeError) {
    return res.status(500).json({ error: 'Failed to write source file' })
  }

  // Set up compilation timeout
  const timer = setTimeout(() => {
    cleanupTempFiles(srcPath, outPath)
    return res.status(408).json({ error: 'Compilation timeout - process took too long' })
  }, COMPILATION_TIMEOUT)

  exec(`g++ "${srcPath}" -o "${outPath}"`, (err, stdout, stderr) => {
    clearTimeout(timer) // Clear the timeout
    
    if (err) {
      cleanupTempFiles(srcPath, outPath)
      return res.json({ error: stderr || 'Compilation failed' })
    }
    
    // Check if output file was created
    if (!fs.existsSync(outPath)) {
      cleanupTempFiles(srcPath, outPath)
      return res.json({ error: 'Compilation completed but no executable was generated' })
    }
    
    // Return download link - file will be cleaned up after download or timeout
    const downloadUrl = `${req.protocol}://${req.get('host')}/download/${requestId}`
    
    // Schedule cleanup after 10 minutes
    setTimeout(() => {
      cleanupTempFiles(srcPath, outPath)
    }, 10 * 60 * 1000)
    
    return res.json({ downloadUrl })
  })
})

// Download endpoint for generated executables
app.get('/download/:requestId', (req, res) => {
  const { requestId } = req.params
  
  // Validate requestId format (should be a UUID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(requestId)) {
    return res.status(400).json({ error: 'Invalid request ID' })
  }
  
  const outPath = path.join(BUILD_DIR, `output_${requestId}.exe`)
  
  // Check if file exists
  if (!fs.existsSync(outPath)) {
    return res.status(404).json({ error: 'File not found or has expired' })
  }
  
  // Send the file and clean up after download
  res.download(outPath, 'program.exe', (err) => {
    if (err) {
      console.error('Download error:', err)
      return res.status(500).json({ error: 'Download failed' })
    }
    // Clean up files after successful download
    const srcPath = path.join(BUILD_DIR, `main_${requestId}.cpp`)
    cleanupTempFiles(srcPath, outPath)
  })
})

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  next()
})

app.listen(3000, () => console.log('MCP server online'))
