# 企业制度 RAG 问答助手

> 一个面向**企业内部制度问答**的检索增强生成（RAG）演示项目。
> 技术栈：Node.js + Express + 通义千问（DashScope）+ LangChain.js。
> 用途：学习 RAG 全链路，并作为求职作品集（广深方向：前端友好 / AI 应用岗）。

---

## 📖 项目简介

把公司制度文档（如员工手册）喂给系统，员工用自然语言提问，系统从文档中**检索相关内容**，再由大模型**生成准确答案**。

相比纯聊天机器人，本项目的核心价值是 **RAG 防幻觉**：答案严格基于私有文档，资料里没有的内容一律拒答，绝不编造。

---

## ✨ 核心功能

| 功能 | 说明 |
|------|------|
| **RAG 检索增强** | 分块 → 向量化 → 混合检索(BM25+向量) → LLM 重排序 → 生成答案 |
| **混合检索** | 向量语义检索（懂同义）+ BM25 词法检索（精确词），归一化加权融合 |
| **LLM 重排序** | 候选段落 + 问题交给大模型精排 Top-3，提升准确率（RAG 工程标配） |
| **多轮对话记忆** | 记住最近 6 轮，支持追问与指代消解（"那病假呢""需要提前几天"） |
| **流式输出（SSE）** | 打字机效果，体验更顺 |
| **Markdown 渲染** | 前端用 `marked` + `DOMPurify` 渲染，界面干净、无符号外泄 |
| **意图门槛（防白嫖）** | 检索最高分 < 阈值直接拒答，**不调 LLM，零 token 消耗** |
| **安全话术（防露馅/防跑偏）** | 不暴露 AI 身份、不答无关领域；统一柔和客服风拒答 |
| **无技术细节暴露** | 界面不展示"来源/相似度"等内部信息 |

---

## 🧱 技术栈

- **运行时**：Node.js 22+
- **Web 框架**：Express
- **文档分块**：LangChain.js（`@langchain/textsplitters` 的 `RecursiveCharacterTextSplitter`）
- **大模型**：通义千问 DashScope
  - 对话：`qwen-plus`
  - 向量：`text-embedding-v3`（1024 维）
  - 端点：OpenAI 兼容 `https://dashscope.aliyuncs.com/compatible-mode/v1`
- **前端渲染**：`marked`（ESM）+ `DOMPurify`（UMD），本地化到 `public/vendor/`，**不依赖 CDN**
- **流式协议**：Server-Sent Events（SSE）+ 浏览器 `EventSource`

---

## 📁 项目结构

```
rag-demo/
├── rag-advanced.js     # 主服务：混合检索 + 重排序 + 对话记忆 + 产品化安全设计
├── rag-stream.js       # 早期流式版本（保留作对比）
├── rag.js              # Step 5 完整 RAG 链路（非流式）
├── embeddings.js       # Step 4 Embedding + 余弦相似度演示
├── chunker.js          # Step 3 分块演示
├── server.js           # Step 2 基础聊天接口
├── public/
│   ├── index.html      # 聊天界面（编辑书卷风，Markdown 渲染，无来源暴露）
│   └── vendor/         # 本地化前端依赖：marked.esm.js / purify.min.js
├── data/
│   └── test.md         # 知识库文档（公司员工手册，8 节）
├── .env                # DASHSCOPE_API_KEY=你的Key（已 gitignore，勿提交）
├── package.json
└── README.md
```

---

## 🚀 快速开始

### 1. 环境
- 安装 **Node.js 22+**
- 申请通义千问 API Key（阿里云百炼平台，新用户有免费额度）

### 2. 安装依赖
```bash
npm install
```

### 3. 配置密钥
项目根目录创建 `.env` 文件：
```
DASHSCOPE_API_KEY=你的_api_key
```
（或直接写入环境变量）

### 4. 启动
```bash
node rag-advanced.js
```
启动后会自动加载 `data/test.md` 并构建向量库，监听 `http://localhost:8080`。

### 5. 使用
浏览器打开 `http://localhost:8080`，在输入框提问，例如：
- "年假有多少天？"
- "请病假需要什么手续？"
- "那病假工资怎么算？"（多轮追问）

---

## ⚙️ 配置项

| 配置 | 位置 | 说明 |
|------|------|------|
| `DASHSCOPE_API_KEY` | `.env` | 必填，通义千问鉴权 |
| `RELEVANCE_THRESHOLD` | `rag-advanced.js` | 意图门槛，默认 `0.12`；低于此分直接拒答不调 LLM |
| `MAX_HISTORY` | `rag-advanced.js` | 多轮记忆上限（默认 6 轮） |
| `CHUNK_SIZE` / `CHUNK_OVERLAP` | `rag-advanced.js` | 分块大小 / 重叠（默认 500 / 100） |
| 知识库文档 | `data/test.md` | 替换为你的制度文档即可换领域 |

---

## 🔌 API

**GET** `/ai/rag/stream?question=<你的问题>`

- 响应：`text/event-stream`（SSE）
- 事件类型：
  - `data: {"type":"content","content":"..."}` —— 逐字内容（打字机）
  - `data: [DONE]` —— 结束
- 前端示例见 `public/index.html`（`EventSource` 接收）。

---

## 🎓 学习路径（8 步）

| Step | 内容 |
|------|------|
| 1–2 | 环境准备 + 跑通第一次大模型 API 调用 |
| 3–4 | 文档分块 + 向量化与余弦相似度 |
| 5 | RAG 完整链路（检索→拼 Prompt→生成+防幻觉） |
| 6 | 前端页面 + 流式输出 + 书卷风设计 |
| 7 | 混合检索 + LLM 重排序 + 多轮对话记忆 + 产品化打磨 |
| 8 | 部署 + README + 演示视频（本文件） |

详细知识点与进度见 `RAG项目_学习路线与进度.md`（项目外学习文档）。

---

## 📌 生产化建议（Demo 之外的进阶方向）

本项目为**教学/作品集 Demo**，若要上生产还需补充：

- 向量库持久化（当前每次启动重建） → 接 Chroma / pgvector / Milvus
- 文档解析：支持 PDF / Word / 网页，而非仅 Markdown
- 鉴权与限流：防止 API Key 被盗刷
- 语义缓存：高频问题直接命中，降本增效
- 可观测：token 用量、回答质量监控
- 多知识库 / 多租户隔离

---

## 🚢 部署到 Render（云端 · 免费层）

本项目是 **Node.js 常驻服务**，可一键部署到 [Render](https://render.com) 免费层，对外提供公网访问。

1. 把项目推到 GitHub 仓库。**务必确认 `.env` 已被 `.gitignore` 忽略，切勿提交 API Key**（仓库根已配置）。
2. Render 控制台 → **New → Blueprint**，选择该仓库，Render 会读取根目录 `render.yaml` 自动配置（`npm install` 构建、`node rag-advanced.js` 启动）。
3. 在 Render 服务的 **Environment** 中手动填入环境变量 `DASHSCOPE_API_KEY`（值为你的通义千问 Key）。该值 `sync: false`，**不进仓库**。
4. Deploy 完成后，Render 分配 `https://rag-demo-xxxx.onrender.com` 公网地址即可访问。

> ⚠️ 注意：Render 免费 Web 服务空闲约 15 分钟后会休眠，首次访问有数秒冷启动，属正常现象；如需常驻请升级付费 plan。

---

## 📄 许可

仅用于学习与求职演示，请勿用于未授权的商业用途。
# rag-demo
