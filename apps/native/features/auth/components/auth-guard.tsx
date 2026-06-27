import { Slot } from "@rn-primitives/slot";
import { usePathname, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { forwardRef, useCallback, useEffect } from "react";
import { type GestureResponderEvent, Pressable } from "react-native";
import { authClient } from "@/lib/auth-client";
import { useGlobalStore } from "@/store/global.store";
import { getIsPublicPage } from "../auth.util";

/**
 * AUTHENTICATION GUARD & GLOBAL AUTH FLOW EXPLANATION:
 *
 * This file exports three auth boundary primitives:
 *
 * 1. AuthGuardProvider
 *    Wraps the root layout. Handles:
 *    - Splash screen visibility (kept until auth + store hydration resolves)
 *    - First-launch detection → /welcome; returning users at "/" → /dashboard/listings
 *    - Route protection → opens the login sheet when a guest hits a private route.
 *      No redirect — the user stays on the current public route they came from.
 *
 * 2. AuthGuardPressable
 *    Drop-in wrapper that guards its onPress behind authentication.
 *    Uses @radix-ui/react-slot (asChild=true by default) so no extra native node
 *    is introduced — all props are merged directly into the immediate child.
 *    Falls back to a plain <Pressable> wrapper when asChild={false}.
 *
 * 3. requireAuth / useRequireAuth
 *    Higher-order function that wraps any callback. Calls the original function
 *    when authenticated; opens the login sheet instead when not.
 *    `requireAuth` is a pure async HOF — it calls authClient.getSession()
 *    internally so no session state needs to be threaded in as a parameter.
 *    `useRequireAuth` is the hook form for convenient use in components.
 *
 * GLOBAL AUTH MODAL SYSTEM:
 *    A single <AuthSheetProvider> lives in providers.tsx, driven by the Zustand
 *    transient state `authSheetView` ("login" | "register" | "verify" | null).
 *    Setting it from anywhere immediately surfaces the authentication bottom sheet.
 *
 * RESPONSE INTERCEPTOR (AXIOS):
 *    401 responses from non-public endpoints are caught in api.ts, which sets
 *    `authSheetView` to "login" via the global store.
 */

// ---------------------------------------------------------------------------
// 1. AuthGuardProvider
// ---------------------------------------------------------------------------

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
	fade: true,
});

/**
 * Wrap the root layout with this provider.
 *
 * Responsibilities:
 *  - Keep the splash screen visible until auth state + store hydration settle.
 *  - On first launch: redirect to /welcome (onboarding flow).
 *  - On returning launches at "/": redirect straight to /dashboard/listings.
 *  - When a guest lands on a private route: open the login sheet and stay put —
 *    do NOT hard-redirect; let the user stay on whatever public route they're on.
 */
export function AuthGuardProvider({ children }: { children: React.ReactNode }) {
	const session = authClient.useSession();
	const pathname = usePathname();
	const router = useRouter();

	const hasHydrated = useGlobalStore((state) => state.hasHydrated);
	const isFirstLaunch = useGlobalStore((state) => state.isFirstLaunch);
	const setAuthSheetView = useGlobalStore((state) => state.setAuthSheetView);

	const isPublic = getIsPublicPage(pathname);
	const isAuthenticated = !!session.data;

	/**
	 * True while we can't yet determine where to send the user:
	 *  - Zustand store hasn't rehydrated from SecureStore/AsyncStorage yet
	 *  - Auth session is still resolving on a private route
	 *  - We're at "/" and are about to redirect to the correct landing screen
	 */
	const isAtRoot = hasHydrated && pathname === "/";
	const isLoading =
		!hasHydrated || (session.isPending && !isPublic) || isAtRoot;

	// First-launch → /welcome; returning user at "/" → /dashboard/listings
	useEffect(() => {
		if (!hasHydrated || !isAtRoot || !isFirstLaunch) return;
		router.replace("/dashboard/listings");
	}, [hasHydrated, isAtRoot, isFirstLaunch, router]);

	// Reveal the app once all routing decisions have settled
	useEffect(() => {
		if (!isLoading) {
			SplashScreen.hide();
		}
	}, [isLoading]);

	// When a guest navigates to a private route, open the login sheet in place.
	// Do NOT redirect — the user stays on the public route they came from.
	useEffect(() => {
		if (!isLoading && !isPublic && !isAuthenticated) {
			setAuthSheetView("login");
		}
	}, [isLoading, isPublic, isAuthenticated, setAuthSheetView]);

	return children;
}

