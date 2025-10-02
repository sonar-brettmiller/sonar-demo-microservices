---
trigger: always_on
description:
globs:
---

# SonarQube Quality Gate Rules

When working on this codebase, you MUST ensure all code changes meet or exceed the following SonarQube quality gate standards:

## 🎯 Quality Gate Thresholds (All Must Pass)

### New Code Requirements
- **New Reliability Rating**: Must be A (≤ 1.0) - No bugs in new code
- **New Security Rating**: Must be A (≤ 1.0) - No vulnerabilities in new code  
- **New Maintainability Rating**: Must be A (≤ 1.0) - No code smells in new code
- **New Code Coverage**: Must be ≥ 80% - Ensure comprehensive test coverage
- **New Duplicated Lines**: Must be ≤ 3% - Minimize code duplication
- **New Security Hotspots Reviewed**: Must be 100% - All security hotspots addressed

## 📋 Code Quality Requirements

### When Writing Code:
1. **Zero Tolerance Policy**: Do not introduce any new bugs, vulnerabilities, or critical code smells
2. **Test Coverage**: Every new function/method must have corresponding tests to achieve ≥80% coverage
3. **Code Duplication**: Refactor any duplicated code blocks. If duplication is necessary, it must be well-documented
4. **Security**: Address all security hotspots immediately. Never ignore security warnings
5. **Maintainability**: Write clean, readable code that follows established patterns and conventions

### Before Submitting Changes:
1. Run local SonarQube analysis to verify quality gate compliance
2. Ensure all new code is covered by tests
3. Verify no new bugs, vulnerabilities, or code smells are introduced
4. Address any security hotspots identified
5. Refactor duplicated code where possible

### Current Project Status:
- ❌ **New Maintainability Rating**: Currently C (3.0) - needs improvement to A (1.0)
- ❌ **New Coverage**: Currently 75% - needs to reach 80%
- ✅ **Other metrics**: Currently passing

## 🚫 Prohibited Actions:
- Committing code that fails any quality gate condition
- Ignoring or suppressing SonarQube issues without proper justification
- Writing untested code that reduces coverage below 80%
- Introducing duplicate code without refactoring existing instances
- Leaving security hotspots unreviewed

## ✅ Required Actions:
- Write comprehensive unit tests for all new functionality
- Follow secure coding practices
- Refactor code smells and maintain clean code principles
- Document any necessary technical debt with tracking issues
- Ensure all commits pass the complete quality gate before merging

**Remember**: The quality gate exists to maintain code quality, security, and maintainability. These standards are non-negotiable for production code.
