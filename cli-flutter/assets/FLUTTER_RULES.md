# Flutter Rules — Production-Ready Rule Set

> Comprehensive Flutter/Dart rules for `.cursorrules`, GitHub Copilot instructions, and team onboarding. Each rule is actionable with clear rationale.

---

## How to Use

Copy the relevant sections into:
- `.cursorrules` file in project root (Cursor IDE)
- `.github/copilot-instructions.md` (GitHub Copilot)
- Team wiki for developer onboarding

---

## Core Principles

```
FLUTTER DEVELOPMENT PRINCIPLES:
1. Correctness before performance — get it right, then fast
2. Composition over inheritance — compose widgets, don't subclass them
3. Immutability by default — prefer final, const, and immutable data classes
4. Dependency inversion — depend on interfaces, not implementations
5. Single responsibility — one class, one reason to change
6. Fail loudly in development, gracefully in production
7. Test first for complex logic, refactor freely with test coverage
```

---

## RULE 001 — Dart Fundamentals

### null-safety
```
RULE-001-NULL-001: Never use ! (bang) operator without explicit null assertion comment.
  SEVERITY: CRITICAL
  RATIONALE: Runtime NullCheckException crashes the app. Use ?., ??, or conditional logic instead.
  DO:   final name = user?.name ?? 'Guest';
  DONT: final name = user!.name;

RULE-001-NULL-002: Use ?? for default values, ??= for lazy initialization.
  SEVERITY: HIGH
  DO:   final config = _config ?? AppConfig.defaults();
  DO:   _instance ??= MyService();

RULE-001-NULL-003: Declare fields non-nullable when they are always set in constructor.
  SEVERITY: HIGH
  DO:   class User { final String id; User({required this.id}); }
  DONT: class User { String? id; } // unnecessary nullable
```

### async
```
RULE-001-ASYNC-001: Always wrap async operations in try/catch with specific exception types.
  SEVERITY: CRITICAL
  DO:   try { await api.call(); } on DioException catch (e) { ... } on FormatException catch (e) { ... }
  DONT: await api.call(); // unhandled

RULE-001-ASYNC-002: Use async/await over .then() chains for sequential operations.
  SEVERITY: HIGH
  RATIONALE: Flat async/await is readable; .then() chains create callback pyramids.

RULE-001-ASYNC-003: Check context.mounted before using BuildContext after await.
  SEVERITY: CRITICAL
  DO:   await doWork(); if (context.mounted) Navigator.of(context).pop();
  DONT: await doWork(); Navigator.of(context).pop(); // widget may be unmounted

RULE-001-ASYNC-004: Cancel StreamSubscriptions and CancelTokens in dispose().
  SEVERITY: HIGH
  DO:   @override void dispose() { _subscription?.cancel(); _cancelToken.cancel(); super.dispose(); }
```

### types
```
RULE-001-TYPE-001: Never use dynamic. Use generic types or sealed classes.
  SEVERITY: HIGH
  DO:   List<User> users; Map<String, dynamic> json; // json parsing only
  DONT: List<dynamic> items; dynamic result;

RULE-001-TYPE-002: Use sealed classes for exhaustive type hierarchies (Result, State, Events).
  SEVERITY: HIGH
  RATIONALE: Sealed classes enable exhaustive switch matching; compiler catches missing cases.
  DO:   sealed class Result<T> {} class Success<T> extends Result<T> {} class Failure<T> extends Result<T> {}

RULE-001-TYPE-003: Use extension types (Dart 3.3+) for type-safe domain primitives.
  SEVERITY: MEDIUM
  DO:   extension type UserId(String value) implements String {}
  DONT: String userId; // can be confused with other String IDs
```

---

## RULE 002 — Widgets

### const
```
RULE-002-CONST-001: Mark every widget const that can be const.
  SEVERITY: HIGH
  RATIONALE: const widgets are created once, skipped on rebuild, reducing Flutter's work.
  DO:   const Text('Hello'); const SizedBox(height: 16); const Icon(Icons.add);
  DONT: Text('Hello'); SizedBox(height: 16);

RULE-002-CONST-002: Use const constructors in widget definitions.
  SEVERITY: HIGH
  DO:   class MyWidget extends StatelessWidget { const MyWidget({super.key}); }
  DONT: class MyWidget extends StatelessWidget { MyWidget({super.key}); } // non-const
```

