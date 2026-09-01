'use strict';

/* ================= Helpers & refs ================= */
const $ = (id) => document.getElementById(id);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const outputArea = $('output-area');
const inputField = $('user-input');
const micBtn = $('mic-btn');
const voiceToggle = $('voice-toggle');
const sendBtn = $('send-btn');
const suggestionBar = $('suggestion-bar');

/* ================= State (persisted) ================= */
let voiceEnabled = localStorage.getItem('jvs_voice') !== '0';
let history = [];
let notes = [];
try { history = JSON.parse(localStorage.getItem('jvs_history')) || []; } catch (e) { }
try { notes = JSON.parse(localStorage.getItem('jvs_notes')) || []; } catch (e) { }

const saveHistory = () => localStorage.setItem('jvs_history', JSON.stringify(history.slice(-80)));
const saveNotes = () => localStorage.setItem('jvs_notes', JSON.stringify(notes));

/* ================= Audio & voice ================= */
const sfx = {
    hello: $('hello-sound'),
    service: $('AtyourService'),
    intro: $('Introduction'),
    battery: $('Batterylow'),
    reboot: $('reboot'),
};

function playSfx(key) {
    if (!voiceEnabled || !sfx[key]) return;
    sfx[key].currentTime = 0;
    sfx[key].play().catch(() => { });
}

if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();

function speak(text) {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    const clean = text.replace(/[\n•]/g, '. ').replace(/\s+/g, ' ').slice(0, 300);
    const u = new SpeechSynthesisUtterance(clean);
    u.rate = 1; u.pitch = 0.85;
    const voice = speechSynthesis.getVoices().find(v => /daniel|george|uk english male|en-gb/i.test(v.name + v.lang));
    if (voice) u.voice = voice;
    speechSynthesis.speak(u);
}

voiceToggle.textContent = voiceEnabled ? '🔊' : '🔇';
voiceToggle.addEventListener('click', () => {
    voiceEnabled = !voiceEnabled;
    localStorage.setItem('jvs_voice', voiceEnabled ? '1' : '0');
    voiceToggle.textContent = voiceEnabled ? '🔊' : '🔇';
    if (!voiceEnabled && 'speechSynthesis' in window) speechSynthesis.cancel();
    Object.values(sfx).forEach(a => a.pause());
    if (voiceEnabled) jarvisSay('Voice modules online, sir.', { typeIt: false });
});

/* ================= Messages ================= */
const scrollBottom = () => { outputArea.scrollTop = outputArea.scrollHeight; };

function addUserMsg(text) {
    const d = document.createElement('div');
    d.className = 'user-command';
    d.textContent = 'You ▸ ' + text;
    outputArea.appendChild(d);
    scrollBottom();
    history.push({ who: 'user', text });
    saveHistory();
}

async function jarvisSay(text, { sfxKey = null, tts = true, typeIt = true } = {}) {
    const d = document.createElement('div');
    d.className = 'jarvis-response';
    outputArea.appendChild(d);

    if (sfxKey) playSfx(sfxKey);

    if (typeIt) {
        const speed = text.length > 140 ? 8 : 14;
        for (let i = 0; i < text.length; i++) {
            d.textContent += text[i];
            if (i % 3 === 0) scrollBottom();
            await sleep(speed);
        }
    } else {
        d.textContent = text;
    }
    scrollBottom();
    if (tts) speak(text);
    history.push({ who: 'jarvis', text });
    saveHistory();
}

function showTyping() {
    const d = document.createElement('div');
    d.className = 'jarvis-response typing-indicator';
    d.innerHTML = '<span></span><span></span><span></span>';
    outputArea.appendChild(d);
    scrollBottom();
    return d;
}

function restoreHistory() {
    if (!history.length) return false;
    const note = document.createElement('div');
    note.className = 'system-note';
    note.textContent = '— previous session restored —';
    outputArea.appendChild(note);
    history.forEach((m) => {
        const d = document.createElement('div');
        d.className = m.who === 'user' ? 'user-command' : 'jarvis-response';
        d.textContent = (m.who === 'user' ? 'You ▸ ' : '') + m.text;
        outputArea.appendChild(d);
    });
    scrollBottom();
    return true;
}

