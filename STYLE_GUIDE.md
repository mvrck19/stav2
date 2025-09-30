# Style Guide

This document defines the unified styling patterns used throughout the Greek Quiz application.

## CSS Architecture

All styles are defined in `input.css` using:
- **CSS Custom Properties** (`:root` variables) for colors and effects
- **Tailwind's `@layer components`** for reusable component classes
- **Direct CSS properties** to avoid Tailwind utility conflicts

## Color Palette

**Sources**:
- `palette.txt` - Syntax category palette
- `grammar_palette.txt` - Grammar category palette (with Cadet Gray instead of Olivine)

### Shared Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **White** | `#FFFFFF` | rgb(255, 255, 255) | Base backgrounds |
| **Timberwolf** | `#D7D8D7` | rgb(215, 216, 215) | Neutral/wrong states |
| **Indigo dye** | `#244B6B` | rgb(36, 75, 107) | Primary brand, text, buttons |
| **Nyanza** | `#CDDDC5` | rgb(205, 221, 197) | Success/correct states |

### Category-Specific Accent Colors

| Category | Color Name | Hex | RGB | Usage |
|----------|-----------|-----|-----|-------|
| **Syntax** | Olivine | `#ACC499` | rgb(172, 196, 153) | Hover, selected states |
| **Grammar** | Cadet Gray | `#99A8B5` | rgb(153, 168, 181) | Hover, selected states |

### Palette CSS Variables
```css
/* Shared */
--color-white: #FFFFFF;
--color-timberwolf: #D7D8D7;
--color-indigo: #244B6B;
--color-nyanza: #CDDDC5;

/* Category-Specific */
--color-olivine: #ACC499;      /* Syntax */
--color-cadet-gray: #99A8B5;   /* Grammar */
```

## Design Tokens

### Glass Morphism
```css
--glass-bg: rgba(255, 255, 255, 0.65);
--glass-border: rgba(215, 216, 215, 0.6);  /* Timberwolf */
--glass-shadow: 0 8px 32px rgba(36, 75, 107, 0.15);  /* Indigo */
--glass-blur: blur(12px);
```

### Text Colors
```css
--text-primary: #244B6B;    /* Indigo dye */
--text-secondary: #ACC499;  /* Olivine */
```

### Button Colors
```css
--btn-primary: #244B6B;         /* Indigo dye */
--btn-primary-hover: #1d3c56;   /* Darker indigo */
--btn-secondary: #ACC499;       /* Olivine */
--btn-secondary-hover: #88aa6b; /* Darker olivine */
```

### State Colors

**Syntax (default):**
- **Hover**: Nyanza `rgba(205, 221, 197, 0.65)` with Olivine border
- **Selected**: Olivine `rgba(172, 196, 153, 0.75)` with Indigo text
- **Correct**: Nyanza `rgba(205, 221, 197, 0.75)` with Olivine border
- **Wrong**: Timberwolf `rgba(215, 216, 215, 0.75)` with Indigo text

**Grammar (when `.grammar` class is applied):**
- **Hover**: Nyanza `rgba(205, 221, 197, 0.65)` with Cadet Gray border
- **Selected**: Cadet Gray `rgba(153, 168, 181, 0.75)` with Indigo text
- **Correct**: Nyanza `rgba(205, 221, 197, 0.75)` with Cadet Gray border
- **Wrong**: Same as syntax

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