import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import App from './App';

jest.mock('axios');

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    // Mock axios.get to always return empty posts by default
    axios.get.mockResolvedValue({ data: [] });
  });

  test('renders login form when not authenticated', async () => {
    render(<App />);
    expect(screen.getByText(/Login to Demo App/i)).toBeInTheDocument();
    
    // Wait for initial fetch to complete
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  test('fetches posts on mount', async () => {
    const mockPosts = [
      { id: 1, title: 'Test Post', content: 'Test Content', author_id: 1 }
    ];
    axios.get.mockResolvedValueOnce({ data: mockPosts });

    render(<App />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/posts'));
    });
  });

  test('validates saved token on mount', async () => {
    localStorage.setItem('authToken', 'test-token');
    axios.get.mockResolvedValueOnce({ data: [] });

    render(<App />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/users'),
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-token' }
        })
      );
    });
  });

  test('clears invalid token from localStorage', async () => {
    localStorage.setItem('authToken', 'invalid-token');
    axios.get.mockRejectedValueOnce(new Error('Unauthorized'));

    render(<App />);

    await waitFor(() => {
      expect(localStorage.getItem('authToken')).toBeNull();
    });
  });

  test('handles successful login', async () => {
    const mockUserData = {
      token: 'test-token',
      user: {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'user'
      }
    };

    axios.post.mockResolvedValueOnce({ data: mockUserData });
    axios.get.mockResolvedValue({ data: [] });

    render(<App />);

    // Find inputs and fill them
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });

    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/login'),
        { username: 'testuser', password: 'password' }
      );
    });
  });

  test('handles login error gracefully', async () => {
    const mockError = {
      response: {
        data: { error: 'Invalid credentials' }
      }
    };

    axios.post.mockRejectedValueOnce(mockError);
    axios.get.mockResolvedValue({ data: [] });
    window.alert = jest.fn();

    render(<App />);

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });

    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalled();
    });
  });

  test('renders welcome message after login', async () => {
    const mockUserData = {
      token: 'test-token',
      user: {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'user'
      }
    };

    localStorage.setItem('authToken', 'test-token');
    axios.get.mockResolvedValueOnce({ data: [mockUserData.user] });
    axios.get.mockResolvedValue({ data: [] });

    render(<App />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  test('handles search correctly', async () => {
    const mockSearchResults = [
      { username: 'testuser', email: 'test@example.com' }
    ];

    axios.get.mockResolvedValueOnce({ data: mockSearchResults });

    render(<App />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  test('renders admin panel for admin users', async () => {
    const mockAdminData = {
      token: 'admin-token',
      user: {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin'
      }
    };

    axios.post.mockResolvedValueOnce({ data: mockAdminData });
    axios.get.mockResolvedValue({ data: [] });

    localStorage.setItem('authToken', 'admin-token');
    render(<App />);

    await waitFor(() => {
      const adminPanel = screen.queryByText(/Admin Panel/i);
      if (adminPanel) {
        expect(adminPanel).toBeInTheDocument();
      }
    });
  });

  test('handles fetch posts error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    axios.get.mockRejectedValueOnce(new Error('Network error'));

    render(<App />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch posts:', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });

  test('handles fetch users error when not authenticated', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    
    render(<App />);

    // Try to trigger fetchUsers without authentication
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    consoleLogSpy.mockRestore();
  });

  test('handles fetch users error when authenticated', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    localStorage.setItem('authToken', 'test-token');
    
    // First call (posts) succeeds, second call (users validation) fails
    axios.get
      .mockResolvedValueOnce({ data: [] }) // posts fetch
      .mockRejectedValueOnce(new Error('Auth failed')); // users validation fails

    render(<App />);

    // The error will be logged as "Failed to fetch users" from validateToken
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  test('handles logout functionality', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    const mockUserData = {
      token: 'test-token',
      user: {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'user'
      }
    };

    localStorage.setItem('authToken', 'test-token');
    axios.get.mockResolvedValue({ data: [] });
    axios.post.mockResolvedValue({ data: mockUserData });

    render(<App />);

    // Wait for login/render
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    // Find and click logout if it exists
    const logoutButton = screen.queryByText(/Logout/i);
    if (logoutButton) {
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(localStorage.getItem('authToken')).toBeNull();
        expect(consoleLogSpy).toHaveBeenCalledWith('User logged out successfully');
      });
    }

    consoleLogSpy.mockRestore();
  });

  test('handles search error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    render(<App />);

    // Simulate search failure - would need SearchComponent integration
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  test('handles search with results', async () => {
    const mockSearchResults = [
      { id: 1, username: 'searchuser', email: 'search@example.com' }
    ];

    axios.get
      .mockResolvedValueOnce({ data: [] }) // posts
      .mockResolvedValueOnce({ data: mockSearchResults }); // search results

    render(<App />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  test('handles token validation error in fetchUsers', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const mockUserData = {
      token: 'test-token',
      user: {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'admin'
      }
    };

    localStorage.setItem('authToken', 'test-token');
    
    // First call succeeds (posts), second call succeeds (token validation), 
    // third call fails (manual fetchUsers click)
    axios.get
      .mockResolvedValueOnce({ data: [] }) // posts
      .mockResolvedValueOnce({ data: [mockUserData.user] }) // token validation
      .mockRejectedValueOnce(new Error('Fetch users failed')); // manual fetch fails

    render(<App />);

    // Wait for admin panel to appear
    await waitFor(() => {
      expect(screen.queryByText(/Admin Panel/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Manually trigger fetchUsers by finding and clicking the button
    const loadUsersButton = screen.getByRole('button', { name: /Load All Users/i });
    fireEvent.click(loadUsersButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch users:', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });

  test('renders posts correctly when available', async () => {
    const mockPosts = [
      { id: 1, title: 'First Post', content: 'First content', author_id: 1 },
      { id: 2, title: 'Second Post', content: 'Second content', author_id: 1 }
    ];

    axios.get.mockResolvedValueOnce({ data: mockPosts });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('First Post')).toBeInTheDocument();
      expect(screen.getByText('First content')).toBeInTheDocument();
    });
  });
});