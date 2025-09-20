# EXE Builder

A lightweight HTTP API service that compiles C++ source code and provides downloadable executables. Built with Node.js and Express.

## 🎯 What it does

EXE Builder accepts C++ source code via HTTP requests, compiles it using the GCC compiler, and returns a download URL for the compiled executable. Perfect for:

- Online coding platforms and playgrounds
- Educational tools for C++ learning
- Quick prototyping and testing
- CI/CD pipelines requiring on-demand compilation

## 🚀 Quick Start

### Local Development

1. **Prerequisites**
   - Node.js (v14 or higher)
   - GCC compiler installed (`g++` available in PATH)

2. **Installation**
   ```bash
   git clone https://github.com/parrotdiscolte-ops/exe-builder.git
   cd exe-builder
   npm install
   ```

3. **Start the server**
   ```bash
   node server.js
   ```
   
   The server will start on `http://localhost:3000`

### Using Docker

1. **Build the Docker image**
   ```bash
   docker build -f Dockerfile.txt -t exe-builder .
   ```

2. **Run the container**
   ```bash
   docker run -p 3000:3000 exe-builder
   ```

## 📡 API Reference

### Compile C++ Code

**Endpoint:** `POST /sse`

**Request Body:**
```json
{
  "inputs": {
    "source": "your-cpp-source-code-here"
  }
}
```

**Successful Response:**
```json
{
  "outputs": {
    "download": "http://localhost:3000/output.exe"
  }
}
```

**Error Response:**
```json
{
  "outputs": {
    "error": "compilation-error-message-here"
  }
}
```

### Download Executable

**Endpoint:** `GET /output.exe`

Returns the compiled executable file as a binary download.

## 💡 Usage Examples

### Example 1: Hello World

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "inputs": {
      "source": "#include <iostream>\nint main() {\n    std::cout << \"Hello, World!\" << std::endl;\n    return 0;\n}"
    }
  }'
```

**Response:**
```json
{
  "outputs": {
    "download": "http://localhost:3000/output.exe"
  }
}
```

### Example 2: Simple Calculator

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "inputs": {
      "source": "#include <iostream>\n#include <cmath>\nint main() {\n    double a = 10.5, b = 2.5;\n    std::cout << \"Sum: \" << a + b << std::endl;\n    std::cout << \"Product: \" << a * b << std::endl;\n    std::cout << \"Square root of a: \" << sqrt(a) << std::endl;\n    return 0;\n}"
    }
  }'
```

### Example 3: Handling Compilation Errors

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "inputs": {
      "source": "#include <iostream>\nint main() {\n    std::cout << \"Missing semicolon\"\n    return 0;\n}"
    }
  }'
```

**Error Response:**
```json
{
  "outputs": {
    "error": "main.cpp:3:5: error: expected ';' before 'return'"
  }
}
```

### Example 4: Download the Executable

```bash
# After successful compilation, download the executable
curl -O http://localhost:3000/output.exe

# On Linux/Mac, make it executable and run
chmod +x output.exe
./output.exe
```

## 🔧 Configuration

The service uses the following default settings:

- **Port:** 3000
- **Build Directory:** `./build`
- **Output Filename:** `output.exe`
- **Compiler:** `g++` (with default flags)

These are currently hardcoded but can be modified in `server.js` if needed.

## 📁 Project Structure

```
exe-builder/
├── server.js          # Main application server
├── package.json       # Node.js dependencies and metadata
├── Dockerfile.txt     # Docker configuration
├── .gitignore        # Git ignore rules
├── README.md         # This documentation
└── build/            # Generated directory for compilation artifacts
    ├── main.cpp      # Temporary source file
    └── output.exe    # Compiled executable
```

## ⚠️ Security Considerations

**⚠️ WARNING: This service compiles and executes arbitrary code. Use with extreme caution!**

- This service should **NEVER** be exposed to the public internet without proper security measures
- Consider running in isolated containers or sandboxed environments
- Implement authentication and rate limiting for production use
- The service doesn't validate or sanitize input code
- Compiled executables could potentially contain malicious code

**Recommended security measures:**
- Use Docker containers with limited resources
- Implement network isolation
- Add authentication and authorization
- Set up request rate limiting
- Monitor resource usage
- Use read-only file systems where possible

## 🚧 Limitations

- Only supports C++ compilation (via g++)
- Single-file programs only (no multi-file projects)
- No custom compiler flags or options
- Executables are overwritten on each compilation
- No persistent storage or user sessions
- Limited error handling and validation

## 🤝 Contributing

Contributions are welcome! Areas for improvement:

1. **Enhanced Security**: Sandboxing, input validation, resource limits
2. **Multi-language Support**: Support for C, Rust, Go, etc.
3. **Advanced Features**: Custom compiler flags, multi-file projects
4. **Better Error Handling**: More descriptive error messages
5. **Configuration**: Environment-based configuration
6. **Testing**: Unit and integration tests
7. **Documentation**: API documentation, deployment guides

## 📄 License

This project is open source. Please check the repository for license details.

## 🐛 Issues and Support

If you encounter any issues or have feature requests, please open an issue on the [GitHub repository](https://github.com/parrotdiscolte-ops/exe-builder/issues).