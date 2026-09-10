# 企业制度 RAG 问答助手

> 面向**企业内部制度问答**的检索增强生成（RAG）演示项目，已部署上线。
>
> **🌐 在线体验：<https://rag-demo-v2.icu>**（自定义域名 + HTTPS）
>
> 技术栈：**Node.js + 通义千问（DashScope）**，主部署于腾讯云 **EdgeOne Pages**（另含 Vercel Serverless 版）。
> 用途：学习 RAG 全链路，并作为求职作品集（广深方向：前端友好 / AI 应用岗）。

---

## 📖 项目简介

把公司制度文档（如员工手册）喂给系统，员工用自然语言提问，系统从文档中**检索相关内容**，再由大模型**生成准确答案**。

核心价值是 **RAG 防幻觉**：答案严格基于私有文档，资料里没有的内容一律拒答，绝不编造。

---

## ✨ 核心功能

| 功能 | 说明 |
|------|------|
| **RAG 检索增强** | 分块 → 向量化 → 混合检索(BM25+向量) → LLM 重排序 → 生成答案 |
| **混合检索** | 向量语义检索（懂同义）+ BM25 词法检索（精确词），归一化加权融合（0.6 / 0.4） |
| **LLM 重排序** | 候选段落交给 `qwen-plus` 精排 Top-3，提升准确率（RAG 工程标配） |
| **可溯源引用** | 每条回答附 Top-3 命中片段与混合检索得分；**拒答时同样展示**，能解释"为什么答不上" |
| **检索耗时透明** | SSE 实时推送向量化 / 混合打分 / LLM 重排的分段耗时，检索全程可观测 |
| **多轮对话记忆** | 每个会话独立保留最近 6 轮，支持追问与指代消解（"那病假呢"） |
| **会话隔离** | 按 `sessionId` 隔离对话历史，多用户 / 多设备**不串台** |
| **流式输出（SSE）** | 打字机效果，体验更顺 |
| **状态 / 内容分离** | "初始化中"等状态走 `type:'status'` 独立状态栏，不混入正式答案 |
| **Markdown 渲染** | 前端用 `marked` + `DOMPurify` 渲染，界面干净、防 XSS |
| **意图门槛（防白嫖）** | 检索最高分 < 阈值直接拒答，**不调 LLM，零 token 消耗** |
| **安全话术** | 不暴露 AI 身份、不答无关领域；统一柔和客服风拒答 |
| **明暗主题切换** | 切换并持久化到 `localStorage` |
| **"新对话"重置** | 前端轮换 `sessionId`，后端孤立旧会话 |

---

## 🧱 技术栈

- **运行时**：Node.js 22+（Serverless Functions：EdgeOne / Vercel，无 Express、无 LangChain）
- **大模型**：通义千问 DashScope
  - 对话：`qwen-plus`
  - 向量：`text-embedding-v3`（1024 维）
  - 端点：OpenAI 兼容 `https://dashscope.aliyuncs.com/compatible-mode/v1`
  - HTTP 调用：Node 内置 `https` 模块（**零额外网络依赖**）
- **前端**：原生 HTML / CSS / JS；`marked`（ESM）+ `DOMPurify`（UMD）本地化到 `public/vendor/`，**不依赖 CDN**
- **流式协议**：SSE + 浏览器 `EventSource`
- **部署**：腾讯云 **EdgeOne Pages**（当前线上，自定义域名 `rag-demo-v2.icu`）；`api/` 目录保留 **Vercel Serverless** 版本（`vercel.json` 路由重写）

---

## 📁 项目结构

```
rag-demo/
├── index.html            # 聊天界面（书卷风，Markdown 渲染，明暗主题）← 线上使用
├── vendor/               # 本地化前端依赖：marked.esm.js / purify.min.js（线上使用）
├── node-functions/       # EdgeOne Pages Node Functions（当前线上运行）
│   └── ai/rag/
│       └── stream.js     # 主服务：SSE 流式 RAG 问答（混合检索+重排序+记忆+安全设计）
├── api/                  # Vercel Serverless 版（功能相同）
│   ├── rag.js / reset.js / health.js
│   └── _lib/
│       └── sessions.js   # 按 sessionId 隔离对话历史（解决多设备串台）
├── public/               # Vercel 版静态资源
│   ├── index.html
│   └── vendor/
├── data/
│   └── test.md           # 知识库文档（公司员工手册，8 节）
├── vercel.json           # Vercel 路由重写：/ai/rag/stream → /api/rag 等
├── package.json
└── README.md
```

> 旧版 Express / LangChain / 阿里云 FC 部署代码已归档至 `_archive/`，**不参与运行**。

---

## 🚀 快速开始

### 1. 本地开发

需要 Node.js 22+ 与 Vercel CLI：

```bash
npm i -g vercel
export DASHSCOPE_API_KEY=你的_api_key      # macOS / Linux
# set DASHSCOPE_API_KEY=你的_api_key       # Windows PowerShell
vercel dev                                 # 本地启动，访问 http://localhost:3000
```

