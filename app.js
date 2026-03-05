const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');
const stepCounterEl = document.getElementById('step-counter');
const toggleBtn = document.getElementById('toggle-walk');
const arrivalModal = document.getElementById('arrival-modal');
const lottieBoy = document.getElementById('boy-lottie');
const lottieDog = document.getElementById('dog-lottie');

const walkInput = document.getElementById('walk-amount');

// Configuration
const TOTAL_STEPS = 10000;
let stepsPerFrame = 40;
const FRAME_DURATION = 80;

let stepsTaken = parseInt(localStorage.getItem('stepsTaken')) || 0;
let isWalking = false;
let stepsRemainingInSession = 0;
let lastTime = 0;
let accumulator = 0;
let bgOffset = 0;


// Assets
const bgImg = new Image();
bgImg.src = 'bg.png';

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

function update(deltaTime) {
    if (!isWalking) return;

    accumulator += deltaTime;
    if (accumulator >= FRAME_DURATION) {
        let currentIncrement = Math.min(stepsPerFrame, stepsRemainingInSession);
        stepsTaken += currentIncrement;
        stepsRemainingInSession -= currentIncrement;
        localStorage.setItem('stepsTaken', stepsTaken);
        accumulator = 0;

        if (stepsRemainingInSession <= 0) {
            stepsRemainingInSession = 0;
            isWalking = false;
            stopWalking();
        }

        if (stepsTaken >= TOTAL_STEPS) {
            stepsTaken = TOTAL_STEPS;
            isWalking = false;
            stopWalking();
            showArrival();
        }
    }

    // Parallax movement disabled
    // bgOffset -= 4;
    updateUI();
}

function updateUI() {
    stepCounterEl.textContent = Math.floor(stepsTaken).toLocaleString();
    const progress = (stepsTaken / TOTAL_STEPS) * 100;

    // Move boy toward dog (from 5% to 95%)
    const boyPosition = 5 + (progress * 0.9);
    lottieBoy.style.left = `${boyPosition}%`;

    // Dog is always visible now
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Background (Tiled)
    const bgWidth = bgImg.width || 1024;
    const bgScale = canvas.height / bgImg.height;
    const drawWidth = bgWidth * bgScale;

    let x = bgOffset % drawWidth;
    ctx.drawImage(bgImg, x, 0, drawWidth, canvas.height);
    ctx.drawImage(bgImg, x + drawWidth, 0, drawWidth, canvas.height);
    ctx.drawImage(bgImg, x - drawWidth, 0, drawWidth, canvas.height);
}

function loop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    update(deltaTime);
    draw();

    requestAnimationFrame(loop);
}

toggleBtn.addEventListener('click', () => {
    if (isWalking) {
        // Allow manual pause
        isWalking = false;
        stopWalking();
    } else {
        const amount = parseInt(walkInput.value) || 100;
        stepsRemainingInSession = amount;
        isWalking = true;
        startWalking();
    }
});

function startWalking() {
    toggleBtn.textContent = 'Pause';
    toggleBtn.classList.add('walking');
    lottieBoy.play();
}

function stopWalking() {
    toggleBtn.textContent = 'Walk';
    toggleBtn.classList.remove('walking');
    lottieBoy.pause();
}

function showArrival() {
    arrivalModal.classList.remove('hidden');
    stopWalking();
}

// Start
bgImg.onload = () => {
    requestAnimationFrame(loop);
    updateUI(); // Immediately sync UI with loaded stepsTaken
    lottieDog.play(); // Continuous animation
    stopWalking(); // Start paused
};
