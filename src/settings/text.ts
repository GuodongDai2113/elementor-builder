interface SetTextColorInput {
  /** 文本颜色值。 */
  color: string;
}

/** 设置文本普通状态颜色。 */
export function set_text_color(settings: Record<string, unknown>, input: SetTextColorInput): void {
  settings.text_color = input.color;
}

/** 文本组件专属 settings helper 名称列表。 */
export const TEXT_SETTING_HELPERS = ["set_text_color"] as const;
