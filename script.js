const audio = document.getElementById('audio');
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');

const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const trackTitle = document.getElementById('trackTitle');
const progressBar = document.getElementById('progressBar'); 

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let audioContext;
let analyzer;
let source;
let globalHue = 0;

// ==========================================
// ⚠️ PLAYLIST REGISTRY: ADD YOUR SONGS HERE!
// ==========================================
const playlist = [
    "Alan Walker - Dreamer.mp3",
    "song2.mp3",
    "song3.mp3"
];

let currentTrackIndex = 0;

function loadTrack(index) {
    audio.src = playlist[index];
    trackTitle.innerText = playlist[index].replace('.mp3', '');
    progressBar.value = 0;
}
loadTrack(currentTrackIndex);
playBtn.onclick = function() {
    if (!audioContext) { setupAudioContext(); }
    if (audio.paused) {
        audio.play();
        playBtn.innerText = "⏸";
    } else {
        audio.pause();
        playBtn.innerText = "▶";
    }
};

nextBtn.onclick = function() {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    changeTrack(currentTrackIndex);
};

prevBtn.onclick = function() {
    currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    changeTrack(currentTrackIndex);
};

audio.onended = function() {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    changeTrack(currentTrackIndex);
};

// Update progress bar automatically as the song plays
audio.ontimeupdate = function() {
    if (audio.duration) {
        progressBar.max = audio.duration;
        progressBar.value = audio.currentTime;
    }
};

// Seek to a specific timestamp when the user drags the slider
progressBar.oninput = function() {
    audio.currentTime = progressBar.value;
};

function changeTrack(index) {
    loadTrack(index);
    if (audioContext) {
        audio.play();
        playBtn.innerText = "⏸";
    }
}

function setupAudioContext() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    source = audioContext.createMediaElementSource(audio);
    analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 256; 
    source.connect(analyzer);
    analyzer.connect(audioContext.destination);
    draw();
}
function draw() {
    requestAnimationFrame(draw);
    
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyzer.getByteFrequencyData(dataArray);
    
    ctx.fillStyle = 'rgba(10, 10, 10, 0.25)'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height * 0.45; 

    globalHue = (globalHue + 0.3) % 360;
    
    let bassSum = 0;
    for(let i = 0; i < 8; i++) { bassSum += dataArray[i]; }
    const averageBass = bassSum / 8;

    let midSum = 0;
    for(let i = 30; i < 60; i++) { midSum += dataArray[i]; }
    const averageMids = midSum / 30;
    
    drawAudioFaceContour(dataArray, bufferLength, centerX, centerY);
    drawFluidPolygonEars(dataArray, centerX, centerY);
    drawPulsingEyes(averageBass, centerX, centerY);
    drawStraightWhiskers(averageMids, centerX, centerY); 
    drawCuteCatMouth(averageBass, centerX, centerY); 
    drawFlashingNose(averageMids, centerX, centerY);
}

