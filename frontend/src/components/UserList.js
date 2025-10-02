import React from 'react';
import PropTypes from 'prop-types';

const UserList = ({ users = [] }) => {

  return (
    <div className="card mt-3">
      <div className="card-header bg-primary text-white">
        <h6>User Management</h6>
      </div>
      <div className="card-body">
        {users.length === 0 ? (
          <p className="text-muted">No users to display</p>
        ) : (
          <div className="list-group">
            {users.map(user => (
              <div key={user.id} className="list-group-item" data-testid={`user-card-${user.id}`}>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="mb-1">{user.username}</h6>
                    <p className="mb-1 text-muted">Email: {user.email}</p>
                    <p className="mb-1 text-muted">ID: {user.id}</p>
                    <small className="text-muted">
                      Role: <span className="badge badge-secondary">{user.role}</span>
                    </small>
                    {user.api_key && (
                      <div>
                        <small className="text-info">API Key: {user.api_key}</small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

UserList.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      username: PropTypes.string,
      email: PropTypes.string,
      role: PropTypes.string,
      api_key: PropTypes.string
    })
  )
};

export default UserList;

