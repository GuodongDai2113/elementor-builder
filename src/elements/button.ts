import type { ElementObject } from "../types.js";
import { generateId } from "./base.js";

export interface CreateButtonInput {
  text?: string;
  url?: string;
}

export function createButton(input?: CreateButtonInput): ElementObject {
  return {
    id: generateId(),
    elType: "widget",
    widgetType: "button",
    isInner: false,
    settings: {
      text: input?.text ?? "Click here",
      link: {
        url: input?.url ?? "#",
        is_external: false,
        nofollow: false
      }
    },
    elements: []
  };
}
