type PaddingUnit = "px" | "%" | "em" | "rem" | "vw";

interface PaddingValue {
  /** CSS 单位。 */
  unit: PaddingUnit;
  /** 上内边距，输入为数字，写入 settings 时转成字符串。 */
  top: number;
  /** 右内边距，输入为数字，写入 settings 时转成字符串。 */
  right: number;
  /** 下内边距，输入为数字，写入 settings 时转成字符串。 */
  bottom: number;
  /** 左内边距，输入为数字，写入 settings 时转成字符串。 */
  left: number;
  /** 四边是否联动。 */
  isLinked: boolean;
}

interface SetPaddingInput {
  /** 写入目标。layout 写 padding，widget 写 _padding。 */
  scope: "layout" | "widget";
  /** 桌面端内边距。 */
  desktop?: PaddingValue;
  /** 平板端内边距。 */
  tablet?: PaddingValue;
  /** 手机端内边距。 */
  mobile?: PaddingValue;
}

/** 将 padding 输入转换为 Elementor settings 使用的四边尺寸对象。 */
function normalizePadding(value: PaddingValue) {
  return {
    unit: value.unit,
    top: String(value.top),
    right: String(value.right),
    bottom: String(value.bottom),
    left: String(value.left),
    isLinked: value.isLinked
  };
}

/** 根据编辑目标设置 padding 字段，layout 使用 padding，widget 使用 _padding。 */
export function set_padding(settings: Record<string, unknown>, input: SetPaddingInput): void {
  const baseKey = input.scope === "widget" ? "_padding" : "padding";

  if (input.desktop) {
    settings[baseKey] = normalizePadding(input.desktop);
  }

  if (input.tablet) {
    settings[`${baseKey}_tablet`] = normalizePadding(input.tablet);
  }

  if (input.mobile) {
    settings[`${baseKey}_mobile`] = normalizePadding(input.mobile);
  }
}

// 使用
// set_padding(settings, {
//   scope: "layout",
//   desktop: { unit: "px", top: 10, right: 10, bottom: 10, left: 10, isLinked: true },
//   tablet: { unit: "px", top: 20, right: 20, bottom: 20, left: 20, isLinked: true },
//   mobile: { unit: "px", top: 30, right: 30, bottom: 30, left: 30, isLinked: false }
// });
