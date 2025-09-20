# C++ Exe Builder

A simple web service that compiles C++ source code and provides downloadable executables.

## Features

- **C++ Compilation**: Compiles C++ source code using g++ compiler
- **Unique File Handling**: Prevents race conditions with unique filenames for concurrent requests
- **Automatic Cleanup**: Removes old files automatically to prevent disk space issues
- **Error Handling**: Proper error handling for compilation failures and file operations
- **Secure Downloads**: Protected download endpoint with filename validation

## API Endpoints

### POST `/compile`

Compiles C++ source code and returns a download link.

**Request:**
```json
{
  "inputs": {
    "source": "#include <iostream>\nint main() {\n    std::cout << \"Hello World!\" << std::endl;\n    return 0;\n}"
  }
}
```

**Success Response:**
```json
{
  "outputs": {
    "download": "http://localhost:3000/download/output-1234567890-abcd1234.exe"
  }
}
```

**Error Response:**
```json
{
  "outputs": {
    "error": "compilation error details here"
  }
}
```

### GET `/download/:filename`

Downloads a compiled executable file.

**Response:** Binary executable file or 404 error if file not found.

## Running the Server

### Development
```bash
npm install
node server.js
```

### Docker
```bash
docker build -t cpp-exe-builder .
docker run -p 3000:3000 cpp-exe-builder
```

## File Management

- Generated files are stored in the `build/` directory
- Source files are automatically cleaned up after compilation
- Executable files older than 30 minutes are automatically removed
- Cleanup runs on startup and every 15 minutes

## Security Notes

- Only allows downloading files with the expected naming pattern
- Prevents directory traversal attacks
- No arbitrary file access outside the build directory
- Source code is compiled in an isolated environment

## Changes from Original

This version includes several improvements over the original:

1. **Renamed endpoint** from `/sse` to `/compile` for better clarity
2. **Unique file naming** to prevent race conditions between concurrent requests
3. **Automatic cleanup** of old files to prevent disk space issues
4. **Enhanced error handling** for file operations and compilation failures
5. **Secure download system** with filename validation
6. **Improved logging** and status messages
7. **Better code organization** and documentation