import { create } from "zustand";
import { persist } from "zustand/middleware";

interface RecentsState {
  recent: string[];
  favorites: string[];
  markUsed: (id: string) => void;
  toggleFavorite: (id: string) => void;
  clearRecent: () => void;
}

export const useRecents = create<RecentsState>()(
  persist(
    (set, get) => ({
      recent: [],
      favorites: [],
      markUsed: (id) =>
        set({
          recent: [id, ...get().recent.filter((r) => r !== id)].slice(0, 6),
        }),
      toggleFavorite: (id) =>
        set({
          favorites: get().favorites.includes(id)
            ? get().favorites.filter((f) => f !== id)
            : [...get().favorites, id],
        }),
      clearRecent: () => set({ recent: [] }),
    }),
    { name: "documender-prefs" },
  ),
);
