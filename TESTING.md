# Testing Guide

This project includes comprehensive testing setup with unit tests, integration tests, and end-to-end tests.

## Test Structure

```
src/
├── test/
│   ├── setup.ts                    # Test configuration and mocks
│   ├── test-utils.tsx              # Custom render utilities
│   └── integration/                # Integration tests
├── components/
│   └── __tests__/                  # Component unit tests
├── lib/
│   └── __tests__/                  # Utility function tests
└── hooks/
    └── __tests__/                  # Custom hook tests

e2e/                                # End-to-end tests
├── dashboard.spec.ts
├── navigation.spec.ts
└── accessibility.spec.ts
```

## Running Tests

### Unit and Integration Tests
```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

### End-to-End Tests
```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

## Test Categories

### Unit Tests
- **Component Tests**: Test individual React components in isolation
- **Hook Tests**: Test custom React hooks
- **Utility Tests**: Test pure functions and utilities

### Integration Tests
- **Authentication Flow**: Test login/logout workflows
- **Data Table**: Test sorting, filtering, and data manipulation
- **API Integration**: Test data fetching and state management

### End-to-End Tests
- **Dashboard**: Test main dashboard functionality
- **Navigation**: Test routing and page transitions
- **Accessibility**: Test keyboard navigation and ARIA compliance

## Test Utilities

### Custom Render
The `test-utils.tsx` file provides a custom render function that includes:
- React Query client setup
- Theme provider mock
- Other necessary providers

### Mocks
Common mocks are set up in `setup.ts`:
- localStorage
- IntersectionObserver
- ResizeObserver
- matchMedia

## Best Practices

1. **Focus on Core Functionality**: Tests focus on essential business logic
2. **Minimal Test Solutions**: Avoid over-testing edge cases
3. **Real Functionality**: Tests validate actual functionality without excessive mocking
4. **Accessibility**: E2E tests include accessibility checks
5. **Cross-Browser**: E2E tests run on multiple browsers and devices

## Coverage

The test suite covers:
- ✅ Layout components (AppShell, theme toggle)
- ✅ Form validation utilities
- ✅ Authentication hooks and flows
- ✅ Data table functionality
- ✅ Navigation and routing
- ✅ Accessibility compliance
- ✅ Cross-browser compatibility

## Continuous Integration

Tests are configured to run in CI environments with:
- Retry logic for flaky tests
- Parallel execution for faster feedback
- HTML reports for test results
- Cross-browser testing matrix