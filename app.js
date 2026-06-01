const App = {
    currentTaskIndex: 0,
    taskResults: {},
    attempts: {},
    _autoAdvanceTimer: null,

    init() {
        this.currentTaskIndex = 0;
        this.bindSettingsEvents();
        this.render();
        const savedKey = sessionStorage.getItem('tutor_api_key');
        if (!savedKey) {
            this.showKeyPrompt();
        }
    },

    showKeyPrompt() {
        document.getElementById('key-overlay').classList.add('visible');
    },

    hideKeyPrompt() {
        document.getElementById('key-overlay').classList.remove('visible');
    },

    bindSettingsEvents() {
        const keyInput = document.getElementById('api-key-input');
        const modelInput = document.getElementById('model-input');
        const saveBtn = document.getElementById('save-settings-btn');
        const settingsBtn = document.getElementById('settings-toggle');
        const settingsPanel = document.getElementById('settings-panel');
        const promptSaveBtn = document.getElementById('key-save-btn');
        const promptKeyInput = document.getElementById('key-prompt-input');

        settingsBtn.addEventListener('click', () => {
            settingsPanel.classList.toggle('visible');
        });

        const savedModel = localStorage.getItem('tutor_model');
        if (savedModel) {
            modelInput.value = savedModel;
            AIConfig.setModel(savedModel);
        }

        saveBtn.addEventListener('click', () => {
            const key = keyInput.value.trim();
            const model = modelInput.value.trim();
            if (key) {
                AIConfig.setKey(key);
                sessionStorage.setItem('tutor_api_key', key);
            }
            if (model) {
                AIConfig.setModel(model);
                localStorage.setItem('tutor_model', model);
            }
            settingsPanel.classList.remove('visible');
        });

        promptSaveBtn.addEventListener('click', () => {
            const key = promptKeyInput.value.trim();
            if (key) {
                AIConfig.setKey(key);
                sessionStorage.setItem('tutor_api_key', key);
                this.hideKeyPrompt();
            }
        });

        promptKeyInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') promptSaveBtn.click();
        });
    },

    render() {
        clearTimeout(this._autoAdvanceTimer);
        this._autoAdvanceTimer = null;
        this.renderProgress();
        this.renderTask();
        this.hideResult();
    },

    renderProgress() {
        const container = document.getElementById('task-progress');
        container.innerHTML = '';
        Tasks.forEach((task, i) => {
            const dot = document.createElement('div');
            dot.className = 'progress-dot';
            if (i === this.currentTaskIndex) dot.classList.add('active');
            if (this.taskResults[task.id] === true) dot.classList.add('done');
            if (this.taskResults[task.id] === false && this.attempts[task.id] >= 3) dot.classList.add('failed');
            dot.title = task.title;
            container.appendChild(dot);
        });
    },

    renderTask() {
        const task = Tasks[this.currentTaskIndex];
        const card = document.getElementById('task-card');

        card.innerHTML = `
            <div class="task-header">
                <div class="task-title">${this.currentTaskIndex + 1}. ${task.title}</div>
                <span class="task-difficulty diff-${task.difficulty}">${
                    task.difficulty === 'easy' ? 'Лёгкая' :
                    task.difficulty === 'medium' ? 'Средняя' : 'Сложная'
                }</span>
            </div>
            <div class="task-description">${task.description}</div>
        `;

        document.getElementById('hint-block').classList.remove('visible');

        const textarea = document.getElementById('code-input');
        textarea.value = '';
        textarea.placeholder = `# Напиши код для задачи "${task.title}"...`;
        textarea.disabled = false;

        document.getElementById('submit-btn').disabled = false;
        document.getElementById('submit-btn').textContent = 'Проверить';

        this.updateNavButtons();
    },

    showHint() {
        const task = Tasks[this.currentTaskIndex];
        if (!task.hint) return;

        const items = task.hint.research.map(q => `<li>${q}</li>`).join('');

        const block = document.getElementById('hint-block');
        block.innerHTML = `
            <div class="hint-theory">${task.hint.theory}</div>
            <div class="hint-research">
                <span class="label">На что обратить внимание:</span>
                <ul>${items}</ul>
            </div>
        `;
        block.classList.add('visible');
    },

    updateNavButtons() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        prevBtn.disabled = this.currentTaskIndex === 0;
        nextBtn.disabled = this.currentTaskIndex === Tasks.length - 1;
    },

    hideResult() {
        document.getElementById('result-card').classList.remove('visible');
    },

    showResult(type, title, body) {
        const card = document.getElementById('result-card');
        const iconClass = type === 'success' ? 'success' : type === 'error' ? 'error' : 'warning';
        const iconSymbol = type === 'success' ? '\u2713' : type === 'error' ? '\u2717' : '!';

        card.innerHTML = `
            <div class="result-header">
                <div class="result-icon ${iconClass}">${iconSymbol}</div>
                <span>${title}</span>
            </div>
            <div class="result-body">${body}</div>
        `;
        card.classList.add('visible');
    },

    async submit() {
        clearTimeout(this._autoAdvanceTimer);
        this._autoAdvanceTimer = null;

        const task = Tasks[this.currentTaskIndex];
        const code = document.getElementById('code-input').value.trim();

        if (!code) {
            this.showResult('warning', 'Пустой код', 'Введите решение перед проверкой.');
            return;
        }

        if (!AIConfig.API_KEY) {
            this.showResult('warning', 'Нет API ключа', 'Откройте настройки и введите ключ OpenRouter.');
            return;
        }

        const btn = document.getElementById('submit-btn');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span>Проверяю...';

        const textarea = document.getElementById('code-input');
        textarea.disabled = true;

        try {
            const raw = await AI.checkSolution(task.description, code);
            const result = AI.parseResult(raw);

            if (result.ok) {
                this.taskResults[task.id] = true;
                this.showResult('success', 'Верно! Отличная работа!', 'Код решает задачу правильно.');
                ClippyAssistant.sayRandom('success');
                if (this.currentTaskIndex < Tasks.length - 1) {
                    this._autoAdvanceTimer = setTimeout(() => {
                        this.nextTask();
                        this._autoAdvanceTimer = null;
                    }, 3500);
                }
            } else {
                if (!this.attempts[task.id]) this.attempts[task.id] = 0;
                this.attempts[task.id]++;

                let body = '';
                if (result.description) body += `<p>${result.description}</p>`;
                if (result.hint) body += `<p style="margin-top:10px;"><strong>Подсказка:</strong> ${result.hint}</p>`;
                if (result.fix) body += `<pre>${result.fix}</pre>`;
                if (this.attempts[task.id] >= 3) {
                    body += `<p style="margin-top:10px;color:var(--warning);">Попыток израсходовано (${this.attempts[task.id]}). Попробуй перечитать условие или подсказку.</p>`;
                } else {
                    body += `<p style="margin-top:10px;color:var(--text-dim);">Попытка ${this.attempts[task.id]} из 3.</p>`;
                }

                this.showResult('error', 'Есть ошибки', body);
                ClippyAssistant.sayRandom('error');
            }
        } catch (err) {
            this.showResult('error', 'Ошибка', err.message);
        } finally {
            btn.disabled = false;
            btn.textContent = 'Проверить';
            textarea.disabled = false;
            this.renderProgress();
        }
    },

    reset() {
        this.currentTaskIndex = 0;
        this.taskResults = {};
        this.attempts = {};
        this.render();
        ClippyAssistant.say('Начинаем с чистого листа! Вперёд!');
        if (ClippyAssistant.soundEnabled) SoundFX.welcome();
    },

    prevTask() {
        if (this.currentTaskIndex > 0) {
            this.currentTaskIndex--;
            this.render();
            ClippyAssistant.sayRandom('taskSwitch');
        }
    },

    nextTask() {
        if (this.currentTaskIndex < Tasks.length - 1) {
            this.currentTaskIndex++;
            this.render();
            ClippyAssistant.sayRandom('taskSwitch');
        }
    }
};

