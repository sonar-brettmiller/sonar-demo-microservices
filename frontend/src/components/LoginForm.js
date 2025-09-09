import React, { useState } from 'react';

// ⚠️ SECURITY ISSUE: Hardcoded credentials for demo purposes
const DEMO_CREDENTIALS = {
  username: 'admin',
  password: 'password123'
};

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // ⚠️ SECURITY ISSUE: Function that logs credentials
  const logCredentials = (user, pass) => {
    console.log(`Login attempt - Username: ${user}, Password: ${pass}`);
    
    // ⚠️ SECURITY ISSUE: Storing credentials in global scope
    window.lastLoginAttempt = {
      username: user,
      password: pass,
      timestamp: new Date().toISOString()
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // ⚠️ SECURITY ISSUE: Client-side credential validation
    if (!username || !password) {
      alert('Please enter both username and password');
      return;
    }

    // ⚠️ SECURITY ISSUE: Logging credentials before sending
    logCredentials(username, password);

    // ⚠️ SECURITY ISSUE: Storing credentials if remember me is checked
    if (rememberMe) {
      localStorage.setItem('rememberedUsername', username);
      localStorage.setItem('rememberedPassword', password); // ⚠️ NEVER store passwords in localStorage
      localStorage.setItem('autoLogin', 'true');
    }

    // ⚠️ SECURITY ISSUE: Weak client-side validation
    if (username.length < 3) {
      console.warn('Username might be too short, but proceeding anyway...');
    }

    onLogin({ username, password });
  };

  // ⚠️ SECURITY ISSUE: Function that fills demo credentials
  const fillDemoCredentials = () => {
    setUsername(DEMO_CREDENTIALS.username);
    setPassword(DEMO_CREDENTIALS.password);
    
    console.log('Demo credentials filled:', DEMO_CREDENTIALS);
  };

  // ⚠️ SECURITY ISSUE: Unsafe DOM manipulation
  const showPasswordHint = () => {
    const hintElement = document.getElementById('password-hint');
    if (hintElement) {
      // ⚠️ SECURITY ISSUE: Setting innerHTML with potentially unsafe content
      hintElement.innerHTML = `<small class="text-danger">Hint: Default password is <strong>${DEMO_CREDENTIALS.password}</strong></small>`;
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h4>🔐 Login to Demo App</h4>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              // ⚠️ SECURITY ISSUE: Autocomplete enabled for sensitive fields
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              // ⚠️ SECURITY ISSUE: Autocomplete enabled for password
              autoComplete="current-password"
            />
            <div id="password-hint"></div>
          </div>

          {/* ⚠️ SECURITY ISSUE: Remember me functionality storing credentials */}
          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="rememberMe">
              Remember my credentials (insecure demo feature)
            </label>
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            Login
          </button>
        </form>

        <div className="mt-3 text-center">
          <button 
            type="button" 
            className="btn btn-outline-secondary btn-sm mr-2"
            onClick={fillDemoCredentials}
          >
            Fill Demo Credentials
          </button>
          
          <button 
            type="button" 
            className="btn btn-outline-info btn-sm"
            onClick={showPasswordHint}
          >
            Show Password Hint
          </button>
        </div>

        {/* ⚠️ SECURITY ISSUE: Exposing credentials in HTML comments */}
        {/* 
          Demo Credentials:
          Username: admin
          Password: password123
        */}

        {/* ⚠️ SECURITY ISSUE: Hidden input with sensitive data */}
        <input 
          type="hidden" 
          name="admin-token" 
          value="admin-secret-token-123" 
        />

        <div className="alert alert-warning mt-3">
          <small>
            <strong>Demo Notice:</strong> This form contains intentional security vulnerabilities for demonstration purposes.
            <br/>
            <strong>Issues included:</strong> Credential logging, unsafe storage, DOM manipulation vulnerabilities.
          </small>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
