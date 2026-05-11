# Defigma

Defigma exports Figma graphics and screens into Defold GUI files.

The main idea:

- in Defold, images live in `.atlas` files;
- in Figma, one atlas is one `Section`;
- a screen is a `Frame`;
- screen nodes reference images from atlas sections.

Use atlas sections for reusable graphics, then build screens from instances of those graphics plus native Figma text, frames, rectangles, ellipses, and editable UI shapes.

## Basic Workflow

1. Create an atlas section.

   Name the Figma `Section` as a Defold atlas path:

   ```text
   /assets/atlases/menu/menu.atlas
   ```

2. Put graphics inside the atlas section.

   Direct child components of the section become atlas images. Frames and image rectangles placed directly in the section are converted to components before export.

   The component name becomes the atlas image name. For example, component `button_green` in section `menu` is referenced from GUI as:

   ```text
   menu/button_green
   ```

3. Build a screen as a Figma frame.

   Use instances of components from atlas sections. Defigma detects the section of the master component and adds the correct atlas to the exported `.gui`.

4. Add metadata with JSON helper nodes.

   Metadata is written in the name of a small helper node. Prefer direct metadata without a target node name:

   ```json
   {"pivot":"PIVOT_S"}
   ```

5. Select a section or a screen frame and run the plugin.

   - selected `Section`: exports atlas images and `.atlas`;
   - selected `Frame`: exports a `.gui`;
   - multiple sections or multiple frames: batch export;
   - by default the plugin uploads files to the Defigma web server at `http://localhost:16830/upload`.

## Metadata Basics

Any Figma node whose name starts with `{` and contains valid JSON is treated as metadata. JSON metadata nodes are service nodes: they are hidden during export and are not exported as GUI nodes.

The preferred format is direct metadata:

```json
{"pivot":"PIVOT_S"}
```

Put this helper node inside the frame, instance, or component that should receive the metadata. The real exported object keeps its normal name; the JSON belongs to a separate helper child.

For example, to set a pivot on a frame named `panel`, create a small child frame inside `panel` and name that child:

```json
{"pivot":"PIVOT_S"}
```

Screen metadata also uses direct metadata. Put the helper node as a direct child of the exported screen frame:

```json
{"layers":["bg","ui","fx"]}
```

Use named metadata only when direct metadata cannot be placed inside the target object. This is common for text, rectangle, ellipse, or other leaf nodes that cannot contain a helper child. In that case, place a helper node next to the target and use the target node name as the key:

```json
{"button_ok":{"pivot":"PIVOT_S"}}
```

## Where To Put Metadata

- Screen metadata: direct child of the screen frame, without a node-name wrapper.
- Frame or component metadata: helper node inside the target frame, instance, or master component, without a node-name wrapper.
- Leaf-node metadata: sibling of the target text/rectangle/ellipse node, with the target node name as the key.
- Atlas metadata: inside an atlas section or in the section JSON name.
- Global defaults: anywhere on any page as `{"defigma":{...}}`.

If several metadata nodes set the same field, the later merge wins. For `texture`, `textures`, and `materials`, values are merged instead of overwritten.

## Atlas Sections

A section can be named as a plain atlas path:

```text
/assets/atlases/menu/menu.atlas
```

Or as JSON when atlas export settings are needed:

```json
{"path":"/assets/atlases/menu/menu.atlas"}
```

Optional atlas fields should be separate and only added when needed:

```json
{"format":"png"}
```

```json
{"color_profile":"srgb"}
```

```json
{"extrude_borders":2}
```

If `extrude_borders` is not specified, Defigma writes `extrude_borders: 2`.

Metadata helper nodes inside a section can also add atlas fields:

```json
{"margin":4}
```

## Global Defaults

Use a metadata node with `defigma` to avoid repeating common settings on every screen.

This is the recommended real-project setup:

```json
{"defigma":{"auto_script":true,"rects":{"atlas":"misc","prefix_name":"round_","sizes":[0,5,10,15,20,30,40,50]},"ellipses":{"atlas":"misc","prefix_name":"ellipse_","sizes":[15,30,50,100,200,300,500]}}}
```

