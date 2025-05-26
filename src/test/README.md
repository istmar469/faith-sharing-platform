
# Testing Guide

This project uses Vitest with React Testing Library for testing. Here's how to use it:

## Running Tests

```bash
# Run tests once
npm test

# Run tests in watch mode (automatically reruns when files change)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Writing Tests

### Basic Component Test
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Testing User Interactions
```typescript
import userEvent from '@testing-library/user-event';

it('handles button clicks', async () => {
  const user = userEvent.setup();
  render(<MyComponent />);
  
  await user.click(screen.getByRole('button', { name: /click me/i }));
  expect(screen.getByText('Clicked!')).toBeInTheDocument();
});
```

### Testing with Mocks
```typescript
import { vi } from 'vitest';

it('calls function when button is clicked', async () => {
  const mockFn = vi.fn();
  const user = userEvent.setup();
  
  render(<MyComponent onClick={mockFn} />);
  await user.click(screen.getByRole('button'));
  
  expect(mockFn).toHaveBeenCalledOnce();
});
```

## Test Files Structure

- Place test files next to the components they test with `.test.tsx` extension
- Or create a `__tests__` folder in the same directory
- Example: `src/components/Button/__tests__/Button.test.tsx`

## Available Testing Utilities

- `render`: Renders components with all necessary providers
- `screen`: Query for elements in the DOM
- `userEvent`: Simulate user interactions
- `vi`: Vitest utilities for mocking and spying
- All React Testing Library queries and utilities

## Plugin Testing

The testing environment includes utilities for testing plugins:

```typescript
import { pluginSafetyManager } from '@/services/pluginSafetyManager';

it('validates plugin correctly', () => {
  const mockPlugin = { /* plugin config */ };
  const result = pluginSafetyManager.validatePlugin(mockPlugin);
  expect(result.isValid).toBe(true);
});
```
