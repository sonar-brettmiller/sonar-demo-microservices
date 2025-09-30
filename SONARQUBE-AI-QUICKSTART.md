# 🚀 SonarQube + AI Development - Quick Start Guide

## TL;DR
**Goal:** Use AI to generate code that automatically passes SonarQube quality gates on first commit.

**Setup Time:** 2 minutes  
**Result:** Zero quality gate failures 🎯

---

## 🎯 Your Quality Gate Targets

Your project uses **"Sonar way"** quality gate:

```yaml
✅ New Maintainability Rating: A (≤ 1.0)
✅ New Security Rating: A (≤ 1.0)
✅ New Reliability Rating: A (≤ 1.0)
✅ New Coverage: ≥ 80%
✅ New Duplicated Lines: ≤ 3%
✅ New Security Hotspots Reviewed: 100%
```

**All must pass for successful merge.** ⚠️

---

## 📁 Files You Need to Know

### Cursor Rules (Auto-Enforced)
```
.cursor/rules/
├── ai-sonarqube-workflow.mdc    ← 🤖 AI workflow with SonarQube MCP
├── maintainability.mdc           ← Code smell prevention
├── security.mdc                  ← Security standards
├── testing-guidelines.mdc        ← Coverage requirements
└── ai-workflow.mdc               ← General AI rules
```

These rules are **automatically applied** when AI generates code in Cursor.

### Quick Reference
```
.cursorrules                      ← Main config (points to rules)
AI-WORKFLOW-EXAMPLE.md            ← Real-world example
SONARQUBE-AI-QUICKSTART.md        ← This file
```

---

## 🤖 How to Use AI for SonarQube-Compliant Code

### Simple Workflow

1. **Request code from AI:**
   ```
   You: "Add a user profile update endpoint"
   ```

2. **AI automatically:**
   - ✅ Queries SonarQube for current metrics
   - ✅ Generates code following quality rules
   - ✅ Creates comprehensive tests
   - ✅ Validates against quality standards
   - ✅ Presents code + tests together

3. **You review and commit:**
   - Code is already quality-gate compliant ✅
   - Tests already written ✅
   - Coverage already ≥80% ✅

**That's it!** No manual quality fixes needed.

---

## 🛠️ SonarQube MCP Tools Available

The AI has access to these SonarQube tools:

### 1. Check Quality Gate Status
```javascript
mcp_sonarqube_get_project_quality_gate_status({
  projectKey: "sonar-brettmiller_sonar-demo-microservices"
})
```
**Use:** Before generating code, AI checks if project is passing

### 2. Get Component Metrics
```javascript
mcp_sonarqube_get_component_measures({
  component: "project:backend/server.js",
  metricKeys: ["new_coverage", "new_code_smells", "cognitive_complexity"]
})
```
**Use:** AI validates generated code meets standards

### 3. Show Rule Details
```javascript
mcp_sonarqube_show_rule({
  key: "javascript:S1541" // Cognitive Complexity rule
})
```
**Use:** AI learns how to fix specific issues

### 4. Search Issues
```javascript
mcp_sonarqube_search_sonar_issues_in_projects({
  projects: ["sonar-brettmiller_sonar-demo-microservices"]
})
```
**Use:** AI identifies existing problems to avoid

---

## ✅ What AI Will Automatically Do

When you ask for new code, AI will:

### 1. Pre-Generation Checks
- 📊 Query current quality gate status
- 📈 Check existing code metrics
- 🎓 Query Context7 for best practices

### 2. Code Generation
- ✅ Keep functions ≤20 lines
- ✅ Cognitive complexity ≤15
- ✅ No magic numbers (use constants)
- ✅ Input validation
- ✅ Error handling (try/catch)
- ✅ Parameterized database queries
- ✅ No hardcoded secrets

### 3. Test Generation
- ✅ Happy path tests
- ✅ Error case tests
- ✅ Edge case tests
- ✅ Aim for ≥80% coverage

### 4. Validation
- ✅ Run tests locally
- ✅ Check coverage report
- ✅ Query SonarQube for validation
- ✅ Fix any issues before presenting

---

## 🎨 Example Prompts That Work Well

### ✅ Good Prompts (Specific + Context)
```
"Add a secure password reset endpoint with token expiration"
"Create a user authentication middleware with JWT validation"
"Add pagination to the users endpoint with proper error handling"
"Implement file upload with type and size validation"
```

### ❌ Avoid (Too Vague)
```
"Add a reset feature"
"Make it secure"
"Add tests"
```

---

## 📊 How to Verify Quality

### Local Testing
```bash
# Backend
cd backend && npm test -- --coverage

# Frontend  
cd frontend && npm test -- --coverage --watchAll=false

# Python
cd python-service && pytest --cov=. tests/
```

