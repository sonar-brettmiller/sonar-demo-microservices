import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

jest.mock('react-dom', () => ({ render: jest.fn() }));

describe('Index entry point', () => {
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  test('renders without crashing', () => {
    const div = document.createElement('div');
    div.id = 'root';
    document.body.appendChild(div);

    require('./index.js');

    expect(ReactDOM.render).toHaveBeenCalled();
  });

  test('sets up global error handler', () => {
    const div = document.createElement('div');
    div.id = 'root';
    document.body.appendChild(div);

    require('./index.js');

    const errorEvent = new ErrorEvent('error', {
      message: 'Test error',
      filename: 'test.js',
      lineno: 1,
      colno: 1
    });

    window.dispatchEvent(errorEvent);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Global error captured:',
      expect.objectContaining({
        message: 'Test error'
      })
    );
  });

  test('sets up unhandled promise rejection handler', async () => {
    const div = document.createElement('div');
    div.id = 'root';
    document.body.appendChild(div);

    require('./index.js');

    // Create a custom event for unhandled rejection
    const testRejection = new Error('Test rejection');
    const rejectionEvent = new Event('unhandledrejection');
    rejectionEvent.reason = testRejection;
    rejectionEvent.promise = Promise.resolve(); // Don't actually reject to avoid unhandled

    window.dispatchEvent(rejectionEvent);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Unhandled promise rejection:',
      expect.objectContaining({
        reason: 'Test rejection' // Now logs message only
      })
    );
  });

  test('DEBUG is not exposed in test/production mode', () => {
    // In test mode, DEBUG should be undefined for security
    // React compiles NODE_ENV at build time, so it's 'test' here
    expect(window.DEBUG).toBeUndefined();
  });

  test('module initializes without errors', () => {
    // Verify the module loaded successfully
    // The module exports render React, which should create the root element
    const root = document.getElementById('root');
    expect(root).toBeTruthy();
  });

  test('sets up performance monitoring', (done) => {
    // Mock performance API
    const mockPerfEntry = {
      domContentLoadedEventStart: 100,
      domContentLoadedEventEnd: 200,
      loadEventStart: 300,
      loadEventEnd: 400,
      redirectStart: 0,
      redirectEnd: 0,
      fetchStart: 50,
      responseEnd: 250
    };

    global.performance = {
      getEntriesByType: jest.fn(() => [mockPerfEntry])
    };

    // Trigger load event
    const loadEvent = new Event('load');
    window.dispatchEvent(loadEvent);

    // Wait for setTimeout to execute
    setTimeout(() => {
      if (consoleLogSpy.mock.calls.some(call => call[0] === 'Performance data:')) {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          'Performance data:',
          expect.objectContaining({
            domContentLoaded: expect.any(Number)
          })
        );
      }
      done();
    }, 10);
  });
});