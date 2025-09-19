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

### GitHub Pages Hosting
- **Static-only:** GitHub Pages only serves static files. Do not rely on any server-side code, runtime backends, or serverless functions. Keep all logic client-side (JS) and data in static assets (`.json`, `.js`, etc.).
- **Relative paths:** Use relative or root-relative paths carefully. Prefer relative paths (e.g., `./assets/...`) when repository will be published to `username.github.io/repo-name` to avoid broken links. If you publish to the repository's root (custom domain or user/organization site), `"/"`-rooted paths will work.
- **No build-time secrets:** Never embed secrets or API keys in the repository; they will be public when hosted.
- **Large file limits:** Keep the site small — GitHub limits repository size and Pages has bandwidth/size considerations. Avoid large assets and prefer compressed images and SVGs.
- **Disable Jekyll when needed:** If you use file/folder names starting with an underscore or want plain files served as-is, add an empty `.nojekyll` file at the repo root to bypass Jekyll processing.
- **Branch and folder options:** GitHub Pages can publish from the `gh-pages` branch, `main` branch root, or the `docs/` folder. Document which one to use in `README.md` and in repo settings.
- **CORS and external assets:** Be mindful when loading external fonts, scripts, or APIs — ensure the external host permits CORS and is accessible from static pages.
- **HTTPS & custom domains:** Pages provides HTTPS by default; when using a custom domain configure DNS properly and verify `CNAME` in the repo if required.
- **Testing locally:** Use a simple static server for local testing (e.g., `npx http-server .` or `python -m http.server`) rather than expecting Node server frameworks to work.
- **CI/CD tip:** For larger projects, use GitHub Actions to build assets (Tailwind, bundlers) and output to `gh-pages` or `docs/` branch. Keep the published artifact small and commit the source to the main branch.

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