const SoundFX = {
    _ctx: null,
    _ensure() {
        if (!this._ctx) this._ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (this._ctx.state === 'suspended') this._ctx.resume();
        return this._ctx;
    },
    _note(freq, duration, type, gain) {
        const ctx = this._ensure();
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type || 'sine';
        osc.frequency.value = freq;
        g.gain.value = gain || 0.15;
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start();
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.stop(ctx.currentTime + duration);
    },
    welcome() {
        const ctx = this._ensure();
        [523, 659, 784].forEach((f, i) => {
            setTimeout(() => this._note(f, 0.2, 'sine', 0.12), i * 120);
        });
    },
    success() {
        const ctx = this._ensure();
        [523, 659, 784, 1047].forEach((f, i) => {
            setTimeout(() => this._note(f, 0.25, 'triangle', 0.15), i * 100);
        });
    },
    error() {
        const ctx = this._ensure();
        [440, 370, 330].forEach((f, i) => {
            setTimeout(() => this._note(f, 0.3, 'sawtooth', 0.08), i * 150);
        });
    },
    click() {
        this._note(880, 0.06, 'sine', 0.1);
    },
    taskSwitch() {
        this._note(660, 0.1, 'triangle', 0.1);
        setTimeout(() => this._note(880, 0.1, 'triangle', 0.1), 80);
    }
};

