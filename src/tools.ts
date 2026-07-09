import { z } from "zod";
import type { ElementObject, SettingHelperName } from "./types.js";
import { PageManager } from "./page.js";
import { createContainer } from "./elements/container.js";
import { createHeading } from "./elements/heading.js";
import { createText } from "./elements/text.js";
import { createButton } from "./elements/button.js";
import { createImage } from "./elements/image.js";

import { set_background, set_background_hover } from "./settings/background.js";
import { set_border, set_border_hover, set_border_radius, set_border_radius_hover, set_box_shadow, set_box_shadow_hover } from "./settings/border.js";
import { set_container_type, set_container_width, set_min_height, set_flex_direction, set_flex_justify_content, set_flex_align_items, set_flex_gap, set_flex_wrap, set_grid_columns, set_grid_rows, set_grid_gap, set_grid_auto_flow, set_grid_justify_items, set_grid_align_items } from "./settings/layout.js";
import { set_typography } from "./settings/typography.js";
import { set_margin } from "./settings/margin.js";
import { set_padding } from "./settings/padding.js";
import { set_text_color } from "./settings/text.js";
import { set_heading_align, set_heading_title_color, set_heading_title_hover_color } from "./settings/heading.js";
import { set_button_align, set_button_text_color, set_button_hover_color, set_button_background_color, set_button_background_hover_color, set_button_border_color, set_button_hover_border_color, set_button_border, set_button_box_shadow } from "./settings/button.js";
import { set_image_width, set_image_space, set_image_height, set_image_object_fit, set_image_object_position, set_image_border, set_image_border_radius } from "./settings/image.js";

const pageIdField = { pageId: z.string().min(1).describe("Page ID.") };
const targetField = { target: z.string().min(1).describe("Element ID or alias.") };

export interface Tool {
  name: string;
  description: string;
  inputSchema: Record<string, z.ZodTypeAny>;
  handler: (input: Record<string, unknown>, pm: PageManager) => Promise<unknown>;
}

function ok(data: unknown) {
  return data;
}

const SETTING_HELPERS: Record<string, (settings: Record<string, unknown>, value: unknown) => void> = {
  set_background: (s, v) => set_background(s, v as any),
  set_background_hover: (s, v) => set_background_hover(s, v as any),
  set_border: (s, v) => set_border(s, v as any),
  set_border_hover: (s, v) => set_border_hover(s, v as any),
  set_border_radius: (s, v) => set_border_radius(s, v as any),
  set_border_radius_hover: (s, v) => set_border_radius_hover(s, v as any),
  set_box_shadow: (s, v) => set_box_shadow(s, v as any),
  set_box_shadow_hover: (s, v) => set_box_shadow_hover(s, v as any),
  set_margin: (s, v) => set_margin(s, v as any),
  set_padding: (s, v) => set_padding(s, v as any),
  set_typography: (s, v) => set_typography(s, v as any),
  set_text_color: (s, v) => set_text_color(s, v as any),
  set_container_type: (s, v) => set_container_type(s, v as any),
  set_container_width: (s, v) => set_container_width(s, v as any),
  set_min_height: (s, v) => set_min_height(s, v as any),
  set_flex_direction: (s, v) => set_flex_direction(s, v as any),
  set_flex_justify_content: (s, v) => set_flex_justify_content(s, v as any),
  set_flex_align_items: (s, v) => set_flex_align_items(s, v as any),
  set_flex_gap: (s, v) => set_flex_gap(s, v as any),
  set_flex_wrap: (s, v) => set_flex_wrap(s, v as any),
  set_grid_columns: (s, v) => set_grid_columns(s, v as any),
  set_grid_rows: (s, v) => set_grid_rows(s, v as any),
  set_grid_gap: (s, v) => set_grid_gap(s, v as any),
  set_grid_auto_flow: (s, v) => set_grid_auto_flow(s, v as any),
  set_grid_justify_items: (s, v) => set_grid_justify_items(s, v as any),
  set_grid_align_items: (s, v) => set_grid_align_items(s, v as any),
  set_heading_align: (s, v) => set_heading_align(s, v as any),
  set_heading_title_color: (s, v) => set_heading_title_color(s, v as any),
  set_heading_title_hover_color: (s, v) => set_heading_title_hover_color(s, v as any),
  set_button_align: (s, v) => set_button_align(s, v as any),
  set_button_text_color: (s, v) => set_button_text_color(s, v as any),
  set_button_hover_color: (s, v) => set_button_hover_color(s, v as any),
  set_button_background_color: (s, v) => set_button_background_color(s, v as any),
  set_button_background_hover_color: (s, v) => set_button_background_hover_color(s, v as any),
  set_button_border_color: (s, v) => set_button_border_color(s, v as any),
  set_button_hover_border_color: (s, v) => set_button_hover_border_color(s, v as any),
  set_button_border: (s, v) => set_button_border(s, v as any),
  set_button_box_shadow: (s, v) => set_button_box_shadow(s, v as any),
  set_image_width: (s, v) => set_image_width(s, v as any),
  set_image_space: (s, v) => set_image_space(s, v as any),
  set_image_height: (s, v) => set_image_height(s, v as any),
  set_image_object_fit: (s, v) => set_image_object_fit(s, v as any),
  set_image_object_position: (s, v) => set_image_object_position(s, v as any),
  set_image_border: (s, v) => set_image_border(s, v as any),
  set_image_border_radius: (s, v) => set_image_border_radius(s, v as any)
};

