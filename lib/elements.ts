import { useSyncExternalStore } from "react";

export type CraftElement = {
  name: string;
  emoji: string;
  firstDiscovery?: boolean;
};

export const STARTER_ELEMENTS: readonly CraftElement[] = [
  { name: "Fire", emoji: "🔥" },
  { name: "Water", emoji: "💦" },
  { name: "Earth", emoji: "🌎" },
  { name: "Air", emoji: "💨" },
];

const STORAGE_KEY = "elements";

const isCraftElement = (value: unknown): value is CraftElement =>
  typeof value === "object" &&
  value !== null &&
  "name" in value &&
  "emoji" in value &&
  typeof value.name === "string" &&
  typeof value.emoji === "string" &&
  (!("firstDiscovery" in value) ||
    value.firstDiscovery === undefined ||
    typeof value.firstDiscovery === "boolean");

const readStorage = (): readonly CraftElement[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return STARTER_ELEMENTS;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return STARTER_ELEMENTS;
    const valid = parsed.filter(isCraftElement);
    return valid.length > 0 ? valid : STARTER_ELEMENTS;
  } catch {
    return STARTER_ELEMENTS;
  }
};

let cache: readonly CraftElement[] | null = null;
const listeners = new Set<() => void>();

const getSnapshot = () => {
  cache ??= readStorage();
  return cache;
};

const getServerSnapshot = () => STARTER_ELEMENTS;

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const write = (next: readonly CraftElement[]) => {
  cache = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((listener) => listener());
};

export const sameName = (a: string, b: string) =>
  a.trim().toLowerCase() === b.trim().toLowerCase();

export const discoveredStore = {
  add(element: CraftElement): boolean {
    const current = getSnapshot();
    if (current.some((e) => sameName(e.name, element.name))) return false;
    write([...current, element]);
    return true;
  },
  reset() {
    write(STARTER_ELEMENTS);
  },
};

export const useDiscoveredElements = () =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

type CombineResponse = CraftElement & { new: boolean };

const isCombineResponse = (value: unknown): value is CombineResponse =>
  isCraftElement(value) && "new" in value && typeof value.new === "boolean";

export const combineElements = async (
  first: string,
  second: string,
): Promise<CombineResponse> => {
  const params = new URLSearchParams({ element1: first, element2: second });
  const response = await fetch(`/api/combine?${params.toString()}`);
  if (!response.ok) throw new Error(`Combine failed: ${response.status}`);
  const data: unknown = await response.json();
  if (!isCombineResponse(data)) throw new Error("Unexpected combine response");
  return data;
};