Supported global defaults:

- `auto_script`
- `rects`
- `ellipses`
- `outline_rects`
- `outline_ellipses`
- `update_metadata_to_new`

`auto_script: true` fills `script` automatically from the screen name when no explicit script is set.

## Node Metadata

Use direct metadata to override common Defold node fields. Place the helper inside the frame, instance, or component that should receive the override.

```json
{"pivot":"PIVOT_S"}
```

```json
{"layer":"ui"}
```

```json
{"enabled":true}
```

Texture override:

```json
{"texture":"menu/button_green"}
```

Color override:

```json
{"color":{"x":1,"y":0.9,"z":0.3}}
```

For a leaf node, use a sibling helper with the target name:

```json
{"price":{"font":"inter_bold"}}
```

## Export Control

By default, hidden or locked Figma nodes are not exported.

Use `need_export` on a specific node to override this:

```json
{"need_export":true}
```

```json
{"need_export":false}
```

For a hidden or locked leaf node that cannot contain a metadata helper, put named metadata next to it:

```json
{"bonus_icon":{"need_export":true}}
```

You can also define wildcard patterns on screen metadata. Pattern metadata only affects hidden or locked nodes:

```json
{"need_export":["map*"]}
```

The `*` wildcard means any characters. For example, `map*` matches `map`, `map_bg`, and `map_icon`.

## Layers For Children

Use these fields when a container should assign layers to descendants.

```json
{"child_layer":"ui"}
```

```json
{"child_text_layer":"text"}
```

```json
{"child_non_text_layer":"ui"}
```

Explicit `layer` on a node has priority.

## Anchoring To Screen Edges

Use `anchor_reference` to bind a node to a screen edge or corner.

```json
{"anchor_reference":"NE"}
```

Supported values:

- `N`, `S`, `E`, `W`
- `NE`, `NW`, `SE`, `SW`
- `C` or `CENTER`

Defigma creates an invisible parent node named `<node_id><anchor>`, for example `close_buttonNE`, sets the parent to `ADJUST_MODE_STRETCH`, and reparents the original node under it.

Important: all parents between the anchored node and root are switched to `ADJUST_MODE_STRETCH`. Screen-edge positioning depends on this parent chain.

## Scale Instead Of Size

For atlas images, Defigma usually writes the instance size into the GUI node. Sometimes a node must keep the original atlas size and use scale instead, for example for slice9.

```json
{"scale_instead_size":true}
```

Values:

- `true` or `"true"`: use scale for both axes.
- `"x"`: scale only X.
- `"y"`: scale only Y.
- `"xy"`: scale both axes.

## Native Figma Features

Defigma exports these Figma features directly:

- frames as invisible containers;
- component instances as atlas image nodes;
- text nodes, including mixed font/fill/size text when it can be split safely;
- solid fills;
- rectangle and ellipse fills through configured `rects` and `ellipses`;
- rectangle and ellipse strokes as separate nodes;
- linear and radial gradients for rectangles, ellipses, text, and strokes;
- text solid stroke as Defold text outline;
- rotation and flips;
- Figma opacity as Defold color/alpha;
- text percent letter spacing as `text_tracking`.

Gradients generate an additional Lua file named:

```text
<screen_name>_defigma.lua
```

Make sure the Defigma runtime materials exist in the Defold project.

## Rectangles

Defigma can export Figma rectangles natively when `rects` metadata is configured.

```json
{"rects":{"atlas":"misc","prefix_name":"round_","sizes":[0,5,10,15,20,30,40,50]}}
```

It is best to define `rects` once in global `defigma` settings. The ready atlas with these images is available in the Playground, so artists usually do not need to create or name these images manually.

Rectangles support solid fill color and gradient fill export.

## Ellipses

Defigma can export Figma ellipses natively when `ellipses` metadata is configured.

```json
{"ellipses":{"atlas":"misc","prefix_name":"ellipse_","sizes":[15,30,50,100,200,300,500]}}
```

