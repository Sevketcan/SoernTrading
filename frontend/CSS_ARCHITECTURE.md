# CSS Modules Architecture Guide

This document outlines the CSS architecture for our Next.js application using CSS Modules with Tailwind's `@apply` directive.

## 📁 Folder Structure

```
src/
├── styles/
│   ├── components/          # Component-specific styles
│   │   ├── Header.module.css
│   │   ├── Button.module.css
│   │   └── Modal.module.css
│   ├── layout/              # Layout-related styles
│   │   ├── Footer.module.css
│   │   ├── Sidebar.module.css
│   │   └── Navigation.module.css
│   ├── pages/               # Page-specific styles
│   │   ├── home.module.css
│   │   ├── login.module.css
│   │   └── dashboard.module.css
│   └── common/              # Shared/reusable styles
│       ├── buttons.module.css
│       ├── forms.module.css
│       └── cards.module.css
├── components/
├── app/
│   └── globals.css          # Global styles only
└── lib/
    └── css-utils.ts         # CSS utility functions
```

## 🎯 Design Principles

### 1. **Separation of Concerns**
- **globals.css**: Only resets, fonts, and dark mode settings
- **CSS Modules**: All component and layout styling
- **No inline classes**: All styling through `@apply` directive

### 2. **Maintainability**
- Consistent naming conventions
- Logical file organization
- Reusable patterns
- Clear documentation

### 3. **Scalability**
- Modular architecture
- Theme-aware components
- Utility functions for common patterns
- TypeScript support

## 📝 Naming Conventions

### CSS Class Names
```css
/* Component base */
.header { }
.button { }
.modal { }

/* Variants */
.headerDark { }
.buttonPrimary { }
.buttonSecondary { }
.modalLarge { }

/* States */
.buttonLoading { }
.buttonDisabled { }
.modalOpen { }

/* Responsive */
.mobileNav { }
.desktopNav { }

/* Nested elements */
.headerLogo { }
.headerNavigation { }
.buttonIcon { }
```

### File Names
- Use kebab-case: `Header.module.css`
- Match component names: `UserProfile.tsx` → `UserProfile.module.css`
- Descriptive names: `auth-forms.module.css`, `data-tables.module.css`

## 🎨 CSS Module Examples

### Component Style Example
```css
/* styles/components/Button.module.css */

.button {
  @apply inline-flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.buttonPrimary {
  @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500;
}

.buttonPrimaryDark {
  @apply bg-blue-500 hover:bg-blue-600 focus:ring-blue-400;
}

.buttonSecondary {
  @apply bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500;
}

.buttonSecondaryDark {
  @apply bg-gray-700 text-gray-100 hover:bg-gray-600 focus:ring-gray-400;
}

.buttonSmall {
  @apply px-3 py-1.5 text-sm;
}

.buttonLarge {
  @apply px-6 py-3 text-lg;
}

.buttonDisabled {
  @apply opacity-50 cursor-not-allowed;
}
```

### Component Usage Example
```tsx
// components/Button.tsx
import { useTheme } from 'next-themes';
import { cn } from '@/lib/css-utils';
import styles from '@/styles/components/Button.module.css';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ 
  variant = 'primary', 
  size = 'medium', 
  disabled = false,
  children,
  onClick 
}: ButtonProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const buttonClass = cn(
    styles.button,
    variant === 'primary' ? styles.buttonPrimary : styles.buttonSecondary,
    isDark && variant === 'primary' ? styles.buttonPrimaryDark : styles.buttonSecondaryDark,
    size === 'small' && styles.buttonSmall,
    size === 'large' && styles.buttonLarge,
    disabled && styles.buttonDisabled
  );

  return (
    <button 
      className={buttonClass}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

## 🌙 Dark Mode Implementation

### CSS Module Approach
```css
/* Base styles */
.card {
  @apply bg-white border border-gray-200 rounded-lg p-6;
}

/* Dark mode variant */
.cardDark {
  @apply bg-gray-800 border-gray-700;
}

.title {
  @apply text-xl font-semibold text-gray-900;
}

.titleDark {
  @apply text-white;
}
```

### Component Implementation
```tsx
import { useTheme } from 'next-themes';
import { cn } from '@/lib/css-utils';
import styles from '@/styles/components/Card.module.css';

export function Card({ title, children }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div className={cn(styles.card, isDark && styles.cardDark)}>
      <h2 className={cn(styles.title, isDark && styles.titleDark)}>
        {title}
      </h2>
      {children}
    </div>
  );
}
```

## 🛠 Utility Functions

### Basic Class Combining
```tsx
import { cn } from '@/lib/css-utils';

// Simple combining
const className = cn(styles.base, isActive && styles.active);

// With conditions
const className = cn(
  styles.button,
  variant === 'primary' && styles.primary,
  isLoading && styles.loading,
  disabled && styles.disabled
);
```

### Theme Helper
```tsx
import { useThemeClasses } from '@/lib/css-utils';

