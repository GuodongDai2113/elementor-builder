import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("element boundaries are exported from elements and the model folder is removed", async () => {
  await assert.rejects(() => access(path.join(repoRoot, "src", "model")));

  const { CONTAINER_BOUNDARY, createContainer } = await import("../build/elements/container.js");
  const { BUTTON_BOUNDARY, createButton } = await import("../build/elements/button.js");
  const { helperAllowed, boundaryForElement } = await import("../build/elements/boundary.js");

  assert.equal(boundaryForElement(createContainer()).element, "container");
  assert.equal(helperAllowed(createContainer(), "set_container_type"), true);
  assert.equal(helperAllowed(createContainer(), "set_button_text_color"), false);
  assert.equal(helperAllowed(createButton(), "set_button_text_padding"), true);
  assert.equal(CONTAINER_BOUNDARY.helpers.includes("set_z_index"), true);
  assert.equal(BUTTON_BOUNDARY.helpers.includes("set_button_text_padding"), true);
});
