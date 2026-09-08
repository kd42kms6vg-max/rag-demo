# Java 实习备考进度（已按真实「我的情况」重排）

> 真实背景：大四在读 / Java 基础薄弱 / 想进 AI 行业 / 时间紧。双轨统一：AI 应用开发为主能力 + Java 技术栈承载。
> 三段式：上午理论(10-12) / 下午实战(14-18) / 晚上复盘(19-20)
> 原则：只给要点与提示，代码与答案必须自己写——治"依赖AI"短板
> 格式：[x] 完成  [ ] 未完成  [~] 进行中
> ⚠️ 此前按"Java扎实"排的 HashMap 起步计划已作废，本文件为正确起点。

---

## Day 1 — 2026-08-12（第1周·AI应用开发核心 + Java基础）
**主题：AI 应用开发全景 + 用费曼法复盘你自己的 RAG demo**

### 上午 10:00-12:00 理论精学 [~]
- [ ] 搞清"AI 应用开发"是什么：LLM API / Prompt / RAG / Agents 四件套的关系
- [ ] **费曼复盘自己的 demo**：不查资料，徒手画出 RAG 数据流图（问题→分块→向量化→检索→重排序→LLM→SSE 返回）
- [ ] 要点自测：能说出"为什么用混合检索""为什么加重排序""为什么设意图门槛"

**今日要点（自己展开）：**
1. RAG = 检索增强生成，用私有知识约束大模型"幻觉"
2. Embedding 把文本变向量，余弦相似度衡量语义相近
3. 混合检索 = 向量(懂同义) + BM25(精确词)，加权融合更稳
4. Rerank = 用大模型对候选精排，提准
5. SSE = 服务端单向推流，适合打字机效果
6. 意图门槛 = 分数不够不调 LLM，拒答零成本
7. AI 应用开发 ≠ 训练模型，是"把 LLM 落地成功能"
8. 你的 demo 已是标准 AI 应用作品，这是你的差异化卖点

**资料方向：** 搜「RAG 是什么 数据流图」；重读自己 `api/rag.js` 的 `retrieve()` / `llmRerank()`

### 下午 14:00-18:00 实战 [ ]
- [ ] **Java 基础 Day1**：变量/类型/流程控制/类与对象/OOP 四大特性概念梳理（看教材前先自己说一遍）
- [ ] LeetCode 1 两数之和 —— **用 Java 写**（练语法 + 哈希表）
  - 提示：HashMap 存「值→下标」，边遍历边查，O(n)
- [ ] 可选：在 demo 里故意把融合权重 0.6/0.4 反过来，看回答怎么变（建因果感）

### 晚上 19:00-20:00 复盘 [ ]
- [ ] 话术练习：面试官问"介绍一下你的项目"，你 90 秒怎么讲（STAR：情境/任务/行动/结果）
- [ ] 错题重做：上午 RAG 数据流图补画完整
- [ ] 本文件打勾 + 写明日主题

---

## Day 2 — 2026-08-13（第1周·AI应用开发核心 + Java基础）✓ 已推送
**主题：LLM API 调用原理 + Prompt 工程 + Java 集合/异常基础**

### 上午 10:00-12:00 理论精学 [ ]
- [ ] 搞清 LLM API 调用本质：API Key / 模型名 / messages(system+user) 三件套
- [ ] Prompt 工程四招：角色设定 / few-shot 示例 / 清晰指令 / 输出格式约束
- [ ] **费曼复盘**：读你 demo 里调 LLM 的那段代码（`api/rag.js` 的 `llmAnswer`/chat completion），说清它怎么把"检索上下文+问题"拼进 prompt

**今日要点（自己展开）：**
1. LLM API 不是"问一句答一句"，而是传一个 messages 数组，模型返回 completion
2. system 消息设人设与硬约束，user 消息传用户输入——顺序与分工别混
3. temperature 控随机（0严谨/1发散）；max_tokens 限长度；top_p 控候选池
4. RAG 里 prompt = "参考下面上下文 + 用户问题 + 要求只依据上下文答"
5. Prompt 工程核心：把"模糊期望"变成"可执行指令"——加示例比加形容词有用
6. 流式调用 = SSE，边生成边收 token，你 demo 打字机效果就靠它
7. 你 demo 用 DashScope（阿里通义），走 OpenAI 兼容协议——换家厂商只改 base_url
8. 坏 prompt（"帮我回答"）vs 好 prompt（角色+上下文+约束+格式）差距巨大

**资料方向：** 看 OpenAI Chat Completions 的 messages 结构；重读 `api/rag.js` 里拼 prompt 与调接口那几行

**手写/画图任务：** 画一张「bad prompt vs good prompt」对照图——用你 demo 真实的 system prompt 当 good 范例，自己编一个 bad 版，标出差异点

### 下午 14:00-18:00 实战 [ ]
- [ ] **Java 基础 Day2**：集合框架（List/Set/Map 三族 + ArrayList/HashSet/HashMap 常用 API）+ 异常（try-catch-finally / throw / 常见 RuntimeException）
  - 提示：先不看书，自己说清 List vs Set 区别、HashMap 怎么 put/get、checked vs unchecked 异常
- [ ] LeetCode（用 Java 写，给题号+提示，不写答案）：
  - **LC 20 有效的括号** —— 栈经典题。提示：左括号压栈，右括号弹栈比对，最后栈空才合法
  - **LC 125 验证回文串** —— 双指针。提示：左右指针向中间夹，跳过非字母数字，比大小写
- [ ] 项目编码：读 `api/rag.js` 找"调 LLM 那几行"，用 Java 写 `/api/qa` Controller **骨架**（只写方法签名+注释，不写完整实现）：入参、调 DashScope、返回 SSE 的三段

### 晚上 19:00-20:00 复盘 [ ]
- [ ] 话术练习：面试官问"你为什么选 Java + AI 应用开发"，你 30 秒答（结合：Java 实习好投 + 自己有 RAG demo + 想进 AI 行业）
- [ ] 错题重做：上午的 bad/good prompt 对照图补全；LC20 栈逻辑在纸上走一遍
- [ ] 本文件打勾 + 写明日主题

---

## Day 3 — 2026-08-14（第1周·AI应用开发核心 + Java基础）✓ 已推送
**主题：RAG 原理深化（召回/混合检索/重排序）+ Java OOP 深入（封装/继承/多态/接口）**

### 上午 10:00-12:00 理论精学 [ ]
- [ ] Embedding 语义向量：同一句"怎么退款"和它的同义问法，在向量空间里距离近——这就是"懂语义"的本质
- [ ] 向量检索召回 top-k：相似度排序取前 k 条，k 太大噪声多、太小漏信息（你 demo 取的多少？去代码里确认）
- [ ] 混合检索权衡：向量(召回广、懂同义) + BM25(精确词命中) 加权融合；你 demo 权重 0.6/0.4 凭什么这么分？自己给理由
- [ ] 重排序(Rerank)原理：用交叉编码器把"问题与每条候选"拼一起打分，比"各自算相似度"更准——精排提准
- [ ] **费曼复盘 demo 的 retriever**：不查资料，说清 `api/rag.js` 的 `retrieve()` 里「向量召回→BM25召回→融合→top-k→rerank」每一步的输入输出

**今日要点（自己展开）：**
1. 召回(粗排)解决"找得全"，重排序(精排)解决"排得准"——两阶段是 RAG 标配
2. 余弦相似度只看方向不看长度；归一化很重要
3. 混合检索的融合分数 = w1·向量分 + w2·BM25分（需先各自归一化到同量纲）
4. Rerank 模型比 Embedding 模型小、慢但准，只排几十条例，成本可控
5. 加权权重没有"标准答案"，靠在自有语料上测——这是你 demo 的调参故事点
6. OOP 四大特性：封装(隐藏实现)、继承(复用)、多态(同接口异行为)、抽象(提接口降复杂度)
7. 接口 vs 抽象类：接口是多实现"能做什么"，抽象类是"是什么"的单继承骨架
8. getter/setter 不是多余——封装靠它控访问、加校验、保不变式

**资料方向：** 搜「RAG 混合检索 rerank 两阶段」；重读 `api/rag.js` 的 `retrieve()` / `llmRerank()` 逐行

**手写/画图任务：** 画「混合检索融合」数据流图——左侧向量召回集合 + 右侧 BM25 召回集合 → 加权打分 → 取 top-k → 重排序 → LLM；在你 demo 的权重位置(0.6/0.4)打标并写一句"为什么"

### 下午 14:00-18:00 实战 [ ]
- [ ] **Java OOP Day3（纯手写，不抄）**：写 `Student` / `Course` 类体现封装；再写 `Person` 抽象类 + `Student`/`Teacher` 继承体现多态；用接口 `Gradeable` 定义"能算绩点"
  - 提示：先不看书，自己写成员变量+构造器+getter/setter；继承用 `extends`，多态靠 `@Override` 父类方法
- [ ] LeetCode（用 Java 写，给题号+提示，不写答案）：
  - **LC 169 多数元素** —— 哈希计数 or 摩尔投票。提示：摩尔投票"不同相消"，遍历一遍找候选，O(n) 无哈希；或 HashMap 计数找 > n/2 的
  - **LC 242 有效的字母异位词** —— 数组计数。提示：开 26 长度 int[] 统计两串字母频次，最后逐位比对相等
- [ ] 项目编码：读 `api/rag.js` 的 `retrieve()` + `llmRerank()`，用 Java 写一个 `DocumentRetriever` 类**骨架**（只写方法签名+注释，不写实现）：`hybridSearch()`、`rerank()`、返回 `List<Doc>`

### 晚上 19:00-20:00 复盘 [ ]
- [ ] 话术练习：面试官问"你的 RAG 为什么要用重排序、为什么混合检索"，你 30 秒答（结合：召回广+精排准、自调权重的故事）
- [ ] 错题重做：上午混合检索图补全；LC169 摩尔投票在纸上走两遍
- [ ] 本文件打勾 + 写明日主题

---

## Day 4 — 2026-08-15（第1-2周·AI应用开发核心 + Java基础）✓ 已推送
**主题：向量库落地（Chroma/pgvector 与 Embedding 存储检索）+ Java 泛型与 equals/hashCode**

### 上午 10:00-12:00 理论精学 [ ]
- [ ] 为什么需要向量库：Embedding 是 float[]，内存里存几万条文档向量，每次查询要全量算余弦——库帮你做"索引 + 近似检索(ANN)"，快且能持久化
- [ ] Chroma 是什么：轻量本地向量库，Collection 存 (id, embedding, metadata, document)，支持 upsert/query；适合你本地 demo 起步
- [ ] pgvector 是什么：PostgreSQL 插件，把向量当列存，能用 SQL 查 + 过滤 metadata；你 demo 若上云/接 Java 后端，这是顺路选项
- [ ] ANN 近似最近邻 vs 精确：HNSW 图索引，牺牲一点精度换百倍速度——理解"为什么检索是近似的"
- [ ] **费曼复盘**：你 demo 现在是"启动时内存算余弦"还是"用了向量库"？说清如果不上库，文档变多会卡在哪

**今日要点（自己展开）：**
1. 向量库 = 存 embedding + 建索引 + 提供 query 接口的三件套
2. 余弦相似度要先把向量归一化（L2 norm=1），否则长度干扰结果
3. Chroma 的 query 返回 (ids, distances, documents, metadatas) —— 和你 demo 的 retrieve 输出一一对应
4. metadata 过滤：先按"文档来源/时间"筛，再算相似度——缩小检索域，提准又提快
5. pgvector 用 `<=>` 算子算余弦距离，`ORDER BY embedding <=> query LIMIT k`
6. Java 泛型 `<T>`：集合里存的是对象不是原始类型，泛型让编译期就拦住类型错
7. `equals()` 和 `hashCode()` 必须成对重写：HashMap 先比 hashCode 定位桶，再比 equals 确认——只改一个必出 bug
8. 你 demo 的文档若用 Java 对象存，equals/hashCode 写错会让"去重/检索" silently 失效

**资料方向：** 搜「Chroma quickstart upsert query」「pgvector 用法」「为什么重写 equals 必须重写 hashCode」；对照 `api/rag.js` 的向量存取部分

**手写/画图任务：** 画「内存朴素检索 vs 向量库检索」对比图——左：全量遍历算余弦(红字标"O(n·d)，n 大就崩")；右：建索引→ANN 查询(标"HNSW 图，毫秒级")；底部写一句"什么时候该上向量库"

### 下午 14:00-18:00 实战 [ ]
- [ ] **Java 泛型 + equals/hashCode（纯手写，不抄）**：定义 `EmbeddingDoc` 类（字段 id:String, vector:float[], text:String, source:String）；自己重写 `equals()` 和 `hashCode()`（hashCode 用 `Objects.hash(id, source)` 即可），并写一个泛型方法 `List<T> filterBy(List<T> list, Predicate<T> p)`
  - 提示：先不看书，想清"为什么 vector 用 float[] 不用 List"；重写时 IDE 生成的也行，但要能解释每行
- [ ] LeetCode（用 Java 写，给题号+提示，不写答案）：
  - **LC 217 存在重复元素** —— HashSet。提示：边遍历边 add，add 返回 false 即撞上重复，O(n)
  - **LC 349 两个数组的交集** —— 双 HashSet。提示：小的那个转 set，遍历另一个查 contains，结果丢进 Set 去重
  - **LC 387 字符串中的第一个唯一字符** —— 哈希计数。提示：int[26] 或 HashMap<Character,Integer> 统计频次，再扫一遍找第一个 count==1 的