### decomposition
```
RULE-002-DECOMP-001: Extract widgets into classes, not methods.
  SEVERITY: HIGH
  RATIONALE: Method-extracted widgets rebuild with parent and cannot be const.
             Class-extracted widgets have independent rebuild scope.
  DO:   class _UserAvatar extends StatelessWidget { const _UserAvatar({...}); @override Widget build(...) { ... } }
  DONT: Widget _buildUserAvatar() { return CircleAvatar(...); }

RULE-002-DECOMP-002: Keep build() methods under 50 lines.
  SEVERITY: MEDIUM
  RATIONALE: Long builds are hard to test, review, and maintain.

RULE-002-DECOMP-003: Use StatelessWidget unless mutable state is required.
  SEVERITY: HIGH
  RATIONALE: StatelessWidget has simpler lifecycle and is more predictable.
```

### keys
```
RULE-002-KEY-001: Provide ValueKey(item.id) for all stateful items in dynamic lists.
  SEVERITY: HIGH
  RATIONALE: Without keys Flutter assigns wrong state to rebuilt list items.
  DO:   ListTile(key: ValueKey(item.id), title: Text(item.name))
  DONT: ListTile(title: Text(item.name)) // in dynamic list

RULE-002-KEY-002: Prefer ValueKey/ObjectKey over GlobalKey.
  SEVERITY: MEDIUM
  RATIONALE: GlobalKey creates a global lookup table entry; expensive at scale.
```

### lifecycle
```
RULE-002-LIFE-001: Always call super in overridden lifecycle methods.
  SEVERITY: HIGH
  DO:   @override void dispose() { _ctrl.dispose(); super.dispose(); }
  DONT: @override void dispose() { _ctrl.dispose(); } // super missing

RULE-002-LIFE-002: Dispose ALL AnimationControllers, TextEditingControllers, ScrollControllers.
  SEVERITY: CRITICAL
  RATIONALE: Undisposed controllers continue ticking/listening after widget removal.
  DO:   @override void dispose() { _animCtrl.dispose(); _textCtrl.dispose(); super.dispose(); }

RULE-002-LIFE-003: Don't call setState in build().
  SEVERITY: CRITICAL
  DO:   onPressed: () => setState(() { _count++; })
  DONT: build() { setState(() {}); }
```

---

## RULE 003 — Layout

```
RULE-003-LAY-001: Use SizedBox for spacing, not Container.
  SEVERITY: LOW
  RATIONALE: SizedBox is lighter and communicates intent clearly.
  DO:   SizedBox(height: 16)
  DONT: Container(height: 16)

RULE-003-LAY-002: Use Padding widget instead of Container(padding:) when only padding is needed.
  SEVERITY: LOW
  DO:   Padding(padding: EdgeInsets.all(16), child: ...)
  DONT: Container(padding: EdgeInsets.all(16), child: ...)

RULE-003-LAY-003: Use LayoutBuilder for container-relative sizing, not MediaQuery.
  SEVERITY: MEDIUM
  RATIONALE: LayoutBuilder responds to widget constraints not screen size; better for reusable widgets.
  DO:   LayoutBuilder(builder: (ctx, constraints) => constraints.maxWidth > 600 ? WideLayout() : NarrowLayout())
  DONT: MediaQuery.of(context).size.width > 600 ? WideLayout() : NarrowLayout() // inside a Widget

RULE-003-LAY-004: Wrap variable-length columns in SingleChildScrollView to prevent overflow.
  SEVERITY: HIGH
  DO:   SingleChildScrollView(child: Column(children: longContent))
  DONT: Column(children: longContent) // may overflow on small screens

RULE-003-LAY-005: Define spacing as named constants, not magic numbers.
  SEVERITY: MEDIUM
  DO:   SizedBox(height: AppSpacing.md) // AppSpacing.md = 16.0
  DONT: SizedBox(height: 17)

RULE-003-LAY-006: Use SafeArea for content that should avoid notches and home indicators.
  SEVERITY: HIGH
  DO:   SafeArea(child: Scaffold(...))
  DONT: Padding(padding: EdgeInsets.only(top: 44)) // iOS-specific hardcode
```

