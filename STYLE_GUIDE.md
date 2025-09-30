# Style Guide

This document defines the unified styling patterns used throughout the Greek Quiz application.

## CSS Architecture

All styles are defined in `input.css` using:
- **CSS Custom Properties** (`:root` variables) for colors and effects
- **Tailwind's `@layer components`** for reusable component classes
- **Direct CSS properties** to avoid Tailwind utility conflicts

## Design Tokens

### Glass Morphism
```css
--glass-bg: rgba(255, 255, 255, 0.65);
--glass-border: rgba(255, 255, 255, 0.6);
--glass-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
--glass-blur: blur(12px);
```

### Text Colors
```css
--text-primary: #1a365d;  /* Dark blue for primary text */
--text-blue: #1e3a8a;     /* Blue for interactive text */
```

### Button Colors
```css
--btn-primary: #235789;
--btn-primary-hover: #1d466b;
```

### State Colors
- **Hover**: `rgba(239, 246, 255, 0.65)`
- **Selected**: `rgba(255, 237, 213, 0.65)` with `#9a3412` text
- **Correct**: `rgba(220, 252, 231, 0.65)` with `#14532d` text
- **Wrong**: `rgba(254, 226, 226, 0.65)` with `#7f1d1d` text

## Component Patterns

### Glass Text Containers

All text boxes inside cards use the unified glass morphism style:

```css
.question-text-area,
.answer-text-area,
.choice-button {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: var(--glass-blur);
  box-shadow: var(--glass-shadow);
  color: var(--text-primary);
  font-weight: 600;
  @apply rounded-xl text-center;
}
```

**Usage in HTML:**
```html
<div class="question-text-area">Question text</div>
<div class="answer-text-area">Answer text</div>
<button class="choice-button">Choice option</button>
```

### Buttons

All buttons use the unified gradient-primary style:

**Primary Button (for actions):**
```html
<button class="gradient-primary text-white px-4 py-2 rounded-2xl text-sm font-semibold shadow-lg transition-all">
  Button Text
</button>
```

**Examples:**
- Back to Categories button
- Submit/Next button
- Summary Return button
- Global Score badge (non-interactive)

### Text Content Styles

Answer display text uses unified styling:

```css
.result-status,
.user-choice,
.correct-answer,
.explanation {
  color: var(--text-primary);
  font-weight: 600;
}
```

### Progress Counter

```html
<div class="text-sm text-primary bg-white bg-opacity-90 px-4 py-2 rounded-xl shadow-md font-semibold">
  0 / 0
</div>
```

## Spacing & Layout

### Rounded Corners
- Cards and glass containers: `rounded-xl` (0.75rem)
- Buttons and badges: `rounded-2xl` (1rem)

### Padding
- Large buttons: `px-6 py-3`
- Small buttons/badges: `px-4 py-2`
- Text containers: `p-4` to `p-6`

### Text Sizes
- Large headings: `text-4xl`
- Section headings: `text-2xl`
- Button text: `text-sm`
- Body text: `text-sm` to `text-base`
- Helper text: `text-xs`

### Shadows
- Standard: `shadow-lg`
- Medium: `shadow-md`
- Small: `shadow-sm`

## State Management in JavaScript

### Button Text Updates

When changing button text, always use `textContent`:
```javascript
submitBtn.textContent = 'Επόμενη';
```

### Answer Display

CSS `::before` pseudo-elements add labels, so JavaScript should only set content:
```javascript
userChoice.textContent = q.choices[chosenOriginalIndex];  // CSS adds "Η απάντησή σου: "
correctAnswer.textContent = q.choices[q.correctIndex];    // CSS adds "Σωστή απάντηση: "
```

## Color Consistency Rules

1. **All action buttons** must use `gradient-primary` for consistency
2. **All text containers in cards** must use `glass-text-container` base styles
3. **All state changes** (hover, selected, correct, wrong) must use defined CSS variables
4. **Never use inline Tailwind utilities** that conflict with component classes

## Responsive Design

Mobile adjustments are in the `@media (max-width: 768px)` section of `input.css`:
- Reduced font sizes
- Adjusted padding
- Modified card positioning

## Best Practices

1. **Always use CSS variables** instead of hardcoded values
2. **Group related selectors** to avoid repetition
3. **Keep opacity consistent** at 65% for all glass containers
4. **Maintain visual hierarchy** through consistent sizing and spacing
5. **Test on mobile** after any style changes