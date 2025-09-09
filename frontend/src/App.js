import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import LoginForm from './components/LoginForm';
import UserList from './components/UserList';
import SearchComponent from './components/SearchComponent';
import FileUpload from './components/FileUpload';

// ⚠️ SECURITY ISSUE: Hardcoded sensitive configuration
const API_BASE_URL = 'http://localhost:5000/api';
const ADMIN_SECRET = 'admin-secret-key-123';
const JWT_SECRET = 'hardcoded-secret-key-123!';

function App() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    // ⚠️ SECURITY ISSUE: Loading sensitive debug information on startup
    fetchDebugInfo();
    
    // ⚠️ SECURITY ISSUE: Storing sensitive data in localStorage
    const savedCredentials = localStorage.getItem('userCredentials');
    if (savedCredentials) {
      const creds = JSON.parse(savedCredentials);
      console.log('Loaded saved credentials:', creds);
      setUser(creds);
    }

    // ⚠️ SECURITY ISSUE: Fetching all posts without authentication
    fetchPosts();
  }, []);

  // ⚠️ SECURITY ISSUE: Function that exposes debug endpoint
  const fetchDebugInfo = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/debug`);
      setDebugInfo(response.data);
      
      // ⚠️ SECURITY ISSUE: Logging sensitive debug information
      console.log('Debug Info:', response.data);
      console.log('Environment Variables:', response.data.environment);
      console.log('Secrets:', response.data.secrets);
    } catch (error) {
      console.error('Failed to fetch debug info:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/posts`);
      setPosts(response.data);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  };

  const fetchUsers = async () => {
    if (!user || !user.token) {
      console.log('No authentication token available');
      return;
    }

    try {
      // ⚠️ SECURITY ISSUE: Using token without proper validation
      const response = await axios.get(`${API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleLogin = async (credentials) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, credentials);
      const userData = response.data;
      
      // ⚠️ SECURITY ISSUE: Storing sensitive user data including API keys
      const userInfo = {
        ...userData.user,
        token: userData.token,
        credentials: credentials // ⚠️ SECURITY ISSUE: Storing plain text password
      };
      
      setUser(userInfo);
      
      // ⚠️ SECURITY ISSUE: Storing sensitive data in localStorage
      localStorage.setItem('userCredentials', JSON.stringify(userInfo));
      localStorage.setItem('authToken', userData.token);
      localStorage.setItem('apiKey', userData.user.apiKey);
      
      // ⚠️ SECURITY ISSUE: Console logging sensitive authentication data
      console.log('Login successful:', userInfo);
      console.log('Token:', userData.token);
      console.log('API Key:', userData.user.apiKey);
      
      // Automatically fetch users after login
      setTimeout(() => fetchUsers(), 100);
      
    } catch (error) {
      console.error('Login failed:', error);
      // ⚠️ SECURITY ISSUE: Exposing error details that might contain sensitive info
      alert(`Login failed: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleLogout = () => {
    // ⚠️ SECURITY ISSUE: Not properly clearing all sensitive data
    setUser(null);
    localStorage.removeItem('userCredentials');
    // Missing: localStorage.removeItem('authToken'), localStorage.removeItem('apiKey')
  };

  const handleSearch = async (query) => {
    try {
      // ⚠️ SECURITY ISSUE: Search without input sanitization
      const response = await axios.get(`${API_BASE_URL}/search?q=${query}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  // ⚠️ SECURITY ISSUE: Unsafe rendering of HTML content
  const renderUserHTML = (htmlContent) => {
    return { __html: htmlContent };
  };

  // ⚠️ SECURITY ISSUE: Function that executes system commands
  const executeCommand = async (command) => {
    if (!user || user.role !== 'admin') {
      console.log('Admin access required');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/exec`, 
        { command },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      console.log('Command executed:', response.data);
      alert(`Command output: ${response.data.output}`);
    } catch (error) {
      console.error('Command execution failed:', error);
    }
  };

  // ⚠️ SECURITY ISSUE: Weak client-side authorization check
  const isAdmin = () => {
    return user && (user.role === 'admin' || user.username === 'admin');
  };

  return (
    <div className="App">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <a className="navbar-brand" href="/">
            🔍 SonarSource Security Demo
          </a>
          <div className="navbar-nav ml-auto">
            {user ? (
              <div className="d-flex align-items-center">
                <span className="text-light mr-3">
                  Welcome, {user.username}
                  {/* ⚠️ SECURITY ISSUE: Exposing role information in UI */}
                  {isAdmin() && <span className="badge badge-danger ml-2">ADMIN</span>}
                </span>
                <button className="btn btn-outline-light" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <span className="text-light">Please log in</span>
            )}
          </div>
        </div>
      </nav>

      <div className="container mt-4">
        {!user ? (
          <div className="row justify-content-center">
            <div className="col-md-6">
              <LoginForm onLogin={handleLogin} />
              
              {/* ⚠️ SECURITY ISSUE: Exposing debug information in UI */}
              {debugInfo.secrets && (
                <div className="alert alert-warning mt-3">
                  <h6>Debug Info (Remove in production!):</h6>
                  <small>JWT Secret: {debugInfo.secrets.jwtSecret}</small><br/>
                  <small>API Key: {debugInfo.secrets.apiKey}</small>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="row">
              <div className="col-md-8">
                <h2>Welcome to the Demo App</h2>
                
                {/* ⚠️ SECURITY ISSUE: Displaying sensitive user information */}
                <div className="alert alert-info">
                  <strong>User Info:</strong><br/>
                  Username: {user.username}<br/>
                  Email: {user.email}<br/>
                  Role: {user.role}<br/>
                  API Key: <code>{user.apiKey}</code><br/>
                  Token: <code>{user.token?.substring(0, 50)}...</code>
                </div>

                <SearchComponent onSearch={handleSearch} results={searchResults} />
                
                {/* ⚠️ SECURITY ISSUE: Rendering user-controlled content as HTML */}
                <div className="mt-4">
                  <h4>Recent Posts</h4>
                  {posts.map(post => (
                    <div key={post.id} className="card mb-2">
                      <div className="card-body">
                        <h6 className="card-title">{post.title}</h6>
                        {/* ⚠️ SECURITY ISSUE: XSS vulnerability - dangerouslySetInnerHTML */}
                        <div dangerouslySetInnerHTML={renderUserHTML(post.content)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="col-md-4">
                {isAdmin() && (
                  <div className="card">
                    <div className="card-header bg-danger text-white">
                      <h6>🚨 Admin Panel</h6>
                    </div>
                    <div className="card-body">
                      <button 
                        className="btn btn-primary btn-block mb-2" 
                        onClick={fetchUsers}
                      >
                        Load All Users
                      </button>
                      
                      {/* ⚠️ SECURITY ISSUE: Command execution interface */}
                      <div className="form-group">
                        <label>Execute System Command:</label>
                        <input 
                          type="text" 
                          className="form-control mb-2"
                          placeholder="ls -la"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              executeCommand(e.target.value);
                            }
                          }}
                        />
                      </div>
                      
                      <FileUpload user={user} />
                    </div>
                  </div>
                )}
                
                <UserList users={users} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ⚠️ SECURITY ISSUE: Global error logging */}
      <script>
        {`
          window.addEventListener('error', function(e) {
            console.log('Global error:', e.error);
            console.log('Stack:', e.error.stack);
            console.log('User context:', ${JSON.stringify(user)});
          });
        `}
      </script>
    </div>
  );
}

// ⚠️ MAINTAINABILITY ISSUE: Extremely complex function with too many parameters
function processUserDataWithComplexLogic(userData, options, config, metadata, context, settings, flags, preferences, theme, locale, permissions) {
  // ⚠️ RELIABILITY ISSUE: No null checks
  let result = userData.profile.name.toUpperCase();
  
  // ⚠️ MAINTAINABILITY ISSUE: Excessive cyclomatic complexity
  if (options.displayFormat === 'detailed') {
    if (config.showPersonalInfo) {
      if (metadata.version >= 2.0) {
        if (context.environment === 'production') {
          if (settings.privacyLevel === 'high') {
            if (flags.encryptSensitiveData) {
              if (userData.role === 'admin') {
                if (options.includeSystemInfo) {
                  if (preferences.darkMode) {
                    if (theme.variant === 'corporate') {
                      if (locale.country === 'US') {
                        if (permissions.viewAll) {
                          result = `ADMIN-FULL-${result}-ENCRYPTED-${Date.now()}`;
                        } else {
                          result = `ADMIN-LIMITED-${result}-ENCRYPTED`;
                        }
                      } else {
                        result = `ADMIN-INTL-${result}-ENCRYPTED`;
                      }
                    } else {
                      result = `ADMIN-CASUAL-${result}-ENCRYPTED`;
                    }
                  } else {
                    result = `ADMIN-LIGHT-${result}-ENCRYPTED`;
                  }
                } else {
                  result = `ADMIN-BASIC-${result}-ENCRYPTED`;
                }
              } else if (userData.role === 'moderator') {
                if (options.includeSystemInfo) {
                  result = `MOD-SYSTEM-${result}-ENCRYPTED`;
                } else {
                  result = `MOD-${result}-ENCRYPTED`;
                }
              } else {
                result = `USER-${result}-ENCRYPTED`;
              }
            } else {
              result = `SECURE-${result}`;
            }
          } else if (settings.privacyLevel === 'medium') {
            result = `MEDIUM-${result}`;
          } else {
            result = `LOW-${result}`;
          }
        } else if (context.environment === 'staging') {
          result = `STAGING-${result}`;
        } else {
          result = `DEV-${result}`;
        }
      } else {
        result = `V1-${result}`;
      }
    } else {
      result = `PUBLIC-${result}`;
    }
  } else if (options.displayFormat === 'compact') {
    result = result.substring(0, 10);
  } else if (options.displayFormat === 'minimal') {
    result = result.substring(0, 5);
  } else {
    result = result.toLowerCase();
  }
  
  // ⚠️ SECURITY ISSUE: More hardcoded secrets
  const CLIENT_SECRET = 'client-secret-abc123';
  const ENCRYPTION_SALT = 'salt-xyz789-production';
  
  // ⚠️ RELIABILITY ISSUE: Potential division by zero
  const randomValue = Math.random() * 0;
  const calculatedRisk = 100 / randomValue;
  
  return result + calculatedRisk;
}

// ⚠️ MAINTAINABILITY ISSUE: Duplicated code block 1
function formatUserDisplayName(user, showTitle, showEmail, showRole) {
  // ⚠️ RELIABILITY ISSUE: No null/undefined checks
  let displayName = user.firstName + ' ' + user.lastName;
  
  if (showTitle && user.title) {
    displayName = user.title + ' ' + displayName;
  }
  
  if (showEmail && user.email) {
    displayName += ' (' + user.email + ')';
  }
  
  if (showRole && user.role) {
    displayName += ' [' + user.role.toUpperCase() + ']';
  }
  
  // ⚠️ MAINTAINABILITY ISSUE: Magic numbers
  if (displayName.length > 50) {
    displayName = displayName.substring(0, 47) + '...';
  }
  
  return displayName;
}

// ⚠️ MAINTAINABILITY ISSUE: Duplicated code block 2 (almost identical)
function formatUserFullName(user, includeTitle, includeEmail, includeRole) {
  // ⚠️ RELIABILITY ISSUE: No null/undefined checks
  let fullName = user.firstName + ' ' + user.lastName;
  
  if (includeTitle && user.title) {
    fullName = user.title + ' ' + fullName;
  }
  
  if (includeEmail && user.email) {
    fullName += ' (' + user.email + ')';
  }
  
  if (includeRole && user.role) {
    fullName += ' [' + user.role.toUpperCase() + ']';
  }
  
  // ⚠️ MAINTAINABILITY ISSUE: Magic numbers (slightly different from above)
  if (fullName.length > 55) {
    fullName = fullName.substring(0, 52) + '...';
  }
  
  return fullName;
}

// ⚠️ MAINTAINABILITY ISSUE: Function with too many responsibilities
function generateUserProfileReport(userId, includePersonal, includePreferences, includeActivity, includePermissions, format, compression, encryption) {
  let report = '';
  let userProfile = null;
  let userPreferences = null;
  let userActivity = null;
  let userPermissions = null;
  
  // ⚠️ RELIABILITY ISSUE: Multiple potential null pointer exceptions
  if (includePersonal) {
    userProfile = getUserProfile(userId);
    report += `Full Name: ${userProfile.firstName} ${userProfile.lastName}\n`;
    report += `Username: ${userProfile.username}\n`;
    report += `Email: ${userProfile.email}\n`;
    report += `Phone: ${userProfile.phoneNumber}\n`;
    report += `Birthday: ${userProfile.dateOfBirth}\n`;
    report += `Address: ${userProfile.address.street}\n`;
    report += `City: ${userProfile.address.city}\n`;
    report += `State: ${userProfile.address.state}\n`;
    report += `ZIP: ${userProfile.address.zipCode}\n`;
    report += `Country: ${userProfile.address.country}\n`;
  }
  
  if (includePreferences) {
    userPreferences = getUserPreferences(userId);
    report += `Theme: ${userPreferences.theme}\n`;
    report += `Language: ${userPreferences.language}\n`;
    report += `Timezone: ${userPreferences.timezone}\n`;
    report += `Notifications: ${userPreferences.notifications.email ? 'Email' : 'None'}\n`;
    report += `Privacy Level: ${userPreferences.privacy.level}\n`;
  }
  
  if (includeActivity) {
    userActivity = getUserActivity(userId);
    report += `Last Login: ${userActivity.lastLogin}\n`;
    report += `Login Count: ${userActivity.loginCount}\n`;
    report += `Pages Visited: ${userActivity.pageViews}\n`;
    report += `Time Spent: ${userActivity.totalTimeSpent} minutes\n`;
    report += `Actions Performed: ${userActivity.actionsCount}\n`;
  }
  
  if (includePermissions) {
    userPermissions = getUserPermissions(userId);
    report += `Role: ${userPermissions.role}\n`;
    report += `Permissions: ${userPermissions.permissions.join(', ')}\n`;
    report += `Groups: ${userPermissions.groups.join(', ')}\n`;
    report += `Access Level: ${userPermissions.accessLevel}\n`;
  }
  
  // ⚠️ MAINTAINABILITY ISSUE: Deeply nested conditions
  if (format === 'json') {
    if (encryption) {
      if (compression) {
        return compressAndEncryptJSON(report);
      } else {
        return encryptJSON(report);
      }
    } else {
      if (compression) {
        return compressJSON(report);
      } else {
        return convertToJSON(report);
      }
    }
  } else if (format === 'xml') {
    if (encryption) {
      if (compression) {
        return compressAndEncryptXML(report);
      } else {
        return encryptXML(report);
      }
    } else {
      if (compression) {
        return compressXML(report);
      } else {
        return convertToXML(report);
      }
    }
  } else if (format === 'csv') {
    if (encryption) {
      if (compression) {
        return compressAndEncryptCSV(report);
      } else {
        return encryptCSV(report);
      }
    } else {
      if (compression) {
        return compressCSV(report);
      } else {
        return convertToCSV(report);
      }
    }
  } else {
    return report;
  }
}

// ⚠️ RELIABILITY ISSUE: Dead code that will never be executed
function deadFunction1() {
  console.log('This function is never called');
  return 'unreachable code';
}

function deadFunction2() {
  console.log('Another dead function');
  return 'more unreachable code';
}

function deadFunction3() {
  console.log('Yet another dead function');
  return 'even more unreachable code';
}

// ⚠️ SECURITY ISSUE: More exposed secrets and configuration
const FRONTEND_CONFIG = {
  API_SECRET: 'frontend-api-secret-456',
  GOOGLE_ANALYTICS_ID: 'GA-REAL-TRACKING-ID',
  STRIPE_PUBLIC_KEY: 'pk_live_real_stripe_key_here',
  FIREBASE_CONFIG: {
    apiKey: 'real-firebase-api-key',
    authDomain: 'real-project.firebaseapp.com',
    projectId: 'real-project-id'
  }
};

// ⚠️ MAINTAINABILITY ISSUE: Magic numbers everywhere
function calculateUIMetrics(screenWidth, screenHeight, userAge, userExperience) {
  let score = 0;
  score += screenWidth * 0.15;
  score += screenHeight * 0.12;
  score += userAge * 2.7;
  score += userExperience * 4.3;
  score *= 1.08;
  score += 25;
  score -= 8;
  score *= 0.92;
  score += 15;
  score -= 3;
  score *= 1.05;
  return Math.round(score * 1000) / 1000;
}

export default App;
