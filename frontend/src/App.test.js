import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import App from './App';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('renders login form when no user is authenticated', () => {
    render(<App />);
    
    expect(screen.getByText('🔍 SonarSource Security Demo')).toBeTruthy();
    expect(screen.getByText('Please log in')).toBeTruthy();
    expect(screen.getByRole('button', { name: /login/i })).toBeTruthy();
  });

  test('renders welcome message when user is authenticated', async () => {
    localStorageMock.getItem.mockReturnValue('mock-token');
    mockedAxios.get.mockResolvedValueOnce({
      data: [{ id: 1, username: 'testuser' }]
    });

    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText(/Welcome to the Demo App/)).toBeTruthy();
    });
  });

  test('fetches posts on component mount', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: [
        { id: 1, title: 'Test Post', content: 'Test content' }
      ]
    });

    render(<App />);
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/posts')
      );
    });
  });

  test('handles login successfully', async () => {
    const mockLoginResponse = {
      data: {
        token: 'mock-jwt-token',
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          role: 'user'
        }
      }
    };

    mockedAxios.post.mockResolvedValueOnce(mockLoginResponse);
    mockedAxios.get.mockResolvedValueOnce({ data: [] }); // for users fetch
    mockedAxios.get.mockResolvedValueOnce({ data: [] }); // for posts fetch

    render(<App />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('authToken', 'mock-jwt-token');
    });
  });

  test('handles login failure', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { error: 'Invalid credentials' } }
    });

    // Mock window.alert
    window.alert = jest.fn();

    render(<App />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining('Login failed')
      );
    });
  });

  test('handles logout correctly', async () => {
    localStorageMock.getItem.mockReturnValue('mock-token');
    mockedAxios.get.mockResolvedValueOnce({
      data: [{ id: 1, username: 'testuser' }]
    });

    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Welcome, testuser')).toBeTruthy();
    });

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
    expect(screen.getByText('Please log in')).toBeTruthy();
  });

  test('validates token on mount with valid token', async () => {
    localStorageMock.getItem.mockReturnValue('valid-token');
    mockedAxios.get.mockResolvedValueOnce({
      data: [{ id: 1, username: 'testuser' }]
    });

    render(<App />);
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/users'),
        expect.objectContaining({
          headers: { Authorization: 'Bearer valid-token' }
        })
      );
    });
  });

  test('clears invalid token on mount', async () => {
    localStorageMock.getItem.mockReturnValue('invalid-token');
    mockedAxios.get.mockRejectedValueOnce(new Error('Unauthorized'));

    render(<App />);
    
    await waitFor(() => {
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
    });
  });

  test('handles search functionality', async () => {
    localStorageMock.getItem.mockReturnValue('mock-token');
    mockedAxios.get
      .mockResolvedValueOnce({ data: [] }) // token validation
      .mockResolvedValueOnce({ data: [] }) // posts fetch
      .mockResolvedValueOnce({ // search results
        data: [{ username: 'searchuser', email: 'search@example.com' }]
      });

    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search users/i)).toBeTruthy();
    });

    const searchInput = screen.getByPlaceholderText(/search users/i);
    fireEvent.change(searchInput, { target: { value: 'searchuser' } });
    fireEvent.submit(searchInput.closest('form'));

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/search?q=searchuser')
      );
    });
  });

  test('displays admin badge for admin users', async () => {
    localStorageMock.getItem.mockReturnValue('admin-token');
    mockedAxios.get.mockResolvedValueOnce({
      data: [{ id: 1, username: 'admin', role: 'admin' }]
    });

    const mockLoginResponse = {
      data: {
        token: 'admin-token',
        user: {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin'
        }
      }
    };

    // Simulate being logged in as admin
    render(<App />);

    // Set user state directly for testing
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    mockedAxios.post.mockResolvedValueOnce(mockLoginResponse);
    mockedAxios.get.mockResolvedValueOnce({ data: [] }); // users fetch
    mockedAxios.get.mockResolvedValueOnce({ data: [] }); // posts fetch

    fireEvent.change(usernameInput, { target: { value: 'admin' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('ADMIN')).toBeTruthy();
    });
  });

  test('renders posts correctly', async () => {
    const mockPosts = [
      { id: 1, title: 'First Post', content: 'First content' },
      { id: 2, title: 'Second Post', content: 'Second content' }
    ];

    mockedAxios.get.mockResolvedValueOnce({ data: mockPosts });

    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('First Post')).toBeTruthy();
      expect(screen.getByText('Second Post')).toBeTruthy();
      expect(screen.getByText('First content')).toBeTruthy();
      expect(screen.getByText('Second content')).toBeTruthy();
    });
  });

  test('handles API base URL from environment', () => {
    const originalEnv = process.env.REACT_APP_API_URL;
    process.env.REACT_APP_API_URL = 'https://api.example.com/api';
    
    render(<App />);
    
    // Restore original env
    process.env.REACT_APP_API_URL = originalEnv;
    
    expect(screen.getByText('🔍 SonarSource Security Demo')).toBeTruthy();
  });

  test('handles failed posts fetch gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

    render(<App />);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch posts:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });
});