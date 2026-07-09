import type { ElementBoundary, ElementObject } from "../types.js";
import { generateId } from "./base.js";

export interface CreateContainerInput {
  /** 容器布局类型。 */
  containerType?: "flexbox" | "grid";
}

/** 容器元素允许使用的 settings helper 边界。 */
export const CONTAINER_BOUNDARY: ElementBoundary = {
  element: "container",
  helpers: [
    "set_z_index", "set_element_id", "set_css_classes",
    "set_container_type", "set_container_width", "set_min_height",
    "set_flex_direction", "set_flex_justify_content", "set_flex_align_items", "set_flex_gap", "set_flex_wrap",
    "set_grid_columns", "set_grid_rows", "set_grid_gap", "set_grid_auto_flow", "set_grid_justify_items", "set_grid_align_items",
    "set_margin", "set_padding",
    "set_background", "set_background_hover",
    "set_border", "set_border_hover", "set_border_radius", "set_border_radius_hover",
    "set_box_shadow", "set_box_shadow_hover"
  ]
};

/** 创建 Elementor 容器元素。 */
export function createContainer(input?: CreateContainerInput): ElementObject {
  return {
    id: generateId(),
    elType: "container",
    widgetType: null,
    settings: {
      container_type: input?.containerType === "grid" ? "grid" : "flex",
      ...(input?.containerType === "grid" ? { presetTitle: "Grid", presetIcon: "eicon-container-grid" } : {})
    },
    elements: []
  };
}
