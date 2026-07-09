import { randomBytes } from "node:crypto";
import type { ElementObject } from "../types.js";

export function generateId(): string {
  return randomBytes(4).toString("hex").slice(0, 7);
}

export function add_element(elements: ElementObject[], element: ElementObject, position = -1): ElementObject {
  if (position < 0 || position >= elements.length) {
    elements.push(element);
  } else {
    elements.splice(position, 0, element);
  }
  return element;
}
