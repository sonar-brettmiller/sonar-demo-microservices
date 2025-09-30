import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LoginForm from './LoginForm';

describe('LoginForm Component', () => {
  test('renders login form', () => {
    render(<LoginForm onLogin={jest.fn()} />);
    expect(screen.getByText(/Login to Demo App/i)).toBeInTheDocument();
  });

  test('has username input field', () => {
    render(<LoginForm onLogin={jest.fn()} />);
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
  });

  test('has password input field', () => {
    render(<LoginForm onLogin={jest.fn()} />);
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  test('has submit button', () => {
    render(<LoginForm onLogin={jest.fn()} />);
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('updates username field when typing', () => {
    render(<LoginForm onLogin={jest.fn()} />);
    const usernameInput = screen.getByLabelText(/username/i);
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    
    expect(usernameInput.value).toBe('testuser');
  });

  test('updates password field when typing', () => {
    render(<LoginForm onLogin={jest.fn()} />);
    const passwordInput = screen.getByLabelText(/password/i);
    
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(passwordInput.value).toBe('password123');
  });

  test('calls onLogin with credentials when form is submitted', () => {
    const mockOnLogin = jest.fn();
    render(<LoginForm onLogin={mockOnLogin} />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    expect(mockOnLogin).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'password123'
    });
  });

  test('shows alert when username is empty', () => {
    window.alert = jest.fn();
    render(<LoginForm onLogin={jest.fn()} />);
    
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    expect(window.alert).toHaveBeenCalledWith('Please enter both username and password');
  });

  test('shows alert when password is empty', () => {
    window.alert = jest.fn();
    render(<LoginForm onLogin={jest.fn()} />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.click(submitButton);
    
    expect(window.alert).toHaveBeenCalledWith('Please enter both username and password');
  });

  test('shows alert when username is too short', () => {
    window.alert = jest.fn();
    render(<LoginForm onLogin={jest.fn()} />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(usernameInput, { target: { value: 'ab' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    expect(window.alert).toHaveBeenCalled();
  });

  test('clears form after successful submission', () => {
    const mockOnLogin = jest.fn();
    render(<LoginForm onLogin={mockOnLogin} />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    expect(usernameInput.value).toBe('');
    expect(passwordInput.value).toBe('');
  });
});