**Target:** All tests pass + coverage ≥80%

### SonarQube Analysis
```bash
# Run SonarQube scan
sonar-scanner

# Or let CI/CD do it on push
git push origin feature-branch
```

**Target:** Quality gate passes ✅

---

## 🔍 Common Quality Gate Failures (And How AI Prevents Them)

### 1. Coverage Too Low (<80%)
**AI Prevention:**
- Generates tests alongside implementation
- Tests all branches (if/else, switch)
- Tests error cases
- Tests edge cases (null, undefined, empty)

### 2. Code Smells (Maintainability)
**AI Prevention:**
- Keeps functions ≤20 lines
- Extracts helper functions
- Uses early returns (no deep nesting)
- Named constants (no magic numbers)

### 3. Security Issues
**AI Prevention:**
- Validates all inputs
- Uses parameterized queries
- Environment variables for secrets
- Avoids eval(), exec(), Function()

### 4. Bugs (Reliability)
**AI Prevention:**
- try/catch for operations that can fail
- Null checks and optional chaining
- Validates function inputs
- Meaningful error messages

---

## 🎓 Learning Resources

### In This Repo
1. **AI-WORKFLOW-EXAMPLE.md** - Complete real-world example
2. **.cursor/rules/ai-sonarqube-workflow.mdc** - Detailed workflow
3. **.cursor/rules/** - All quality standards

### SonarQube Resources
- [SonarQube Rules](https://rules.sonarsource.com/)
- [Quality Gates Documentation](https://docs.sonarqube.org/latest/user-guide/quality-gates/)

### Ask Context7
```
"SonarQube best practices for [your language]"
"How to avoid cognitive complexity in [scenario]"
"Test coverage strategies for [framework]"
```

---

## 🚨 Troubleshooting

### "Quality gate still failing after AI generation"

1. **Check which condition failed:**
   ```javascript
   mcp_sonarqube_get_project_quality_gate_status({
     projectKey: "sonar-brettmiller_sonar-demo-microservices"
   })
   ```

2. **Get specific metrics:**
   ```javascript
   mcp_sonarqube_get_component_measures({
     component: "project:your-file.js",
     metricKeys: ["new_coverage", "new_code_smells", "cognitive_complexity"]
   })
   ```

3. **Ask AI to fix:**
   ```
   "The quality gate is failing on coverage. Please add tests to reach 80%."
   ```

### "AI didn't generate tests"

This shouldn't happen with the rules in place, but if it does:
```
"Please generate comprehensive unit tests for the code you just created,
covering happy path, error cases, and edge cases to achieve ≥80% coverage."
```

### "Code smells detected after generation"

Ask AI:
```
"SonarQube detected code smells in [file]. Please refactor to fix them."
```

AI will query the specific issues and refactor.

---

## ✨ Pro Tips

### 1. Review Before Committing
Even though AI generates quality code, always:
- Read the generated code
- Understand what it does
- Run tests locally
- Check coverage report

### 2. Iterate in Small Chunks
Instead of:
```
"Add complete user management system"
```

Do:
```
"Add user registration endpoint"
"Add user login endpoint"  
"Add user profile update endpoint"
```

### 3. Use Context7 for Complex Scenarios
Before asking AI to generate:
```
Query Context7: "Best practices for [complex scenario] with SonarQube"
Then: "Implement [feature] following the patterns from Context7"
```

### 4. Learn from AI's Code
AI generates quality code - study the patterns:
- How it structures functions
- How it handles errors
- How it writes tests
- How it validates inputs

Then apply these patterns manually when needed.

---

## 🎯 Success Metrics

Track your progress:

```
Week 1:
- Quality gate pass rate: 50% → 90%
- Time to fix issues: 1 hour → 10 minutes
- Test coverage: 65% → 85%

Week 2:
- Quality gate pass rate: 90% → 100% ✅
- Time to fix issues: 10 minutes → 0 minutes ✅
- Test coverage: 85% → 95% ✅
```

**Goal:** First-time quality gate pass rate = 100%

---

## 🚀 Ready to Start!

1. ✅ Rules are configured in `.cursor/rules/`
2. ✅ SonarQube MCP server is connected
3. ✅ Context7 is available
4. ✅ You know the workflow

**Just ask AI to generate code, and quality gates will pass!** 🎉

---

## 📞 Support

**Questions about:**
- **Quality gates:** See `.cursor/rules/sonarqube-qg.mdc`
- **Workflow:** See `AI-WORKFLOW-EXAMPLE.md`
- **Specific rules:** See `.cursor/rules/[topic].mdc`

**Still stuck?** Ask AI:
```
"Why is the quality gate failing and how do I fix it?"
```

AI has full access to SonarQube metrics and can diagnose + fix issues. ✨
