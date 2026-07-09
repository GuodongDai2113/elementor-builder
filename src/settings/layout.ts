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
  desktop?: T;
  tablet?: T;
  mobile?: T;
}

interface LayoutSizeValue {
  unit: LayoutSizeUnit;
  size: number;
}

interface LayoutGapValue {
  unit: LayoutSizeUnit;
  column: number;
  row: number;
  isLinked: boolean;
}

interface SetContainerWidthInput {
  contentWidth?: ContentWidth;
  width?: ResponsiveInput<LayoutSizeValue>;
  boxedWidth?: ResponsiveInput<LayoutSizeValue>;
}

function deviceSuffix(device: LayoutDevice): "" | "_tablet" | "_mobile" {
  if (device === "tablet") return "_tablet";
  if (device === "mobile") return "_mobile";
  return "";
}

function normalizeSize(value: LayoutSizeValue) {
  return { unit: value.unit, size: value.size, sizes: [] };
}

function normalizeGap(value: LayoutGapValue, includeSize: boolean) {
  return {
    column: String(value.column),
    row: String(value.row),
    isLinked: value.isLinked,
    unit: value.unit,
    ...(includeSize ? { size: value.column } : {})
  };
}

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

function resolveSize(input: number | ResponsiveInput<LayoutSizeValue>): ResponsiveInput<LayoutSizeValue> {
  if (typeof input === "number") {
    return { desktop: { unit: "px", size: input } };
  }
  return input;
}

function resolveGap(input: number | ResponsiveInput<LayoutGapValue>): ResponsiveInput<LayoutGapValue> {
  if (typeof input === "number") {
    return { desktop: { unit: "px", column: input, row: input, isLinked: true } };
  }
  return input;
}

function resolveString<T extends string>(input: T | ResponsiveInput<T>): ResponsiveInput<T> {
  if (typeof input === "string") {
    return { desktop: input as T };
  }
  return input;
}

/** 设置容器类型。接受裸值 "flexbox" / "grid" 或 { type } 对象。 */
export function set_container_type(settings: Record<string, unknown>, input: ContainerType | { type: ContainerType }): void {
  const type = typeof input === "string" ? input : input.type;
  settings.container_type = type === "grid" ? "grid" : "flex";
  if (type === "grid") {
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

/** 设置容器最小高度。裸值 number 表示 desktop px。 */
export function set_min_height(settings: Record<string, unknown>, input: number | ResponsiveInput<LayoutSizeValue>): void {
  setResponsiveValue(settings, "min_height", resolveSize(input), (value) => normalizeSize(value));
}

/** 设置 flex direction。裸值字符串表示 desktop。 */
export function set_flex_direction(settings: Record<string, unknown>, input: FlexDirection | ResponsiveInput<FlexDirection>): void {
  setResponsiveValue(settings, "flex_direction", resolveString(input), (value) => value);
}

/** 设置 flex justify content。裸值字符串表示 desktop。 */
export function set_flex_justify_content(settings: Record<string, unknown>, input: FlexJustifyContent | ResponsiveInput<FlexJustifyContent>): void {
  setResponsiveValue(settings, "flex_justify_content", resolveString(input), (value) => value);
}

/** 设置 flex align items。裸值字符串表示 desktop。 */
export function set_flex_align_items(settings: Record<string, unknown>, input: FlexAlignItems | ResponsiveInput<FlexAlignItems>): void {
  setResponsiveValue(settings, "flex_align_items", resolveString(input), (value) => value);
}

/** 设置 flex gap。裸值 number 表示 desktop px（行列联动）。 */
export function set_flex_gap(settings: Record<string, unknown>, input: number | ResponsiveInput<LayoutGapValue>): void {
  setResponsiveValue(settings, "flex_gap", resolveGap(input), (value, device) => normalizeGap(value, device === "desktop"));
}

/** 设置 flex wrap。裸值字符串表示 desktop。 */
export function set_flex_wrap(settings: Record<string, unknown>, input: FlexWrap | ResponsiveInput<FlexWrap>): void {
  setResponsiveValue(settings, "flex_wrap", resolveString(input), (value) => value);
}

/** 设置 grid columns。裸值 number 表示 desktop px。 */
export function set_grid_columns(settings: Record<string, unknown>, input: number | ResponsiveInput<LayoutSizeValue>): void {
  setResponsiveValue(settings, "grid_columns_grid", resolveSize(input), (value) => normalizeSize(value));
}

/** 设置 grid rows。裸值 number 表示 desktop px。 */
export function set_grid_rows(settings: Record<string, unknown>, input: number | ResponsiveInput<LayoutSizeValue>): void {
  setResponsiveValue(settings, "grid_rows_grid", resolveSize(input), (value) => normalizeSize(value));
}

/** 设置 grid gap。裸值 number 表示 desktop px（行列联动）。 */
export function set_grid_gap(settings: Record<string, unknown>, input: number | ResponsiveInput<LayoutGapValue>): void {
  setResponsiveValue(settings, "grid_gaps", resolveGap(input), (value) => normalizeGap(value, false));
}

/** 设置 grid auto flow。裸值字符串表示 desktop。 */
export function set_grid_auto_flow(settings: Record<string, unknown>, input: GridAutoFlow | ResponsiveInput<GridAutoFlow>): void {
  setResponsiveValue(settings, "grid_auto_flow", resolveString(input), (value) => value);
}

/** 设置 grid justify items。裸值字符串表示 desktop。 */
export function set_grid_justify_items(settings: Record<string, unknown>, input: GridJustifyItems | ResponsiveInput<GridJustifyItems>): void {
  setResponsiveValue(settings, "grid_justify_items", resolveString(input), (value) => value);
}

/** 设置 grid align items。裸值字符串表示 desktop。 */
export function set_grid_align_items(settings: Record<string, unknown>, input: GridAlignItems | ResponsiveInput<GridAlignItems>): void {
  setResponsiveValue(settings, "grid_align_items", resolveString(input), (value) => value);
}