It is best to define `ellipses` once in global `defigma` settings. The ready atlas with these images is available in the Playground.

Ellipses support solid fill color, gradient fill export, and Figma arc data for `TYPE_PIE`.

## Strokes And Outlines

Rectangle and ellipse strokes are exported as separate Defold nodes.

For most projects, configure shape support globally and use the ready Playground atlas. Do not hand-write texture names unless you are creating a custom shape atlas.

Basic rectangle and ellipse strokes work from `rects` and `ellipses`. More detailed outline atlases can be configured with:

```json
{"outline_rects":{"atlas":"misc","prefix_name":"round_outline_","sizes":[0,5,10,15,20,30,40,50],"outline_sizes":[1,2,4,8]}}
```

```json
{"outline_ellipses":{"atlas":"misc","prefix_name":"ellipse_outline_","sizes":[15,30,50,100,200,300,500],"outline_sizes":[1,2,4,8]}}
```

Use outline metadata only when the project needs it. The Playground is the source of truth for the prepared atlas.

## Pie Nodes

Ellipses with Figma arc data can be exported as Defold `TYPE_PIE`.

You can also force a node to `TYPE_PIE` with metadata:

```json
{"type":"TYPE_PIE"}
```

Optional pie fields:

```json
{"innerRadius":24}
```

```json
{"perimeterVertices":80}
```

```json
{"pieFillAngle":270}
```

## Duplicate Node Names

Defold GUI ids must be unique. If several exported nodes would have the same id, export fails.

For controlled duplicate groups, use `allow_identical_names`:

```json
{"allow_identical_names":["stage*"]}
```

If a matching id already exists, Defigma appends or increments a numeric suffix.

Use this carefully. Gradients and generated helper nodes also depend on ids.

## GUI File Metadata

These fields are optional. Use them only when the project needs explicit GUI-level configuration.

Export destination for web-server export:

```json
{"path_to_screen":"/main/gui"}
```

Explicit GUI script:

```json
{"script":"/main/gui/menu.gui_script"}
```

Default GUI material:

```json
{"material":"/builtins/materials/gui.material"}
```

Additional materials:

```json
{"materials":["/defigma/materials/linear.material"]}
```

Adjust reference:

```json
{"adjust_reference":"ADJUST_REFERENCE_PARENT"}
```

Maximum nodes:

```json
{"max_nodes":1024}
```

Layer order:

```json
{"layers":["bg","ui","fx"]}
```

Extra atlas/texture references:

```json
{"textures":["menu/button_ok"]}
```

`textures` must be an array and must be declared on a direct child of the exported screen or layout root.

## Font Metadata

Font metadata maps Figma font family/style to a Defold font resource.

```json
{"Inter Bold":{"name":"inter_bold","path":"/assets/fonts","size":32}}
```

Fields:

- key, for example `Inter Bold`: exact Figma font family plus style;
- `name`: Defold font resource name used by text nodes;
- `path`: folder where `<name>.font` exists;
- `size`: base font size used to calculate text scale.

If font metadata is missing, Defigma generates a name from the Figma font, uses `/assets/fonts/<font_name>.font`, and assumes base size `32`.

Text export supports:

- solid text fill color;
- linear gradient text fill through Defigma materials;
- solid text stroke as Defold text outline;
- mixed text runs split into several Defold text nodes when possible.

## TYPE_TEMPLATE

Use master components with `TYPE` set to `TYPE_TEMPLATE` for reusable Defold GUI template nodes.

Template instance metadata can define where the referenced `.gui` is located:

```json
{"path_to_screen":"/collections/templates"}
```

The exported template path becomes:

```text
/collections/templates/<master_component_name>.gui
```

If no path is provided, Defigma uses:

```text
/collections/templates/<master_component_name>.gui
```

Use `template_default_size` when instances should export as scale relative to a designed base size:

```json
{"template_default_size":{"x":320,"y":180}}
```

To exclude a template node:

```json
{"need_export":false}
```

## Practical Notes

