import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import FileUpload from './FileUpload';

jest.mock('axios');

describe('FileUpload Component', () => {
  const mockUser = {
    token: 'test-token',
    username: 'testuser'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders file upload component', () => {
    render(<FileUpload user={mockUser} />);
    expect(screen.getByText(/File Upload/i)).toBeInTheDocument();
  });

  test('has file input field', () => {
    render(<FileUpload user={mockUser} />);
    expect(screen.getByLabelText(/Select file/i)).toBeInTheDocument();
  });

  test('has upload button', () => {
    render(<FileUpload user={mockUser} />);
    expect(screen.getByRole('button', { name: /Upload File/i })).toBeInTheDocument();
  });

  test('initially upload button is disabled', () => {
    render(<FileUpload user={mockUser} />);
    const uploadButton = screen.getByRole('button', { name: /Upload File/i });
    expect(uploadButton).toBeDisabled();
  });

  test('displays file info when file is selected', () => {
    render(<FileUpload user={mockUser} />);
    const fileInput = screen.getByLabelText(/Select file/i);
    
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    expect(screen.getByText(/test.txt/i)).toBeInTheDocument();
  });

  test('enables upload button when file is selected', () => {
    render(<FileUpload user={mockUser} />);
    const fileInput = screen.getByLabelText(/Select file/i);
    const uploadButton = screen.getByRole('button', { name: /Upload File/i });
    
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    expect(uploadButton).not.toBeDisabled();
  });

  test('upload button is disabled when no file is selected', () => {
    render(<FileUpload user={mockUser} />);
    const uploadButton = screen.getByRole('button', { name: /Upload File/i });
    
    expect(uploadButton).toBeDisabled();
  });

  test('shows error when user token is missing', async () => {
    render(<FileUpload user={{}} />);
    const fileInput = screen.getByLabelText(/Select file/i);
    
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    const uploadButton = screen.getByRole('button', { name: /Upload File/i });
    fireEvent.click(uploadButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Upload failed/i)).toBeInTheDocument();
    });
  });

  test('handles successful upload', async () => {
    axios.post.mockResolvedValueOnce({ data: { message: 'Upload successful' } });
    
    render(<FileUpload user={mockUser} />);
    const fileInput = screen.getByLabelText(/Select file/i);
    
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    const uploadButton = screen.getByRole('button', { name: /Upload File/i });
    fireEvent.click(uploadButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Upload successful/i)).toBeInTheDocument();
    });
  });

  test('handles upload error', async () => {
    axios.post.mockRejectedValueOnce(new Error('Network error'));
    
    render(<FileUpload user={mockUser} />);
    const fileInput = screen.getByLabelText(/Select file/i);
    
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    const uploadButton = screen.getByRole('button', { name: /Upload File/i });
    fireEvent.click(uploadButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Upload failed/i)).toBeInTheDocument();
    });
  });

  test('displays file size in KB', () => {
    render(<FileUpload user={mockUser} />);
    const fileInput = screen.getByLabelText(/Select file/i);
    
    const file = new File(['x'.repeat(2048)], 'test.txt', { type: 'text/plain' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    expect(screen.getByText(/Size:/i)).toBeInTheDocument();
  });

  test('displays file type', () => {
    render(<FileUpload user={mockUser} />);
    const fileInput = screen.getByLabelText(/Select file/i);
    
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    expect(screen.getByText(/Type:/i)).toBeInTheDocument();
  });
});