- [ ] 项目编码：用 Java 写 `VectorStore` 类**骨架**（只写方法签名+注释，不写实现）：`void upsert(EmbeddingDoc doc)`、`List<EmbeddingDoc> query(float[] q, int k)`、`List<EmbeddingDoc> queryWithFilter(float[] q, int k, String source)` —— 把上午向量库概念映射成 Java API

### 晚上 19:00-20:00 复盘 [ ]
- [ ] 话术练习：面试官问"RAG 为什么要引入向量库、你 demo 现在怎么存的"，你 30 秒答（结合：文档规模/检索速度/持久化，诚实说 demo 现状+改进方向）
- [ ] 错题重做：上午"内存 vs 向量库"对比图补全；LC217/349 在纸上走一遍 HashSet 流程
- [ ] 本文件打勾 + 写明日主题

---

## Day 5 — 2026-08-16（第1-2周·AI应用开发核心 + Java基础）✓ 已推送
**主题：Agents / Function Calling 原理 + Java Lambda 与函数式接口（为工具定义打底）**

### 上午 10:00-12:00 理论精学 [ ]
- [ ] 搞清 Function Calling 本质：LLM 不直接执行代码，而是"输出结构化的『函数名+参数 JSON』"，由你的后端去真正调用函数——LLM 当"调度大脑"
- [ ] Agents 是什么：给 LLM 一组工具 + 循环（思考→调工具→看结果→再思考），直到任务完成——你 demo 的 RAG 是"单一检索工具"的雏形
- [ ] 三件套：tools 描述（JSON Schema 声明函数名/参数/类型）+ LLM 返回的 tool_calls + 你执行后把结果回填 messages
- [ ] **费曼复盘**：你 demo 的 `/api/qa` 现在要加"查订单"工具，数据流怎么变？说清"LLM 决定调哪个工具、参数为何"这件事它自己会做

**今日要点（自己展开）：**
1. Function Calling ≠ LLM 跑代码，是 LLM 返回"该调哪个函数+什么参数"，执行权在你
2. tools 描述本质是 JSON Schema：name / description / parameters(properties+required+type)
3. 一次请求流程：user → LLM(带 tools) → 返回 tool_calls → 你执行 → 结果 append 进 messages → 再请求 LLM → 最终答案
4. Agents = LLM + 工具 + 循环决策，能多步拆解任务（RAG 只是其中一类"检索工具"）
5. 参数类型要收敛（string/number/boolean/enum），别让 LLM 自由发挥——Schema 越严越稳
6. Java Lambda：`(args) -> { body }`，把"行为"当参数传——正好对应"把一个工具函数注册进工具箱"
7. 函数式接口 = 只有一个抽象方法的接口（`@FunctionalInterface`），`Predicate`/`Function`/`Consumer` 都是现成的
8. `Optional<T>` 显式表达"可能没值"，替代满地 null——工具执行结果用它包一层更安全

**资料方向：** 看 OpenAI Function Calling 的 tools 参数结构（`type:function` + `function.parameters`）；重读你 demo `api/rag.js` 看哪里已经是"LLM 决定动作"的雏形

**手写/画图任务：** 画「Function Calling 数据流图」——user提问 → 带tools请求LLM → 返回tool_calls(函数名+JSON参数) → 你后端dispatch执行函数 → 结果回填messages → 再请求LLM → 最终流式回答；在"你后端执行"那一步用红框标出"这里是 Java 代码真正干活的地方"

### 下午 14:00-18:00 实战 [ ]
- [ ] **Java Day5（纯手写，不抄）**：定义函数式接口 `ToolHandler`（`@FunctionalInterface`，方法 `String handle(Map<String,Object> args)`）；用 `Map<String, ToolHandler> registry` 注册两个工具（lambda 写法：`registry.put("getOrder", args -> {...})`）；用 `Optional<String>` 包住工具执行结果，空时返回兜底话术
  - 提示：先不看书，想清"为什么工具用 Map 注册 + lambda，而不是写一堆 if-else"；Optional 的 `.orElse()` 怎么用
- [ ] LeetCode（用 Java 写，给题号+提示，不写答案）：
  - **LC 13 罗马数字转整数** —— HashMap 映射。提示：建符号→值 map；从左到右，当前值 < 右邻则减、否则加
  - **LC 290 单词规律** —— 双 HashMap 双向映射。提示：pattern 字符 ↔ word 必须一一对应；任一边撞上不同映射即 false
  - **LC 383 赎金信** —— 哈希计数。提示：magazine 字母频次 ≥ ransomNote 才行；int[26] 或 HashMap 计数后逐位比对
- [ ] 项目编码：读 demo 的 `api/rag.js`，把"RAG 检索"抽象成一个 Java `FunctionTool` 接口 + `ToolExecutor` 类**骨架**（只写方法签名+注释）：`registerTool(FunctionTool t)`、`ToolCallResult execute(String name, Map<String,Object> args)`、`List<ToolDef> describeTools()` —— 把上午 Schema 概念映射成 Java API

### 晚上 19:00-20:00 复盘 [ ]
- [ ] 话术练习：面试官问"什么是 Function Calling / Agents，你 demo 和它什么关系"，你 30 秒答（结合：LLM 当调度大脑、RAG 是雏形、Java 后端真正执行工具）
- [ ] 错题重做：上午 Function Calling 数据流图补全；LC13 在纸上走一遍 "MCMXCIV"
- [ ] 本文件打勾 + 写明日主题

---

## Day 6 — 2026-08-17（第1-2周收口·AI四件套串联 + Java常用类/枚举/单测启蒙）✓ 已推送
**主题：把 LLM API / Prompt / RAG / Agents 串成完整 AI 应用认知 + Java 常用类(String/StringBuilder/enum) 与单测启蒙**

### 上午 10:00-12:00 理论精学 [ ]
- [ ] AI 四件套串联：一个真实 AI 应用 = ① Prompt 组装上下文 ② 调 LLM API 拿生成 ③ 必要时走 RAG 检索私有知识 ④ 复杂任务触发 Function Calling/Agent 循环——四块不是并列，是"问题进来后按需要接力"
- [ ] 用你 demo 对号入座：哪段是 Prompt 拼装(`api/rag.js` 拼 system+context+question)、哪段是 LLM API(`llmAnswer`/SSE)、哪段是 RAG(`retrieve`)、哪段已是 Agent 雏形(意图门槛决定"调不调 LLM")
- [ ] Java 常用类：String 不可变 vs StringBuilder 可变（拼接 prompt 用哪个？大量 + 循环拼接为什么必须用 StringBuilder）
- [ ] 枚举 enum：给 LLM messages 的 role(SYSTEM/USER/ASSISTANT)、或工具类型定义一组"固定常量"——比裸 String 安全、好维护
- [ ] 单测启蒙：JUnit `@Test` 测"纯函数"（如 `hybridScore()`、`isPalindrome()`）——先建立"写代码顺手测一下"的习惯，后面项目深化周要用

**今日要点（自己展开）：**
1. 四件套的"总控"逻辑：RAG 是 Agent 的一种工具；Agent 是"LLM+工具+循环"，不是新物种
2. 你 demo 已覆盖：Prompt✓ / LLM API✓ / RAG✓ / 意图决策(准Agent)✓ —— 这就是面试能讲的"完整 AI 应用"
3. String `+` 在循环里会生成大量中间对象(性能陷阱)；StringBuilder 复用缓冲区
4. enum 本质是个"有限个实例的类"，可带字段和方法（`enum Role { SYSTEM("system"), ... }`）
5. 单元测试 = 用断言验证"给定输入得预期输出"，让你改代码不慌——AI 应用也得测
6. 数据流闭环：问题 → (意图判断) → 检索/RAG? → 拼 Prompt → 调 LLM → (要调工具? → 执行→回填) → 流式返回
7. 你 demo 的"意图门槛"就是 Agent 的"决策点"：分数够才进 LLM，不够直接拒——这就是"思考后行动"
8. 收口目标：下周能开口说出"我做的 AI 应用 = 这四块，我的 demo 全有"，不卡壳

**资料方向：** 重读 `api/rag.js` 全链路（`retrieve`→拼 prompt→`llmAnswer`→SSE）；搜「JUnit 5 快速上手」「Java enum 带字段」

**手写/画图任务：** 画「AI 应用四件套全景图」——顶部"用户问题"进来；箭头分叉标出 ①Prompt拼装 ②LLM API ③RAG检索 ④Function Calling/Agent循环 四个模块；在每模块旁用括号标注"你 demo 对应哪段代码"；底部画一条主线箭头串起完整闭环，红字标出"决策点=意图门槛"

### 下午 14:00-18:00 实战 [ ]
- [ ] **Java 常用类 + enum（纯手写，不抄）**：定义 `enum Role { SYSTEM, USER, ASSISTANT }`；定义 `Message` 类(role:Role, content:String)；手写一个 `PromptBuilder` 用 StringBuilder 把 system 提示 + 检索到的若干 context 段落 + 用户问题拼成最终 prompt 字符串（只写方法体骨架+注释，逻辑自己填）
  - 提示：先不看书，想清"为什么 role 用 enum 不用 String""为什么拼 context 用 StringBuilder 不用 +"
- [ ] LeetCode（用 Java 写，给题号+提示，不写答案）：
  - **LC 14 最长公共前缀** —— 字符串纵向扫描。提示：以第一个串为基准，逐列比后面的串，遇到不同或越界即截断
  - **LC 151 反转字符串中的单词** —— StringBuilder/双指针。提示：先整体反转字符串，再逐单词反转；或用 split(" ") 反序后 StringBuilder 拼回
  - **LC 49 字母异位词分组** —— HashMap + 排序 key。提示：把每个词排序后的串当 key 存进 HashMap<String, List<String>>，原词 append 进 value
- [ ] 项目编码：把四件套串成 Java 版 `RagAgent` 类**骨架**（只写方法签名+注释，不写实现）：`String buildPrompt(List<Message> hist, List<String> contexts)`、`Completion callLLM(String prompt)`、`List<Doc> retrieve(String q)`、`boolean needsTool(Completion c)`、`String run(String userQuestion)` —— 把上午四件套概念映射成一条 Java 调用链

### 晚上 19:00-20:00 复盘 [ ]
- [ ] 话术练习：面试官问"一个完整的 AI 应用由哪些部分构成、你 demo 覆盖了哪些"，你 30 秒答（结合：四件套 + 你 demo 逐块对应 + 意图门槛=决策点）
- [ ] 错题重做：上午四件套全景图补全（标满 demo 代码对应）；LC14/151 在纸上走一遍（LC14 走 "flower"/"flow"/"flight"；LC151 走 "the sky is blue"）
- [ ] 本文件打勾 + 写明日主题

---

## Day 7 — 2026-08-18（第3周·刚好够用的 Java Web / Spring Boot 入门）✓ 已推送
**主题：Spring Boot 入门，把 Node 版 RAG demo 翻成 Java 版的第一步（Controller/Service/REST + 接 DashScope 骨架）**

### 上午 10:00-12:00 理论精学 [ ]
- [ ] Spring Boot 是什么：约定优于配置、内嵌 Tomcat、(几乎)零 XML，一个 `@SpringBootApplication` 的 main 就能起一个 HTTP 服务
- [ ] 三层最简结构：Controller(接 HTTP 请求) / Service(业务逻辑) / (Repository 先不碰)。你 demo 的 `api/rag.js` 全挤在一个文件，Java 要拆开
- [ ] REST & 注解：`@RestController` / `@RequestMapping` / `@PostMapping` / `@RequestBody`(把前端 JSON → Java 对象) / `@RequestParam`
- [ ] 对照你 demo：Node 的 `app.post('/api/qa', ...)` = Java 的 `@PostMapping("/api/qa")`；`req.body.question` = Java 的 `@RequestBody QuestionRequest`
- [ ] 依赖怎么管：看项目根 `pom.xml` 现在有什么；要加 `spring-boot-starter-web`（一站带来 Spring MVC + Tomcat）
- [ ] 接 DashScope：Java 用 `HttpClient`/`OkHttp` 发 POST 到通义千问 OpenAI 兼容 endpoint，body 是 messages 数组——和你 demo 调 LLM 是同一件事，只是语言换 Java
- [ ] **费曼**：不查资料，说清"前端 POST 一个 question，到你 Java 后端返回答案"整条链路经过哪几个类

**今日要点（自己展开）：**
1. Spring Boot = 开箱即用的 Spring，自动配置帮你省掉 web.xml / 一大堆 bean 定义
2. `@SpringBootApplication` 一个注解 = `@Configuration` + `@EnableAutoConfiguration` + `@ComponentScan`
3. Controller 只"接活+返回"，业务逻辑塞进 Service——分层是为了可测、可换
4. `@RequestBody` 靠 Jackson 把 JSON 反序列化成你的 DTO 类，字段名要对得上
5. 你 demo 的 SSE 流今天先不急着搬，Day 7 先跑通"同步返回 JSON"最小闭环
6. 通义千问 endpoint 走 OpenAI 兼容协议，messages=[{role,content}]，换家厂商只改 URL+Key
7. Maven 的 starter 依赖是"功能套餐"，`starter-web` 让你 0 配置就有 web 服务
8. 今天目标是"把骨架建起来能启动"，不是一次写完整 RAG——先让 Spring Boot 跑起来

