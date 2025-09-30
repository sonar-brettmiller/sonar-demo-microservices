import React, { useState } from 'react';

const MIN_USERNAME_LENGTH = 3;

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateInput(username, password)) {
      alert('Please enter both username and password');
      return;
    }

    onLogin({ username, password });
    clearForm();
  };

  const clearForm = () => {
    setUsername('');
    setPassword('');
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
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            Login
          </button>
        </form>

        <div className="alert alert-info mt-3">
          <small>
            <strong>Demo Notice:</strong> Use admin credentials from your backend setup.
          </small>
        </div>
      </div>
    </div>
  );
};

// Validate login input
function validateInput(username, password) {
  return username && password && username.length >= MIN_USERNAME_LENGTH;
}

export default LoginForm;