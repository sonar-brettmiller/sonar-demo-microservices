import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import FileUpload from './FileUpload';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('FileUpload Component', () => {
  const mockUser = {
    id: 1,
    username: 'testuser',
    token: 'mock-jwt-token'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders file upload form correctly', () => {
    render(<FileUpload user={mockUser} />);
    
    expect(screen.getByText('📁 File Upload')).toBeTruthy();
    expect(screen.getByLabelText('Select file:')).toBeTruthy();
    expect(screen.getByText('Upload File')).toBeTruthy();
  });

  test('renders without user prop', () => {
    render(<FileUpload />);
    
    expect(screen.getByText('📁 File Upload')).toBeTruthy();
    expect(screen.getByLabelText('Select file:')).toBeTruthy();
  });

  test('handles file selection', () => {
    render(<FileUpload user={mockUser} />);
    
    const fileInput = screen.getByLabelText('Select file:');
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    expect(fileInput.files[0]).toBe(file);
    expect(fileInput.files).toHaveLength(1);
  });

  test('disables upload button when no file selected', () => {
    render(<FileUpload user={mockUser} />);
    
    const uploadButton = screen.getByText('Upload File');
    expect(uploadButton.disabled).toBe(true);
  });

  test('enables upload button when file is selected', () => {
    render(<FileUpload user={mockUser} />);
    
    const fileInput = screen.getByLabelText('Select file:');
    const uploadButton = screen.getByText('Upload File');
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    expect(uploadButton.disabled).toBe(false);
  });

  test('handles successful file upload', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { message: 'File uploaded successfully', filename: 'test.txt' }
    });

    render(<FileUpload user={mockUser} />);
    
    const fileInput = screen.getByLabelText('Select file:');
    const uploadButton = screen.getByText('Upload File');
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.click(uploadButton);
    
    expect(screen.getAllByText('Uploading...').length).toBeGreaterThan(0);
    
    await waitFor(() => {
      expect(screen.getByText('✅ Upload successful!')).toBeTruthy();
    });
  });

  test('handles upload error', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Upload failed'));

    render(<FileUpload user={mockUser} />);
    
    const fileInput = screen.getByLabelText('Select file:');
    const uploadButton = screen.getByText('Upload File');
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.click(uploadButton);
    
    await waitFor(() => {
      expect(screen.getByText('❌ Upload failed. Please try again.')).toBeTruthy();
    });
  });

  test('handles upload without user token', async () => {
    const userWithoutToken = { id: 1, username: 'testuser' };
    render(<FileUpload user={userWithoutToken} />);
    
    const fileInput = screen.getByLabelText('Select file:');
    const uploadButton = screen.getByText('Upload File');
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.click(uploadButton);
    
    await waitFor(() => {
      expect(screen.getByText('❌ Upload failed. Please try again.')).toBeTruthy();
    });
  });

  test('resets form after successful upload', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { message: 'File uploaded successfully' }
    });

    render(<FileUpload user={mockUser} />);
    
    const fileInput = screen.getByLabelText('Select file:');
    const uploadButton = screen.getByText('Upload File');
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.click(uploadButton);
    
    await waitFor(() => {
      expect(screen.getByText('✅ Upload successful!')).toBeTruthy();
    });
    
    expect(uploadButton.disabled).toBe(true);
  });

  test('displays progress indicator during upload', async () => {
    mockedAxios.post.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({ data: { message: 'Success' } }), 100))
    );

    render(<FileUpload user={mockUser} />);
    
    const fileInput = screen.getByLabelText('Select file:');
    const uploadButton = screen.getByText('Upload File');
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.click(uploadButton);
    
    expect(screen.getAllByText('Uploading...').length).toBeGreaterThan(0);
  });

  test('sends correct request with file and authorization', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { message: 'File uploaded successfully' }
    });

    render(<FileUpload user={mockUser} />);
    
    const fileInput = screen.getByLabelText('Select file:');
    const uploadButton = screen.getByText('Upload File');
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.click(uploadButton);
    
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/upload'),
        expect.any(FormData),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-jwt-token'
          })
        })
      );
    });
  });
});
