# elementor-builder-mcp

Independent MCP service for building Elementor JSON trees. This service does not connect to WordPress; use `wp-api` to import or initialize the exported tree.

## Scripts

```bash
npm install
npm run build
npm test
```

## Scope

- Stateful Elementor draft sessions
- Semantic builder tools for JSON tree construction
- Raw tree export for `wp-api`
- No WordPress REST communication

## Implemented Tools

Session and tree:

- `health`
- `page_create`
- `page_list`
- `page_get`
- `page_clear`
- `import_tree`
- `export_tree`
- `preview_structure`
- `validate_tree`

Business editing APIs:

- `add_layout`: add a top-level layout container when `parent` is omitted, or add an inner container when `parent` is provided.
- `add_heading`, `add_text`, `add_button`, `add_image`: add content elements after the layout exists.
- `edit_content`: edit widget content such as heading title, text HTML, button text/URL, and image object.
- `edit_style`: edit styles through a named helper with unified `value`, `scope`, and `device` inputs.
- `remove_element`, `duplicate_element`, `move_element`, `reorder_children`: edit tree structure.
- `helpers`: list available style helper names and value descriptions.

## Workflow

```text
page_create
add_layout
add_heading / add_text / add_button / add_image
edit_content
edit_style
preview_structure
validate_tree
export_tree
```

Pass the exported `tree` to `wp-api` with `wp_elementor_init` or `wp_elementor_import`.

Sessions are stored under `.elementor-builder/sessions` by default. Tools accept aliases so an agent can target stable names such as `hero` instead of random Elementor element IDs.