---

## RULE 004 — Lists & Scroll

```
RULE-004-LIST-001: Always use ListView.builder for lists with more than 5 items.
  SEVERITY: HIGH
  RATIONALE: ListView.builder creates items lazily; ListView(children:[]) creates all at once.
  DO:   ListView.builder(itemCount: items.length, itemBuilder: (ctx, i) => ItemWidget(items[i]))
  DONT: ListView(children: items.map((i) => ItemWidget(i)).toList())

RULE-004-LIST-002: Specify itemExtent for lists where all items have the same height.
  SEVERITY: MEDIUM
  DO:   ListView.builder(itemExtent: 72.0, ...)
  DONT: ListView.builder(...) // no itemExtent when items are uniform

RULE-004-LIST-003: Use CustomScrollView + SliverList for mixed scroll content.
  SEVERITY: HIGH
  RATIONALE: Nested scroll views conflict; slivers all participate in one scroll.
  DO:   CustomScrollView(slivers: [SliverAppBar(...), SliverList(...), SliverGrid(...)])
  DONT: ListView(children: [AppBar(...), ListView(...)]) // nested scroll conflict

RULE-004-LIST-004: Implement scroll-based pagination, not load-all.
  SEVERITY: HIGH
  DO:   ScrollController listener to load next page when near bottom
  DONT: await repo.getAll() // unbounded query
```

---

## RULE 005 — State Management

```
RULE-005-STATE-001: Use setState ONLY for local UI state scoped to one widget.
  SEVERITY: HIGH
  DO:   setState(() { _isExpanded = !_isExpanded; }) // UI toggle
  DONT: setState(() { _users = await api.getUsers(); }) // business/shared state

RULE-005-STATE-002: Never mutate state directly — always go through the notifier/bloc.
  SEVERITY: CRITICAL
  DO:   ref.read(cartProvider.notifier).addItem(item);
  DONT: ref.read(cartProvider).items.add(item); // direct mutation, no notification

RULE-005-STATE-003: Keep business logic OUT of widgets.
  SEVERITY: HIGH
  RATIONALE: Business logic in widgets is untestable.
  DO:   onPressed: () => context.read<CheckoutBloc>().add(PlaceOrder(cart))
  DONT: onPressed: () async { final order = await api.createOrder(cart); ... }

RULE-005-STATE-004: For new projects, prefer Riverpod over Provider.
  SEVERITY: MEDIUM
  RATIONALE: Riverpod has compile-time safety, no BuildContext required, better testing support.

RULE-005-STATE-005: Use BLoC for screens with 3+ event types and complex state transitions.
  SEVERITY: MEDIUM
  RATIONALE: BLoC enforces clear event→state mapping; overkill for simple state.

RULE-005-STATE-006: Use Cubit for simple state with direct method→state mapping.
  SEVERITY: LOW
  DO:   class ThemeCubit extends Cubit<ThemeMode> { void toggle() => emit(...); }
  DONT: ThemeBloc with ThemeToggleEvent for a simple toggle

RULE-005-STATE-007: Persist state across restarts with hydrated_bloc or Riverpod + SharedPreferences.
  SEVERITY: MEDIUM
  DO:   class SettingsCubit extends HydratedCubit<SettingsState> { ... }
```

---

## RULE 006 — Architecture

