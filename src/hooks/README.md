# Custom React Hooks

This directory contains custom React hooks created for the HVAC Optimizer application. Hooks are reusable functions that let you "hook into" React state and lifecycle features from function components.

## Overview

Custom hooks help to:
-   Share stateful logic between components.
-   Keep component code cleaner and more focused on presentation.
-   Abstract complex logic into manageable, testable units.

## Key Hooks

*   **`use-mobile.tsx` (`useIsMobile`)**:
    *   **Purpose**: Determines if the application is currently being viewed on a mobile-sized screen.
    *   **Functionality**:
        *   Uses `window.matchMedia` to check if the window width is below a defined `MOBILE_BREAKPOINT` (typically 768px).
        *   Sets up an event listener to update the `isMobile` state when the window is resized across the breakpoint.
        *   Returns a boolean value: `true` if the screen is considered mobile, `false` otherwise.
    *   **Usage**:
        ```typescript
        import { useIsMobile } from '@/hooks/use-mobile';

        function MyComponent() {
          const isMobile = useIsMobile();

          if (isMobile) {
            return <div>Mobile View</div>;
          }
          return <div>Desktop View</div>;
        }
        ```
    *   **Considerations**: This hook relies on browser APIs (`window.matchMedia`, `window.innerWidth`) and thus should ideally only be used in client components (`'use client';`). The `SidebarProvider` component, which uses this hook, is a client component.

*   **`use-toast.ts` (`useToast`, `toast`)**:
    *   **Purpose**: Provides a system for displaying toast notifications (small, non-modal messages) to the user.
    *   **Functionality**:
        *   Inspired by the `react-hot-toast` library.
        *   Manages a global state of toasts using a reducer pattern.
        *   The `useToast` hook allows components to access the current list of toasts and a `dismiss` function.
        *   The `toast` function is a utility to programmatically add new toasts. It accepts properties like `title`, `description`, `variant` (e.g., "default", "destructive"), and an optional `action` element.
        *   Manages a `TOAST_LIMIT` (e.g., only show one toast at a time) and a `TOAST_REMOVE_DELAY`.
    *   **Relevance for Data Analytics Engineers (IDE Context)**:
        *   The IDE can use `toast` notifications to provide feedback on asynchronous operations like:
            *   Completion or failure of a Python script execution (e.g., "Preprocessing script completed successfully.", "Algorithm simulation failed: Check logs.").
            *   Status of data source connections (e.g., "Connected to S3 bucket: hvac-data-raw").
            *   Deployment status updates (e.g., "Algorithm deployment to Lambda started.", "SageMaker endpoint update successful.").
            *   Git actions (e.g., "Changes committed successfully.").
    *   **Usage**:
        *   **Displaying Toasts (in a component):**
            ```typescript
            import { useToast } from '@/hooks/use-toast';
            import { Button } from '@/components/ui/button';
            // import { ToastAction } from "@/components/ui/toast"; // If using actions

            function MyIDEComponent() {
              const { toast } = useToast();

              const handleRunScript = async () => {
                // Simulate script execution
                toast({ title: "Script Execution", description: "Python script is now running..." });
                await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay
                const success = Math.random() > 0.5;
                if (success) {
                  toast({ title: "Success", description: "Script executed successfully.", variant: "default" });
                } else {
                  toast({ title: "Error", description: "Script execution failed. See logs.", variant: "destructive" });
                }
              };

              return <Button onClick={handleRunScript}>Run Python Script</Button>;
            }
            ```
        *   **Rendering Toasts (typically in the root layout):**
            The `Toaster` component (`src/components/ui/toaster.tsx`) uses `useToast` to render the active toasts. This is already set up in `src/app/layout.tsx`.

    *   **Key Components**: Relies on `ToastProvider`, `ToastViewport`, `Toast`, etc., from `src/components/ui/toast.tsx`.

## Creating New Hooks

When creating new custom hooks:
1.  Ensure the hook serves a clear, reusable purpose.
2.  Follow the naming convention `useMyHookName`.
3.  Place the hook file in this `src/hooks` directory.
4.  If the hook uses browser-specific APIs, ensure it's only used within client components or its usage is guarded.
```