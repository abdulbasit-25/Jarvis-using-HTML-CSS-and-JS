# JARVIS — AI Voice Assistant HUD

A futuristic JARVIS-inspired browser assistant built with **HTML, CSS, and Vanilla JavaScript**.

The project combines a cinematic HUD interface with browser-based voice recognition, speech synthesis, real-time system information, weather data, notes, timers, calculations, command history, and interactive assistant commands.

**Live Portfolio:** [ARCHER — Abdul Basit](http://abdulbasit-archer.vercel.app/)

---

## Overview

JARVIS is a lightweight, browser-based assistant interface designed to demonstrate how modern interactive experiences can be built using fundamental web technologies.

The project does not require a backend or build system for its core functionality. It runs directly in the browser and makes use of native browser APIs alongside external web services where required.

---

## Features

### Voice Interaction

* Browser-based speech recognition
* Speech synthesis for assistant responses
* Microphone-based commands
* Voice mute and unmute
* Text input fallback

### Weather

Retrieve real-time weather information using the Open-Meteo API.

```text
weather in Islamabad
weather in London
weather in New York
```

No API key is required.

### Calculator

Perform calculations directly through JARVIS.

```text
calculate 12*7+3
calculate 100/4
calculate 25+50
```

### Notes

Create and manage notes directly inside the interface.

```text
note: Complete my JavaScript project
show notes
clear notes
```

Notes are stored using browser `localStorage`.

### Timers

Create voice-controlled countdown timers.

```text
set a timer for 5 minutes
set a timer for 10 minutes
```

JARVIS provides a spoken notification when the timer finishes.

### System Information

The HUD can display browser-accessible system information including:

* Current time
* Current date
* Session uptime
* Battery level where supported

### Command History

Use the **Up / Down arrow keys** to navigate previously entered commands.

### HUD Themes

The interface includes a two-tone HUD palette that can be switched directly from the interface.

### Responsive Design

The layout adapts to smaller screens and switches to a single-column interface on narrow displays.

---

## Available Commands

| Command                       | Description                   |
| ----------------------------- | ----------------------------- |
| `time`                        | Displays the current time     |
| `date`                        | Displays the current date     |
| `weather in <city>`           | Retrieves weather information |
| `calculate <expression>`      | Performs a calculation        |
| `note: <text>`                | Saves a new note              |
| `show notes`                  | Displays saved notes          |
| `clear notes`                 | Removes saved notes           |
| `set a timer for <n> minutes` | Starts a countdown            |
| `joke`                        | Generates a joke              |
| `battery`                     | Displays battery information  |
| `mute`                        | Disables spoken responses     |
| `unmute`                      | Enables spoken responses      |
| `search <query>`              | Searches for a query          |
| `open music`                  | Opens music-related content   |
| `news`                        | Opens news-related content    |
| `reboot`                      | Starts the reboot sequence    |
| `shutdown`                    | Starts the shutdown interface |
| `clear`                       | Clears the assistant output   |
| `help`                        | Displays available commands   |

---

## Tech Stack

### Core

* HTML5
* CSS3
* Vanilla JavaScript

### Browser APIs

* Web Speech API
* Speech Recognition
* Speech Synthesis
* Local Storage
* Battery Status API where supported

### External API

* Open-Meteo

The project intentionally avoids unnecessary frameworks and dependencies.

---

## Project Structure

```text
Jarvis-using-HTML-CSS-and-JS/
│
├── assets/
│   ├── audio/
│   ├── images/
│   └── video/
│
├── V2/
│
├── index.html
├── script.js
├── styles.css
└── README.md
```

---

## Getting Started

### Clone the repository

```bash
git clone https://github.com/abdulbasit-25/Jarvis-using-HTML-CSS-and-JS.git
```

### Open the project

```bash
cd Jarvis-using-HTML-CSS-and-JS
```

### Run JARVIS

No installation or build process is required.

Open:

```text
index.html
```

in a modern browser.

For the best voice-recognition experience, use a browser with Web Speech API support such as Chrome or Edge.

Microphone permission may be required for voice commands.

---

## Voice Recognition

Voice recognition depends on browser support for the Web Speech API.

When supported:

1. Allow microphone access.
2. Activate the microphone control.
3. Speak a supported command.
4. JARVIS processes the command.
5. The response is displayed and spoken aloud.

Browser support can vary, so text input remains available as a fallback.

---

## Weather API

Weather functionality uses the Open-Meteo API.

No API key is required for the current implementation.

Example:

```text
weather in Islamabad
```

---

## Local Storage

The notes system uses the browser's built-in `localStorage`.

Notes can remain available after refreshing or reopening the application in the same browser profile.

---

## Customization

The project is intentionally simple to modify.

### HTML

Edit:

```text
index.html
```

to change the interface structure and content.

### CSS

Edit:

```text
styles.css
```

to customize:

* Colors
* Typography
* Animations
* HUD elements
* Layout
* Glow effects
* Responsive behavior
* Background effects

### JavaScript

Edit:

```text
script.js
```

to modify or add:

* Commands
* Voice responses
* API integrations
* Timers
* Notes
* Calculations
* Search functionality
* Assistant functionality

---

## Optional Assets

The original project included custom audio, image, and video assets.

The current interface primarily uses browser Speech Synthesis, making the original audio files optional.

Additional assets can be placed in:

```text
assets/audio/
assets/images/
assets/video/
```

---

## Learning Goals

This project demonstrates practical use of:

* DOM manipulation
* Event handling
* Browser APIs
* Speech Recognition
* Speech Synthesis
* Local Storage
* API requests
* Responsive UI design
* CSS animations
* Command parsing
* Interactive web interfaces

It is designed to show how a sophisticated-looking browser experience can be created using fundamental web technologies without relying on a large framework.

---

## Future Improvements

* AI-powered conversational responses
* Advanced natural-language command processing
* Custom wake-word detection
* More voice commands
* Calendar integration
* To-do list functionality
* News API integration
* Spotify integration
* Smart home controls
* Custom voice selection
* User preferences
* Persistent command history
* Additional HUD themes
* Mobile-specific controls
* Modular command architecture

---

## Author

### Abdul Basit — ARCHER

Full-Stack Developer | AI & Generative AI | Prompt Engineering | IoT

**Portfolio:**
http://abdulbasit-archer.vercel.app/

**GitHub:**
https://github.com/abdulbasit-25

---

## Contributing

Contributions, suggestions, and improvements are welcome.

If you would like to improve the project:

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Commit your changes.
5. Open a pull request.

---

## Support

If you find the project useful:

* Star the repository
* Fork the project
* Report bugs
* Suggest improvements
* Build your own version

---

## License

This project is available for educational and personal use.

You are welcome to experiment with the source code, customize the interface, and build your own JARVIS-inspired experience.

---

<p align="center">
  JARVIS ONLINE
  <br>
  <sub>Browser-based AI assistant interface by ARCHER</sub>
</p>
