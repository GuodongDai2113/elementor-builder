interface SetBackgroundInput {
  color: string;
}

/** 设置元素普通状态的背景，自动使用 classic 类型。接受 color 字符串或 { color } 对象。 */
export function set_background(settings: Record<string, unknown>, input: string | SetBackgroundInput): void {
  settings.background_background = "classic";
  settings.background_color = typeof input === "string" ? input : input.color;
}

/** 设置元素悬停状态的背景，自动使用 classic 类型。接受 color 字符串或 { color } 对象。 */
export function set_background_hover(settings: Record<string, unknown>, input: string | SetBackgroundInput): void {
  settings.background_hover_background = "classic";
  settings.background_hover_color = typeof input === "string" ? input : input.color;
}
