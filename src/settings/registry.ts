import type { ElementObject, ResponsiveDevice, SettingHelperName } from "../types.js";
import { set_background, set_background_hover } from "./background.js";
import { set_border, set_border_hover, set_border_radius, set_border_radius_hover, set_box_shadow, set_box_shadow_hover } from "./border.js";
import { set_button_align, set_button_background_color, set_button_background_hover_color, set_button_border, set_button_border_color, set_button_box_shadow, set_button_hover_border_color, set_button_text_color, set_button_text_hover_color, set_button_text_padding } from "./button.js";
import { set_css_classes, set_element_id, set_z_index } from "./base.js";
import { set_container_type, set_container_width, set_flex_align_items, set_flex_direction, set_flex_gap, set_flex_justify_content, set_flex_wrap, set_grid_align_items, set_grid_auto_flow, set_grid_columns, set_grid_gap, set_grid_justify_items, set_grid_rows, set_min_height } from "./layout.js";
import { set_heading_align, set_heading_title_color, set_heading_title_hover_color } from "./heading.js";
import { set_image_border, set_image_border_radius, set_image_height, set_image_object_fit, set_image_object_position, set_image_space, set_image_width } from "./image.js";
import { set_margin } from "./margin.js";
import { set_padding } from "./padding.js";
import { set_text_color } from "./text.js";
import { set_typography } from "./typography.js";

export type SettingScope = "layout" | "widget";

export interface SettingApplyContext {
  /** 当前被写入 settings 的 Elementor 元素。 */
  element: ElementObject;
  /** 用户显式指定的写入目标；未提供时根据元素类型推断。 */
  scope?: SettingScope;
  /** 用户显式指定的响应式设备；未提供时默认写入 desktop 字段。 */
  device?: ResponsiveDevice;
}

interface SettingHelperDefinition {
  /** helper 名称，对外暴露给工具调用方。 */
  name: SettingHelperName;
  /** helper 的中文/英文说明，返回给 helpers 工具。 */
  description: string;
  /** 将统一 value 入参写入 Elementor settings。 */
  apply: (settings: Record<string, unknown>, value: unknown, context: SettingApplyContext) => void;
}

interface EdgeValue {
  /** CSS 单位。 */
  unit: string;
  /** 上边距、上内边距或上边框数值。 */
  top: number;
  /** 右边距、右内边距或右边框数值。 */
  right: number;
  /** 下边距、下内边距或下边框数值。 */
  bottom: number;
  /** 左边距、左内边距或左边框数值。 */
  left: number;
  /** 四边是否联动。 */
  isLinked: boolean;
}

interface ResponsiveValue<T> {
  /** 桌面端输入值。 */
  desktop?: T;
  /** 平板端输入值。 */
  tablet?: T;
  /** 手机端输入值。 */
  mobile?: T;
}

interface ShadowValue {
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

/** 判断输入是否为普通对象。 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** 将 JSON 字符串兼容性输入解析为真实值，普通字符串保持不变。 */
export function parseSettingValue(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}

/** 根据元素类型和显式 scope 推断 settings 字段写入目标。 */
function resolveScope(context: SettingApplyContext): SettingScope {
  if (context.scope) {
    return context.scope;
  }
  return context.element.elType === "container" ? "layout" : "widget";
}

/** 返回显式设备；未传时默认写入 desktop 字段。 */
function resolveDevice(context: SettingApplyContext): ResponsiveDevice {
  return context.device ?? "desktop";
}

/** 将字符串或数字数值转换为 number，非法值抛出清晰错误。 */
function toNumber(value: unknown, field: string): number {
  const numberValue = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numberValue)) {
    throw new Error(`Invalid numeric setting field "${field}".`);
  }
  return numberValue;
}

/** 将四边输入归一化为 settings helper 可接受的 EdgeValue。 */
function normalizeEdge(value: unknown): EdgeValue {
  if (!isRecord(value)) {
    throw new Error("Expected an object with unit, top, right, bottom, and left fields.");
  }

  const top = toNumber(value.top, "top");
  const right = toNumber(value.right, "right");
  const bottom = toNumber(value.bottom, "bottom");
  const left = toNumber(value.left, "left");
  const inferredLinked = top === right && right === bottom && bottom === left;

  return {
    unit: String(value.unit ?? "px"),
    top,
    right,
    bottom,
    left,
    isLinked: typeof value.isLinked === "boolean" ? value.isLinked : inferredLinked
  };
}

