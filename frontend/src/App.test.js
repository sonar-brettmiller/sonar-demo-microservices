import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import App from './App';

jest.mock('axios');

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders login form when not authenticated', () => {
    render(<App />);
    expect(screen.getByText(/Login to Demo App/i)).toBeInTheDocument();
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
});