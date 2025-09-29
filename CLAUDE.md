# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Greek language quiz application focused on grammar and syntax. It's a static web project that runs entirely client-side using HTML, CSS (Tailwind), JavaScript, and JSON data files.

**Deployment**: This project is designed for GitHub Pages deployment. All files should be in the root directory for proper GitHub Pages serving.

## Commands

### Development
- `npm run dev` - Build CSS and start development server on port 3000
- `npm run build-css` - Watch mode for Tailwind CSS compilation
- `npm run build-css-prod` - Production CSS build (minified)
- `npm start` - Start static server on port 3000

### Testing
- `npm test` - Run Playwright tests
- `npm run test:ui` - Run Playwright tests with UI mode

### Build
- `npm run build` - Production build (same as build-css-prod)

## Architecture

### SVG Background Architecture
The application uses a unique **SVG background architecture**:

- **SVG files** (`grammar_q.svg`, `grammar_a.svg`, `syntax_q.svg`, `syntax_a.svg`) serve as CSS background images
- **HTML content** is overlaid on top using positioned elements with classes like `.question-area`, `.answer-area`
- **No SVG foreign objects** or embedded HTML inside SVG elements
- **3D card flipping** animations are implemented with CSS transforms on HTML containers

This approach provides better accessibility, easier content management, and consistent styling while maintaining visual design.

### Key Architecture Components
- **Data-driven**: Quiz content stored in `app/questions.json`
- **Client-side only**: No server-side logic, suitable for GitHub Pages
- **Mobile-first**: Responsive design with extensive mobile testing
- **Category-based**: Questions organized by grammar and syntax categories

## File Structure

### Core Application Files
- `index.html` - Main HTML entry point with card-background divs and overlay content areas
- `quiz-app.js` - Quiz logic with direct HTML DOM manipulation (no SVG foreign object access)
- `questions.json` - Quiz data and question content
- `styles.css` - Compiled Tailwind CSS output
- `input.css` - Tailwind CSS source file

### Configuration
- `tailwind.config.js` - Tailwind configuration with custom colors, animations, and component layers
- `package.json` - Dependencies and build scripts
- `.vscode/tasks.json` - VS Code tasks for common operations

### Testing
- `tests/*.spec.ts` - Playwright end-to-end tests covering:
  - Category selection
  - Question display
  - Score tracking and persistence
  - Mobile responsiveness
  - SVG interactivity
  - Navigation flows

### Assets
- `svg/` - SVG background images for different categories and states
- `goals.jpg` - Static image asset

## Development Patterns

### CSS & Styling
- **Tailwind CSS** is the primary styling approach
- Custom Tailwind configuration extends colors, animations, and component styles
- SVG backgrounds use specific classes (`.card-background`, `.question-bg`, `.answer-bg`)
- Responsive, mobile-first design patterns

### JavaScript Architecture
- Vanilla JavaScript with direct DOM manipulation
- No frameworks or external libraries beyond build tools
- Event-driven architecture for user interactions
- LocalStorage for high score persistence

### Content Management
- Questions stored in structured JSON format in `questions.json`
- SVG naming convention: `*_q.svg` for questions, `*_a.svg` for answers
- Separation of concerns: data (JSON), visuals (SVG), content overlays (HTML/CSS), logic (JS)

## Important Development Notes

### SVG Background Pattern
When working with the card interface, always use:
```html
<div class="card-background question-bg">
  <!-- HTML content overlays here -->
</div>
```

### Direct DOM Updates
- Update HTML elements directly, not SVG foreign objects
- Use standard DOM APIs for content manipulation
- SVGs are purely decorative backgrounds

### Testing Strategy
- Playwright for comprehensive end-to-end testing
- Focus on mobile responsiveness and touch interactions
- Test SVG background functionality and card flipping animations