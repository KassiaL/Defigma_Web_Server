const path = require('path')
const fs = require('fs')
const https = require('https')
const express = require('express')
const multer = require('multer')

let projectPath = process.argv[2]
if (!projectPath) projectPath = process.env.PROJECT_PATH
if (!projectPath) projectPath = process.cwd()
	
if (!projectPath) {
	return
  console.error('project path is not specified')
  process.exit(1)
}

console.log('files will be saved in:', path.resolve(projectPath))

const app = express()
const port = 16830

// Add manual CORS middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
   res.setHeader('Access-Control-Allow-Headers', 'origin,X-Requested-With,Content-Type,Accept,Authorization');
  if(req.method === 'OPTIONS'){
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, PUT, DELETE');
    return res.status(204).send();
}
next()
})

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

app.use(express.json())

// Add health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Add root endpoint for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'Defigma Web Server is running',
    endpoints: {
      health: '/health',
      upload: '/upload'
    }
  })
})

app.post('/upload', upload.array('files'), async (req, res) => {
  try {
    console.log('Upload request received')
    console.log('Files count:', req.files ? req.files.length : 0)
    
    const folder_path = req.body.folder_path
    if (!folder_path) {
      console.log('Error: folder_name is missing')
      return res.status(400).json({ error: 'folder_name is required' })
    }

    const target_directory = path.join(projectPath, folder_path)
    console.log('Target directory:', target_directory)
    
    if (!fs.existsSync(target_directory)) {
      fs.mkdirSync(target_directory, { recursive: true })
      console.log('Created directory:', target_directory)
    }

    let files_to_delete = req.body.files_to_delete
    if (typeof files_to_delete === 'string') {
      try {
        const parsed = JSON.parse(files_to_delete)
        files_to_delete = Array.isArray(parsed) ? parsed : (files_to_delete.includes(',') ? files_to_delete.split(',').map(s => s.trim()).filter(Boolean) : (files_to_delete.trim() !== '' ? [files_to_delete.trim()] : []))
      } catch (e) {
        files_to_delete = files_to_delete.includes(',') ? files_to_delete.split(',').map(s => s.trim()).filter(Boolean) : (files_to_delete.trim() !== '' ? [files_to_delete.trim()] : [])
      }
    } else if (!Array.isArray(files_to_delete)) {
      files_to_delete = []
    }
    if (Array.isArray(files_to_delete)) {
      files_to_delete = files_to_delete.map(x => (typeof x === 'string' ? x : String(x))).map(s => s.trim()).filter(Boolean)
    }
    const has_uploads = req.files && req.files.length > 0
    const has_deletions = Array.isArray(files_to_delete) && files_to_delete.length > 0

    if (!has_uploads && !has_deletions) {
      console.log('Error: nothing to process')
      return res.status(400).json({ error: 'no files uploaded and no files_to_delete provided' })
    }

    const saved_files = []
    if (has_uploads) {
      for (const file of req.files) {
        const file_path = path.join(target_directory, file.originalname)
        fs.writeFileSync(file_path, file.buffer)
        saved_files.push(file.originalname)
      }
    }

    const is_safe_name = name => !name.includes('..') && !name.includes('/') && !name.includes('\\')
    const deleted_files = []
    const failed_deletions = []
    const invalid_filenames = []
    if (has_deletions) {
      for (const name of files_to_delete) {
        if (!is_safe_name(name)) {
          invalid_filenames.push(name)
          continue
        }
        const delete_path = path.join(target_directory, name)
        try {
          if (fs.existsSync(delete_path)) {
            fs.unlinkSync(delete_path)
            deleted_files.push(name)
          } else {
            failed_deletions.push(name)
          }
        } catch (e) {
          failed_deletions.push(name)
        }
      }
    }

    const response_data = { 
      message: 'files processed successfully',
      folder: folder_path,
      files: saved_files,
      count: saved_files.length,
      deleted_files: deleted_files,
      deleted_count: deleted_files.length,
      failed_deletions: failed_deletions,
      invalid_filenames: invalid_filenames
    }
    
    console.log('Upload successful:', response_data)
    res.json(response_data)

  } catch (error) {
    console.error('upload error:', error)
    res.status(500).json({ error: 'failed to upload files', details: error.message })
  }
})

// Bind to all interfaces, not just localhost
app.listen(port, '0.0.0.0', () => {
  console.log(`server listening on all interfaces at port ${port}`)
  console.log(`health check: http://localhost:${port}/health`)
  console.log(`upload endpoint: http://localhost:${port}/upload`)
  console.log('server is ready to accept connections')
})
