#!/bin/bash

# DIL-LMS E2E Test Runner Script
# This script provides easy commands to run different test suites

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if .env file exists and has required values
check_env() {
    if [ ! -f .env ]; then
        print_error ".env file not found. Please run setup.sh first."
        exit 1
    fi

    # Check for required environment variables
    if ! grep -q "BROWSERSTACK_USERNAME=" .env || ! grep -q "BROWSERSTACK_ACCESS_KEY=" .env; then
        print_error "BrowserStack credentials not configured in .env file."
        exit 1
    fi

    if ! grep -q "BROWSERSTACK_ANDROID_APP_ID=" .env || ! grep -q "BROWSERSTACK_IOS_APP_ID=" .env; then
        print_warning "App IDs not configured in .env file. Tests may fail."
    fi
}

# Function to clean previous test results
clean_results() {
    print_status "Cleaning previous test results..."
    rm -rf allure-results/*
    rm -rf screenshots/*
    rm -rf logs/*
    print_success "Previous test results cleaned"
}

# Function to run tests with error handling
run_tests() {
    local test_command="$1"
    local test_name="$2"
    
    print_status "Starting $test_name..."
    print_status "Command: $test_command"
    
    # Run the test command
    eval $test_command
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        print_success "$test_name completed successfully"
        return 0
    else
        print_error "$test_name failed with exit code $exit_code"
        return $exit_code
    fi
}

# Function to generate and open Allure report
generate_report() {
    if [ -d "allure-results" ] && [ "$(ls -A allure-results)" ]; then
        print_status "Generating Allure report..."
        npx allure generate allure-results --clean
        if [ $? -eq 0 ]; then
            print_success "Allure report generated successfully"
            print_status "Opening Allure report..."
            npx allure open
        else
            print_error "Failed to generate Allure report"
        fi
    else
        print_warning "No test results found to generate report"
    fi
}

# Main script logic
case "$1" in
    "smoke")
        check_env
        clean_results
        run_tests "npm run test:smoke" "Smoke Tests"
        generate_report
        ;;
    "regression")
        check_env
        clean_results
        run_tests "npm run test:regression" "Regression Tests"
        generate_report
        ;;
    "android")
        check_env
        clean_results
        run_tests "npm run test:android" "Android Tests"
        generate_report
        ;;
    "ios")
        check_env
        clean_results
        run_tests "npm run test:ios" "iOS Tests"
        generate_report
        ;;
    "parallel")
        check_env
        clean_results
        run_tests "npm run test:parallel" "Parallel Tests"
        generate_report
        ;;
    "debug")
        check_env
        clean_results
        run_tests "npm run test:debug" "Debug Tests"
        generate_report
        ;;
    "local")
        check_env
        clean_results
        run_tests "npm run test:local" "Local Tests"
        generate_report
        ;;
    "clean")
        clean_results
        print_success "Test results cleaned"
        ;;
    "report")
        generate_report
        ;;
    "setup")
        print_status "Running setup..."
        chmod +x scripts/setup.sh
        ./scripts/setup.sh
        ;;
    "help"|"--help"|"-h"|"")
        echo "DIL-LMS E2E Test Runner"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  smoke       Run smoke tests (quick validation)"
        echo "  regression  Run regression tests (comprehensive)"
        echo "  android     Run Android-specific tests"
        echo "  ios         Run iOS-specific tests"
        echo "  parallel    Run tests in parallel"
        echo "  debug       Run tests in debug mode"
        echo "  local       Run local tests (if configured)"
        echo "  clean       Clean previous test results"
        echo "  report      Generate and open Allure report"
        echo "  setup       Run initial setup"
        echo "  help        Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 smoke      # Run smoke tests"
        echo "  $0 regression # Run regression tests"
        echo "  $0 android    # Run Android tests"
        echo "  $0 clean      # Clean test results"
        echo "  $0 report     # Generate report"
        ;;
    *)
        print_error "Unknown command: $1"
        echo "Use '$0 help' to see available commands"
        exit 1
        ;;
esac
