import type { ElementObject } from "../types.js";
import { generateId } from "./base.js";

export interface CreateContainerInput {
  containerType?: "flexbox" | "grid";
}

export function createContainer(input?: CreateContainerInput): ElementObject {
  return {
    id: generateId(),
    elType: "container",
    widgetType: null,
    settings: {
      container_type: input?.containerType === "grid" ? "grid" : "flex",
      ...(input?.containerType === "grid" ? { presetTitle: "Grid", presetIcon: "eicon-container-grid" } : {})
    },
    elements: []
  };
}