/** 将尺寸输入归一化为 settings helper 可接受的 size 对象。 */
function normalizeSize(value: unknown) {
  if (typeof value === "number") {
    return { unit: "px", size: value };
  }
  if (!isRecord(value)) {
    throw new Error("Expected a number or an object with unit and size fields.");
  }
  return {
    unit: String(value.unit ?? "px"),
    size: toNumber(value.size, "size")
  };
}

/** 将 gap 输入归一化为 settings helper 可接受的 gap 对象。 */
function normalizeGap(value: unknown) {
  if (typeof value === "number") {
    return value;
  }
  if (!isRecord(value)) {
    throw new Error("Expected a number or an object with unit, column, and row fields.");
  }
  return {
    unit: String(value.unit ?? "px"),
    column: toNumber(value.column, "column"),
    row: toNumber(value.row, "row"),
    isLinked: typeof value.isLinked === "boolean" ? value.isLinked : value.column === value.row
  };
}

/** 从包装对象中提取真实值，例如 { padding: {...} } 或 { shadow: {...} }。 */
function unwrapValue(value: unknown, keys: string[]): unknown {
  if (!isRecord(value)) {
    return value;
  }
  for (const key of keys) {
    if (value[key] !== undefined) {
      return value[key];
    }
  }
  return value;
}

/** 将单值或三端对象归一化为响应式输入。 */
function normalizeResponsive<T>(
  value: unknown,
  context: SettingApplyContext,
  normalize: (input: unknown) => T,
  wrapperKeys: string[] = []
): ResponsiveValue<T> {
  const unwrapped = unwrapValue(value, wrapperKeys);
  if (isRecord(unwrapped) && (unwrapped.desktop !== undefined || unwrapped.tablet !== undefined || unwrapped.mobile !== undefined)) {
    const output: ResponsiveValue<T> = {};
    for (const device of ["desktop", "tablet", "mobile"] as const) {
      if (unwrapped[device] !== undefined) {
        output[device] = normalize(unwrapped[device]);
      }
    }
    return output;
  }
  return { [resolveDevice(context)]: normalize(unwrapped) };
}

/** 将 margin/padding 类输入归一化为带 scope 的三端对象。 */
function normalizeScopedEdges(value: unknown, context: SettingApplyContext, wrapperKeys: string[]) {
  const unwrapped = unwrapValue(value, wrapperKeys);
  if (isRecord(unwrapped) && unwrapped.scope !== undefined) {
    return {
      scope: String(unwrapped.scope) as SettingScope,
      ...normalizeResponsive(unwrapped, context, normalizeEdge)
    };
  }
  return {
    scope: resolveScope(context),
    ...normalizeResponsive(unwrapped, context, normalizeEdge)
  };
}

/** 将边框输入归一化为带 scope、样式、颜色和三端宽度的对象。 */
function normalizeScopedBorder(value: unknown, context: SettingApplyContext) {
  if (isRecord(value) && value.width !== undefined) {
    return {
      scope: typeof value.scope === "string" ? value.scope as SettingScope : resolveScope(context),
      ...(value.border !== undefined ? { border: String(value.border) } : {}),
      ...(value.color !== undefined ? { color: String(value.color) } : {}),
      ...normalizeResponsive(value.width, context, normalizeEdge)
    };
  }

  const edges = normalizeScopedEdges(value, context, []);
  return {
    ...edges,
    ...(isRecord(value) && value.border !== undefined ? { border: String(value.border) } : {}),
    ...(isRecord(value) && value.color !== undefined ? { color: String(value.color) } : {})
  };
}

/** 将阴影输入归一化为带 scope 的 shadow 对象。 */
function normalizeScopedShadow(value: unknown, context: SettingApplyContext) {
  const unwrapped = unwrapValue(value, ["shadow", "boxShadow", "box_shadow"]);
  if (!isRecord(unwrapped)) {
    throw new Error("Expected a shadow object.");
  }
  return {
    scope: isRecord(value) && typeof value.scope === "string" ? value.scope as SettingScope : resolveScope(context),
    shadow: {
      horizontal: toNumber(unwrapped.horizontal, "horizontal"),
      vertical: toNumber(unwrapped.vertical, "vertical"),
      blur: toNumber(unwrapped.blur, "blur"),
      spread: toNumber(unwrapped.spread, "spread"),
      color: String(unwrapped.color)
    } satisfies ShadowValue
  };
}

