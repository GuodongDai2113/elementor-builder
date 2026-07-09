/** 设置元素 z-index。 */
export function set_z_index(settings: Record<string, unknown>, value: number): void {
  settings._z_index = value;
}

/** 设置元素 CSS ID。 */
export function set_element_id(settings: Record<string, unknown>, value: string): void {
  settings._element_id = value;
}

/** 设置元素 CSS classes。 */
export function set_css_classes(settings: Record<string, unknown>, value: string): void {
  settings._css_classes = value;
}

export const BASE_SETTING_HELPERS = [
  "set_z_index",
  "set_element_id",
  "set_css_classes"
] as const;
