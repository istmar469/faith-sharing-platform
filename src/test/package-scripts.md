# Required Package.json Scripts

Add these scripts to your package.json file:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Coverage Setup (Optional)

To enable coverage reports, you may also want to install:

```bash
npm install --save-dev @vitest/coverage-v8
```

Then update your vitest.config.ts to include coverage configuration:

```typescript
export default defineConfig({
  // ... existing config
  test: {
    // ... existing test config
    coverage: {
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
      ],
    },
  },
});
```