**资料方向：** 搜「Spring Boot 第一个 RESTful API」「通义千问 HTTP 调用 Java / DashScope SDK」；看项目根 `pom.xml` 与 `src/` 现有结构

**手写/画图任务：** 画「Node demo → Spring Boot 映射图」——左列 Node 版(`api/rag.js` 的路由 `/api/qa`、`retrieve()`、`llmAnswer()`)；右列 Java 版(`QaController.postQa`、`QaService.answer`、`DashScopeClient.chat`)；用箭头逐块对应；红框标出"今天要新建的文件名"

### 下午 14:00-18:00 实战 [ ]
- [ ] **Java Web 骨架（纯手写，不抄）**：在 `src/main/java` 下建包（如 `com.demo.qa`），写：
  - `QaApplication`（main 方法 + `@SpringBootApplication`）
  - `QaController`（`@RestController`、`@PostMapping("/api/qa")`，收 `QuestionRequest`，调 `QaService.answer`，返 `QaResponse`）
  - `QaService`（方法 `String answer(String q)` 只写签名+注释：拼 prompt / 调 DashScope / 返回，不写实现）
  - `QuestionRequest` / `QaResponse` 两个 DTO（字段自己定，如 question / answer）
  - 提示：先不抄模板，自己想清"Controller 怎么把 question 传给 Service、Service 怎么把结果交回 Controller"
- [ ] LeetCode（用 Java 写，给题号+提示，不写答案）：
  - **LC 344 反转字符串** —— 双指针原地反转。提示：左右指针 swap 向中间夹，void 改原数组
  - **LC 58 最后一个单词的长度** —— 从末尾处理。提示：反向跳过尾部空格，数到遇到空格或到头，返回计数
  - **LC 709 转换成小写字母** —— 字符处理。提示：遍历 char，大写 A-Z 转 a-z 用 +32 或 `Character.toLowerCase`，或建小写映射
- [ ] 项目编码：再建 `DashScopeClient` 类骨架（方法 `String chat(java.util.List<Message> messages)` 只写签名+注释：HTTP POST 通义千问 endpoint，body=messages，返回 content）；把上午"接 DashScope"概念映射成 Java API。`Message` 类复用 Day6 的（role/content）

### 晚上 19:00-20:00 复盘 [ ]
- [ ] 话术练习：面试官问"你用过 Spring Boot 吗、怎么把服务跑起来"，你 30 秒答（结合：刚搭的 QaController/Service、内嵌 Tomcat、一个 main 启动、把 Node demo 用 Java 重写）
- [ ] 错题重做：上午映射图补全（标满新建文件名）；LC344 在纸上走一遍 "hello"
- [ ] 本文件打勾 + 写明日主题

---

## Day 8 — 2026-08-19（第3周·Spring Boot 接 DashScope 真实调用 + Service 检索逻辑骨架）✓ 已推送
**主题：把 Day7 的骨架跑通——DashScopeClient 真实 HTTP 调用 + QaService 串起「拼 prompt → 调 LLM → 返回」**

### 上午 10:00-12:00 理论精学 [ ]
- [ ] 真实调 DashScope：用 JDK11+ 的 `java.net.http.HttpClient` 发 POST 到通义千问 OpenAI 兼容 endpoint；Header `Authorization: Bearer <KEY>` + `Content-Type: application/json`；body 是 `{"model":"qwen-plus","messages":[{"role":"user","content":"..."}]}`
- [ ] 解析响应：JSON 形如 `choices[0].message.content`——用 Jackson（Spring Boot 自带）或 `org.json` 取；别手写字符串截取
- [ ] 同步 vs 流式：今天先同步（一次性拿完整 answer，返回 `QaResponse`）；SSE 打字机留到第7周项目深化，不提前啃
- [ ] 异常与超时：设 connect/read timeout（如 10s）；API 失败要 try-catch 兜底返回友好话术，别让 500 把服务打挂
- [ ] Service 层职责：`QaService.answer(q)` = ①拼 prompt（复用 Day6 PromptBuilder 思路）②（若接 RAG）先 retrieve ③调 `dashScopeClient.chat(messages)` ④返回 answer；Controller 保持"薄"，只接活+返回
- [ ] **费曼**：不查资料，说清"一个问题从 Controller 进来到答案返回"经过 `QaController → QaService → DashScopeClient → 通义千问 → JSON 解析 → QaResponse` 哪几步，哪步最可能出错

**今日要点（自己展开）：**
1. Spring Boot 调外部 API = 你 demo `api/rag.js` 里 `fetch` 调 LLM 的 Java 版，本质一样，只是语言换 Java
2. 通义千问 endpoint：`https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions`，messages 结构全兼容 OpenAI
3. API Key 别硬编码：用 `@Value("${dashscope.api-key}")` 从 `application.properties` 注入——安全 + 好换环境
4. 响应里 `choices` 是数组，取第一个；`finish_reason` 为 `stop` 才是正常结束
5. 同步返回先把"最小可用闭环"跑通：question → 拼 prompt → 调 LLM → answer，先不接 RAG 也能跑
6. 分层价值：DashScopeClient 只管"发 HTTP+解析"，QaService 只管"业务逻辑"，将来换模型/加检索只动一处
7. 错误兜底：LLM 超时/限流时返回"暂时无法回答，请稍后再试"，比抛异常优雅——这也是面试能讲的点
8. 今天目标：用 Postman/curl 打 `POST /api/qa` 能真收到大模型回答，不是骨架了

**资料方向：** 搜「DashScope Java 调用示例」「Spring Boot RestTemplate vs HttpClient 选哪个」「Jackson 解析 JSON 取字段」；看 `src/` 现有包结构定你的包名

**手写/画图任务：** 画「一次 /api/qa 请求的 Java 调用链时序图」——前端 POST question → QaController.postQa → QaService.answer →（可选）DocumentRetriever.retrieve → PromptBuilder.build → DashScopeClient.chat → HTTP POST 通义千问 → 解析 choices[0].message.content → 返 QaResponse；在「DashScopeClient.chat」那步用红框标出"这里发真实 HTTP + 解析 JSON，最容易出错（Key/超时/JSON 路径）"

### 下午 14:00-18:00 实战 [ ]
- [ ] **DashScopeClient 真实调用（纯手写，不抄完整实现）**：补全 Day7 的 `String chat(List<Message> messages)`——自己写 HttpClient POST、把 messages 拼成 JSON body、解析返回的 content；只给"关键注释 + API 形状提示"，完整可用代码自己填
  - 提示：先不抄 SDK，想清 ①body 怎么拼（messages→JSON，role/content 字段名要对）②返回 JSON 怎么取 content（Jackson `readTree().at("/choices/0/message/content").asText()`）③Key 用 `@Value` 注入别硬编码 ④超时与 try-catch 兜底
- [ ] **QaService 检索逻辑骨架（纯手写）**：在 `QaService` 写 `String answer(String q)` 方法体骨架，调用 DashScopeClient + Day6 PromptBuilder；把 RAG 检索（Day4 VectorStore / Day3 DocumentRetriever）串进来——只写步骤注释 + 调用链，不写完整实现
  - 提示：想清"没检索上下文时 prompt 怎么拼""接了 RAG 时 context 从哪来（先 retrieve 再塞进 prompt）""返回前要不要做拒答判断"
- [ ] LeetCode（用 Java 写，给题号+提示，不写答案）：
  - **LC 205 同构字符串** —— 双 HashMap 双向映射。提示：s[i]↔t[i] 必须一一对应；任一边撞上不同映射即 false（和 Day5 LC290 同模式，今天巩固）
  - **LC 26 删除有序数组中的重复项** —— 双指针。提示：慢指针 slow 指"下一个该放的位置"，快指针 i 遍历，nums[i]≠nums[slow] 才 copy 并 slow++，返回 slow+1
  - **LC 27 移除元素** —— 双指针。提示：同上思路，nums[i]≠val 才保留到慢指针位置，返回新长度

### 晚上 19:00-20:00 复盘 [ ]
- [ ] 话术练习：面试官问"你 Spring Boot 怎么调外部大模型 API、调用失败怎么处理"，你 30 秒答（结合：HttpClient POST 通义千问 / @Value 注入 Key / 超时+try-catch 兜底 / 分层让 Controller 薄）
- [ ] 错题重做：上午时序图补全（标满每层类名+红框出错点）；LC26/27 双指针在纸上走一遍（LC26 走 [1,1,2]；LC27 走 [3,2,2,3] 删 3）
- [ ] 本文件打勾 + 写明日主题

---

## Day 9 — 2026-08-20（第3周·Spring Boot 接 RAG 端到端跑通最小可用 RAG）✓ 已推送
**主题：把 RAG 检索真正接进 Java 版 /api/qa —— 端到端跑通「最小可用 RAG」（检索 → 拼 Prompt → 调 LLM → 返回）**

### 上午 10:00-12:00 理论精学 [ ]
- [ ] 搞清"最小可用 RAG"的边界：能检索上下文 + 拼进 prompt + 调 LLM 返回答案，就够演示；**不**急着上真向量库持久化、不急着 SSE 流——先把"链路跑通"当今日唯一目标
- [ ] 内存版向量（今天先用它跑通）：你 demo 现状就是"启动时把文档 chunk 算好 embedding 存内存，查询时全量算余弦"——Java 版同样用 `List<EmbeddingDoc>` 存语料 + `float[]` 向量，对应 Day4 讲的"内存朴素检索"，演示完全够
- [ ] 串联前三周骨架：Day3 `DocumentRetriever` + Day4 `VectorStore`(内存版) + Day6 `PromptBuilder` + Day8 `DashScopeClient` 接成一条链
- [ ] 接 Day6"意图门槛"思路：retrieve 返回空 / top-k 分数都低时，不硬调 LLM，返回兜底拒答——这就是"智能决策点"
- [ ] **费曼**：不查资料，说清"你 demo 的 `retrieve()` 在 Java 版被谁替代、拼 prompt 在谁手里、最终 answer 怎么从 `QaService.answer` 出来"

**今日要点（自己展开）：**
1. 最小可用 RAG 闭环 = `retrieve(context)` → `buildPrompt(context+question)` → `callLLM` → `answer`
2. Java 版先不接真向量库，用内存 `List<EmbeddingDoc>` 存语料 + 余弦兜底——和你 demo 现状一致，先把链路跑顺
3. Embedding 谁算？你 demo 是启动时算好；Java 版同样：启动时 chunk 文档 → 调 DashScope embedding 接口 或 **先用占位向量跑通链路**（真实 embedding 留第7周深化），重点是先验证"检索→回答"能动
4. `QaService.answer` 现在 = ①retrieve 拿 top-k context ②`PromptBuilder` 拼 system+context+question ③`dashScopeClient.chat` ④返回——比 Day8 多了"①检索"
5. context 进 prompt 的方式：把 top-k 文档拼成带编号的段落（如 `[1]...[2]...`），指令里写"只依据下面上下文回答"——这就是你 demo 的 RAG prompt 模板
6. 分层此刻显价值：接 RAG 只需在 Service 里加一行 `retrieve()`，Controller / DashScopeClient 一行不动——可维护性即面试卖点
7. Controller 仍"薄"：只收 question、调 `service.answer`、返 `QaResponse`；检索与拼 prompt 全是 Service 内部事
8. 今天目标：curl 打 `POST /api/qa`，问一个你语料里的问题，能拿到"基于检索内容"的回答，而不再是纯 LLM 闲聊

**资料方向：** 重读 `api/rag.js` 的 `retrieve()` 与拼 prompt 那段；回看 Day3/4/6/8 的骨架，确认方法名能对上

**手写/画图任务：** 画「Java 版最小可用 RAG 端到端时序图」——启动：加载语料→chunk→(占位)embedding→存入内存 `VectorStore`；运行时：`POST /api/qa` → `QaController` → `QaService.answer` → `DocumentRetriever.retrieve(top-k)` → `PromptBuilder.build(system+context+question)` → `DashScopeClient.chat` → 解析 content → `QaResponse`；在「retrieve 与 buildPrompt 衔接」那步用红框标出"context 怎么从 `List<EmbeddingDoc>` 变成 prompt 里的文本块"

### 下午 14:00-18:00 实战 [ ]
- [ ] **Java RAG 串接（纯手写，不抄完整实现）**：把 Day3 `DocumentRetriever` / Day4 `VectorStore`(内存版) / Day6 `PromptBuilder` / Day8 `DashScopeClient` 接进 `QaService.answer()`。要求自己写：retrieve 返回 `List<EmbeddingDoc>`、buildPrompt 把 context 拼进去、answer 串起来。只给"关键注释 + 调用链"，完整可用代码自己填
  - 提示：想清 ①context 怎么从 retrieve 的 List 变成 prompt 里的文本块（拼接 / 编号 `[1][2]`）②embedding 先用什么占位能跑通（如全随机向量，检索退化成"返回前 k 条"，只为验证链路；真实 embedding 第7周）③retrieve 返回空时 answer 怎么兜底
