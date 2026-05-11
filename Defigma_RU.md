# Defigma

Defigma экспортирует графику и экраны из Figma в GUI-файлы Defold.

Главная идея:

- в Defold изображения лежат в `.atlas` файлах;
- в Figma один атлас - это одна `Section`;
- экран - это `Frame`;
- ноды экрана ссылаются на изображения из atlas sections.

Используйте atlas sections для переиспользуемой графики, а затем собирайте экраны из инстансов этой графики, а также из нативных текстов Figma, фреймов, прямоугольников, эллипсов и редактируемых UI-форм.

## Basic Workflow

1. Создайте atlas section.

   Назовите Figma `Section` как путь к atlas в Defold:

   ```text
   /assets/atlases/menu/menu.atlas
   ```

2. Положите графику внутрь atlas section.

   Компоненты, которые лежат прямыми детьми section, становятся изображениями атласа. Фреймы и image rectangles, размещенные прямо внутри section, перед экспортом конвертируются в компоненты.

   Имя компонента становится именем изображения в атласе. Например, компонент `button_green` в section `menu` будет использоваться в GUI как:

   ```text
   menu/button_green
   ```

3. Соберите экран как Figma frame.

   Используйте инстансы компонентов из atlas sections. Defigma определит section мастер-компонента и добавит нужный atlas в экспортируемый `.gui`.

4. Добавьте metadata через JSON helper nodes.

   Metadata записывается в имя маленькой helper-ноды. Предпочтительный формат - direct metadata без имени целевой ноды:

   ```json
   {"pivot":"PIVOT_S"}
   ```

5. Выберите section или frame экрана и запустите plugin.

   - выбранный `Section`: экспортирует atlas images и `.atlas`;
   - выбранный `Frame`: экспортирует `.gui`;
   - несколько sections или несколько frames: batch export;
   - по умолчанию plugin загружает файлы в Defigma web server по адресу `http://localhost:16830/upload`.

## Metadata Basics

Любая Figma-нода, имя которой начинается с `{` и содержит валидный JSON, считается metadata. JSON metadata nodes - служебные ноды: они скрываются при экспорте и не экспортируются как GUI-ноды.

Предпочтительный формат - direct metadata:

```json
{"pivot":"PIVOT_S"}
```

Положите эту helper-ноду внутрь frame, instance или component, который должен получить metadata. Настоящий экспортируемый объект сохраняет свое обычное имя; JSON находится в отдельной дочерней helper-ноде.

Например, чтобы задать pivot для frame с именем `panel`, создайте маленький child frame внутри `panel` и назовите этот child:

```json
{"pivot":"PIVOT_S"}
```

Screen metadata использует тот же direct format. Положите helper-ноду прямым ребенком экспортируемого screen frame:

```json
{"layers":["bg","ui","fx"]}
```

Используйте named metadata только тогда, когда direct metadata нельзя положить внутрь целевого объекта. Обычно это нужно для text, rectangle, ellipse и других leaf nodes, которые не могут содержать helper child. В таком случае положите helper-ноду рядом с целевой нодой и используйте имя целевой ноды как ключ:

```json
{"button_ok":{"pivot":"PIVOT_S"}}
```

## Where To Put Metadata

- Screen metadata: прямой ребенок screen frame, без wrapper с именем ноды.
- Frame or component metadata: helper-нода внутри target frame, instance или master component, без wrapper с именем ноды.
- Leaf-node metadata: sibling целевой text/rectangle/ellipse node, с именем целевой ноды как ключом.
- Atlas metadata: внутри atlas section или в JSON-имени section.
- Global defaults: в любом месте на любой page как `{"defigma":{...}}`.

Если несколько metadata nodes задают одно и то же поле, выигрывает более позднее значение при merge. Для `texture`, `textures` и `materials` значения объединяются, а не перезаписываются.

## Atlas Sections

Section можно назвать обычным путем к atlas:

```text
/assets/atlases/menu/menu.atlas
```

Или JSON-ом, если нужны настройки atlas export:

```json
{"path":"/assets/atlases/menu/menu.atlas"}
```

Опциональные поля atlas лучше добавлять отдельно и только когда они нужны:

```json
{"format":"png"}
```

```json
{"color_profile":"srgb"}
```

```json
{"extrude_borders":2}
```

Если `extrude_borders` не указан, Defigma запишет `extrude_borders: 2`.

Metadata helper nodes внутри section тоже могут добавлять поля atlas:

```json
{"margin":4}
```

## Global Defaults

Используйте metadata node с `defigma`, чтобы не повторять общие настройки на каждом экране.

Рекомендуемая настройка для реального проекта:

```json
{"defigma":{"auto_script":true,"rects":{"atlas":"misc","prefix_name":"round_","sizes":[0,5,10,15,20,30,40,50]},"ellipses":{"atlas":"misc","prefix_name":"ellipse_","sizes":[15,30,50,100,200,300,500]}}}
```

Поддерживаемые global defaults:

- `auto_script`
- `rects`
- `ellipses`
- `outline_rects`
- `outline_ellipses`
- `update_metadata_to_new`

`auto_script: true` автоматически заполняет `script` по имени экрана, если explicit script не задан.

## Node Metadata

Используйте direct metadata, чтобы переопределять частые поля Defold node. Положите helper внутрь frame, instance или component, который должен получить override.

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

Для leaf node используйте sibling helper с именем целевой ноды:

```json
{"price":{"font":"inter_bold"}}
```

## Export Control

По умолчанию hidden или locked Figma-ноды не экспортируются.

Используйте `need_export` на конкретной ноде, чтобы переопределить это поведение:

```json
{"need_export":true}
```

```json
{"need_export":false}
```

Для hidden или locked leaf node, которая не может содержать metadata helper, положите named metadata рядом с ней:

```json
{"bonus_icon":{"need_export":true}}
```

Также можно задать wildcard patterns в screen metadata. Pattern metadata влияет только на hidden или locked nodes:

```json
{"need_export":["map*"]}
```

Wildcard `*` означает любые символы. Например, `map*` совпадает с `map`, `map_bg` и `map_icon`.

## Layers For Children

Используйте эти поля, когда container должен назначить layers своим descendants.

```json
{"child_layer":"ui"}
```

```json
{"child_text_layer":"text"}
```

```json
{"child_non_text_layer":"ui"}
```

Explicit `layer` на самой ноде имеет приоритет.

## Anchoring To Screen Edges

Используйте `anchor_reference`, чтобы привязать ноду к краю или углу экрана.

```json
{"anchor_reference":"NE"}
```

Поддерживаемые значения:

- `N`, `S`, `E`, `W`
- `NE`, `NW`, `SE`, `SW`
- `C` или `CENTER`

Defigma создает invisible parent node с именем `<node_id><anchor>`, например `close_buttonNE`, задает parent `ADJUST_MODE_STRETCH` и переносит исходную ноду внутрь него.

Важно: все parents между anchored node и root переключаются в `ADJUST_MODE_STRETCH`. Привязка к краю экрана зависит от этой parent chain.

## Scale Instead Of Size

Для atlas images Defigma обычно записывает размер instance в GUI node. Иногда нужно сохранить исходный размер atlas image и вместо этого использовать scale, например для slice9.

```json
{"scale_instead_size":true}
```

Значения:

- `true` или `"true"`: использовать scale по обеим осям.
- `"x"`: scale только по X.
- `"y"`: scale только по Y.
- `"xy"`: scale по обеим осям.

## Native Figma Features

Defigma напрямую экспортирует эти Figma features:

- frames как invisible containers;
- component instances как atlas image nodes;
- text nodes, включая mixed font/fill/size text, если его можно безопасно разбить;
- solid fills;
- rectangle и ellipse fills через настроенные `rects` и `ellipses`;
- rectangle и ellipse strokes как отдельные nodes;
- linear и radial gradients для rectangles, ellipses, text и strokes;
- text solid stroke как Defold text outline;
- rotation и flips;
- opacity из Figma как Defold color/alpha;
- letter spacing в процентах как `text_tracking`.

Gradients генерируют дополнительный Lua-файл:

```text
<screen_name>_defigma.lua
```

Убедитесь, что runtime materials Defigma есть в Defold project.

## Rectangles

Defigma может нативно экспортировать Figma rectangles, когда настроена metadata `rects`.

```json
{"rects":{"atlas":"misc","prefix_name":"round_","sizes":[0,5,10,15,20,30,40,50]}}
```

Лучше всего один раз задать `rects` в global `defigma` settings. Готовый atlas с этими images доступен в Playground, поэтому художникам обычно не нужно создавать или называть эти images вручную.

Rectangles поддерживают solid fill color и gradient fill export.

## Ellipses

Defigma может нативно экспортировать Figma ellipses, когда настроена metadata `ellipses`.

```json
{"ellipses":{"atlas":"misc","prefix_name":"ellipse_","sizes":[15,30,50,100,200,300,500]}}
```

Лучше всего один раз задать `ellipses` в global `defigma` settings. Готовый atlas с этими images доступен в Playground.

Ellipses поддерживают solid fill color, gradient fill export и Figma arc data для `TYPE_PIE`.

## Strokes And Outlines

Strokes у rectangles и ellipses экспортируются как отдельные Defold nodes.

В большинстве проектов поддержку shapes лучше настраивать глобально и использовать готовый atlas из Playground. Не прописывайте texture names вручную, если вы не создаете собственный shape atlas.

