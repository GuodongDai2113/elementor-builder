type ButtonAlign = "left" | "center" | "right" | "justify";

type ButtonBorderStyle = "solid" | "double" | "dotted" | "dashed" | "groove" | "none";

type ButtonUnit = "px" | "%" | "em" | "rem" | "vw" | "custom";

interface SetButtonAlignInput {
  /** 按钮对齐方式。 */
  align: ButtonAlign;
}

interface SetButtonColorInput {
  /** 按钮颜色值。 */
  color: string;
}

interface ButtonBorderWidthValue {
  /** CSS 单位。 */
  unit: ButtonUnit;
  /** 上边框宽度，输入为数字，写入 settings 时转成字符串。 */
  top: number;
  /** 右边框宽度，输入为数字，写入 settings 时转成字符串。 */
  right: number;
  /** 下边框宽度，输入为数字，写入 settings 时转成字符串。 */
  bottom: number;
  /** 左边框宽度，输入为数字，写入 settings 时转成字符串。 */
  left: number;
  /** 四边是否联动。 */
  isLinked: boolean;
}

interface ButtonShadowValue {
  /** 水平阴影偏移。 */
  horizontal: number;
  /** 垂直阴影偏移。 */
  vertical: number;
  /** 阴影模糊半径。 */
  blur: number;
  /** 阴影扩散半径。 */
  spread: number;
  /** 阴影颜色。 */
  color: string;
}

interface SetButtonBorderInput {
  /** 边框样式。 */
  border: ButtonBorderStyle;
  /** 边框宽度。 */
  width: ButtonBorderWidthValue;
}

interface SetButtonBoxShadowInput {
  /** 按钮阴影参数。 */
  shadow: ButtonShadowValue;
}

/** 将按钮边框宽度转换为 Elementor 四边尺寸对象。 */
function normalizeButtonBorderWidth(value: ButtonBorderWidthValue) {
  return {
    unit: value.unit,
    top: String(value.top),
    right: String(value.right),
    bottom: String(value.bottom),
    left: String(value.left),
    isLinked: value.isLinked
  };
}

/** 设置按钮对齐方式。 */
export function set_button_align(settings: Record<string, unknown>, input: SetButtonAlignInput): void {
  settings.align = input.align;
}

/** 设置按钮普通状态文本颜色。 */
export function set_button_text_color(settings: Record<string, unknown>, input: SetButtonColorInput): void {
  settings.button_text_color = input.color;
}

/** 设置按钮悬停状态文本颜色。 */
export function set_button_hover_color(settings: Record<string, unknown>, input: SetButtonColorInput): void {
  settings.hover_color = input.color;
}

/** 设置按钮普通状态背景颜色。 */
export function set_button_background_color(settings: Record<string, unknown>, input: SetButtonColorInput): void {
  settings.background_color = input.color;
}

/** 设置按钮悬停状态背景颜色。 */
export function set_button_background_hover_color(settings: Record<string, unknown>, input: SetButtonColorInput): void {
  settings.button_background_hover_color = input.color;
}

/** 设置按钮普通状态边框颜色。 */
export function set_button_border_color(settings: Record<string, unknown>, input: SetButtonColorInput): void {
  settings.border_color = input.color;
}

/** 设置按钮悬停状态边框颜色。 */
export function set_button_hover_border_color(settings: Record<string, unknown>, input: SetButtonColorInput): void {
  settings.button_hover_border_color = input.color;
}

/** 设置按钮边框样式和宽度。 */
export function set_button_border(settings: Record<string, unknown>, input: SetButtonBorderInput): void {
  settings.border_border = input.border;
  settings.border_width = normalizeButtonBorderWidth(input.width);
}

/** 设置按钮普通状态阴影。 */
export function set_button_box_shadow(settings: Record<string, unknown>, input: SetButtonBoxShadowInput): void {
  settings.button_box_shadow_box_shadow_type = "yes";
  settings.button_box_shadow_box_shadow = input.shadow;
}

/** 按钮组件专属 settings helper 名称列表。 */
export const BUTTON_SETTING_HELPERS = [
  "set_button_align",
  "set_button_text_color",
  "set_button_hover_color",
  "set_button_background_color",
  "set_button_background_hover_color",
  "set_button_border_color",
  "set_button_hover_border_color",
  "set_button_border",
  "set_button_box_shadow"
] as const;
