import type { ElementBoundary, ElementObject } from "../types.js";
import { generateId } from "./base.js";

export interface CreateButtonInput {
  /** 按钮显示文本。 */
  text?: string;
  /** 按钮链接地址。 */
  url?: string;
}

/** 按钮元素允许使用的 settings helper 边界。 */
export const BUTTON_BOUNDARY: ElementBoundary = {
  element: "button",
  helpers: [
    "set_z_index", "set_element_id", "set_css_classes",
    "set_typography",
    "set_button_align", "set_button_text_color", "set_button_text_hover_color",
    "set_button_background_color", "set_button_background_hover_color",
    "set_button_border_color", "set_button_hover_border_color",
    "set_button_border", "set_button_box_shadow", "set_button_text_padding"
  ]
};

/** 创建 Elementor 按钮元素。 */
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
