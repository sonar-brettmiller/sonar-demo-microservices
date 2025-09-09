import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// ⚠️ SECURITY ISSUE: Tests that validate insecure frontend behavior
describe('App Component', () => {
  test('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/SonarSource Security Demo/i)).toBeInTheDocument();
  });

  test('contains login form', () => {
    // Test that documents the component structure and generates coverage
    render(<App />);
    
    // This tests the actual App component code, generating coverage
    expect(screen.getByText(/Login to Demo App/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  test('exposes security vulnerabilities', () => {
    render(<App />);
    
    // This test exercises the component initialization code
    // which includes the hardcoded API_BASE_URL and secrets
    expect(screen.getByText(/Demo Notice/i)).toBeInTheDocument();
    expect(screen.getByText(/intentional security vulnerabilities/i)).toBeInTheDocument();
  });
});