/* ================= Feature utilities ================= */
const WEATHER_CODES = {
    0: 'a clear sky', 1: 'mainly clear skies', 2: 'partly cloudy skies', 3: 'overcast skies',
    45: 'fog', 48: 'freezing fog', 51: 'light drizzle', 53: 'drizzle', 55: 'heavy drizzle',
    61: 'light rain', 63: 'rain', 65: 'heavy rain', 71: 'light snow', 73: 'snow', 75: 'heavy snow',
    80: 'rain showers', 81: 'rain showers', 82: 'violent rain showers',
    95: 'a thunderstorm', 96: 'a thunderstorm with hail', 99: 'a thunderstorm with heavy hail',
};

async function getWeather() {
    if (!navigator.geolocation) throw 'geolocation is unavailable in this browser';
    const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, () => rej('location access was denied'), { timeout: 9000 })
    );
    const { latitude, longitude } = pos.coords;
    const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
    if (!r.ok) throw 'the weather service is unreachable';
    const w = (await r.json()).current_weather;
    return `Currently ${WEATHER_CODES[w.weathercode] || 'unidentified conditions'} at your location, sir — ${Math.round(w.temperature)}°C with winds at ${Math.round(w.windspeed)} km/h.`;
}

async function batteryResponse() {
    if (!navigator.getBattery) return 'This browser does not expose battery diagnostics, sir.';
    const b = await navigator.getBattery();
    const pct = Math.round(b.level * 100);
    if (b.charging) return `Battery is at ${pct}% and charging, sir.`;
    if (pct <= 20) return `Warning, sir — battery power is running low at ${pct}%. May I suggest you charge it soon?`;
    const remain = Number.isFinite(b.dischargingTime) && b.dischargingTime > 0
        ? ` Roughly ${Math.round(b.dischargingTime / 60)} minutes remaining.` : '';
    return `Battery is at ${pct}%, sir.${remain}`;
}

function calculate(expr) {
    const clean = String(expr).replace(/[^0-9+\-*/().% ]/g, '').trim();
    if (!clean || !/[0-9]/.test(clean)) return null;
    try {
        const val = Function('"use strict"; return (' + clean + ')')();
        return (typeof val === 'number' && isFinite(val)) ? Math.round(val * 1e6) / 1e6 : null;
    } catch { return null; }
}

/* ================= Command registry ================= */
const jokes = [
    "Why don't scientists trust atoms? Because they make up everything!",
    "I told my computer I needed a break — it said 'no problem, I'll go to sleep.'",
    "Why did the developer go broke? Because he used up all his cache.",
    "I would tell you a UDP joke, but you might not get it.",
    "Why do Java developers wear glasses? Because they don't C#.",
];

const quotes = [
    '"The best way out is always through." — Robert Frost',
    '"Sometimes you gotta run before you can walk." — Tony Stark',
    '"Genius is one percent inspiration, ninety-nine percent perspiration." — Thomas Edison',
    '"It always seems impossible until it is done." — Nelson Mandela',
];

