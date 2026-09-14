# StudyHub

> 面向大学生的「课表管理 + DDL待办 + 在线自习室」三位一体学习协作工具

**在线体验**：https://shiny-creponne-7fd1a3.netlify.app

## 解决什么问题

大学生的学习场景存在三个割裂痛点：课表分散在不同APP、DDL容易遗漏、独自学习缺乏动力。StudyHub 将这三个场景整合成一个闭环——从「知道今天上什么课」到「知道最近要交什么」再到「有人陪你一起学」。

## 核心功能

| 模块 | 功能 |
|------|------|
| **仪表盘** | 每日一言、数据统计、今日课表、今日待办、快速番茄钟 |
| **课表** | 周视图7天展示、时间栏可编辑、自主添加课时、OCR图片导入、法定节假日标注 |
| **待办** | Todo List（括号式勾选）、DDL List（日期+朱批红条）、月历双点标记（绿点Todo/红点DDL）、DDL名称显示在月历日期下 |
| **番茄钟** | 6格滑窗、自定义20-180分钟、命名/分类/背景色、专注时长记录、按类别统计 |
| **在线自习室** | 创建/加入/列表排序、腾讯会议式布局（成员网格+音乐栏+聊天面板）、YouTube音乐同步、延迟聊天机制、室主背景管理 |
| **数据分析** | 用户行为埋点、专注时长统计、StudyHub月报、学期末交互式总结 |
| **个性化** | 名言三种模式（固定/随机系统库/随机个人便签库）、便签功能、小组件系统、4种主题切换 |

## 技术栈

- **前端**：HTML / CSS / JavaScript（原生，无框架）
- **认证与数据库**：Firebase Auth（邮箱注册登录）+ Cloud Firestore（实时数据同步）
- **实时通信**：Firestore onSnapshot（自习室成员状态、聊天消息实时更新）
- **音乐同步**：YouTube IFrame API
- **数据导出**：Notion API
- **用户分析**：Firebase Analytics（19个埋点事件）
- **部署**：Netlify

## 项目结构

```
Study-Hub/
├── web/                    # Web版完整应用
│   ├── index.html          # 页面结构
│   ├── style.css           # 三栏式布局 + 主题系统
│   ├── app.js              # 全部交互逻辑（Auth/Firestore/自习室/番茄钟/月历）
│   ├── firebase-config.js  # Firebase 初始化配置
│   ├── analytics.js        # 用户行为埋点
│   ├── youtube-sync.js     # YouTube音乐同步播放
│   ├── notion-export.js    # 导出Todo/DDL到Notion
│   └── email-reminder.js   # DDL邮件提醒
├── prototype/              # 交互原型（v1.0 → v2.0 → v3.0）
│   ├── v1.0prototype.html  # 纯前端验证版
│   ├── v2.0prototype.html  # 协作功能版
│   └── v3.0prototype.html  # 国风社交版
├── PRD.md                  # 产品需求文档 v3.0
└── docs/
    └── decisions.md        # 产品决策记录
```

## 产品迭代历程

| 版本 | 重点 |
|------|------|
| v0.1 | 纯前端原型，验证课表+Todo+DDL核心流程 |
| v0.2 | 引入月历双点标记与番茄钟，完善协作功能 |
| v0.3 | 国风视觉体系 + 在线自习室 + 便签 + 名言库 + 学期规划 + 月报总结 |
| Web版 | Firebase Auth + Firestore实时同步 + 三栏式桌面布局 + 数据分析 |

## 设计规范

- **视觉风格**：宣纸米白底（#F5F0E8）+ 黛青主色（#2D5F5D）+ 朱砂红点缀（#C03C2F）
- **字体**：宋体标题 + 黑体正文
- **交互亮点**：番茄钟6格滑窗、延迟聊天机制、双点月历、可拖拽小组件

## License

MIT