### 2. 部署到腾讯云 EdgeOne Pages（当前线上方式）

在 [EdgeOne 控制台](https://console.cloud.tencent.com/edgeone/makers) 连接 GitHub 仓库，构建配置：

| 配置项 | 值 |
|--------|-----|
| 构建命令 | 留空 |
| 输出目录 | `./` |
| 环境变量 | `DASHSCOPE_API_KEY` |

`node-functions/` 目录自动识别为 Node Functions（SSE 流式端点）；绑定自定义域名后免费 HTTPS 证书自动签发。

> ⚠️ 未备案站点加速区域需选「全球可用区（不含中国大陆）」，国内访问存在跨境延迟（首屏实测 1~2s）；完成 ICP 备案后可切国内节点根治。

<details>
<summary>备选：部署到 Vercel</summary>

```bash
vercel              # 首次：登录 + 链接项目
vercel --prod       # 部署到生产环境
```

部署后在 **Vercel Dashboard → Settings → Environment Variables** 添加 `DASHSCOPE_API_KEY`。
`*.vercel.app` 在中国大陆需 **VPN** 访问。

</details>

### 3. 使用

浏览器打开站点，在输入框提问，例如：

- "年假有多少天？"
- "请病假需要什么手续？"
- "那病假工资怎么算？"（多轮追问）

---

## ⚙️ 配置项

| 配置 | 位置 | 说明 |
|------|------|------|
| `DASHSCOPE_API_KEY` | Vercel 环境变量 / `.env` | 必填，通义千问鉴权 |
| `THRESHOLD` | `api/rag.js:204` | 意图门槛，默认 `0.12`；低于此分直接拒答不调 LLM |
| 融合权重 | `api/rag.js:161` | 向量 / BM25 = `0.6 / 0.4` |
| `MAX_HISTORY` | `api/rag.js:169` | 多轮记忆窗口（最近 6 轮） |
| `CHUNK_SIZE` / `OVERLAP` | `api/rag.js:124` | 分块 300 / 重叠 50 |
| 知识库文档 | `data/test.md` | 替换为你的制度文档即可换领域 |

---

## 🔌 API

### `GET /ai/rag/stream?question=<问题>&sid=<会话ID>`

- 响应：`text/event-stream`（SSE）
- 事件类型：
  - `data: {"type":"status","content":"..."}` —— 状态提示（如"正在初始化知识库"），前端单独渲染，**不混入答案**
  - `data: {"type":"content","content":"..."}` —— 逐字内容（打字机）
  - `data: {"type":"stats","embedMs":...,"hybridMs":...,"rerankMs":...,"totalMs":...}` —— 检索分段耗时
  - `data: {"type":"sources","sources":[{"no":1,"score":0.87,"excerpt":"..."}]}` —— Top-3 命中片段与得分（拒答时也发送）
  - `data: [DONE]` —— 结束
- `sid` 不传或为空时回退到 `anonymous`（所有匿名用户共享同一会话）；**正式使用务必传唯一 sid**

### `GET /ai/reset?sid=<会话ID>`

- 返回 `{"ok":true}`，孤立该会话历史（旧 sid 不再被后端引用）

### `GET /health`

- 返回 `{"ok":true,"ts":...,"hasKey":true}`（服务存活 / 时钟正常 / API Key 已配置）；Vercel 版返回含 `kbReady`

---

## 🎓 学习路径（8 步）

| Step | 内容 |
|------|------|
| 1–2 | 环境准备 + 跑通第一次大模型 API 调用 |
| 3–4 | 文档分块 + 向量化与余弦相似度 |
| 5 | RAG 完整链路（检索 → 拼 Prompt → 生成 + 防幻觉） |
| 6 | 前端页面 + 流式输出 + 书卷风设计 |
| 7 | 混合检索 + LLM 重排序 + 多轮记忆 + 会话隔离 + 产品化安全设计 |
| 8 | 部署（EdgeOne Pages + 自定义域名）+ README + 演示视频 |

---

## 📌 生产化建议（Demo 之外的进阶方向）

本项目为**教学 / 作品集 Demo**，若要上生产还需补充：

- **向量库持久化**：当前每次冷启动都重新 `initKB()` 全量向量化（`api/rag.js:119-132`），且全局 `vectorStore` 在所有会话间共享。
- **状态外置**：当前 `sessions`（对话历史）与 `vectorStore`（向量库）都是**函数实例内存**，Vercel 多实例 / 冷启动会导致丢失或不一致；生产应放 Redis / 托管向量库（Chroma / pgvector / Milvus）。
- **多格式 ingestion**：支持 PDF / Word / 网页，而非仅 Markdown。
- **鉴权与限流**：公网部署后防 API Key 被盗刷。
- **语义缓存 / 可观测**：高频问题直接命中降本；token 用量、回答质量（RAGAS）监控。
- **多租户隔离**：不同企业 / 知识库的数据与配额隔离。

---

## 📄 许可

仅用于学习与求职演示，请勿用于未授权的商业用途。
