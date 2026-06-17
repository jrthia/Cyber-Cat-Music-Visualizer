const audio = document.getElementById('audio');
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');

const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const trackTitle = document.getElementById('trackTitle');
const progressBar = document.getElementById('progressBar'); 
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let audioContext;
let analyzer;
let source;
let globalHue = 0;

// Default sample track setup
const defaultPlaylist = ["Alan Walker - Dreamer.mp3"];

// Dynamic arrays to hold custom imported user music objects
let userPlaylist = []; 
let currentTrackIndex = 0;
let isUsingUserPlaylist = false;

// Unified track loading coordinator with sample song prompt
function loadTrack(index) {
    if (isUsingUserPlaylist && userPlaylist.length > 0) {
        const currentTrack = userPlaylist[index];
        audio.src = currentTrack.url;
        trackTitle.innerText = currentTrack.name;
    } else if (defaultPlaylist.length > 0) {
        audio.src = defaultPlaylist[index];
        // Displays the track name with custom instruction prompts
        trackTitle.innerText = defaultPlaylist[index].replace('.mp3', '') + " (Or Add Music)";
    } else {
        trackTitle.innerText = "Click 'Add Music' To Start";
    }
    progressBar.value = 0;
}
loadTrack(currentTrackIndex);



// Custom Media Button Play Trigger
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

// Next Track Button (Dynamically targets the active list array lengths)
nextBtn.onclick = function() {
    const activeLength = isUsingUserPlaylist ? userPlaylist.length : defaultPlaylist.length;
    currentTrackIndex = (currentTrackIndex + 1) % activeLength;
    changeTrack(currentTrackIndex);
};

// Previous Track Button
prevBtn.onclick = function() {
    const activeLength = isUsingUserPlaylist ? userPlaylist.length : defaultPlaylist.length;
    currentTrackIndex = (currentTrackIndex - 1 + activeLength) % activeLength;
    changeTrack(currentTrackIndex);
};

// Smart end-of-song handler: Auto-advances through the queue or loops single tracks
audio.onended = function() {
    const activeLength = isUsingUserPlaylist ? userPlaylist.length : defaultPlaylist.length;
    
    if (isUsingUserPlaylist && userPlaylist.length === 1) {
        audio.currentTime = 0;
        audio.play();
    } else {
        currentTrackIndex = (currentTrackIndex + 1) % activeLength;
        changeTrack(currentTrackIndex);
    }
};

// Timeline progress track automatic thumb advancement
audio.ontimeupdate = function() {
    if (audio.duration) {
        progressBar.max = audio.duration;
        progressBar.value = audio.currentTime;
    }
};

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
    
    // Core Layout Render Stack
    drawAudioFaceContour(dataArray, bufferLength, centerX, centerY);
    drawFluidPolygonEars(dataArray, centerX, centerY);
    drawPulsingEyes(averageBass, centerX, centerY);
    drawStraightWhiskers(averageMids, centerX, centerY); 
    drawCuteCatMouth(averageBass, centerX, centerY); 
    drawFlashingNose(averageMids, centerX, centerY);
}

function drawAudioFaceContour(dataArray, bufferLength, centerX, centerY) {
    const baseRadius = 110;
    
    const halfLength = Math.floor(bufferLength / 2);
    const angleStep = Math.PI / halfLength; 

    // BRIDGED GAP FIX: Loop goes up to halfLength + 1 
    // This forces the final lines to overlap perfectly at the top center.
    for (let i = 0; i <= halfLength; i++) {
        // Fallback guard to prevent trying to read past the end of the data array
        const value = dataArray[i] !== undefined ? dataArray[i] : dataArray[halfLength - 1];
        
        const barLength = Math.pow(value / 255, 1.4) * 75;
        
        const rightAngle = (Math.PI / 2) + (i * angleStep);
        const leftAngle  = (Math.PI / 2) - (i * angleStep);

        // --- DRAW RIGHT SIDE SPECTRUM ---
        const rStartX = centerX + Math.cos(rightAngle) * baseRadius;
        const rStartY = centerY + Math.sin(rightAngle) * baseRadius;
        const rEndX   = centerX + Math.cos(rightAngle) * (baseRadius + barLength);
        const rEndY   = centerY + Math.sin(rightAngle) * (baseRadius + barLength);
        renderNeonLine(rStartX, rStartY, rEndX, rEndY, 3.5);

        // --- DRAW LEFT SIDE SPECTRUM ---
        const lStartX = centerX + Math.cos(leftAngle) * baseRadius;
        const lStartY = centerY + Math.sin(leftAngle) * baseRadius;
        const lEndX   = centerX + Math.cos(leftAngle) * (baseRadius + barLength);
        const lEndY   = centerY + Math.sin(leftAngle) * (baseRadius + barLength);
        renderNeonLine(lStartX, lStartY, lEndX, lEndY, 3.5);
    }
}

}