const commands = [
    {
        test: /^(i am back|i'?m back|i'?m here)/i, sfxKey: 'hello',
        run: () => pick([
            'Welcome back, sir. All systems are online and running at optimal capacity.',
            "Good to have you back, sir. I've kept everything warm for you.",
        ])
    },

    {
        test: /\b(hello|hi|hey|greetings)\b/i, sfxKey: 'service',
        run: () => pick([
            'At your service, sir.',
            'Hello, sir. How may I be of assistance?',
            'Good day, sir. All systems nominal.',
        ])
    },

    {
        test: /(introduce yourself|who are you|what are you)/i, sfxKey: 'intro',
        run: () => 'Allow me to introduce myself. I am JARVIS, a virtual artificial intelligence, here to assist you with a variety of tasks as best I can — 24 hours a day, 7 days a week. Importing all preferences from home interface. Systems are now fully operational.'
    },

    {
        test: /who (made|created|built) you/i,
        run: () => 'I was crafted with HTML, CSS and JavaScript by my brilliant creator, sir. A fine engineer indeed.'
    },

    {
        test: /\bthank(s| you)\b/i,
        run: () => pick(['Always a pleasure, sir.', "That's what I'm here for, sir."])
    },

    { test: /\btime\b/i, run: () => `The current time is ${new Date().toLocaleTimeString()}.` },

    {
        test: /\bdate\b|\btoday'?s date\b/i,
        run: () => `Today is ${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}.`
    },

    { test: /\bbatter/i, run: batteryResponse },

    {
        test: /\bweather\b/i,
        run: async () => {
            try { return await getWeather(); }
            catch (e) { return `I couldn't check the weather, sir — ${e}.`; }
        }
    },

    {
        test: /^(youtube|play on youtube)\s+(.+)/i,
        run: (m) => {
            window.open('https://www.youtube.com/results?search_query=' + encodeURIComponent(m[2]), '_blank');
            return `Searching YouTube for "${m[2]}", sir.`;
        }
    },

    {
        test: /^(search|google)\s+(.+)/i,
        run: (m) => {
            window.open('https://www.google.com/search?q=' + encodeURIComponent(m[2]), '_blank');
            return `Searching the web for "${m[2]}", sir.`;
        }
    },

    {
        test: /\bplay (a )?game\b/i,
        run: () => { window.open('https://chromedino.com', '_blank'); return 'Launching your game, sir. Good luck!'; }
    },

    {
        test: /\b(open|play)\s+(some\s+)?music\b/i,
        run: () => { window.open('https://music.youtube.com', '_blank'); return 'Opening your music, sir. Enjoy.'; }
    },

    {
        test: /^(calculate|calc|solve)\s+(.+)/i,
        run: (m) => {
            const v = calculate(m[2]);
            return v === null ? "I'm afraid that expression is beyond my calculator, sir." : `That would be ${v}, sir.`;
        }
    },

    {
        test: /^(what is|what's)\s+(.+)/i,
        run: (m) => {
            const v = calculate(m[2]);
            return v === null ? "I can only compute numeric expressions for that phrasing, sir." : `That would be ${v}, sir.`;
        }
    },

    {
        test: /^[\d\s+\-*/().%]+$/,
        run: (m) => {
            const v = calculate(m[0]);
            return v === null ? "That doesn't appear to be a valid expression, sir." : `That would be ${v}, sir.`;
        }
    },

    {
        test: /^(take a note|note down|make a note|note)\s*(?:that\s+|to\s+)?(.+)/i,
        run: (m) => {
            notes.push(m[2]); saveNotes();
            return `Noted, sir: "${m[2]}". You now have ${notes.length} note(s).`;
        }
    },

    {
        test: /\b(read|show|list)\s+(my\s+)?notes?\b/i,
        run: () => notes.length
            ? 'Your notes, sir:\n' + notes.map((n, i) => `  ${i + 1}. ${n}`).join('\n')
            : 'You have no notes yet, sir.'
    },

    { test: /\bclear notes\b/i, run: () => { notes = []; saveNotes(); return 'All notes cleared, sir.'; } },

    {
        test: /\btimer\b|\bremind me\b/i,
        run: (m, raw) => {
            const t = raw.match(/(\d+)\s*(seconds?|secs?|minutes?|mins?|hours?|hrs?)/i);
            if (!t) return "How long should the timer be, sir? For example: 'set a timer for 5 minutes'.";
            const n = +t[1], u = t[2].toLowerCase();
            const ms = u.startsWith('h') ? n * 3600000 : u.startsWith('m') ? n * 60000 : n * 1000;
            setTimeout(() => jarvisSay(`Sir, your ${n} ${u.replace(/s$/, '')} timer has finished.`, { sfxKey: 'battery' }), ms);
            return `Timer set for ${n} ${u}, sir. I shall notify you.`;
        }
    },

    { test: /\bjoke\b/i, run: () => pick(jokes) },
    { test: /(inspire me|\bquote\b)/i, run: () => pick(quotes) },

    {
        test: /\bfull ?screen\b/i,
        run: () => {
            document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
            return 'Toggling fullscreen, sir.';
        }
    },

    {
        test: /^clear( chat| history| screen)?$/i,
        run: () => { outputArea.innerHTML = ''; history = []; saveHistory(); return 'Chat log cleared, sir.'; }
    },

    {
        test: /\bhelp\b|\bcommands?\b|what can you do/i,
        run: () =>
            `At your service, sir. Here are my current capabilities:

•  time / date — current time & date
•  battery — power diagnostics
•  weather — local weather (location required)
•  search <query> / youtube <query> — web & video search
•  open music / play game — quick entertainment
•  calculate <expression> — e.g. calculate 25*4+10
•  take a note <text> / read notes / clear notes
•  set a timer for <N> minutes
•  joke / quote — something to smile about
•  fullscreen / clear / reboot / shutdown
•  or simply talk to me — say hello, thank me, ask who I am` },

    {
        test: /\breboot\b|\brestart\b/i, sfxKey: 'reboot',
        run: () => { setTimeout(() => location.reload(), 2200); return 'Rebooting all systems, sir. Back in a moment.'; }
    },

    {
        test: /\b(shutdown|shut down|goodbye)\b/i, sfxKey: 'reboot',
        run: () => {
            setTimeout(() => {
                document.body.classList.add('shutdown');
                setTimeout(() => window.close(), 1600);
            }, 1800);
            return 'Shutting down all systems. Goodbye, sir.';
        }
    },
];

/* ================= Core processing ================= */
let busy = false;

async function processCommand(forced) {
    const raw = (typeof forced === 'string' ? forced : inputField.value).trim();
    if (!raw || busy) return;
    busy = true;
    inputField.value = '';
    addUserMsg(raw);

    const typingEl = showTyping();
    await sleep(350 + Math.random() * 250);
    typingEl.remove();

    const cmd = commands.find((c) => c.test.test(raw));
    const response = cmd
        ? await cmd.run(raw.match(cmd.test), raw)
        : pick([
            "I'm afraid I don't understand that command, sir. Type 'help' to see my capabilities.",
            "My apologies, sir — that request is beyond my current protocols. Try 'help'.",
        ]);

    await jarvisSay(response, { sfxKey: cmd ? cmd.sfxKey : null });
    busy = false;
    inputField.focus();
}

/* ================= Input events ================= */
sendBtn.addEventListener('click', () => processCommand());
inputField.addEventListener('keydown', (e) => { if (e.key === 'Enter') processCommand(); });

/* ================= Voice recognition ================= */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null, listening = false;

if (SR) {
    recognition = new SR();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (e) => processCommand(e.results[0][0].transcript);
    recognition.onend = () => { listening = false; micBtn.classList.remove('listening'); };
    recognition.onerror = (e) => {
        listening = false; micBtn.classList.remove('listening');
        jarvisSay("I didn't catch that, sir. " + (e.error === 'not-allowed' ? 'Microphone access was denied.' : 'Please try again.'), { typeIt: false });
    };
} else {
    micBtn.disabled = true;
    micBtn.title = 'Voice input not supported in this browser';
}

micBtn.addEventListener('click', () => {
    if (!recognition) return jarvisSay('Voice recognition is not supported in this browser, sir.');
    if (listening) { recognition.stop(); return; }
    try { recognition.start(); listening = true; micBtn.classList.add('listening'); } catch (e) { }
});

/* ================= Clock & battery HUD ================= */
function updateClock() {
    const n = new Date();
    $('clock').textContent = n.toLocaleTimeString('en-GB');
    $('date-display').textContent = n.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
setInterval(updateClock, 1000);
updateClock();

(async function initBattery() {
    if (!navigator.getBattery) { $('battery-status').textContent = '⚡ BATT N/A'; return; }
    const b = await navigator.getBattery();
    const render = () => {
        $('battery-status').textContent = `⚡ BATT ${Math.round(b.level * 100)}%${b.charging ? ' ⚡CHG' : ''}`;
    };
    render();
    b.addEventListener('levelchange', render);
    b.addEventListener('chargingchange', render);
})();

/* ================= Suggestion chips ================= */
['Introduce yourself', "What's the time?", 'Weather', 'Tell me a joke',
    'Calculate 25*4+10', 'Take a note buy coffee', 'Set a timer for 5 minutes', 'Help']
    .forEach((s) => {
        const b = document.createElement('button');
        b.className = 'chip';
        b.textContent = s;
        b.onclick = () => processCommand(s);
        suggestionBar.appendChild(b);
    });

/* ================= Boot sequence ================= */
const bootLines = [
    '[ BIOS ] MARK VII INTERFACE ............ OK',
    '[ CORE ] Loading neural lattice ........ OK',
    '[ NET  ] Establishing uplink ........... OK',
    '[ AUD  ] Voice modules ................. OK',
    '[ SEC  ] Running diagnostics ........... OK',
    '',
    'ALL SYSTEMS NOMINAL.',
];

$('boot-btn').addEventListener('click', async () => {
    $('boot-btn').style.display = 'none';
    playSfx('hello'); // user gesture — browser now allows audio
    for (const line of bootLines) {
        const el = document.createElement('div');
        el.textContent = line;
        $('boot-log').appendChild(el);
        await sleep(180);
    }
    await sleep(500);
    const bootScreen = $('boot-screen');
    bootScreen.classList.add('boot-done');
    setTimeout(() => bootScreen.remove(), 900);

    const restored = restoreHistory();
    jarvisSay(restored
        ? 'Systems restored, sir. Welcome back.'
        : 'Good day, sir. JARVIS online — all systems are fully operational. How may I assist you?');
});