const HELPER_METADATA: Record<string, string> = {
  set_background: "Sets background_background + background_color",
  set_background_hover: "Sets background_hover_background + background_hover_color",
  set_border: "Sets border_border + border_color + border_width (responsive)",
  set_border_hover: "Sets border hover state (border_hover_border, etc.)",
  set_border_radius: "Sets border_radius (responsive)",
  set_border_radius_hover: "Sets border_radius_hover (responsive)",
  set_box_shadow: "Sets box_shadow_box_shadow_type + box_shadow_box_shadow",
  set_box_shadow_hover: "Sets box_shadow hover state",
  set_margin: "Sets margin / _margin (responsive, scope: layout/widget)",
  set_padding: "Sets padding / _padding (responsive, scope: layout/widget)",
  set_typography: "Sets typography_typography=custom + font_size, font_weight, line_height, etc. (responsive)",
  set_text_color: "Sets text_color",
  set_container_type: "Sets container_type (flex/grid)",
  set_container_width: "Sets content_width, width, boxed_width",
  set_min_height: "Sets min_height (responsive)",
  set_flex_direction: "Sets flex_direction (responsive)",
  set_flex_justify_content: "Sets flex_justify_content (responsive)",
  set_flex_align_items: "Sets flex_align_items (responsive)",
  set_flex_gap: "Sets flex_gap (responsive)",
  set_flex_wrap: "Sets flex_wrap (responsive)",
  set_grid_columns: "Sets grid_columns_grid (responsive)",
  set_grid_rows: "Sets grid_rows_grid (responsive)",
  set_grid_gap: "Sets grid_gaps (responsive)",
  set_grid_auto_flow: "Sets grid_auto_flow (responsive)",
  set_grid_justify_items: "Sets grid_justify_items (responsive)",
  set_grid_align_items: "Sets grid_align_items (responsive)",
  set_heading_align: "Sets align",
  set_heading_title_color: "Sets title_color",
  set_heading_title_hover_color: "Sets title_hover_color",
  set_button_align: "Sets align",
  set_button_text_color: "Sets button_text_color",
  set_button_hover_color: "Sets hover_color",
  set_button_background_color: "Sets background_color",
  set_button_background_hover_color: "Sets button_background_hover_color",
  set_button_border_color: "Sets border_color",
  set_button_hover_border_color: "Sets button_hover_border_color",
  set_button_border: "Sets border_border + border_width",
  set_button_box_shadow: "Sets button_box_shadow_box_shadow_type + button_box_shadow_box_shadow",
  set_image_width: "Sets width (responsive)",
  set_image_space: "Sets space (responsive)",
  set_image_height: "Sets height (responsive)",
  set_image_object_fit: "Sets object-fit (responsive)",
  set_image_object_position: "Sets object-position (responsive)",
  set_image_border: "Sets image_border_border + image_border_width + image_border_color",
  set_image_border_radius: "Sets image_border_radius (responsive)"
};

// ─── Page Tools ──────────────────────────────────────────────────────────────

const pageTools: Tool[] = [
  {
    name: "page_create",
    description: "Create an empty builder page (draft). Returns the page ID.",
    inputSchema: { pageId: z.string().min(1).describe("Unique page identifier.") },
    handler: async (input, pm) => ok({ pageId: await pm.create(input.pageId as string) })
  },
  {
    name: "page_list",
    description: "List all saved builder pages.",
    inputSchema: {},
    handler: async (_input, pm) => ok({ pages: await pm.list() })
  },
  {
    name: "page_get",
    description: "Get full page data (tree, aliases, history).",
    inputSchema: pageIdField,
    handler: async (input, pm) => ok(await pm.get(input.pageId as string))
  },
  {
    name: "page_clear",
    description: "Delete a builder page.",
    inputSchema: pageIdField,
    handler: async (input, pm) => { await pm.clear(input.pageId as string); return ok({ cleared: true }); }
  }
];

