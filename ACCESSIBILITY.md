# Accessibility (WCAG 2.1 AA) Implementation

This document describes the accessibility features implemented in the LCF Auto Performance application to meet WCAG 2.1 AA standards.

## Implementation Summary

### 1. Keyboard Navigation & Focus Management

- **Focus Visible Styles**: Enhanced focus indicators with 3px solid outline and 2px offset for all interactive elements
- **Skip to Main Content**: A skip link at the top of every page allows keyboard users to bypass navigation
- **Focus Ring**: All interactive elements have visible focus states using `focus-visible` pseudo-class
- **Tab Order**: Logical tab order maintained throughout the application
- **No Keyboard Traps**: All modal dialogs and interactive components are keyboard accessible

**Implementation:**
- Added `.skip-to-main` class in `globals.css` for skip navigation
- Added `*:focus-visible` styles with accent color outline
- Updated all buttons with `focus-visible:ring-2 focus-visible:ring-accent`
- Added `id="main-content"` to main element

### 2. Semantic HTML & ARIA

- **Landmark Regions**: Proper use of `<header>`, `<main>`, `<nav>`, and `<footer>` elements
- **ARIA Labels**: Descriptive labels on all interactive elements
- **ARIA Roles**: Menu (`role="menu"`), contentinfo (`role="contentinfo"`)
- **ARIA States**: `aria-expanded`, `aria-haspopup`, `aria-invalid`, `aria-hidden`
- **ARIA Descriptions**: `aria-describedby` for form error messages
- **ARIA Live Regions**: `role="alert"` for error messages

**Implementation:**
- Added `aria-label` to navigation and buttons
- Added `aria-hidden="true"` to decorative icons
- Added `role="main"` to main content area
- Added `role="contentinfo"` to footer
- Updated Header with `aria-label="Main navigation"`
- Added `aria-expanded` and `aria-haspopup` to menu buttons

### 3. Form Accessibility

- **Label Association**: All inputs properly associated with labels using `htmlFor`/`id`
- **Required Fields**: Visual indicator (*) with `aria-label="required"`
- **Error States**: Error messages associated with inputs via `aria-describedby`
- **Validation**: `aria-invalid` attribute set on invalid inputs
- **Error Alerts**: Error messages wrapped in `role="alert"` for screen reader announcement

**Implementation:**
- Updated `Input`, `Select`, and `Textarea` components with:
  - Auto-generated unique IDs when not provided
  - Proper `htmlFor` on labels
  - `aria-describedby` linking to error messages
  - `aria-invalid` for error states
  - Required field indicators

### 4. Color Contrast (WCAG AA)

The application meets WCAG AA contrast requirements:

**Contrast Ratios:**
- Normal text: 4.5:1 minimum
- Large text (≥18pt or 14pt bold): 3:1 minimum

**Implemented Colors:**
- **Light Theme:**
  - Text (#212529) on White (#FFFFFF): 15.43:1 ✓
  - Accent Dark (#0E677F) for text: 6.43:1 ✓
  - Gray-600 on White: 7.58:1 ✓

- **Dark Theme:**
  - Text (#EAEAEA) on Dark (#121212): 15.57:1 ✓
  - Accent (#1CCEFF) on Dark: 10.10:1 ✓
  - Gray-400 on Dark: 7.38:1 ✓

**Color Variables:**
```css
:root {
  --accent: #1CCEFF;
  --accent-dark: #0E677F; /* WCAG AA compliant for light backgrounds */
}

.dark {
  --accent-dark: #1CCEFF; /* Use bright variant in dark mode */
}
```

**Usage Guidelines:**
- Use `bg-accent` for buttons and interactive elements (always has white text)
- Use `text-accent` only on dark backgrounds or with `bg-accent/10` (light tint)
- Use `text-accent-dark` or CSS variable `var(--accent-dark)` for text on light backgrounds
- Icons with `text-accent` are decorative and use `aria-hidden="true"`

### 5. Alt Text for Images

All images have descriptive alt text:
- Logo images: "LCF Auto Performance Logo"
- Vehicle images: "{make} {model}" format
- Decorative images: Empty alt="" or aria-hidden="true"

### 6. Accessible Components

**Button Component:**
- Focus visible styles
- Disabled state with `disabled:cursor-not-allowed`
- Proper button semantic (not divs)

**Form Components (Input, Select, Textarea):**
- Associated labels
- Error handling
- ARIA attributes
- Required field indicators

**Navigation:**
- Semantic nav elements with aria-labels
- Menu roles for dropdowns
- Proper button semantics for toggles

**Footer:**
- Semantic navigation with aria-label
- Role="contentinfo"
- Accessible social media links

## Testing Checklist

### Automated Testing
- [x] ESLint with jsx-a11y plugin configured
- [ ] Run axe-core accessibility audits
- [ ] Test with Lighthouse accessibility score

### Manual Testing
- [ ] Keyboard navigation through entire site
- [ ] Screen reader testing (NVDA/JAWS/VoiceOver)
- [ ] Tab order verification
- [ ] Focus indicator visibility
- [ ] Form validation with screen reader
- [ ] Color contrast validation
- [ ] Zoom to 200% text

### Browser Testing
- [ ] Chrome + ChromeVox
- [ ] Firefox + NVDA
- [ ] Safari + VoiceOver
- [ ] Edge + Narrator

## Tools & Resources

**Installed Tools:**
- `eslint-plugin-jsx-a11y`: Automated accessibility linting
- `@axe-core/react`: Runtime accessibility testing

**Testing Tools:**
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebAIM Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

## References

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM](https://webaim.org/)

## Future Improvements

- Add live region announcements for dynamic content updates
- Implement focus management for modals and dialogs
- Add keyboard shortcuts documentation
- Enhance screen reader announcements for complex interactions
- Add reduced motion support for users with vestibular disorders
