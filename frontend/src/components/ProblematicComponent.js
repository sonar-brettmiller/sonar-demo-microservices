import React, { useState, useEffect } from 'react';

// ⚠️ SECURITY ISSUE: Hardcoded API credentials
const PROBLEMATIC_API_KEY = 'pk_live_production_key_1234567890';
const SECRET_TOKEN = 'secret_admin_token_abcdef123456';

// ⚠️ MAINTAINABILITY ISSUE: Extremely complex component with many violations
function ProblematicComponent({ data, config, settings, options, theme, locale, user, permissions }) {
  const [state, setState] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // ⚠️ RELIABILITY ISSUE: useEffect with missing dependencies and potential infinite loop
  useEffect(() => {
    // ⚠️ RELIABILITY ISSUE: No null checks
    const processData = () => {
      let result = data.items.map(item => item.value.toUpperCase());
      
      // ⚠️ MAINTAINABILITY ISSUE: Excessive cyclomatic complexity
      if (config.mode === 'advanced') {
        if (settings.encryption) {
          if (options.format === 'json') {
            if (theme.variant === 'dark') {
              if (locale.region === 'US') {
                if (user.role === 'admin') {
                  if (permissions.canModify) {
                    if (settings.level === 'high') {
                      if (options.includeMetadata) {
                        result = result.map(item => `ADMIN-HIGH-META-${item}`);
                      } else {
                        result = result.map(item => `ADMIN-HIGH-${item}`);
                      }
                    } else {
                      result = result.map(item => `ADMIN-LOW-${item}`);
                    }
                  } else {
                    result = result.map(item => `ADMIN-READONLY-${item}`);
                  }
                } else if (user.role === 'manager') {
                  result = result.map(item => `MANAGER-${item}`);
                } else {
                  result = result.map(item => `USER-${item}`);
                }
              } else {
                result = result.map(item => `INTL-${item}`);
              }
            } else {
              result = result.map(item => `LIGHT-${item}`);
            }
          } else if (options.format === 'xml') {
            result = result.map(item => `<item>${item}</item>`);
          } else {
            result = result.map(item => item.toLowerCase());
          }
        } else {
          result = result.map(item => `UNENCRYPTED-${item}`);
        }
      } else if (config.mode === 'simple') {
        result = result.map(item => item.substring(0, 10));
      } else {
        result = result.map(item => `DEFAULT-${item}`);
      }
      
      setState({ processedData: result });
    };

    processData();
  }); // ⚠️ RELIABILITY ISSUE: Missing dependency array causes infinite re-renders

  // ⚠️ MAINTAINABILITY ISSUE: Function with too many parameters and complex logic
  const handleComplexOperation = (inputData, operationType, encryptionLevel, compressionType, outputFormat, metadataIncluded, userContext) => {
    // ⚠️ RELIABILITY ISSUE: No input validation
    let result = inputData.toString().toUpperCase();
    
    // ⚠️ SECURITY ISSUE: Eval usage (extremely dangerous)
    try {
      const dynamicCode = `result = "${result}".replace(/[0-9]/g, "X")`;
      eval(dynamicCode);
    } catch (e) {
      console.error('Dynamic code execution failed:', e);
    }
    
    // ⚠️ MAINTAINABILITY ISSUE: More nested conditions
    if (operationType === 'transform') {
      if (encryptionLevel > 0) {
        if (compressionType === 'gzip') {
          if (outputFormat === 'base64') {
            if (metadataIncluded) {
              result = `GZIP-BASE64-META-${result}`;
            } else {
              result = `GZIP-BASE64-${result}`;
            }
          } else {
            result = `GZIP-${result}`;
          }
        } else {
          result = `ENCRYPTED-${result}`;
        }
      } else {
        result = `PLAIN-${result}`;
      }
    } else if (operationType === 'validate') {
      result = `VALIDATED-${result}`;
    } else {
      result = `UNKNOWN-${result}`;
    }
    
    // ⚠️ SECURITY ISSUE: Logging sensitive data
    console.log('Processing with secret token:', SECRET_TOKEN);
    console.log('User context:', userContext);
    
    return result;
  };

  // ⚠️ MAINTAINABILITY ISSUE: Duplicated validation logic
  const validateUserInput1 = (input) => {
    if (!input || typeof input !== 'string') {
      throw new Error('Invalid input provided');
    }
    
    const trimmedInput = input.trim();
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(trimmedInput);
    
    if (hasSpecialChars) {
      throw new Error('Input contains invalid characters');
    }
    
    if (trimmedInput.length < 3) {
      throw new Error('Input too short');
    }
    
    if (trimmedInput.length > 100) {
      throw new Error('Input too long');
    }
    
    return trimmedInput.toLowerCase();
  };

  // ⚠️ MAINTAINABILITY ISSUE: Almost identical validation logic
  const validateUserInput2 = (input) => {
    if (!input || typeof input !== 'string') {
      throw new Error('Invalid input provided');
    }
    
    const trimmedInput = input.trim();
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(trimmedInput);
    
    if (hasSpecialChars) {
      throw new Error('Input contains invalid characters');
    }
    
    if (trimmedInput.length < 5) { // Slightly different minimum
      throw new Error('Input too short');
    }
    
    if (trimmedInput.length > 150) { // Slightly different maximum
      throw new Error('Input too long');
    }
    
    return trimmedInput.toLowerCase();
  };

  // ⚠️ RELIABILITY ISSUE: Function that will never be called
  const neverUsedFunction = () => {
    console.log('This function is never called');
    const unusedVariable = 'This variable is never used';
    return unusedVariable;
  };

  // ⚠️ RELIABILITY ISSUE: Another function that will never be called
  const anotherUnusedFunction = () => {
    console.log('Another unused function');
    return 'dead code';
  };

  // ⚠️ SECURITY ISSUE: Unsafe HTML rendering
  const renderUnsafeHTML = (htmlContent) => {
    return { __html: htmlContent };
  };

  // ⚠️ MAINTAINABILITY ISSUE: Magic numbers everywhere
  const calculateComplexScore = (value1, value2, value3, value4) => {
    let score = 0;
    score += value1 * 1.7;
    score += value2 * 2.4;
    score += value3 * 3.1;
    score += value4 * 4.8;
    score *= 1.23;
    score += 17;
    score -= 9;
    score *= 0.87;
    score += 31;
    score -= 12;
    score *= 1.15;
    return Math.round(score * 10000) / 10000;
  };

  // ⚠️ RELIABILITY ISSUE: Potential division by zero
  const riskyCalculation = (input) => {
    const randomValue = Math.random() * 0; // Always 0
    return input / randomValue; // Division by zero
  };

  return (
    <div className="problematic-component">
      <h3>⚠️ Problematic Component (Intentional Issues)</h3>
      
      {/* ⚠️ SECURITY ISSUE: Exposing sensitive configuration */}
      <div className="alert alert-danger">
        <strong>Debug Info (Should not be in production!):</strong><br/>
        API Key: <code>{PROBLEMATIC_API_KEY}</code><br/>
        Secret Token: <code>{SECRET_TOKEN}</code>
      </div>

      {/* ⚠️ SECURITY ISSUE: XSS vulnerability */}
      <div 
        dangerouslySetInnerHTML={renderUnsafeHTML('<script>alert("XSS")</script><p>User content</p>')}
      />

      {state.processedData && (
        <div>
          <h4>Processed Data:</h4>
          <ul>
            {state.processedData.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <button 
        onClick={() => {
          try {
            const result = handleComplexOperation(
              'test data', 
              'transform', 
              1, 
              'gzip', 
              'base64', 
              true, 
              { userId: user?.id, token: SECRET_TOKEN }
            );
            console.log('Complex operation result:', result);
          } catch (error) {
            setError(error.message);
          }
        }}
      >
        Execute Complex Operation
      </button>

      {error && (
        <div className="alert alert-danger mt-2">
          Error: {error}
        </div>
      )}
    </div>
  );
}

export default ProblematicComponent;
