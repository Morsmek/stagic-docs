import { create } from "zustand";

interface WorkspaceState {
  files: File[];
  setFiles: (files: File[]) => void;
  takeFiles: (predicate?: (f: File) => boolean) => File[];
  clear: () => void;
}

export const useWorkspace = create<WorkspaceState>((set, get) => ({
  files: [],
  setFiles: (files) => set({ files }),
  takeFiles: (predicate) => {
    const { files } = get();
    const taken = predicate ? files.filter(predicate) : files;
    const remain = predicate ? files.filter((f) => !predicate(f)) : [];
    set({ files: remain });
    return taken;
  },
  clear: () => set({ files: [] }),
}));
