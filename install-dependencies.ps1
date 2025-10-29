# ========================================
# Internship Portal - Universal Installer
# ========================================
# This script installs ALL project dependencies
# Works on any Windows machine with Node.js installed
# 
# Usage: .\install-dependencies.ps1

param(
    [switch]$SkipChecks
)

$ErrorActionPreference = "Stop"

# Function to write colored output
function Write-Success { param($Message) Write-Host "✓ $Message" -ForegroundColor Green }
function Write-Error { param($Message) Write-Host "✗ $Message" -ForegroundColor Red }
function Write-Info { param($Message) Write-Host "ℹ $Message" -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host "⚠ $Message" -ForegroundColor Yellow }

# Banner
Clear-Host
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     INTERNSHIP PORTAL - DEPENDENCY INSTALLER          ║" -ForegroundColor Cyan
Write-Host "║     Automated Setup for Backend + Frontend            ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Node.js
Write-Info "Step 1/6: Checking Node.js installation..."
try {
    $nodeVersion = node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Node.js $nodeVersion detected"
    } else {
        throw "Node.js not found"
    }
} catch {
    Write-Error "Node.js is not installed!"
    Write-Warning "Please install Node.js from: https://nodejs.org/"
    Write-Warning "Recommended version: Node.js 18 LTS or higher"
    Read-Host "Press Enter to exit"
    exit 1
}

# Step 2: Check npm
Write-Info "Step 2/6: Checking npm installation..."
try {
    $npmVersion = npm --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "npm $npmVersion detected"
    } else {
        throw "npm not found"
    }
} catch {
    Write-Error "npm is not installed!"
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  INSTALLING BACKEND DEPENDENCIES" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

# Step 3: Install Backend Dependencies
Write-Info "Step 3/6: Installing backend dependencies..."

if (-Not (Test-Path "server")) {
    Write-Error "server/ folder not found!"
    Write-Warning "Make sure you're running this script from the project root directory"
    Read-Host "Press Enter to exit"
    exit 1
}

try {
    Push-Location server
    
    # Check if package.json exists
    if (-Not (Test-Path "package.json")) {
        Write-Error "server/package.json not found!"
        Pop-Location
        exit 1
    }
    
    Write-Host "   → Running npm install in server/..." -ForegroundColor Gray
    npm install --loglevel=error
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Backend dependencies installed successfully"
    } else {
        throw "Backend installation failed"
    }
    
    Pop-Location
} catch {
    Write-Error "Failed to install backend dependencies: $_"
    Pop-Location
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  INSTALLING FRONTEND DEPENDENCIES" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

# Step 4: Install Frontend Dependencies
Write-Info "Step 4/6: Installing frontend dependencies..."

if (-Not (Test-Path "client")) {
    Write-Error "client/ folder not found!"
    Read-Host "Press Enter to exit"
    exit 1
}

try {
    Push-Location client
    
    # Check if package.json exists
    if (-Not (Test-Path "package.json")) {
        Write-Error "client/package.json not found!"
        Pop-Location
        exit 1
    }
    
    Write-Host "   → Running npm install in client/..." -ForegroundColor Gray
    npm install --loglevel=error
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Frontend dependencies installed successfully"
    } else {
        throw "Frontend installation failed"
    }
    
    Pop-Location
} catch {
    Write-Error "Failed to install frontend dependencies: $_"
    Pop-Location
    Read-Host "Press Enter to exit"
    exit 1
}

# Step 5: Verify installations
Write-Host ""
Write-Info "Step 5/6: Verifying installations..."

$backendNodeModules = Test-Path "server/node_modules"
$frontendNodeModules = Test-Path "client/node_modules"

if ($backendNodeModules) {
    Write-Success "Backend node_modules verified"
} else {
    Write-Warning "Backend node_modules not found"
}

if ($frontendNodeModules) {
    Write-Success "Frontend node_modules verified"
} else {
    Write-Warning "Frontend node_modules not found"
}

# Step 6: Display summary
Write-Host ""
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  INSTALLATION COMPLETED SUCCESSFULLY! ✓" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

Write-Info "Step 6/6: Next Steps"
Write-Host ""
Write-Host "  1️⃣  Create Environment File:" -ForegroundColor Cyan
Write-Host "     → Create server/.env with your MongoDB and Cloudinary credentials" -ForegroundColor Gray
Write-Host ""
Write-Host "  2️⃣  Start Backend Server:" -ForegroundColor Cyan
Write-Host "     → cd server" -ForegroundColor Gray
Write-Host "     → npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "  3️⃣  Start Frontend (in a new terminal):" -ForegroundColor Cyan
Write-Host "     → cd client" -ForegroundColor Gray
Write-Host "     → npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "  4️⃣  Access Application:" -ForegroundColor Cyan
Write-Host "     → Frontend: http://localhost:5173" -ForegroundColor Gray
Write-Host "     → Backend:  http://localhost:5000" -ForegroundColor Gray
Write-Host ""

Write-Host "📦 Installed Packages:" -ForegroundColor Cyan
Write-Host "   Backend:  11 production + 1 dev dependencies" -ForegroundColor Gray
Write-Host "   Frontend: 5 production + 5 dev dependencies" -ForegroundColor Gray
Write-Host ""

Write-Success "Setup complete! Happy coding! 🚀"
Write-Host ""

Read-Host "Press Enter to exit"
