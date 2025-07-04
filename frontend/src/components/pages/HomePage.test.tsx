// HomePage.test.tsx
import { render, screen } from '@testing-library/react';
import HomePage from './HomePage';
import { describe, test, expect } from 'vitest';

describe('HomePage', () => {
  test('should render the title', () => {
    render(<HomePage />);

    // Vérifie que le texte "My HomePage" est présent dans le document
    const titleElement = screen.getByRole('heading', { name: /my homepage/i });
    expect(titleElement).toBeTruthy();
  });
});