function drawAudioFaceContour(dataArray, bufferLength, centerX, centerY) {
    const baseRadius = 110;
    const angleStep = (Math.PI * 2) / bufferLength;

    for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i];
        const barLength = Math.pow(value / 255, 1.4) * 75;
        const angle = i * angleStep;

        // FIXED: Forehead filter code completely deleted! 
        // Audio bars will now cleanly display 100% across the skull loop.

        const startX = centerX + Math.cos(angle) * baseRadius;
        const startY = centerY + Math.sin(angle) * baseRadius;
        const endX = centerX + Math.cos(angle) * (baseRadius + barLength);
        const endY = centerY + Math.sin(angle) * (baseRadius + barLength);

        renderNeonLine(startX, startY, endX, endY, 3.5);
    }
}
function drawFluidPolygonEars(dataArray, centerX, centerY) {
    // High treble frequencies pull the tips up dynamically
    const earPulse = (dataArray[80] / 255) * 45; 

    // Left Ear Triangle Coordinates
    const lBaseOuter = { x: centerX - 105, y: centerY - 45 };
    const lTip       = { x: centerX - 120 - (earPulse * 0.3), y: centerY - 150 - earPulse };
    const lBaseInner = { x: centerX - 35, y: centerY - 105 };

    // Right Ear Triangle Coordinates
    const rBaseInner = { x: centerX + 35, y: centerY - 105 };
    const rTip       = { x: centerX + 120 + (earPulse * 0.3), y: centerY - 150 - earPulse };
    const rBaseOuter = { x: centerX + 105, y: centerY - 45 };

    // --- DRAW LEFT EAR ---
    ctx.save();
    ctx.shadowBlur = 12;
    ctx.shadowColor = `hsla(${globalHue}, 80%, 40%, 0.45)`;
    ctx.strokeStyle = `hsla(${globalHue}, 80%, 40%, 0.95)`;
    ctx.fillStyle = `hsla(${globalHue}, 80%, 35%, 0.08)`;
    ctx.lineWidth = 4.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(lBaseOuter.x, lBaseOuter.y);
    ctx.lineTo(lTip.x, lTip.y);
    ctx.lineTo(lBaseInner.x, lBaseInner.y);
    ctx.closePath(); // Closes the triangle perfectly
    ctx.fill();
    ctx.stroke();

    // Inner mechanical tracing lines
    ctx.lineWidth = 2;
    ctx.strokeStyle = `hsla(${globalHue}, 80%, 50%, 0.5)`;
    ctx.beginPath();
    ctx.moveTo(lBaseOuter.x + 12, lBaseOuter.y - 12);
    ctx.lineTo(lTip.x + 8, lTip.y + 20);
    ctx.lineTo(lBaseInner.x - 8, lBaseInner.y - 2);
    ctx.stroke();
    ctx.restore();

    // --- DRAW RIGHT EAR ---
    ctx.save();
    ctx.shadowBlur = 12;
    ctx.shadowColor = `hsla(${globalHue}, 80%, 40%, 0.45)`;
    ctx.strokeStyle = `hsla(${globalHue}, 80%, 40%, 0.95)`;
    ctx.fillStyle = `hsla(${globalHue}, 80%, 35%, 0.08)`;
    ctx.lineWidth = 4.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(rBaseOuter.x, rBaseOuter.y);
    ctx.lineTo(rTip.x, rTip.y);
    ctx.lineTo(rBaseInner.x, rBaseInner.y);
    ctx.closePath(); // Closes the triangle perfectly
    ctx.fill();
    ctx.stroke();

    // Inner mechanical tracing lines
    ctx.lineWidth = 2;
    ctx.strokeStyle = `hsla(${globalHue}, 80%, 50%, 0.5)`;
    ctx.beginPath();
    ctx.moveTo(rBaseOuter.x - 12, rBaseOuter.y - 12);
    ctx.lineTo(rTip.x - 8, rTip.y + 20);
    ctx.lineTo(rBaseInner.x + 8, rBaseInner.y - 2);
    ctx.stroke();
    ctx.restore();
}

