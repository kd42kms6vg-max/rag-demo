# 企业制度 RAG 问答助手

> 面向**企业内部制度问答**的检索增强生成（RAG）演示项目，已部署上线。
> 技术栈：**Node.js + Vercel Serverless Functions + 通义千问（DashScope）**。
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

- **运行时**：Node.js 22+（**Vercel Serverless Functions**，无 Express、无 LangChain）
- **大模型**：通义千问 DashScope
  - 对话：`qwen-plus`
  - 向量：`text-embedding-v3`（1024 维）
  - 端点：OpenAI 兼容 `https://dashscope.aliyuncs.com/compatible-mode/v1`
  - HTTP 调用：Node 内置 `https` 模块（**零额外网络依赖**）
- **前端**：原生 HTML / CSS / JS；`marked`（ESM）+ `DOMPurify`（UMD）本地化到 `public/vendor/`，**不依赖 CDN**
- **流式协议**：SSE + 浏览器 `EventSource`
- **部署**：Vercel（`vercel.json` 路由重写）

---

## 📁 项目结构

```
rag-demo/
├── api/
│   ├── rag.js            # 主服务：SSE 流式 RAG 问答（混合检索+重排序+记忆+安全设计）
│   ├── reset.js          # 重置指定会话历史
│   ├── health.js         # 健康检查
│   └── _lib/
│       └── sessions.js   # 按 sessionId 隔离对话历史（解决多设备串台）
├── public/
│   ├── index.html        # 聊天界面（书卷风，Markdown 渲染，明暗主题）
│   └── vendor/           # 本地化前端依赖：marked.esm.js / purify.min.js
├── data/
│   └── test.md           # 知识库文档（公司员工手册，8 节）
├── vercel.json           # 路由重写：/ai/rag/stream → /api/rag 等
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

### 2. 部署到 Vercel（推荐，公网可访问）

```bash
vercel              # 首次：登录 + 链接项目
vercel --prod       # 部署到生产环境
```

部署后在 **Vercel Dashboard → Settings → Environment Variables** 添加 `DASHSCOPE_API_KEY`。

> ⚠️ `*.vercel.app` 在中国大陆需 **VPN** 访问；如需国内直连，可绑自定义域名或改用国内平台（如阿里云函数计算 / 腾讯云函数）。

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
  - `data: [DONE]` —— 结束
- `sid` 不传或为空时回退到 `anonymous`（所有匿名用户共享同一会话）；**正式使用务必传唯一 sid**

### `GET /ai/reset?sid=<会话ID>`

- 返回 `{"ok":true}`，孤立该会话历史（旧 sid 不再被后端引用）

### `GET /health`

- 返回 `{"ok":true,"kbReady":false,...}`

---

## 🎓 学习路径（8 步）

| Step | 内容 |
|------|------|
| 1–2 | 环境准备 + 跑通第一次大模型 API 调用 |
| 3–4 | 文档分块 + 向量化与余弦相似度 |
| 5 | RAG 完整链路（检索 → 拼 Prompt → 生成 + 防幻觉） |
| 6 | 前端页面 + 流式输出 + 书卷风设计 |
| 7 | 混合检索 + LLM 重排序 + 多轮记忆 + 会话隔离 + 产品化安全设计 |
| 8 | 部署（Vercel）+ README + 演示视频 |

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
