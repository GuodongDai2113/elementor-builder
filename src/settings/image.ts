type ImageUnit = "px" | "%" | "em" | "rem" | "vw" | "vh" | "custom";

type ImageBorderStyle = "solid" | "double" | "dotted" | "dashed" | "groove" | "none";

type ImageObjectFit = "" | "fill" | "cover" | "contain" | "scale-down";

type ImageObjectPosition =
  | "center center"
  | "center left"
  | "center right"
  | "top center"
  | "top left"
  | "top right"
  | "bottom center"
  | "bottom left"
  | "bottom right";

interface ResponsiveInput<T> {
  /** 桌面端设置，对应无后缀字段。 */
  desktop?: T;
  /** 平板端设置，对应 _tablet 后缀字段。 */
  tablet?: T;
  /** 手机端设置，对应 _mobile 后缀字段。 */
  mobile?: T;
}

interface ImageSizeValue {
  /** CSS 单位。 */
  unit: ImageUnit;
  /** 尺寸数值。 */
  size: number;
}

interface ImageDimensionValue {
  /** CSS 单位。 */
  unit: ImageUnit;
  /** 上边数值，输入为数字，写入 settings 时转成字符串。 */
  top: number;
  /** 右边数值，输入为数字，写入 settings 时转成字符串。 */
  right: number;
  /** 下边数值，输入为数字，写入 settings 时转成字符串。 */
  bottom: number;
  /** 左边数值，输入为数字，写入 settings 时转成字符串。 */
  left: number;
  /** 四边是否联动。 */
  isLinked: boolean;
}

interface SetImageBorderInput {
  /** 图片边框样式。 */
  border: ImageBorderStyle;
  /** 图片边框宽度。 */
  width: ImageDimensionValue;
  /** 图片边框颜色。 */
  color: string;
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

/** 将图片尺寸输入转换为 Elementor size 对象。 */
function normalizeImageSize(value: ImageSizeValue) {
  return {
    unit: value.unit,
    size: value.size,
    sizes: []
  };
}

/** 将图片四边尺寸输入转换为 Elementor dimensions 对象。 */
function normalizeImageDimension(value: ImageDimensionValue) {
  return {
    unit: value.unit,
    top: String(value.top),
    right: String(value.right),
    bottom: String(value.bottom),
    left: String(value.left),
    isLinked: value.isLinked
  };
}

/** 写入三端响应式字段。 */
function setResponsiveValue<T>(
  settings: Record<string, unknown>,
  key: string,
  input: ResponsiveInput<T>,
  normalize: (value: T) => unknown
): void {
  for (const device of ["desktop", "tablet", "mobile"] as const) {
    const value = input[device];
    if (value !== undefined) {
      settings[`${key}${deviceSuffix(device)}`] = normalize(value);
    }
  }
}

/** 设置图片宽度。 */
export function set_image_width(settings: Record<string, unknown>, input: ResponsiveInput<ImageSizeValue>): void {
  setResponsiveValue(settings, "width", input, normalizeImageSize);
}

/** 设置图片最大宽度。 */
export function set_image_space(settings: Record<string, unknown>, input: ResponsiveInput<ImageSizeValue>): void {
  setResponsiveValue(settings, "space", input, normalizeImageSize);
}

/** 设置图片高度。 */
export function set_image_height(settings: Record<string, unknown>, input: ResponsiveInput<ImageSizeValue>): void {
  setResponsiveValue(settings, "height", input, normalizeImageSize);
}

/** 设置图片 object-fit。 */
export function set_image_object_fit(settings: Record<string, unknown>, input: ResponsiveInput<ImageObjectFit>): void {
  setResponsiveValue(settings, "object-fit", input, (value) => value);
}

/** 设置图片 object-position。 */
export function set_image_object_position(settings: Record<string, unknown>, input: ResponsiveInput<ImageObjectPosition>): void {
  setResponsiveValue(settings, "object-position", input, (value) => value);
}

/** 设置图片边框样式、宽度和颜色。 */
export function set_image_border(settings: Record<string, unknown>, input: SetImageBorderInput): void {
  settings.image_border_border = input.border;
  settings.image_border_width = normalizeImageDimension(input.width);
  settings.image_border_color = input.color;
}

/** 设置图片圆角。 */
export function set_image_border_radius(settings: Record<string, unknown>, input: ResponsiveInput<ImageDimensionValue>): void {
  setResponsiveValue(settings, "image_border_radius", input, normalizeImageDimension);
}

/** 图片组件专属 settings helper 名称列表。 */
export const IMAGE_SETTING_HELPERS = [
  "set_image_width",
  "set_image_space",
  "set_image_height",
  "set_image_object_fit",
  "set_image_object_position",
  "set_image_border",
  "set_image_border_radius"
] as const;
