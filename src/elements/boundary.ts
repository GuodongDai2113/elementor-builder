import type { ElementBoundary, ElementObject, SettingHelperName } from "../types.js";
import { BUTTON_BOUNDARY } from "./button.js";
import { CONTAINER_BOUNDARY } from "./container.js";
import { HEADING_BOUNDARY } from "./heading.js";
import { IMAGE_BOUNDARY } from "./image.js";
import { TEXT_BOUNDARY } from "./text.js";

/** Elementor 元素类型到 settings helper 边界的映射。 */
const BOUNDARIES: Record<string, ElementBoundary> = {
  container: CONTAINER_BOUNDARY,
  heading: HEADING_BOUNDARY,
  "text-editor": TEXT_BOUNDARY,
  text: TEXT_BOUNDARY,
  button: BUTTON_BOUNDARY,
  image: IMAGE_BOUNDARY
};

/** 根据 Elementor 元素返回对应的 settings helper 边界。 */
export function boundaryForElement(element: ElementObject): ElementBoundary {
  if (element.elType === "container") {
    return CONTAINER_BOUNDARY;
  }
  const key = element.widgetType ?? "";
  const boundary = BOUNDARIES[key];
  if (!boundary) {
    throw new Error(`Unsupported element type: ${key}`);
  }
  return boundary;
}

/** 判断指定 settings helper 是否允许应用到当前 Elementor 元素。 */
export function helperAllowed(element: ElementObject, helperName: SettingHelperName): boolean {
  const boundary = boundaryForElement(element);
  return (boundary.helpers as readonly string[]).includes(helperName);
}
