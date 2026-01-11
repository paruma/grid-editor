import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders grid editor title', () => {
  render(<App />);
  const titleElement = screen.getByText(/グリッドエディタ/i);
  expect(titleElement).toBeInTheDocument();
});