```
RULE-006-ARCH-001: Enforce three-layer Clean Architecture: presentation → domain ← data.
  SEVERITY: CRITICAL
  RATIONALE: Layer separation makes each layer independently testable and replaceable.
  DO:   presentation imports domain; data implements domain; presentation never imports data

RULE-006-ARCH-002: Domain layer must have ZERO Flutter dependencies.
  SEVERITY: CRITICAL
  DO:   domain entities and use cases import only dart:core and dart:async
  DONT: import 'package:flutter/material.dart' in any domain class

RULE-006-ARCH-003: Inject dependencies via constructor; use GetIt/injectable for wiring.
  SEVERITY: HIGH
  DO:   class UserRepositoryImpl { UserRepositoryImpl(this._dio, this._db); }
  DONT: class UserRepositoryImpl { final _dio = Dio(); } // hardcoded

RULE-006-ARCH-004: One use case per operation; use cases delegate to repositories.
  SEVERITY: MEDIUM
  DO:   class GetUserUseCase { Future<Result<User>> execute(String id) => _repo.getUser(id); }
  DONT: class UserUseCases { getUser() { ... } updateUser() { ... } deleteUser() { ... } }

RULE-006-ARCH-005: Use freezed for immutable data classes with generated copyWith/==.
  SEVERITY: HIGH
  DO:   @freezed class User with _$User { const factory User({required String id, ...}) = _User; }
  DONT: class User { String id; String name; } // mutable, no equals/hashCode

RULE-006-ARCH-006: Organize by feature first, then by layer inside the feature.
  SEVERITY: MEDIUM
  DO:   lib/features/auth/ lib/features/cart/ lib/features/profile/
  DONT: lib/screens/ lib/models/ lib/services/ // layer-first loses feature cohesion
```

---

## RULE 007 — Navigation

```
RULE-007-NAV-001: Use GoRouter for all navigation. Never use Navigator.push/pop in new code.
  SEVERITY: HIGH
  RATIONALE: GoRouter supports deep links, web URLs, typed routes, and route guards.
  DO:   const ProductDetailRoute(id: productId).go(context);
  DONT: Navigator.push(context, MaterialPageRoute(builder: (_) => ProductDetailPage(id: productId)));

RULE-007-NAV-002: Use typed routes via go_router_builder for compile-time safety.
  SEVERITY: MEDIUM
  DO:   @TypedGoRoute<UserRoute>(path: '/users/:id') class UserRoute extends GoRouteData { final String id; }

RULE-007-NAV-003: Implement route guards via GoRouter redirect, not in initState.
  SEVERITY: HIGH
  DO:   GoRouter(redirect: (ctx, state) { if (!isAuth) return '/login'; return null; })
  DONT: @override void initState() { if (!isAuth) Navigator.pushReplacement(context, loginRoute); }

RULE-007-NAV-004: Use PopScope instead of WillPopScope (deprecated in Flutter 3.12).
  SEVERITY: HIGH
  DO:   PopScope(canPop: false, onPopInvokedWithResult: (didPop, result) { ... })
  DONT: WillPopScope(onWillPop: () async => ...) // deprecated

RULE-007-NAV-005: Check context.mounted after every await before using context.
  SEVERITY: CRITICAL
  DO:   await save(); if (context.mounted) context.pop();
  DONT: await save(); context.pop(); // context may be invalid
```

---

## RULE 008 — API & Networking

```
RULE-008-API-001: Use Dio with BaseOptions; never create Dio() ad hoc inside methods.
  SEVERITY: HIGH
  DO:   Inject configured Dio singleton via GetIt
  DONT: final dio = Dio(); dio.get('/users'); // inside a method

RULE-008-API-002: Use Dio interceptors for auth token injection and logging.
  SEVERITY: HIGH
  DO:   dio.interceptors.add(AuthInterceptor(tokenStorage))
  DONT: options.headers['Authorization'] = 'Bearer $token' // in every request

RULE-008-API-003: Map DioException to domain Failure types in repository layer.
  SEVERITY: HIGH
  DO:   on DioException catch (e) { return Result.failure(e.toAppFailure()); }
  DONT: throw e; // leaks Dio into domain layer

RULE-008-API-004: All API models are DTOs; never use DTOs as domain entities.
  SEVERITY: HIGH
  DO:   class UserDto { factory UserDto.fromJson(Map<String, dynamic> j) => ...; User toDomain() => ...; }
  DONT: class User { factory User.fromJson(Map<String, dynamic> j) => ...; } // domain entity with fromJson

RULE-008-API-005: Cancel in-flight Dio requests with CancelToken when widget is disposed.
  SEVERITY: MEDIUM
  DO:   final _cancel = CancelToken(); @override void dispose() { _cancel.cancel(); super.dispose(); }

RULE-008-API-006: Implement retry with exponential backoff for transient errors.
  SEVERITY: MEDIUM
  DO:   dio.interceptors.add(RetryInterceptor(retries: 3, retryDelays: [1s, 2s, 3s]))
```

