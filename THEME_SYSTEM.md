# EpiTrelloo - Theme System Documentation

## Overview
EpiTrelloo now features a fully functional dark/light theme system with professional Trello-like styling.

## Features

### Theme Toggle
- **Location**: Navbar (sun/moon icon next to Organizations link)
- **Persistence**: Theme preference saved to localStorage
- **Smooth Transitions**: All color changes animated with 0.2s ease
- **System-wide**: Affects all pages and components instantly

### Color System

#### Light Theme (Default)
- **Primary Blue**: #0079bf (Trello blue)
- **Background**: #ffffff (white), #f4f5f7 (secondary), #ebecf0 (tertiary)
- **Text**: #172b4d (primary), #5e6c84 (secondary), #8993a4 (muted)
- **Borders**: #dfe1e6 (primary), #c1c7d0 (secondary)

#### Dark Theme
- **Primary Blue**: #4c9aff (brighter for dark mode)
- **Background**: #1d2125 (primary), #282e33 (secondary), #22272b (tertiary)
- **Text**: #b6c2cf (primary), #9fadbc (secondary), #8c9bab (muted)
- **Borders**: #38414a (primary), #454f59 (secondary)

### CSS Variables
All colors are defined as CSS variables in `global.css`:
```css
:root[data-theme="light"] { /* light theme vars */ }
:root[data-theme="dark"] { /* dark theme vars */ }
```

### Components Updated

1. **Global Styles** (`global.css`)
   - CSS variables for both themes
   - Form elements
   - Buttons (primary, secondary, danger)
   - Typography
   - Layout containers
   - Scrollbars
   - Utility classes

2. **Navbar** (`navbar.css`)
   - Uses primary gradient
   - Theme toggle button with icon rotation animation
   - Smooth hover effects

3. **Board Page** (`board.css`)
   - Board background adapts to theme
   - Backdrop filter for header
   - Column and card backgrounds

4. **Columns** (`column.css`)
   - Tertiary background color
   - Themed scrollbars
   - Hover states

5. **Cards** (`card.css`)
   - Primary background
   - Status badges (due dates, priorities)
   - Modal overlays
   - Progress bars

6. **Authentication** (`auth.css`)
   - Login/Register pages
   - Form inputs and buttons
   - Error messages

7. **Organizations** (`organizations.css`, `organization-detail.css`)
   - List and detail views
   - Member management
   - Role badges

8. **Profile** (`profile.css`, `user-profile.css`)
   - User profiles
   - Stats cards
   - Tab navigation

9. **Modals** (`modal.css`, `sharing-modal.css`)
   - Overlay backgrounds
   - Card modals
   - Sharing modals

## Usage

### In Components
```jsx
import { useTheme } from '../context/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      {theme === 'light' ? 'Dark' : 'Light'} Mode
    </button>
  );
}
```

### In CSS
Use CSS variables instead of hardcoded colors:
```css
/* ❌ Bad */
.my-element {
  background: #ffffff;
  color: #172b4d;
}

/* ✅ Good */
.my-element {
  background: var(--bg-primary);
  color: var(--text-primary);
}
```

## Available CSS Variables

### Colors
- `--primary-blue`, `--primary-blue-hover`, `--primary-blue-dark`
- `--primary-gradient`

### Backgrounds
- `--bg-primary`, `--bg-secondary`, `--bg-tertiary`
- `--bg-hover`, `--bg-active`, `--bg-overlay`

### Text
- `--text-primary`, `--text-secondary`, `--text-muted`
- `--text-inverse`, `--text-link`

### Borders
- `--border-primary`, `--border-secondary`, `--border-focus`

### Input
- `--input-bg`, `--input-border`, `--input-border-hover`, `--input-border-focus`
- `--input-text`, `--input-placeholder`

### Buttons
- `--btn-primary-bg`, `--btn-primary-hover`, `--btn-primary-text`
- `--btn-secondary-bg`, `--btn-secondary-hover`, `--btn-secondary-text`
- `--btn-danger-bg`, `--btn-danger-hover`

### Status
- `--success`, `--warning`, `--error`, `--info`

### Shadows
- `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`, `--shadow-card`

### Board
- `--board-bg`

## Best Practices

1. **Always use CSS variables** for colors, shadows, and theme-dependent values
2. **Add transitions** to elements that change with theme: `transition: background 0.2s ease, color 0.2s ease;`
3. **Test both themes** when adding new components
4. **Use semantic variable names** (e.g., `var(--text-primary)` not `var(--color-172b4d)`)
5. **Maintain contrast ratios** for accessibility in both themes

## Accessibility

- Light theme: WCAG AAA contrast ratios
- Dark theme: WCAG AA contrast ratios
- Focus states clearly visible in both themes
- Color is not the only means of conveying information

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- IE11: Not supported (CSS variables required)

## Future Enhancements

- [ ] Additional theme options (high contrast, colorblind modes)
- [ ] Per-board custom themes
- [ ] Theme scheduling (auto-switch at sunset)
- [ ] Accent color customization
- [ ] Save theme preference to user account (backend)
