

type MarginUnit = "px" | "%" | "em" | "rem" | "vw";

interface MarginValue {
  /** CSS 单位。 */
  unit: MarginUnit;
  /** 上外边距，输入为数字，写入 settings 时转成字符串。 */
  top: number;
  /** 右外边距，输入为数字，写入 settings 时转成字符串。 */
  right: number;
  /** 下外边距，输入为数字，写入 settings 时转成字符串。 */
  bottom: number;
  /** 左外边距，输入为数字，写入 settings 时转成字符串。 */
  left: number;
  /** 四边是否联动。 */
  isLinked: boolean;
}

interface SetMarginInput {
  /** 写入目标。layout 写 margin，widget 写 _margin。 */
  scope: "layout" | "widget";
  /** 桌面端外边距。 */
  desktop?: MarginValue;
  /** 平板端外边距。 */
  tablet?: MarginValue;
  /** 手机端外边距。 */
  mobile?: MarginValue;
}

/** 将 margin 输入转换为 Elementor settings 使用的四边尺寸对象。 */
function normalizeMargin(value: MarginValue) {
  return {
    unit: value.unit,
    top: String(value.top),
    right: String(value.right),
    bottom: String(value.bottom),
    left: String(value.left),
    isLinked: value.isLinked
  };
}

/** 根据编辑目标设置 margin 字段，layout 使用 margin，widget 使用 _margin。 */
export function set_margin(settings: Record<string, unknown>, input: SetMarginInput): void {
  const baseKey = input.scope === "widget" ? "_margin" : "margin";

  if (input.desktop) {
    settings[baseKey] = normalizeMargin(input.desktop);
  }

  if (input.tablet) {
    settings[`${baseKey}_tablet`] = normalizeMargin(input.tablet);
  }

  if (input.mobile) {
    settings[`${baseKey}_mobile`] = normalizeMargin(input.mobile);
  }
}

// 使用
// set_margin(settings, {
//   scope: "layout",
//   desktop: { unit: "px", top: 10, right: 10, bottom: 10, left: 10, isLinked: true },
//   tablet: { unit: "px", top: 20, right: 20, bottom: 20, left: 20, isLinked: true },
//   mobile: { unit: "px", top: 30, right: 30, bottom: 30, left: 30, isLinked: false }
// });