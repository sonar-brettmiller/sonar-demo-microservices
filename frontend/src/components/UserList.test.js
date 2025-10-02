import React from 'react';
import { render, screen } from '@testing-library/react';
import UserList from './UserList';

describe('UserList Component', () => {
  test('renders user list component', () => {
    render(<UserList users={[]} />);
    expect(screen.getByText(/User Management/i)).toBeInTheDocument();
  });

  test('displays message when no users are provided', () => {
    render(<UserList users={[]} />);
    expect(screen.getByText(/No users to display/i)).toBeInTheDocument();
  });

  test('displays users when provided', () => {
    const mockUsers = [
      { id: 1, username: 'user1', email: 'user1@example.com', role: 'user' },
      { id: 2, username: 'user2', email: 'user2@example.com', role: 'admin' }
    ];
    
    render(<UserList users={mockUsers} />);
    
    expect(screen.getByText('user1')).toBeInTheDocument();
    expect(screen.getByText('user2')).toBeInTheDocument();
  });

  test('displays user email addresses', () => {
    const mockUsers = [
      { id: 1, username: 'user1', email: 'user1@example.com', role: 'user' }
    ];
    
    render(<UserList users={mockUsers} />);
    
    expect(screen.getByText(/user1@example.com/i)).toBeInTheDocument();
  });

  test('displays user roles', () => {
    const mockUsers = [
      { id: 1, username: 'user1', email: 'user1@example.com', role: 'admin' }
    ];
    
    render(<UserList users={mockUsers} />);
    
    expect(screen.getByText(/admin/i)).toBeInTheDocument();
  });

  test('displays user IDs', () => {
    const mockUsers = [
      { id: 123, username: 'user1', email: 'user1@example.com', role: 'user' }
    ];
    
    render(<UserList users={mockUsers} />);
    
    expect(screen.getByText(/ID: 123/i)).toBeInTheDocument();
  });

  test('displays API key if present', () => {
    const mockUsers = [
      { id: 1, username: 'user1', email: 'user1@example.com', role: 'admin', api_key: 'test-key-123' }
    ];
    
    render(<UserList users={mockUsers} />);
    
    expect(screen.getByText(/API Key: test-key-123/i)).toBeInTheDocument();
  });

  test('does not display API key section if not present', () => {
    const mockUsers = [
      { id: 1, username: 'user1', email: 'user1@example.com', role: 'user' }
    ];
    
    render(<UserList users={mockUsers} />);
    
    expect(screen.queryByText(/API Key:/i)).not.toBeInTheDocument();
  });

  test('handles undefined users prop', () => {
    render(<UserList />);
    expect(screen.getByText(/No users to display/i)).toBeInTheDocument();
  });

  test('renders multiple users correctly', () => {
    const mockUsers = [
      { id: 1, username: 'user1', email: 'user1@example.com', role: 'user' },
      { id: 2, username: 'user2', email: 'user2@example.com', role: 'admin' },
      { id: 3, username: 'user3', email: 'user3@example.com', role: 'user' }
    ];
    
    render(<UserList users={mockUsers} />);
    
    expect(screen.getByTestId('user-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('user-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('user-card-3')).toBeInTheDocument();
  });
});