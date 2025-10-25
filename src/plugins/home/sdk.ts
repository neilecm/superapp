import { bus } from "@/core/bus";
import type { HomeOpenInput } from "./types";

export function openHome(input: HomeOpenInput = {}) {
  bus.emit("home:open", { input });
}