const ClippyAssistant = {
    soundEnabled: true,
    messages: {
        welcome: [
            'Привет! Я Скриппи — твой бумажный помощник!',
            'Готов решать задачи? Я верю в тебя!',
            'Не стесняйся нажимать на меня, если нужен совет!'
        ],
        success: [
            'Супер! Ты просто гений кода!',
            'Отлично! Так держать!',
            'Молодец! Одна задача готова!',
            'Красивое решение! Я впечатлён!'
        ],
        error: [
            'Не сдавайся! Ошибки — это часть учёбы.',
            'Попробуй ещё раз, у тебя получится!',
            'Давай-ка подумаем вместе. Что пошло не так?',
            'Не переживай! Даже я иногда застреваю в степлере.'
        ],
        click: [
            'Привет! Нужна помощь?',
            'Я рядом, если что!',
            'Ты справляешься! Продолжай в том же духе!',
            'Помни: программирование — это магия, которую ты творишь сам!'
        ],
        taskSwitch: [
            'О, новая задача! Интересно!',
            'Вперёд к новым вершинам!',
            'Смотри, какая классная задачка!'
        ]
    },

    say(text) {
        const bubble = document.getElementById('clippy-bubble');
        const textEl = document.getElementById('clippy-text');
        textEl.textContent = text;
        bubble.classList.add('visible');
        clearTimeout(this._timeout);
        this._timeout = setTimeout(() => bubble.classList.remove('visible'), 6000);
    },

    sayRandom(category) {
        const msgs = this.messages[category];
        if (!msgs) return;
        this.say(msgs[Math.floor(Math.random() * msgs.length)]);
        if (SoundFX[category] && this.soundEnabled) SoundFX[category]();
    },

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const el = document.getElementById('sound-toggle');
        el.textContent = this.soundEnabled ? '\u{1F50A}' : '\u{1F507}';
    },

    init() {
        const body = document.getElementById('clippy-body');
        const close = document.getElementById('clippy-close');
        const bubble = document.getElementById('clippy-bubble');
        const soundToggle = document.getElementById('sound-toggle');

        body.addEventListener('click', () => {
            this.sayRandom('click');
        });

        close.addEventListener('click', (e) => {
            e.stopPropagation();
            bubble.classList.remove('visible');
        });

        soundToggle.addEventListener('click', () => {
            this.toggleSound();
        });

        setTimeout(() => {
            this.sayRandom('welcome');
            if (this.soundEnabled) SoundFX.welcome();
        }, 800);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
    ClippyAssistant.init();
});
