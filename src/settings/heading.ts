type HeadingAlign = "start" | "center" | "end" | "justify";

interface SetHeadingAlignInput {
  /** 标题对齐方式。 */
  align: HeadingAlign;
}

interface SetHeadingColorInput {
  /** 标题颜色值。 */
  color: string;
}

/** 设置标题对齐方式。 */
export function set_heading_align(settings: Record<string, unknown>, input: SetHeadingAlignInput): void {
  settings.align = input.align;
}

/** 设置标题普通状态颜色。 */
export function set_heading_title_color(settings: Record<string, unknown>, input: SetHeadingColorInput): void {
  settings.title_color = input.color;
}

/** 设置标题悬停状态颜色。 */
export function set_heading_title_hover_color(settings: Record<string, unknown>, input: SetHeadingColorInput): void {
  settings.title_hover_color = input.color;
}

/** 标题组件专属 settings helper 名称列表。 */
export const HEADING_SETTING_HELPERS = [
  "set_heading_align",
  "set_heading_title_color",
  "set_heading_title_hover_color"
] as const;