// ─── Element Add Tools ───────────────────────────────────────────────────────

const elementAddTools: Tool[] = [
  {
    name: "add_section",
    description: "Add a top-level section (non-inner container).",
    inputSchema: {
      ...pageIdField,
      alias: z.string().optional().describe("Optional alias for the new element."),
      position: z.number().int().optional().describe("Insert position (0-based).")
    },
    handler: async (input, pm) => {
      const id = await pm.insertElement(input.pageId as string, createContainer(), undefined, input.position as number | undefined, input.alias as string | undefined);
      return ok({ pageId: input.pageId, elementId: id });
    }
  },
  {
    name: "add_container",
    description: "Add a nested container inside an existing parent element.",
    inputSchema: {
      ...pageIdField,
      parent: z.string().describe("Parent ID or alias."),
      alias: z.string().optional().describe("Optional alias."),
      position: z.number().int().optional().describe("Insert position.")
    },
    handler: async (input, pm) => {
      const id = await pm.insertElement(input.pageId as string, createContainer(), input.parent as string, input.position as number | undefined, input.alias as string | undefined);
      return ok({ pageId: input.pageId, elementId: id });
    }
  },
  {
    name: "add_heading",
    description: "Add a heading widget.",
    inputSchema: {
      ...pageIdField,
      parent: z.string().optional().describe("Parent ID or alias."),
      alias: z.string().optional().describe("Optional alias."),
      position: z.number().int().optional().describe("Insert position."),
      title: z.string().optional().describe("Heading text."),
      tag: z.string().optional().describe("HTML tag (h1-h6, span, div, p). Default: h2.")
    },
    handler: async (input, pm) => {
      const el = createHeading({ title: input.title as string | undefined, tag: input.tag as string | undefined });
      const id = await pm.insertElement(input.pageId as string, el, input.parent as string | undefined, input.position as number | undefined, input.alias as string | undefined);
      return ok({ pageId: input.pageId, elementId: id });
    }
  },
  {
    name: "add_text",
    description: "Add a text editor widget with HTML content.",
    inputSchema: {
      ...pageIdField,
      parent: z.string().optional().describe("Parent ID or alias."),
      alias: z.string().optional().describe("Optional alias."),
      position: z.number().int().optional().describe("Insert position."),
      content: z.string().optional().describe("HTML content.")
    },
    handler: async (input, pm) => {
      const el = createText({ content: input.content as string | undefined });
      const id = await pm.insertElement(input.pageId as string, el, input.parent as string | undefined, input.position as number | undefined, input.alias as string | undefined);
      return ok({ pageId: input.pageId, elementId: id });
    }
  },
  {
    name: "add_button",
    description: "Add a button widget.",
    inputSchema: {
      ...pageIdField,
      parent: z.string().optional().describe("Parent ID or alias."),
      alias: z.string().optional().describe("Optional alias."),
      position: z.number().int().optional().describe("Insert position."),
      text: z.string().optional().describe("Button label."),
      url: z.string().optional().describe("Button link URL.")
    },
    handler: async (input, pm) => {
      const el = createButton({ text: input.text as string | undefined, url: input.url as string | undefined });
      const id = await pm.insertElement(input.pageId as string, el, input.parent as string | undefined, input.position as number | undefined, input.alias as string | undefined);
      return ok({ pageId: input.pageId, elementId: id });
    }
  },
  {
    name: "add_image",
    description: "Add an image widget.",
    inputSchema: {
      ...pageIdField,
      parent: z.string().optional().describe("Parent ID or alias."),
      alias: z.string().optional().describe("Optional alias."),
      position: z.number().int().optional().describe("Insert position."),
      image: z.unknown().optional().describe("Image object { id, url, alt, source }.")
    },
    handler: async (input, pm) => {
      const el = createImage({ image: input.image });
      const id = await pm.insertElement(input.pageId as string, el, input.parent as string | undefined, input.position as number | undefined, input.alias as string | undefined);
      return ok({ pageId: input.pageId, elementId: id });
    }
  }
];

// ─── Structure Tools ─────────────────────────────────────────────────────────

