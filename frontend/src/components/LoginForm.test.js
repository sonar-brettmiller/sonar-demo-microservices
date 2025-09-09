import { render, screen, fireEvent } from '@testing-library/react';
import LoginForm from './LoginForm';

// ⚠️ SECURITY ISSUE: Tests for insecure login component
describe('LoginForm Component', () => {
  const mockOnLogin = jest.fn();

  test('renders login form', () => {
    render(<LoginForm onLogin={mockOnLogin} />);
    
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('handles form submission', () => {
    render(<LoginForm onLogin={mockOnLogin} />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(usernameInput, { target: { value: 'admin' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    // This tests the vulnerable login submission code
    expect(mockOnLogin).toHaveBeenCalled();
  });

  test('demonstrates insecure password handling', () => {
    render(<LoginForm onLogin={mockOnLogin} />);
    
    // Test that exercises the component's insecure password handling
    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(passwordInput, { target: { value: 'weakpassword' } });
    
    expect(passwordInput.value).toBe('weakpassword');
  });
});
