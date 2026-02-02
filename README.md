# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

# Progressive Loading

The home page uses progressive loading for improved perceived performance:

- **Immediate UI render** - Navbar, header, heatmap container, and search bar appear instantly
- **Lazy-loaded Mapbox** - The map component is code-split via `React.lazy()` with its own `Suspense` boundary, allowing it to load independently and display its spinning globe animation before data arrives
- **Inline loading states** - The results list shows a spinner while fetching data rather than blocking the entire page

This pattern ensures users see a responsive UI immediately instead of a blank loading screen.

# Fonts used in the app

Font Family: Geist
Type: Sans-serif
Appearance: Clean, modern geometric sans-serif with excellent legibility
Usage: Primary body text, form inputs, buttons, labels, and general UI elements. Default font for most content.
────────────────────────────────────────
Font Family: Playfair Display
Type: Serif
Appearance: Elegant high-contrast serif with distinctive style, reminiscent of traditional newspaper headlines
Usage: Main headlines, page titles, newspaper masthead ("DAILY JOB REPORT"), error/loading messages, auth page text, and decorative headings for a classic
editorial feel
────────────────────────────────────────
Font Family: Courier New / Geist Mono
Type: Monospace
Appearance: Fixed-width typewriter-style font with uniform character spacing
Usage: Dates, timestamps, metadata labels (like "TODAY" or "ISSUE NO."), technical labels, code-like elements, and footer text. Adds a typewriter/newspaper
dateline aesthetic
Font Stack Details:

- Sans: Geist, Geist Fallback
- Serif: Playfair Display, Georgia, Times New Roman, serif
- Mono: Courier New, Courier, Geist Mono, monospace

The combination creates a newspaper-inspired design language: Playfair Display for elegant editorial headlines, Geist for readable modern body text, and
Courier/Mono for technical newspaper metadata like dates and issue numbers.
