// Create a style element and append it to the head
const style = document.createElement('style');
style.innerHTML = `
  :root {
    --cursor-size: 20px;
    --cursor-blur: 20px;
    --cursor-color: rgba(255, 255, 255, 0.8);
    --cursor-link-color: rgba(0, 255, 127, 1);
    --cursor-button-color: rgba(255, 165, 0, 1);
    --cursor-image-color: rgba(255, 255, 255, 1);
  }

  .cursor {
    position: absolute;
    width: var(--cursor-size);
    height: var(--cursor-size);
    background: radial-gradient(circle, var(--cursor-color) 0%, rgba(255, 255, 255, 0) 80%);
    border: 2px solid white;
    border-radius: 50%;
    pointer-events: none;
    transform: translate(-50%, -50%);
    box-shadow: 0 0 var(--cursor-blur) rgba(255, 255, 255, 0.7), 0 0 40px rgba(255, 255, 255, 0.5);
    mix-blend-mode: difference;
    z-index: 9999;
    transition: transform 0.15s ease, background 0.2s ease, box-shadow 0.2s ease, width 0.2s ease, height 0.2s ease;
  }

  .cursor.enlarged {
    transform: translate(-50%, -50%) scale(1.5);
  }

  .cursor.link-hover {
    background: radial-gradient(circle, var(--cursor-link-color) 0%, rgba(50, 205, 50, 0.6) 70%, var(--cursor-link-color) 100%);
    box-shadow: 0 0 30px var(--cursor-link-color), 0 0 50px rgba(50, 205, 50, 0.6);
  }

  .cursor.button-hover {
    background: radial-gradient(circle, var(--cursor-button-color) 0%, rgba(255, 140, 0, 0.6) 70%, var(--cursor-button-color) 100%);
    box-shadow: 0 0 30px var(--cursor-button-color), 0 0 50px rgba(255, 140, 0, 0.6);
  }

  .cursor.image-hover {
    background: radial-gradient(circle, var(--cursor-image-color) 0%, rgba(255, 255, 255, 0.6) 70%, var(--cursor-image-color) 100%);
    box-shadow: 0 0 30px rgba(255, 255, 255, 0.7), 0 0 50px rgba(255, 255, 255, 0.5);
  }

  /* Custom scaling effect for links, buttons, and images */
  .cursor.enlarged.link-hover,
  .cursor.enlarged.button-hover,
  .cursor.enlarged.image-hover {
    transition: all 0.15s ease;
  }

  /* Custom CSS for elements */
  .button, a, img {
    transition: transform 0.2s ease;
  }

  .button:hover, a:hover, img:hover {
    transform: scale(1.1);
  }
`;
document.head.appendChild(style);

// Variables to track mouse position and trailing position
let mouseX = 0, mouseY = 0;
let trailX = 0, trailY = 0;

// Create the cursor element
const cursor = document.createElement('div');
cursor.classList.add('cursor');
document.body.appendChild(cursor);

// Function to smoothly update cursor position
const updateCursor = () => {
    trailX += (mouseX - trailX) * 0.1;
    trailY += (mouseY - trailY) * 0.1;

    cursor.style.left = `${trailX}px`;
    cursor.style.top = `${trailY}px`;

    requestAnimationFrame(updateCursor);
};

// Event listener for mouse movements
document.addEventListener('mousemove', (e) => {
    mouseX = e.pageX;
    mouseY = e.pageY;

    // Add the "enlarged" class when hovering over interactive elements
    if (e.target.tagName === 'A' || e.target.classList.contains('button')) {
        cursor.classList.add('enlarged');
        if (e.target.tagName === 'A') {
            cursor.classList.add('link-hover');
            cursor.classList.remove('button-hover', 'image-hover');
        } else {
            cursor.classList.add('button-hover');
            cursor.classList.remove('link-hover', 'image-hover');
        }
    } else if (e.target.tagName === 'IMG') {
        cursor.classList.add('image-hover');
        cursor.classList.remove('link-hover', 'button-hover', 'enlarged');
    } else {
        cursor.classList.remove('enlarged', 'link-hover', 'button-hover', 'image-hover');
    }
});

// Start the cursor animation
updateCursor();
