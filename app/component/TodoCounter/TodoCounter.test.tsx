import { vi, describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

import { Footer, TodoCounter } from './TodoCounter'; // Update path accordingly

describe('Footer', () => {
  it('renders children correctly', () => {
    render(
      <Footer>
        <span>Test Content</span>
      </Footer>,
    );
    expect(screen.getByText('Test Content')).toBeDefined();
  });
});

const mockHook = {
  todos: [{ id: 1, title: 'Test Todo' }],
  total: 3,
  hasMore: true,
  loadMore: vi.fn(),
  isLoading: false,
};

describe('TodoCounter', () => {
  afterEach(cleanup);

  vi.mock('../../hook/useTodo', () => ({
    useTodo: () => mockHook,
  }));

  it('displays the correct todo count', () => {
    render(<TodoCounter />);
    expect(screen.getByText('1 / 3')).toBeDefined();
  });

  it('loads more todos when button is clicked', () => {
    render(<TodoCounter />);
    const button = screen.getByText('Load more');
    fireEvent.click(button);
    expect(mockHook.loadMore).toHaveBeenCalledTimes(1);
  });
});
