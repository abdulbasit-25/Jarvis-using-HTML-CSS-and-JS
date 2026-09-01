/* ==========================================================================
   JARVIS — application logic
   ========================================================================== */
(() => {
    'use strict';

    /* ---------- element refs ---------- */
    const outputArea = document.getElementById('output-area');
    const inputField = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const micBtn = document.getElementById('mic-btn');
    const reactor = document.getElementById('reactor');
    const waveform = document.getElementById('waveform');
    const statusDot = document.getElementById('status-dot');
    const statusLabel = document.getElementById('status-label');
    const clockEl = document.getElementById('clock');
    const themeToggle = document.getElementById('theme-toggle');
    const activityLog = document.getElementById('activity-log');
    const notesList = document.getElementById('notes-list');
    const notesCount = document.getElementById('notes-count');
    const readoutDate = document.getElementById('readout-date');
    const readoutUptime = document.getElementById('readout-uptime');
    const readoutBattery = document.getElementById('readout-battery');
    const readoutVoice = document.getElementById('readout-voice');
    const readoutMic = document.getElementById('readout-mic');

    /* ---------- persistent state ---------- */
    const store = {
        get notes() { try { return JSON.parse(localStorage.getItem('jarvis_notes') || '[]'); } catch { return []; } },
        set notes(v) { localStorage.setItem('jarvis_notes', JSON.stringify(v)); },
        get voiceOn() { return localStorage.getItem('jarvis_voice') !== 'off'; },
        set voiceOn(v) { localStorage.setItem('jarvis_voice', v ? 'on' : 'off'); },
        get theme() { return localStorage.getItem('jarvis_theme') || 'cyan'; },
        set theme(v) { localStorage.setItem('jarvis_theme', v); },
    };

    let history = [];
    let historyIndex = -1;
    const bootTime = Date.now();

    /* ==========================================================================
       BOOT
       ========================================================================== */
    function boot() {
        if (store.theme === 'amber') document.body.classList.add('theme-amber');
        readoutVoice.textContent = store.voiceOn ? 'ON' : 'OFF';
        renderNotes();
        tickClock();
        setInterval(tickClock, 1000);
        setStatus('idle');
        logActivity('System booted.');
        initBattery();
    }

    function tickClock() {
        const now = new Date();
        clockEl.textContent = now.toLocaleTimeString([], { hour12: false });
        readoutDate.textContent = now.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        const uptimeMs = Date.now() - bootTime;
        const s = Math.floor(uptimeMs / 1000) % 60;
        const m = Math.floor(uptimeMs / 60000) % 60;
        const h = Math.floor(uptimeMs / 3600000);
        readoutUptime.textContent = [h, m, s].map(n => String(n).padStart(2, '0')).join(':');
    }

    function initBattery() {
        if (navigator.getBattery) {
            navigator.getBattery().then(bat => {
                const update = () => {
                    readoutBattery.textContent = `${Math.round(bat.level * 100)}%${bat.charging ? ' ⚡' : ''}`;
                };
                update();
                bat.addEventListener('levelchange', update);
                bat.addEventListener('chargingchange', update);
            }).catch(() => { readoutBattery.textContent = 'N/A'; });
        } else {
            readoutBattery.textContent = 'N/A';
        }
    }

    /* ==========================================================================
       STATUS / REACTOR STATE
       ========================================================================== */
    function setStatus(state) {
        statusDot.className = 'status-dot';
        reactor.className = '';
        waveform.classList.remove('active');
        switch (state) {
            case 'idle':
                statusDot.classList.add('on');
                statusLabel.textContent = 'ONLINE';
                break;
            case 'thinking':
                statusDot.classList.add('busy');
                statusLabel.textContent = 'PROCESSING';
                break;
            case 'listening':
                statusDot.classList.add('listening');
                statusLabel.textContent = 'LISTENING';
                reactor.classList.add('listening');
                readoutMic.textContent = 'LIVE';
                break;
            case 'speaking':
                statusDot.classList.add('busy');
                statusLabel.textContent = 'SPEAKING';
                reactor.classList.add('speaking');
                waveform.classList.add('active');
                animateWaveform();
                break;
        }
        if (state !== 'listening') readoutMic.textContent = 'IDLE';
    }

    let waveformTimer = null;
    function animateWaveform() {
        clearInterval(waveformTimer);
        const bars = waveform.querySelectorAll('span');
        waveformTimer = setInterval(() => {
            bars.forEach(b => { b.style.height = waveform.classList.contains('active') ? `${4 + Math.random() * 16}px` : '4px'; });
        }, 110);
    }
    function stopWaveform() {
        clearInterval(waveformTimer);
        waveform.classList.remove('active');
        waveform.querySelectorAll('span').forEach(b => b.style.height = '4px');
    }

    /* ==========================================================================
       LOGGING / NOTES
       ========================================================================== */
    function logActivity(text) {
        const li = document.createElement('li');
        const t = new Date().toLocaleTimeString([], { hour12: false });
        li.innerHTML = `<b>${t}</b> — ${text}`;
        activityLog.insertBefore(li, activityLog.firstChild);
        while (activityLog.children.length > 8) activityLog.removeChild(activityLog.lastChild);
    }

    function renderNotes() {
        const notes = store.notes;
        notesCount.textContent = `(${notes.length})`;
        notesList.innerHTML = '';
        if (notes.length === 0) {
            notesList.innerHTML = '<li class="notes-empty">No notes yet. Try "note: pick up dry cleaning".</li>';
            return;
        }
        notes.forEach((n, i) => {
            const li = document.createElement('li');
            li.textContent = n;
            const del = document.createElement('span');
            del.className = 'note-del';
            del.textContent = '✕';
            del.title = 'Delete note';
            del.onclick = () => {
                const updated = store.notes.filter((_, idx) => idx !== i);
                store.notes = updated;
                renderNotes();
                logActivity('Note removed.');
            };
            li.appendChild(del);
            notesList.appendChild(li);
        });
    }

    /* ==========================================================================
       SPEECH SYNTHESIS (voice output)
       ========================================================================== */
    let preferredVoice = null;
    function pickVoice() {
        const voices = speechSynthesis.getVoices();
        preferredVoice =
            voices.find(v => /Daniel|Google UK English Male|Arthur|Alex/i.test(v.name)) ||
            voices.find(v => /en-GB/i.test(v.lang) && /male/i.test(v.name)) ||
            voices.find(v => /en/i.test(v.lang)) ||
            voices[0] || null;
    }
    if ('speechSynthesis' in window) {
        speechSynthesis.onvoiceschanged = pickVoice;
        pickVoice();
    }

    function speak(text) {
        if (!store.voiceOn || !('speechSynthesis' in window)) return;
        speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        if (preferredVoice) utter.voice = preferredVoice;
        utter.rate = 1.0;
        utter.pitch = 0.85;
        utter.onstart = () => setStatus('speaking');
        utter.onend = () => { stopWaveform(); setStatus('idle'); };
        utter.onerror = () => { stopWaveform(); setStatus('idle'); };
        speechSynthesis.speak(utter);
    }

    /* ==========================================================================
       SPEECH RECOGNITION (voice input)
       ========================================================================== */
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognizer = null;
    let isRecording = false;

    if (SpeechRecognition) {
        recognizer = new SpeechRecognition();
        recognizer.lang = 'en-US';
        recognizer.interimResults = false;
        recognizer.maxAlternatives = 1;

        recognizer.onstart = () => { isRecording = true; micBtn.classList.add('recording'); setStatus('listening'); };
        recognizer.onend = () => { isRecording = false; micBtn.classList.remove('recording'); if (statusLabel.textContent === 'LISTENING') setStatus('idle'); };
        recognizer.onerror = () => { isRecording = false; micBtn.classList.remove('recording'); setStatus('idle'); };
        recognizer.onresult = (e) => {
            const transcript = e.results[0][0].transcript;
            inputField.value = transcript;
            handleSubmit();
        };
    } else {
        micBtn.disabled = true;
        micBtn.title = 'Voice input not supported in this browser';
        micBtn.style.opacity = 0.35;
    }

    micBtn.addEventListener('click', () => {
        if (!recognizer) return;
        if (isRecording) { recognizer.stop(); } else { try { recognizer.start(); } catch (_) { } }
    });

    /* ==========================================================================
       OPTIONAL LOCAL AUDIO CUES (best-effort — silently ignored if missing)
       ========================================================================== */
    function tryPlayLocal(id) {
        const el = document.getElementById(id);
        if (!el) return false;
        el.currentTime = 0;
        const p = el.play();
        if (p && p.catch) p.catch(() => { }); // ignore missing-file / autoplay errors
        return true;
    }

    /* ==========================================================================
       TYPEWRITER OUTPUT
       ========================================================================== */
    function printUser(text) {
        const div = document.createElement('div');
        div.className = 'user-command';
        div.innerHTML = `<strong>You</strong>${escapeHtml(text)}`;
        outputArea.appendChild(div);
        scrollToBottom();
    }

    function printJarvis(text, { speakToo = true, cueId = null } = {}) {
        const div = document.createElement('div');
        div.className = 'jarvis-response';
        outputArea.appendChild(div);
        scrollToBottom();

        if (cueId) tryPlayLocal(cueId);
        if (speakToo) speak(text);
        else setStatus('idle');

        let i = 0;
        const speed = Math.max(6, 22 - Math.floor(text.length / 40));
        const timer = setInterval(() => {
            div.textContent += text.charAt(i);
            i++;
            scrollToBottom();
            if (i >= text.length) clearInterval(timer);
        }, speed);
    }

    function scrollToBottom() {
        const wrap = document.getElementById('jarvis-output');
        wrap.scrollTop = wrap.scrollHeight;
    }

    function escapeHtml(str) {
        return str.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    /* ==========================================================================
       COMMAND DEFINITIONS
       ========================================================================== */
    const jokes = [
        "Why don't scientists trust atoms? Because they make up everything.",
        "I would tell you a UDP joke, but you might not get it.",
        "There are 10 types of people: those who understand binary, and those who don't.",
        "Why do programmers prefer dark mode? Because light attracts bugs.",
        "I've got a great joke about arc reactors, but it needs more power.",
    ];

    function safeEval(expr) {
        if (!/^[0-9+\-*/().\s%^]+$/.test(expr)) return null;
        try {
            const normalized = expr.replace(/\^/g, '**');
            // eslint-disable-next-line no-new-func
            const val = Function(`"use strict"; return (${normalized})`)();
            return Number.isFinite(val) ? val : null;
        } catch { return null; }
    }

    async function fetchWeather(place) {
        try {
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(place)}&count=1`);
            const geo = await geoRes.json();
            if (!geo.results || !geo.results.length) return `I couldn't find a location called "${place}", sir.`;
            const { latitude, longitude, name, country } = geo.results[0];
            const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,relative_humidity_2m`);
            const w = await wRes.json();
            const c = w.current;
            if (!c) return `I retrieved coordinates for ${name}, but the forecast service didn't respond, sir.`;
            return `Currently in ${name}, ${country}: ${c.temperature_2m}°C, humidity ${c.relative_humidity_2m}%, wind ${c.wind_speed_10m} km/h.`;
        } catch {
            return "I couldn't reach the weather service — check the connection, sir.";
        }
    }

    function greetingByTime() {
        const h = new Date().getHours();
        if (h < 5) return 'burning the midnight oil, sir';
        if (h < 12) return 'good morning, sir';
        if (h < 17) return 'good afternoon, sir';
        if (h < 21) return 'good evening, sir';
        return 'still up, sir';
    }

    /* Each rule: { test: (lowerInput) => bool, run: (raw, lower) => string | Promise<string> } */
    const rules = [
        {
            test: l => /\bi'?m back\b|^i am back/.test(l),
            run: () => "Welcome back, sir. Systems are already spun up — feel free to grab a coffee while I finish the last checks.",
        },
        {
            test: l => /^hey\b|^hi\b|^hello\b/.test(l),
            run: () => `At your service — ${greetingByTime()}.`,
        },
        {
            test: l => l.includes('introduce yourself') || l.includes('who are you'),
            run: () => "I am JARVIS — a virtual assistant here to help with information, quick calculations, notes, reminders, and a bit of conversation. All systems operational.",
        },
        {
            test: l => l.includes('battery'),
            run: () => readoutBattery.textContent && readoutBattery.textContent !== '—'
                ? `Current battery level is ${readoutBattery.textContent}.`
                : "I can't read battery data on this device, sir.",
            cueId: 'Batterylow',
        },
        {
            test: l => /^weather|weather (in|for)/.test(l),
            run: async (raw, l) => {
                const match = raw.match(/weather (?:in|for)\s+(.+)/i);
                const place = match ? match[1].trim() : null;
                if (!place) return "Tell me a city — for example, 'weather in Lahore'.";
                return await fetchWeather(place);
            },
        },
        {
            test: l => l.includes('what time') || l === 'time' || l.includes("what's the time"),
            run: () => `The current time is ${new Date().toLocaleTimeString()}.`,
        },
        {
            test: l => l.includes('date') && !l.includes('update'),
            run: () => `Today's date is ${new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`,
        },
        {
            test: l => /^calculate|^calc\b|^what is [\d.]/.test(l),
            run: (raw) => {
                const expr = raw.replace(/^calculate|^calc\b|^what is/i, '').trim();
                const result = safeEval(expr);
                return result === null ? "I couldn't evaluate that expression, sir." : `${expr} = ${result}`;
            },
        },
        {
            test: l => l.startsWith('note:') || l.startsWith('note to self:') || l.startsWith('remember'),
            run: (raw) => {
                const content = raw.replace(/^note to self:|^note:|^remember (that )?/i, '').trim();
                if (!content) return "What would you like me to note, sir?";
                const notes = store.notes;
                notes.push(content);
                store.notes = notes;
                renderNotes();
                logActivity('Note saved.');
                return `Noted: "${content}".`;
            },
        },
        {
            test: l => l.includes('show notes') || l === 'notes',
            run: () => {
                const notes = store.notes;
                if (!notes.length) return "You have no notes saved, sir.";
                return `You have ${notes.length} note${notes.length > 1 ? 's' : ''}:\n${notes.map((n, i) => `${i + 1}. ${n}`).join('\n')}`;
            },
        },
        {
            test: l => l.includes('clear notes'),
            run: () => { store.notes = []; renderNotes(); logActivity('Notes cleared.'); return "All notes cleared, sir."; },
        },
        {
            test: l => /set (a )?timer for/.test(l),
            run: (raw) => {
                const m = raw.match(/(\d+)\s*(second|minute|hour)/i);
                if (!m) return "Tell me a duration — for example, 'set a timer for 5 minutes'.";
                const n = parseInt(m[1], 10);
                const unit = m[2].toLowerCase();
                const ms = unit.startsWith('hour') ? n * 3600000 : unit.startsWith('minute') ? n * 60000 : n * 1000;
                setTimeout(() => {
                    printJarvis(`Timer complete — ${n} ${unit}${n > 1 ? 's' : ''} have elapsed, sir.`);
                    logActivity('Timer finished.');
                }, ms);
                logActivity(`Timer set: ${n} ${unit}(s).`);
                return `Timer set for ${n} ${unit}${n > 1 ? 's' : ''}, sir. I'll let you know.`;
            },
        },
        {
            test: l => l.includes('reboot') || l.includes('restart'),
            run: () => { setTimeout(() => location.reload(), 1800); return "Rebooting interface — see you in a moment, sir."; },
            cueId: 'reboot',
        },
        {
            test: l => l.includes('shutdown') || l.includes('shut down') || l.includes('goodbye') || l.includes('go to sleep'),
            run: () => { document.body.style.transition = 'opacity 1.5s ease'; setTimeout(() => document.body.style.opacity = '0.15', 400); return "Shutting down non-essential systems. Goodbye, sir."; },
        },
        {
            test: l => l.includes('clear') && (l.includes('screen') || l.includes('output') || l === 'clear'),
            run: () => { outputArea.innerHTML = ''; return "Display cleared."; },
        },
        {
            test: l => l.includes('open music'),
            run: () => { window.open('https://open.spotify.com', '_blank'); return "Opening your music player, sir."; },
        },
        {
            test: l => l.startsWith('search'),
            run: (raw) => {
                const q = raw.replace(/^search( for)?/i, '').trim();
                if (!q) return "What would you like me to search for, sir?";
                window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, '_blank');
                return `Searching for "${q}", sir.`;
            },
        },
        {
            test: l => l.includes('play game'),
            run: () => "Launching a quick diversion — try asking me for 'a joke' while I warm things up. Full game integration coming soon, sir.",
        },
        {
            test: l => l === 'help' || l.includes('what can you do'),
            run: () => "I can handle: time · date · weather in <city> · calculate <expression> · note: <text> · show notes · set a timer for <n> minutes · joke · battery · search <query> · reboot · shutdown · clear. Speak or type any of these.",
        },
        {
            test: l => l.includes('news'),
            run: () => { window.open('https://news.google.com', '_blank'); return "Opening the latest headlines, sir."; },
        },
        {
            test: l => l.includes('settings'),
            run: () => "Use the ◐ icon in the top-right to switch the interface palette. More settings are on the way, sir.",
        },
        {
            test: l => l.includes('joke'),
            run: () => jokes[Math.floor(Math.random() * jokes.length)],
        },
        {
            test: l => l.includes('mute') || l.includes('voice off'),
            run: () => { store.voiceOn = false; readoutVoice.textContent = 'OFF'; return "Voice output disabled."; },
        },
        {
            test: l => l.includes('unmute') || l.includes('voice on'),
            run: () => { store.voiceOn = true; readoutVoice.textContent = 'ON'; return "Voice output enabled."; },
        },
        {
            test: l => l.includes('thank'),
            run: () => "Always a pleasure, sir.",
        },
    ];

    const fallbacks = [
        "I'm not certain I follow — try 'help' to see what I can do.",
        "That one's outside my current parameters, sir. Type 'help' for a list of commands.",
        "I didn't quite catch a valid command there.",
    ];

    /* ==========================================================================
       SUBMIT HANDLER
       ========================================================================== */
    async function handleSubmit() {
        const raw = inputField.value.trim();
        if (!raw) return;

        history.push(raw);
        historyIndex = history.length;

        printUser(raw);
        inputField.value = '';
        setStatus('thinking');

        const lower = raw.toLowerCase();
        const matched = rules.find(r => r.test(lower));

        await new Promise(res => setTimeout(res, 220)); // brief "thinking" beat

        let response;
        let cueId = null;
        if (matched) {
            response = await matched.run(raw, lower);
            cueId = matched.cueId || null;
            logActivity(`Command: "${raw.slice(0, 40)}"`);
        } else {
            response = fallbacks[Math.floor(Math.random() * fallbacks.length)];
            logActivity(`Unrecognized: "${raw.slice(0, 40)}"`);
        }

        printJarvis(response, { cueId });
    }

    /* ==========================================================================
       EVENTS
       ========================================================================== */
    sendBtn.addEventListener('click', handleSubmit);
    inputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { handleSubmit(); return; }
        if (e.key === 'ArrowUp') {
            if (historyIndex > 0) { historyIndex--; inputField.value = history[historyIndex]; }
            e.preventDefault();
        }
        if (e.key === 'ArrowDown') {
            if (historyIndex < history.length - 1) { historyIndex++; inputField.value = history[historyIndex]; }
            else { historyIndex = history.length; inputField.value = ''; }
            e.preventDefault();
        }
    });

    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', () => { inputField.value = btn.dataset.cmd; handleSubmit(); });
    });

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('theme-amber');
        store.theme = document.body.classList.contains('theme-amber') ? 'amber' : 'cyan';
    });

    boot();
})();