---

## RULE 009 — Local Storage

```
RULE-009-STORE-001: Use flutter_secure_storage for ALL sensitive data (tokens, keys, passwords).
  SEVERITY: CRITICAL
  DO:   FlutterSecureStorage().write(key: 'token', value: token)
  DONT: SharedPreferences().setString('token', token) // unencrypted

RULE-009-STORE-002: Use SharedPreferences for simple key-value user preferences only.
  SEVERITY: MEDIUM
  DO:   prefs.setBool('darkMode', true); prefs.setString('language', 'en')
  DONT: prefs.setString('userData', jsonEncode(complexUserObject)) // use Hive

RULE-009-STORE-003: Register all Hive TypeAdapters in main() BEFORE Hive.initFlutter().
  SEVERITY: HIGH
  DO:   Hive.registerAdapter(UserAdapter()); await Hive.initFlutter();
  DONT: Hive.registerAdapter(UserAdapter()); // inside initState or lazy

RULE-009-STORE-004: Implement database migrations for sqflite/Drift schema changes.
  SEVERITY: CRITICAL
  RATIONALE: Missing migrations crash the app on update for existing users.
  DO:   openDatabase(path, version: 3, onUpgrade: (db, old, new) { if (old < 2) db.execute('ALTER TABLE...'); })

RULE-009-STORE-005: Abstract storage behind an interface for testability.
  SEVERITY: HIGH
  DO:   abstract class AppPreferences { Future<bool> getDarkMode(); } class AppPreferencesImpl implements AppPreferences { ... }
  DONT: SharedPreferences.getInstance() called directly in BLoC/ViewModel
```

---

## RULE 010 — Theming

```
RULE-010-THEME-001: Use Material 3 ColorScheme.fromSeed() for all new projects.
  SEVERITY: HIGH
  DO:   colorScheme: ColorScheme.fromSeed(seedColor: brandColor, brightness: brightness)
  DONT: primaryColor: Colors.blue; accentColor: Colors.orange // old MD2 approach

RULE-010-THEME-002: Always define both theme and darkTheme in MaterialApp.
  SEVERITY: HIGH
  DO:   MaterialApp(theme: lightTheme, darkTheme: darkTheme, themeMode: ThemeMode.system)
  DONT: MaterialApp(theme: lightTheme) // no dark mode

RULE-010-THEME-003: Access text styles via Theme.of(context).textTheme, never inline TextStyle.
  SEVERITY: MEDIUM
  DO:   style: Theme.of(context).textTheme.bodyLarge
  DONT: style: TextStyle(fontSize: 16, color: Colors.black87) // hardcoded

RULE-010-THEME-004: Use ThemeExtension for app-specific design tokens.
  SEVERITY: MEDIUM
  DO:   class AppColors extends ThemeExtension<AppColors> { final Color successGreen; ... }

RULE-010-THEME-005: Never hardcode Color values. Use ColorScheme or named constants.
  SEVERITY: HIGH
  DO:   Theme.of(context).colorScheme.primary
  DONT: Color(0xFF6750A4) // magic hex value
```

---

## RULE 011 — Performance

