import React from 'react';
import { render, screen } from '@testing-library/react';
import UserList from './UserList';

describe('UserList Component', () => {
  const mockUsers = [
    {
      id: 1,
      username: 'john_doe',
      email: 'john@example.com',
      role: 'user',
      api_key: 'api-key-123'
    },
    {
      id: 2,
      username: 'admin_user',
      email: 'admin@example.com',
      role: 'admin',
      api_key: 'admin-api-key'
    }
  ];

  test('renders empty state when no users provided', () => {
    render(<UserList users={[]} />);
    
    expect(screen.getByText('User Management')).toBeTruthy();
    expect(screen.getByText('No users to display')).toBeTruthy();
  });

  test('renders empty state when users is undefined', () => {
    render(<UserList />);
    
    expect(screen.getByText('User Management')).toBeTruthy();
    expect(screen.getByText('No users to display')).toBeTruthy();
  });

  test('renders user list when users are provided', () => {
    render(<UserList users={mockUsers} />);
    
    expect(screen.getByText('User Management')).toBeTruthy();
    expect(screen.getByText('john_doe')).toBeTruthy();
    expect(screen.getByText('admin_user')).toBeTruthy();
    expect(screen.getByText('Email: john@example.com')).toBeTruthy();
    expect(screen.getByText('Email: admin@example.com')).toBeTruthy();
  });

  test('displays user roles correctly', () => {
    render(<UserList users={mockUsers} />);
    
    const userBadges = screen.getAllByText('user');
    const adminBadges = screen.getAllByText('admin');
    
    expect(userBadges.length).toBeGreaterThan(0);
    expect(adminBadges.length).toBeGreaterThan(0);
  });

  test('shows API keys for users', () => {
    render(<UserList users={mockUsers} />);
    
    expect(screen.getByText('API Key: api-key-123')).toBeTruthy();
    expect(screen.getByText('API Key: admin-api-key')).toBeTruthy();
  });

  test('renders correct number of user cards', () => {
    render(<UserList users={mockUsers} />);
    
    // Each user should have a card with their username
    expect(screen.getAllByTestId(/user-card-/)).toHaveLength(mockUsers.length);
  });

  test('applies correct CSS classes for styling', () => {
    const { container } = render(<UserList users={mockUsers} />);
    
    expect(container.querySelector('.card')).toBeTruthy();
    expect(container.querySelector('.card-header')).toBeTruthy();
    expect(container.querySelector('.card-body')).toBeTruthy();
  });

  test('handles single user correctly', () => {
    const singleUser = [mockUsers[0]];
    render(<UserList users={singleUser} />);
    
    expect(screen.getByText('john_doe')).toBeTruthy();
    expect(screen.queryByText('admin_user')).toBeNull();
  });

  test('renders user management header consistently', () => {
    render(<UserList users={mockUsers} />);
    
    const header = screen.getByText('User Management');
    expect(header).toBeTruthy();
    expect(header.closest('.card-header').className).toContain('bg-primary');
    expect(header.closest('.card-header').className).toContain('text-white');
  });

  test('displays all user properties correctly', () => {
    render(<UserList users={mockUsers} />);
    
    mockUsers.forEach(user => {
      expect(screen.getByText(`ID: ${user.id}`)).toBeTruthy();
      expect(screen.getByText(`Email: ${user.email}`)).toBeTruthy();
      expect(screen.getByText(`API Key: ${user.api_key}`)).toBeTruthy();
    });
  });
});