Базовые strokes у rectangles и ellipses работают через `rects` и `ellipses`. Более детальные outline atlases можно настроить так:

```json
{"outline_rects":{"atlas":"misc","prefix_name":"round_outline_","sizes":[0,5,10,15,20,30,40,50],"outline_sizes":[1,2,4,8]}}
```

```json
{"outline_ellipses":{"atlas":"misc","prefix_name":"ellipse_outline_","sizes":[15,30,50,100,200,300,500],"outline_sizes":[1,2,4,8]}}
```

Используйте outline metadata только если проекту это нужно. Playground - источник истины для подготовленного atlas.

## Pie Nodes

Ellipses с Figma arc data могут экспортироваться как Defold `TYPE_PIE`.

Также можно принудительно сделать ноду `TYPE_PIE` через metadata:

```json
{"type":"TYPE_PIE"}
```

Опциональные pie fields:

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

Defold GUI ids должны быть уникальными. Если несколько экспортируемых nodes получают один и тот же id, export завершится ошибкой.

Для контролируемых групп дубликатов используйте `allow_identical_names`:

```json
{"allow_identical_names":["stage*"]}
```

Если matching id уже существует, Defigma добавляет или увеличивает numeric suffix.

Используйте это осторожно. Gradients и generated helper nodes тоже зависят от ids.

## GUI File Metadata

Эти поля опциональны. Используйте их только когда проекту нужна explicit GUI-level configuration.

Папка назначения для web-server export:

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

`textures` должен быть array и должен быть объявлен на direct child экспортируемого screen или layout root.

## Font Metadata

Font metadata связывает Figma font family/style с Defold font resource.

```json
{"Inter Bold":{"name":"inter_bold","path":"/assets/fonts","size":32}}
```

Fields:

- ключ, например `Inter Bold`: точные Figma font family и style;
- `name`: имя Defold font resource, которое используют text nodes;
- `path`: папка, где лежит `<name>.font`;
- `size`: базовый font size для расчета text scale.

Если font metadata не задана, Defigma генерирует имя из Figma font, использует `/assets/fonts/<font_name>.font` и считает base size равным `32`.

Text export поддерживает:

- solid text fill color;
- linear gradient text fill через Defigma materials;
- solid text stroke как Defold text outline;
- mixed text runs, которые разбиваются на несколько Defold text nodes, когда это возможно.

## TYPE_TEMPLATE

Используйте master components с `TYPE`, установленным в `TYPE_TEMPLATE`, для переиспользуемых Defold GUI template nodes.

Metadata template instance может задать, где находится referenced `.gui`:

```json
{"path_to_screen":"/collections/templates"}
```

Экспортируемый template path станет:

```text
/collections/templates/<master_component_name>.gui
```

Если path не задан, Defigma использует:

```text
/collections/templates/<master_component_name>.gui
```

Используйте `template_default_size`, когда instances должны экспортироваться как scale относительно базового designed size:

```json
{"template_default_size":{"x":320,"y":180}}
```

Чтобы исключить template node:

```json
{"need_export":false}
```

## Practical Notes

- JSON должен быть валидным. Нода с именем `{{...}}` считается ошибкой.
- JSON helper nodes никогда не экспортируются.
- Hidden или locked nodes пропускаются, если явно не разрешены через `need_export`.
- Имена master components внутри atlas section должны быть уникальными.
- Exported Defold node ids должны быть уникальными, если они не обработаны через `allow_identical_names`.
- Держите component и node names стабильными. Metadata нацеливается на exported ids, которые обычно берутся из имен Figma nodes.
- Для финального арта предпочитайте atlas components. Используйте native rectangles, ellipses, gradients и text для UI-частей, которые должны оставаться редактируемыми в Figma.

## Layouts

Layouts позволяют одному exported `.gui` содержать Default layout и Defold layout overrides.

Создайте parent frame с metadata:

```json
{"is_layout":true}
```

Внутри создайте child frames:

- `Default`
- другие layout frames, например `Phone`, `Tablet`, `Wide`

Правила:

- экспортируются только visible layout frames;
- максимум enabled layouts: 5;
- `Default` обязателен;
- у всех layout frames должны быть одинаковые exported node ids и parent structure;
- metadata вне layout frames, но внутри layout root, является общей;
- metadata внутри layout frame влияет только на этот layout.

Поведение plugin:

- выберите `Default` и запустите plugin: синхронизация структуры layout frames;
- выберите другой layout frame и запустите plugin: сохранение layout state относительно `Default`;
- выберите layout root и запустите plugin: export `.gui` с layout overrides.

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
- любое дополнительное string/number/boolean поле atlas

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

- объект `<Figma family> <Figma style>`
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
