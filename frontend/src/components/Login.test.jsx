import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';
import { AuthProvider } from '../context/AuthContext';

const MockAuthProvider = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
);

describe('Login Component', () => {
  it('renders login form', () => {
    render(
      <MockAuthProvider>
        <Login />
      </MockAuthProvider>
    );
    
    expect(screen.getByText(/login/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('allows user to input email and password', () => {
    render(
      <MockAuthProvider>
        <Login />
      </MockAuthProvider>
    );
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('shows admin checkbox', () => {
    render(
      <MockAuthProvider>
        <Login />
      </MockAuthProvider>
    );
    
    expect(screen.getByText(/login as admin/i)).toBeInTheDocument();
  });
});