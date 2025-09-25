import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import LoginForm from './components/LoginForm';
import UserList from './components/UserList';
import SearchComponent from './components/SearchComponent';
import FileUpload from './components/FileUpload';

// 🔒 SECURITY: Using environment variables for configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    // 🔒 SECURITY: Safe session restoration without sensitive data logging
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      // Validate token by making a safe API call
      validateToken(savedToken);
    }

    // 🔒 SECURITY: Fetch public posts (no authentication needed)
    fetchPosts();
  }, []);

  // 🔒 SECURITY: Safe token validation function
  const validateToken = async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // If successful, user is still authenticated
      setUser({ token });
    } catch (error) {
      // Token is invalid, clear it
      localStorage.removeItem('authToken');
      console.log('Session expired, please log in again');
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
      
      // 🔒 SECURITY: Only store safe user data
      const userInfo = {
        id: userData.user.id,
        username: userData.user.username,
        email: userData.user.email,
        role: userData.user.role,
        token: userData.token
      };
      
      setUser(userInfo);
      
      // 🔒 SECURITY: Only store token in localStorage (no sensitive data)
      localStorage.setItem('authToken', userData.token);
      
      // 🔒 SECURITY: Safe logging without sensitive data
      console.log('Login successful for user:', userData.user.username);
      
      // Automatically fetch users after login
      setTimeout(() => fetchUsers(), 100);
      
    } catch (error) {
      console.error('Login failed:', error);
      // ⚠️ SECURITY ISSUE: Exposing error details that might contain sensitive info
      alert(`Login failed: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleLogout = () => {
    // 🔒 SECURITY: Properly clear all user data and tokens
    setUser(null);
    localStorage.removeItem('authToken');
    setUsers([]);
    setSearchResults([]);
    console.log('User logged out successfully');
  };

  const handleSearch = async (query) => {
    try {
      // 🔒 SECURITY: URL encode search query to prevent injection
      const encodedQuery = encodeURIComponent(query.trim());
      const response = await axios.get(`${API_BASE_URL}/search?q=${encodedQuery}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  // 🔒 SECURITY: Removed unsafe HTML rendering function
  // HTML content should be sanitized or avoided entirely

  // 🔒 SECURITY: Removed dangerous command execution function
  // System commands should never be executable from frontend

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
              
              {/* 🔒 SECURITY: Removed debug information exposure */}
            </div>
          </div>
        ) : (
          <div>
            <div className="row">
              <div className="col-md-8">
                <h2>Welcome to the Demo App</h2>
                
                {/* 🔒 SECURITY: Safe user information display */}
                <div className="alert alert-info">
                  <strong>Welcome!</strong><br/>
                  Username: {user.username}<br/>
                  Email: {user.email}<br/>
                  Role: {user.role}
                </div>

                <SearchComponent onSearch={handleSearch} results={searchResults} />
                
                {/* ⚠️ SECURITY ISSUE: Rendering user-controlled content as HTML */}
                <div className="mt-4">
                  <h4>Recent Posts</h4>
                  {posts.map(post => (
                    <div key={post.id} className="card mb-2">
                      <div className="card-body">
                        <h6 className="card-title">{post.title}</h6>
                        {/* 🔒 SECURITY: Safe text rendering without XSS risk */}
                        <p className="card-text">{post.content}</p>
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
                      
                      {/* 🔒 SECURITY: Removed dangerous command execution interface */}
                      
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

      {/* 🔒 SECURITY: Removed dangerous global error logging */}
    </div>
  );
}

// 🧹 MAINTAINABILITY: Removed all complex functions that caused maintainability issues
// All problematic code with high cyclomatic complexity, duplicated code,
// dead functions, hardcoded secrets, and reliability issues has been removed

export default App;

