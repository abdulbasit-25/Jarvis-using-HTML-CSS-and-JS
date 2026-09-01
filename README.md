# JARVIS HUD Interface

A rebuilt, self-contained JARVIS-style assistant UI: `index.html`, `styles.css`, `script.js`.

## What's new vs. the original
- **Voice in & out** — mic button uses the browser's Speech Recognition API; every reply is spoken with Speech Synthesis (toggle with "mute"/"unmute" or by clicking the ◐ icon doesn't mute, only switches palette — say "mute" to silence voice).
- **Real weather** — "weather in <city>" hits the free Open-Meteo API, no key required.
- **Calculator** — "calculate 12*7+3".
- **Notes** — "note: pick up dry cleaning", "show notes", "clear notes" (saved in localStorage, listed live in the right-hand panel).
- **Timers** — "set a timer for 5 minutes" fires a spoken alert when it's done.
- **Live system readouts** — clock, date, session uptime, and real battery level (where the browser exposes it).
- **Command history** — ↑ / ↓ in the input field cycles through what you've typed.
- **Two-tone HUD palette** — click ◐ top-right to swap cyan/amber accent.
- **Responsive** — collapses to a single column on narrow screens.
- Still hooks into your original `assets/audio/*.mp3` files if you drop them into the `assets/audio` folder — they're optional and fail silently if missing, since speech synthesis is now the primary voice.

## Commands
time · date · weather in `<city>` · calculate `<expr>` · note: `<text>` · show notes · clear notes ·
set a timer for `<n>` minutes · joke · battery · mute / unmute · search `<query>` · open music ·
news · reboot · shutdown · clear · help

## Running it
Just open `index.html` in a browser — no build step or server needed. Voice recognition requires
Chrome/Edge (or another browser with Web Speech API support) and a mic permission grant.

## Bringing back your original assets
Drop your files into:
- `assets/audio/` — same filenames as before (jarvis-147563.mp3, JARVIS-ATyourservice.mp3, etc.)
- `assets/video/` and `assets/images/` — kept as empty folders here; the new design uses a CSS/canvas
  backdrop instead of a background video by default, but you can re-add `#background-video` in
  `index.html` if you'd like the video back.