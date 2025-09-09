# 🔍 SonarSource Demo: Microservices Security Analysis

This repository demonstrates SonarSource's static analysis capabilities across a modern microservices architecture with **intentional security vulnerabilities and code quality issues**.

## 🏗️ Architecture

- **Frontend**: React application with client-side security issues
- **Backend**: Node.js/Express API with server-side vulnerabilities  
- **Security Issues**: OWASP Top 10 vulnerabilities intentionally included
- **Quality Issues**: Code smells, duplications, and maintainability problems

## 🚨 Security Vulnerabilities Included

### Backend (Node.js/Express)
- ✅ **SQL Injection** - Direct query concatenation
- ✅ **Authentication Bypass** - Weak JWT implementation
- ✅ **Path Traversal** - Unsafe file operations
- ✅ **Command Injection** - Unsafe shell execution
- ✅ **Hardcoded Secrets** - API keys in source code

### Frontend (React)
- ✅ **XSS (Cross-Site Scripting)** - Unsafe innerHTML usage
- ✅ **Sensitive Data Exposure** - Console logging of secrets
- ✅ **Insecure Dependencies** - Outdated packages with known CVEs
- ✅ **CORS Misconfiguration** - Overly permissive settings

## 📊 Code Quality Issues

- **Code Smells**: Complex functions, duplicated code
- **Bug Patterns**: Resource leaks, null pointer exceptions
- **Test Coverage**: Missing unit tests
- **Maintainability**: Technical debt accumulation

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm 8+

### Installation
\`\`\`bash
# Install all dependencies
npm run install:all

# Start both frontend and backend
npm start
\`\`\`

### Endpoints
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api-docs

## 🔧 SonarCloud Analysis

### Setup
1. **Fork this repository** to your GitHub account
2. **Connect to SonarCloud**: https://sonarcloud.io
3. **Import your forked project**
4. **Trigger analysis** via GitHub Actions or manual scan

### Local Analysis
\`\`\`bash
# Install SonarScanner
npm install -g sonarqube-scanner

# Run analysis (requires SONAR_TOKEN)
export SONAR_TOKEN=your_token_here
npm run sonar
\`\`\`

## 📋 Demo Scenarios

### 1. **Initial Security Scan**
- Show **50+ security issues** detected
- Highlight **Critical/Blocker** vulnerabilities
- Demonstrate **Security Hotspots** for manual review

### 2. **Developer Workflow**
- Fix a **SQL Injection** vulnerability
- Show **real-time feedback** in SonarLint
- Demonstrate **Quality Gate** status changes

### 3. **Enterprise Features**
- **Security Standards** compliance (OWASP, CWE)
- **Technical Debt** calculation and trends
- **Team productivity** metrics

### 4. **DevSecOps Integration**
- **Pull Request decoration** with issue comments
- **Quality Gate** blocking deployments
- **CI/CD pipeline** integration

## 🎯 Customer Value Propositions

### For **Security Teams**
> *"Find and fix security vulnerabilities before they reach production"*
- 📈 **25+ security rules** for JavaScript/TypeScript
- 🔒 **OWASP Top 10** coverage
- 🚨 **Real-time detection** in developer IDEs

### For **Development Teams**  
> *"Improve code quality without slowing down delivery"*
- ⚡ **Instant feedback** in pull requests
- 📊 **Technical debt** tracking and reduction
- 🎯 **Clean Code** attributes (Clear, Complete, Conventional)

### For **DevOps Teams**
> *"Integrate security scanning into CI/CD pipelines seamlessly"*
- 🔄 **Automated quality gates** 
- 📈 **Trend analysis** and reporting
- 🛠️ **Easy integration** with existing tools

## 🔧 Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Frontend | React 18, JavaScript | Client-side application |
| Backend | Node.js, Express | REST API server |
| Database | SQLite (in-memory) | Data persistence |
| Testing | Jest, React Testing Library | Unit testing |
| CI/CD | GitHub Actions | Automated workflows |
| Analysis | SonarCloud | Static code analysis |

## 📈 Expected Analysis Results

After running SonarSource analysis, you should see:

- **🔴 Blocker Issues**: 5-10 (Critical security vulnerabilities)
- **🟠 Critical Issues**: 10-15 (High-impact security/reliability)  
- **🟡 Major Issues**: 20-30 (Significant quality problems)
- **🔵 Minor Issues**: 30+ (Code style and improvements)
- **📊 Technical Debt**: 2-4 hours estimated fix time
- **🧪 Test Coverage**: <50% (intentionally low)

## 🎓 Educational Value

This demo helps Solutions Engineers demonstrate:

1. **Comprehensive Coverage**: Multi-language, full-stack analysis
2. **Real-world Scenarios**: Actual vulnerabilities developers face
3. **Developer Experience**: IDE integration and workflow
4. **Enterprise Value**: Security, quality, and productivity metrics
5. **ROI Calculation**: Time saved catching issues early

---

## ⚠️ Important Notice

**This repository contains intentional security vulnerabilities for demonstration purposes only.**

- 🚫 **DO NOT** deploy this code to production
- 🚫 **DO NOT** use as a template for real applications  
- ✅ **DO** use for SonarSource demos and training
- ✅ **DO** reference when explaining security concepts

---

*Built with ❤️ by SonarSource Solutions Engineering*