/** 将普通字符串输入转换为 string。 */
function normalizeString(value: unknown): string {
  return String(unwrapValue(value, ["value", "color", "text"]));
}

/** 将普通数字输入转换为 number。 */
function normalizeNumber(value: unknown): number {
  return toNumber(unwrapValue(value, ["value", "size"]), "value");
}

/** 将按钮阴影输入归一化为按钮 helper 需要的对象。 */
function normalizeButtonShadow(value: unknown) {
  const scoped = normalizeScopedShadow(value, { element: { id: "", elType: "widget", settings: {}, elements: [] } });
  return { shadow: scoped.shadow };
}

/** 将按钮边框输入归一化为按钮 helper 需要的对象。 */
function normalizeButtonBorder(value: unknown) {
  if (!isRecord(value)) {
    throw new Error("Expected a button border object.");
  }
  return {
    border: String(value.border),
    width: normalizeEdge(value.width)
  };
}

/** 将图片边框输入归一化为图片 helper 需要的对象。 */
function normalizeImageBorder(value: unknown) {
  if (!isRecord(value)) {
    throw new Error("Expected an image border object.");
  }
  return {
    border: String(value.border),
    width: normalizeEdge(value.width),
    color: String(value.color)
  };
}

/** 将 container width 输入归一化为 layout helper 需要的对象。 */
function normalizeContainerWidth(value: unknown) {
  if (!isRecord(value)) {
    throw new Error("Expected a container width object.");
  }
  return {
    ...(value.contentWidth !== undefined ? { contentWidth: String(value.contentWidth) } : {}),
    ...(value.width !== undefined ? { width: normalizeResponsive(value.width, { element: { id: "", elType: "container", settings: {}, elements: [] } }, normalizeSize) } : {}),
    ...(value.boxedWidth !== undefined ? { boxedWidth: normalizeResponsive(value.boxedWidth, { element: { id: "", elType: "container", settings: {}, elements: [] } }, normalizeSize) } : {})
  };
}

