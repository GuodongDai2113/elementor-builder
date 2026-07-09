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

- `builder_health`
- `builder_create_session`
- `builder_list_sessions`
- `builder_get_session`
- `builder_clear_session`
- `builder_import_tree`
- `builder_export_tree`
- `builder_preview_structure`
- `builder_validate`

Business editing APIs:

- `builder_add`: add sections, containers, headings, text, buttons, images, and HTML widgets.
- `builder_layout_edit`: edit layout and structure such as flex, move, and reorder.
- `builder_content_edit`: edit widget content such as heading title, text HTML, button text/URL, image object, and HTML content.
- `builder_style_edit`: edit component-specific styles such as heading typography, text color, button colors, image style, and container background/border/shadow.
- `builder_advanced_edit`: edit global fields available to all elements, such as margin, padding, width, z-index, position, CSS ID/classes, entrance animation, raw advanced settings, duplicate, and remove.

## Workflow

```text
builder_create_session
builder_add
builder_content_edit
builder_style_edit
builder_advanced_edit
builder_preview_structure
builder_validate
builder_export_tree
```

Pass the exported `tree` to `wp-api` with `wp_elementor_init` or `wp_elementor_import`.

Sessions are stored under `.elementor-builder/sessions` by default. Tools accept aliases so an agent can target stable names such as `hero` instead of random Elementor element IDs.