// ---------------------------------------------------------------------------
// 2. AuthGuardPressable
// ---------------------------------------------------------------------------

interface AuthGuardPressableProps
	extends Omit<React.ComponentProps<typeof Pressable>, "onPress"> {
	/**
	 * The action to perform when the user is authenticated.
	 * Intercepted and replaced with a login-sheet open when they are not.
	 */
	onPress?: (event: GestureResponderEvent) => void;
	/**
	 * When true (default), renders children via @radix-ui/react-slot so the
	 * guarded onPress is forwarded directly into the immediate child component
	 * with no extra native node introduced (asChild pattern).
	 * Set to false to render a plain <Pressable> wrapper instead.
	 */
	asChild?: boolean;
}

/**
 * A Pressable that gates its `onPress` behind authentication.
 *
 * Usage — asChild (default, zero extra nodes):
 *   <AuthGuardPressable onPress={handleClaim}>
 *     <Button>Claim listing</Button>
 *   </AuthGuardPressable>
 *
 * Usage — wrapper (explicit Pressable node):
 *   <AuthGuardPressable asChild={false} onPress={handleClaim} style={styles.row}>
 *     <Text>Claim listing</Text>
 *   </AuthGuardPressable>
 */
export const AuthGuardPressable = forwardRef<
	React.ComponentRef<typeof Pressable>,
	AuthGuardPressableProps
>(function AuthGuardPressable(
	{ onPress, asChild = true, children, ...rest },
	ref,
) {
	const session = authClient.useSession();
	const setAuthSheetView = useGlobalStore((state) => state.setAuthSheetView);

	const handlePress = useCallback(
		(event: GestureResponderEvent) => {
			if (!session.data) {
				setAuthSheetView("login");
				return;
			}
			onPress?.(event);
		},
		[session.data, setAuthSheetView, onPress],
	);

	if (asChild) {
		// @radix-ui/react-slot merges all props (including the guarded onPress)
		// into the immediate child element — same mechanism expo-router's <Link>
		// uses internally. No extra native node; no forwardRef boilerplate needed
		// on the child as long as it spreads its received props onto a pressable root.
		return (
			<Slot ref={ref} onPress={handlePress} {...rest}>
				{children}
			</Slot>
		);
	}

	return (
		<Pressable ref={ref} onPress={handlePress} {...rest}>
			{children}
		</Pressable>
	);
});

// ---------------------------------------------------------------------------
// 3. requireAuth / useRequireAuth
// ---------------------------------------------------------------------------

/**
 * Pure async higher-order function that guards any callback behind authentication.
 *
 * Calls authClient.getSession() directly — no session state needs to be threaded
 * in. Returns a new async function that either calls `fn(...args)` (authenticated)
 * or opens the login sheet (guest).
 *
 * Best for: event handlers / mutation callers defined outside React components,
 * or any case where you already have `setAuthSheetView` in scope.
 *
 * Usage:
 *   const handleClaim = requireAuth(setAuthSheetView, () => claimListing(id));
 *   // or inline:
 *   <Button onPress={requireAuth(setAuthSheetView, () => claimListing(id))}>
 *     Claim
 *   </Button>
 */
export function requireAuth<TArgs extends unknown[], TReturn>(
	fn: (...args: TArgs) => TReturn,
): (...args: TArgs) => Promise<TReturn | undefined> {
	return async (...args: TArgs): Promise<TReturn | undefined> => {
		const setAuthSheetView = useGlobalStore.getState().setAuthSheetView;

		const { data: session } = await authClient.getSession();

		if (!session) {
			setAuthSheetView("login");
			return;
		}

		return fn(...args);
	};
}
