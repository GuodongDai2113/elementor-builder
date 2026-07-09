import { randomBytes } from "node:crypto";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  ElementObject,
  BuilderPage,
  StructurePreviewNode,
  ValidationError
} from "./types.js";

function now(): string {
  return new Date().toISOString();
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export interface PageManagerOptions {
  rootDir?: string;
}

export class PageManager {
  private rootDir: string;
  private pagesDir: string;
  private writeLocks = new Map<string, Promise<void>>();

  constructor(options: PageManagerOptions = {}) {
    this.rootDir = options.rootDir ?? path.join(process.cwd(), ".elementor-builder");
    this.pagesDir = path.join(this.rootDir, "pages");
  }

  private async withLock<T>(pageId: string, fn: () => Promise<T>): Promise<T> {
    const prev = this.writeLocks.get(pageId) ?? Promise.resolve();
    const next = prev.then(fn, fn).catch(() => {}) as Promise<T>;
    this.writeLocks.set(pageId, next as Promise<void>);
    return next;
  }

  private pagePath(pageId: string): string {
    return path.join(this.pagesDir, `${pageId}.json`);
  }

  private async loadPage(pageId: string): Promise<BuilderPage> {
    const text = await readFile(this.pagePath(pageId), "utf8");
    return JSON.parse(text) as BuilderPage;
  }

  private async savePageFile(page: BuilderPage): Promise<void> {
    await mkdir(this.pagesDir, { recursive: true });
    await writeFile(this.pagePath(page.pageId), `${JSON.stringify(page, null, 2)}\n`, "utf8");
  }

  private findInTree(tree: ElementObject[], elementId: string): ElementObject | null {
    for (const element of tree) {
      if (element.id === elementId) return element;
      const found = this.findInTree(element.elements ?? [], elementId);
      if (found) return found;
    }
    return null;
  }

  private removeFromTree(tree: ElementObject[], elementId: string): { removed: ElementObject | null; index: number } {
    for (let i = 0; i < tree.length; i++) {
      if (tree[i]?.id === elementId) {
        const removed = tree.splice(i, 1)[0] ?? null;
        return { removed, index: i };
      }
      const result = this.removeFromTree(tree[i]?.elements ?? [], elementId);
      if (result.removed) return result;
    }
    return { removed: null, index: -1 };
  }

  private requireElement(page: BuilderPage, target: string): ElementObject {
    const id = page.aliases[target] ?? target;
    const element = this.findInTree(page.tree, id);
    if (!element) throw new Error(`Element not found: ${target}`);
    return element;
  }

  private resolveId(page: BuilderPage, target: string): string {
    return page.aliases[target] ?? target;
  }

  private async record(page: BuilderPage, operation: string, elementId?: string): Promise<void> {
    page.updatedAt = now();
    page.history.push({ operation, at: page.updatedAt, elementId });
    await this.savePageFile(page);
  }

  async create(pageId: string): Promise<string> {
    return this.withLock(pageId, async () => {
      const timestamp = now();
      const page: BuilderPage = {
        pageId,
        createdAt: timestamp,
        updatedAt: timestamp,
        tree: [],
        aliases: {},
        history: [{ operation: "create_page", at: timestamp }]
      };
      await this.savePageFile(page);
      return pageId;
    });
  }

  async list(): Promise<Array<Pick<BuilderPage, "pageId" | "createdAt" | "updatedAt">>> {
    await mkdir(this.pagesDir, { recursive: true });
    const files = (await readdir(this.pagesDir)).filter((f) => f.endsWith(".json"));
    const pages: Array<Pick<BuilderPage, "pageId" | "createdAt" | "updatedAt">> = [];
    for (const file of files) {
      const p = await this.loadPage(path.basename(file, ".json"));
      pages.push({ pageId: p.pageId, createdAt: p.createdAt, updatedAt: p.updatedAt });
    }
    return pages;
  }

  async get(pageId: string): Promise<BuilderPage> {
    return cloneJson(await this.loadPage(pageId));
  }

  async clear(pageId: string): Promise<void> {
    await rm(this.pagePath(pageId), { force: true });
  }

  async import(pageId: string, tree: ElementObject[], aliases?: Record<string, string>): Promise<void> {
    return this.withLock(pageId, async () => {
      const timestamp = now();
      const page: BuilderPage = {
        pageId,
        createdAt: timestamp,
        updatedAt: timestamp,
        tree: cloneJson(tree),
        aliases: { ...(aliases ?? {}) },
        history: [{ operation: "import_tree", at: timestamp }]
      };
      await this.savePageFile(page);
    });
  }

  async exportTree(pageId: string): Promise<ElementObject[]> {
    const page = await this.loadPage(pageId);
    return cloneJson(page.tree);
  }

  async getAliases(pageId: string): Promise<Record<string, string>> {
    const page = await this.loadPage(pageId);
    return { ...page.aliases };
  }

  async setAlias(pageId: string, alias: string, elementId: string): Promise<void> {
    return this.withLock(pageId, async () => {
      const page = await this.loadPage(pageId);
      page.aliases[alias] = elementId;
      await this.record(page, "set_alias", elementId);
    });
  }

  async insertElement(
    pageId: string,
    element: ElementObject,
    parent?: string,
    position?: number,
    alias?: string
  ): Promise<string> {
    return this.withLock(pageId, async () => {
      const page = await this.loadPage(pageId);
      const targetArr = parent ? this.requireElement(page, parent).elements : page.tree;
      if (parent) element.isInner = true;
      if (position != null && position >= 0 && position < targetArr.length) {
        targetArr.splice(position, 0, element);
      } else {
        targetArr.push(element);
      }
      if (alias) page.aliases[alias] = element.id;
      await this.record(page, "insert_element", element.id);
      return element.id;
    });
  }

  async removeElement(pageId: string, target: string): Promise<ElementObject> {
    return this.withLock(pageId, async () => {
      const page = await this.loadPage(pageId);
      const elementId = this.resolveId(page, target);
      const { removed } = this.removeFromTree(page.tree, elementId);
      if (!removed) throw new Error(`Element not found: ${target}`);
      this.removeAliases(page, removed);
      await this.record(page, "remove_element", elementId);
      return removed;
    });
  }

  async duplicateElement(pageId: string, target: string, alias?: string): Promise<string> {
    return this.withLock(pageId, async () => {
      const page = await this.loadPage(pageId);
      const elementId = this.resolveId(page, target);
      const newId = this.duplicateInTree(page.tree, elementId);
      if (!newId) throw new Error(`Element not found: ${target}`);
      if (alias) page.aliases[alias] = newId;
      await this.record(page, "duplicate_element", newId);
      return newId;
    });
  }

  async moveElement(pageId: string, target: string, parent?: string, position?: number): Promise<void> {
    return this.withLock(pageId, async () => {
      const page = await this.loadPage(pageId);
      const elementId = this.resolveId(page, target);
      const { removed } = this.removeFromTree(page.tree, elementId);
      if (!removed) throw new Error(`Element not found: ${target}`);
      const targetArr = parent ? this.requireElement(page, parent).elements : page.tree;
      if (position != null && position >= 0 && position < targetArr.length) {
        targetArr.splice(position, 0, removed);
      } else {
        targetArr.push(removed);
      }
      await this.record(page, "move_element", elementId);
    });
  }

  async reorderChildren(pageId: string, target: string, children: string[]): Promise<void> {
    return this.withLock(pageId, async () => {
      const page = await this.loadPage(pageId);
      const parent = this.requireElement(page, target);
      const wanted = children.map((c) => this.resolveId(page, c));
      const byId = new Map(parent.elements.map((el) => [el.id, el]));
      for (const id of wanted) {
        if (!byId.has(id)) throw new Error(`Child element not found under target: ${id}`);
      }
      const reordered = wanted.map((id) => byId.get(id)!).filter(Boolean);
      for (const child of parent.elements) {
        if (!wanted.includes(child.id)) reordered.push(child);
      }
      parent.elements = reordered;
      await this.record(page, "reorder_children", parent.id);
    });
  }

  async patchSettings(pageId: string, target: string, settings: Record<string, unknown>): Promise<string> {
    return this.withLock(pageId, async () => {
      const page = await this.loadPage(pageId);
      const element = this.requireElement(page, target);
      element.settings = { ...element.settings, ...settings };
      await this.record(page, "patch_settings", element.id);
      return element.id;
    });
  }

  async preview(pageId: string): Promise<StructurePreviewNode[]> {
    const page = await this.loadPage(pageId);
    return page.tree.map((el) => this.buildPreview(el, page.aliases));
  }

  async validate(pageId: string): Promise<{ valid: boolean; errors: ValidationError[] }> {
    const page = await this.loadPage(pageId);
    const errors: ValidationError[] = [];
    const ids = new Set<string>();

    if (!Array.isArray(page.tree)) {
      errors.push({ path: "tree", message: "Root tree must be an array." });
    } else {
      page.tree.forEach((el, i) => this.validateElement(el, `tree[${i}]`, ids, errors));
    }

    for (const [alias, id] of Object.entries(page.aliases)) {
      if (!ids.has(id)) {
        errors.push({ path: `aliases.${alias}`, message: "Alias target does not exist." });
      }
    }

    return { valid: errors.length === 0, errors };
  }

  private buildPreview(element: ElementObject, aliases: Record<string, string>): StructurePreviewNode {
    const alias = Object.entries(aliases).find(([, id]) => id === element.id)?.[0] ?? null;
    return {
      id: element.id,
      alias,
      elType: element.elType,
      widgetType: element.widgetType ?? undefined,
      label: this.elementLabel(element),
      elements: (element.elements ?? []).map((child) => this.buildPreview(child, aliases))
    };
  }

  private elementLabel(element: ElementObject): string {
    for (const key of ["title", "editor", "text", "html"]) {
      const value = element.settings?.[key];
      if (typeof value === "string" && value.length > 0) {
        return value.length > 80 ? `${value.slice(0, 80)}...` : value;
      }
    }
    return element.widgetType ?? element.elType;
  }

  private validateElement(
    element: unknown,
    elementPath: string,
    ids: Set<string>,
    errors: ValidationError[]
  ): void {
    if (!isRecord(element)) {
      errors.push({ path: elementPath, message: "Element must be an object." });
      return;
    }

    const id = element.id;
    if (typeof id !== "string" || id.length === 0) {
      errors.push({ path: `${elementPath}.id`, message: "Element requires id." });
    } else if (ids.has(id)) {
      errors.push({ path: `${elementPath}.id`, message: `Duplicate element ID: ${id}` });
    } else {
      ids.add(id);
    }

    if (element.elType !== "container" && element.elType !== "widget") {
      errors.push({ path: `${elementPath}.elType`, message: "Element type must be container or widget." });
    }
    if (element.elType === "widget" && (typeof element.widgetType !== "string" || element.widgetType.length === 0)) {
      errors.push({ path: `${elementPath}.widgetType`, message: "Widget element requires widgetType." });
    }
    if (!isRecord(element.settings)) {
      errors.push({ path: `${elementPath}.settings`, message: "Element settings must be an object." });
    }
    if (!Array.isArray(element.elements)) {
      errors.push({ path: `${elementPath}.elements`, message: "Element children must be an array." });
      return;
    }
    element.elements.forEach((child: unknown, index: number) =>
      this.validateElement(child, `${elementPath}.elements[${index}]`, ids, errors)
    );
  }

  private duplicateInTree(tree: ElementObject[], elementId: string): string | null {
    for (let i = 0; i < tree.length; i++) {
      if (tree[i]?.id === elementId) {
        const clone = this.reassignIds(cloneJson(tree[i]));
        tree.splice(i + 1, 0, clone);
        return clone.id;
      }
      const result = this.duplicateInTree(tree[i]?.elements ?? [], elementId);
      if (result) return result;
    }
    return null;
  }

  private reassignIds(element: ElementObject): ElementObject {
    element.id = randomBytes(4).toString("hex").slice(0, 7);
    element.elements = (element.elements ?? []).map((child) => this.reassignIds(child));
    return element;
  }

  private removeAliases(page: BuilderPage, element: ElementObject): void {
    const ids = new Set<string>();
    this.collectIds([element], ids);
    for (const [alias, id] of Object.entries(page.aliases)) {
      if (ids.has(id)) delete page.aliases[alias];
    }
  }

  private collectIds(tree: ElementObject[], ids: Set<string>): void {
    for (const element of tree) {
      ids.add(element.id);
      this.collectIds(element.elements ?? [], ids);
    }
  }
}