```
RULE-011-PERF-001: Every static widget must be const. Run `flutter analyze` to catch violations.
  SEVERITY: HIGH
  DO:   const Text('Static label'); const Icon(Icons.home);
  DONT: Text('Static label'); Icon(Icons.home);

RULE-011-PERF-002: Wrap frequently-animating widgets in RepaintBoundary.
  SEVERITY: MEDIUM
  DO:   RepaintBoundary(child: AnimatedWidget())
  DONT: AnimatedWidget() without boundary — triggers full-page repaint

RULE-011-PERF-003: Use ListView.builder for lists with more than 5 dynamic items.
  SEVERITY: HIGH
  DO:   ListView.builder(itemCount: count, itemBuilder: (ctx, i) => ...)
  DONT: ListView(children: items.map(...).toList())

RULE-011-PERF-004: Use CachedNetworkImage for all network images.
  SEVERITY: HIGH
  DO:   CachedNetworkImage(imageUrl: url, ...)
  DONT: Image.network(url) // re-downloads on every rebuild

RULE-011-PERF-005: Use compute() for JSON decoding of responses > 1KB.
  SEVERITY: HIGH
  DO:   final data = await compute(json.decode, rawString);
  DONT: final data = json.decode(rawString); // blocks UI on large payloads

RULE-011-PERF-006: Always specify cacheWidth/cacheHeight for Image widgets used as thumbnails.
  SEVERITY: MEDIUM
  DO:   Image.network(url, cacheWidth: 200, cacheHeight: 200) // for 50x50 display
  DONT: Image.network(url) // loads full resolution for thumbnail

RULE-011-PERF-007: Profile before optimizing. Use Flutter DevTools performance tab.
  SEVERITY: MEDIUM
  RATIONALE: Premature optimization wastes time on non-bottlenecks.
  DO:   flutter run --profile → DevTools → Performance tab
```

---

## RULE 012 — Accessibility

```
RULE-012-A11Y-001: Add Semantics label to all custom interactive widgets.
  SEVERITY: HIGH
  DO:   Semantics(label: 'Add to cart', button: true, onTap: _addToCart, child: ...)
  DONT: GestureDetector(onTap: _addToCart, child: ...) // invisible to screen reader

RULE-012-A11Y-002: Ensure all tappable widgets are at least 48x48dp.
  SEVERITY: HIGH
  DO:   IconButton(icon: Icon(Icons.close)) // 48x48 by default
  DONT: SizedBox(width: 20, height: 20, child: GestureDetector(onTap: close, child: Icon(Icons.close, size: 16)))

RULE-012-A11Y-003: Never hardcode font sizes; use TextTheme.
  SEVERITY: HIGH
  RATIONALE: Hardcoded sizes ignore system accessibility font scaling.
  DO:   style: Theme.of(context).textTheme.bodyLarge
  DONT: TextStyle(fontSize: 14)

RULE-012-A11Y-004: ExcludeSemantics for purely decorative widgets.
  SEVERITY: LOW
  DO:   ExcludeSemantics(child: decorativeIcon)
  DONT: Semantics(label: 'star', child: decorativeIcon) // pollutes accessibility tree

RULE-012-A11Y-005: Respect MediaQuery.disableAnimations for reduced motion.
  SEVERITY: MEDIUM
  DO:   if (!MediaQuery.of(context).disableAnimations) _controller.forward();
  DONT: _controller.forward(); // plays regardless of system preference

RULE-012-A11Y-006: Use Directionality-aware alignment for RTL support.
  SEVERITY: HIGH
  DO:   AlignmentDirectional.centerStart  CrossAxisAlignment.start
  DONT: Alignment.centerLeft // breaks in RTL languages
```

---

## RULE 013 — Error Handling