export function MyComponent() {
  const { isDark, cx, themeClass } = useThemeClasses();

  return (
    <div className={themeClass(styles.container, styles.containerDark)}>
      <button className={cx(styles.button, isDark && styles.buttonDark)}>
        Click me
      </button>
    </div>
  );
}
```

## 📦 Reusable Patterns

### Common Button Styles
```css
/* styles/common/buttons.module.css */
@import 'tailwindcss';

.btnBase {
  @apply inline-flex items-center justify-center font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btnPrimary {
  @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500;
}

.btnSecondary {
  @apply bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500;
}

.btnDanger {
  @apply bg-red-600 text-white hover:bg-red-700 focus:ring-red-500;
}
```

### Form Styles
```css
/* styles/common/forms.module.css */
.formGroup {
  @apply space-y-2;
}

.label {
  @apply block text-sm font-medium text-gray-700;
}

.labelDark {
  @apply text-gray-300;
}

.input {
  @apply block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500;
}

.inputDark {
  @apply border-gray-600 bg-gray-700 text-white placeholder-gray-400;
}

.inputError {
  @apply border-red-300 focus:ring-red-500 focus:border-red-500;
}

.errorMessage {
  @apply text-sm text-red-600;
}

.errorMessageDark {
  @apply text-red-400;
}
```

## 🚀 Best Practices

### 1. **Component Organization**
```tsx
// Good: Clear structure with imports at top
import { useTheme } from 'next-themes';
import { cn } from '@/lib/css-utils';
import styles from '@/styles/components/Header.module.css';

export function Header() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <header className={cn(styles.header, isDark && styles.headerDark)}>
      {/* Content */}
    </header>
  );
}
```

### 2. **CSS Class Organization**
```css
/* Group related styles together */

/* Base Component */
.card {
  @apply bg-white rounded-lg shadow-sm border border-gray-200;
}

.cardDark {
  @apply bg-gray-800 border-gray-700;
}

/* Card Elements */
.cardHeader {
  @apply px-6 py-4 border-b border-gray-200;
}

.cardHeaderDark {
  @apply border-gray-700;
}

.cardBody {
  @apply px-6 py-4;
}

.cardFooter {
  @apply px-6 py-4 border-t border-gray-200;
}

.cardFooterDark {
  @apply border-gray-700;
}

/* Card Variants */
.cardLarge {
  @apply p-8;
}

.cardCompact {
  @apply p-3;
}
```

### 3. **Consistent Naming**
- Use descriptive names: `userProfileCard` not `card1`
- Follow patterns: `buttonPrimary`, `buttonSecondary`, `buttonDanger`
- Dark mode suffix: `headerDark`, `buttonPrimaryDark`
- State suffixes: `buttonLoading`, `modalOpen`, `inputError`

### 4. **Performance Optimization**
- Use CSS Modules for automatic class name hashing
- Leverage Tailwind's purging to remove unused styles
- Group related styles to reduce bundle size
- Use CSS custom properties for dynamic values

## 🔧 Configuration Files

### Tailwind Config
```js
// tailwind.config.js
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/styles/**/*.{css,scss,sass}', // Important: Include CSS modules
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Custom theme extensions
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

### TypeScript Config
```json
// tsconfig.json - Add path mapping
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/styles/*": ["./src/styles/*"]
    }
  }
}
```

## 🧪 Testing CSS Modules

### Component Testing
```tsx
// __tests__/Button.test.tsx
import { render } from '@testing-library/react';
import { Button } from '@/components/Button';

test('applies correct CSS classes', () => {
  const { container } = render(
    <Button variant="primary" size="large">
      Test Button
    </Button>
  );
  
  const button = container.querySelector('button');
  expect(button?.className).toContain('button');
  expect(button?.className).toContain('buttonPrimary');
  expect(button?.className).toContain('buttonLarge');
});
```

### Visual Regression Testing
Consider using tools like:
- **Chromatic** for Storybook integration
- **Percy** for automated visual testing
- **Playwright** for E2E visual testing

## 📚 Additional Resources

- [CSS Modules Documentation](https://github.com/css-modules/css-modules)
- [Tailwind CSS @apply Directive](https://tailwindcss.com/docs/functions-and-directives#apply)
- [Next.js CSS Modules](https://nextjs.org/docs/basic-features/built-in-css-support#adding-component-level-css)
- [next-themes Documentation](https://github.com/pacocoursey/next-themes)

## 🎯 Migration Checklist

- [ ] Create styles directory structure
- [ ] Move inline Tailwind classes to CSS modules
- [ ] Implement dark mode variants
- [ ] Add utility functions
- [ ] Update component imports
- [ ] Test responsive behavior
- [ ] Document component APIs
- [ ] Set up linting rules for CSS modules
``` 