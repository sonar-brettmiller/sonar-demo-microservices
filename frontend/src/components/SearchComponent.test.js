import { render, screen, fireEvent } from '@testing-library/react';
import SearchComponent from './SearchComponent';

// ⚠️ SECURITY ISSUE: Tests for search component with SQL injection vulnerability
describe('SearchComponent', () => {
  const mockOnSearch = jest.fn();

  test('renders search input', () => {
    render(<SearchComponent onSearch={mockOnSearch} />);
    
    const searchInput = screen.getByPlaceholderText(/Search by username or email/i);
    const searchButton = screen.getByRole('button', { name: /Search/i });
    
    expect(searchInput).toBeTruthy();
    expect(searchButton).toBeTruthy();
  });

  test('handles search input changes', () => {
    render(<SearchComponent onSearch={mockOnSearch} />);
    
    const searchInput = screen.getByPlaceholderText(/Search by username or email/i);
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    
    expect(searchInput.value).toBe('test query');
  });

  test('demonstrates SQL injection vulnerability in search', () => {
    render(<SearchComponent onSearch={mockOnSearch} />);
    
    const searchInput = screen.getByPlaceholderText(/Search by username or email/i);
    const searchButton = screen.getByRole('button', { name: /Search/i });
    
    // Test with SQL injection payload (intentional vulnerability)
    const sqlInjectionPayload = "'; DROP TABLE users; --";
    fireEvent.change(searchInput, { target: { value: sqlInjectionPayload } });
    fireEvent.click(searchButton);
    
    // This tests the vulnerable search submission code
    expect(mockOnSearch).toHaveBeenCalledWith(sqlInjectionPayload);
  });
});
