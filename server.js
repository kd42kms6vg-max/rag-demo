const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 8080;

app.get('/ai/chat', async (req, res) => {
    const message = req.query.message || '你好，请介绍一下你自己';

    // 检查 API Key
    if (!process.env.DASHSCOPE_API_KEY) {
        return res.status(400).json({
            success: false,
            error: '请在 .env 文件中配置 DASHSCOPE_API_KEY'
        });
    }

    try {
        const response = await axios.post(
            'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
            {
                model: 'qwen-plus',  // 性价比最高的模型,更换模型名字就可以换模型
                messages: [
                    { role: 'system', content: '你是一个有用的助手。' },
                    { role: 'user', content: message }
                ]
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.DASHSCOPE_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const reply = response.data.choices[0].message.content;

        res.json({
            success: true,
            reply: reply
        });

    } catch (error) {
        console.error('调用失败:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: error.response?.data?.error?.message || error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`✅ 服务已启动: http://localhost:${PORT}`);
    console.log(`📝 测试地址: http://localhost:${PORT}/ai/chat?message=你好`);
});