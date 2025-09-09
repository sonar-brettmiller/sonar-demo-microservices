import React, { useState } from 'react';
import axios from 'axios';

const UserList = ({ users }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState({});

  // ⚠️ SECURITY ISSUE: Function that fetches user details without authentication
  const fetchUserDetails = async (userId) => {
    try {
      // ⚠️ SECURITY ISSUE: Direct API call without authentication headers
      const response = await axios.get(`http://localhost:5000/api/user/${userId}`);
      const user = response.data;
      
      // ⚠️ SECURITY ISSUE: Logging sensitive user data
      console.log('Fetched user details:', user);
      console.log('User password hash:', user.password);
      console.log('User API key:', user.api_key);
      
      setUserDetails(user);
      setSelectedUser(userId);
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      
      // ⚠️ SECURITY ISSUE: Exposing error details that might contain sensitive info
      alert(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  // ⚠️ SECURITY ISSUE: Function that attempts to modify user data
  const attemptUserModification = (userId, newRole) => {
    // ⚠️ SECURITY ISSUE: Client-side role modification attempt
    console.log(`Attempting to change user ${userId} role to ${newRole}`);
    
    // ⚠️ SECURITY ISSUE: Storing modification attempts in localStorage
    const modifications = JSON.parse(localStorage.getItem('userModifications') || '[]');
    modifications.push({
      userId,
      newRole,
      timestamp: new Date().toISOString(),
      attemptedBy: localStorage.getItem('authToken')
    });
    localStorage.setItem('userModifications', JSON.stringify(modifications));
    
    alert('Role modification attempted (this would be a security issue in real app)');
  };

  // ⚠️ SECURITY ISSUE: Unsafe HTML rendering
  const renderUserInfo = (info) => {
    // ⚠️ SECURITY ISSUE: Potential XSS if user data contains HTML
    return { __html: info };
  };

  // ⚠️ SECURITY ISSUE: Function that exposes all user data
  const exportUserData = () => {
    const userData = {
      users: users,
      selectedUserDetails: userDetails,
      exportedAt: new Date().toISOString(),
      exportedBy: localStorage.getItem('userCredentials')
    };
    
    // ⚠️ SECURITY ISSUE: Logging sensitive export data
    console.log('Exporting user data:', userData);
    
    // ⚠️ SECURITY ISSUE: Creating downloadable file with sensitive data
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'users-export.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="card mt-3">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6>👥 Users ({users.length})</h6>
        {users.length > 0 && (
          <button 
            className="btn btn-outline-secondary btn-sm"
            onClick={exportUserData}
            title="Export user data (security risk!)"
          >
            📥 Export
          </button>
        )}
      </div>
      <div className="card-body">
        {users.length === 0 ? (
          <p className="text-muted">No users loaded. Click "Load All Users" to fetch user data.</p>
        ) : (
          <div>
            <div className="list-group">
              {users.map(user => (
                <div key={user.id} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">
                        {user.username}
                        {user.role === 'admin' && 
                          <span className="badge badge-danger ml-2">ADMIN</span>
                        }
                      </h6>
                      <p className="mb-1 text-muted">{user.email}</p>
                      
                      {/* ⚠️ SECURITY ISSUE: Exposing API keys in UI */}
                      {user.api_key && (
                        <small className="text-info">
                          API Key: <code>{user.api_key}</code>
                        </small>
                      )}
                    </div>
                    
                    <div className="btn-group" role="group">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => fetchUserDetails(user.id)}
                      >
                        👁️ View
                      </button>
                      
                      {/* ⚠️ SECURITY ISSUE: Client-side admin check */}
                      {user.role !== 'admin' && (
                        <button
                          className="btn btn-outline-warning btn-sm"
                          onClick={() => attemptUserModification(user.id, 'admin')}
                        >
                          🔓 Make Admin
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ⚠️ SECURITY ISSUE: Displaying detailed user information including sensitive data */}
            {selectedUser && userDetails.id && (
              <div className="mt-3 p-3 border rounded bg-light">
                <h6>🔍 User Details (ID: {selectedUser})</h6>
                <div className="row">
                  <div className="col-md-6">
                    <strong>Username:</strong> {userDetails.username}<br/>
                    <strong>Email:</strong> {userDetails.email}<br/>
                    <strong>Role:</strong> {userDetails.role}<br/>
                    <strong>User ID:</strong> {userDetails.id}
                  </div>
                  <div className="col-md-6">
                    {/* ⚠️ SECURITY ISSUE: Displaying password hashes */}
                    <strong>Password Hash:</strong><br/>
                    <code className="small">{userDetails.password}</code><br/>
                    
                    {/* ⚠️ SECURITY ISSUE: Displaying API keys */}
                    {userDetails.api_key && (
                      <>
                        <strong>API Key:</strong><br/>
                        <code className="small">{userDetails.api_key}</code>
                      </>
                    )}
                  </div>
                </div>

                {/* ⚠️ SECURITY ISSUE: Unsafe rendering of user data */}
                {userDetails.bio && (
                  <div className="mt-2">
                    <strong>Bio:</strong>
                    <div dangerouslySetInnerHTML={renderUserInfo(userDetails.bio)} />
                  </div>
                )}

                <div className="mt-2">
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedUser(null)}
                  >
                    Close Details
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ⚠️ SECURITY ISSUE: Hidden debug information */}
        <div style={{ display: 'none' }}>
          <div id="debug-user-data">
            {JSON.stringify(users)}
          </div>
          <div id="debug-selected-user">
            {JSON.stringify(userDetails)}
          </div>
        </div>

        <div className="alert alert-warning mt-3">
          <small>
            <strong>Security Issues in this component:</strong>
            <br/>• Unauthenticated API calls • Password hash exposure • API key display
            <br/>• Unsafe HTML rendering • Sensitive data logging • Client-side authorization
          </small>
        </div>
      </div>
    </div>
  );
};

export default UserList;
