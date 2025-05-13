# Library / Utility Functions

This directory (`src/lib`) is intended for general-purpose utility functions and library code that can be used across various parts of the HVAC Optimizer application.

## Overview

Utility functions help in:
-   Abstracting common logic.
-   Keeping component and page code cleaner.
-   Promoting code reuse and maintainability.

## Key Files

*   **`utils.ts`**:
    *   **Purpose**: This file contains common utility functions. Currently, it primarily includes the `cn` function.
    *   **`cn(...inputs: ClassValue[])`**:
        *   **Functionality**: A utility function for conditionally joining CSS class names. It uses `clsx` to combine class names based on conditions and then `tailwind-merge` to intelligently merge Tailwind CSS classes, resolving conflicts (e.g., `p-2 p-4` becomes `p-4`).
        *   **Usage**: Widely used in components for dynamic and clean class name generation.
            ```typescript
            import { cn } from '@/lib/utils';

            function MyComponent({ isActive, isError }) {
              const buttonClasses = cn(
                "px-4 py-2 rounded",
                isActive ? "bg-blue-500 text-white" : "bg-gray-200",
                isError && "border-2 border-red-500"
              );

              return <button className={buttonClasses}>Click Me</button>;
            }
            ```
        *   **Dependencies**: `clsx`, `tailwind-merge`.

## Adding New Utilities

When adding new utility functions:
1.  **Consider Scope**:
    *   If a utility is highly specific to a single component or feature, consider co-locating it with that feature.
    *   If it's broadly applicable, `src/lib/utils.ts` or a new, appropriately named file within `src/lib` (e.g., `src/lib/date-utils.ts`) is a good place.
2.  **Purity**: Prefer pure functions where possible (functions that always return the same output for the same input and have no side effects). This makes them easier to test and reason about.
3.  **Documentation**: Add JSDoc comments to explain the purpose, parameters, and return value of new utility functions.
4.  **TypeScript**: Use TypeScript to provide strong typing for function signatures.
```