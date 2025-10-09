#!/bin/bash

# Test script for SonarQube MCP Server Integration
# This script validates the MCP server integration setup

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
}

# Test function
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    log_info "Running test: $test_name"
    
    if eval "$test_command"; then
        log_success "Test passed: $test_name"
    else
        log_error "Test failed: $test_name"
    fi
}

# Test 1: Check if required files exist
test_required_files() {
    log_info "Testing required files..."
    
    local required_files=(
        ".github/workflows/sonarqube-mcp-ci.yml"
        ".mcp/sonarqube-server.json"
        "scripts/setup-mcp-server.sh"
        "MCP_INTEGRATION_README.md"
        "sonar-project.properties"
    )
    
    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            log_success "Required file exists: $file"
        else
            log_error "Required file missing: $file"
        fi
    done
}

# Test 2: Validate GitHub Actions workflow syntax
test_workflow_syntax() {
    log_info "Testing GitHub Actions workflow syntax..."
    
    if command -v yamllint &> /dev/null; then
        yamllint .github/workflows/sonarqube-mcp-ci.yml
        log_success "Workflow syntax is valid"
    else
        log_warning "yamllint not installed, skipping workflow syntax check"
    fi
}

# Test 3: Validate MCP server configuration
test_mcp_config() {
    log_info "Testing MCP server configuration..."
    
    if command -v jq &> /dev/null; then
        if jq empty .mcp/sonarqube-server.json 2>/dev/null; then
            log_success "MCP server configuration is valid JSON"
        else
            log_error "MCP server configuration has invalid JSON"
        fi
    else
        log_warning "jq not installed, skipping JSON validation"
    fi
}

# Test 4: Check SonarQube configuration
test_sonarqube_config() {
    log_info "Testing SonarQube configuration..."
    
    if grep -q "sonar.projectKey" sonar-project.properties; then
        log_success "SonarQube project key is configured"
    else
        log_error "SonarQube project key is missing"
    fi
    
    if grep -q "sonar.organization" sonar-project.properties; then
        log_success "SonarQube organization is configured"
    else
        log_error "SonarQube organization is missing"
    fi
}

# Test 5: Check script permissions
test_script_permissions() {
    log_info "Testing script permissions..."
    
    if [ -x "scripts/setup-mcp-server.sh" ]; then
        log_success "Setup script is executable"
    else
        log_error "Setup script is not executable"
    fi
}

# Test 6: Validate package.json scripts
test_package_scripts() {
    log_info "Testing package.json scripts..."
    
    if grep -q "sonar" package.json; then
        log_success "SonarQube script found in package.json"
    else
        log_error "SonarQube script missing from package.json"
    fi
    
    if grep -q "test" package.json; then
        log_success "Test script found in package.json"
    else
        log_error "Test script missing from package.json"
    fi
}

# Test 7: Check coverage report paths
test_coverage_paths() {
    log_info "Testing coverage report paths..."
    
    local coverage_paths=(
        "backend/coverage/lcov.info"
        "frontend/coverage/lcov.info"
    )
    
    for path in "${coverage_paths[@]}"; do
        if [ -f "$path" ]; then
            log_success "Coverage report exists: $path"
        else
            log_warning "Coverage report missing: $path (will be generated during CI)"
        fi
    done
}

# Test 8: Validate environment variables
test_environment_variables() {
    log_info "Testing environment variables..."
    
    local required_vars=(
        "SONAR_PROJECT_KEY"
        "SONAR_ORGANIZATION"
        "SONAR_HOST_URL"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -n "${!var}" ]; then
            log_success "Environment variable set: $var"
        else
            log_warning "Environment variable not set: $var (will use defaults)"
        fi
    done
}

# Test 9: Check MCP server tools configuration
test_mcp_tools() {
    log_info "Testing MCP server tools configuration..."
    
    local expected_tools=(
        "get_project_health"
        "get_code_quality_metrics"
        "get_security_hotspots"
        "get_coverage_metrics"
        "get_quality_gate_status"
        "get_duplication_metrics"
        "get_technical_debt"
        "analyze_pr_impact"
    )
    
    for tool in "${expected_tools[@]}"; do
        if grep -q "\"id\": \"$tool\"" .mcp/sonarqube-server.json; then
            log_success "MCP tool configured: $tool"
        else
            log_error "MCP tool missing: $tool"
        fi
    done
}

# Test 10: Validate workflow triggers
test_workflow_triggers() {
    log_info "Testing workflow triggers..."
    
    if grep -q "on:" .github/workflows/sonarqube-mcp-ci.yml; then
        log_success "Workflow triggers are configured"
    else
        log_error "Workflow triggers are missing"
    fi
    
    if grep -q "pull_request:" .github/workflows/sonarqube-mcp-ci.yml; then
        log_success "Pull request trigger is configured"
    else
        log_error "Pull request trigger is missing"
    fi
}

# Main test execution
main() {
    echo "🧪 Starting SonarQube MCP Server Integration Tests"
    echo "=================================================="
    echo ""
    
    # Run all tests
    test_required_files
    test_workflow_syntax
    test_mcp_config
    test_sonarqube_config
    test_script_permissions
    test_package_scripts
    test_coverage_paths
    test_environment_variables
    test_mcp_tools
    test_workflow_triggers
    
    echo ""
    echo "📊 Test Results Summary"
    echo "======================="
    echo "✅ Tests Passed: $TESTS_PASSED"
    echo "❌ Tests Failed: $TESTS_FAILED"
    echo ""
    
    if [ $TESTS_FAILED -eq 0 ]; then
        log_success "All tests passed! MCP server integration is ready."
        echo ""
        echo "🚀 Next Steps:"
        echo "1. Add SONAR_TOKEN to GitHub repository secrets"
        echo "2. Push changes to trigger the workflow"
        echo "3. Create a pull request to test PR decoration"
        echo "4. Monitor the workflow execution in GitHub Actions"
        exit 0
    else
        log_error "Some tests failed. Please fix the issues before proceeding."
        exit 1
    fi
}

# Run main function
main "$@"
