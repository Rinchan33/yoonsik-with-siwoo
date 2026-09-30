# Two Paths, One Story.

金允植 & 朴时宇的双人资料网站。按照 `prd/prd.md` 实现，使用 `resource/` 中提供的写真、作品、杂志及活动影像。

## 立即查看

直接双击根目录的 **`index.html`**。网站无需安装任何依赖，也无需联网读取图片。

如果已经安装 Node.js 20 或更新版本，可以在本文件所在目录运行：

```sh
npm start
```

然后打开 [http://localhost:4173](http://localhost:4173)。在终端按 `Ctrl+C` 停止预览。

## 已实现

- 首页：双人写真、下一场活动动态倒计时、精选杂志、直播与活动回顾。
- Profile：人物筛选、简介、作品相册；费加罗、LOADING、势界三本双人杂志，每本 11 张封面及画报。费加罗提供 11 组问答与 2 个文章篇章，LOADING 提供 8 组问答，势界采访待更新。文字可复制、搜索，不直接展示采访扫描页。
- Schedule：45 条按日期合并的时间轴记录（依据新版 resource/Schedule/schedule.md），人物/状态/月份/活动类型组合筛选、关键词搜索、分批加载、来源详情、见面活动全天 `.ics` 日历下载。
- Fanmeeting：6 条活动档案，包含首尔 2 场、香港 2 场，可切换即将开始和往期回顾。
- Live：双人/单人筛选，直播截图，文字、音频、翻译切换区域。
- `Ctrl+K` / `⌘K` 打开搜索；`Esc` 关闭弹窗。


## 内容维护

基础资料编辑 **`data.js`**；时间表补充记录编辑 **`schedule-data.js`**；三本杂志及采访编辑 **`magazine-data.js`**。不需要修改页面结构即可新增现有类型的档案。

| 数据 | 用途 |
| --- | --- |
| `artists` | 人物名字、写真、简介 |
| `events` | 公开活动/见面会，日期使用 `YYYY-MM-DD` |
| `MagazineArchive`（magazine-data.js） | 杂志封面、画报 `gallery`、问答 `interview.qa`、文章 `interview.sections`；`interview: null` 显示采访待更新 |
| `ScheduleArchive`（schedule-data.js） | 时间表条目、分类 `category`、同日活动 `activities`、多类型 `categories`、来源 `source` |
| `works` | 作品介绍 `text` 与相册 `gallery` |
| `lives` | 直播截图、原文 `transcript`、翻译 `translation`、音频 `audio` |

图片相对于项目根目录填写，如 `resource/Profile/kys_profile.webp`。文件名大小写必须一致；GitHub Pages 区分大小写。新增条目的 `id` 必须唯一。

参与人物 `artist` 的可选值：`both`（双人）、`kys`（金允植）、`psw`（朴时宇）。「双人」与两位单人筛选互斥，单人筛选不会混入双人活动。

音频示例：把文件放入 `audio/` 后填写 `audio: 'audio/2026-09-11.mp3'`，并在 `scripts/build.mjs` 中增加该目录的复制规则。部署工作流只上传构建脚本指定的目录。正文按纯文本显示，不会解析 HTML；换行可用 `\n`。

添加一条活动示例（示例字段需要替换为真实信息）：

```js
{
  id: '唯一活动标识', type: 'fanmeeting', title: '活动名称',
  city: '城市', english: 'City',
  date: '2026-12-01', endDate: '2026-12-01',
  artist: 'both', sessions: 1, image: '',
  description: '活动介绍', venue: '', time: '', source: '公开资料来源'
}
```

目前未提供完整人物履历、势界采访、直播文字、翻译、音频和见面活动场地及开场时间，对应位置已如实显示「待补充」。状态与倒计时按北京时间的日历日期自动更新；导出的行程是全天事件，不会虚构开场时间。

### 时间表整理规则

来源为用户提供的新版 `resource/Schedule/schedule.md`。Schedule 以该文件为准，共 45 个日期，覆盖 2026 年 2 月 5 日至 9 月 20 日。每个日期一条，同日各项活动保留在 `activities` 中，类型筛选匹配 `categories` 中任一类型。原 PDF 的细碎记录、推定日期及页码说明已移除。

见面会与 Live 模块的独立档案仍保留，但不再自动混入 Schedule。修改行程时请同步更新 `schedule-data.js`，并运行 `npm run check`。

### 杂志文字与画报

文字从费加罗两张内页和 LOADING 两张内页转录，调整换行、标点和说话人标签，保留原文内容。`interview.sourceImages` 仅记录校对来源；这些图片不放入 `gallery`，页面也不会把它们作为采访正文展示。`gallery` 包括三张封面和八张摄影内页。

费加罗封面标注 2025 年 8 月刊，而所提供文字页写作年份为 2026；网页保留这处来源差异并提示待核实，不强行统一。势界封面标注 2026 年 9 月。

势界文字补齐时，把 `interview: null` 改成 `{ qa: [...], sections: [...], sourceImages: [...] }`，即可使用现有阅读布局。问答答案结构为 `{ speaker: 'kys' | 'psw', text: '原文' }`，文章章节结构为 `{ title: '标题', paragraphs: ['段落一', '段落二'] }`。

## 发布到 GitHub Pages

项目已经提供 `.github/workflows/pages.yml`，推送到 `main` 分支后可以自动构建与发布。

1. 在 GitHub 建立公开仓库，把项目文件上传到仓库根目录，确保包含隐藏目录 `.github/` 及 `resource/`。
2. 进入仓库 **Settings → Pages → Build and deployment → Source**，选择 **GitHub Actions**。
3. 在 **Actions** 中运行 **Publish to GitHub Pages**，或再次推送到 `main` 触发发布。
4. 部署成功后，Pages 设置页或 Actions 的部署结果会提供公开网站地址。

工作流自动执行检查，将网页与图片构建到 `dist/` 后发布；PRD、测试、维护文档和本地预览文件不会进入网站部署包。若仓库默认分支不是 `main`，请同步修改工作流中的分支名称。

官方说明：[配置 GitHub Pages 发布源](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)、[使用自定义发布工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

也可不使用 Actions，直接选择从 `main` 分支根目录发布；这种方式会把根目录的文档一并作为静态文件公开。

## 检查与构建

```sh
npm run check
npm run build
```

`check` 使用 Node.js 内置测试，验证日期边界、日历格式、搜索及素材引用。`build` 把可发布的网站放入 `dist/`。无需运行 `npm install`。

所有应用资源使用相对路径，页面使用 hash 路由，兼容 `用户名.github.io/仓库名/` 子目录，刷新子页面无需额外服务器规则。

## 文件结构

```text
index.html             页面入口
styles.css             视觉与响应式样式
data.js                可维护的站点内容
schedule-data.js       新版时间表逐日记录
magazine-data.js       双人杂志、采访文字与画报
resource/                   用户提供的原始图片
scripts/               本地预览和构建
tests/                 核心功能测试
.github/workflows/     GitHub Pages 自动部署
```

网站为非官方资料整理站。原始图片版权归对应作者及权利人所有。