const structureTools: Tool[] = [
  {
    name: "remove_element",
    description: "Remove an element and its children.",
    inputSchema: { ...pageIdField, ...targetField },
    handler: async (input, pm) => {
      const removed = await pm.removeElement(input.pageId as string, input.target as string);
      return ok({ pageId: input.pageId, elementId: removed.id, removed: true });
    }
  },
  {
    name: "duplicate_element",
    description: "Duplicate an element after the original.",
    inputSchema: { ...pageIdField, ...targetField, alias: z.string().optional().describe("Alias for the new element.") },
    handler: async (input, pm) => {
      const newId = await pm.duplicateElement(input.pageId as string, input.target as string, input.alias as string | undefined);
      return ok({ pageId: input.pageId, elementId: newId });
    }
  },
  {
    name: "move_element",
    description: "Move an element to a new parent/position.",
    inputSchema: { ...pageIdField, ...targetField, parent: z.string().optional().describe("New parent."), position: z.number().int().optional().describe("Insert position.") },
    handler: async (input, pm) => {
      await pm.moveElement(input.pageId as string, input.target as string, input.parent as string | undefined, input.position as number | undefined);
      return ok({ pageId: input.pageId, moved: true });
    }
  },
  {
    name: "reorder_children",
    description: "Reorder direct children of a container.",
    inputSchema: { ...pageIdField, ...targetField, children: z.array(z.string()).describe("Ordered child IDs/aliases.") },
    handler: async (input, pm) => {
      await pm.reorderChildren(input.pageId as string, input.target as string, input.children as string[]);
      return ok({ pageId: input.pageId, reordered: true });
    }
  }
];

// ─── Content Tool ────────────────────────────────────────────────────────────

const contentTools: Tool[] = [
  {
    name: "edit_content",
    description: "Edit widget content fields (title, editor, text, image, html).",
    inputSchema: {
      ...pageIdField, ...targetField,
      widgetType: z.enum(["heading", "text", "button", "image", "html"]).describe("Widget type."),
      title: z.string().optional().describe("New heading title."),
      tag: z.string().optional().describe("New heading HTML tag."),
      content: z.string().optional().describe("Text/HTML content."),
      text: z.string().optional().describe("New button text."),
      url: z.string().optional().describe("New button URL."),
      image: z.unknown().optional().describe("New image object.")
    },
    handler: async (input, pm) => {
      const settings: Record<string, unknown> = {};
      switch (input.widgetType) {
        case "heading":
          if (input.title !== undefined) settings.title = input.title;
          if (input.tag !== undefined) settings.header_size = input.tag;
          break;
        case "text":
          if (input.content !== undefined) settings.editor = input.content;
          break;
        case "button":
          if (input.text !== undefined) settings.text = input.text;
          if (input.url !== undefined) settings.link = { url: input.url, is_external: false, nofollow: false };
          break;
        case "image":
          if (input.image !== undefined) settings.image = input.image;
          break;
        case "html":
          if (input.content !== undefined) settings.html = input.content;
          break;
      }
      const elementId = await pm.patchSettings(input.pageId as string, input.target as string, settings);
      return ok({ pageId: input.pageId, elementId, updated: true });
    }
  }
];

// ─── Style Tools ─────────────────────────────────────────────────────────────

const styleTools: Tool[] = [
  {
    name: "apply_style",
    description: "Apply a named setting helper to an element. The helper writes specific Elementor settings fields. Use 'helpers' tool to list all available helpers and their descriptions.",
    inputSchema: {
      ...pageIdField, ...targetField,
      helper: z.string().describe("Setting helper name (e.g. set_typography, set_background)."),
      value: z.unknown().describe("Input value for the helper. Structure varies by helper.")
    },
    handler: async (input, pm) => {
      const pageId = input.pageId as string;
      const target = input.target as string;
      const helperName = input.helper as string;

      const fn = SETTING_HELPERS[helperName];
      if (!fn) throw new Error(`Unknown setting helper: "${helperName}". Use "helpers" tool to see available helpers.`);

      const page = await pm.get(pageId);
      const elementId = page.aliases[target] ?? target;

      const temp: Record<string, unknown> = {};
      fn(temp, input.value);
      await pm.patchSettings(pageId, elementId, temp);
      return ok({ pageId, elementId, helper: helperName, updated: true });
    }
  },
  {
    name: "helpers",
    description: "List all available setting helpers with descriptions.",
    inputSchema: {},
    handler: async () => {
      const list = Object.entries(SETTING_HELPERS).map(([name]) => ({
        name,
        description: HELPER_METADATA[name] ?? ""
      }));
      return ok({ helpers: list });
    }
  }
];

// ─── Advanced Tool ───────────────────────────────────────────────────────────

