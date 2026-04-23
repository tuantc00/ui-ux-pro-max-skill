# Flutter Pro Max Skill

> Production-ready Flutter development guide for teams. Covers architecture, state management, testing, CI/CD, and code conventions with concrete code examples.

---

## Table of Contents

1. [Dart Fundamentals](#1-dart-fundamentals)
2. [UI/UX Development](#2-uiux-development)
3. [State Management Guide](#3-state-management-guide)
4. [Architecture Patterns](#4-architecture-patterns)
5. [API Integration](#5-api-integration)
6. [Local Storage](#6-local-storage)
7. [Navigation Strategy](#7-navigation-strategy)
8. [Performance Optimization](#8-performance-optimization)
9. [Testing Strategy](#9-testing-strategy)
10. [CI/CD & Deployment](#10-cicd--deployment)
11. [Code Conventions & Naming](#11-code-conventions--naming)
12. [Project Structure (Clean Architecture)](#12-project-structure-clean-architecture)
13. [Code Review Checklist](#13-code-review-checklist)

---

## 1. Dart Fundamentals

**Why it matters:** Mastering Dart's type system, null safety, and async primitives eliminates entire classes of runtime bugs and makes business logic testable in isolation.

### Null Safety

✅ **Do**
- Use `?.`, `??`, `??=` for null-aware access
- Use `late` only when a value is **guaranteed** to be set before use
- Prefer `final` over `var` for immutable values

❌ **Don't**
- Use `!` (bang operator) unless you are 100% certain the value cannot be null
- Mark fields `late` just to defer initialization
- Use `dynamic` instead of specific types

```dart
// ✅ Good
final city = user?.address?.city ?? 'Unknown';
final String name;
name = fetchName(); // set before use

// ❌ Bad
final city = user!.address!.city; // crash if null
late String data; // may throw LateInitializationError
```

### Async/Await

✅ **Do**
- Use `async/await` for sequential async operations
- Always wrap `await` in `try/catch`
- Cancel `StreamSubscription` in `dispose()`

❌ **Don't**
- Chain `.then()` for sequential operations (callback pyramid)
- Ignore async errors

```dart
// ✅ Good
Future<void> loadUser(String id) async {
  try {
    final user = await _userRepository.getUser(id);
    final profile = await _profileRepository.getProfile(user.id);
    state = UserLoaded(user, profile);
  } on NetworkException catch (e) {
    state = UserError(e.message);
  }
}

// ❌ Bad
void loadUser(String id) {
  _userRepository.getUser(id)
    .then((user) => _profileRepository.getProfile(user.id)
      .then((profile) => setState(() {})));
  // no error handling
}
```

### Sealed Classes & Pattern Matching

```dart
// ✅ Good — exhaustive pattern matching with sealed classes
sealed class Result<T> {
  const Result();
}

class Success<T> extends Result<T> {
  const Success(this.data);
  final T data;
}

class Failure<T> extends Result<T> {
  const Failure(this.error);
  final String error;
}

// Usage — compiler ensures all cases are handled
String handle(Result<User> result) => switch (result) {
  Success(:final data) => 'Welcome, ${data.name}',
  Failure(:final error) => 'Error: $error',
};
```

### Extension Methods

```dart
// ✅ Add helpers without subclassing
extension StringValidation on String {
  bool get isValidEmail => RegExp(r'^[\w-.]+@[\w-]+\.[a-z]{2,4}$').hasMatch(this);
  String get capitalized => isEmpty ? this : '${this[0].toUpperCase()}${substring(1)}';
}

// Usage
if (emailController.text.isValidEmail) submitForm();
```

---

## 2. UI/UX Development

**Why it matters:** Correct widget choices directly impact app performance. Understanding the constraint model and lifecycle prevents the most common Flutter runtime errors.

### const Widgets

```dart
// ✅ Every static widget should be const
class ProfileHeader extends StatelessWidget {
  const ProfileHeader({super.key, required this.user});

  final User user;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const SizedBox(height: 16),        // ✅ const
        const Icon(Icons.person, size: 48), // ✅ const
        Text(user.name),                    // ✅ cannot be const (dynamic)
      ],
    );
  }
}
```

### Widget Decomposition

✅ **Do** — Extract into **classes**, not methods:

```dart
// ✅ Class extraction — const-able, independently testable, separate rebuild scope
class _UserAvatar extends StatelessWidget {
  const _UserAvatar({required this.imageUrl});
  final String imageUrl;

  @override
  Widget build(BuildContext context) => CircleAvatar(
    backgroundImage: CachedNetworkImageProvider(imageUrl),
    radius: 24,
  );
}

// ❌ Method extraction — rebuilds with parent, cannot be const
Widget _buildAvatar(String imageUrl) => CircleAvatar(
  backgroundImage: CachedNetworkImageProvider(imageUrl),
);
```

### Responsive Layout

```dart
// ✅ LayoutBuilder for container-relative sizing
class ResponsiveCard extends StatelessWidget {
  const ResponsiveCard({super.key, required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isWide = constraints.maxWidth > 600;
        return Card(
          child: Padding(
            padding: EdgeInsets.all(isWide ? 24.0 : 16.0),
            child: isWide
                ? Row(children: [_buildImage(), _buildContent()])
                : Column(children: [_buildImage(), _buildContent()]),
          ),
        );
      },
    );
  }
}
```

### ThemeData with Material 3

```dart
// ✅ Material 3 theme setup
ThemeData buildLightTheme() => ThemeData(
  useMaterial3: true,
  colorScheme: ColorScheme.fromSeed(
    seedColor: const Color(0xFF6750A4),
    brightness: Brightness.light,
  ),
  textTheme: GoogleFonts.interTextTheme(),
  inputDecorationTheme: const InputDecorationTheme(
    border: OutlineInputBorder(),
    contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
  ),
);

ThemeData buildDarkTheme() => ThemeData(
  useMaterial3: true,
  colorScheme: ColorScheme.fromSeed(
    seedColor: const Color(0xFF6750A4),
    brightness: Brightness.dark,
  ),
  textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme),
);

// In MaterialApp
MaterialApp(
  theme: buildLightTheme(),
  darkTheme: buildDarkTheme(),
  themeMode: ThemeMode.system,
  home: const HomePage(),
);
```

### Custom Theme Extensions

```dart
// ✅ App-specific design tokens via ThemeExtension
@immutable
class AppColors extends ThemeExtension<AppColors> {
  const AppColors({
    required this.cardBackground,
    required this.successColor,
    required this.warningColor,
  });

  final Color cardBackground;
  final Color successColor;
  final Color warningColor;

  @override
  AppColors copyWith({Color? cardBackground, Color? successColor, Color? warningColor}) =>
    AppColors(
      cardBackground: cardBackground ?? this.cardBackground,
      successColor: successColor ?? this.successColor,
      warningColor: warningColor ?? this.warningColor,
    );

  @override
  AppColors lerp(AppColors? other, double t) => this;
}

// Registration
ThemeData(
  extensions: [
    const AppColors(
      cardBackground: Color(0xFFF5F5F5),
      successColor: Color(0xFF4CAF50),
      warningColor: Color(0xFFFFC107),
    ),
  ],
);

// Usage
final appColors = Theme.of(context).extension<AppColors>()!;
```

### Performance: const + RepaintBoundary

```dart
// ✅ const widgets + RepaintBoundary for animation isolation
class AnimatedCounter extends StatefulWidget {
  const AnimatedCounter({super.key, required this.count});
  final int count;

  @override
  State<AnimatedCounter> createState() => _AnimatedCounterState();
}

class _AnimatedCounterState extends State<AnimatedCounter>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 300),
  );

  @override
  void dispose() {
    _ctrl.dispose(); // ✅ always dispose
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const Text('Counter'), // ✅ const — never rebuilds
        RepaintBoundary(        // ✅ isolates animation repaints
          child: AnimatedBuilder(
            animation: _ctrl,
            builder: (ctx, child) => Transform.scale(
              scale: 1.0 + _ctrl.value * 0.2,
              child: Text('${widget.count}'),
            ),
          ),
        ),
      ],
    );
  }
}
```

---

## 3. State Management Guide

**Why it matters:** Wrong state management choice causes either over-engineering (BLoC for a toggle) or under-engineering (setState for global auth state), both causing maintenance pain.

### Decision Guide

| Scenario | Solution | Rationale |
|---|---|---|
| UI toggle (expanded/collapsed) | `setState` | Local UI state, no sharing needed |
| Form state | `setState` or `reactive_forms` | Scoped to one screen |
| Theme / locale settings | `Riverpod StateProvider` | Simple shared primitive |
| User profile (async, shared) | `Riverpod AsyncNotifierProvider` | Async + shared across screens |
| Shopping cart | `Riverpod NotifierProvider` | Synchronous complex object |
| Auth flow with multiple events | `BLoC` | Event-driven, multiple transitions |
| Complex checkout with rules | `BLoC` | Many events → many state transitions |
| Simple counter/toggle in BLoC | `Cubit` | BLoC without event boilerplate |

### Riverpod Setup

```dart
// 1. StateProvider for simple values
final themeProvider = StateProvider<ThemeMode>((ref) => ThemeMode.system);

// Toggle: ref.read(themeProvider.notifier).state = ThemeMode.dark;

// 2. AsyncNotifierProvider for async data
@riverpod
class UsersNotifier extends _$UsersNotifier {
  @override
  Future<List<User>> build() async {
    return ref.watch(userRepositoryProvider).getAll();
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => ref.read(userRepositoryProvider).getAll());
  }
}

// UI consumption
class UsersPage extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final usersAsync = ref.watch(usersNotifierProvider);
    return usersAsync.when(
      data: (users) => UserList(users: users),
      loading: () => const CircularProgressIndicator(),
      error: (e, st) => ErrorWidget(e.toString()),
    );
  }
}
```

### BLoC Setup (Bloc + Event + State)

```dart
// --- Events ---
sealed class AuthEvent {}

class LoginRequested extends AuthEvent {
  const LoginRequested({required this.email, required this.password});
  final String email;
  final String password;
}

class LogoutRequested extends AuthEvent {}

// --- States ---
sealed class AuthState {}

class AuthInitial extends AuthState {}
class AuthLoading extends AuthState {}
class AuthSuccess extends AuthState {
  const AuthSuccess(this.user);
  final User user;
}
class AuthFailure extends AuthState {
  const AuthFailure(this.message);
  final String message;
}

// --- BLoC ---
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  AuthBloc(this._authRepository) : super(AuthInitial()) {
    on<LoginRequested>(_onLoginRequested);
    on<LogoutRequested>(_onLogoutRequested);
  }

  final AuthRepository _authRepository;

  Future<void> _onLoginRequested(
    LoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      final user = await _authRepository.login(event.email, event.password);
      emit(AuthSuccess(user));
    } on AuthException catch (e) {
      emit(AuthFailure(e.message));
    }
  }

  Future<void> _onLogoutRequested(
    LogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    await _authRepository.logout();
    emit(AuthInitial());
  }
}

// --- UI ---
class LoginPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return BlocConsumer<AuthBloc, AuthState>(
      listener: (context, state) {
        if (state is AuthSuccess) context.go('/home');
        if (state is AuthFailure) showErrorSnackbar(context, state.message);
      },
      builder: (context, state) => state is AuthLoading
          ? const CircularProgressIndicator()
          : LoginForm(
              onSubmit: (email, password) => context.read<AuthBloc>()
                  .add(LoginRequested(email: email, password: password)),
            ),
    );
  }
}
```

### Cubit Setup (Simpler BLoC)

```dart
class ThemeCubit extends Cubit<ThemeMode> {
  ThemeCubit() : super(ThemeMode.system);

  void setLight() => emit(ThemeMode.light);
  void setDark() => emit(ThemeMode.dark);
  void setSystem() => emit(ThemeMode.system);
}

// UI
BlocBuilder<ThemeCubit, ThemeMode>(
  builder: (context, themeMode) => MaterialApp(
    themeMode: themeMode,
    theme: lightTheme,
    darkTheme: darkTheme,
  ),
);
```

### Anti-Patterns to Avoid

❌ Direct state mutation:
```dart
// ❌ BAD — bypasses notifications
ref.read(userProvider).name = 'New Name';
context.read<CartModel>().items.add(item); // mutating list directly

// ✅ GOOD — goes through notifier
ref.read(userProvider.notifier).updateName('New Name');
context.read<CartModel>().addItem(item); // method that calls notifyListeners()
```

❌ Business logic in widgets:
```dart
// ❌ BAD
onPressed: () async {
  final total = cart.items.fold(0.0, (sum, i) => sum + i.price);
  if (total > 1000) applyDiscount();
  final orderId = await api.createOrder(cart.items);
  Navigator.push(context, OrderConfirmationRoute(orderId));
},

// ✅ GOOD
onPressed: () => context.read<CheckoutBloc>().add(PlaceOrder(cart)),
```

---

## 4. Architecture Patterns

**Why it matters:** Clean Architecture decouples business logic from UI and external services, making each layer independently testable and replaceable.

### Clean Architecture Layers

```
Presentation  →  Domain  ←  Data
(Flutter/UI)     (Pure Dart)  (Dio/Hive/etc.)
```

**Dependency Rule:** Dependencies point **inward** — Presentation depends on Domain; Data implements Domain interfaces.

### Layer Responsibilities

| Layer | Contents | Dependencies |
|---|---|---|
| `presentation/` | Widgets, BLoC/Cubit, ViewModels | Domain only |
| `domain/` | Entities, Use Cases, Repository interfaces | Pure Dart (none) |
| `data/` | Repository implementations, DTOs, API clients, local DB | Domain interfaces |

### Use Case Pattern

```dart
// domain/use_cases/get_user_use_case.dart
class GetUserUseCase {
  const GetUserUseCase(this._repository);
  final UserRepository _repository;

  Future<Result<User>> execute(String userId) =>
      _repository.getUser(userId);
}

// domain/repositories/user_repository.dart (interface)
abstract interface class UserRepository {
  Future<Result<User>> getUser(String id);
  Future<Result<List<User>>> getAllUsers();
  Future<Result<void>> updateUser(User user);
}

// data/repositories/user_repository_impl.dart (implementation)
class UserRepositoryImpl implements UserRepository {
  const UserRepositoryImpl(this._apiClient, this._localDb);
  final UserApiClient _apiClient;
  final UserLocalDataSource _localDb;

  @override
  Future<Result<User>> getUser(String id) async {
    try {
      final dto = await _apiClient.getUser(id);
      final user = dto.toDomain();
      await _localDb.cacheUser(user);
      return Result.success(user);
    } on DioException catch (e) {
      // Try cache on network error
      final cached = await _localDb.getUser(id);
      if (cached != null) return Result.success(cached);
      return Result.failure(e.toAppFailure());
    }
  }
}
```

### GetIt Dependency Injection

```dart
// injection/injection.dart
final sl = GetIt.instance;

Future<void> configureDependencies() async {
  // External
  sl.registerSingleton<Dio>(_configureDio());
  sl.registerSingleton<HiveInterface>(Hive);

  // Data sources
  sl.registerLazySingleton<UserApiClient>(() => UserApiClient(sl<Dio>()));
  sl.registerLazySingleton<UserLocalDataSource>(() => UserLocalDataSource(sl<HiveInterface>()));

  // Repositories
  sl.registerLazySingleton<UserRepository>(
    () => UserRepositoryImpl(sl<UserApiClient>(), sl<UserLocalDataSource>()),
  );

  // Use cases
  sl.registerFactory<GetUserUseCase>(() => GetUserUseCase(sl<UserRepository>()));

  // BLoC / ViewModel
  sl.registerFactory<ProfileBloc>(() => ProfileBloc(sl<GetUserUseCase>()));
}

// main.dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Hive.initFlutter();
  await configureDependencies();
  runApp(const App());
}
```

---

## 5. API Integration

**Why it matters:** Networking is where most bugs originate — auth failures, timeouts, parsing errors, and race conditions. A consistent repository + error handling pattern prevents most of them.

### Dio Setup with Interceptors

```dart
// data/network/dio_client.dart
Dio configureDio(AppConfig config) {
  final dio = Dio(
    BaseOptions(
      baseUrl: config.apiBaseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 30),
      headers: {'Accept': 'application/json'},
    ),
  );

  dio.interceptors.addAll([
    _AuthInterceptor(tokenStorage: sl<TokenStorage>()),
    _LogInterceptor(),
    RetryInterceptor(
      dio: dio,
      retries: 3,
      retryDelays: const [
        Duration(seconds: 1),
        Duration(seconds: 2),
        Duration(seconds: 3),
      ],
    ),
  ]);

  return dio;
}

class _AuthInterceptor extends Interceptor {
  _AuthInterceptor({required this.tokenStorage});
  final TokenStorage tokenStorage;

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await tokenStorage.getAccessToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  Future<void> onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      try {
        await tokenStorage.refreshToken();
        final token = await tokenStorage.getAccessToken();
        err.requestOptions.headers['Authorization'] = 'Bearer $token';
        final response = await Dio().fetch(err.requestOptions);
        return handler.resolve(response);
      } catch (_) {
        sl<AuthRepository>().logout();
        handler.next(err);
      }
    }
    handler.next(err);
  }
}
```

### Repository with Error Handling

```dart
// data/repositories/product_repository_impl.dart
class ProductRepositoryImpl implements ProductRepository {
  const ProductRepositoryImpl(this._dio);
  final Dio _dio;

  @override
  Future<Result<List<Product>>> getProducts({
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(
        '/products',
        queryParameters: {'page': page, 'limit': limit},
      );
      final products = (response.data!['data'] as List)
          .map((json) => ProductDto.fromJson(json as Map<String, dynamic>).toDomain())
          .toList();
      return Result.success(products);
    } on DioException catch (e) {
      return Result.failure(_mapDioError(e));
    } on FormatException catch (e) {
      return Result.failure(ParseFailure(e.message));
    }
  }

  AppFailure _mapDioError(DioException e) => switch (e.type) {
    DioExceptionType.connectionTimeout ||
    DioExceptionType.receiveTimeout     => const NetworkTimeoutFailure(),
    DioExceptionType.badResponse        => ServerFailure(
      statusCode: e.response?.statusCode,
      message: e.response?.data?['message'] as String? ?? 'Server error',
    ),
    _                                   => const NetworkFailure(),
  };
}
```

---

## 6. Local Storage

**Why it matters:** Wrong storage choice leads to data loss, security vulnerabilities, or performance issues. Match the tool to the data type.

### Storage Decision Guide

| Data Type | Solution | Reason |
|---|---|---|
| User preferences (dark mode, language) | `SharedPreferences` | Simple key-value |
| Auth tokens, passwords | `flutter_secure_storage` | Encrypted (Keychain/Keystore) |
| Structured objects (offline cache) | `Hive` | Fast, typed, no SQL |
| Relational data (complex queries) | `Drift` or `sqflite` | SQL with joins |
| Large files, images | `path_provider` + file system | Filesystem |

### Hive Setup with Type Adapter

```dart
// domain/entities/user.dart (Hive annotated)
@HiveType(typeId: 0)
class UserHive extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String name;

  @HiveField(2)
  final String email;

  UserHive({required this.id, required this.name, required this.email});
}

// main.dart — register BEFORE Hive.initFlutter()
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  Hive.registerAdapter(UserHiveAdapter()); // ✅ register first
  await Hive.initFlutter();
  final userBox = await Hive.openBox<UserHive>('users');
  runApp(App(userBox: userBox));
}

// data/local/user_local_data_source.dart
class UserLocalDataSource {
  UserLocalDataSource(this._box);
  final Box<UserHive> _box;

  Future<void> cacheUser(User user) =>
      _box.put(user.id, UserHive(id: user.id, name: user.name, email: user.email));

  User? getUser(String id) {
    final hive = _box.get(id);
    return hive != null ? User(id: hive.id, name: hive.name, email: hive.email) : null;
  }
}
```

### Secure Storage

```dart
// data/local/token_storage.dart
class TokenStorage {
  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );

  static const _accessTokenKey = 'access_token';
  static const _refreshTokenKey = 'refresh_token';

  Future<String?> getAccessToken() => _storage.read(key: _accessTokenKey);
  Future<String?> getRefreshToken() => _storage.read(key: _refreshTokenKey);

  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await Future.wait([
      _storage.write(key: _accessTokenKey, value: accessToken),
      _storage.write(key: _refreshTokenKey, value: refreshToken),
    ]);
  }

  Future<void> clearTokens() async {
    await Future.wait([
      _storage.delete(key: _accessTokenKey),
      _storage.delete(key: _refreshTokenKey),
    ]);
  }
}
```

---

## 7. Navigation Strategy

**Why it matters:** Navigation is the skeleton of the app. GoRouter provides deep link support, web compatibility, and type safety that imperative navigation cannot.

### GoRouter Setup with Typed Routes

```dart
// presentation/router/app_router.dart
@TypedGoRoute<HomeRoute>(
  path: '/',
  routes: [
    TypedGoRoute<ProductDetailRoute>(path: 'products/:id'),
    TypedGoRoute<CartRoute>(path: 'cart'),
  ],
)
@immutable
class HomeRoute extends GoRouteData {
  const HomeRoute();
  @override
  Widget build(BuildContext context, GoRouterState state) => const HomePage();
}

@immutable
class ProductDetailRoute extends GoRouteData {
  const ProductDetailRoute({required this.id});
  final String id;
  @override
  Widget build(BuildContext context, GoRouterState state) =>
      ProductDetailPage(productId: id);
}

// Router configuration
GoRouter buildRouter(AuthState authState) => GoRouter(
  navigatorKey: _rootNavigatorKey,
  initialLocation: '/',
  redirect: (context, state) {
    final isAuthenticated = authState is AuthSuccess;
    final isOnAuthRoute = state.matchedLocation.startsWith('/auth');

    if (!isAuthenticated && !isOnAuthRoute) return '/auth/login';
    if (isAuthenticated && isOnAuthRoute) return '/';
    return null;
  },
  routes: $appRoutes, // generated by go_router_builder
  errorBuilder: (context, state) => NotFoundPage(error: state.error),
);

// Usage — type-safe navigation
const ProductDetailRoute(id: '123').go(context);
const CartRoute().push(context);
```

### Shell Route for Bottom Navigation

```dart
GoRouter(
  routes: [
    ShellRoute(
      builder: (context, state, child) => MainScaffold(child: child),
      routes: [
        GoRoute(path: '/', builder: (ctx, state) => const HomePage()),
        GoRoute(path: '/search', builder: (ctx, state) => const SearchPage()),
        GoRoute(path: '/profile', builder: (ctx, state) => const ProfilePage()),
      ],
    ),
  ],
);

class MainScaffold extends StatelessWidget {
  const MainScaffold({super.key, required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: _calculateSelectedIndex(context),
        onDestinationSelected: (i) => _onItemTapped(i, context),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.search), label: 'Search'),
          NavigationDestination(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}
```

### Back Navigation with PopScope

```dart
// ✅ PopScope — replacement for deprecated WillPopScope
class FormPage extends StatelessWidget {
  const FormPage({super.key, required this.hasUnsavedChanges});
  final bool hasUnsavedChanges;

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: !hasUnsavedChanges,
      onPopInvokedWithResult: (didPop, result) async {
        if (!didPop && hasUnsavedChanges) {
          final shouldLeave = await showDiscardDialog(context);
          if (shouldLeave && context.mounted) context.pop();
        }
      },
      child: const Scaffold(/* form content */),
    );
  }
}
```

---

## 8. Performance Optimization

**Why it matters:** Flutter targets 60fps. Each frame has 16ms budget. Violations cause jank that users feel immediately.

### Performance Checklist

| Technique | Impact | Effort |
|---|---|---|
| `const` widgets | High | Low |
| `RepaintBoundary` for animations | High | Low |
| `ListView.builder` instead of `ListView(children:)` | High | Low |
| `cached_network_image` | High | Low |
| `compute()` for heavy JSON | Medium | Low |
| `itemExtent` on uniform lists | Medium | Low |
| Image resize `cacheWidth`/`cacheHeight` | Medium | Low |
| `AutomaticKeepAliveClientMixin` for tabs | Medium | Medium |

### compute() for Heavy Work

```dart
// ✅ Off-main-thread JSON parsing
Future<List<Product>> parseProductsInBackground(String jsonString) =>
    compute(_parseProducts, jsonString);

// This function runs in a separate isolate
List<Product> _parseProducts(String jsonString) {
  final List<dynamic> data = json.decode(jsonString) as List;
  return data
      .map((json) => Product.fromJson(json as Map<String, dynamic>))
      .toList();
}

// Usage in repository
final products = await parseProductsInBackground(response.data.toString());
```

### Image Optimization

```dart
// ✅ Network images with cache and size constraints
CachedNetworkImage(
  imageUrl: product.imageUrl,
  memCacheWidth: 400,      // limit memory cache size
  memCacheHeight: 400,
  placeholder: (context, url) => const ShimmerPlaceholder(),
  errorWidget: (context, url, error) => const Icon(Icons.broken_image),
  fit: BoxFit.cover,
)

// ✅ Local assets — resize before display
Image.asset(
  'assets/images/banner.png',
  cacheWidth: 800, // resize for display size
  fit: BoxFit.cover,
)
```

---

## 9. Testing Strategy

**Why it matters:** Tests are the safety net enabling confident refactoring. A pyramid with mostly unit tests and some widget/integration tests is the right balance.

### Test Pyramid

```
        /\
       /  \      Integration Tests (5%)
      /----\     — Critical user journeys
     /      \
    /--------\   Widget Tests (25%)
   / UI comp  \  — Interactive widgets
  /------------\
 / Unit Tests   \ (70%)
/________________\ — Use cases, repos, BLoC
```

### Unit Test with Mockito

```dart
// test/use_cases/get_user_use_case_test.dart
@GenerateMocks([UserRepository])
void main() {
  late MockUserRepository mockRepository;
  late GetUserUseCase useCase;

  setUp(() {
    mockRepository = MockUserRepository();
    useCase = GetUserUseCase(mockRepository);
  });

  group('GetUserUseCase', () {
    const testUserId = 'user-123';
    final testUser = User(id: testUserId, name: 'Alice', email: 'alice@example.com');

    test('returns Success when repository succeeds', () async {
      when(mockRepository.getUser(testUserId))
          .thenAnswer((_) async => Result.success(testUser));

      final result = await useCase.execute(testUserId);

      expect(result, isA<Success<User>>());
      expect((result as Success<User>).data, equals(testUser));
      verify(mockRepository.getUser(testUserId)).called(1);
    });

    test('returns Failure when repository fails', () async {
      when(mockRepository.getUser(testUserId))
          .thenAnswer((_) async => Result.failure('Not found'));

      final result = await useCase.execute(testUserId);

      expect(result, isA<Failure<User>>());
    });
  });
}
```

### Widget Test

```dart
// test/widgets/product_card_test.dart
void main() {
  testWidgets('ProductCard displays name and price', (tester) async {
    const product = Product(id: '1', name: 'Flutter Book', price: 29.99);

    await tester.pumpWidget(
      const MaterialApp(home: Scaffold(body: ProductCard(product: product))),
    );

    expect(find.text('Flutter Book'), findsOneWidget);
    expect(find.text('\$29.99'), findsOneWidget);
  });

  testWidgets('ProductCard calls onAddToCart when button tapped', (tester) async {
    var tapped = false;
    const product = Product(id: '1', name: 'Test', price: 10.0);

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: ProductCard(
            product: product,
            onAddToCart: () => tapped = true,
          ),
        ),
      ),
    );

    await tester.tap(find.byIcon(Icons.add_shopping_cart));
    await tester.pump();

    expect(tapped, isTrue);
  });
}
```

### BLoC Test

```dart
// test/bloc/auth_bloc_test.dart
@GenerateMocks([AuthRepository])
void main() {
  late MockAuthRepository mockRepository;

  setUp(() => mockRepository = MockAuthRepository());

  blocTest<AuthBloc, AuthState>(
    'emits [AuthLoading, AuthSuccess] when login succeeds',
    build: () => AuthBloc(mockRepository),
    setUp: () => when(mockRepository.login(any, any))
        .thenAnswer((_) async => testUser),
    act: (bloc) => bloc.add(
      const LoginRequested(email: 'test@example.com', password: 'pass'),
    ),
    expect: () => [AuthLoading(), AuthSuccess(testUser)],
  );

  blocTest<AuthBloc, AuthState>(
    'emits [AuthLoading, AuthFailure] when login fails',
    build: () => AuthBloc(mockRepository),
    setUp: () => when(mockRepository.login(any, any))
        .thenThrow(AuthException('Invalid credentials')),
    act: (bloc) => bloc.add(
      const LoginRequested(email: 'bad@example.com', password: 'wrong'),
    ),
    expect: () => [AuthLoading(), const AuthFailure('Invalid credentials')],
  );
}
```

### Riverpod Test with ProviderContainer

```dart
// test/providers/users_provider_test.dart
void main() {
  test('usersNotifierProvider loads users successfully', () async {
    final container = ProviderContainer(
      overrides: [
        userRepositoryProvider.overrideWith((_) => FakeUserRepository()),
      ],
    );
    addTearDown(container.dispose);

    final state = await container.read(usersNotifierProvider.future);
    expect(state, hasLength(3));
  });
}
```

---

## 10. CI/CD & Deployment

**Why it matters:** Manual builds and deployments are slow, error-prone, and don't scale. Automated pipelines ensure every PR is tested and every release is reproducible.

### GitHub Actions CI

```yaml
# .github/workflows/ci.yml
name: Flutter CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    name: Analyze & Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.24.x'
          channel: 'stable'
          cache: true

      - name: Install dependencies
        run: flutter pub get

      - name: Verify formatting
        run: dart format --set-exit-if-changed .

      - name: Analyze
        run: flutter analyze --fatal-infos

      - name: Run tests with coverage
        run: flutter test --coverage

      - name: Check coverage threshold
        run: |
          COVERAGE=$(lcov --summary coverage/lcov.info 2>&1 | grep 'lines......' | awk '{print int($2)}')
          echo "Coverage: $COVERAGE%"
          if [ "$COVERAGE" -lt 70 ]; then
            echo "❌ Coverage $COVERAGE% is below threshold 70%"
            exit 1
          fi

  build-android:
    name: Build Android
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.24.x'
          channel: 'stable'
          cache: true

      - name: Decode keystore
        run: |
          echo "${{ secrets.KEYSTORE_BASE64 }}" | base64 -d > android/app/keystore.jks

      - name: Build release APK
        run: |
          flutter build apk --release \
            --flavor production \
            -t lib/main_production.dart \
            --build-number=${{ github.run_number }}
        env:
          KEY_ALIAS: ${{ secrets.KEY_ALIAS }}
          KEY_PASSWORD: ${{ secrets.KEY_PASSWORD }}
          STORE_PASSWORD: ${{ secrets.STORE_PASSWORD }}

      - name: Upload APK
        uses: actions/upload-artifact@v4
        with:
          name: release-apk
          path: build/app/outputs/flutter-apk/app-production-release.apk
```

### Fastlane for Store Deployment

```ruby
# fastlane/Fastfile
default_platform(:android)

platform :android do
  desc "Deploy to Play Store internal track"
  lane :deploy_internal do
    gradle(
      task: 'bundle',
      build_type: 'Release',
      flavor: 'production',
      properties: {
        'android.injected.signing.store.file' => ENV['KEYSTORE_PATH'],
        'android.injected.signing.store.password' => ENV['STORE_PASSWORD'],
        'android.injected.signing.key.alias' => ENV['KEY_ALIAS'],
        'android.injected.signing.key.password' => ENV['KEY_PASSWORD'],
      }
    )
    upload_to_play_store(
      track: 'internal',
      aab: 'build/app/outputs/bundle/productionRelease/app-production-release.aab',
      skip_upload_screenshots: true,
    )
  end
end
```

---

## 11. Code Conventions & Naming

**Why it matters:** Consistent naming eliminates cognitive friction. Dart has clear conventions enforced by the analyzer.

### Naming Rules

| Element | Convention | Example |
|---|---|---|
| Variables, parameters | `lowerCamelCase` | `userName`, `isLoading` |
| Methods, functions | `lowerCamelCase` | `fetchUser()`, `validateEmail()` |
| Classes, enums, typedefs | `UpperCamelCase` | `UserRepository`, `AppState` |
| Constants | `lowerCamelCase` | `maxRetries`, `defaultTimeout` |
| Files, packages, directories | `snake_case` | `user_repository.dart` |
| Private members | `_lowerCamelCase` | `_controller`, `_isLoading` |
| BLoC Events | `PastTense + Event` | `LoginRequested`, `UserFetched` |
| BLoC States | `Name + State/Loading/Success/Failure` | `AuthSuccess`, `ProductsLoading` |
| Providers (Riverpod) | `entityProvider` or `entityNotifierProvider` | `usersProvider`, `authNotifierProvider` |

### File Organization

```
// ✅ One class per file, file name matches class name
user_repository.dart       → abstract class UserRepository
user_repository_impl.dart  → class UserRepositoryImpl
user_entity.dart           → class User (domain entity)
user_dto.dart              → class UserDto (data transfer object)
user_hive_model.dart       → class UserHiveModel (local storage)

// ✅ Exports via barrel files
// features/auth/auth.dart
export 'bloc/auth_bloc.dart';
export 'bloc/auth_event.dart';
export 'bloc/auth_state.dart';
export 'pages/login_page.dart';
export 'pages/register_page.dart';
```

### Documentation Standards

```dart
/// Fetches a user by their unique [userId].
///
/// Returns [Result.success] with the [User] on success.
/// Returns [Result.failure] with an [AppFailure] if the user is not found
/// or a network error occurs.
///
/// Example:
/// ```dart
/// final result = await getUserUseCase.execute('user-123');
/// switch (result) {
///   case Success(:final data) => print(data.name),
///   case Failure(:final error) => print(error),
/// }
/// ```
Future<Result<User>> execute(String userId);
```

---

## 12. Project Structure (Clean Architecture)

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for the full folder structure.

### Quick Reference

```
lib/
├── core/                   # Cross-cutting concerns
│   ├── di/                 # Dependency injection
│   ├── error/              # Failure classes
│   ├── network/            # Dio setup, interceptors
│   ├── router/             # GoRouter configuration
│   └── theme/              # ThemeData, extensions
├── features/               # Feature modules
│   └── {feature}/
│       ├── data/           # DTOs, API clients, local sources, repo impl
│       ├── domain/         # Entities, repository interfaces, use cases
│       └── presentation/   # Widgets, pages, BLoC/Cubit
└── main.dart
```

---

## 13. Code Review Checklist

See [CODE_REVIEW_CHECKLIST.md](./CODE_REVIEW_CHECKLIST.md) for the full checklist.

### Quick Checklist

- [ ] No business logic in widgets
- [ ] All new classes have unit tests
- [ ] No `!` bang operator without explicit justification
- [ ] All async operations have error handling
- [ ] All `dispose()` methods clean up controllers/subscriptions
- [ ] No hardcoded strings or magic numbers
- [ ] No API keys or secrets in source code
- [ ] `const` used for all static widgets
- [ ] New navigation uses GoRouter, not `Navigator.push`
- [ ] Architecture layer dependencies are correct (no data → presentation)