```
RULE-013-ERR-001: Return Result<T> / Either<Failure, T> from all repository methods.
  SEVERITY: HIGH
  RATIONALE: Forces callers to handle both success and failure paths.
  DO:   Future<Result<User>> getUser(String id)
  DONT: Future<User> getUser(String id) // throws on error

RULE-013-ERR-002: Create typed custom exception classes for domain errors.
  SEVERITY: MEDIUM
  DO:   class UserNotFoundException extends AppException { final String userId; }
  DONT: throw Exception('User not found: $id')

RULE-013-ERR-003: Register global error handlers in main().
  SEVERITY: CRITICAL
  DO:   FlutterError.onError = (details) => Crashlytics.instance.recordFlutterFatalError(details);
        PlatformDispatcher.instance.onError = (error, stack) { Crashlytics.instance.recordError(error, stack, fatal: true); return true; };
  DONT: No global error handler — crashes lost silently

RULE-013-ERR-004: Replace default Flutter error widget in production.
  SEVERITY: HIGH
  DO:   ErrorWidget.builder = (details) => Scaffold(body: Center(child: Text('Something went wrong')));
  DONT: Default red screen shows stack trace to users

RULE-013-ERR-005: Use structured logging (logging or talker package) not print().
  SEVERITY: MEDIUM
  DO:   log.severe('Failed to fetch user $id', exception, stackTrace);
  DONT: print('Error: $e')

RULE-013-ERR-006: Never silently catch and ignore exceptions.
  SEVERITY: CRITICAL
  DO:   catch (e) { log.warning('Operation failed', e); return Result.failure(e.toString()); }
  DONT: catch (e) { /* ignored */ }
```

---

## RULE 014 — Testing

```
RULE-014-TEST-001: Minimum 70% test coverage enforced in CI.
  SEVERITY: HIGH
  DO:   flutter test --coverage → lcov coverage check in CI pipeline

RULE-014-TEST-002: All use cases and repositories must have unit tests.
  SEVERITY: HIGH
  RATIONALE: Business logic must be verified without UI.

RULE-014-TEST-003: Use mockito or mocktail for mocks. Never use real network in tests.
  SEVERITY: CRITICAL
  DO:   @GenerateMocks([UserRepository]) or class MockRepo extends Mock implements UserRepository {}
  DONT: UserRepositoryImpl(Dio()) // real network in tests

RULE-014-TEST-004: Use bloc_test for testing BLoC/Cubit state transitions.
  SEVERITY: HIGH
  DO:   blocTest<AuthBloc, AuthState>('emits ...', build: () => AuthBloc(mockRepo), act: ..., expect: ...)

RULE-014-TEST-005: Use ProviderContainer with overrides for testing Riverpod providers.
  SEVERITY: HIGH
  DO:   ProviderContainer(overrides: [repoProvider.overrideWith((_) => FakeRepo())])

RULE-014-TEST-006: Add golden tests for design-critical shared components.
  SEVERITY: MEDIUM
  DO:   await expectLater(find.byType(ProductCard), matchesGoldenFile('product_card.png'))

RULE-014-TEST-007: Use tester.pumpAndSettle() after async actions in widget tests.
  SEVERITY: HIGH
  DO:   await tester.tap(find.byKey(Key('submit'))); await tester.pumpAndSettle();
  DONT: await tester.tap(...); await tester.pump(); // may not settle
```

---

## RULE 015 — CI/CD

```
RULE-015-CICD-001: Every PR must pass flutter analyze, dart format check, and flutter test.
  SEVERITY: CRITICAL
  DO:   GitHub Actions / GitLab CI with required status checks before merge

RULE-015-CICD-002: Never commit secrets or API keys to source code.
  SEVERITY: CRITICAL
  DO:   Use CI secrets or flutter_dotenv; add .env to .gitignore
  DONT: const apiKey = 'sk-real-key-here'; // exposed in repo

RULE-015-CICD-003: Use build flavors for dev/staging/production environments.
  SEVERITY: HIGH
  DO:   flutter build apk --flavor production -t lib/main_production.dart
  DONT: flutter build apk with --dart-define=ENV=prod only

RULE-015-CICD-004: Automate version bump from CI run number.
  SEVERITY: MEDIUM
  DO:   flutter build apk --build-number=$GITHUB_RUN_NUMBER
  DONT: Manually update version: in pubspec.yaml

RULE-015-CICD-005: Use Fastlane for Play Store / App Store automated deployment.
  SEVERITY: HIGH
  DO:   fastlane deploy_internal lane in CI on merge to main

RULE-015-CICD-006: Run dart pub audit in CI to detect vulnerable dependencies.
  SEVERITY: HIGH
  DO:   dart pub audit // in CI pipeline; fail on high-severity vulnerabilities
```

