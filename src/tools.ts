import { z } from "zod";
import type { ElementObject } from "./types.js";
import { PageManager } from "./page.js";
import { createContainer } from "./elements/container.js";
import { createHeading } from "./elements/heading.js";
import { createText } from "./elements/text.js";
import { createButton } from "./elements/button.js";
import { createImage } from "./elements/image.js";
import { applySettingHelper, isSettingHelperName, listSettingHelpers, type SettingScope } from "./settings/registry.js";
import { helperAllowed } from "./elements/boundary.js";

const pageIdField = { pageId: z.string().min(1).describe("Page ID.") };
const targetField = { target: z.string().min(1).describe("Element ID or alias.") };

export interface Tool {
  name: string;
  description: string;
  inputSchema: Record<string, z.ZodTypeAny>;
  outputSchema?: Record<string, z.ZodTypeAny>;
  handler: (input: Record<string, unknown>, pm: PageManager) => Promise<unknown>;
}

function ok(data: unknown) {
  return data;
}

/** 在 Elementor 树中按 ID 查找元素。 */
function findElementInTree(tree: ElementObject[], elementId: string): ElementObject | null {
  for (const element of tree) {
    if (element.id === elementId) {
      return element;
    }
    const found = findElementInTree(element.elements ?? [], elementId);
    if (found) {
      return found;
    }
  }
  return null;
}

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
    outputSchema: { pages: z.array(z.object({ pageId: z.string(), createdAt: z.string(), updatedAt: z.string() })) },
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
    name: "add_layout",
    description: "Add a layout container. If parent is omitted, it is a top-level container; if parent is provided, it becomes an inner container.",
    inputSchema: {
      ...pageIdField,
      parent: z.string().optional().describe("Parent container ID or alias. Omit for a top-level container."),
      alias: z.string().optional().describe("Optional alias for the new element."),
      position: z.number().int().optional().describe("Insert position (0-based)."),
      containerType: z.enum(["flexbox", "grid"]).optional().describe("Container layout type. Default: flexbox.")
    },
    handler: async (input, pm) => {
      const id = await pm.insertElement(
        input.pageId as string,
        createContainer({ containerType: input.containerType as "flexbox" | "grid" | undefined }),
        input.parent as string | undefined,
        input.position as number | undefined,
        input.alias as string | undefined
      );
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

// ─── Setting Tools ───────────────────────────────────────────────────────────

const settingTools: Tool[] = [
  {
    name: "edit_style",
    description: "Edit an element style by applying a named setting helper. Use 'helpers' tool to list all available helpers and their descriptions.",
    inputSchema: {
      ...pageIdField, ...targetField,
      helper: z.string().describe("Setting helper name (e.g. set_typography, set_background)."),
      value: z.unknown().describe("Unified setting value. Pass strings/numbers directly, or pass objects directly; JSON strings are still accepted for compatibility."),
      scope: z.enum(["layout", "widget"]).optional().describe("Optional write scope. Defaults to layout for containers and widget for widgets."),
      device: z.enum(["desktop", "tablet", "mobile"]).optional().describe("Optional responsive device when value is a single responsive value. Defaults to desktop.")
    },
    handler: async (input, pm) => {
      const pageId = input.pageId as string;
      const target = input.target as string;
      const helperName = input.helper as string;

      if (!isSettingHelperName(helperName)) {
        throw new Error(`Unknown setting helper: "${helperName}". Use "helpers" tool to see available helpers.`);
      }

      const page = await pm.get(pageId);
      const elementId = page.aliases[target] ?? target;
      const element = findElementInTree(page.tree, elementId);
      if (!element) throw new Error(`Element not found: ${target}`);
      if (!helperAllowed(element, helperName)) {
        throw new Error(`Helper ${helperName} is not allowed for ${element.elType}${element.widgetType ? `/${element.widgetType}` : ""}`);
      }

      const temp: Record<string, unknown> = {};
      applySettingHelper(temp, helperName, input.value, {
        element,
        scope: input.scope as SettingScope | undefined,
        device: input.device as "desktop" | "tablet" | "mobile" | undefined
      });
      await pm.patchSettings(pageId, elementId, temp);
      return ok({ pageId, elementId, helper: helperName, updated: true });
    }
  },
  {
    name: "helpers",
    description: "List all available setting helpers with descriptions.",
    inputSchema: {},
    outputSchema: { helpers: z.array(z.object({ name: z.string(), description: z.string() })) },
    handler: async () => {
      return ok({ helpers: listSettingHelpers() });
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
    outputSchema: {
      pageId: z.string(),
      valid: z.boolean(),
      errors: z.array(z.object({ path: z.string(), message: z.string() }))
    },
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
  outputSchema: { ok: z.boolean(), service: z.string(), version: z.string() },
  handler: async () => ok({ ok: true, service: "elementor-builder-mcp", version: "1.0.0" })
};

// ─── Export ──────────────────────────────────────────────────────────────────

export const ALL_TOOLS: Tool[] = [
  healthTool,
  ...pageTools,
  ...elementAddTools,
  ...structureTools,
  ...contentTools,
  ...settingTools,
  ...treeTools
];

export const TOOL_MAP: Record<string, Tool> = {};
for (const tool of ALL_TOOLS) {
  TOOL_MAP[tool.name] = tool;
}
