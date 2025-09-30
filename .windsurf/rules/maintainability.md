---
trigger: always_on
description:
globs:
---

# Maintainability Standards (SonarQube Rating A)

**Target:** New Maintainability Rating ≤ 1.0 (A)  
**Current Status:** ❌ FAILING (3.0 - needs A)

## Code Smells to Avoid

### Function Length
- **Limit:** 20 lines per function (soft), 50 lines (hard)
- **Fix:** Extract helper functions for complex logic
- **Example:**
```javascript
// ❌ BAD: 35-line function
function processUserData(user) {
  // ... 35 lines of validation, transformation, API calls
}

// ✅ GOOD: Split into focused functions
function processUserData(user) {
  const validated = validateUser(user);
  const transformed = transformUserData(validated);
  return saveToAPI(transformed);
}
```

### Cyclomatic Complexity
- **Limit:** ≤ 10 per function
- **Fix:** Reduce nested if/else, extract decision logic
- **Example:**
```javascript
// ❌ BAD: Complexity = 12
function getDiscount(user, cart) {
  if (user.isPremium) {
    if (cart.total > 100) {
      if (user.loyaltyPoints > 500) {
        // ... 3 more nested levels
      }
    }
  }
}

// ✅ GOOD: Use early returns, guard clauses
function getDiscount(user, cart) {
  if (!user.isPremium) return 0;
  if (cart.total < 100) return 0;
  if (user.loyaltyPoints < 500) return 0.05;
  return calculateTieredDiscount(user.loyaltyPoints);
}
```

### Nesting Depth
- **Limit:** ≤ 3 levels of nesting
- **Fix:** Use early returns, extract functions

### Magic Numbers
- **Fix:** Use named constants
```javascript
// ❌ BAD
if (age > 18 && score >= 75) { }

// ✅ GOOD
const MIN_ADULT_AGE = 18;
const PASSING_SCORE = 75;
if (age > MIN_ADULT_AGE && score >= PASSING_SCORE) { }
```

### Meaningful Names
- **Rule:** No single-letter variables (except `i`, `j`, `k` in loops)
- **Rule:** Function names should be verbs, variables should be nouns
```javascript
// ❌ BAD
function p(u) { return u.n; }

// ✅ GOOD
function getUserName(user) { return user.name; }
```

## Anti-Patterns to Refactor

### Commented-Out Code
- **Rule:** Delete it or convert to TODO with tracking issue
```javascript
// ❌ BAD
// function oldImplementation() { ... }

// ✅ GOOD (if truly needed)
// TODO(#123): Restore feature X after API migration
```

### Duplicated Code
- **Rule:** If code appears >2 times, extract to utility
- **Locations:**
  - Backend: `backend/utils/`
  - Frontend: `frontend/src/utils/`
  - Python: `python-service/utils.py`

### Mutable State
- **Prefer:** Immutability and pure functions
```javascript
// ❌ BAD
function addItem(cart, item) {
  cart.items.push(item); // mutation
  return cart;
}

// ✅ GOOD
function addItem(cart, item) {
  return { ...cart, items: [...cart.items, item] };
}
```

## AI Workflow

### Before Presenting Code:
1. ✅ Check function length (≤20 lines ideal)
2. ✅ Verify complexity (no deeply nested conditionals)
3. ✅ Replace magic numbers with constants
4. ✅ Ensure meaningful variable names
5. ✅ Extract duplicated logic

### If Code Smells Detected:
- **Auto-refactor** before showing to user
- **Suggest** utility extraction for shared logic
- **Explain** why refactoring improves maintainability