- [ ] LeetCode（用 Java 写，给题号+提示，不写答案）：
  - **LC 1 两数之和** —— 哈希表。提示：HashMap 存「值→下标」，边遍历边查 `target-当前值`，找到即返回两下标，O(n)
  - **LC 88 合并两个有序数组** —— 双指针从尾。提示：`i`/`j` 从两数组末尾向前填，`p` 指向 nums1 末尾，谁大放后面，`p--`，避免从前往后覆盖
  - **LC 167 两数之和 II（有序数组）** —— 双指针头尾夹。提示：`left=0, right=n-1`，和>target 右移、`<target` 左移，O(n) 不用哈希
- [ ] 项目编码：给 `VectorStore` 补一个"内存余弦检索"最小实现骨架 —— `List<EmbeddingDoc> cosineTopK(float[] q, int k)` 只写方法签名+注释（不写完整实现），把"全量遍历算余弦取 top-k"映射成 Java API；想清归一化与排序取前 k 的逻辑

### 晚上 19:00-20:00 复盘 [ ]
- [ ] 话术练习：面试官问"你怎么用 Java 把 RAG demo 重写的、端到端怎么跑"，你 30 秒答（结合：Spring Boot 分层 / retrieve→buildPrompt→callLLM / 内存向量先跑通 / 真实 embedding 留深化）
- [ ] 错题重做：上午时序图补全（标满每层类名 + 红框衔接点）；LC88 双指针从尾走一遍（nums1=`[1,2,3,0,0,0]`、nums2=`[2,5,6]`）
- [ ] 本文件打勾 + 写明日主题

---

## Day 10 — 2026-08-21（第4周·笔试算法 I：数组/字符串/哈希/双指针/滑动窗口 Day 1）✓ 已推送

> 第3周已达成：Spring Boot 分层搭起 + DashScope 真实调用 + 最小可用 RAG 端到端跑通（内存向量占位）。今天起转入笔试算法——这是 Java 实习第一关，必须手写不卡壳。

**主题：算法思维 + 双指针/滑动窗口 入门，并把第3周成果用单测锁死**

### 上午 10:00-12:00 理论精学 [ ]
- [ ] 算法面试底层逻辑：笔试/机考考的不是"会不会"，是"熟练度 + 边界意识"。LeetCode 高频题必须能徒手写出来——今天起全部用 Java 写，不依赖 IDE 补全
- [ ] 数组/字符串是 Java 笔试最高频载体：下标操控、双指针、哈希计数三板斧
- [ ] 哈希表 Two-Sum 模式：用空间换时间，HashMap 存「值→下标」，边遍历边查 `target-当前值`
- [ ] 双指针三形态：相向（回文/接雨水）、同向快慢（去重/移除）、滑动窗口（最长子串）——今天先把三种都认全
- [ ] 滑动窗口本质：维护一个可变区间，用 HashSet/计数表判重复，左右指针收缩到「刚好合法」——字符串高频中的高频
- [ ] 边界意识：空输入、单元素、整数溢出（用 `long` 兜底）、数组越界，这些点在面试里比算法本身更常扣分
- [ ] 复杂度叙述：开口先说暴力 O(n²)，再讲优化到 O(n)——面试官看的是"优化思路"而非一步到位

**今日要点（自己展开）：**
1. 笔试第一关是 Java 实习筛选门槛，算法不熟直接挂——这是你"Java 基础薄弱"最该补的硬伤
2. 双指针把 O(n²) 降 O(n) 的核心：用两个下标代替两层循环，信息一次扫完
3. 滑动窗口 = 同向双指针的特例，关键是「什么时候右扩、什么时候左缩」
4. HashMap 在算法里两大用途：计数（频次表）+ 索引映射（Two-Sum）
5. 字符串题优先想「字符→计数」或「双指针」，别一上来就 split/正则
6. 整数相乘/相加先做 long 再转回，避免 `Integer.MAX_VALUE` 溢出类坑
7. 算法题写完后强制自测：自己造 3 个用例（正常/边界/异常）走一遍
8. 今天把第3周 Java RAG 用 JUnit 锁死，后续改代码不慌——单测就是你的安全网

**资料方向：** LeetCode 热题 HOT100「数组/字符串/哈希」分类；搜「滑动窗口 模板」「双指针 三种模型」；回看 Day4/Day6 的 VectorStore / PromptBuilder 代码

**手写/画图任务：** 画「双指针三形态」对照图——相向双指针（左右夹，LC125/42）、同向快慢（LC26/27）、滑动窗口（左闭右开维护区间，LC3/76）；每类标一个代表题号 + 一句"什么时候用"

### 下午 14:00-18:00 实战 [ ]
- [ ] **Java 纯手写（不抄）**：写 `TwoSum` 工具类（HashMap 解法），并手写 JUnit 测三种情况——正常返回下标 / 无解为 null / 有重复数字。再写 `SlidingWindow` 类骨架：方法 `int lengthOfLongestSubstring(String s)` 只写签名+注释（不写实现）
  - 提示：先不看书，想清「HashMap 存什么、查什么」「JUnit 怎么断言数组相等（`assertArrayEquals`）」「滑动窗口 left 什么时候该右移」
- [ ] LeetCode（用 Java 写，给题号+提示，不写答案）：
  - **LC 3 无重复字符的最长子串** —— 滑动窗口 + 计数/HashSet。提示：右扩左缩维护「窗口内字符不重复」，重复则 left 跳到重复位置之后，每步记录最大长度
  - **LC 76 最小覆盖子串** —— 滑动窗口 + 计数表。提示：need 计数 target 字符、valid 计数已满足的字符数；右扩收集、第一次 valid==need.size() 后尝试左缩并记录最小窗口
  - **LC 238 除自身以外数组的乘积** —— 前后缀乘积。提示：左累乘数组 × 右累 (不用除法)；或常数空间左右各扫一遍，用 ans 暂存左积
- [ ] 项目编码：给 Day6 的 `PromptBuilder` / Day4 的 `VectorStore.cosineTopK` 写 JUnit 单测（JUnit 5 `@Test`）——测「空 context」「多 context 编号拼接」「余弦取前 k」；把第3周成果锁死，避免后续改崩（对照 Day6 单测启蒙）

### 晚上  19:00-20:00 复盘 [ ]
- [ ] 话术练习：面试官问"你刷题怎么准备、遇到没见过的题怎么办"，你 30 秒答（结合：按高频 tag 刷、先暴力再优化、强迫用 Java 手写不依赖 IDE、双指针/哈希是主线）
- [ ] 错题重做：上午双指针三形态图补全；,LC3 在纸上走一遍 "abcabcbb"
- [ ] 本文件打勾 + 写明日主题

---

## Day 11 — 2026-08-22（第4周·笔试算法 I：滑动窗口/双指针/哈希进阶 Day 2）✓ 已推送
**主题：滑动窗口深化（合法判定 + 计数表）+ 排序数组双指针 + 前缀和/HashMap 进阶**

### 上午 10:00-12:00 理论精学 [ ]
- [ ] 滑动窗口灵魂：先定义「合法判定」——窗口内是否满足题意；不满足就右扩收集，满足了就左缩求最优。今天把「判定函数」写清楚
- [ ] 计数表驱动窗口（LC567 模式）：用 int[26] 或 HashMap 维护「窗口字符计数」与「目标计数」的差，差为 0 即合法——字符串窗口题标配
- [ ] 同向快慢双指针（LC209）：快指针累加探测、慢指针维护「已确认最短合法区间」
- [ ] 排序数组双指针（LC15 三数之和）：排序后固定一个数，剩下两数相向夹逼，O(n³) 降到 O(n²)
- [ ] 哈希表进阶：前缀和 + HashMap（LC560「和为 K 的子数组」），把「区间和」转「两数之差」——HashMap 存「前缀和→出现次数」
- [ ] 去重是隐性考点：排序后 while 跳过相邻重复值，否则答案重复
- [ ] 边界：滑动窗口 left 收缩用 while 不是 if（可能连跳）；写题后强制造 3 个用例自测（正常/边界/异常）

**今日要点（自己展开）：**
1. 滑动窗口 = 维护可变合法区间，核心是「什么时候右扩、什么时候左缩」——决策点永远是「当前是否合法」
2. 计数表（frequency map）让「是否合法」变 O(1) 判定：维护差值而非每次重数
3. 同向双指针：快指针探路、慢指针收口，一边扫一边得「每个右端点对应的最短合法左界」
4. 三数之和先排序：排好序后左右夹替代一层循环，相等时两端同跳顺手去重
5. 前缀和 + HashMap：preSum[j]-preSum[i]==k 等价于「i+1..j 和为 k」；HashMap 累计「出现过的前缀和次数」，一遍扫出答案
6. 算法题「去重」常被忽略，排序 + while 跳过最稳
7. 写题先暴后排：开口讲 O(n²) 暴力，再讲优化思路——面试官看的是优化
8. 今天继续给第3周 Java RAG 补单测（Day10 起头），把「最小可用 RAG」锁死别改崩

**资料方向：** LeetCode 热题 HOT100「数组/字符串」；搜「滑动窗口 合法判定」「前缀和 HashMap 子数组」；回看 Day10 的 SlidingWindow 骨架

**手写/画图任务：** 画「滑动窗口 合法判定 + 左右指针决策图」——右指针探查 → 更新计数 → 判定「窗口合法?」→ 合法则左缩求最优 / 不合法则继续右扩；在「判定函数」那一步红框标「这是窗口题核心，自己写清条件」

### 下午 14:00-18:00 实战 [ ]
- [ ] **Java 纯手写（不抄）：** 把 Day10 的 SlidingWindow.lengthOfLongestSubstring **真正实现**（HashSet 或 int[128] 计数；right 扩、遇重复 left 跳到 max(left, 上次位置+1)）；手写 JUnit 测 abcabcbb→3 / bbbbb→1 / pwwkew→3。另写 PrefixSum 工具类（HashMap 解「和为 k 的子数组」，只写方法签名+注释）
  - 提示：先不看书，想清「right 碰到重复时 left 为什么跳 max(left, 上次+1) 而非 +1」「HashSet 存什么、何时 remove」
- [ ] LeetCode（用 Java 写，给题号+提示，不写答案）：
  - **LC 209 长度最小的子数组** —— 同向双指针/滑动窗口。提示：right 累加 sum，sum>=target 时记录长度并尝试 left 右移缩窗口；返回最小长度，无则 0
  - **LC 567 字符串的排列** —— 滑动窗口 + 计数表。提示：先建 s2 的 target 计数；窗口在 s1 上滑，维护「窗口计数 vs target」，差==0 即 s2 是子串排列
  - **LC 15 三数之和** —— 排序+双指针。提示：排序后外层固定 a，内层 left/right 相向夹逼求 a+b+c==0；相等时两端同跳 + 跳过相邻重复去重
- [ ] 项目编码：给 Day8 的 DashScopeClient.chat（或 Day9 的 QaService.answer）补一个 JUnit——测「入参空串返回兜底」「异常时返回友好话术」，继续把第3周成果锁死（对照 Day10 单测启蒙）

### 晚上 19:00-20:00 复盘 [ ]
- [ ] 话术练习：面试官问「滑动窗口你怎么理解、为什么比暴力快」，你 30 秒答（结合：维护合法区间、把 O(n²) 降 O(n)、核心是判定函数）
- [ ] 错题重做：上午「滑动窗口决策图」补全；LC209 在纸上走一遍 [2,3,1,2,4,3] target=7 → 期望 2
- [ ] 本文件打勾 + 写明日主题

---

---

## Day 12 — 2026-08-23（第4周·笔试算法 I：哈希表进阶收尾 + 双指针经典 Day 3）✓ 已推送

**主题：哈希表进阶收尾（前缀和+HashMap / 最长连续序列 HashSet）+ 双指针经典（接雨水 LC42）**

### 上午 10:00-12:00 理论精学 [ ]
- [ ] 前缀和+HashMap 落地：Day11 讲了"区间和→两数之差"，今天把它真正写成跑得通的代码——重点是 HashMap 存「前缀和→出现次数」，初值必须 `put(0,1)`
- [ ] 最长连续序列 LC128：排序 O(n log n) 能过但不是最优；面试要 HashSet O(n)——只枚举"序列起点"（即 `num-1` 不存在时）向后延，避免每个数都数一遍
- [ ] 接雨水 LC42 核心公式：位置 i 能接的水 = `min(左边最高, 右边最高) - height[i]`；三种解法：暴力 O(n²) / 左右最大数组 O(n) 空间 / 双指针 O(1) 空间
- [ ] 双指针接雨水决策逻辑：left/right 谁矮谁动，因为"矮边这一侧的 max 已经封顶了当前格的水量上限，另一侧必然≥它"——`min` 永远取矮边
- [ ] 为什么双指针比左右数组更优：少了 O(n) 的预处理数组，空间 O(1)，但思维门槛更高——这正是面试区分度
- [ ] 边界意识延续：接雨水 height 为空/单元素返回 0；最长连续序列空数组返回 0；前缀和初始 `(0,1)` 漏了会少算从下标 0 开始的子数组
- [ ] 复杂度叙述训练：开口先讲暴力，再讲优化到 O(n) / O(1) 空间——接雨水、最长连续序列都要能这么说

