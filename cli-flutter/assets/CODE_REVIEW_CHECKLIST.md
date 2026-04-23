# Flutter Code Review Checklist

> Complete checklist for developers (pre-commit) and reviewers. Use this to ensure every PR meets quality, performance, security, and architecture standards.

---

## Table of Contents

1. [Pre-Commit Checklist (Developer)](#1-pre-commit-checklist-developer)
2. [Reviewer Checklist](#2-reviewer-checklist)
3. [Architecture Compliance](#3-architecture-compliance)
4. [Performance Checklist](#4-performance-checklist)
5. [Accessibility Checklist](#5-accessibility-checklist)
6. [Security Checklist](#6-security-checklist)
7. [Testing Coverage Requirements](#7-testing-coverage-requirements)
8. [Documentation Standards](#8-documentation-standards)
9. [Severity Definitions](#9-severity-definitions)

---

## 1. Pre-Commit Checklist (Developer)

Run through this list before every `git push`. Items marked 🔴 are blockers.

### Code Quality

- [ ] 🔴 `flutter analyze` passes with zero errors and zero warnings
- [ ] 🔴 `dart format --set-exit-if-changed .` passes (code is formatted)
- [ ] 🔴 `flutter test` passes with no failures
- [ ] 🔴 No `print()` statements in committed code (use structured logger)
- [ ] 🔴 No commented-out code blocks
- [ ] 🔴 No TODO/FIXME comments without a linked issue number
- [ ] All new public classes and methods have `///` doc comments
- [ ] No magic numbers — use named constants
- [ ] No magic strings (URLs, keys, messages) — use constants or l10n

### Dart / Flutter

- [ ] 🔴 No `!` (bang operator) without an explicit comment explaining why it's safe
- [ ] 🔴 All `await` calls inside `try/catch` (or returning `Result<T>`)
- [ ] 🔴 No `dynamic` types except for JSON deserialization
- [ ] 🔴 All new `StatefulWidget` state classes dispose controllers/subscriptions
- [ ] All static widgets use `const` constructor
- [ ] New list views use `ListView.builder`, not `ListView(children: all)`
- [ ] No anonymous lambda in widget event handlers that can be extracted to named methods

### Architecture

- [ ] 🔴 No Dio / HTTP calls directly in widgets or BLoC (must go through repository)
- [ ] 🔴 No Flutter imports in domain layer (`domain/entities/`, `domain/use_cases/`)
- [ ] 🔴 Business logic is in BLoC/Cubit/ViewModel, not in widget `build()` or event handlers
- [ ] New features follow feature-first folder structure (`features/{name}/data|domain|presentation`)
- [ ] Dependencies injected via constructor; no `GetIt.instance.get()` inside business classes

### State Management

- [ ] 🔴 No direct state mutation (`state.list.add(x)` — use notifier method)
- [ ] State management choice matches complexity (setState for local UI, BLoC/Riverpod for shared)
- [ ] No `context.watch` / `ref.watch` inside callbacks or event handlers (use `read`)
- [ ] `dispose()` cancels all stream subscriptions and animation controllers

### Navigation

- [ ] New navigation uses GoRouter (`context.go()`, `context.push()`)
- [ ] No `Navigator.push()` / `Navigator.pop()` in new code
- [ ] `context.mounted` checked after every `await` that uses `context`
- [ ] `PopScope` used instead of deprecated `WillPopScope`

---

## 2. Reviewer Checklist

Review each PR against these criteria. Reject if any 🔴 item fails.

### Functionality

- [ ] 🔴 The feature works as described in the issue/ticket
- [ ] 🔴 Edge cases are handled (empty state, loading state, error state)
- [ ] 🔴 No regression in existing functionality
- [ ] Error messages are user-friendly (no raw exception messages shown to users)
- [ ] Loading states are shown for all async operations

### Code Readability

- [ ] 🔴 Variable and class names are self-explanatory
- [ ] Complex logic has explanatory comments
- [ ] No method exceeds 30 lines (excluding blank lines and comments)
- [ ] No `build()` method exceeds 50 lines
- [ ] No file exceeds 300 lines (excluding generated files)
- [ ] Nesting depth ≤ 4 levels

### Design Patterns

- [ ] 🔴 Repository pattern used for all data access
- [ ] 🔴 Use cases delegate to repositories; no business logic in repositories
- [ ] DTOs are separate from domain entities (no `fromJson` in entities)
- [ ] Sealed Result/Either type used for fallible operations
- [ ] Typed custom exceptions for domain errors

### Widget Tree

- [ ] No unnecessary `Consumer` / `BlocBuilder` wrapping large subtrees
- [ ] Widgets that can be const are const
- [ ] No large anonymous widget trees — complex subtrees extracted to named classes
- [ ] Proper keys on stateful list items

### Tests

- [ ] 🔴 New use cases have unit tests covering happy path + at least one error path
- [ ] 🔴 New BLoC/Cubit has `bloc_test` tests
- [ ] New interactive widgets have at least one widget test
- [ ] Mocks used for all external dependencies in tests

---

## 3. Architecture Compliance

Verify that the PR does not violate Clean Architecture layer rules.

### Dependency Direction

```
✅ presentation → domain
✅ data → domain (implements interfaces)
❌ domain → presentation  [BLOCKER]
❌ domain → data          [BLOCKER]
❌ presentation → data    [BLOCKER]
```

Checklist:
- [ ] 🔴 Domain entities contain no Flutter imports
- [ ] 🔴 Domain use cases contain no Flutter imports
- [ ] 🔴 Domain repository interfaces reference only domain entities
- [ ] 🔴 Presentation does not import from `data/` layer directly
- [ ] 🔴 Data layer implements domain repository interfaces (not the other way around)

### Feature Module Isolation

- [ ] 🔴 Feature A does not import from `feature B`'s `data/` or `presentation/` layers
- [ ] Cross-feature communication uses domain events or shared domain entities
- [ ] Core utilities (`core/`) have no feature knowledge

### Dependency Injection

- [ ] New classes are registered in `injection.dart` or use `@injectable`
- [ ] Singletons are used correctly (stateless services: singleton; BLoC: factory)
- [ ] No `GetIt.instance` calls inside domain layer

---

## 4. Performance Checklist

### Widget Optimization

- [ ] Static widgets use `const` constructors
- [ ] Animated widgets wrapped in `RepaintBoundary`
- [ ] `ListView.builder` used for dynamic lists (not `ListView(children: ...)`)
- [ ] `itemExtent` specified on uniform-height lists
- [ ] No full-page `setState` for partial UI updates
- [ ] `Consumer` / `BlocBuilder` / `ref.watch` scoped to smallest possible widget

### Network & Data

- [ ] `CachedNetworkImage` used for all network images
- [ ] Images have `cacheWidth` / `cacheHeight` set for thumbnails
- [ ] API responses are paginated (no unbounded `getAll()` for user-facing lists)
- [ ] `compute()` used for JSON parsing of large payloads (> 1KB)
- [ ] In-flight requests cancelled in `dispose()` via `CancelToken`

### Memory

- [ ] All `AnimationController` instances disposed in `dispose()`
- [ ] All `StreamSubscription` instances cancelled in `dispose()`
- [ ] All `TextEditingController` instances disposed in `dispose()`
- [ ] All `ScrollController` instances disposed in `dispose()`
- [ ] No large objects stored in global state unnecessarily

---

## 5. Accessibility Checklist

### Screen Reader Support

- [ ] 🔴 Custom interactive widgets have `Semantics(label: ...)` or `Tooltip`
- [ ] 🔴 Icon-only buttons have `Semantics(label: ...)` or `Tooltip(message: ...)`
- [ ] Decorative icons wrapped in `ExcludeSemantics`
- [ ] Images have `Semantics(label: ..., image: true)` or `ExcludeSemantics`

### Touch Targets

- [ ] 🔴 All tappable areas are at least 48×48dp
- [ ] `IconButton` used instead of raw `GestureDetector` on icons
- [ ] Sufficient spacing between adjacent tap targets

### Visual Accessibility

- [ ] Text contrast meets WCAG AA (4.5:1 for normal text, 3:1 for large text)
- [ ] Colors are not the sole way to convey information (icons + color)
- [ ] Text uses `TextTheme` (respects system font scale)
- [ ] No hardcoded `TextStyle(fontSize: x)` without `MediaQuery.textScaler`

### Internationalization

- [ ] All user-facing strings use `AppLocalizations.of(context)!.key`
- [ ] No hardcoded English strings visible to users
- [ ] Layout uses `AlignmentDirectional` not `Alignment.centerLeft` for RTL support
- [ ] `CrossAxisAlignment.start` not `CrossAxisAlignment.start` in RTL-sensitive layouts

### Motion

- [ ] Animations check `MediaQuery.of(context).disableAnimations` before playing
- [ ] No animation required to access core functionality

---

## 6. Security Checklist

- [ ] 🔴 No API keys, tokens, or passwords in source code
- [ ] 🔴 No secrets in `pubspec.yaml` or `analysis_options.yaml`
- [ ] 🔴 Auth tokens stored in `flutter_secure_storage`, not `SharedPreferences`
- [ ] 🔴 User input is validated before sending to API
- [ ] 🔴 No `dart:io` file operations with user-controlled paths (path traversal)
- [ ] `dart pub audit` shows no high-severity vulnerabilities
- [ ] Network requests use HTTPS only (no HTTP in production)
- [ ] Certificate pinning configured if required by security policy
- [ ] Debug logs do not include sensitive user data (PII, tokens)
- [ ] `.env` file is in `.gitignore`

---

## 7. Testing Coverage Requirements

### Coverage Thresholds

| Layer | Minimum Coverage | Rationale |
|---|---|---|
| `domain/use_cases/` | 90% | Core business logic, highest risk |
| `domain/entities/` | 80% | Value object behavior |
| `data/repositories/` | 80% | Data access logic |
| `presentation/bloc/` | 85% | State transitions |
| `presentation/pages/` | 50% | UI behavior (widget tests) |
| Overall | 70% | Project-wide minimum |

### Required Test Types per Component

| Component | Unit Test | Widget Test | Integration Test |
|---|---|---|---|
| Use case | 🔴 Required | — | — |
| Repository impl | 🔴 Required | — | — |
| BLoC / Cubit | 🔴 Required | — | — |
| Riverpod Notifier | 🔴 Required | — | — |
| Interactive widget | — | 🔴 Required | — |
| Critical user flow | — | — | ⚠️ Recommended |

### Test Quality Standards

- [ ] Tests use `setUp()` and `tearDown()` for state isolation
- [ ] Each test has a single assertion / one logical scenario
- [ ] Test names follow: `'[method/widget] [scenario] [expected outcome]'`
- [ ] Mocks use `mockito` `@GenerateMocks` or `mocktail` fakes
- [ ] No real network calls, file system access, or clock usage in unit tests
- [ ] `pumpAndSettle()` used after async actions in widget tests
- [ ] Golden test baselines are committed and updated intentionally

### Forbidden in Tests

- [ ] 🔴 Real Dio HTTP calls (use mock or fake)
- [ ] 🔴 Real SharedPreferences (use mock)
- [ ] 🔴 `sleep()` or fixed `Future.delayed()` for timing (use fake async or pump)
- [ ] 🔴 Tests that pass by asserting nothing (`expect(true, true)`)

---

## 8. Documentation Standards

### Code Comments

```dart
// ✅ Triple-slash for public API documentation
/// Authenticates the user with [email] and [password].
///
/// Returns [Result.success] with the [User] on success.
/// Returns [Result.failure] with [InvalidCredentialsFailure] on wrong password.
/// Returns [Result.failure] with [NetworkFailure] on connectivity issues.
///
/// Example:
/// ```dart
/// final result = await loginUseCase.execute('user@example.com', 'password');
/// ```
Future<Result<User>> execute(String email, String password);

// ✅ Single-line for implementation notes
// Retry 3 times with exponential backoff before returning NetworkFailure
```

### README Requirements

Every feature module should have a brief `README.md` in complex features:

```markdown
# Auth Feature

## Overview
Handles user authentication (login, logout, token refresh).

## Dependencies
- AuthRepository (data layer)
- TokenStorage (core/storage)

## State Machine
AuthInitial → AuthLoading → AuthSuccess
                         ↘ AuthFailure
```

### PR Description Template

```markdown
## Summary
Brief description of what this PR does.

## Changes
- Added: ...
- Changed: ...
- Fixed: ...
- Removed: ...

## Testing
How was this tested? (unit tests, widget tests, manual testing)

## Checklist
- [ ] flutter analyze passes
- [ ] flutter test passes
- [ ] No breaking changes to existing APIs
- [ ] Architecture compliance verified
```

---

## 9. Severity Definitions

Used in `flutter-extended.csv` and when reporting issues in code review:

| Severity | Definition | Action Required |
|---|---|---|
| 🔴 **CRITICAL** | Can cause app crash, data loss, or security vulnerability | Block merge; fix immediately |
| 🟠 **HIGH** | Significant bug risk, memory leaks, or major UX failure | Block merge in most cases |
| 🟡 **MEDIUM** | Maintainability issue, technical debt, or suboptimal pattern | Fix before release |
| 🔵 **LOW** | Style preference, minor improvement, or optional optimization | Fix when convenient |

---

## Using This Checklist

### In Pull Request Reviews

Copy the relevant sections as a PR review comment checklist. Mark items `[x]` as you verify them.

### In CI Pipeline

Automate the following items in CI:
```yaml
- run: flutter analyze --fatal-infos    # catches CRITICAL static analysis
- run: dart format --set-exit-if-changed . # enforces formatting
- run: flutter test --coverage           # verifies test pass
- run: dart pub audit                    # security vulnerability check
- run: lcov coverage check > 70%         # coverage threshold
```

### For New Developers

1. Read [FLUTTER_SKILL.md](./FLUTTER_SKILL.md) for patterns and examples
2. Read [FLUTTER_RULES.md](./FLUTTER_RULES.md) for specific rules
3. Read [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for folder conventions
4. Complete this checklist on your first PR — it's the fastest way to learn the team standards
