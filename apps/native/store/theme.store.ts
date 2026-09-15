import { type ThemeName, Uniwind, useUniwind } from "uniwind";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { storage } from "./storage";

export type ThemePreference = ThemeName | "system";

export interface ThemeStore {
	themePreference: ThemePreference;
	setTheme: (theme: ThemePreference) => void;
	toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>()(
	persist(
		(set, get) => ({
			themePreference: "system",

			setTheme: (themePreference) => {
				set({ themePreference });
				Uniwind.setTheme(themePreference);
			},

			toggleTheme: () => {
				const current = get().themePreference;
				const active = current === "system" ? Uniwind.currentTheme : current;
				const next: ThemePreference = active === "light" ? "dark" : "light";
				get().setTheme(next);
			},
		}),
		{
			name: "free-on-the-porch-theme",
			storage: createJSONStorage(() => storage),
			onRehydrateStorage: () => (state) => {
				if (state?.themePreference) {
					Uniwind.setTheme(state.themePreference);
				}
			},
		},
	),
);

/**
 * Convenience hook combining Uniwind's active theme resolution
 * with the persisted theme preference and control actions.
 */
export function useAppTheme() {
	const { theme } = useUniwind();
	const themePreference = useThemeStore((s) => s.themePreference);
	const setTheme = useThemeStore((s) => s.setTheme);
	const toggleTheme = useThemeStore((s) => s.toggleTheme);

	return {
		themePreference,
		currentTheme: theme,
		isLight: theme === "light",
		isDark: theme === "dark",
		setTheme,
		toggleTheme,
	};
}