---

## RULE 016 — Code Quality

```
RULE-016-QUAL-001: Enable very_good_analysis or flutter_lints in analysis_options.yaml.
  SEVERITY: HIGH
  DO:   include: package:very_good_analysis/analysis_options.yaml
  DONT: # empty analysis_options.yaml or none

RULE-016-QUAL-002: Run dart format --set-exit-if-changed . in CI.
  SEVERITY: HIGH
  DO:   CI step: dart format --set-exit-if-changed .
  DONT: Unformatted PRs merged causing diff noise

RULE-016-QUAL-003: Use lowerCamelCase for variables/methods, UpperCamelCase for types, snake_case for files.
  SEVERITY: HIGH
  RATIONALE: Dart style guide convention; violated names produce analyzer warnings.

RULE-016-QUAL-004: Replace all magic numbers with named constants.
  SEVERITY: MEDIUM
  DO:   const int maxRetries = 3; const double cardBorderRadius = 12.0;
  DONT: if (count > 3) ...; BorderRadius.circular(12.0);

RULE-016-QUAL-005: Document all public APIs with /// triple-slash comments.
  SEVERITY: MEDIUM
  DO:   /// Fetches user by [id]. Returns [Result.failure] if not found.
  DONT: // gets user (single slash, no doc)

RULE-016-QUAL-006: Keep PRs under 400 lines changed. Split large features with feature flags.
  SEVERITY: MEDIUM
  RATIONALE: Large PRs get low-quality reviews; small PRs get thorough reviews.

RULE-016-QUAL-007: Never commit unused imports, dead code, or TODO comments in production code.
  SEVERITY: LOW
  DO:   dart analyze --fatal-infos catches unused imports
  DONT: import 'package:unused/package.dart'; // dead import
```

---

## RULE 017 — Packages

```
RULE-017-PKG-001: Only add packages with 100+ pub points and active maintenance.
  SEVERITY: HIGH
  DO:   Check pub.dev score: 100+ points, maintained < 6 months, null-safe
  DONT: Add package with 30 pub points, last update 3 years ago

RULE-017-PKG-002: Use ^ caret constraint for all dependencies.
  SEVERITY: MEDIUM
  DO:   dio: ^5.4.0
  DONT: dio: # no constraint; dio: 5.4.0 # too strict, blocks patch updates

RULE-017-PKG-003: Run dart pub audit before every release.
  SEVERITY: HIGH
  DO:   dart pub audit // check for known CVEs in dependencies

RULE-017-PKG-004: Do not add a package when a dart:core or flutter built-in solution exists.
  SEVERITY: MEDIUM
  DO:   dart:math for basic math; dart:convert for JSON; Timer for debounce
  DONT: Add external package for functionality available in stdlib
```

---

## Quick Reference: Anti-Patterns

| Anti-Pattern | Why Bad | Fix |
|---|---|---|
| `!` everywhere | Runtime NullCheckException | `?.`, `??`, conditional logic |
| setState for business state | Untestable, prop drilling | BLoC / Riverpod |
| Business logic in widgets | Can't unit test | Move to BLoC/ViewModel/UseCase |
| No dispose() on controllers | Memory leaks, battery drain | Dispose all controllers |
| Navigator.push everywhere | No deep links, no web | GoRouter |
| Hardcoded colors/sizes | Breaks dark mode, responsive | ColorScheme, ThemeExtension |
| API keys in source | Security breach | CI secrets, flutter_dotenv |
| No error handling on await | Silent crashes | try/catch with typed exceptions |
| Real network in tests | Flaky tests | Mockito/mocktail mocks |
| 1000+ line build() | Untestable, unmaintainable | Extract widget classes |
| `dynamic` types | Runtime type errors | Specific types, generics |
| ListView(children: all) | OOM on large lists | ListView.builder |
| SharedPreferences for tokens | Security vulnerability | flutter_secure_storage |
| WillPopScope | Deprecated, breaks Android 14 back gesture | PopScope |
| No migration in DB upgrade | Crashes on app update | sqflite onUpgrade / Hive migration |
