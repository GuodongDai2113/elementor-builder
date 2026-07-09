import type { ElementBoundary, ElementObject } from "../types.js";
import { generateId } from "./base.js";

export interface CreateImageInput {
  /** Elementor 图片对象。 */
  image?: unknown;
}

/** 图片元素允许使用的 settings helper 边界。 */
export const IMAGE_BOUNDARY: ElementBoundary = {
  element: "image",
  helpers: [
    "set_z_index", "set_element_id", "set_css_classes",
    "set_margin", "set_padding",
    "set_background", "set_background_hover",
    "set_border", "set_border_hover", "set_border_radius", "set_border_radius_hover",
    "set_box_shadow", "set_box_shadow_hover",
    "set_image_width", "set_image_space", "set_image_height",
    "set_image_object_fit", "set_image_object_position",
    "set_image_border", "set_image_border_radius"
  ]
};

/** 创建 Elementor 图片元素。 */
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
