/** 设置文本颜色。 */
export function set_text_color(settings: Record<string, unknown>, value: string): void {
  settings.text_color = String(value);
}

/** 文本组件专属 settings helper 名称列表。 */
export const TEXT_SETTING_HELPERS = ["set_text_color"] as const;
