import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchComponent from './SearchComponent';

describe('SearchComponent', () => {
  test('renders search component', () => {
    render(<SearchComponent onSearch={jest.fn()} results={[]} />);
    expect(screen.getByText(/Search Users/i)).toBeInTheDocument();
  });

  test('has search input field', () => {
    render(<SearchComponent onSearch={jest.fn()} results={[]} />);
    expect(screen.getByPlaceholderText(/Search by username or email/i)).toBeInTheDocument();
  });

  test('has search button', () => {
    render(<SearchComponent onSearch={jest.fn()} results={[]} />);
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  test('updates query when typing', () => {
    render(<SearchComponent onSearch={jest.fn()} results={[]} />);
    const searchInput = screen.getByPlaceholderText(/Search by username or email/i);
    
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    
    expect(searchInput.value).toBe('test query');
  });

  test('calls onSearch with trimmed query when form is submitted', () => {
    const mockOnSearch = jest.fn();
    render(<SearchComponent onSearch={mockOnSearch} results={[]} />);
    
    const searchInput = screen.getByPlaceholderText(/Search by username or email/i);
    const searchButton = screen.getByRole('button', { name: /search/i });
    
    fireEvent.change(searchInput, { target: { value: '  test query  ' } });
    fireEvent.click(searchButton);
    
    expect(mockOnSearch).toHaveBeenCalledWith('test query');
  });

  test('shows alert when search query is empty', () => {
    window.alert = jest.fn();
    render(<SearchComponent onSearch={jest.fn()} results={[]} />);
    
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);
    
    expect(window.alert).toHaveBeenCalledWith('Please enter a search query');
  });

  test('does not display results when results array is empty', () => {
    render(<SearchComponent onSearch={jest.fn()} results={[]} />);
    expect(screen.queryByText(/Search Results/i)).not.toBeInTheDocument();
  });

  test('displays search results when provided', () => {
    const mockResults = [
      { username: 'user1', email: 'user1@example.com' },
      { username: 'user2', email: 'user2@example.com' }
    ];
    
    render(<SearchComponent onSearch={jest.fn()} results={mockResults} />);
    
    expect(screen.getByText(/Search Results \(2\)/i)).toBeInTheDocument();
    expect(screen.getByText('user1')).toBeInTheDocument();
    expect(screen.getByText('user2')).toBeInTheDocument();
  });

  test('displays email addresses in results', () => {
    const mockResults = [
      { username: 'user1', email: 'user1@example.com' }
    ];
    
    render(<SearchComponent onSearch={jest.fn()} results={mockResults} />);
    
    expect(screen.getByText(/user1@example.com/i)).toBeInTheDocument();
  });

  test('handles null results gracefully', () => {
    render(<SearchComponent onSearch={jest.fn()} results={null} />);
    expect(screen.queryByText(/Search Results/i)).not.toBeInTheDocument();
  });

  test('handles undefined results gracefully', () => {
    render(<SearchComponent onSearch={jest.fn()} />);
    expect(screen.queryByText(/Search Results/i)).not.toBeInTheDocument();
  });
});