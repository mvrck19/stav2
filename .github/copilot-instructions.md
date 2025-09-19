# Copilot Instructions for This Project

## Project Overview
This is a static web project consisting of HTML, CSS, SVG images, and a JSON file. It appears to be an educational or quiz-style site, likely focused on grammar and syntax.  
It follows modern software development best practices with emphasis on clean code, security, and maintainability.

## Key Files and Structure
- `index.html`: Main entry point. Loads the UI and references other assets.
- `styles.css`: Contains all styling for the site.
- `questions.json`: Holds quiz or question data.
- `grammar_a.svg`, `grammar_q.svg`, `syntax_a.svg`, `syntax_q.svg`: SVG images used for visual content.
- No build system, package manager, or backend code is present.

## Patterns and Conventions
- All logic is expected inlined or referenced via `<script>` in `index.html`.
- Data-driven: content stored in `questions.json`.
- SVGs follow naming (`*_q.svg`, `*_a.svg`).
- Separation of concerns:  
  - Data (`questions.json`)  
  - Visuals (SVGs)  
  - Logic/UI (`index.html`, `styles.css`)

### CSS & Layout (Tailwind)
- Prefer using **Tailwind CSS** for utility-first styling. For small/quick previews you may use the Tailwind CDN, but for production add Tailwind as a dev dependency and build a compiled stylesheet.
- Use Tailwind utilities for responsive, mobile-first layouts; utilities map to Flexbox/Grid features (`flex`, `grid`, `gap`, `items-center`, etc.).
- Use Tailwind's spacing and sizing scale instead of raw pixel values; prefer `rem`-based utility classes provided by Tailwind.
- Keep HTML semantic and accessible — Tailwind controls presentation only.
- When a project needs custom design tokens, extend `tailwind.config.js` rather than scattering custom CSS.

---

# Coding Standards

## Code Quality
- Clean, readable code with descriptive names.  
- Consistent indentation (spaces preferred).  
- Functions small and single-responsibility.  
- Comments for complex logic only.  
- Follow language naming conventions.

## Security
- Never hardcode secrets.  
- Validate and sanitize input.  
- Parameterized queries if database used.  
- Secure auth patterns.  
- Handle errors gracefully, avoid leaks.  
- Follow OWASP Top 10.

## Performance
- Optimize queries and data structures.  
- Use caching where beneficial.  
- Consider lazy loading.  
- Avoid memory leaks.

## Error Handling
- Use try–catch.  
- Structured error responses.  
- Fail-secure defaults.  
- Log without exposing sensitive data.

---

# Testing
- Use [Playwright](https://playwright.dev/) for end-to-end tests (focus mobile).  
- Unit tests for new functions.  
- Integration tests for workflows.  
- Mock external dependencies.  
- Good coverage on critical paths.

---

# Documentation
- Keep this file updated.  
- JSDoc/docstrings for public functions.  
- Maintain README.  
- Document APIs with examples.  
- Inline comments for complex algorithms.

---

# Dependencies
- Use Tailwind as a development dependency (`tailwindcss`, `postcss`, `autoprefixer`) when compiling CSS.
- For tiny experiments, the official Tailwind CDN (`https://cdn.tailwindcss.com`) is acceptable but not recommended for production.
- Pin Tailwind and PostCSS versions in `package.json` for reproducible builds.
- Regularly run `npm audit` and update dependencies.

---

# Git and Version Control
- Clear, descriptive commit messages.  
- Use conventional commits where possible.  
- Keep commits atomic.  
- Branch per feature.  
- Link to issues in commits.

---

# Code Review
- Add TODOs for security review.  
- Flag sensitive-data handling code.  
- Suggest improvements for readability/maintainability.  
- Verify consistency with codebase.

---

# Framework-Specific Guidelines

### Web Development
- Semantic HTML.  
- Responsive, accessible UI (WCAG).  
- Optimize bundle size, use lazy loading.  
- Secure cookies and CSP headers.

### Database (if added later)
- Use migrations.  
- Index queried columns.  
- Normalize appropriately.  
- Use transactions for multi-step operations.  
- Plan backup and recovery.

---

# Build and Deployment (with Tailwind)
- Add a small build step to compile Tailwind into a single `dist/styles.css` artifact.
- Example PowerShell commands to set up Tailwind locally:

```powershell
# Initialize project (if not already initialized)
npm init -y

# Install Tailwind and build tooling
npm install -D tailwindcss postcss autoprefixer

# Create config files
npx tailwindcss init -p

# Create source stylesheet `src/input.css` containing:
## @tailwind base;
## @tailwind components;
## @tailwind utilities;

# Build once
npx tailwindcss -i ./src/input.css -o ./dist/styles.css --minify

# Or start a watch build for development
npx tailwindcss -i ./src/input.css -o ./dist/styles.css --watch
```

- CI/CD: include the build step in your pipeline so `dist/styles.css` is generated before deployment.
- Keep `styles.css` in source control only if it's a compiled artifact required by your static host; otherwise add `dist/` to `.gitignore` and publish the compiled file as part of your release.

---

# General Practices
- DRY principle.  
- SOLID design.  
- Appropriate design patterns.  
- Regular refactoring.  
- Preserve backward compatibility.

---

# Code Formatting
- Use automated formatters.  
- Follow language style guides.  
- Organize imports.  
- Remove unused code.  
- Keep meaningful whitespace.

---

# Developer Workflows (Tailwind)
- **Edit content**: update `questions.json`.
- **Edit visuals**: update SVGs.
- **Edit UI/logic**: modify `index.html` and `src/input.css` (or update component classes directly in HTML).
- **Style changes**: prefer adding Tailwind utility classes or extending `tailwind.config.js`. If custom components are needed, define them in `src/input.css` using `@layer components`.
- **Preview**: run the watch build (`npx tailwindcss -i ./src/input.css -o ./dist/styles.css --watch`) and open `index.html` referencing `./dist/styles.css`.
- **Testing**: run `npx playwright test` after the build step; ensure CI includes the Tailwind build.

---

# Code Acceptance Policy
- All code must pass Playwright tests before merge.

---

# Example: Adding a New Question
1. Add to `questions.json`.  
2. Add SVGs (`*_q.svg`, `*_a.svg`).  
3. Update `index.html` logic if needed.  