**今日要点（自己展开）：**
1. 哈希表在算法里就两件事：计数（频次表）+ 索引/值映射（Two-Sum / 前缀和）——把"找两个数"变 O(1) 查
2. 前缀和套路：`preSum[j]-preSum[i]==k` ⇔ 区间 i+1..j 和为 k；HashMap 累计「前缀和出现次数」，一遍扫出答案
3. LC128 的 HashSet 诀窍：只在 `x-1 ∉ set` 时才以 x 为起点向后数，保证每段连续序列只被数一次 → O(n)
4. 接雨水双指针不变式：leftMax/rightMax 各自记录"到当前指针为止见过的最高"，谁矮动谁，移动前先结算当前格水量
5. 双指针接雨水正确性直觉：矮边动是因为"高边那侧一定有个≥矮边max的墙兜底"，所以当前格水量由矮边 max 决定
6. 算法题"初始化"是隐形坑：前缀和 `put(0,1)`、接雨水左右指针从 0 和 n-1 起、最长连续空集合返回 0
7. 这三道题覆盖"哈希优化 + 双指针降维"两大笔试主线，今天务必手写不卡壳
8. 写完每题强制自测 3 例（正常/边界/异常）：接雨水走 `[0,1,0,2,1,0,1,3,2,1,2,1]`→6，最长连续走 `[100,4,200,1,3,2]`→4

**资料方向：** LeetCode HOT100「数组/哈希」；搜「接雨水 双指针 最优解 为什么」「最长连续序列 HashSet O(n)」「子数组和为k 前缀和 HashMap」

**手写/画图任务：** 画「接雨水 双指针」图 —— 顶部画 height 柱状；左指针 left 从左、右指针 right 从右，两侧各标 leftMax/rightMax；箭头示意"谁矮谁先计算当前格 `min(leftMax,rightMax)-height[该侧]` 的水量再移动"；在「结算当前格水量」那步用红框标「为什么矮边能决定上限：另一侧必有≥矮边max的墙，min 取矮边」

### 下午 14:00-18:00 实战 [ ]
- [ ] **Java 纯手写（不抄）**：
  - 实现 `int subarraySum(int[] nums, int k)` —— HashMap<Integer,Integer> 存前缀和→次数，遍历累加 pre、查 `pre-k` 累加、初始 `put(0,1)`
  - 实现 `int longestConsecutive(int[] nums)` —— HashSet 装全部，遍历每个数仅当 `!set.contains(num-1)` 时从 num 向后 `num+1` 数连续长度，记全局最长
  - 实现 `int trap(int[] height)`（双指针）—— left/right 指针 + leftMax/rightMax，谁矮动谁，移动前结算 `min(leftMax,rightMax)-height[侧]` 累加；判空返回 0
  - 提示：先不看书，想清「subarraySum 为什么初始 put(0,1)」「longestConsecutive 为什么只数起点」「trap 为什么矮边动」（对照上午画图）
- [ ] **LeetCode（用 Java 写，给题号+提示，不写答案）**：今日三道即上面三个，独立再写一遍并自测——
  - **LC 560 和为 K 的子数组** —— 前缀和+HashMap。提示：一遍扫，preSum 累计，答案 += `count.get(preSum-k)`，再 `count.put(preSum,+1)`，初始 `count(0)=1`
  - **LC 128 最长连续序列** —— HashSet O(n)。提示：只数「num-1 不存在」的起点，向后 num+1 延伸，记录最长；别排序
  - **LC 42 接雨水** —— 双指针。提示：left/right 夹，leftMax/rightMax 各自维护，矮边结算水量后移动；空/单元素返回 0
- [ ] **项目编码**：给第3周 Java RAG 补 JUnit 收尾（把"最小可用 RAG"彻底锁死，下周转入第5周链表/树）——
  - 测 `VectorStore.cosineTopK`：①空库返回空 ②k>总数只返回全部 ③正常取前 k（对照 Day4 骨架）
  - 测 `RagAgent`/意图门槛兜底：retrieve 返回空时 `answer` 返回拒答话术而非硬调 LLM（对照 Day6 意图门槛 / Day9 闭环）
  - 要求：JUnit 5 `@Test`，断言用 `assertTrue`/`assertEquals`，跑通 `mvn test` 或 IDE 跑绿

### 晚上 19:00-20:00 复盘 [ ]
- [ ] 话术练习：面试官问"接雨水你有多少种解法、为什么双指针最优"，你 30 秒答（结合：暴力 O(n²) → 左右最大数组 O(n) 空间 → 双指针 O(1) 空间；矮边决定水量上限）
- [ ] 错题重做：上午接雨水图补全（标满 leftMax/rightMax + 红框）；LC42 纸上走 `[0,1,0,2,1,0,1,3,2,1,2,1]`→6；LC128 走 `[100,4,200,1,3,2]`→4
- [ ] 本文件打勾 + 写明日主题

---

**明日主题（Day 13）：** 第4周算法 I Day 4 — 二分查找（基础 + 变体：找插入位置 / 搜索旋转排序数组）+ 数组原地操作收尾；LeetCode：LC704 / LC35 / LC33；Java 纯手写 + RAG 单测收尾（转入第5周链表/二叉树准备）。

---

## Day 13 — 2026-08-24（第4周·笔试算法 I：二分查找 + 数组原地操作收尾 Day 4）✓ 已推送

**主题：二分查找（基础 + 变体：找插入位置 / 搜索旋转排序数组）+ 数组原地操作收尾（有序数组平方 LC977）**

### 上午 10:00-12:00 理论精学 [ ]
- [ ] 二分查找前提：数组必须有序（升序），否则直接失效——这是它和哈希/双指针最本质的区别，面试开口先说
- [ ] 核心 invariant：每轮都维护「答案一定落在 [left, right] 区间内」，靠 mid 把不可能的一半砍掉，O(log n)
- [ ] 两种模板认全：①闭区间 `while(left<=right)`，更新 `left=mid+1 / right=mid-1`；②左闭右开 `while(left<right)`，更新 `right=mid`（mid 留给 left 当候选）
- [ ] 防溢出：`mid = left + (right-left)/2`，别写 `(left+right)/2`（大数组会整数溢出）
- [ ] 变体1 找插入位置(LC35)：用左闭右开模板最干净，循环结束 `left==right==插入点`；闭区间则用 `return left`（结束时 left>right）
- [ ] 变体2 旋转数组(LC33)：先判 `mid` 落在「左半有序」还是「右半有序」，再在有序半边里判断 `target` 是否在范围内，不在就去另一半
- [ ] 死循环陷阱：闭区间里写 `left=mid`（漏 +1）会卡死——`mid` 已排除就必须 +1/-1
- [ ] 数组原地操作收尾：双指针「覆盖式」写法在 Day8/LC26、Day11 已练；今天补「有序数组平方 LC977」左右夹 + 结果从尾倒填，是原地双指针的收口

**今日要点（自己展开）：**
1. 二分 = 在有序结构上做「每次砍一半」的查找，前提是序——无序直接哈希/遍历
2. invariant 思维比背模板重要：想清「为什么这一半可以扔」
3. 闭区间模板更直觉，左闭右开模板在「找边界/插入位」场景更省心，两个都得会
4. `mid` 防溢出是面试细节分，`left+(right-left)` 比 `(left+right)` 稳
5. LC35 的插入位就是「第一个 ≥ target 的位置」，左闭右开循环天然收敛到它
6. LC33 旋转数组的诀窍：总有一半是有序的，先定位有序半边再二分，O(log n)
7. 死循环几乎都源于「更新时没把 mid 排除」——写 `left=mid+1/right=mid-1` 是铁律
8. 数组原地操作（覆盖式双指针 / 左右夹倒填）是 Day8/11 双指针的收口，今天 LC977 一锤定音

**资料方向：** LeetCode 热题 HOT100「二分查找」；搜「二分查找 两种模板 左闭右开」「搜索旋转排序数组 为什么先找有序半边」；回看 Day8 的 LC26/27 覆盖式双指针

**手写/画图任务：** 画「二分查找 两种模板对照图」——左：闭区间 `while(left<=right)` 框 + 更新 `left=mid+1 / right=mid-1` + 注释「mid 已排除」；右：左闭右开 `while(left<right)` 框 + 更新 `right=mid / left=mid+1` + 注释「mid 留给 left」；底部画「旋转数组 LC33 决策树」：比 `nums[mid]` 与 `nums[left]` 判有序半边 → target 在有序半边范围内? → 否则去另一半；在「更新 +1/-1」那步用红框标「漏写就死循环」

### 下午 14:00-18:00 实战 [ ]
- [ ] **Java 纯手写（不抄完整实现）**：写 `BinarySearch` 工具类，自己实现：
  - `int search(int[] nums, int target)`（闭区间模板，命中返回 mid，否则 -1）
  - `int searchInsert(int[] nums, int target)`（左闭右开模板，返回插入位）
  - 提示：先不看书，想清「search 为什么返回 -1 而非 left」「searchInsert 为什么结束 left 即答案」；mid 用防溢出写法
  - 手写 JUnit 测：search（命中/未命中/边界 mid）/ searchInsert（target 存在/小于首/大于尾/插中间）
- [ ] LeetCode（用 Java 写，给题号+提示，不写答案）：
  - **LC 704 二分查找** —— 闭区间标准模板。提示：nums[mid]==target 返回 mid；`<target` 左半扔（left=mid+1）；`>` 右半扔；O(log n)
  - **LC 35 搜索插入位置** —— 左闭右开模板。提示：循环不命中就结束，`return left` 即第一个 ≥ target 的位置；或闭区间返回 left
  - **LC 33 搜索旋转排序数组** —— 先找有序半边。提示：`nums[mid]>=nums[left]` 说明左半有序，再判 target∈[left,mid) 则 right=mid-1 否则 left=mid+1；右半有序同理；无重复、O(log n)
  - **LC 977 有序数组的平方**（数组原地操作收尾） —— 双指针左右夹。提示：比两端绝对值，大的平方从结果数组末尾倒填、该端指针内移；O(n) 无需排序，是 Day8/11 覆盖式双指针的收口
- [ ] **项目编码：RAG 单测收尾（锁死，转入第5周）**：把 Day8 `DashScopeClient` / Day9 `QaService.answer` 的剩余 JUnit 补全（正常 question 返回非空 / 超长 question 不崩 / 空串兜底），跑通 `mvn test` 全绿；再花 15min 浏览链表与二叉树基础概念（为 Day14 铺垫，只看不写）

### 晚上 19:00-20:00 复盘 [ ]
- [ ] 话术练习：面试官问"二分查找你踩过哪些坑、旋转数组怎么做"，你 30 秒答（结合：有序前提 / mid 防溢出 / +1/-1 防死循环 / 旋转先定位有序半边再二分）
- [ ] 错题重做：上午二分模板图补全（标满两种模板更新规则 + 红框）；LC33 纸上走 `[4,5,6,7,0,1,2]` target=0 → 期望 4；LC977 走 `[-4,-1,0,3,10]` → `[0,1,9,16,100]`
- [ ] 本文件打勾 + 写明日主题

---

---

## Day 14 — 2026-08-25（第5周·笔试算法 II：链表 + 二叉树基础 Day 1）✓ 已推送

> 第4周算法 I 已收口：双指针/滑动窗口✓ / 哈希进阶(前缀和+接雨水)✓ / 二分+原地操作✓ / RAG 单测全绿锁死✓。今天转入第5周——链表与二叉树，这是笔试第二高频载体，且和"递归思维"强绑定。

**主题：链表（反转 / 快慢指针 / 相交）+ 二叉树基础（递归结构 / 前中后序遍历）**

### 上午 10:00-12:00 理论精学 [ ]
- [ ] 链表本质：节点靠 `next` 指针串起来，内存不连续——所以"按下标访问"是 O(n)，插入删除 O(1) 是它相对数组的最大优势（面试开口先讲这点）
- [ ] 哑节点(dummy)套路：头节点可能被删/插入时，建一个 `dummy.next = head` 统一处理，避免「头节点特判」——反转、删除、合并题都用它
- [ ] 反转链表(LC206)核心：三个指针 `prev / cur / next`，每步 `cur.next = prev` 后三个一起前移；递归写法靠"先反转后面、再让后面指向自己"
- [ ] 快慢指针(LC141 判环)：fast 走 2 步、slow 走 1 步，有环必相遇（fast 追上 slow）；相遇后再用「双指针从 head 和相遇点同步走」求入环口(LC142，今天先认思路)
- [ ] 相交链表(LC160)：两链长度差用「双指针各走完自己再走对方」抵消——走到 null 就换头，第二次重合即是交点；别用哈希（空间 O(1) 才是考点）
- [ ] 二叉树递归结构：节点 = 值 + 左子树 + 右子树，天然递归；前/中/后序指「根节点访问时机」——中序(左根右)对 BST 即升序
- [ ] 遍历三种写法都要会：①递归(最直观) ②显式栈模拟 ③层序(BFS 用队列)。今天先吃透递归版，栈/队列版 Day15 收
- [ ] 边界意识：链表空 / 单节点 / 相交在头或尾；树空 `root==null` 直接 return——递归的 base case 漏了就栈溢出

**今日要点（自己展开）：**
1. 链表题 90% 用「dummy + 指针操作」，核心是"改 next 前先存下一个节点，别断链"
2. 反转链表是链表一切的基础，递归/迭代两种写法都必须徒手写出来不卡壳
3. 快慢指针 = 制造"步数差"，判环只是入门，Day15 的中点/环口/倒数第k都靠它
4. 相交链表双指针换头法：时间 O(m+n) 空间 O(1)，是"不用额外空间"的典范
5. 二叉树递归 = 相信"左右子树已经帮我处理好"，只写当前层逻辑——这是递归思维的精髓
6. 前中后序：根的位置决定名字；中序遍历二叉搜索树(BST)天然升序，这是面试高频点
7. 树的遍历递归 base case：`if(root==null) return;`——和链表的 `if(head==null) return;` 同理
8. 链表/树都是"指针/引用"结构，Java 里就是对象引用，画节点图比背代码管用

