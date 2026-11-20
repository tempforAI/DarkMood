# 像素美术规范（程序化生成）

游戏不使用任何外部图片。所有画面都由 Canvas 2D 代码在运行时生成并缓存。
美术代码位于 `js/art/`，以普通 `<script>` 加载（非 ES module），挂在全局 `DM.Art` 上。

## 1. 对外接口（引擎只调用这些）

```js
DM.Art.getBackground(id, variant)  // -> HTMLCanvasElement 480x270；id 见 js/data/locations.js；variant 可为 undefined
DM.Art.getPortrait(charId, expr)   // -> HTMLCanvasElement 80x112（半身像，透明背景）；expr 见 DM.EXPRS
DM.Art.getSprite(charId)           // -> HTMLCanvasElement 16x32（全身小人，透明背景，用于场景与地图）
DM.Art.getIcon(iconId)             // -> HTMLCanvasElement 16x16（证据图标，透明背景）
DM.Art.getMap()                    // -> HTMLCanvasElement 480x270（宵鸦岛地图，节点位置见 DM.AREAS[*].map）
```

* 所有函数都必须**缓存**结果（同参数第二次调用直接返回同一个 canvas）。
* 未知 id 不要抛异常：返回一个合理的占位图（例如灰色房间 / 剪影）。
* 生成必须是**确定性的**（用固定种子的伪随机数），每次打开游戏画面一致。
* 单张背景生成耗时应 < 30ms；不要在生成时用逐像素的 getImageData 大循环处理整张图（小范围可以）。
* 不要依赖任何 DOM（除了 `document.createElement('canvas')`），不要启动任何定时器/动画——动画由引擎负责（雨、烛火闪烁、滤镜等都由引擎叠加）。

## 2. 画风

* 1990 年代末日式推理冒险游戏 + 现代像素画。阴郁、潮湿、哥特。
* 主色调：深靛蓝 `#0d1020` / 暗紫 `#1e1630` / 石墙灰紫 / 胡桃木棕 / 暗红 `#7a1426` / 黯金 `#c9a25a`。
* 有限调色板 + 少量抖动（dither）表现渐变；轮廓清晰；不要抗锯齿（`imageSmoothingEnabled = false`，用 `fillRect` 画像素）。
* 背景画的是「白天/室内灯光」下的常态；夜晚、雨、火光、回忆棕褐色由引擎用滤镜和粒子叠加，所以背景本身不要画雨。
  * 但室外场景的天空应是阴天（灰紫云层），因为整个故事都在台风外围。
* 视角：室内为正面单点透视（后墙 + 地板），地平线大约在 y=170 附近；人物小人站在 y≈200–230 的地板上。

## 3. 背景（480x270）

逐一实现 `js/data/locations.js` 中的每个 id，并在 **anchors 指定的矩形内画出对应物件**（引擎会在锚点中心显示可调查标记，所以物件位置必须对得上）。重要细节：

* `east_room` / `west_room`：西翼是东翼的**左右镜像**（门、开关、窗、床的位置相反）。`east_room:burnt` 是烧毁版本（焦黑、床烧塌、墙面熏黑）。
* `east_corridor` 窗在左；`west_corridor` 窗在右（镜像）。
* `cellar`：两端各一道楼梯门，门上方各挂一块铜牌（`west_plate` / `east_plate`，画出「西」「东」二字的像素字或简化符号）。
* `courtyard`：画出鸦之塔与钟面、三楼书斋窗户、天空中从左上方斜拉到塔顶的细缆索；`courtyard:past` 温室完好、玻璃发亮。
* `study`：门内侧的插销、天花板活板门、桌上的台灯与黑布罩着的鸟笼、壁炉、墙角小检修门。
* `balcony`：新铁栏杆、铁环、远处的海与神社山丘；`balcony:past` 是九年前腐朽的木栏杆（其中一段断裂）、夜空。
* `beach`：悬崖与塔顶；`beach:tracks` 在沙滩上加一行从左侧石阶走向水线的脚印和手杖小孔。
* `judgment`：石造圆厅、彩色玻璃窗（乌鸦图案）、地面乌鸦徽章、环形证言台。也用作审判背景。
* `hut:past`：九年前整洁有人住的样子。
* `title`：日蚀的月亮（黑色圆盘＋金色光环）下的月蚀馆与鸦之塔剪影，乌鸦群。
* `black` / `white`：纯色。
* `map`：同 `getMap()`。

## 4. 立绘（80x112，半身像）

* 每个角色的 `visual` 描述见 `js/data/characters.js`（发型、发色、肤色、眼睛、服装、配饰）。
* 构图：头部约占上半部，肩膀与上半身到画面底部；朝向正面或微侧。像素风格动漫脸（大眼睛）。
* 8 种表情：`normal smile sad angry surprise think shock dark`
  * 通过替换眉毛、眼睛、嘴巴图层实现；`shock` 可加冷汗、瞳孔缩小；`dark` = 眼睛阴影 + 诡异的笑（凶手崩溃时用）；`sad` 可加泪光；`think` 手托下巴或视线偏移。
* 特殊角色：
  * `judge`：黑色兜帽 + 乌鸦面具（尖喙、红色发光眼孔），没有表情差异也可以（表情只改眼孔亮度）。
  * `young_ritsu` / `young_sayo`：儿童比例（头更大、身体更小）。
  * `chizuru`：白裙、白缎带、长黑发。
* 角色之间必须一眼能区分（发型轮廓 + 主色）。
* 推荐实现：一个参数化的「部件组合」生成器（脸型、发型前发/后发、眼型、服装），而不是给每个角色手写整张像素图。

## 5. 小人（16x32）

与立绘同配色的简化全身像：头发颜色、服装颜色、特征配饰（汐的红本子、久我的手杖、琴音的琴盒、厨师帽……）。

## 6. 证据图标（16x16）

`knife key note letter rope string feather bottle pill photo book diary clock bell cloth paint shoe footprint tape recorder ring hairpin candle fire map blueprint plate glass cup violin card lamp window door cage sand boat cable wax sequin tooth doll testimony body generic`

## 7. 地图

宵鸦岛俯视图：海、岛的轮廓、森林、山丘上的神社、宅邸、塔、码头、海滩、海蚀洞、小屋。各区域节点坐标见 `DM.AREAS[area].map`，在节点处画出对应的小建筑/地标（引擎会在节点上叠加文字标签与高亮，所以地图上不要写字）。

## 8. 交付与自测

* 文件：`js/art/palette.js`、`js/art/pixel.js`（基础绘制工具）、`js/art/portraits.js`、`js/art/backgrounds.js`、`js/art/icons.js`、`js/art/index.js`（组装 `DM.Art`）。加载顺序由引擎的 index.html 决定：palette → pixel → portraits → backgrounds → icons → index。
* 写一个预览页 `tools/art_preview.html`：加载 characters.js、locations.js 和全部 art 文件，把所有背景（含变体）、所有角色 × 表情立绘（放大 2 倍）、小人、图标、地图排列显示，并在每张图下标注 id 和生成耗时。
* 用 Playwright（已预装，`require('playwright')`，`chromium.launch()`）截图预览页，亲自看图检查质量并迭代。
