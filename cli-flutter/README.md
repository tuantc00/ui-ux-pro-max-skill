# Flutter Pro CLI

> CLI to install **Flutter Pro Max** skill for AI coding assistants.

Flutter Pro Max is a production-ready Flutter development guide covering Dart fundamentals, architecture, state management, testing, CI/CD, and code conventions with concrete code examples.

## Installed Files

When you run `flutterpro init`, the following files are installed into your AI assistant's skill directory:

| File | Description |
|------|-------------|
| `SKILL.md` | Main Flutter skill guide (13 chapters, code examples) |
| `FLUTTER_RULES.md` | Rule set for Cursor / Copilot instructions |
| `CODE_REVIEW_CHECKLIST.md` | Pre-commit and reviewer checklists |
| `PROJECT_STRUCTURE.md` | Clean Architecture folder structure |

## Installation

```bash
npx flutter-pro-cli init
```

Or install globally:

```bash
npm install -g flutter-pro-cli
flutterpro init
```

## Usage

### Install skill

```bash
# Interactive — auto-detects your AI assistant
flutterpro init

# Specify AI assistant directly
flutterpro init --ai claude
flutterpro init --ai cursor
flutterpro init --ai copilot

# Install globally (to home directory)
flutterpro init --global
```

### Uninstall skill

```bash
flutterpro uninstall
flutterpro uninstall --ai claude
```

## Supported AI Assistants

| AI Type | Installed Path |
|---------|---------------|
| `claude` | `.claude/skills/flutter-pro-max/` |
| `cursor` | `.cursor/skills/flutter-pro-max/` |
| `windsurf` | `.windsurf/skills/flutter-pro-max/` |
| `copilot` | `.github/prompts/flutter-pro-max/` |
| `kiro` | `.kiro/steering/flutter-pro-max/` |
| `roocode` | `.roo/skills/flutter-pro-max/` |
| `codex` | `.codex/skills/flutter-pro-max/` |
| `qoder` | `.qoder/skills/flutter-pro-max/` |
| `gemini` | `.gemini/skills/flutter-pro-max/` |
| `trae` | `.trae/skills/flutter-pro-max/` |
| `opencode` | `.opencode/skills/flutter-pro-max/` |
| `continue` | `.continue/skills/flutter-pro-max/` |
| `codebuddy` | `.codebuddy/skills/flutter-pro-max/` |
| `droid` | `.factory/skills/flutter-pro-max/` |
| `kilocode` | `.kilocode/skills/flutter-pro-max/` |
| `warp` | `.warp/skills/flutter-pro-max/` |
| `augment` | `.augment/skills/flutter-pro-max/` |
| `antigravity` | `.agents/skills/flutter-pro-max/` |
| `all` | All of the above |

## Skill Contents

The **Flutter Pro Max** skill covers:

1. **Dart Fundamentals** — Null safety, async/await, streams, isolates, sealed classes
2. **UI/UX Development** — Widget composition, theming, responsive layouts, animations
3. **State Management** — BLoC, Riverpod, Provider patterns and best practices
4. **Architecture** — Clean Architecture, repository pattern, dependency injection
5. **API Integration** — Dio, interceptors, error handling, caching
6. **Local Storage** — Hive, SharedPreferences, secure storage
7. **Navigation** — GoRouter, deep linking, back stack management
8. **Performance** — ListView.builder, const widgets, RepaintBoundary, DevTools
9. **Testing** — Unit, widget, and integration tests with mocking
10. **CI/CD** — GitHub Actions pipelines, Fastlane, store deployment
11. **Code Conventions** — Naming, formatting, documentation standards
12. **Project Structure** — Clean Architecture folder layout
13. **Code Review Checklist** — Pre-commit and reviewer checklists

## After Installation

1. Restart your AI coding assistant
2. The skill is now active — try:
   - *"Create a Flutter login screen with BLoC and clean architecture"*
   - *"Review this Flutter widget for performance issues"*
   - *"Add Riverpod state management to my Flutter app"*

## License

MIT
