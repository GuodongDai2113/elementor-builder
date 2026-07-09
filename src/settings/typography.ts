type TypographyUnit = "px" | "em" | "rem" | "%" | "vw";

interface ResponsiveInput<T> {
  /** 桌面端设置，对应无后缀字段。 */
  desktop?: T;
  /** 平板端设置，对应 _tablet 后缀字段。 */
  tablet?: T;
  /** 手机端设置，对应 _mobile 后缀字段。 */
  mobile?: T;
}

interface TypographySizeValue {
  /** CSS 单位。 */
  unit: TypographyUnit;
  /** 尺寸数值。 */
  size: number;
}

interface SetTypographyInput {
  /** 字号，支持三端。 */
  fontSize?: ResponsiveInput<TypographySizeValue>;
  /** 字重。 */
  fontWeight?: string;
  /** 文本大小写转换。 */
  textTransform?: string;
  /** 字体样式。 */
  fontStyle?: string;
  /** 文本装饰。 */
  textDecoration?: string;
  /** 行高，支持三端。 */
  lineHeight?: ResponsiveInput<TypographySizeValue>;
  /** 字间距，支持三端。 */
  letterSpacing?: ResponsiveInput<TypographySizeValue>;
  /** 词间距，支持三端。 */
  wordSpacing?: ResponsiveInput<TypographySizeValue>;
}

/** 返回三端字段后缀，桌面端不使用后缀。 */
function deviceSuffix(device: "desktop" | "tablet" | "mobile"): "" | "_tablet" | "_mobile" {
  if (device === "tablet") {
    return "_tablet";
  }
  if (device === "mobile") {
    return "_mobile";
  }
  return "";
}

/** 将 typography 尺寸输入转换为 Elementor size 对象。 */
function normalizeTypographySize(value: TypographySizeValue) {
  return {
    unit: value.unit,
    size: value.size,
    sizes: []
  };
}

/** 写入三端 typography 尺寸字段。 */
function setResponsiveTypographySize(settings: Record<string, unknown>, key: string, input: ResponsiveInput<TypographySizeValue>): void {
  for (const device of ["desktop", "tablet", "mobile"] as const) {
    const value = input[device];
    if (value !== undefined) {
      settings[`${key}${deviceSuffix(device)}`] = normalizeTypographySize(value);
    }
  }
}

/** 设置 Typography 控件相关字段。 */
export function set_typography(settings: Record<string, unknown>, input: SetTypographyInput): void {
  settings.typography_typography = "custom";

  if (input.fontSize) {
    setResponsiveTypographySize(settings, "typography_font_size", input.fontSize);
  }
  if (input.fontWeight !== undefined) {
    settings.typography_font_weight = input.fontWeight;
  }
  if (input.textTransform !== undefined) {
    settings.typography_text_transform = input.textTransform;
  }
  if (input.fontStyle !== undefined) {
    settings.typography_font_style = input.fontStyle;
  }
  if (input.textDecoration !== undefined) {
    settings.typography_text_decoration = input.textDecoration;
  }
  if (input.lineHeight) {
    setResponsiveTypographySize(settings, "typography_line_height", input.lineHeight);
  }
  if (input.letterSpacing) {
    setResponsiveTypographySize(settings, "typography_letter_spacing", input.letterSpacing);
  }
  if (input.wordSpacing) {
    setResponsiveTypographySize(settings, "typography_word_spacing", input.wordSpacing);
  }
}
