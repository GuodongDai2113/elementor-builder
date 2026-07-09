import type { ElementObject } from "../types.js";
import { generateId } from "./base.js";

export interface CreateHeadingInput {
  title?: string;
  tag?: string;
}

export function createHeading(input?: CreateHeadingInput): ElementObject {
  return {
    id: generateId(),
    elType: "widget",
    widgetType: "heading",
    isInner: false,
    settings: {
      title: input?.title ?? "Heading",
      header_size: input?.tag ?? "h2",
      link: { url: "#", is_external: "", nofollow: "", custom_attributes: "" }
    },
    elements: []
  };
}
