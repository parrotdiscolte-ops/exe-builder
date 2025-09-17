import express from 'express'
import cors from 'cors'
import fs from 'fs'
import { exec } from 'child_process'
import path from 'path'

const app = express()
app.use(cors())
app.use(express.json())

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

app.use(`/${OUTPUT_EXE}`, express.static(path.join(BUILD_DIR, OUTPUT_EXE)))
app.listen(3000, () => console.log('MCP server online'))
