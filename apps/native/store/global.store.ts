import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { storage } from "./storage";

type GlobalStore = {
	isFirstLaunch: boolean;
	setIsFirstLaunch: (value: boolean) => void;
	hasHydrated: boolean;
	authSheetView: "login" | "register" | "verify" | null;
	setAuthSheetView: (view: GlobalStore["authSheetView"]) => void;
};

export const useGlobalStore = create<GlobalStore>()(
	persist(
		(set) => ({
			isFirstLaunch: true,
			setIsFirstLaunch: (value) => set({ isFirstLaunch: value }),
			hasHydrated: false,
			authSheetView: null,
			setAuthSheetView: (view) => set({ authSheetView: view }),
		}),
		{
			name: "free-on-the-porch",
			storage: createJSONStorage(() => storage),
			onRehydrateStorage: () => (state) => {
				if (state) {
					state.hasHydrated = true;
				}
			},
			partialize: (state) => ({
				isFirstLaunch: state.isFirstLaunch,
			}),
		},
	),
);
