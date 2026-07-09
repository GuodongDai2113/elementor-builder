import type { ElementObject } from "../types.js";
import { generateId } from "./base.js";

export interface CreateImageInput {
  image?: unknown;
}

export function createImage(input?: CreateImageInput): ElementObject {
  return {
    id: generateId(),
    elType: "widget",
    widgetType: "image",
    isInner: false,
    settings: {
      image: input?.image ?? {}
    },
    elements: []
  };
}