function drawFlashingNose(mids, centerX, centerY) {
    const noseY = centerY + 35; 
    const noseWidth = 16; 
    const noseHeight = 10;
    const dynamicLightness = 40 + (mids / 255) * 45; 
    const dynamicOpacity = 0.5 + (mids / 255) * 0.4;

    ctx.save();
    ctx.shadowBlur = 15;
    ctx.shadowColor = `hsla(${globalHue}, 90%, ${dynamicLightness}%, ${dynamicOpacity})`;
    ctx.fillStyle = `hsla(${globalHue}, 90%, ${dynamicLightness}%, ${dynamicOpacity})`;
    
    ctx.beginPath();
    ctx.moveTo(centerX - noseWidth / 2, noseY); 
    ctx.lineTo(centerX + noseWidth / 2, noseY); 
    ctx.lineTo(centerX, noseY + noseHeight); 
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function drawStraightWhiskers(mids, centerX, centerY) {
    const whiskerY = centerY + 41; 
    const startOffset = 8;     
    
    // MUCH HIGHER REACTIVITY MULTIPLIER:
    // Increased from 14 to 40 for a highly noticeable, dramatic push!
    const twitch = (mids / 255) * 40; 
    
    const baseLength = 40; // The starting length on quiet beats

    // --- LEFT WHISKERS ---
    const lx = centerX - startOffset;
    
    // Top Left: Flares upwards and outwards
    renderNeonLine(lx, whiskerY - 4, lx - baseLength - twitch, whiskerY - 14 - (twitch * 0.3), 2.5);
    // Middle Left: Punches straight out
    renderNeonLine(lx, whiskerY, lx - baseLength - twitch - 6, whiskerY, 2.5);
    // Bottom Left: Flares downwards and outwards
    renderNeonLine(lx, whiskerY + 4, lx - baseLength - twitch, whiskerY + 14 + (twitch * 0.3), 2.5);

    // --- RIGHT WHISKERS ---
    const rx = centerX + startOffset;
    
    // Top Right: Flares upwards and outwards
    renderNeonLine(rx, whiskerY - 4, rx + baseLength + twitch, whiskerY - 14 - (twitch * 0.3), 2.5);
    // Middle Right: Punches straight out
    renderNeonLine(rx, whiskerY, rx + baseLength + twitch + 6, whiskerY, 2.5);
    // Bottom Right: Flares downwards and outwards
    renderNeonLine(rx, whiskerY + 4, rx + baseLength + twitch, whiskerY + 14 + (twitch * 0.3), 2.5);
}


function drawCuteCatMouth(bass, centerX, centerY) {
    const mouthTopY = centerY + 46; 
    const mouthWidth = 14; 
    const mouthDepth = 6; 
    const dynamicOpacity = 0.6 + (bass / 255) * 0.3;
    
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = `hsla(${globalHue}, 80%, 40%, 0.35)`;
    ctx.strokeStyle = `hsla(${globalHue}, 80%, 40%, ${dynamicOpacity})`;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(centerX, mouthTopY);
    ctx.quadraticCurveTo(centerX - mouthWidth / 2, mouthTopY + mouthDepth, centerX - mouthWidth, mouthTopY + 1);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(centerX, mouthTopY);
    ctx.quadraticCurveTo(centerX + mouthWidth / 2, mouthTopY + mouthDepth, centerX + mouthWidth, mouthTopY + 1);
    ctx.stroke();
    ctx.restore();
}

function drawPulsingEyes(bass, centerX, centerY) {
    const eyeSpacing = 42; 
    const eyeHeight = centerY - 15; 
    const baseRadius = 9; 
    const currentRadius = baseRadius + (bass / 255) * 15;
    
    drawSingleEye(centerX - eyeSpacing, eyeHeight, currentRadius); 
    drawSingleEye(centerX + eyeSpacing, eyeHeight, currentRadius);
}

function drawSingleEye(x, y, r) {
    ctx.save(); 
    ctx.beginPath(); 
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.shadowBlur = 20; 
    ctx.shadowColor = `hsla(${globalHue}, 80%, 40%, 0.4)`;
    
    const grad = ctx.createRadialGradient(x, y, r * 0.1, x, y, r);
    grad.addColorStop(0, `hsla(${globalHue}, 90%, 85%, 0.85)`); 
    grad.addColorStop(0.4, `hsla(${globalHue}, 80%, 45%, 0.3)`); 
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    
    ctx.fillStyle = grad; 
    ctx.fill(); 
    ctx.restore();
}

function renderNeonLine(sx, sy, ex, ey, thickness) {
    ctx.save(); 
    ctx.shadowBlur = 10; 
    ctx.shadowColor = `hsla(${globalHue}, 80%, 40%, 0.35)`;
    ctx.strokeStyle = `hsla(${globalHue}, 80%, 40%, 0.85)`; 
    ctx.lineWidth = thickness; 
    ctx.lineCap = 'round';
    
    ctx.beginPath(); 
    ctx.moveTo(sx, sy); 
    ctx.lineTo(ex, ey); 
    ctx.stroke(); 
    ctx.restore();
}

window.onresize = function() {
    canvas.width = window.innerWidth; 
    canvas.height = window.innerHeight;
};