**资料方向：** LeetCode HOT100「链表」「二叉树」；搜「反转链表 迭代+递归」「快慢指针 为什么能判环」「二叉树 前中后序 递归」；回看 Day8/11 的双指针思维（链表指针是同一套思维在引用上）

**手写/画图任务：** 画「反转链表指针演变图」——画 4 个节点 1→2→3→4→null，用三行快照展示 prev/cur/next 每步变化（第1步存 next、cur.next 指向 prev、三指针前移）；在 `cur.next = prev` 那一步红框标「先存 next 再断链，顺序反了就丢节点」

### 下午 14:00-18:00 实战 [ ]
- [ ] **Java 纯手写（不抄）**：
  - 定义节点类 `ListNode`（字段 `int val; ListNode next;` + 构造器），这是所有链表题的底座
  - 实现 `ListNode reverseList(ListNode head)`——迭代三指针法，自己写 `prev=null; cur=head`，循环里先存 `next=cur.next` 再 `cur.next=prev` 再前移；再写递归版本 `reverseListRec`
  - 提示：先不看书，想清「为什么必须先存 next」「递归版为什么 `head.next.next = head` 能反转后面指向自己」
  - 手写 JUnit 测反转：1→2→3→null → 3→2→1→null（用数组比结果，自己写个 listToArray 辅助）
- [ ] LeetCode（用 Java 写，给题号+提示，不写答案）：
  - **LC 206 反转链表** —— 迭代+递归。提示：三指针 prev/cur/next，先存 next 再断链；递归靠"后面反转完，让后节点指回自己"
  - **LC 141 环形链表** —— 快慢指针。提示：fast=head.next 走两步、slow 走一步，相遇即有环；注意 fast 不能为 null 才能 .next
  - **LC 160 相交链表** —— 双指针换头。提示：pA 走完 A 换到 B 头、pB 反之，第二次重合即交点（长度差被抵消）；无交点最终都 null
- [ ] **项目编码：RAG 项目定型（冻结进第5周）**：确认 Day12/13 的 JUnit 全绿（`mvn test` 通过），把 `src/` 下 Java RAG 三层（Controller/Service/DashScopeClient + VectorStore 内存版）定为"可演示版本"——本周不再大改，专注算法。只做：①列一份"当前 RAG 已具备能力清单" ②把未完成的 TODO 注释整理成第7周深化 backlog（不写代码）

### 晚上 19:00-20:00 复盘 [ ]
- [ ] 话术练习：面试官问"链表和数组有什么区别、你更常用哪个、为什么"，你 30 秒答（结合：数组连续随机访问 O(1) 但插入删 O(n)；链表插入删 O(1) 但访问 O(n)；RAG 的文档存储用的是类数组结构，但算法题链表考指针操作）
- [ ] 错题重做：上午反转链表图补全（标满三步快照 + 红框）；LC160 纸上走两个「长度不同、中间相交」的链，验证换头法
- [ ] 本文件打勾 + 写明日主题

---

**明日主题（Day 15）：** 第5周 笔试算法 II Day 2 — 链表快慢指针进阶（中点 / 倒数第k / 环入口 LC142）+ 二叉树遍历三写法（递归 / 显式栈 / 层序 BFS）；LeetCode：LC142 / LC19 / LC102 + 手写层序队列；Java 单测锁链表反转。

---

## Day 15 — 2026-08-26（第5周·笔试算法 II：链表快慢指针进阶 + 二叉树遍历三写法 Day 2）✓ 已推送

**主题：快慢指针收口（中点 / 倒数第k / 环入口 LC142）+ 二叉树遍历三写法（递归 / 显式栈 / 层序 BFS）**

### 上午 10:00-12:00 理论精学 [ ]
- [ ] 快慢指针这一根"速度差"绳子串三个考点：中点 / 倒数第k / 判环+环入口——把 Day14 的判环升级成"不仅能判、还能定位入口"
- [ ] 中点：fast 走 2、slow 走 1，fast 到尾（fast==null 或 fast.next==null）时 slow 恰好在中点；链表奇偶长度决定取到"左中点"还是"右中点"，想清再写
- [ ] 倒数第 k(LC19)：fast 先走 k 步制造固定间距，再快慢同速，fast 到尾时 slow 停在"倒数第 k 的前一个"——配合 dummy 删头最干净，不用特判头节点
- [ ] 环入口(LC142)：判环相遇后，另起两个指针 p1=head、p2=相遇点，同步各走 1 步，再次相遇即入口；核心等式"起点到入口距离 = 相遇点绕回入口的距离"
- [ ] 等式推导自己推一遍：设 head→入口 a、入口→相遇 b、相遇→入口 c；fast 走 2 倍、相遇时多走整整一圈 ⇒ 自己列式得出 a=c——面试能口述推导比背代码加分
- [ ] 二叉树遍历三写法都要会：①递归（信子树，最直观）②显式栈（Deque 手动模拟调用栈，迭代前/中序）③层序 BFS（Queue 逐层）——面试常让"不用递归写中序"
- [ ] 层序 BFS 诀窍：每层开始前先记 `queue.size()` 当"本层人数"，循环出队并把子节点入队，把本层结果丢进外层 List——"记 size 再出队"是逐层的关键
- [ ] 边界意识：链表空/单节点、k>链表长度(LC19 直接返回 head)、无环(LC142 返回 null)；树 `root==null` 直接 return——递归 base case 漏了就栈溢出

**今日要点（自己展开）：**
1. 快慢指针 = 用"速度差"制造固定距离，中点/倒数k/环都靠它——同一工具三用法，是笔试高频中的高频
2. 中点判奇偶：奇数长取正中间、偶数长取"左中点"还是"右中点"由 fast 起点/步数决定，写前先定
3. LC19 用 dummy 统一处理"删头节点"特例，避免 `if(head==...)` 分支，代码更干净更稳
4. 环入口等式 a=c 是数学结论，自己推一遍才真懂——这是区分"背题"和"会了"的分水岭
5. 二叉树递归 = "相信左右子树已处理好"，只写当前层逻辑；base case 漏写就 StackOverflow
6. 迭代中序（显式栈）最难：先一路压左、弹中、再走右——本质是手动维护调用栈，面试常考
7. 层序 BFS 用 Queue，靠"记 size 再出队"实现逐层；访问时机（前/中/后序）不影响分层，只影响取值
8. 链表/树都是引用结构，画图比背代码管用——今天三个画图任务到位，比机械刷 10 题有用

**资料方向：** LeetCode HOT100「链表」「二叉树」；搜「环形链表 II 入口 推导 a=c」「二叉树 迭代中序 显式栈」「层序遍历 为什么记 size」；回看 Day14 的反转链表指针演变图（同一套"改 next 前先存 next"思维）

**手写/画图任务：**
① 画「快慢指针 三用法对照图」——左：中点（fast2/slow1，标"fast 到尾时 slow 在中点"）；中：倒数第k（fast 先走 k，标"同走 fast 到尾时 slow 在倒数k前一个"）；右：环入口（判环相遇 → head 与相遇点同步走 → 再相遇即入口，在推导处红框标"a=c 怎么来"）。
② 画「层序 BFS 队列快照」——Queue 里一层节点，用框圈出本层 size 个，出队时把子节点入队，标"本层结果丢进外层 List"；画两层示意"size 如何保证只处理本层"

### 下午 14:00-18:00 实战 [ ]
- [ ] **Java 纯手写（不抄）**：
  - `ListNode middleNode(ListNode head)`：fast=head、slow=head，`while fast!=null && fast.next!=null` 则 `fast=fast.next.next; slow=slow.next;`，返回 slow（自己想清返回的是左中点还是右中点，奇偶各举一例验证）
  - `ListNode removeNthFromEnd(ListNode head, int n)`：dummy.next=head；fast 从 dummy 先走 n+1 步（让 slow 停在"倒数第 n 的前一个"），再快慢同走，slow 到位置后 `slow.next=slow.next.next`；返回 dummy.next（n 从 1 计，可能删头）
  - `ListNode detectCycle(ListNode head)`：先快慢判环（相遇记 meet，fast/fast.next 为 null 即无环返回 null）；再 `p1=head、p2=meet` 同步各走 1 步，相遇返回 p1
  - 手写 JUnit 锁：Day14 的 `reverseList` 反转测 + 今天 `middleNode`（1→2→3→4→null → 取 3；奇偶各一例）/ `removeNth`（删倒数第2：1→2→3→4 → 1→2→4）/ `detectCycle`（造小环返回入口节点）
  - 二叉树：`TreeNode`（val + left + right + 构造器，复用 Day14 思维）；`List<Integer> inorder(TreeNode root)` 递归中序；`List<List<Integer>> levelOrder(TreeNode root)` 层序 BFS（Queue + 记 size）
  - 提示：先不看书，想清「removeNth 为什么 slow 要停在『前一个』而非『倒数第n』」「detectCycle 为什么相遇后要从 head 重新走」「levelOrder 的 size 不记会怎样」
- [ ] **LeetCode（用 Java 写，给题号+提示，不写答案）**：
  - **LC 142 环形链表 II** —— 快慢相遇 + 双指针求入口。提示：fast 走2 slow 走1，相遇记 meet；无环(fast/fast.next 为 null)返回 null；p1=head、p2=meet 同步各走1步，再相遇即入口节点；a=c
  - **LC 19 删除链表的倒数第 N 个结点** —— 快慢 + dummy。提示：dummy 接 head；fast 先走 n 步（或 n+1 取决于 slow 起点）制造间距，再同走，fast 到尾 slow 停倒数第 n 前一，`slow.next=slow.next.next`；n 从 1 计、可能删头
  - **LC 102 二叉树的层序遍历** —— BFS 队列。提示：Queue 装 root；每层先 `int sz=queue.size()`，循环 sz 次：出队、值加入本层 list、左右子非空则入队；本层 list 加入结果；返回 `List<List<Integer>>`
- [ ] **项目编码（RAG 已冻结，今天只"说"不"写"）**：花 15min 口述「我的 RAG demo 面试三句话」——用 Day6 四件套(LLM API/Prompt/RAG/Agents) + Day9 端到端(retrieve→buildPrompt→callLLM)，自己组织成 100 字要点或录音。为第8周 90 秒 STAR 攒素材；"只看不说"不算，必须逼自己把语言组织出来

### 晚上 19:00-20:00 复盘 [ ]
- [ ] 话术练习：面试官问"快慢指针你能解决哪些问题"，你 30 秒答（结合：中点 / 倒数第k / 判环 / 环入口，一根速度差绳子串起；环入口能口述 a=c 推导）
- [ ] 错题重做：上午「快慢三用法图」+「层序队列图」补全；LC19 纸上走「1→2→3→4」删倒数第2 验证 dummy 处理；LC142 纸上造一个小环走一遍看入口命中
- [ ] 本文件打勾 + 写明日主题

---

---

## Day 16 — 2026-08-27（第5周·笔试算法 II：二叉树递归深化 + DFS/BFS 经典 Day 3）✓ 已推送

> 第5周进度：Day14 链表+树基础✓ / Day15 快慢进阶+遍历三写法✓。今天收二叉树递归 + 上网格 DFS/BFS（岛屿数量），为笔试"递归+搜索"双主线收口。

**主题：二叉树递归深化（最大深度/对称/路径和/同构）+ DFS·BFS 经典（岛屿数量 LC200）**

### 上午 10:00-12:00 理论精学 [ ]
- [ ] 递归思维心法：写树递归先答三问——①当前节点返回什么 ②怎么用左右子结果拼出自己的答案 ③base case（null 返回什么）。答完代码自现
- [ ] 后序 vs 前序：最大深度用后序（先拿左右深度再 +1）；路径和用前序（带"剩余需凑"往下传，到叶子判 0）
- [ ] 对称(LC101)：本质是"镜像对比两棵子树"，递归 `isMirror(a,b)` 比 `a.left↔b.right` 且 `a.right↔b.left`
- [ ] 同构/相同树：两棵树同时判空/一空/值等，再递归比左右——和对称是同一套"双树同步递归"思维
- [ ] DFS vs BFS 选型：树/图"找一条路径、算深度"用 DFS（递归/栈，省空间写起来短）；"逐层、最短路径"用 BFS（队列）
- [ ] 网格 DFS（岛屿 LC200）：二维坐标 (i,j)，四个方向上下左右，原地"淹成 0"替代 visited 数组，递归前先判越界
- [ ] 复杂度：树递归时间 O(n)、空间 O(h)（h=树高，最坏退化链表 O(n)）；网格 DFS 时间 O(m·n)、空间最坏 O(m·n)（递归栈一条线）

