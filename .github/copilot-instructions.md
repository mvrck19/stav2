# Copilot Instructions for This Project

## Project Overview
This is a static web project consisting of HTML, CSS, SVG images, and a JSON file. It appears to be an educational or quiz-style site, likely focused on grammar and syntax, as suggested by the file names.

## Key Files and Structure
- `index.html`: Main entry point. Loads the UI and references other assets.
- `styles.css`: Contains all styling for the site.
- `questions.json`: Holds quiz or question data. Likely consumed by JavaScript in `index.html`.
- `grammar_a.svg`, `grammar_q.svg`, `syntax_a.svg`, `syntax_q.svg`: SVG images used for visual content.
- No build system, package manager, or backend code is present.


## Patterns and Conventions
- All logic is expected to be inlined or referenced via `<script>` tags in `index.html`.
- Data-driven: Questions/content are separated into `questions.json` for easy updates.
- SVGs are used for both questions and answers, suggesting a visual/interactive quiz format.
- No frameworks or external dependencies are present by default.

### CSS & Layout
- Use **CSS Flexbox** (preferred) or **CSS Grid** (if more appropriate) for all layouts.
- **Do not use fixed pixel values**; use only relative units: %, rem, em, vw/vh, fr.
- **Avoid media queries and device-specific breakpoints**; let components wrap and reflow naturally.
- Prefer `gap` for spacing; use `flex-grow`, `flex-shrink`, `flex-basis`, or `grid minmax()` for sizing.
- Add sensible `min-width`/`max-width`/`min-height`/`max-height` constraints for readability.
- Avoid `position: absolute` unless absolutely necessary.
- Design **mobile-first**: prioritize small screens, fluid containers, and touch-friendly UI.
- The app must be as mobile-friendly as possible; test and optimize for small screens.


## Developer Workflows
- **Edit content**: Update `questions.json` for new or changed questions.
- **Edit visuals**: Update SVG files for new graphics.
- **Edit UI/logic**: Modify `index.html` and `styles.css` directly.
- **Preview**: Open `index.html` in a browser. No build step is required.
- **End-to-end testing**: Use [Playwright](https://playwright.dev/) for e2e tests. Place Playwright config and tests in a `/tests` directory at the project root. Write tests to simulate real user flows, especially on mobile viewports. Run tests with `npx playwright test` or `npx playwright test --ui`.


## AI Agent Guidance
- When adding new features, keep all assets and logic in the root directory unless otherwise specified.
- Maintain separation of data (`questions.json`), visuals (SVGs), and logic/UI (`index.html`, `styles.css`).
- Use plain JavaScript and DOM APIs for interactivity; do not introduce frameworks unless requested.
- Reference SVGs and JSON data using relative paths.
- If adding new question types or visuals, follow the naming conventions (`*_q.svg`, `*_a.svg`).
- Document any new conventions or patterns in this file for future agents.
- All UI and layout code must follow the CSS conventions above for fluid, mobile-first, content-driven design.
- Ensure all new features are tested with Playwright, including on mobile viewport sizes.

## Code Acceptance Policy
- **All code changes must pass all Playwright tests to be accepted.**
- Pull requests or commits that fail Playwright tests should not be merged until all tests pass.
- This applies to both local development and CI environments.

## Example: Adding a New Question
1. Add question data to `questions.json`.
2. Add corresponding SVGs (e.g., `newtopic_q.svg`, `newtopic_a.svg`).
3. Update `index.html` logic to handle the new question if needed.

---
If any conventions or workflows are unclear, please request clarification or provide feedback for improvement.
