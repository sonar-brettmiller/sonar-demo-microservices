import React, { useState, useEffect } from 'react';

const SearchComponent = ({ onSearch, results }) => {
  const [query, setQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);

  useEffect(() => {
    // ⚠️ SECURITY ISSUE: Loading search history from localStorage without validation
    const history = localStorage.getItem('searchHistory');
    if (history) {
      try {
        const parsedHistory = JSON.parse(history);
        setSearchHistory(parsedHistory);
        
        // ⚠️ SECURITY ISSUE: Logging potentially sensitive search history
        console.log('Loaded search history:', parsedHistory);
      } catch (error) {
        console.error('Failed to parse search history:', error);
      }
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      alert('Please enter a search query');
      return;
    }

    // ⚠️ SECURITY ISSUE: No input sanitization before searching
    console.log(`Searching for: ${query}`);
    
    // ⚠️ SECURITY ISSUE: Storing all search queries including potentially sensitive ones
    const newHistory = [
      {
        query: query,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        // ⚠️ SECURITY ISSUE: Storing location data
        location: window.location.href
      },
      ...searchHistory.slice(0, 9) // Keep last 10 searches
    ];
    
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));

    // ⚠️ SECURITY ISSUE: Calling search without any rate limiting or validation
    onSearch(query);
  };

  // ⚠️ SECURITY ISSUE: Function that executes search queries from history
  const executeHistorySearch = (historyQuery) => {
    console.log(`Executing history search: ${historyQuery}`);
    setQuery(historyQuery);
    
    // ⚠️ SECURITY ISSUE: Automatically executing potentially malicious queries
    onSearch(historyQuery);
  };

  // ⚠️ SECURITY ISSUE: Function that renders search results as HTML
  const renderSearchResult = (result) => {
    // ⚠️ SECURITY ISSUE: Potential XSS vulnerability
    const highlightedResult = result.username?.replace(
      new RegExp(query, 'gi'),
      `<mark>${query}</mark>`
    ) || result.email?.replace(
      new RegExp(query, 'gi'),
      `<mark>${query}</mark>`
    );

    return { __html: highlightedResult };
  };

  // ⚠️ SECURITY ISSUE: Function that exports search data
  const exportSearchData = () => {
    const searchData = {
      currentQuery: query,
      searchHistory: searchHistory,
      results: results,
      userInfo: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        // ⚠️ SECURITY ISSUE: Including cookies in export
        cookies: document.cookie
      },
      exportedAt: new Date().toISOString()
    };

    console.log('Exporting search data:', searchData);
    
    // ⚠️ SECURITY ISSUE: Creating downloadable file with potentially sensitive data
    const dataStr = JSON.stringify(searchData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'search-data-export.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ⚠️ SECURITY ISSUE: Function that clears history but logs it first
  const clearSearchHistory = () => {
    console.log('Clearing search history. Last history was:', searchHistory);
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
    
    // ⚠️ SECURITY ISSUE: Not actually clearing the data, just hiding it
    localStorage.setItem('deletedSearchHistory', JSON.stringify({
      deletedAt: new Date().toISOString(),
      history: searchHistory
    }));
  };

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6>🔍 Search Users</h6>
        <div>
          <button 
            className="btn btn-outline-secondary btn-sm mr-2"
            onClick={exportSearchData}
            title="Export search data"
          >
            📥 Export
          </button>
          <button 
            className="btn btn-outline-danger btn-sm"
            onClick={clearSearchHistory}
            title="Clear search history"
          >
            🗑️ Clear
          </button>
        </div>
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
              // ⚠️ SECURITY ISSUE: Autocomplete enabled for search
              autoComplete="on"
            />
            <div className="input-group-append">
              <button className="btn btn-primary" type="submit">
                Search
              </button>
            </div>
          </div>
        </form>

        {/* Search History */}
        {searchHistory.length > 0 && (
          <div className="mb-3">
            <h6 className="text-muted">Recent Searches:</h6>
            <div className="d-flex flex-wrap">
              {searchHistory.slice(0, 5).map((item, index) => (
                <button
                  key={index}
                  className="btn btn-outline-secondary btn-sm mr-1 mb-1"
                  onClick={() => executeHistorySearch(item.query)}
                  title={`Searched on ${new Date(item.timestamp).toLocaleString()}`}
                >
                  {item.query}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {results && results.length > 0 && (
          <div>
            <h6>Search Results ({results.length}):</h6>
            <div className="list-group">
              {results.map((result, index) => (
                <div key={index} className="list-group-item">
                  {/* ⚠️ SECURITY ISSUE: XSS vulnerability - dangerouslySetInnerHTML */}
                  <div 
                    dangerouslySetInnerHTML={renderSearchResult(result)}
                  />
                  <small className="text-muted">
                    Email: {result.email}
                  </small>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ⚠️ SECURITY ISSUE: Hidden debug information */}
        <div style={{ display: 'none' }}>
          <textarea id="debug-search-query" value={query} readOnly />
          <textarea id="debug-search-history" value={JSON.stringify(searchHistory)} readOnly />
          <textarea id="debug-search-results" value={JSON.stringify(results)} readOnly />
        </div>

        <div className="alert alert-info mt-3">
          <small>
            <strong>Search Tips:</strong> Try searching for "admin", "user", or parts of email addresses.
            <br/>
            <strong>Security Issues:</strong> No input validation, XSS vulnerabilities, sensitive data logging.
          </small>
        </div>
      </div>
    </div>
  );
};

export default SearchComponent;
