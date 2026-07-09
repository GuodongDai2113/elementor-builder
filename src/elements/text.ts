import type { ElementBoundary, ElementObject } from "../types.js";
import { generateId } from "./base.js";

export interface CreateTextInput {
  /** 文本编辑器 HTML 内容。 */
  content?: string;
}

/** 文本元素允许使用的 settings helper 边界。 */
export const TEXT_BOUNDARY: ElementBoundary = {
  element: "text",
  helpers: [
    "set_z_index", "set_element_id", "set_css_classes",
    "set_margin", "set_padding",
    "set_background", "set_background_hover",
    "set_border", "set_border_hover", "set_border_radius", "set_border_radius_hover",
    "set_box_shadow", "set_box_shadow_hover",
    "set_typography",
    "set_text_color"
  ]
};

/** 创建 Elementor 文本编辑器元素。 */
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
