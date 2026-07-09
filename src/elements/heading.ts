import type { ElementBoundary, ElementObject } from "../types.js";
import { generateId } from "./base.js";

export interface CreateHeadingInput {
  /** 标题文本。 */
  title?: string;
  /** 标题 HTML 标签。 */
  tag?: string;
}

/** 标题元素允许使用的 settings helper 边界。 */
export const HEADING_BOUNDARY: ElementBoundary = {
  element: "heading",
  helpers: [
    "set_z_index", "set_element_id", "set_css_classes",
    "set_margin", "set_padding",
    "set_background", "set_background_hover",
    "set_border", "set_border_hover", "set_border_radius", "set_border_radius_hover",
    "set_box_shadow", "set_box_shadow_hover",
    "set_typography",
    "set_heading_align", "set_heading_title_color", "set_heading_title_hover_color"
  ]
};

/** 创建 Elementor 标题元素。 */
export function createHeading(input?: CreateHeadingInput): ElementObject {
  return {
    id: generateId(),
    elType: "widget",
    widgetType: "heading",
    isInner: false,
    settings: {
      title: input?.title ?? "Heading",
      header_size: input?.tag ?? "h2",
      // link: { url: "#", is_external: "", nofollow: "", custom_attributes: "" }
    },
    elements: []
  };
}