// Drag over interceptors to prevent default browser page redirections
window.addEventListener('dragover', (e) => e.preventDefault());
window.addEventListener('drop', (e) => e.preventDefault());
window.addEventListener('dragenter', () => dropZone.classList.add('dragover'));
window.addEventListener('dragover', () => dropZone.classList.add('dragover'));
window.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));

// Desktop Drag and Drop file parsing ingestion
window.addEventListener('drop', (e) => {
    dropZone.classList.remove('dragover');
    const files = e.dataTransfer.files; 
    processIncomingFiles(files);
});

// Click and Mobile Tap file browser browsing selection
dropZone.onclick = () => fileInput.click();
fileInput.onchange = function(e) {
    const files = e.target.files; 
    processIncomingFiles(files);
};

// Dynamic list queue array processor loop
function processIncomingFiles(fileList) {
    if (!fileList || fileList.length === 0) return;
    userPlaylist = []; // Reset current user tracking array queue on raw load hook
    
    for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        if (file.type.startsWith('audio/')) {
            userPlaylist.push({
                url: URL.createObjectURL(file),
                name: file.name.replace('.mp3', '')
            });
        }
    }

    if (userPlaylist.length > 0) {
        isUsingUserPlaylist = true;
        currentTrackIndex = 0;
        loadTrack(currentTrackIndex);
        if (!audioContext) { setupAudioContext(); }
        audio.play();
        playBtn.innerText = "⏸";
    }
}

function drawFluidPolygonEars(dataArray, centerX, centerY) {
    // Smooth, natural ear bouncing physics profile multiplier
    const earPulse = (dataArray[80] / 255) * 45; 

    // Left Geometric Ear Node Points
    const lBaseOuter = { x: centerX - 105, y: centerY - 45 };
    const lTip       = { x: centerX - 120 - (earPulse * 0.3), y: centerY - 150 - earPulse };
    const lBaseInner = { x: centerX - 35, y: centerY - 105 };

    // Right Geometric Ear Node Points
    const rBaseInner = { x: centerX + 35, y: centerY - 105 };
    const rTip       = { x: centerX + 120 + (earPulse * 0.3), y: centerY - 150 - earPulse };
    const rBaseOuter = { x: centerX + 105, y: centerY - 45 };

    // --- DRAW LEFT CLOSED EAR ---
    ctx.save();
    ctx.shadowBlur = 12; 
    ctx.shadowColor = `hsla(${globalHue}, 80%, 40%, 0.45)`;
    ctx.strokeStyle = `hsla(${globalHue}, 80%, 40%, 0.955)`;
    ctx.fillStyle = `hsla(${globalHue}, 80%, 35%, 0.08)`;
    ctx.lineWidth = 4.5; 
    ctx.lineJoin = 'round'; 
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(lBaseOuter.x, lBaseOuter.y); 
    ctx.lineTo(lTip.x, lTip.y); 
    ctx.lineTo(lBaseInner.x, lBaseInner.y);
    ctx.closePath(); 
    ctx.fill(); 
    ctx.stroke();

    // Left inner technical accents
    ctx.lineWidth = 2; 
    ctx.strokeStyle = `hsla(${globalHue}, 80%, 50%, 0.5)`;
    ctx.beginPath(); 
    ctx.moveTo(lBaseOuter.x + 12, lBaseOuter.y - 12); 
    ctx.lineTo(lTip.x + 8, lTip.y + 20); 
    ctx.lineTo(lBaseInner.x - 8, lBaseInner.y - 2); 
    ctx.stroke();
    ctx.restore();

    // --- DRAW RIGHT CLOSED EAR ---
    ctx.save();
    ctx.shadowBlur = 12; 
    ctx.shadowColor = `hsla(${globalHue}, 80%, 40%, 0.45)`;
    ctx.strokeStyle = `hsla(${globalHue}, 80%, 40%, 0.955)`;
    ctx.fillStyle = `hsla(${globalHue}, 80%, 35%, 0.08)`;
    ctx.lineWidth = 4.5; 
    ctx.lineJoin = 'round'; 
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(rBaseOuter.x, rBaseOuter.y); 
    ctx.lineTo(rTip.x, rTip.y); 
    ctx.lineTo(rBaseInner.x, rBaseInner.y);
    ctx.closePath(); 
    ctx.fill(); 
    ctx.stroke();

    // Right inner technical accents
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
    const twitch = (mids / 255) * 40; 
    const baseLength = 40;
    
    const lx = centerX - startOffset;
    renderNeonLine(lx, whiskerY - 4, lx - baseLength - twitch, whiskerY - 14 - (twitch * 0.3), 2.5);
    renderNeonLine(lx, whiskerY, lx - baseLength - twitch - 6, whiskerY, 2.5);
    renderNeonLine(lx, whiskerY + 4, lx - baseLength - twitch, whiskerY + 14 + (twitch * 0.3), 2.5);
    
    const rx = centerX + startOffset;
    renderNeonLine(rx, whiskerY - 4, rx + baseLength + twitch, whiskerY - 14 - (twitch * 0.3), 2.5);
    renderNeonLine(rx, whiskerY, rx + baseLength + twitch + 6, whiskerY, 2.5);
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