- JSON must be valid. A node named `{{...}}` is treated as an error.
- JSON helper nodes are never exported.
- Hidden or locked nodes are skipped unless explicitly allowed by `need_export`.
- Master component names inside an atlas section must be unique.
- Exported Defold node ids must be unique unless handled by `allow_identical_names`.
- Keep component and node names stable. Metadata targets exported ids, which usually come from Figma node names.
- Prefer atlas components for final art. Use native rectangles, ellipses, gradients, and text for UI parts that need to stay editable in Figma.

## Layouts

Layouts let one exported `.gui` contain a Default layout plus Defold layout overrides.

Create a parent frame with metadata:

```json
{"is_layout":true}
```

Inside it, create child frames:

- `Default`
- other layout frames, for example `Phone`, `Tablet`, `Wide`

Rules:

- only visible layout frames are exported;
- maximum enabled layouts: 5;
- `Default` is required;
- all layout frames must have the same exported node ids and parent structure;
- metadata outside layout frames but inside the layout root is shared;
- metadata inside a layout frame affects only that layout.

Plugin behavior:

- select `Default` and run plugin: sync layout frame structure;
- select another layout frame and run plugin: save layout state compared to `Default`;
- select the layout root and run plugin: export the `.gui` with layout overrides.

## Metadata Reference By Category

### Global `defigma`

```json
{"defigma":{"auto_script":true}}
```

- `auto_script`
- `rects`
- `ellipses`
- `outline_rects`
- `outline_ellipses`
- `update_metadata_to_new`

### Atlas Section

```json
{"path":"/assets/atlases/menu/menu.atlas"}
```

- `path`
- `format`
- `color_profile`
- any extra string/number/boolean atlas field

### Screen And GUI

```json
{"path_to_screen":"/main/gui"}
```

- `path_to_screen`
- `script`
- `material`
- `materials`
- `adjust_reference`
- `max_nodes`
- `layers`
- `textures`
- `font_layer`
- `font_material`
- `need_export`
- `is_layout`

### Font

```json
{"DIN Pro Condensed Bold Italic":{"name":"din_pro_condensed_bold_italic","path":"/assets/fonts","size":32}}
```

- `<Figma family> <Figma style>` object
- `name`
- `path`
- `size`

### Node

```json
{"pivot":"PIVOT_S"}
```

- `pivot`
- `xanchor`
- `yanchor`
- `adjust_mode`
- `size_mode`
- `blend_mode`
- `layer`
- `texture`
- `material`
- `color`
- `alpha`
- `scale`
- `slice9`
- `clipping_mode`
- `clipping_visible`
- `visible`
- `enabled`
- `anchor_reference`
- `need_export`
- `scale_instead_size`
- `line_break`
- `font`

### Descendant Layers

```json
{"child_layer":"ui"}
```

- `child_layer`
- `children_layer`
- `child_text_layer`
- `children_text_layer`
- `child_non_text_layer`
- `children_non_text_layer`

### Native Shapes

```json
{"rects":{"atlas":"misc","prefix_name":"round_","sizes":[0,5,10,15,20,30,40,50]}}
```

```json
{"ellipses":{"atlas":"misc","prefix_name":"ellipse_","sizes":[15,30,50,100,200,300,500]}}
```

```json
{"outline_rects":{"atlas":"misc","prefix_name":"round_outline_","sizes":[0,5,10,15,20,30,40,50],"outline_sizes":[1,2,4,8]}}
```

```json
{"outline_ellipses":{"atlas":"misc","prefix_name":"ellipse_outline_","sizes":[15,30,50,100,200,300,500],"outline_sizes":[1,2,4,8]}}
```

- `atlas`
- `prefix_name`
- `sizes`
- `outline_sizes`

### Pie

```json
{"type":"TYPE_PIE"}
```

- `type`
- `outerBounds`
- `innerRadius`
- `perimeterVertices`
- `pieFillAngle`

### Templates

```json
{"template_default_size":{"x":320,"y":180}}
```

- `path_to_screen`
- `template_default_size`
- `need_export`

### Duplicate Names

```json
{"allow_identical_names":["*stage*"]}
```

- `allow_identical_names`
