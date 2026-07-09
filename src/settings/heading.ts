type HeadingAlign = "start" | "center" | "end" | "justify";

/** 设置标题对齐方式。 */
export function set_heading_align(settings: Record<string, unknown>, value: HeadingAlign): void {
  settings.align = value;
}

/** 设置标题文字颜色。 */
export function set_heading_title_color(settings: Record<string, unknown>, value: string): void {
  settings.title_color = String(value);
}

/** 设置标题悬停状态颜色。 */
export function set_heading_title_hover_color(settings: Record<string, unknown>, value: string): void {
  settings.title_hover_color = String(value);
}

/** 标题组件专属 settings helper 名称列表。 */
export const HEADING_SETTING_HELPERS = [
  "set_heading_align",
  "set_heading_title_color",
  "set_heading_title_hover_color"
] as const;
