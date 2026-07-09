type BackgroundType = "classic" | "gradient";

type BackgroundState = "normal" | "hover";

interface SetBackgroundInput {
  /** 写入目标。layout 写 background_*，widget 写 _background_*。 */
  scope: "layout" | "widget";
  /** 背景类型。 */
  background: BackgroundType;
  /** 背景颜色。 */
  color: string;
}

/** 根据编辑目标返回 Elementor 背景字段前缀。 */
function backgroundPrefix(scope: "layout" | "widget"): "" | "_" {
  return scope === "widget" ? "_" : "";
}

/** 根据背景状态返回 Elementor 背景字段主体。 */
function backgroundStateKey(state: BackgroundState): "background" | "background_hover" {
  return state === "hover" ? "background_hover" : "background";
}

/** 设置指定状态的背景类型和背景颜色。 */
function setBackgroundState(settings: Record<string, unknown>, input: SetBackgroundInput, state: BackgroundState): void {
  const prefix = backgroundPrefix(input.scope);
  const key = backgroundStateKey(state);

  settings[`${prefix}${key}_background`] = input.background;
  settings[`${prefix}${key}_color`] = input.color;
}

/** 设置背景类型和背景颜色。 */
export function set_background(settings: Record<string, unknown>, input: SetBackgroundInput): void {
  setBackgroundState(settings, input, "normal");
}

/** 设置 hover 状态的背景类型和背景颜色。 */
export function set_background_hover(settings: Record<string, unknown>, input: SetBackgroundInput): void {
  setBackgroundState(settings, input, "hover");
}
