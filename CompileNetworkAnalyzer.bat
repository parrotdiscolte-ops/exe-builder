@echo off
echo ========================================
echo NetworkAnalyzer Compilation Script
echo ========================================

cd /d "%~dp0NetworkAnalyzer"

echo Building NetworkAnalyzer project...
msbuild NetworkAnalyzer.csproj /p:Configuration=Release /p:Platform="Any CPU" /verbosity:minimal

if %ERRORLEVEL% == 0 (
    echo.
    echo ========================================
    echo Build completed successfully!
    echo Output: bin\Release\NetworkAnalyzer.exe
    echo ========================================
    
    if exist "bin\Release\NetworkAnalyzer.exe" (
        echo Executable created: %cd%\bin\Release\NetworkAnalyzer.exe
        echo File size: 
        dir "bin\Release\NetworkAnalyzer.exe" | findstr "NetworkAnalyzer.exe"
    ) else (
        echo Warning: NetworkAnalyzer.exe not found in expected location
    )
) else (
    echo ========================================
    echo Build failed! Check errors above.
    echo ========================================
)

echo.
pause