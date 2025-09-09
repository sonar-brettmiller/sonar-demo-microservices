import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

// Mock ReactDOM
jest.mock('react-dom', () => ({
  render: jest.fn(),
}));

// Mock the App component
jest.mock('./App', () => {
  return function MockApp() {
    return <div>Mock App</div>;
  };
});

describe('index.js', () => {
  test('renders App component without crashing', () => {
    // Create a mock div element
    const div = document.createElement('div');
    div.id = 'root';
    document.body.appendChild(div);

    // Import and execute index.js
    require('./index.js');

    // Verify ReactDOM.render was called
    expect(ReactDOM.render).toHaveBeenCalled();
  });

  test('renders with correct root element', () => {
    const rootElement = document.getElementById('root');
    expect(rootElement).not.toBeNull();
  });
});
