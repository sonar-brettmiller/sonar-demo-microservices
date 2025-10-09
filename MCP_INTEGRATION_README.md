# SonarQube MCP Server Integration

This project integrates the **SonarQube MCP Server** with GitHub Actions to provide intelligent code quality insights and automated PR decorations.

## 🚀 Features

- **Dynamic Tool Discovery**: Automatically discover and register SonarQube analysis tools
- **Project Health Insights**: Get comprehensive project health metrics
- **Security Analysis**: Identify security hotspots and vulnerabilities
- **PR Decoration**: Automatically decorate pull requests with quality insights
- **AI-Powered Recommendations**: Get intelligent suggestions for code improvements

## 📋 Prerequisites

### Required Secrets
Add these secrets to your GitHub repository:

1. **`SONAR_TOKEN`**: Your SonarQube authentication token
   - Get from: SonarCloud → My Account → Security → Generate Tokens
   - Or: SonarQube → Administration → Security → Users → Tokens

2. **`SONAR_HOST_URL`** (optional): SonarQube server URL
   - Default: `https://sonarcloud.io`
   - For self-hosted SonarQube: `https://your-sonarqube-instance.com`

### Required Environment Variables
- `SONAR_ORGANIZATION`: Your SonarQube organization (default: `sonar-brettmiller`)
- `SONAR_PROJECT_KEY`: Your project key (default: `sonar-brettmiller_sonar-demo-microservices`)

## 🔧 Setup Instructions

### 1. Configure SonarQube Project

Ensure your `sonar-project.properties` is properly configured:

```properties
sonar.projectKey=sonar-brettmiller_sonar-demo-microservices
sonar.projectName=sonar-demo-microservices
sonar.organization=sonar-brettmiller
sonar.sources=backend/,frontend/src/
sonar.javascript.lcov.reportPaths=backend/coverage/lcov.info,frontend/coverage/lcov.info
```

### 2. Add GitHub Secrets

Go to your repository → Settings → Secrets and variables → Actions, and add:

- `SONAR_TOKEN`: Your SonarQube authentication token
- `SONAR_HOST_URL`: Your SonarQube server URL (if not SonarCloud)

### 3. Enable GitHub Actions

The workflow will automatically run on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Manual trigger via `workflow_dispatch`

## 🤖 MCP Server Tools

The SonarQube MCP Server provides the following tools:

### 📊 Project Health Analysis
- **`get_project_health`**: Overall project health metrics
- **`get_quality_gate_status`**: Quality gate status and conditions
- **`get_code_quality_metrics`**: Detailed quality metrics

### 🔒 Security Analysis
- **`get_security_hotspots`**: Security hotspots and vulnerabilities
- **`analyze_pr_impact`**: PR impact on security metrics

### 📈 Coverage & Metrics
- **`get_coverage_metrics`**: Test coverage analysis
- **`get_duplication_metrics`**: Code duplication analysis
- **`get_technical_debt`**: Technical debt metrics

## 🔄 Workflow Overview

The GitHub Actions workflow consists of 6 jobs:

1. **`test-and-coverage`**: Run tests and generate coverage reports
2. **`sonarqube-analysis`**: Perform SonarQube code analysis
3. **`sonarqube-mcp-integration`**: Integrate with MCP server for insights
4. **`pr-decoration`**: Decorate PRs with analysis results (PR only)
5. **`security-compliance`**: Run security compliance checks
6. **`notification-summary`**: Generate workflow summary

## 📊 PR Decoration Features

When a pull request is created, the workflow will:

- ✅ **Add comprehensive comments** with project health insights
- 🏷️ **Apply labels** based on quality gate status
- 📈 **Show metrics** including coverage, security, and maintainability
- 🤖 **Provide AI recommendations** for improvements
- 🔍 **Highlight specific issues** with file-level annotations

## 🛠️ Local Development

### Using the MCP Server Script

The project includes a helper script for local MCP server integration:

```bash
# Make the script executable
chmod +x scripts/setup-mcp-server.sh

# Start MCP server and run all tests
./scripts/setup-mcp-server.sh all

# Or run individual commands
./scripts/setup-mcp-server.sh start    # Start MCP server
./scripts/setup-mcp-server.sh test     # Test functionality
./scripts/setup-mcp-server.sh report   # Generate health report
./scripts/setup-mcp-server.sh cleanup   # Clean up resources
```

### Environment Variables for Local Development

```bash
export SONAR_TOKEN="your-sonarqube-token"
export SONAR_HOST_URL="https://sonarcloud.io"
export SONAR_ORGANIZATION="sonar-brettmiller"
export SONAR_PROJECT_KEY="sonar-brettmiller_sonar-demo-microservices"
export MCP_SERVER_PORT="8080"
```

## 📈 Understanding the Reports

### Quality Gate Status
- **✅ PASSED**: All quality conditions met
- **❌ FAILED**: One or more conditions failed
- **⚠️ WARNING**: Conditions passed but with warnings

### Security Analysis
- **🔴 HIGH**: Critical security issues requiring immediate attention
- **🟡 MEDIUM**: Important security issues to address
- **🟢 LOW**: Minor security improvements

### Coverage Metrics
- **Line Coverage**: Percentage of lines covered by tests
- **Branch Coverage**: Percentage of branches covered by tests
- **Overall Coverage**: Combined coverage metric

## 🔧 Customization

### Adding Custom MCP Tools

To add custom tools to the MCP server, edit `.mcp/sonarqube-server.json`:

```json
{
  "id": "custom_analysis_tool",
  "name": "Custom Analysis Tool",
  "description": "Your custom analysis tool",
  "parameters": {
    "projectKey": {
      "type": "string",
      "description": "Project key to analyze",
      "required": true
    }
  }
}
```

### Modifying Workflow Behavior

Edit `.github/workflows/sonarqube-mcp-ci.yml` to:

- Change trigger conditions
- Add additional analysis steps
- Modify PR decoration behavior
- Add custom notifications

## 🚨 Troubleshooting

### Common Issues

1. **MCP Server Not Starting**
   - Check Docker installation
   - Verify port 8080 is available
   - Check SonarQube token permissions

2. **Tool Registration Fails**
   - Ensure MCP client is installed
   - Verify server is running and accessible
   - Check network connectivity

3. **Analysis Fails**
   - Verify SonarQube project configuration
   - Check coverage report paths
   - Ensure all dependencies are installed

### Debug Mode

Enable debug logging by setting:

```bash
export DEBUG=true
export MCP_LOG_LEVEL=debug
```

## 📚 Additional Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [SonarQube API Documentation](https://docs.sonarqube.org/latest/extend/web-api/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [SonarCloud Integration Guide](https://docs.sonarcloud.io/getting-started/github-integration/)

## 🤝 Contributing

To contribute to this integration:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with the MCP server
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Note**: This integration is designed for educational and demonstration purposes, showing how MCP servers can enhance CI/CD pipelines with intelligent code quality insights.
