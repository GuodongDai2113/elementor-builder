import type {
  ElementObject,
  ElementBoundary,
  ElementType,
  SettingHelperName,
  ElementorPage,
  CreatePageInput,
  ElementSettingApplication
} from "../types.js";

export const CONTAINER_BOUNDARY: ElementBoundary = {
  element: "container",
  helpers: [
    "set_container_type", "set_container_width", "set_min_height",
    "set_flex_direction", "set_flex_justify_content", "set_flex_align_items", "set_flex_gap", "set_flex_wrap",
    "set_grid_columns", "set_grid_rows", "set_grid_gap", "set_grid_auto_flow", "set_grid_justify_items", "set_grid_align_items",
    "set_margin", "set_padding",
    "set_background", "set_background_hover",
    "set_border", "set_border_hover", "set_border_radius", "set_border_radius_hover",
    "set_box_shadow", "set_box_shadow_hover"
  ]
};

export const HEADING_BOUNDARY: ElementBoundary = {
  element: "heading",
  helpers: [
    "set_margin", "set_padding",
    "set_background", "set_background_hover",
    "set_border", "set_border_hover", "set_border_radius", "set_border_radius_hover",
    "set_box_shadow", "set_box_shadow_hover",
    "set_typography",
    "set_heading_align", "set_heading_title_color", "set_heading_title_hover_color"
  ]
};

export const TEXT_BOUNDARY: ElementBoundary = {
  element: "text",
  helpers: [
    "set_margin", "set_padding",
    "set_background", "set_background_hover",
    "set_border", "set_border_hover", "set_border_radius", "set_border_radius_hover",
    "set_box_shadow", "set_box_shadow_hover",
    "set_typography",
    "set_text_color"
  ]
};

export const BUTTON_BOUNDARY: ElementBoundary = {
  element: "button",
  helpers: [
    "set_margin", "set_padding",
    "set_background", "set_background_hover",
    "set_border", "set_border_hover", "set_border_radius", "set_border_radius_hover",
    "set_box_shadow", "set_box_shadow_hover",
    "set_typography",
    "set_button_align", "set_button_text_color", "set_button_hover_color",
    "set_button_background_color", "set_button_background_hover_color",
    "set_button_border_color", "set_button_hover_border_color",
    "set_button_border", "set_button_box_shadow"
  ]
};

export const IMAGE_BOUNDARY: ElementBoundary = {
  element: "image",
  helpers: [
    "set_margin", "set_padding",
    "set_background", "set_background_hover",
    "set_border", "set_border_hover", "set_border_radius", "set_border_radius_hover",
    "set_box_shadow", "set_box_shadow_hover",
    "set_image_width", "set_image_space", "set_image_height",
    "set_image_object_fit", "set_image_object_position",
    "set_image_border", "set_image_border_radius"
  ]
};

const BOUNDARIES: Record<string, ElementBoundary> = {
  container: CONTAINER_BOUNDARY,
  heading: HEADING_BOUNDARY,
  "text-editor": TEXT_BOUNDARY,
  text: TEXT_BOUNDARY,
  button: BUTTON_BOUNDARY,
  image: IMAGE_BOUNDARY
};

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

export function helperAllowed(element: ElementObject, helperName: SettingHelperName): boolean {
  const boundary = boundaryForElement(element);
  return (boundary.helpers as readonly string[]).includes(helperName);
}

export function applySetting(page: ElementorPage, elementId: string, helper: ElementSettingApplication): ElementObject {
  const element = findElementById(page, elementId);
  if (!element) {
    throw new Error(`Element not found: ${elementId}`);
  }
  if (!helperAllowed(element, helper.name)) {
    throw new Error(`Helper ${helper.name} is not allowed for ${element.elType}${element.widgetType ? `/${element.widgetType}` : ""}`);
  }
  helper.apply(element.settings);
  return element;
}

export function findElementById(page: ElementorPage, id: string): ElementObject | null {
  return findInList(page.content, id);
}

function findInList(elements: ElementObject[], id: string): ElementObject | null {
  for (const element of elements) {
    if (element.id === id) return element;
    const found = findInList(element.elements, id);
    if (found) return found;
  }
  return null;
}

export function createPage(input: CreatePageInput = {}): ElementorPage {
  return {
    content: [],
    page_settings: [],
    version: input.version ?? "0.4",
    title: input.title ?? "page",
    type: input.type ?? "page"
  };
}
