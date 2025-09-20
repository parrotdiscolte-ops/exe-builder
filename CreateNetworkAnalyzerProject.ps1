# NetworkAnalyzer Project Creation and Build Script
# PowerShell script to create and build NetworkAnalyzer project

param(
    [switch]$Build = $false,
    [switch]$Clean = $false,
    [string]$Configuration = "Release"
)

$ProjectName = "NetworkAnalyzer"
$ProjectDir = Join-Path $PSScriptRoot $ProjectName

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "NetworkAnalyzer Project Builder" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Function to check if .NET Framework is available
function Test-DotNetFramework {
    try {
        $dotNetVersion = Get-ItemProperty "HKLM:SOFTWARE\Microsoft\NET Framework Setup\NDP\v4\Full\" -Name Release -ErrorAction SilentlyContinue
        if ($dotNetVersion -and $dotNetVersion.Release -ge 461808) {
            Write-Host "✓ .NET Framework 4.7.2+ detected" -ForegroundColor Green
            return $true
        } else {
            Write-Host "✗ .NET Framework 4.7.2+ not found" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "✗ Could not detect .NET Framework version" -ForegroundColor Red
        return $false
    }
}

# Function to check if MSBuild is available
function Test-MSBuild {
    try {
        $msbuild = Get-Command msbuild -ErrorAction SilentlyContinue
        if ($msbuild) {
            Write-Host "✓ MSBuild found at: $($msbuild.Source)" -ForegroundColor Green
            return $true
        } else {
            Write-Host "✗ MSBuild not found in PATH" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "✗ Could not detect MSBuild" -ForegroundColor Red
        return $false
    }
}

# Check prerequisites
Write-Host "`nChecking prerequisites..." -ForegroundColor Yellow
$dotNetOk = Test-DotNetFramework
$msbuildOk = Test-MSBuild

if (-not ($dotNetOk -and $msbuildOk)) {
    Write-Host "`nPrerequisites not met. Please install:" -ForegroundColor Red
    if (-not $dotNetOk) { Write-Host "- .NET Framework 4.7.2 or higher" -ForegroundColor Red }
    if (-not $msbuildOk) { Write-Host "- Microsoft Build Tools or Visual Studio" -ForegroundColor Red }
    exit 1
}

# Check if project exists
if (-not (Test-Path $ProjectDir)) {
    Write-Host "`n✗ Project directory not found: $ProjectDir" -ForegroundColor Red
    Write-Host "Please run this script from the repository root directory." -ForegroundColor Red
    exit 1
}

Write-Host "`n✓ Project directory found: $ProjectDir" -ForegroundColor Green

# Change to project directory
Set-Location $ProjectDir

# Clean if requested
if ($Clean) {
    Write-Host "`nCleaning project..." -ForegroundColor Yellow
    if (Test-Path "bin") {
        Remove-Item "bin" -Recurse -Force
        Write-Host "✓ Removed bin directory" -ForegroundColor Green
    }
    if (Test-Path "obj") {
        Remove-Item "obj" -Recurse -Force
        Write-Host "✓ Removed obj directory" -ForegroundColor Green
    }
}

# Build project
if ($Build -or $Clean) {
    Write-Host "`nBuilding project ($Configuration configuration)..." -ForegroundColor Yellow
    
    $buildArgs = @(
        "$ProjectName.csproj",
        "/p:Configuration=$Configuration",
        "/p:Platform=`"Any CPU`"",
        "/verbosity:minimal"
    )
    
    $buildProcess = Start-Process -FilePath "msbuild" -ArgumentList $buildArgs -Wait -PassThru -NoNewWindow
    
    if ($buildProcess.ExitCode -eq 0) {
        Write-Host "`n========================================" -ForegroundColor Green
        Write-Host "BUILD SUCCESSFUL!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        
        $exePath = "bin\$Configuration\$ProjectName.exe"
        if (Test-Path $exePath) {
            $fileInfo = Get-Item $exePath
            Write-Host "✓ Executable created: $($fileInfo.FullName)" -ForegroundColor Green
            Write-Host "✓ File size: $([math]::Round($fileInfo.Length / 1KB, 2)) KB" -ForegroundColor Green
            Write-Host "✓ Created: $($fileInfo.CreationTime)" -ForegroundColor Green
        } else {
            Write-Host "⚠ Warning: Executable not found at expected location: $exePath" -ForegroundColor Yellow
        }
        
        # Check for dependencies
        Write-Host "`nDependencies:" -ForegroundColor Cyan
        $binPath = "bin\$Configuration"
        if (Test-Path $binPath) {
            Get-ChildItem $binPath -Filter "*.dll" | ForEach-Object {
                Write-Host "- $($_.Name)" -ForegroundColor White
            }
        }
    } else {
        Write-Host "`n========================================" -ForegroundColor Red
        Write-Host "BUILD FAILED!" -ForegroundColor Red
        Write-Host "Exit Code: $($buildProcess.ExitCode)" -ForegroundColor Red
        Write-Host "========================================" -ForegroundColor Red
        exit $buildProcess.ExitCode
    }
}

# Display project information
Write-Host "`nProject Information:" -ForegroundColor Cyan
Write-Host "- Name: $ProjectName" -ForegroundColor White
Write-Host "- Directory: $ProjectDir" -ForegroundColor White
Write-Host "- Target Framework: .NET Framework 4.7.2" -ForegroundColor White
Write-Host "- Configuration: $Configuration" -ForegroundColor White

Write-Host "`nUsage Examples:" -ForegroundColor Cyan
Write-Host "- Build project: .\CreateNetworkAnalyzerProject.ps1 -Build" -ForegroundColor White
Write-Host "- Clean and build: .\CreateNetworkAnalyzerProject.ps1 -Clean -Build" -ForegroundColor White
Write-Host "- Debug build: .\CreateNetworkAnalyzerProject.ps1 -Build -Configuration Debug" -ForegroundColor White

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Script completed successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan