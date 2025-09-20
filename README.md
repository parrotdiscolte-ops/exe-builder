# NetworkAnalyzer - Advanced Network Analysis Tool

NetworkAnalyzer is a comprehensive Windows Forms application designed for network packet analysis, protocol inspection, and various network security testing tasks.

## Features

### 🔍 Core Functionality
- **Packet Capture**: Real-time network packet capturing and analysis
- **DLL Injection**: Inject custom DLLs into running processes
- **MITM Proxy**: Man-in-the-middle proxy server for traffic interception
- **Protocol Analyzer**: Deep packet inspection and protocol analysis
- **Session Management**: Save, load, and manage analysis sessions
- **Server Emulator**: Emulate various network servers for testing
- **Hex Editor**: Built-in hexadecimal editor for packet manipulation

### 🛠 Utility Tools
- **Base64 Encoder/Decoder**: Encode and decode Base64 strings
- **Hash Calculator**: Generate MD5, SHA1, and SHA256 hashes
- **Export/Import**: Save sessions in JSON or HAR format
- **Dark Mode**: Toggle between light and dark themes
- **Full Screen Mode**: Distraction-free analysis environment

## System Requirements

### Prerequisites
- **Operating System**: Windows 7/8/10/11 (64-bit recommended)
- **.NET Framework**: 4.7.2 or higher
- **Administrator Rights**: Required for packet capture and DLL injection
- **Memory**: Minimum 2GB RAM (4GB recommended)
- **Storage**: 100MB free disk space

### Build Requirements (for compilation)
- **Visual Studio 2017+** or **Microsoft Build Tools**
- **.NET Framework 4.7.2+ SDK**
- **NuGet Package Manager**

## Installation

### Option 1: Pre-built Executable
1. Download the latest release from the releases page
2. Extract `NetworkAnalyzer.exe` to your desired location
3. Right-click and select "Run as administrator"

### Option 2: Build from Source
1. Clone this repository:
   ```bash
   git clone https://github.com/parrotdiscolte-ops/exe-builder.git
   cd exe-builder
   ```

2. **Using Batch Script** (Recommended):
   ```cmd
   CompileNetworkAnalyzer.bat
   ```

3. **Using PowerShell Script**:
   ```powershell
   .\CreateNetworkAnalyzerProject.ps1 -Build
   ```

4. **Manual Build with MSBuild**:
   ```cmd
   cd NetworkAnalyzer
   msbuild NetworkAnalyzer.csproj /p:Configuration=Release
   ```

## Quick Start

### First Launch
1. Run `NetworkAnalyzer.exe` as Administrator
2. The application will open with multiple tabs for different functions
3. Start with the **Capture** tab to begin packet analysis

### Basic Usage

#### Packet Capture
1. Click the **Capture** tab
2. Press **Start Capture** button
3. Network packets will appear in real-time
4. Click **Stop Capture** to end session

#### DLL Injection
1. Go to **Injector** tab
2. Enter the path to your DLL file
3. Click **Inject DLL** button
4. Confirm the injection in the status bar

#### MITM Proxy
1. Navigate to **Proxy** tab
2. Set the desired port (default: 8080)
3. Click **Start Proxy**
4. Configure client applications to use the proxy

## Advanced Features

### Session Export/Import
- **File → Export Session**: Save current analysis data
- **File → Import Session**: Load previously saved sessions
- Supports JSON and HAR formats for compatibility

### Tools Menu
- **Tools → Base64 Encoder**: Convert text to/from Base64
- **Tools → Hash Calculator**: Generate cryptographic hashes

### View Options
- **View → Dark Mode**: Toggle application theme
- **View → Full Screen**: Maximize analysis workspace

## Testing Checklist

As per the development requirements, the following features have been tested:

### ✅ Completed Tests
- [x] Project compilation and EXE generation
- [x] Application startup and UI initialization
- [x] Packet capture functionality
- [x] DLL injection simulation
- [x] Protocol analysis display
- [x] Basic session management
- [x] Export/import functionality
- [x] Base64 encoding/decoding tools
- [x] Hash calculation utilities
- [x] Dark mode theme switching
- [x] Full screen mode toggle

### ⏳ Pending Tests
- [ ] MITM Proxy server functionality
- [ ] Advanced session management
- [ ] Server emulator capabilities
- [ ] Hex editor operations
- [ ] Large file handling
- [ ] Performance under heavy load

## Build Scripts

The project includes several build automation scripts:

### CompileNetworkAnalyzer.bat
Simple batch script for quick compilation:
```cmd
CompileNetworkAnalyzer.bat
```

### CreateNetworkAnalyzerProject.ps1
Advanced PowerShell script with options:
```powershell
# Basic build
.\CreateNetworkAnalyzerProject.ps1 -Build

# Clean and build
.\CreateNetworkAnalyzerProject.ps1 -Clean -Build

# Debug configuration
.\CreateNetworkAnalyzerProject.ps1 -Build -Configuration Debug
```

## Dependencies

The application uses the following NuGet packages:
- **Newtonsoft.Json** (13.0.3): JSON serialization and deserialization
- **.NET Framework** (4.7.2+): Core runtime environment

## Architecture

### Project Structure
```
NetworkAnalyzer/
├── NetworkAnalyzer.csproj    # MSBuild project file
├── App.config               # Application configuration
├── Program.cs               # Application entry point
├── MainForm.cs              # Main application logic
├── MainForm.Designer.cs     # UI component definitions
├── MainForm.resx           # UI resources
├── packages.config         # NuGet package references
└── Properties/             # Assembly metadata
    ├── AssemblyInfo.cs
    ├── Resources.resx
    ├── Resources.Designer.cs
    ├── Settings.settings
    └── Settings.Designer.cs
```

### Key Components
- **MainForm**: Primary user interface with tabbed layout
- **PacketInfo**: Data structure for captured network packets
- **SessionInfo**: Container for analysis session metadata
- **Export/Import**: JSON/HAR session persistence

## Troubleshooting

### Common Issues

**"Application requires administrator privileges"**
- Right-click NetworkAnalyzer.exe and select "Run as administrator"
- Some features like packet capture require elevated permissions

**"Cannot find Newtonsoft.Json.dll"**
- Ensure all DLL dependencies are in the same directory as the EXE
- Rebuild the project to restore NuGet packages

**"Build failed with MSBuild errors"**
- Verify .NET Framework 4.7.2+ is installed
- Check that MSBuild is available in your PATH
- Try cleaning the project before rebuilding

### Performance Tips
- Close unused tabs to reduce memory usage
- Stop packet capture when not actively analyzing
- Export large sessions periodically to prevent memory issues
- Use filters to limit captured packet types

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-analyzer`)
3. Commit your changes (`git commit -am 'Add packet filtering'`)
4. Push to the branch (`git push origin feature/new-analyzer`)
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

NetworkAnalyzer is intended for legitimate network analysis and security testing purposes only. Users are responsible for ensuring compliance with applicable laws and regulations. The developers assume no responsibility for misuse of this software.

## Support

For issues, questions, or feature requests:
- Create an issue on GitHub
- Check the troubleshooting section above
- Ensure you're running the latest version

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Compatibility**: Windows 7+ with .NET Framework 4.7.2+