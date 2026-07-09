export type ElType = "container" | "widget";
export type WidgetType = "heading" | "text-editor" | "button" | "image" | "html";
export type ElementType = "container" | "heading" | "text" | "button" | "image";
export type ResponsiveDevice = "desktop" | "tablet" | "mobile";

export interface ElementObject {
  id: string;
  elType: ElType;
  widgetType?: string | null;
  isInner?: boolean;
  settings: Record<string, unknown>;
  elements: ElementObject[];
  [key: string]: unknown;
}

export type SettingHelperName =
  | "set_background" | "set_background_hover"
  | "set_border" | "set_border_hover"
  | "set_border_radius" | "set_border_radius_hover"
  | "set_box_shadow" | "set_box_shadow_hover"
  | "set_margin" | "set_padding"
  | "set_typography"
  | "set_text_color"
  | "set_z_index" | "set_element_id" | "set_css_classes"
  | "set_container_type" | "set_container_width" | "set_min_height"
  | "set_flex_direction" | "set_flex_justify_content" | "set_flex_align_items" | "set_flex_gap" | "set_flex_wrap"
  | "set_grid_columns" | "set_grid_rows" | "set_grid_gap" | "set_grid_auto_flow" | "set_grid_justify_items" | "set_grid_align_items"
  | "set_heading_align" | "set_heading_title_color" | "set_heading_title_hover_color"
  | "set_button_align" | "set_button_text_color" | "set_button_text_hover_color"
  | "set_button_background_color" | "set_button_background_hover_color"
  | "set_button_border_color" | "set_button_hover_border_color" | "set_button_border" | "set_button_box_shadow"
  | "set_button_text_padding"
  | "set_image_width" | "set_image_space" | "set_image_height"
  | "set_image_object_fit" | "set_image_object_position"
  | "set_image_border" | "set_image_border_radius";

export interface ElementBoundary {
  element: ElementType;
  helpers: readonly SettingHelperName[];
}

export interface ElementorPage {
  content: ElementObject[];
  page_settings: unknown[];
  version: string;
  title: string;
  type: string;
}

export interface CreatePageInput {
  title?: string;
  type?: string;
  version?: string;
}

export interface ElementSettingApplication {
  name: SettingHelperName;
  apply: (settings: Record<string, unknown>) => void;
}

export interface HistoryEntry {
  operation: string;
  at: string;
  target?: string;
  elementId?: string;
}

export interface BuilderPage {
  pageId: string;
  createdAt: string;
  updatedAt: string;
  tree: ElementObject[];
  aliases: Record<string, string>;
  history: HistoryEntry[];
}

export interface StructurePreviewNode {
  id: string;
  alias: string | null;
  elType: string;
  widgetType?: string;
  label: string;
  elements: StructurePreviewNode[];
}

export interface ValidationError {
  path: string;
  message: string;
}
