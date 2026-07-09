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
  desktop?: T;
  tablet?: T;
  mobile?: T;
}

interface ImageSizeValue {
  unit: ImageUnit;
  size: number;
}

interface ImageDimensionValue {
  unit: ImageUnit;
  top: number;
  right: number;
  bottom: number;
  left: number;
  isLinked: boolean;
}

interface SetImageBorderInput {
  border: ImageBorderStyle;
  width: ImageDimensionValue;
  color: string;
}

function deviceSuffix(device: "desktop" | "tablet" | "mobile"): "" | "_tablet" | "_mobile" {
  if (device === "tablet") return "_tablet";
  if (device === "mobile") return "_mobile";
  return "";
}

function normalizeImageSize(value: ImageSizeValue) {
  return { unit: value.unit, size: value.size, sizes: [] };
}

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

function resolveSize(input: number | ResponsiveInput<ImageSizeValue>): ResponsiveInput<ImageSizeValue> {
  if (typeof input === "number") {
    return { desktop: { unit: "px", size: input } };
  }
  return input;
}

function resolveString<T extends string>(input: T | ResponsiveInput<T>): ResponsiveInput<T> {
  if (typeof input === "string") {
    return { desktop: input as T };
  }
  return input;
}

function resolveDimension(input: number | ResponsiveInput<ImageDimensionValue>): ResponsiveInput<ImageDimensionValue> {
  if (typeof input === "number") {
    return { desktop: { unit: "px", top: input, right: input, bottom: input, left: input, isLinked: true } };
  }
  return input;
}

/** 设置图片宽度。裸值 number 表示 desktop px。 */
export function set_image_width(settings: Record<string, unknown>, input: number | ResponsiveInput<ImageSizeValue>): void {
  setResponsiveValue(settings, "width", resolveSize(input), normalizeImageSize);
}

/** 设置图片外边距。裸值 number 表示 desktop px。 */
export function set_image_space(settings: Record<string, unknown>, input: number | ResponsiveInput<ImageSizeValue>): void {
  setResponsiveValue(settings, "space", resolveSize(input), normalizeImageSize);
}

/** 设置图片高度。裸值 number 表示 desktop px。 */
export function set_image_height(settings: Record<string, unknown>, input: number | ResponsiveInput<ImageSizeValue>): void {
  setResponsiveValue(settings, "height", resolveSize(input), normalizeImageSize);
}

/** 设置图片 object-fit。裸值字符串表示 desktop。 */
export function set_image_object_fit(settings: Record<string, unknown>, input: ImageObjectFit | ResponsiveInput<ImageObjectFit>): void {
  setResponsiveValue(settings, "object-fit", resolveString(input), (value) => value);
}

/** 设置图片 object-position。裸值字符串表示 desktop。 */
export function set_image_object_position(settings: Record<string, unknown>, input: ImageObjectPosition | ResponsiveInput<ImageObjectPosition>): void {
  setResponsiveValue(settings, "object-position", resolveString(input), (value) => value);
}

/** 设置图片边框样式、宽度和颜色。 */
export function set_image_border(settings: Record<string, unknown>, input: SetImageBorderInput): void {
  settings.image_border_border = input.border;
  settings.image_border_width = normalizeImageDimension(input.width);
  settings.image_border_color = input.color;
}

/** 设置图片圆角。裸值 number 表示 desktop px（四边联动）。 */
export function set_image_border_radius(settings: Record<string, unknown>, input: number | ResponsiveInput<ImageDimensionValue>): void {
  setResponsiveValue(settings, "image_border_radius", resolveDimension(input), normalizeImageDimension);
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
