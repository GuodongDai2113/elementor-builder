import type { ElementObject } from "../types.js";
import { generateId } from "./base.js";

export interface CreateTextInput {
  content?: string;
}

export function createText(input?: CreateTextInput): ElementObject {
  return {
    id: generateId(),
    elType: "widget",
    widgetType: "text-editor",
    isInner: false,
    settings: {
      editor: input?.content ?? ""
    },
    elements: []
  };
}