const advancedTools: Tool[] = [
  {
    name: "edit_advanced",
    description: "Edit advanced fields (position, size, CSS, animation, or raw patch).",
    inputSchema: {
      ...pageIdField, ...targetField,
      category: z.enum(["position", "size", "css", "animation", "raw"]).describe("Advanced category."),
      position: z.string().optional().describe("CSS position (relative, absolute, fixed, sticky)."),
      zIndex: z.number().optional().describe("Z-index."),
      width: z.unknown().optional().describe("Width setting."),
      minWidth: z.unknown().optional().describe("Min-width."),
      maxWidth: z.unknown().optional().describe("Max-width."),
      height: z.unknown().optional().describe("Height setting."),
      minHeight: z.unknown().optional().describe("Min-height."),
      cssId: z.string().optional().describe("CSS ID (_element_id)."),
      cssClasses: z.string().optional().describe("CSS classes (_css_classes)."),
      entranceAnimation: z.string().optional().describe("Entrance animation name."),
      animationDuration: z.string().optional().describe("Animation duration (e.g. '0.5s')."),
      animationDelay: z.number().optional().describe("Animation delay (ms)."),
      settings: z.record(z.unknown()).optional().describe("Raw settings object (for raw category).")
    },
    handler: async (input, pm) => {
      const category = input.category as string;
      let settings: Record<string, unknown> = {};
      switch (category) {
        case "position":
          if (input.position !== undefined) settings._position = input.position;
          if (input.zIndex !== undefined) settings._z_index = input.zIndex;
          break;
        case "size":
          if (input.width !== undefined) settings.width = input.width;
          if (input.minWidth !== undefined) settings.min_width = input.minWidth;
          if (input.maxWidth !== undefined) settings.max_width = input.maxWidth;
          if (input.height !== undefined) settings.height = input.height;
          if (input.minHeight !== undefined) settings.min_height = input.minHeight;
          break;
        case "css":
          if (input.cssId !== undefined) settings._element_id = input.cssId;
          if (input.cssClasses !== undefined) settings._css_classes = input.cssClasses;
          break;
        case "animation":
          if (input.entranceAnimation !== undefined) settings._animation = input.entranceAnimation;
          if (input.animationDuration !== undefined) settings.animation_duration = input.animationDuration;
          if (input.animationDelay !== undefined) settings._animation_delay = input.animationDelay;
          break;
        case "raw":
          settings = { ...(input.settings as Record<string, unknown> ?? {}) };
          break;
      }
      const elementId = await pm.patchSettings(input.pageId as string, input.target as string, settings);
      return ok({ pageId: input.pageId, elementId, category, updated: true });
    }
  }
];

// ─── Tree Tools ──────────────────────────────────────────────────────────────

const treeTools: Tool[] = [
  {
    name: "import_tree",
    description: "Import a raw Elementor JSON tree into a page.",
    inputSchema: {
      ...pageIdField,
      tree: z.array(z.record(z.unknown())).describe("Raw Elementor element tree."),
      aliases: z.record(z.string()).optional().describe("Alias mapping.")
    },
    handler: async (input, pm) => {
      await pm.import(input.pageId as string, input.tree as ElementObject[], input.aliases as Record<string, string> | undefined);
      return ok({ pageId: input.pageId, imported: true });
    }
  },
  {
    name: "export_tree",
    description: "Export the current Elementor JSON tree.",
    inputSchema: pageIdField,
    handler: async (input, pm) => {
      const tree = await pm.exportTree(input.pageId as string);
      return ok({ pageId: input.pageId, tree });
    }
  },
  {
    name: "preview_structure",
    description: "Preview page tree structure with labels.",
    inputSchema: pageIdField,
    handler: async (input, pm) => {
      const structure = await pm.preview(input.pageId as string);
      return ok({ pageId: input.pageId, structure });
    }
  },
  {
    name: "validate_tree",
    description: "Validate page tree and aliases.",
    inputSchema: pageIdField,
    handler: async (input, pm) => {
      const result = await pm.validate(input.pageId as string);
      return ok({ pageId: input.pageId, ...result });
    }
  }
];

// ─── Health Tool ─────────────────────────────────────────────────────────────

const healthTool: Tool = {
  name: "health",
  description: "Service health check.",
  inputSchema: {},
  handler: async () => ok({ ok: true, service: "elementor-builder-mcp", version: "1.0.0" })
};

// ─── Export ──────────────────────────────────────────────────────────────────

export const ALL_TOOLS: Tool[] = [
  healthTool,
  ...pageTools,
  ...elementAddTools,
  ...structureTools,
  ...contentTools,
  ...styleTools,
  ...advancedTools,
  ...treeTools
];

export const TOOL_MAP: Record<string, Tool> = {};
for (const tool of ALL_TOOLS) {
  TOOL_MAP[tool.name] = tool;
}
