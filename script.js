document.getElementById('user-input').addEventListener('keydown', function(event) {
    // Trigger the processCommand when "Enter" is pressed (and the input is not empty)
    if (event.key === 'Enter' && this.value.trim() !== "") {
        processCommand();
    }
});

function processCommand() {
    const inputField = document.getElementById('user-input');
    const inputValue = inputField.value.trim();
    const outputArea = document.getElementById('output-area');
    
    // Reference to the audio elements
    const helloSound = document.getElementById('hello-sound');
    const atYourService = document.getElementById('AtyourService');
    const batteryLow = document.getElementById('Batterylow');
    const introduction = document.getElementById('Introduction');
    const reboot = document.getElementById('reboot');
    const shutdownSound = document.getElementById('shutdownSound');
    const musicOpenSound = document.getElementById('musicOpenSound');
    const searchSound = document.getElementById('searchSound');
    const gameLaunchSound = document.getElementById('gameLaunchSound');
    const helpSound = document.getElementById('helpSound');
    const newsSound = document.getElementById('newsSound');
    const settingsSound = document.getElementById('settingsSound');
    const jokeSound = document.getElementById('jokeSound');
    
    // If the input is empty, exit early
    if (inputValue === "") return;

    // Create a div element for the user's input and add it to the output area
    const userCommandDiv = document.createElement('div');
    userCommandDiv.classList.add('user-command');
    userCommandDiv.innerHTML = `<strong>You:</strong> ${inputValue}`;
    outputArea.appendChild(userCommandDiv);

    // Shorten the delay for "thinking"
    const thinkingDelay = 60; // Reduced delay for faster response (300ms)

    setTimeout(() => {
        let response = '';
        let soundToPlay = null; // Variable to store the sound to play

        // Command processing logic
        if (inputValue.toLowerCase().includes("i am back")) {
            response = "Welcome back, sir. All systems for gaming will be prepared in a few minutes. For now, feel free to grab a cup of coffee and have a good day.";
            soundToPlay = helloSound; 
        } else if (inputValue.toLowerCase().includes("hey")) {
            response = "At your service, sir.";
            soundToPlay = atYourService;
        } else if (inputValue.toLowerCase().includes("introduce yourself")) {
            response = "Allow me to introduce myself. I am JARVIS, a virtual artificial intelligence and I'm here to assist you with a variety of tasks as best I can. 24 hours a day, 7 days a week. Importing all preferences from home interface. Systems are now fully operational.";
            soundToPlay = introduction; 
        } else if (inputValue.toLowerCase().includes("battery")) {
            response = "Battery power is running low. May I suggest you charge it soon?";
            soundToPlay = batteryLow; 
        } else if (inputValue.toLowerCase().includes("weather")) {
            response = "I can look up the weather for you! Just tell me your location.";
            soundToPlay = reboot; 
        } else if (inputValue.toLowerCase().includes("time")) {
            response = `The current time is ${new Date().toLocaleTimeString()}`;
            soundToPlay = reboot;
        } else if (inputValue.toLowerCase().includes("date")) {
            response = `Today's date is ${new Date().toLocaleDateString()}`;
            soundToPlay = reboot; 
        } else if (inputValue.toLowerCase().includes("reboot")) {
            response = "Rebooting... Refreshing the page now.";
            soundToPlay = reboot; 
            setTimeout(() => location.reload(), 2000);
        } else if (inputValue.toLowerCase().includes("shutdown")) {
            response = "Shutting down. Goodbye, sir. I hope to assist you again soon.";
            soundToPlay = reboot; 
            setTimeout(() => window.close(), 2000);
        } else if (inputValue.toLowerCase().includes("open music")) {
            response = "Opening your music playlist. Enjoy!";
            soundToPlay = reboot; 
        } else if (inputValue.toLowerCase().includes("search")) {
            const query = inputValue.slice(7); // Extract search query after "search"
            response = `Searching for "${query}"...`;
            soundToPlay = reboot; 
        } else if (inputValue.toLowerCase().includes("play game")) {
            response = "Launching your game now. Good luck, sir!";
            soundToPlay = reboot; 
        } else if (inputValue.toLowerCase().includes("help")) {
            response = "How can I assist you today, sir? You can ask me about the weather, time, date, or even play games.";
            soundToPlay = reboot; 
        } else if (inputValue.toLowerCase().includes("news")) {
            response = "Fetching the latest news for you!";
            soundToPlay = reboot; 
        } else if (inputValue.toLowerCase().includes("settings")) {
            response = "Opening system settings. Please hold on.";
            soundToPlay = reboot; 
        } else if (inputValue.toLowerCase().includes("joke")) {
            response = "Why don't scientists trust atoms? Because they make up everything!";
            soundToPlay = reboot; 
        } else {
            response = "I'm sorry, I didn't understand that command.";
            soundToPlay = reboot; 
        }

        // Create a div element for Jarvis' response
        const jarvisResponseDiv = document.createElement('div');
        jarvisResponseDiv.classList.add('jarvis-response');
        outputArea.appendChild(jarvisResponseDiv);

        // Default typing speed (in milliseconds per character)
        const baseTypingSpeed = 10;
        const maxTypingSpeed = 30;
        const lengthThreshold = 150;

        let typingSpeed = response.length > lengthThreshold ? Math.max(baseTypingSpeed - (response.length - lengthThreshold) / 10, maxTypingSpeed) : baseTypingSpeed;

        let audioDuration = soundToPlay ? soundToPlay.duration * 1000 : 1000; 
        let adjustedAudioDuration = audioDuration - 6000; 
        let typingInterval = adjustedAudioDuration / response.length;

        if (soundToPlay) {
            soundToPlay.currentTime = 0;
            soundToPlay.play();
        }

        // Start typing immediately and sync with audio duration
        let charIndex = 0;
        const typingIntervalId = setInterval(() => {
            jarvisResponseDiv.innerHTML += response.charAt(charIndex);
            charIndex++;

            if (charIndex === response.length) {
                clearInterval(typingIntervalId);
            }
        }, typingInterval);

        // Clear the input field after processing the command
        inputField.value = "";

        // Auto-scroll the output area to the bottom to keep the latest message visible
        outputArea.scrollTop = outputArea.scrollHeight;

    }, thinkingDelay); 

    // Animate the input field and response to create a smoother user experience
    animateUserInput(userCommandDiv);
    animateJarvisResponse(jarvisResponseDiv);
}
