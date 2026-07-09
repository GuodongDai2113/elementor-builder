type LayoutDevice = "desktop" | "tablet" | "mobile";

type LayoutSizeUnit = "px" | "%" | "em" | "rem" | "vw" | "vh" | "fr";

type ContainerType = "flexbox" | "grid";

type ContentWidth = "boxed" | "full";

type FlexDirection = "row" | "row-reverse" | "column" | "column-reverse";

type FlexJustifyContent = "flex-start" | "center" | "flex-end" | "space-between" | "space-around" | "space-evenly";

type FlexAlignItems = "flex-start" | "center" | "flex-end" | "stretch";

type FlexWrap = "nowrap" | "wrap";

type GridAutoFlow = "row" | "column" | "row dense" | "column dense";

type GridJustifyItems = "start" | "center" | "end" | "stretch";

type GridAlignItems = "start" | "center" | "end" | "stretch";

interface ResponsiveInput<T> {
  /** 桌面端设置，对应无后缀字段。 */
  desktop?: T;
  /** 平板端设置，对应 _tablet 后缀字段。 */
  tablet?: T;
  /** 手机端设置，对应 _mobile 后缀字段。 */
  mobile?: T;
}

interface LayoutSizeValue {
  /** CSS 单位。 */
  unit: LayoutSizeUnit;
  /** 尺寸数值。 */
  size: number;
}

interface LayoutGapValue {
  /** CSS 单位。 */
  unit: LayoutSizeUnit;
  /** 列间距，输入为数字，写入 settings 时转成字符串。 */
  column: number;
  /** 行间距，输入为数字，写入 settings 时转成字符串。 */
  row: number;
  /** 行列是否联动。 */
  isLinked: boolean;
}

interface SetContainerTypeInput {
  /** 容器类型，flexbox 会写入 Elementor 的 flex。 */
  type: ContainerType;
}

interface SetContainerWidthInput {
  /** 内容宽度模式。 */
  contentWidth?: ContentWidth;
  /** 自定义容器宽度，支持三端。 */
  width?: ResponsiveInput<LayoutSizeValue>;
  /** boxed 模式宽度，支持三端。 */
  boxedWidth?: ResponsiveInput<LayoutSizeValue>;
}

/** 返回三端字段后缀，桌面端不使用后缀。 */
function deviceSuffix(device: LayoutDevice): "" | "_tablet" | "_mobile" {
  if (device === "tablet") {
    return "_tablet";
  }
  if (device === "mobile") {
    return "_mobile";
  }
  return "";
}

/** 将尺寸输入转换为 Elementor size 对象。 */
function normalizeSize(value: LayoutSizeValue) {
  return {
    unit: value.unit,
    size: value.size,
    sizes: []
  };
}

/** 将 gap 输入转换为 Elementor gap 对象。 */
function normalizeGap(value: LayoutGapValue, includeSize: boolean) {
  return {
    column: String(value.column),
    row: String(value.row),
    isLinked: value.isLinked,
    unit: value.unit,
    ...(includeSize ? { size: value.column } : {})
  };
}

/** 将三端输入写入 settings。 */
function setResponsiveValue<T>(
  settings: Record<string, unknown>,
  baseKey: string,
  input: ResponsiveInput<T>,
  normalize: (value: T, device: LayoutDevice) => unknown
): void {
  for (const device of ["desktop", "tablet", "mobile"] as const) {
    const value = input[device];
    if (value !== undefined) {
      settings[`${baseKey}${deviceSuffix(device)}`] = normalize(value, device);
    }
  }
}

/** 设置容器类型。 */
export function set_container_type(settings: Record<string, unknown>, input: SetContainerTypeInput): void {
  settings.container_type = input.type === "grid" ? "grid" : "flex";

  if (input.type === "grid") {
    settings.presetTitle = "Grid";
    settings.presetIcon = "eicon-container-grid";
  }
}

/** 设置内容宽度、自定义宽度和 boxed 宽度。 */
export function set_container_width(settings: Record<string, unknown>, input: SetContainerWidthInput): void {
  if (input.contentWidth) {
    settings.content_width = input.contentWidth;
  }

  if (input.width) {
    setResponsiveValue(settings, "width", input.width, (value) => normalizeSize(value));
  }

  if (input.boxedWidth) {
    setResponsiveValue(settings, "boxed_width", input.boxedWidth, (value) => normalizeSize(value));
  }
}

/** 设置容器最小高度，支持三端。 */
export function set_min_height(settings: Record<string, unknown>, input: ResponsiveInput<LayoutSizeValue>): void {
  setResponsiveValue(settings, "min_height", input, (value) => normalizeSize(value));
}

/** 设置 flex direction，支持三端。 */
export function set_flex_direction(settings: Record<string, unknown>, input: ResponsiveInput<FlexDirection>): void {
  setResponsiveValue(settings, "flex_direction", input, (value) => value);
}

/** 设置 flex justify content，支持三端。 */
export function set_flex_justify_content(settings: Record<string, unknown>, input: ResponsiveInput<FlexJustifyContent>): void {
  setResponsiveValue(settings, "flex_justify_content", input, (value) => value);
}

/** 设置 flex align items，支持三端。 */
export function set_flex_align_items(settings: Record<string, unknown>, input: ResponsiveInput<FlexAlignItems>): void {
  setResponsiveValue(settings, "flex_align_items", input, (value) => value);
}

/** 设置 flex gap，支持三端。 */
export function set_flex_gap(settings: Record<string, unknown>, input: ResponsiveInput<LayoutGapValue>): void {
  setResponsiveValue(settings, "flex_gap", input, (value, device) => normalizeGap(value, device === "desktop"));
}

/** 设置 flex wrap，支持三端。 */
export function set_flex_wrap(settings: Record<string, unknown>, input: ResponsiveInput<FlexWrap>): void {
  setResponsiveValue(settings, "flex_wrap", input, (value) => value);
}

/** 设置 grid columns，支持三端。 */
export function set_grid_columns(settings: Record<string, unknown>, input: ResponsiveInput<LayoutSizeValue>): void {
  setResponsiveValue(settings, "grid_columns_grid", input, (value) => normalizeSize(value));
}

/** 设置 grid rows，支持三端。 */
export function set_grid_rows(settings: Record<string, unknown>, input: ResponsiveInput<LayoutSizeValue>): void {
  setResponsiveValue(settings, "grid_rows_grid", input, (value) => normalizeSize(value));
}

/** 设置 grid gap，支持三端。 */
export function set_grid_gap(settings: Record<string, unknown>, input: ResponsiveInput<LayoutGapValue>): void {
  setResponsiveValue(settings, "grid_gaps", input, (value) => normalizeGap(value, false));
}

/** 设置 grid auto flow，支持三端。 */
export function set_grid_auto_flow(settings: Record<string, unknown>, input: ResponsiveInput<GridAutoFlow>): void {
  setResponsiveValue(settings, "grid_auto_flow", input, (value) => value);
}

/** 设置 grid justify items，支持三端。 */
export function set_grid_justify_items(settings: Record<string, unknown>, input: ResponsiveInput<GridJustifyItems>): void {
  setResponsiveValue(settings, "grid_justify_items", input, (value) => value);
}

/** 设置 grid align items，支持三端。 */
export function set_grid_align_items(settings: Record<string, unknown>, input: ResponsiveInput<GridAlignItems>): void {
  setResponsiveValue(settings, "grid_align_items", input, (value) => value);
}
