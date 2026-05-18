# Chalkboard Theme — 2026 Upgrade Todos

## Tasks

- [x] **1. Convert `.tmTheme` → VS Code extension format**
  - Create `package.json` extension manifest
  - Create `themes/chalkboard.json` with all existing scopes migrated
  - Preserve all current token colors exactly

- [x] **2. Add workbench + terminal ANSI colors**
  - Sidebar, status bar, tabs, activity bar, panels — all green-toned chalk palette
  - Terminal ANSI colors so CLI / git / npm output is on-theme
  - `findMatchBackground`, `wordHighlight`, `bracketMatchBackground`, `selectionHighlight`
  - Fix `lineHighlight` and `selection` (both currently near-black, hard to see)

- [x] **3. Fix JSON depth colors to chalk palette**
  - Replace neon colors with muted chalk tones (cream → lime → amber → teal → lavender → yellow)
  - Keep the depth-differentiation concept but make it feel chalkboard

- [x] **4. Add TypeScript / TSX scopes**
  - Type annotations, interfaces, generics, type parameters
  - `as`, `readonly`, `keyof`, `typeof`, `infer`
  - JSX tags, JSX attributes, JSX expressions

- [x] **5. Add Python scopes**
  - f-strings, type hints, walrus operator, match/case
  - Decorators, magic methods, builtins, self/cls

- [x] **6. Add Markdown scopes**
  - Headings, bold, italic, code blocks, inline code, links, blockquotes
  - Essential for agent prompts, READMEs, Copilot instructions

- [x] **7. Add YAML scopes**
  - Keys vs values, anchors & aliases, block sequences, booleans/null
  - Critical for GitHub Actions, MCP configs, Copilot instruction files

- [x] **8. Add Shell / Bash scopes**
  - Commands, flags, env vars (`$PATH`, `$HOME`), special variables
  - Pipes, heredoc, subshells, shebang line

- [x] **9. Add Dockerfile / Rust / TOML scopes**
  - Dockerfile instructions (`FROM`, `RUN`, `COPY`, `ENV`, `EXPOSE`)
  - Rust: lifetimes, macros, traits, `unsafe`, attributes
  - TOML: section headers, keys, values, dates

- [x] **10. Add semantic token overrides**
  - `semanticTokenColors` block: types, interfaces, methods, lifetimes, decorators, macros

- [x] **11. Update README for VS Code**
  - VS Code install instructions, colour palette table, design principles
  - Sublime Text / TextMate kept as legacy section

- [x] **12. Install and smoke-test locally in VS Code**
  - Copy extension to `~/.vscode/extensions/` and reload
  - Verify theme loads and colours look correct on example files

- [ ] **13. Add screenshots**
  - nested json example
  - TypeScript / TSX example
  - Shell / YAML side by side (agentic workflow context)
  - Update `images/` folder and link from README