const HELPER_DEFINITIONS: SettingHelperDefinition[] = [
  { name: "set_background", description: "[common] Normal-state background color. Value: string or { color }.", apply: (s, v) => set_background(s, normalizeString(v)) },
  { name: "set_background_hover", description: "[common] Hover-state background color. Value: string or { color }.", apply: (s, v) => set_background_hover(s, normalizeString(v)) },
  { name: "set_border", description: "[common] Border. Value: { scope?, border?, color?, width? } or { scope?, desktop?, tablet?, mobile? }.", apply: (s, v, c) => set_border(s, normalizeScopedBorder(v, c) as never) },
  { name: "set_border_hover", description: "[common] Hover border. Value: { scope?, border?, color?, width? } or { scope?, desktop?, tablet?, mobile? }.", apply: (s, v, c) => set_border_hover(s, normalizeScopedBorder(v, c) as never) },
  { name: "set_border_radius", description: "[common] Border radius. Value: edge object or { scope?, desktop?, tablet?, mobile? }.", apply: (s, v, c) => set_border_radius(s, normalizeScopedEdges(v, c, ["radius", "borderRadius", "border_radius"]) as never) },
  { name: "set_border_radius_hover", description: "[common] Hover border radius. Value: edge object or { scope?, desktop?, tablet?, mobile? }.", apply: (s, v, c) => set_border_radius_hover(s, normalizeScopedEdges(v, c, ["radius", "borderRadius", "border_radius"]) as never) },
  { name: "set_box_shadow", description: "[common] Box shadow. Value: shadow object or { scope?, shadow }.", apply: (s, v, c) => set_box_shadow(s, normalizeScopedShadow(v, c)) },
  { name: "set_box_shadow_hover", description: "[common] Hover box shadow. Value: shadow object or { scope?, shadow }.", apply: (s, v, c) => set_box_shadow_hover(s, normalizeScopedShadow(v, c)) },
  { name: "set_margin", description: "[common] Margin. Value: edge object, { margin }, or { scope?, desktop?, tablet?, mobile? }.", apply: (s, v, c) => set_margin(s, normalizeScopedEdges(v, c, ["margin"]) as never) },
  { name: "set_padding", description: "[common] Padding. Value: edge object, { padding }, or { scope?, desktop?, tablet?, mobile? }.", apply: (s, v, c) => set_padding(s, normalizeScopedEdges(v, c, ["padding"]) as never) },
  { name: "set_typography", description: "[common] Typography. Value: typography object.", apply: (s, v) => set_typography(s, v as never) },
  { name: "set_text_color", description: "[text] Text color. Value: string or { color }.", apply: (s, v) => set_text_color(s, normalizeString(v)) },
  { name: "set_z_index", description: "[common] Z-index. Value: number or { value }.", apply: (s, v) => set_z_index(s, normalizeNumber(v)) },
  { name: "set_element_id", description: "[common] CSS ID. Value: string or { value }.", apply: (s, v) => set_element_id(s, normalizeString(v)) },
  { name: "set_css_classes", description: "[common] CSS classes. Value: string or { value }.", apply: (s, v) => set_css_classes(s, normalizeString(v)) },
  { name: "set_container_type", description: "[container] Layout type. Value: \"flexbox\" | \"grid\" or { type }.", apply: (s, v) => set_container_type(s, typeof v === "string" ? v as never : v as never) },
  { name: "set_container_width", description: "[container] Width settings. Value: { contentWidth?, width?, boxedWidth? }.", apply: (s, v) => set_container_width(s, normalizeContainerWidth(v) as never) },
  { name: "set_min_height", description: "[container] Minimum height. Value: number, size object, or responsive object.", apply: (s, v, c) => set_min_height(s, typeof v === "number" ? v : normalizeResponsive(v, c, normalizeSize) as never) },
  { name: "set_flex_direction", description: "[container] Flex direction. Value: string or responsive object.", apply: (s, v, c) => set_flex_direction(s, isRecord(v) ? normalizeResponsive(v, c, String) as never : String(v) as never) },
  { name: "set_flex_justify_content", description: "[container] Flex justify-content. Value: string or responsive object.", apply: (s, v, c) => set_flex_justify_content(s, isRecord(v) ? normalizeResponsive(v, c, String) as never : String(v) as never) },
  { name: "set_flex_align_items", description: "[container] Flex align-items. Value: string or responsive object.", apply: (s, v, c) => set_flex_align_items(s, isRecord(v) ? normalizeResponsive(v, c, String) as never : String(v) as never) },
  { name: "set_flex_gap", description: "[container] Flex gap. Value: number, gap object, or responsive object.", apply: (s, v, c) => set_flex_gap(s, typeof v === "number" ? v : normalizeResponsive(v, c, normalizeGap) as never) },
  { name: "set_flex_wrap", description: "[container] Flex wrap. Value: string or responsive object.", apply: (s, v, c) => set_flex_wrap(s, isRecord(v) ? normalizeResponsive(v, c, String) as never : String(v) as never) },
  { name: "set_grid_columns", description: "[container] Grid columns. Value: number, size object, or responsive object.", apply: (s, v, c) => set_grid_columns(s, typeof v === "number" ? v : normalizeResponsive(v, c, normalizeSize) as never) },
  { name: "set_grid_rows", description: "[container] Grid rows. Value: number, size object, or responsive object.", apply: (s, v, c) => set_grid_rows(s, typeof v === "number" ? v : normalizeResponsive(v, c, normalizeSize) as never) },
  { name: "set_grid_gap", description: "[container] Grid gap. Value: number, gap object, or responsive object.", apply: (s, v, c) => set_grid_gap(s, typeof v === "number" ? v : normalizeResponsive(v, c, normalizeGap) as never) },
  { name: "set_grid_auto_flow", description: "[container] Grid auto-flow. Value: string or responsive object.", apply: (s, v, c) => set_grid_auto_flow(s, isRecord(v) ? normalizeResponsive(v, c, String) as never : String(v) as never) },
  { name: "set_grid_justify_items", description: "[container] Grid justify-items. Value: string or responsive object.", apply: (s, v, c) => set_grid_justify_items(s, isRecord(v) ? normalizeResponsive(v, c, String) as never : String(v) as never) },
  { name: "set_grid_align_items", description: "[container] Grid align-items. Value: string or responsive object.", apply: (s, v, c) => set_grid_align_items(s, isRecord(v) ? normalizeResponsive(v, c, String) as never : String(v) as never) },
  { name: "set_heading_align", description: "[heading] Text alignment. Value: string.", apply: (s, v) => set_heading_align(s, normalizeString(v) as never) },
  { name: "set_heading_title_color", description: "[heading] Title color. Value: string or { color }.", apply: (s, v) => set_heading_title_color(s, normalizeString(v)) },
  { name: "set_heading_title_hover_color", description: "[heading] Hover title color. Value: string or { color }.", apply: (s, v) => set_heading_title_hover_color(s, normalizeString(v)) },
  { name: "set_button_align", description: "[button] Button alignment. Value: string.", apply: (s, v) => set_button_align(s, normalizeString(v) as never) },
  { name: "set_button_text_color", description: "[button] Text color. Value: string or { color }.", apply: (s, v) => set_button_text_color(s, normalizeString(v)) },
  { name: "set_button_text_hover_color", description: "[button] Hover text color. Value: string or { color }.", apply: (s, v) => set_button_text_hover_color(s, normalizeString(v)) },
  { name: "set_button_background_color", description: "[button] Background color. Value: string or { color }.", apply: (s, v) => set_button_background_color(s, normalizeString(v)) },
  { name: "set_button_background_hover_color", description: "[button] Hover background color. Value: string or { color }.", apply: (s, v) => set_button_background_hover_color(s, normalizeString(v)) },
  { name: "set_button_border_color", description: "[button] Border color. Value: string or { color }.", apply: (s, v) => set_button_border_color(s, normalizeString(v)) },
  { name: "set_button_hover_border_color", description: "[button] Hover border color. Value: string or { color }.", apply: (s, v) => set_button_hover_border_color(s, normalizeString(v)) },
  { name: "set_button_border", description: "[button] Border. Value: { border, width }.", apply: (s, v) => set_button_border(s, normalizeButtonBorder(v) as never) },
  { name: "set_button_box_shadow", description: "[button] Box shadow. Value: shadow object or { shadow }.", apply: (s, v) => set_button_box_shadow(s, normalizeButtonShadow(v)) },
  { name: "set_button_text_padding", description: "[button] Text padding. Value: edge object, { padding }, or responsive object.", apply: (s, v, c) => set_button_text_padding(s, normalizeResponsive(v, c, normalizeEdge, ["padding"]) as never) },
  { name: "set_image_width", description: "[image] Width. Value: number, size object, or responsive object.", apply: (s, v, c) => set_image_width(s, typeof v === "number" ? v : normalizeResponsive(v, c, normalizeSize) as never) },
  { name: "set_image_space", description: "[image] Space. Value: number, size object, or responsive object.", apply: (s, v, c) => set_image_space(s, typeof v === "number" ? v : normalizeResponsive(v, c, normalizeSize) as never) },
  { name: "set_image_height", description: "[image] Height. Value: number, size object, or responsive object.", apply: (s, v, c) => set_image_height(s, typeof v === "number" ? v : normalizeResponsive(v, c, normalizeSize) as never) },
  { name: "set_image_object_fit", description: "[image] Object fit. Value: string or responsive object.", apply: (s, v, c) => set_image_object_fit(s, isRecord(v) ? normalizeResponsive(v, c, String) as never : String(v) as never) },
  { name: "set_image_object_position", description: "[image] Object position. Value: string or responsive object.", apply: (s, v, c) => set_image_object_position(s, isRecord(v) ? normalizeResponsive(v, c, String) as never : String(v) as never) },
  { name: "set_image_border", description: "[image] Border. Value: { border, width, color }.", apply: (s, v) => set_image_border(s, normalizeImageBorder(v) as never) },
  { name: "set_image_border_radius", description: "[image] Border radius. Value: number, edge object, or responsive object.", apply: (s, v, c) => set_image_border_radius(s, typeof v === "number" ? v : normalizeResponsive(v, c, normalizeEdge) as never) }
];

export const SETTING_HELPERS: ReadonlyMap<SettingHelperName, SettingHelperDefinition> = new Map(
  HELPER_DEFINITIONS.map((helper) => [helper.name, helper])
);

/** 判断 helper 名称是否已注册。 */
export function isSettingHelperName(value: string): value is SettingHelperName {
  return SETTING_HELPERS.has(value as SettingHelperName);
}

/** 返回所有 helper 的名称和说明。 */
export function listSettingHelpers(): Array<{ name: SettingHelperName; description: string }> {
  return HELPER_DEFINITIONS.map(({ name, description }) => ({ name, description }));
}

/** 使用统一 value 契约调用 settings helper。 */
export function applySettingHelper(
  settings: Record<string, unknown>,
  helperName: SettingHelperName,
  value: unknown,
  context: SettingApplyContext
): void {
  const helper = SETTING_HELPERS.get(helperName);
  if (!helper) {
    throw new Error(`Unknown setting helper: "${helperName}". Use "helpers" tool to see available helpers.`);
  }
  helper.apply(settings, parseSettingValue(value), context);
}
