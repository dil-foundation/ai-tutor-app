# DIL-LMS E2E Test Runner Script (PowerShell)
# This script provides easy commands to run different test suites

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Function to check if .env file exists and has required values
function Test-Environment {
    if (!(Test-Path ".env")) {
        Write-Error ".env file not found. Please run setup.ps1 first."
        exit 1
    }

    # Check for required environment variables
    $envContent = Get-Content ".env" -Raw
    if ($envContent -notmatch "BROWSERSTACK_USERNAME=" -or $envContent -notmatch "BROWSERSTACK_ACCESS_KEY=") {
        Write-Error "BrowserStack credentials not configured in .env file."
        exit 1
    }

    if ($envContent -notmatch "BROWSERSTACK_ANDROID_APP_ID=" -or $envContent -notmatch "BROWSERSTACK_IOS_APP_ID=") {
        Write-Warning "App IDs not configured in .env file. Tests may fail."
    }
}

# Function to clean previous test results
function Clear-TestResults {
    Write-Status "Cleaning previous test results..."
    
    $directories = @("allure-results", "screenshots", "logs")
    foreach ($dir in $directories) {
        if (Test-Path $dir) {
            Remove-Item "$dir\*" -Recurse -Force -ErrorAction SilentlyContinue
            Write-Success "Cleaned $dir directory"
        }
    }
    Write-Success "Previous test results cleaned"
}

# Function to run tests with error handling
function Invoke-TestRun {
    param(
        [string]$TestCommand,
        [string]$TestName
    )
    
    Write-Status "Starting $TestName..."
    Write-Status "Command: $TestCommand"
    
    # Run the test command
    Invoke-Expression $TestCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "$TestName completed successfully"
        return $true
    } else {
        Write-Error "$TestName failed with exit code $LASTEXITCODE"
        return $false
    }
}

# Function to generate and open Allure report
function New-AllureReport {
    if ((Test-Path "allure-results") -and (Get-ChildItem "allure-results" | Measure-Object).Count -gt 0) {
        Write-Status "Generating Allure report..."
        npx allure generate allure-results --clean
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Allure report generated successfully"
            Write-Status "Opening Allure report..."
            npx allure open
        } else {
            Write-Error "Failed to generate Allure report"
        }
    } else {
        Write-Warning "No test results found to generate report"
    }
}

# Main script logic
switch ($Command.ToLower()) {
    "smoke" {
        Test-Environment
        Clear-TestResults
        $success = Invoke-TestRun "npm run test:smoke" "Smoke Tests"
        if ($success) { New-AllureReport }
    }
    "regression" {
        Test-Environment
        Clear-TestResults
        $success = Invoke-TestRun "npm run test:regression" "Regression Tests"
        if ($success) { New-AllureReport }
    }
    "android" {
        Test-Environment
        Clear-TestResults
        $success = Invoke-TestRun "npm run test:android" "Android Tests"
        if ($success) { New-AllureReport }
    }
    "ios" {
        Test-Environment
        Clear-TestResults
        $success = Invoke-TestRun "npm run test:ios" "iOS Tests"
        if ($success) { New-AllureReport }
    }
    "parallel" {
        Test-Environment
        Clear-TestResults
        $success = Invoke-TestRun "npm run test:parallel" "Parallel Tests"
        if ($success) { New-AllureReport }
    }
    "debug" {
        Test-Environment
        Clear-TestResults
        $success = Invoke-TestRun "npm run test:debug" "Debug Tests"
        if ($success) { New-AllureReport }
    }
    "local" {
        Test-Environment
        Clear-TestResults
        $success = Invoke-TestRun "npm run test:local" "Local Tests"
        if ($success) { New-AllureReport }
    }
    "clean" {
        Clear-TestResults
        Write-Success "Test results cleaned"
    }
    "report" {
        New-AllureReport
    }
    "setup" {
        Write-Status "Running setup..."
        if (Test-Path "scripts\setup.ps1") {
            & ".\scripts\setup.ps1"
        } else {
            Write-Error "Setup script not found"
        }
    }
    "help" {
        Write-Host "DIL-LMS E2E Test Runner" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Usage: .\run-tests.ps1 [command]" -ForegroundColor White
        Write-Host ""
        Write-Host "Commands:" -ForegroundColor Yellow
        Write-Host "  smoke       Run smoke tests (quick validation)" -ForegroundColor White
        Write-Host "  regression  Run regression tests (comprehensive)" -ForegroundColor White
        Write-Host "  android     Run Android-specific tests" -ForegroundColor White
        Write-Host "  ios         Run iOS-specific tests" -ForegroundColor White
        Write-Host "  parallel    Run tests in parallel" -ForegroundColor White
        Write-Host "  debug       Run tests in debug mode" -ForegroundColor White
        Write-Host "  local       Run local tests (if configured)" -ForegroundColor White
        Write-Host "  clean       Clean previous test results" -ForegroundColor White
        Write-Host "  report      Generate and open Allure report" -ForegroundColor White
        Write-Host "  setup       Run initial setup" -ForegroundColor White
        Write-Host "  help        Show this help message" -ForegroundColor White
        Write-Host ""
        Write-Host "Examples:" -ForegroundColor Yellow
        Write-Host "  .\run-tests.ps1 smoke      # Run smoke tests" -ForegroundColor White
        Write-Host "  .\run-tests.ps1 regression # Run regression tests" -ForegroundColor White
        Write-Host "  .\run-tests.ps1 android    # Run Android tests" -ForegroundColor White
        Write-Host "  .\run-tests.ps1 clean      # Clean test results" -ForegroundColor White
        Write-Host "  .\run-tests.ps1 report     # Generate report" -ForegroundColor White
    }
    default {
        Write-Error "Unknown command: $Command"
        Write-Host "Use '.\run-tests.ps1 help' to see available commands" -ForegroundColor White
        exit 1
    }
}
