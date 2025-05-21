---
applyTo: '**'
---

# GitHub Copilot: React Native (Expo) TypeScript App Development Guide

This document guides GitHub Copilot in assisting with the development of a React Native (Expo) mobile application using TypeScript. It outlines architectural decisions, coding standards, and best practices to ensure consistency and maintainability.

**Project Name:** Sandy

**Project Type:** React Native (Expo) mobile application

**Location:** This guide applies to code within the `./frontend` directory of the project. All actions must be performed in this directory, and no code should be generated outside of it.

**Objective:** Assist in generating and maintaining a well-structured, maintainable, and user-friendly React Native mobile application ("Sandy") using Expo and TypeScript.

**Role:** You are an expert React Native developer. Adhere to the best practices and structural guidelines outlined below for all code generation, refactoring, and suggestions.

## 1. Core Principles & Best Practices

### 1.1. Language & Typing
*   **TypeScript Everywhere:** Strictly use TypeScript. Implement strong typing for props, state, function signatures, API responses, and all variables. Avoid `any` where possible; prefer explicit types or `unknown`.
*   **Type Definitions:**
    *   Global types (excluding navigation) in `src/types/`.
    *   Navigation-specific types in `src/navigation/navigation.types.ts`.
    *   Component-specific props/state types co-located or clearly imported.

### 1.2. Code Style & Readability
*   **Semantic Naming:** Use clear, descriptive names for variables, functions, components, and files that reflect their purpose.
*   **Modularity:** Break down complex components and logic into smaller, manageable, and reusable functions or components.
*   **Code Comments:** Use JSDoc for components, props, public functions, and complex logic sections to improve understanding and maintainability.
*   **Consistency:** Maintain consistent coding patterns, naming conventions, and file structures throughout the project.

### 1.3. Component Design
*   **Atomic Design Principles:** Structure components hierarchically:
    *   **Atoms:** Basic UI elements (e.g., `Button`, `Input`, `StyledText`, `Icon`). Reside in `src/components/common/`.
    *   **Molecules:** Simple combinations of atoms forming a distinct unit (e.g., `SearchInput`, `FormGroup`).
    *   **Organisms:** More complex UI components composed of molecules and/or atoms (e.g., `PetList`, `SitterProfileCard`).
    *   **Templates/Pages (Screens):** Top-level screen components in `src/screens/`.
*   **Reusable Components:** Prioritize creating generic, reusable components for common UI elements and place them in `src/components/common/` or `src/components/layout/` as appropriate.
*   **Single Responsibility Principle (SRP):** Components and functions should ideally have one primary responsibility.

### 1.4. State Management
*   **Local State:** Use `useState` for component-local state.
*   **Shared State:** For state shared between few components, consider prop drilling or React Context.
*   **Global State:** For application-wide state (e.g., user authentication, theme), use a dedicated state management library (e.g., Zustand, Redux Toolkit) organized in `src/store/`.

### 1.5. Asynchronous Operations & Data Handling
*   **Loading States:** Always provide clear visual feedback (spinners, skeleton loaders, disabled states) for any asynchronous operation.
*   **Error Handling:** Implement robust error handling for API calls, form submissions, and other critical operations. Use `try-catch` blocks, error boundaries, and display user-friendly error messages.
*   **API Services:** Abstract API call logic into dedicated service files within `src/services/`.

### 1.6. Navigation
*   **Centralized Setup:** Main navigation stack and routing logic reside in `src/navigation/AppNavigator.tsx`.
*   **Type-Safe Navigation:** Utilize `src/navigation/navigation.types.ts` for strong typing of route names and parameters.
*   **Tools:** Use `@react-navigation/native` and `@react-navigation/native-stack`.

### 1.7. Styling & Theming
*   **Centralized Theme:** All styling values (colors, spacing, border radius, typography, icon sizes) must be sourced from a central theme file: `src/theme/theme.ts`.
*   **Styled Components (or similar):** Prefer a structured approach to styling (e.g., `StyleSheet.create`, or if a library like `styled-components` is introduced, use it consistently).

### 1.8. Iconography
*   **Source:** Use icons exclusively from `lucide-react-native`.
*   **Consistency:** Adhere to consistent icon sizing defined in `src/theme/theme.ts`.
*   **Interactivity:** Interactive icons should use primary or accent colors from the theme.

### 1.9. Project Structure & File Naming
*   **Directory Structure:** Follow the defined `src/` sub-directory structure (e.g., `assets/`, `components/`, `hooks/`, `navigation/`, `screens/`, `services/`, `store/`, `theme/`, `types/`, `utils/`).
*   **File Naming Conventions:**
    *   Components & Screens: `PascalCase.tsx`
    *   Hooks: `useCamelCase.ts`
    *   Other TS/JS files: `camelCase.ts` or `kebab-case.ts`
    *   Test files: `*.test.tsx` or `*.spec.tsx`

### 1.10. Accessibility (A11y)
*   Ensure components are accessible by providing `accessibilityLabel`, `accessibilityHint`, and other relevant ARIA-like props.

### 1.11. Development Process Guidance
*   **Foundation First:** Prioritize setting up the project structure, theme, core navigation, and common reusable components.
*   **Iterative Development:** Implement screens and features iteratively, starting with core functionality (e.g., auth, profile creation) before moving to more complex features.
*   **Refactor for Reusability:** As patterns emerge, refactor to create or improve reusable components.