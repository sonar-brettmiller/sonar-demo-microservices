import React, { useState } from 'react';

const MAX_HISTORY_SIZE = 5;

const SearchComponent = ({ onSearch, results }) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!isValidQuery(query)) {
      alert('Please enter a search query');
      return;
    }

    onSearch(query.trim());
  };

  return (
    <div className="card">
      <div className="card-header">
        <h6>🔍 Search Users</h6>
      </div>
      <div className="card-body">
        <form onSubmit={handleSearch}>
          <div className="input-group mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search by username or email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
            />
            <div className="input-group-append">
              <button className="btn btn-primary" type="submit">
                Search
              </button>
            </div>
          </div>
        </form>

        {renderResults(results)}

        <div className="alert alert-info mt-3">
          <small>
            <strong>Search Tips:</strong> Try searching for "admin", "user", or parts of email addresses.
          </small>
        </div>
      </div>
    </div>
  );
};

// Validate search query
function isValidQuery(query) {
  return query && query.trim().length > 0;
}

// Render search results
function renderResults(results) {
  if (!results || results.length === 0) {
    return null;
  }

  return (
    <div>
      <h6>Search Results ({results.length}):</h6>
      <div className="list-group">
        {results.map((result, index) => (
          <div key={index} className="list-group-item">
            <strong>{result.username}</strong>
            <br />
            <small className="text-muted">
              Email: {result.email}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SearchComponent;