import { render, screen } from '@testing-library/react';
import App from './App';

// ⚠️ SECURITY ISSUE: Tests that validate insecure frontend behavior
describe('App Component', () => {
  test('renders without crashing', () => {
    render(<App />);
    const element = screen.getByText(/SonarSource Security Demo/i);
    expect(element).toBeTruthy();
  });

  test('contains login form', () => {
    // Test that documents the component structure and generates coverage
    render(<App />);
    
    // This tests the actual App component code, generating coverage
    const loginHeader = screen.getByText(/Login to Demo App/i);
    const usernameField = screen.getByLabelText(/Username/i);
    const passwordField = screen.getByLabelText(/Password/i);
    
    expect(loginHeader).toBeTruthy();
    expect(usernameField).toBeTruthy();
    expect(passwordField).toBeTruthy();
  });

  test('exposes security vulnerabilities', () => {
    render(<App />);
    
    // This test exercises the component initialization code
    // which includes the hardcoded API_BASE_URL and secrets
    const demoNotice = screen.getByText(/Demo Notice/i);
    const vulnerabilityText = screen.getByText(/intentional security vulnerabilities/i);
    
    expect(demoNotice).toBeTruthy();
    expect(vulnerabilityText).toBeTruthy();
  });
});
