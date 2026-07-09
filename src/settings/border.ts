type BorderUnit = "px" | "%" | "em" | "rem" | "vw";

type BorderStyle = "solid" | "double" | "dotted" | "dashed" | "groove" | "none";

interface BorderDimensionValue {
  /** CSS 单位。 */
  unit: BorderUnit;
  /** 上边框数值，输入为数字，写入 settings 时转成字符串。 */
  top: number;
  /** 右边框数值，输入为数字，写入 settings 时转成字符串。 */
  right: number;
  /** 下边框数值，输入为数字，写入 settings 时转成字符串。 */
  bottom: number;
  /** 左边框数值，输入为数字，写入 settings 时转成字符串。 */
  left: number;
  /** 四边是否联动。 */
  isLinked: boolean;
}

interface BorderShadowValue {
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

interface SetBorderInput {
  /** 写入目标。layout 写 border_*，widget 写 _border_*。 */
  scope: "layout" | "widget";
  /** 边框样式。 */
  border?: BorderStyle;
  /** 边框颜色。 */
  color?: string;
  /** 桌面端边框宽度。 */
  desktop?: BorderDimensionValue;
  /** 平板端边框宽度。 */
  tablet?: BorderDimensionValue;
  /** 手机端边框宽度。 */
  mobile?: BorderDimensionValue;
}

interface SetBorderRadiusInput {
  /** 写入目标。layout 写 border_radius，widget 写 _border_radius。 */
  scope: "layout" | "widget";
  /** 桌面端圆角。 */
  desktop?: BorderDimensionValue;
  /** 平板端圆角。 */
  tablet?: BorderDimensionValue;
  /** 手机端圆角。 */
  mobile?: BorderDimensionValue;
}

interface SetBoxShadowInput {
  /** 写入目标。layout 写 box_shadow_*，widget 写 _box_shadow_*。 */
  scope: "layout" | "widget";
  /** 阴影参数。 */
  shadow: BorderShadowValue;
}

type BorderState = "normal" | "hover";

/** 将 border 尺寸输入转换为 Elementor settings 使用的四边尺寸对象。 */
function normalizeBorderDimension(value: BorderDimensionValue) {
  return {
    unit: value.unit,
    top: String(value.top),
    right: String(value.right),
    bottom: String(value.bottom),
    left: String(value.left),
    isLinked: value.isLinked
  };
}

/** 根据编辑目标返回 Elementor 边框字段前缀。 */
function borderPrefix(scope: "layout" | "widget"): "" | "_" {
  return scope === "widget" ? "_" : "";
}

/** 根据边框状态返回 Elementor 边框字段主体。 */
function borderStateKey(state: BorderState): "border" | "border_hover" {
  return state === "hover" ? "border_hover" : "border";
}

/** 根据边框状态返回 Elementor 圆角字段主体。 */
function borderRadiusStateKey(state: BorderState): "border_radius" | "border_radius_hover" {
  return state === "hover" ? "border_radius_hover" : "border_radius";
}

/** 根据阴影状态返回 Elementor 阴影字段主体。 */
function boxShadowStateKey(state: BorderState): "box_shadow" | "box_shadow_hover" {
  return state === "hover" ? "box_shadow_hover" : "box_shadow";
}

/** 设置指定状态的边框样式、边框颜色和三端边框宽度。 */
function setBorderState(settings: Record<string, unknown>, input: SetBorderInput, state: BorderState): void {
  const prefix = borderPrefix(input.scope);
  const key = borderStateKey(state);

  if (input.border) {
    settings[`${prefix}${key}_border`] = input.border;
  }

  if (input.color) {
    settings[`${prefix}${key}_color`] = input.color;
  }

  if (input.desktop) {
    settings[`${prefix}${key}_width`] = normalizeBorderDimension(input.desktop);
  }

  if (input.tablet) {
    settings[`${prefix}${key}_width_tablet`] = normalizeBorderDimension(input.tablet);
  }

  if (input.mobile) {
    settings[`${prefix}${key}_width_mobile`] = normalizeBorderDimension(input.mobile);
  }
}

/** 设置指定状态的三端圆角。 */
function setBorderRadiusState(settings: Record<string, unknown>, input: SetBorderRadiusInput, state: BorderState): void {
  const prefix = borderPrefix(input.scope);
  const key = borderRadiusStateKey(state);

  if (input.desktop) {
    settings[`${prefix}${key}`] = normalizeBorderDimension(input.desktop);
  }

  if (input.tablet) {
    settings[`${prefix}${key}_tablet`] = normalizeBorderDimension(input.tablet);
  }

  if (input.mobile) {
    settings[`${prefix}${key}_mobile`] = normalizeBorderDimension(input.mobile);
  }
}

/** 设置指定状态的阴影开关和阴影参数。 */
function setBoxShadowState(settings: Record<string, unknown>, input: SetBoxShadowInput, state: BorderState): void {
  const prefix = borderPrefix(input.scope);
  const key = boxShadowStateKey(state);

  settings[`${prefix}${key}_box_shadow_type`] = "yes";
  settings[`${prefix}${key}_box_shadow`] = input.shadow;
}

/** 设置边框样式、边框颜色和三端边框宽度。 */
export function set_border(settings: Record<string, unknown>, input: SetBorderInput): void {
  setBorderState(settings, input, "normal");
}

/** 设置三端圆角。 */
export function set_border_radius(settings: Record<string, unknown>, input: SetBorderRadiusInput): void {
  setBorderRadiusState(settings, input, "normal");
}

/** 设置阴影开关和阴影参数。 */
export function set_box_shadow(settings: Record<string, unknown>, input: SetBoxShadowInput): void {
  setBoxShadowState(settings, input, "normal");
}

/** 设置 hover 状态的边框样式、边框颜色和三端边框宽度。 */
export function set_border_hover(settings: Record<string, unknown>, input: SetBorderInput): void {
  setBorderState(settings, input, "hover");
}

/** 设置 hover 状态的三端圆角。 */
export function set_border_radius_hover(settings: Record<string, unknown>, input: SetBorderRadiusInput): void {
  setBorderRadiusState(settings, input, "hover");
}

/** 设置 hover 状态的阴影开关和阴影参数。 */
export function set_box_shadow_hover(settings: Record<string, unknown>, input: SetBoxShadowInput): void {
  setBoxShadowState(settings, input, "hover");
}