**今日要点（自己展开）：**
1. 树递归 = 相信"左右子树已经帮我算好"，只写当前层——这是递归最反直觉也最该练透的点
2. 后序：自底向上汇总（深度/子树是否平衡）；前序：自顶向下传递（路径和/从根到当前的值）
3. 对称判断别用"左==右"整体比，要"外对外、内对内"交叉比——这是 LC101 唯一坑
4. 路径和"到叶子才算"：必须 `left==null && right==null` 才是真叶子，中途节点 sum 减到 0 不算
5. 双树递归（对称/同构）= 两指针同步走，任何一端 null 或值不等立即判 false
6. 岛屿数量 = "数连通块个数"：每遇到一个 1，DFS 把它所在的整片陆地淹成 0，count++；遍历全网格
7. 网格 DFS 淹没法比建 visited 数组更省代码——原地改 grid 即标记，面试手写更稳
8. 递归栈溢出是隐坑：网格很大时 DFS 递归可能爆栈，面试能提一句"iterative 用显式栈/BFS 可破"是加分

**资料方向：** LeetCode HOT100「二叉树」「DFS/BFS」；搜「二叉树 递归 最大深度 后序」「对称二叉树 递归 isMirror」「岛屿数量 DFS 淹没法」

**手写/画图任务：**
① 画「二叉树递归 三问图」——以 LC104 为例：框出"当前节点：返回 1+max(左深,右深)"、标 base case "root==null→0"、右侧画调用栈示意（自底向上汇总）
② 画「岛屿数量 DFS 淹没图」——画一个 4×4 grid 标 1(陆)/0(水)，从一个 1 出发递归淹掉上下左右相邻 1，标递归方向箭头；在"越界/非1 即停"那步红框标「淹没前先判 i/j 越界 + grid[i][j]=='1'」

### 下午 14:00-18:00 实战 [ ]
- [ ] **Java 纯手写（不抄）**：
  - `int maxDepth(TreeNode root)`：后序，`if(root==null) return 0; return 1+Math.max(maxDepth(root.left), maxDepth(root.right));`
  - `boolean isSymmetric(TreeNode root)`：调 `isMirror(root.left, root.right)`；`isMirror(a,b)`：都空 true / 一空一有 false / 值不等 false / 再比 `isMirror(a.left,b.right) && isMirror(a.right,b.left)`
  - `boolean hasPathSum(TreeNode root, int sum)`：前序带剩余，`if(root==null) return false; sum-=root.val; if(left==null&&right==null) return sum==0; return hasPathSum(left,sum)||hasPathSum(right,sum);`
  - `int numIslands(char[][] grid)`：遍历 i,j，遇 `'1'` 触发 `dfs(i,j)` 淹连通块，count++；`dfs` 先判越界+非1 返回，置 `'0'` 再向四个方向递归
  - 手写 JUnit 锁：maxDepth（三层树/单节点/空）/ isSymmetric（对称树/非对称）/ hasPathSum（有路径/无路径）/ numIslands（小 grid 数连通块数）
  - 提示：先不看书，想清「maxDepth 为什么是后序」「isSymmetric 为什么交叉比」「hasPathSum 为什么必须到叶子」「numIslands dfs 为什么先置0再递归（防重复触发）」
- [ ] **LeetCode（用 Java 写，给题号+提示，不写答案）**：
  - **LC 104 二叉树的最大深度** —— 后序递归。提示：null→0；否则 1+max(左深,右深)；O(n)
  - **LC 101 对称二叉树** —— 递归镜像。提示：isMirror(a,b)：都空 true / 一空一有 false / 值不等 false / 再比 mirror(a.left,b.right)&&mirror(a.right,b.left)
  - **LC 112 路径总和** —— 前序带剩余。提示：到叶子(sum==0)返 true，否则递归左右时 target 减当前值；必须"到叶子"才算（左右都空）
  - **LC 200 岛屿数量** —— 网格 DFS 淹没法。提示：遍历每个 '1'，触发 dfs 把上下左右相邻 '1' 淹成 '0'，每触发 count++；dfs 先判越界+非1 返回
- [ ] **项目编码（RAG 已冻结，今天"说"不"写"）**：花 15min 口述「为什么 Java + RAG 是我的差异化卖点」100 字要点——用 Day6 四件套 + Day9 端到端 + 今天"递归/搜索"体现的工程能力；为第8周 90 秒 STAR 攒"差异化"素材。"只看不说"不算，必须逼自己组织语言

### 晚上 19:00-20:00 复盘 [ ]
- [ ] 话术练习：面试官问"二叉树递归你怎么写、DFS 和 BFS 你什么时候用哪个"，你 30 秒答（结合：递归三问 / 后序汇总 vs 前序传递 / 找路径深度用 DFS、逐层最短用 BFS / 岛屿就是数连通块的 DFS）
- [ ] 错题重做：上午两图补全（标满三问 + 红框）；LC104 走一个三层树求深；LC200 走一个 4×4 grid 数连通块
- [ ] 本文件打勾 + 写明日主题

---

**明日主题（Day 17）：** 第5周 笔试算法 II Day 4 — 二叉树改造（翻转 LC226 / 最近公共祖先 LCA LC236）+ 回溯入门（全排列 LC46 / 子集 LC78）；LeetCode：LC226 / LC236 / LC46 / LC78；Java 纯手写递归 + 回溯模板 + 二叉树单测续锁。

---

## Day 17 — 2026-08-28（第5周·笔试算法 II：二叉树改造 + 回溯入门 Day 4）✓ 已推送

> 第5周进度：Day14 链表+树基础✓ / Day15 快慢进阶+遍历三写法✓ / Day16 二叉树递归+DFS/BFS✓。今天是算法 II 收官日——树改造（在遍历里改指针）+ 回溯（带撤销的 DFS），下周转入第6周 Java 补强 + SQL/HTTP。

**主题：二叉树改造（翻转 LC226 / 最近公共祖先 LCA LC236）+ 回溯入门（全排列 LC46 / 子集 LC78）**

### 上午 10:00-12:00 理论精学 [ ]
- [ ] 翻转二叉树(LC226)本质：后序遍历 + 交换左右子树——`root.left = 翻完的右子树; root.right = 翻完的左子树`，自底向上把每棵子树翻面（和 maxDepth 同是后序，但多了"改写指针"）
- [ ] 最近公共祖先 LCA(LC236)：当前节点==p 或 ==q 直接返回当前（自己就是祖先）；否则左右各找，left/right 都非空→当前是 LCA；只有一边有→那一边上溯
- [ ] **费曼**：不查资料，说清"翻转为什么必须『先递归翻子树、再交换当前节点的 left/right』，顺序反了会怎样"；说清"LCA 为什么『两边都找到才返回当前节点』是正确性的关键"
- [ ] 回溯本质：在「决策树」上 DFS，每步做"选/不选"或"选哪个"，走到底收集解，回退时**撤销选择（恢复现场）**——全排列/子集/组合都它
- [ ] 回溯三要素：路径(path) + 选择列表 + 终止条件；递归前后"做选择 + 撤销选择"对称写
- [ ] 全排列(LC46) vs 子集(LC78)的区别：排列用 `used[]` 防"同一元素选两次"（重顺序）；子集用 `start` 下标往后推（不重顺序、只推位置），每个元素天然"选/不选"两条路
- [ ] 回溯 vs 普通 DFS：回溯显式"撤销"复用状态；普通 DFS（Day16 岛屿）原地改 grid 即标记不撤销——都递归，区别在"回退时状态怎么处理"

**今日要点（自己展开）：**
1. 翻转二叉树 = 后序遍历里顺手交换左右指针，先翻子树再翻自己，一层都不能漏
2. LCA 的精髓：把"找祖先"变成"左右子树分别找 p/q，命中情况决定返回谁"——后序返回命中节点
3. 回溯 = "带撤销的 DFS"，做选择与撤销选择对称，这是它和岛屿 DFS 最本质的不同
4. `used[]` 解决"元素能不能重复选"；`start` 解决"组合/子集不重不漏"——两个数组管两件不同的事
5. 全排列的叶子是"长度==n"，子集的叶子是"遍历完所有下标"，终止条件不一样
6. 回溯时间复杂度常爆炸（排列 n!、子集 2^n），笔试里重点是"写对模板"而非"优化"
7. 树的改造题和 Day16 递归三问同一套：当前节点返回什么、怎么用子树结果、base case 是什么
8. 今天收口后，你的"递归/搜索"双主线就齐了：改树(LC226/236) + 搜索(LC200) + 回溯(LC46/78)

**资料方向：** LeetCode HOT100「二叉树」「回溯」；搜「翻转二叉树 后序遍历」「最近公共祖先 递归 left right」「回溯算法 模板 做选择 撤销选择」

**手写/画图任务：**
① 画「翻转二叉树 后序图」——画一棵三层小树，用箭头标后序遍历顺序（左右根），在每个节点画"交换 left/right 前/后"两帧；在 `root.left = 翻完的右; root.right = 翻完的左` 那步用红框标「必须先递归翻子树、再交换当前，顺序反了只翻一层」
② 画「回溯决策树」——以全排列 [1,2,3] 为例：根空 → 选1/选2/选3 三分支 → 每支再选剩余 → 叶为完整排列；在"选完1后继续选2"那步红框标「used[1]=true 防重复选 + 回溯 used[1]=false 恢复现场」

### 下午 14:00-18:00 实战 [ ]
- [ ] **Java 纯手写（不抄）**：
  - `TreeNode invertTree(TreeNode root)`：后序，base case `if(root==null) return null;`；先递归翻 left/right，再 `TreeNode l=invert(right), r=invert(left); root.left=l; root.right=r; return root;`
  - `TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q)`：`if(root==null||root==p||root==q) return root; left=LCA(left,p,q); right=LCA(right,p,q); if(left!=null&&right!=null) return root; return left!=null?left:right;`
  - 回溯两套：`List<List<Integer>> permute(int[] nums)`（path+used[]+backtrack）、`List<List<Integer>> subsets(int[] nums)`（path+start+backtrack，任意长度都收集含空集）
  - 手写 JUnit 锁：invertTree（翻三节点树比对左右互换）/ LCA（造小树找两节点祖先）/ permute（[1,2,3]→6 个）/ subsets（[1,2]→4 个含空集）
  - 提示：先不看书，想清「invertTree 为什么先翻子树再交换」「LCA 为什么 left/right 都非空才返回当前」「permute 的 used 不撤销会怎样」「subsets 为什么不传 used 而传 start」
- [ ] LeetCode（用 Java 写，给题号+提示，不写答案）：
  - **LC 226 翻转二叉树** —— 后序交换左右。提示：先递归翻 left/right，再 `root.left=翻完的右; root.right=翻完的左`；null 直接返
  - **LC 236 二叉树的最近公共祖先** —— 递归。提示：root 命中 p/q 即返；否则左右各找；两边都找到→root 是 LCA，只一边有→那一边；空返 null
  - **LC 46 全排列** —— 回溯 used[]。提示：path 满长即收集；每层遍历 nums，`used[i]` 跳过已选，递归后 `used[i]=false` 撤销
  - **LC 78 子集** —— 回溯 start 推进。提示：每个元素"选/不选"，从 start 往后避免重复组合；path 任意长度都收集（含空集）
- [ ] **项目编码（RAG 已冻结，今天"说"不"写"）**：花 15min 口述「我用递归/回溯思维解决了什么问题」100 字要点——把 Day14-17 的树递归/DFS/回溯和 RAG 工程的"分层/检索"做类比（都靠"相信子模块已处理好"），为第8周 STAR 攒"工程思维"素材。"只看不说"不算，必须逼自己组织语言

### 晚上 19:00-20:00 复盘 [ ]
- [ ] 话术练习：面试官问"回溯算法你怎么理解、和 DFS 什么关系"，你 30 秒答（结合：回溯=带撤销的 DFS / 做选择+撤销选择对称 / 全排列用 used 防重复、子集用 start 推位置）
- [ ] 错题重做：上午两图补全（标满后序顺序 + 红框）；LC226 纸上走一棵三节点树验证左右互换；LC46 走 [1,2,3] 画决策树看 6 个排列怎么来
- [ ] 本文件打勾 + 写明日主题

---

---

## Day 18 — 2026-08-29（第6周·Java 补强：HashMap 原理 + 多线程基础概念 Day 1）✓ 已推送

> 第5周算法 II 已收官：链表✓ / 快慢进阶✓ / 二叉树递归+DFS/BFS✓ / 树改造+回溯✓。算法双主线（双指针·哈希 / 递归·搜索）齐了。今天转入第6周 Java 补强——先啃 HashMap 原理（你 RAG 的 VectorStore/检索全靠它），再补多线程直觉；本周后半段上 MySQL/SQL + HTTP/REST，并把 Java 版 RAG 包成可投递作品（README）。

**主题：HashMap 原理（数组+链表/红黑树、哈希冲突、扩容）+ 多线程基础概念（线程/Runnable/synchronized 直觉）**

