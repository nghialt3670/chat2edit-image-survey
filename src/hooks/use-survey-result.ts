import { create } from "zustand";

interface SurveyResultStore {
  fullName: string;
  email: string;
  results: Record<number, Record<string, string>>;
  setFullName: (name: string) => void;
  setEmail: (email: string) => void;
  setResults: (id: number, result: Record<string, string>) => void;
}

export const useSurveyResult = create<SurveyResultStore>((set) => ({
  fullName: "",
  email: "",
  results: {},
  setFullName: (name) => set({ fullName: name }),
  setEmail: (email) => set({ email }),
  setResults: (id, result) =>
    set((state) => ({
      results: { ...state.results, [id]: result },
    })),
}));
