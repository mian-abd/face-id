import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import WelcomeScreen from '../WelcomeScreen';

// Mock framer-motion for testing
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }) => children,
}));

describe('WelcomeScreen', () => {
  const mockOnStart = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders welcome screen with correct title', () => {
    render(<WelcomeScreen onStart={mockOnStart} />);
    
    expect(screen.getByText(/FACE ACADEMY/i)).toBeInTheDocument();
  });

  test('renders welcome message and instructions', () => {
    render(<WelcomeScreen onStart={mockOnStart} />);
    
    expect(screen.getByText(/Welcome to the future of personalized AI!/i)).toBeInTheDocument();
    expect(screen.getByText(/YOU become the teacher/i)).toBeInTheDocument();
    expect(screen.getByText(/How It Works:/i)).toBeInTheDocument();
  });

  test('renders all instruction steps', () => {
    render(<WelcomeScreen onStart={mockOnStart} />);
    
    expect(screen.getByText(/Step 1.*Tell us your name/i)).toBeInTheDocument();
    expect(screen.getByText(/Step 2.*Take 10 training selfies/i)).toBeInTheDocument();
    expect(screen.getByText(/Step 3.*Watch AI learn YOUR face/i)).toBeInTheDocument();
    expect(screen.getByText(/Step 4.*Get instant recognition/i)).toBeInTheDocument();
  });

  test('renders start button', () => {
    render(<WelcomeScreen onStart={mockOnStart} />);
    
    const startButton = screen.getByRole('button', { name: /Start My AI Journey/i });
    expect(startButton).toBeInTheDocument();
  });

  test('calls onStart when start button is clicked', () => {
    render(<WelcomeScreen onStart={mockOnStart} />);
    
    const startButton = screen.getByRole('button', { name: /Start My AI Journey/i });
    fireEvent.click(startButton);
    
    expect(mockOnStart).toHaveBeenCalledTimes(1);
  });

  test('renders research paper link', () => {
    render(<WelcomeScreen onStart={mockOnStart} />);
    
    const paperLink = screen.getByRole('link', { name: /CMU Research Paper/i });
    expect(paperLink).toBeInTheDocument();
    expect(paperLink).toHaveAttribute('href', 'https://www.cs.cmu.edu/~rsalakhu/papers/oneshot1.pdf');
    expect(paperLink).toHaveAttribute('target', '_blank');
  });

  test('has proper accessibility attributes', () => {
    render(<WelcomeScreen onStart={mockOnStart} />);
    
    const startButton = screen.getByRole('button', { name: /Start My AI Journey/i });
    expect(startButton).toBeInTheDocument();
    
    // Check that external link has proper attributes
    const paperLink = screen.getByRole('link', { name: /CMU Research Paper/i });
    expect(paperLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('renders powered by information', () => {
    render(<WelcomeScreen onStart={mockOnStart} />);
    
    expect(screen.getByText(/Powered by Siamese Neural Networks/i)).toBeInTheDocument();
  });

  test('handles keyboard navigation on start button', () => {
    render(<WelcomeScreen onStart={mockOnStart} />);
    
    const startButton = screen.getByRole('button', { name: /Start My AI Journey/i });
    
    // Test Enter key
    fireEvent.keyDown(startButton, { key: 'Enter' });
    expect(mockOnStart).toHaveBeenCalledTimes(1);
    
    // Test Space key
    fireEvent.keyDown(startButton, { key: ' ' });
    expect(mockOnStart).toHaveBeenCalledTimes(2);
  });

  test('has correct ARIA landmarks', () => {
    render(<WelcomeScreen onStart={mockOnStart} />);
    
    // Should have proper heading structure
    const mainHeading = screen.getByText(/FACE ACADEMY/i);
    expect(mainHeading).toBeInTheDocument();
  });
});