### 上午 10:00-12:00 理论精学 [ ]
- [ ] HashMap 底层 = 数组（桶 table[]）+ 链表/红黑树；key 的 hashCode 经扰动函数 → 取模（`& (length-1)`，length 必为 2 的幂）定位桶下标——和你 Day4 写的 VectorStore 检索是同一思路
- [ ] 哈希冲突不可避免：不同 key 算到同一桶，用"链地址法"挂链表；JDK8 后链表长度 ≥8 且桶数 ≥64 转红黑树，查询从 O(n) 降到 O(log n)
- [ ] 扩容机制：负载因子默认 0.75，元素数 > 容量×0.75 触发 resize（容量翻倍 + 重新散列 rehash）——理解"为什么扩容会抖动、为什么 initialCapacity 该按预估量设"
- [ ] 为什么必须重写 equals 和 hashCode：get 先比 hashCode 定位桶、再 equals 确认 key 相等；只改一个 → 明明同一 key 却查不到（复习 Day4 的 `EmbeddingDoc`）
- [ ] hashCode 设计目标：离散均匀才好，全堆一个桶退化成链表；日常 `Objects.hash(...)` 足够
- [ ] 多线程基础：进程 vs 线程（进程=资源容器，线程=执行流，一个进程多线程共享内存）；Java 写线程两种姿势——继承 Thread / 实现 Runnable（**优先 Runnable**，任务与执行解耦，可丢进线程池）
- [ ] 线程安全直觉：多线程同时改共享变量会"竞态"；`synchronized` 给代码块/方法加互斥锁，同一时刻只一个线程进——锁 = 厕所隔间，一人进其他人等
- [ ] 你 RAG 现在是单线程同步服务，暂时用不到锁；但"HashMap 为何非线程安全、ConcurrentHashMap 是什么"面试常问，先建立概念

**今日要点（自己展开）：**
1. HashMap = 桶数组 + 链表/红黑树，定位靠 hashCode 取模
2. 冲突用链地址法，过长转红黑树提查询（O(n)→O(log n)）
3. 负载因子 0.75 + 翻倍扩容，rehash 有成本，initialCapacity 按量设
4. equals/hashCode 成对重写是铁律，否则查不到
5. get 流程：hashCode 定位桶 → equals 比 key → 命中返回
6. 线程是轻量执行流，Runnable 比 Thread 好（任务与执行解耦）
7. synchronized = 互斥锁，解决竞态；锁粒度太粗伤并发
8. ConcurrentHashMap 桶级锁，并发读写比"给 HashMap 加锁"强得多

**资料方向：** 搜「HashMap 底层原理 数组+链表+红黑树 扩容」「为什么负载因子 0.75」「Java 多线程 synchronized 入门」「ConcurrentHashMap 和 HashMap 区别」；回看 Day4 `EmbeddingDoc` 的 equals/hashCode

**手写/画图任务：** 画「HashMap put 流程图」——`key.hashCode()` → 扰动(`h ^ (h>>>16)`) → 取模定位桶 → 桶空直接放 / 桶有链表则遍历 equals 比 key（相等替换、不等尾插）→ 超阈值 resize 翻倍 rehash；在「链表≥8 转红黑树」红框标「为什么转树（链表查询 O(n) → 树 O(log n)）」；在「resize rehash」红框标「为什么扩容会抖（所有元素重算位置）」

### 下午 14:00-18:00 实战 [ ]
- [ ] **Java 纯手写（不抄）**：自己实现一个简化版 HashMap —— `MyHashMap<K,V>`：桶用 `Node<K,V>[] table`（数组 + 链表，先不搞红黑树）；实现 `put(K,V)`（hashCode 取模定位桶、冲突链表尾插、key 相等则覆盖）/ `get(K)`（定位桶 → 遍历链表 equals 比 key → 返回 value）；再写 `int hash(K k)` 扰动函数（`k.hashCode() ^ (k.hashCode()>>>16)`）
  - 提示：先不看书，想清「桶下标怎么算（length 用 2 的幂，`& (length-1)` 代替 %）」「equals 比的是 key 不是 value」「resize 先不实现，标 TODO」——**这本质就是 LeetCode 706 设计哈希映射，写完等于刷了一道**；手写 JUnit 测 put/get/覆盖/查不到返回 null
- [ ] **LeetCode（轻量巩固，给题号+提示，不写答案）**：
  - **LC 146 LRU 缓存**（进阶挑战，HashMap + 双向链表）——提示：HashMap<key,Node> 做到 O(1) 查；双向链表维护"最近使用"顺序，get/put 命中把节点移到头、超容量删尾；今天先想清结构，能写多少写多少（直接应用上午 HashMap 原理）
  - （可选 5min 防手生）**LC 1 两数之和** —— 你 Day9/10 写过，徒手再默写一遍 HashMap 解法
- [ ] **项目编码（包装可投递作品，今天只写文档不碰业务代码）**：给 Java 版 RAG 写 `README.md`——含 ①一句话定位 ②技术栈（Spring Boot + DashScope + 内存向量）③目录结构（Controller/Service/DashScopeClient/VectorStore）④本地运行步骤（配 api-key、`mvn spring-boot:run`、curl 示例）⑤已实现能力清单（对照 Day14 冻结版）⑥第7周深化 backlog（真实 embedding/持久化/单测全绿）⑦面试亮点（四件套 + 端到端）。这是把 demo 从"能跑"变成"能投"的关键一步

### 晚上 19:00-20:00 复盘 [ ]
- [ ] 话术练习：面试官问"HashMap 底层原理是什么、为什么不是线程安全"，你 30 秒答（结合：桶数组+链表/红黑树、hashCode 取模、冲突链地址、负载因子扩容、ConcurrentHashMap 更合适；顺带提"我 RAG 检索就用 HashMap/VectorStore 存文档"）
- [ ] 错题重做：上午 HashMap put 流程图补全（标满扰动+取模+冲突+转树+resize）；LC706 的 `MyHashMap` 在纸上走 `put("a",1)` / `put("a",2)` 覆盖 / `get("a")` 流程
- [ ] 本文件打勾 + 写明日主题

---

## Day 19 — 2026-08-30（第6周·Java 补强：MySQL/SQL + HTTP/REST Day 2）

> 第6周进度：Day18 HashMap原理+多线程概念✓（MyHashMap≈LC706 / README 起步）。今天接 MySQL/SQL + HTTP/REST——这是你 RAG 上云接 pgvector、以及任何 Java 后端岗的硬门槛，且面试必问索引与状态码。

**主题：MySQL/SQL 基础（CRUD / WHERE / JOIN / 索引直觉）+ HTTP/REST 深化（语义 / 状态码 / 无状态 / Cookie vs Token）**

### 上午 10:00-12:00 理论精学 [ ]
- [ ] SQL 为什么必学：你 RAG 若接 pgvector/MySQL 做"文档持久化"，检索就是一条 SQL；后端实习笔试/面试也常考 SQL——今天建立"能写能讲"的底线
- [ ] CRUD 四件套：SELECT（查）/ INSERT（增）/ UPDATE（改）/ DELETE（删）；WHERE 过滤 + ORDER BY / LIMIT 取前 k（和你 Day4 向量取 top-k 同思路）
- [ ] 聚合：GROUP BY 分组 + COUNT/SUM/AVG + HAVING 筛分组结果（WHERE 筛行、HAVING 筛组，顺序别混）
- [ ] JOIN 为什么存在：数据按范式拆多张表避免冗余，跨表查就得 JOIN——INNER（两表都匹配）/ LEFT（左全右补 null）/ RIGHT 反之
- [ ] 索引直觉（重点）：无索引=全表逐行扫 O(n)；有 B+树索引=按 key 分层定位 O(log n)，千万级数据 3~4 层就够——理解"索引就是给查询开快速通道"
- [ ] 最左前缀原则：联合索引 (a,b,c) 只有「a」「a,b」「a,b,c」能命中，「b」「b,c」直接失效——因为 B+树按列顺序先排 a 再排 b；面试常踩
- [ ] HTTP 方法语义：GET 查(幂等) / POST 新建(不幂等) / PUT 全量改 / PATCH 局部改 / DELETE 删——你 `/api/qa` 用 POST 是"提交问题换答案"，不是取资源
- [ ] 状态码：2xx 成功(200/201)；4xx 客户端错(400 参数错 / 401 未认证 / 403 无权限 / 404 不在)；5xx 服务端错(500 = 你 Day8 兜底"暂时无法回答")——错在哪侧一眼分
- [ ] 无状态 + 认证：HTTP 本身无状态(每请求自带全部信息)；Cookie 服务器下发、浏览器自动带、存会话；Token(JWT/Bearer) 客户端自存、手动塞 `Authorization` 头——你 DashScope 用 `Bearer <KEY>` 正是 Token 模式

**今日要点（自己展开）：**
1. SQL = 声明式"我要什么"，优化器决定"怎么取"；索引决定取快不快
2. 全表扫 O(n) vs B+树索引 O(log n) —— 数据量大时差几个数量级
3. 联合索引最左前缀：建索引顺序 = 查询命中顺序，(a,b) 不能服务只查 b 的语句
4. INNER/LEFT/RIGHT JOIN 区别在"不匹配的另一侧补不补 null"
5. 你 RAG 的 pgvector `ORDER BY embedding <=> query LIMIT k` 本质是"向量索引上的 top-k"，和 B+树索引同一思想
6. REST 不是协议是风格：URL 定位资源 + HTTP 方法表动作 + 状态码表结果
7. 400/401/403/404 都"怪客户端"；500 才"怪服务端"——排错先看状态码首位
8. Token vs Cookie：Token 无状态好扩展(适合 API/移动端)，Cookie 简单但绑域名会话

**资料方向：** 搜「MySQL 索引 B+树 为什么快」「联合索引 最左前缀 失效」「HTTP 状态码 大全」「Cookie 和 Token(JWT) 区别」；回看 Day4 向量取 top-k / Day8 DashScope Bearer Token

**手写/画图任务：** 画「B+树索引 vs 全表扫描」对比图——左：全表逐行扫(红字标"O(n)，10万行就 10 万次比较")；右：B+树按 key 分层(根→枝→叶，标"O(log n)，3 层查千万级")；底部写「联合索引 (a,b,c) 最左前缀：查 a/a,b/a,b,c 命中，查 b/b,c 失效」，并画一条"只查 b 时索引用不上的红线"

### 下午 14:00-18:00 实战 [ ]
- [ ] **SQL + Java 持久化骨架（纯手写，不抄完整实现）**：
  - 徒手写 3 条核心 SQL（不用任何工具）：①查"最近 7 天创建且 source='faq' 的文档" ②`Person LEFT JOIN Address` 查"所有人 + 其城市(没地址也留行)" ③建联合索引 `CREATE INDEX idx_doc ON document(user_id, created_at)` 并注释"为什么 (user_id)/(user_id,created_at) 命中、(created_at) 单独不命中"
  - 给 Java 版 RAG 写 `DocumentDao` 骨架(只写方法签名+注释)：`List<EmbeddingDoc> queryByVector(float[] q, int k)`（把 pgvector 的 `ORDER BY embedding <=> ? LIMIT ?` 映射成 Java 方法）、`void upsert(EmbeddingDoc doc)`；想清"SQL 里向量怎么当参数传、结果怎么映射回 EmbeddingDoc"
  - 提示：先不看书，想清「LEFT JOIN 为什么比 INNER 多保留行」「最左前缀为什么 (created_at) 单独查不命中」「pgvector 的 `<=>` 返回距离还是相似度(越小越近)」
- [ ] **LeetCode（用 Java 写，给题号+提示，不写答案）**：
  - **LC 146 LRU 缓存**（收尾 Day18 结构）—— HashMap + 双向链表。提示：HashMap<key,Node> 做到 O(1) 查；双向链表 Node 自带 prev/next 维护"最近使用"顺序；get/put 命中把节点移到头、超容量删尾；容量满时淘汰尾部最久未用
  - **LC 175 组合两个表**（SQL · LEFT JOIN 练习）—— 提示：`SELECT p.FirstName, p.LastName, a.City FROM Person p LEFT JOIN Address a ON p.PersonId = a.PersonId`；用 LEFT 保证"没地址的人也出现，City 为 null"
  - （可选 5min 防手生）**LC 1 两数之和** —— 你 Day9/10 写过，徒手再默写 HashMap 解法
- [ ] **项目编码（RAG 本地跑通 + 演示说明）**：把 Day9 留的"待 JY 自跑 curl 验证"补掉——本地 `mvn spring-boot:run` 起服务，用 curl `POST /api/qa` 问一个你语料里的问题，确认能拿到"基于检索"的回答；把"本地访问步骤 + 一条成功 curl 示例 + 能力演示清单"补进 Day18 起的 README。部署到公网(Vercel 是 Node 环境、Spring Boot 要 JVM)留第7周，今天先锁"本地能演示"

### 晚上 19:00-20:00 复盘 [ ]
- [ ] 话术练习：面试官问"你了解 MySQL 索引吗、为什么用索引、最左前缀是什么"，你 30 秒答（结合：全表扫 O(n) vs B+树 O(log n) / 联合索引最左前缀顺序 / 顺带提 RAG 接 pgvector 也是索引思路）
- [ ] 错题重做：上午 B+树对比图补全（标满 O(n) vs O(log n) + 最左前缀红线）；LC146 纸上走 `put(1,1)→put(2,2)→get(1)→put(3,3)` 看谁被淘汰；LC175 走 Person+Address 两表验证 LEFT JOIN 保留无地址行
- [ ] 本文件打勾 + 写明日主题

---

**明日主题（Day 20）：** 第6周 Java 补强 Day 3 — JVM 浅层（堆/栈/方法区一句话 + GC 为什么存在 + 类加载直觉）+ 把 RAG 接 MySQL/pgvector 持久化尝试 或 部署到可访问地址；LeetCode 轻量复习（LC146/SQL 题巩固）；项目：RAG 跑通后写「面试亮点 + 90 秒 STAR 素材」初稿。

