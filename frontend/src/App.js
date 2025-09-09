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

export default App;
