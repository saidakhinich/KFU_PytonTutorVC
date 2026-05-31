const AIConfig = {
    API_KEY: '',
    MODEL: 'openai/gpt-oss-120b:free',
    API_URL: 'https://openrouter.ai/api/v1/chat/completions',

    setKey(key) {
        this.API_KEY = key;
    },

    setModel(model) {
        this.MODEL = model;
    }
};

const AI = {
    async checkSolution(taskText, userCode) {
        if (!AIConfig.API_KEY) {
            throw new Error('API ключ не задан. Установите ключ в настройках.');
        }

        const systemPrompt = `Ты — строгий тьютор по программированию на Python.
Пользователь решает задачу и присылает свой код.

Твоя задача:
1. Проверь, решает ли код поставленную задачу корректно.
2. Если код правильный — ответь СТРОГО: RESULT:OK
3. Если код содержит ошибки — ответь СТРОГО в формате:
RESULT:ERROR
ОПИСАНИЕ: кратко что не так
ПОДСКАЗКА: направь мысль ученика, не давай готовый ответ
ИСПРАВЛЕНИЕ: покажи на конкретной строке что исправить (без полного решения)

Правила:
- Не выдавай полное решение, если ошибка небольшая — подскажи направление.
- Если код правильный, хвали и подбадривай.
- Отвечай на русском языке.
- Будь лаконичен.`;

        const response = await fetch(AIConfig.API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AIConfig.API_KEY}`,
                'HTTP-Referer': window.location.href,
                'X-Title': 'Python Tutor'
            },
            body: JSON.stringify({
                model: AIConfig.MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Задача:\n${taskText}\n\nМой код:\n\`\`\`python\n${userCode}\n\`\`\`` }
                ],
                temperature: 0.3,
                max_tokens: 1024
            })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Ошибка API: ${response.status} — ${err}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    },

    parseResult(raw) {
        const trimmed = raw.trim();

        if (trimmed.includes('RESULT:OK')) {
            return { ok: true };
        }

        const extract = (tag) => {
            const regex = new RegExp(`${tag}:\\s*([\\s\\S]*?)(?=RESULT:|$)`, 'i');
            const match = trimmed.match(regex);
            return match ? match[1].trim() : '';
        };

        return {
            ok: false,
            description: extract('ОПИСАНИЕ'),
            hint: extract('ПОДСКАЗКА'),
            fix: extract('ИСПРАВЛЕНИЕ')
        };
    }
};
