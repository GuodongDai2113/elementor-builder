import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { PageManager } from "../build/page.js";
import { TOOL_MAP } from "../build/tools.js";

async function withPage(fn) {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), "elementor-builder-"));
  const pm = new PageManager({ rootDir });
  try {
    await TOOL_MAP.page_create.handler({ pageId: "page" }, pm);
    await fn(pm);
  } finally {
    await rm(rootDir, { recursive: true, force: true });
  }
}

async function callTool(pm, name, input) {
  return TOOL_MAP[name].handler(input, pm);
}

function edge(value) {
  return {
    unit: "px",
    top: value,
    right: value,
    bottom: value,
    left: value
  };
}

test("removed tool names are not registered", () => {
  assert.equal(TOOL_MAP.add_section, undefined);
  assert.equal(TOOL_MAP.add_container, undefined);
  assert.equal(TOOL_MAP.apply_setting, undefined);
});

test("add_layout creates top-level and inner containers", async () => {
  await withPage(async (pm) => {
    const top = await callTool(pm, "add_layout", { pageId: "page", alias: "section", containerType: "grid" });
    const inner = await callTool(pm, "add_layout", { pageId: "page", parent: "section", alias: "inner" });

    const page = await pm.get("page");
    const topElement = page.tree[0];
    const innerElement = topElement.elements[0];

    assert.equal(topElement.id, top.elementId);
    assert.equal(topElement.elType, "container");
    assert.equal(topElement.isInner, undefined);
    assert.equal(topElement.settings.container_type, "grid");
    assert.equal(innerElement.id, inner.elementId);
    assert.equal(innerElement.elType, "container");
    assert.equal(innerElement.isInner, true);
    assert.equal(page.aliases.section, top.elementId);
    assert.equal(page.aliases.inner, inner.elementId);
  });
});

test("edit_style accepts object values and normalizes common container settings", async () => {
  await withPage(async (pm) => {
    await callTool(pm, "add_layout", { pageId: "page", alias: "card" });

    await callTool(pm, "edit_style", {
      pageId: "page",
      target: "card",
      helper: "set_box_shadow",
      value: { horizontal: 0, vertical: 4, blur: 20, spread: 0, color: "rgba(0,0,0,0.08)" }
    });
    await callTool(pm, "edit_style", {
      pageId: "page",
      target: "card",
      helper: "set_padding",
      value: { padding: { unit: "px", top: "40", right: "30", bottom: "40", left: "30" } }
    });

    const page = await pm.get("page");
    const element = page.tree[0];
    assert.equal(element.settings.box_shadow_box_shadow_type, "yes");
    assert.deepEqual(element.settings.box_shadow_box_shadow, {
      horizontal: 0,
      vertical: 4,
      blur: 20,
      spread: 0,
      color: "rgba(0,0,0,0.08)"
    });
    assert.deepEqual(element.settings.padding, {
      unit: "px",
      top: "40",
      right: "30",
      bottom: "40",
      left: "30",
      isLinked: false
    });
  });
});

test("edit_style rejects helpers that are not allowed for the target element", async () => {
  await withPage(async (pm) => {
    await callTool(pm, "add_layout", { pageId: "page", alias: "container" });

    await assert.rejects(
      () => callTool(pm, "edit_style", {
        pageId: "page",
        target: "container",
        helper: "set_button_text_color",
        value: "#ffffff"
      }),
      /Helper set_button_text_color is not allowed/
    );
  });
});

test("each element can be created and receive its allowed settings through one value contract", async (t) => {
  await withPage(async (pm) => {
    await t.test("container", async () => {
      await callTool(pm, "add_layout", { pageId: "page", alias: "container" });
      await callTool(pm, "edit_style", {
        pageId: "page",
        target: "container",
        helper: "set_container_type",
        value: "grid"
      });

      const page = await pm.get("page");
      const element = page.tree.find((item) => page.aliases.container === item.id);
      assert.equal(element.elType, "container");
      assert.equal(element.settings.container_type, "grid");
    });

    await t.test("heading", async () => {
      await callTool(pm, "add_heading", { pageId: "page", alias: "heading", title: "Title", tag: "h1" });
      await callTool(pm, "edit_style", {
        pageId: "page",
        target: "heading",
        helper: "set_heading_title_color",
        value: "#111111"
      });

      const page = await pm.get("page");
      const element = page.tree.find((item) => page.aliases.heading === item.id);
      assert.equal(element.widgetType, "heading");
      assert.equal(element.settings.title, "Title");
      assert.equal(element.settings.header_size, "h1");
      assert.equal(element.settings.title_color, "#111111");
    });

    await t.test("text", async () => {
      await callTool(pm, "add_text", { pageId: "page", alias: "text", content: "<p>Hello</p>" });
      await callTool(pm, "edit_style", {
        pageId: "page",
        target: "text",
        helper: "set_text_color",
        value: "#222222"
      });

      const page = await pm.get("page");
      const element = page.tree.find((item) => page.aliases.text === item.id);
      assert.equal(element.widgetType, "text-editor");
      assert.equal(element.settings.editor, "<p>Hello</p>");
      assert.equal(element.settings.text_color, "#222222");
    });

    await t.test("button", async () => {
      await callTool(pm, "add_button", { pageId: "page", alias: "button", text: "Buy", url: "/buy" });
      await callTool(pm, "edit_style", {
        pageId: "page",
        target: "button",
        helper: "set_button_text_padding",
        value: { padding: edge(12) }
      });

      const page = await pm.get("page");
      const element = page.tree.find((item) => page.aliases.button === item.id);
      assert.equal(element.widgetType, "button");
      assert.equal(element.settings.text, "Buy");
      assert.equal(element.settings.link.url, "/buy");
      assert.deepEqual(element.settings.text_padding, {
        unit: "px",
        top: "12",
        right: "12",
        bottom: "12",
        left: "12",
        isLinked: true
      });
    });

    await t.test("image", async () => {
      await callTool(pm, "add_image", { pageId: "page", alias: "image", image: { url: "/image.jpg", alt: "Image" } });
      await callTool(pm, "edit_style", {
        pageId: "page",
        target: "image",
        helper: "set_image_border_radius",
        value: edge(8)
      });

      const page = await pm.get("page");
      const element = page.tree.find((item) => page.aliases.image === item.id);
      assert.equal(element.widgetType, "image");
      assert.deepEqual(element.settings.image, { url: "/image.jpg", alt: "Image" });
      assert.deepEqual(element.settings.image_border_radius, {
        unit: "px",
        top: "8",
        right: "8",
        bottom: "8",
        left: "8",
        isLinked: true
      });
    });
  });
});
