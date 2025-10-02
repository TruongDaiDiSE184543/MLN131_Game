// Clean game.js file - removing all syntax errors
// This will replace the corrupted game.js

// Tank Quiz Runner Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameState = 'start'; // 'start', 'playing', 'quiz', 'paused', 'gameOver'
let currentChapter = 1;
let gameTime = 0;
let lastTime = 0;
let chapterStartTime = 0;
let gameStartChapter = 1; // Track which chapter game started from

// Game history for sidebar
let gameHistory = JSON.parse(localStorage.getItem('tankGameHistory') || '[]');

// Game objects
let airplane;
let enemies = [];
let bullets = [];
let questionMarks = [];
let boss = null;

// Player stats
let health = 3;
let hasShield = false;
let canShoot = false;
let questionsAnswered = 0;
let currentQuestionIndex = 0;
let isBossFight = false;
let lastQuestionTime = 0;
let questionCooldown = 3000; // 3 seconds between questions

// Powerup system
let activePowerups = [];
let powerupChoices = [];
let isSelectingPowerup = false;

// ESC Menu functions
let escMenuOpen = false;

function openEscMenu() {
    if (gameState === 'quiz' || isSelectingPowerup) return;
    
    escMenuOpen = true;
    document.getElementById('escMenu').style.display = 'flex';
    updateHistoryInMenu();
    
    if (gameState === 'playing') {
        gameState = 'paused';
    }
}

function closeEscMenu() {
    escMenuOpen = false;
    document.getElementById('escMenu').style.display = 'none';
    
    if (gameState === 'paused') {
        gameState = 'playing';
    }
}

function updateHistoryInMenu() {
    const historyListMenu = document.getElementById('historyListMenu');
    if (gameHistory.length === 0) {
        historyListMenu.innerHTML = '<div style="color: #999; font-style: italic; text-align: center;">Chưa có lịch sử</div>';
        return;
    }
    
    historyListMenu.innerHTML = gameHistory.map(entry => {
        const chapterText = entry.chapter === 4 ? 'Hoàn thành' : `Chương ${entry.chapter}`;
        const resultColor = entry.chapter === 4 ? '#4CAF50' : '#FF9800';
        return `
            <div style="background: rgba(255,255,255,0.05); border-left: 3px solid ${resultColor}; padding: 8px; margin-bottom: 5px; border-radius: 5px;">
                <div style="color: ${resultColor}; font-weight: bold; font-size: 11px;">${chapterText}</div>
                <div style="font-size: 10px; color: #bbb;">⏱️ ${entry.time} | ❤️ ${entry.health} HP</div>
            </div>
        `;
    }).join('');
}

// Basic game functions
function updateTimer() {
    const minutes = Math.floor(gameTime / 60);
    const seconds = Math.floor(gameTime % 60);
    document.getElementById('timer').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function updateUI() {
    document.getElementById('chapter').textContent = currentChapter;
    const heartsElement = document.getElementById('hearts');
    heartsElement.innerHTML = '❤️'.repeat(health);
    updatePowerupsDisplay();
}

function updatePowerupsDisplay() {
    const container = document.getElementById('powerupContainer');
    if (activePowerups.length === 0) {
        container.innerHTML = '<div id="noPowerups" style="color: #999; font-style: italic; text-align: center;">Chưa có powerup nào</div>';
    } else {
        container.innerHTML = activePowerups.map(powerup => `
            <div style="background: rgba(255,255,255,0.1); border-radius: 5px; padding: 5px; margin-bottom: 5px; border-left: 3px solid #FFD700;">
                <div style="font-weight: bold; font-size: 11px; color: #FFD700;">${powerup.name}</div>
                <div style="font-size: 10px; color: #ddd;">${powerup.desc}</div>
            </div>
        `).join('');
    }
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    if (currentChapter === 1) {
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#4682B4');
    } else if (currentChapter === 2) {
        gradient.addColorStop(0, '#006994');
        gradient.addColorStop(1, '#002850');
    } else {
        gradient.addColorStop(0, '#0F0F23');
        gradient.addColorStop(1, '#000');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function spawnObjects() {
    if (Math.random() < 0.02) {
        const lane = Math.floor(Math.random() * 3);
        enemies.push(new Bat(lane));
    }
    if (Math.random() < 0.01) {
        const lane = Math.floor(Math.random() * 3);
        questionMarks.push(new QuestionMark(lane));
    }
}

function checkCollisions() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (isColliding(bullets[i], enemies[j])) {
                enemies[j].hp--;
                bullets.splice(i, 1);
                if (enemies[j].hp <= 0) {
                    enemies.splice(j, 1);
                }
                break;
            }
        }
    }
    
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (isColliding(airplane, enemies[i])) {
            if (!hasShield) {
                health--;
                updateUI();
                if (health <= 0) {
                    gameState = 'gameOver';
                }
            }
            enemies.splice(i, 1);
        }
    }
    
    for (let i = questionMarks.length - 1; i >= 0; i--) {
        if (isColliding(airplane, questionMarks[i])) {
            showQuizQuestion();
            questionMarks.splice(i, 1);
        }
    }
}

function isColliding(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

function showQuizQuestion() {
    gameState = 'quiz';
    setTimeout(() => {
        questionsAnswered++;
        canShoot = true;
        gameState = 'playing';
        updateUI();
    }, 1000);
}

function checkGameConditions() {
    if (gameTime > 60) {
        currentChapter++;
        gameTime = 0;
        chapterStartTime = Date.now();
        if (currentChapter > 3) {
            gameState = 'gameOver';
        }
        updateUI();
    }
}

// Simple game classes
class Airplane {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height - 80;
        this.width = 50;
        this.height = 40;
        this.lane = 1;
        this.targetX = this.x;
    }

    update() {
        if (Math.abs(this.x - this.targetX) > 2) {
            this.x += (this.targetX - this.x) * 0.25;
        } else {
            this.x = this.targetX;
        }
    }

    draw() {
        ctx.fillStyle = '#4169E1';
        ctx.fillRect(this.x - 25, this.y - 20, 50, 40);
    }

    moveTo(lane) {
        this.lane = lane;
        const lanePositions = [canvas.width * 0.25, canvas.width * 0.5, canvas.width * 0.75];
        this.targetX = lanePositions[lane];
    }

    shoot() {
        if (canShoot) {
            bullets.push(new Bullet(this.x, this.y - 40));
        }
    }
}

class Bat {
    constructor(lane) {
        this.lane = lane;
        const lanePositions = [canvas.width * 0.25, canvas.width * 0.5, canvas.width * 0.75];
        this.x = lanePositions[lane];
        this.y = -30;
        this.width = 30;
        this.height = 20;
        this.speed = 3;
        this.hp = 1;
    }

    update() {
        this.y += this.speed;
    }

    draw() {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x - 15, this.y - 10, 30, 20);
    }

    isOffScreen() {
        return this.y > canvas.height + 50;
    }
}

class QuestionMark {
    constructor(lane) {
        this.lane = lane;
        const lanePositions = [canvas.width * 0.25, canvas.width * 0.5, canvas.width * 0.75];
        this.x = lanePositions[lane];
        this.y = -40;
        this.width = 40;
        this.height = 40;
        this.speed = 2.5;
    }

    update() {
        this.y += this.speed;
    }

    draw() {
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 20, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#000';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', this.x, this.y);
    }

    isOffScreen() {
        return this.y > canvas.height + 50;
    }
}

class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 8;
        this.speed = 8;
    }

    update() {
        this.y -= this.speed;
    }

    draw() {
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(this.x - 2, this.y - 4, 4, 8);
    }

    isOffScreen() {
        return this.y < -10;
    }
}

// Game initialization
function initGame() {
    airplane = new Airplane();
    enemies = [];
    bullets = [];
    questionMarks = [];
    boss = null;
    
    health = 3;
    questionsAnswered = 0;
    currentQuestionIndex = 0;
    isBossFight = false;
    canShoot = false;
    hasShield = false;
    activePowerups = [];
    isSelectingPowerup = false;
    
    gameTime = 0;
    chapterStartTime = Date.now();
    
    updateUI();
}

// Main game loop
function gameLoop(currentTime) {
    if (gameState === 'playing') {
        if (lastTime === 0) lastTime = currentTime;
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;
        
        gameTime = (currentTime - chapterStartTime) / 1000;
        updateTimer();
        
        if (airplane) airplane.update();
        
        enemies.forEach(enemy => enemy.update());
        bullets.forEach(bullet => bullet.update());
        questionMarks.forEach(qmark => qmark.update());
        
        checkCollisions();
        
        enemies = enemies.filter(enemy => !enemy.isOffScreen());
        bullets = bullets.filter(bullet => !bullet.isOffScreen());
        questionMarks = questionMarks.filter(qmark => !qmark.isOffScreen());
        
        spawnObjects();
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBackground();
        
        if (airplane) airplane.draw();
        enemies.forEach(enemy => enemy.draw());
        bullets.forEach(bullet => bullet.draw());
        questionMarks.forEach(qmark => qmark.draw());
        
        checkGameConditions();
    }
    
    requestAnimationFrame(gameLoop);
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (escMenuOpen) {
        if (e.key === 'Escape') {
            closeEscMenu();
        }
        return;
    }
    
    if (gameState === 'playing') {
        if (e.key === 'Escape') {
            openEscMenu();
        } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            if (airplane.lane > 0) {
                airplane.moveTo(airplane.lane - 1);
            }
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            if (airplane.lane < 2) {
                airplane.moveTo(airplane.lane + 1);
            }
        } else if (e.key === ' ') {
            e.preventDefault();
            airplane.shoot();
        }
    }
});

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Start button event
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            gameState = 'playing';
            initGame();
            requestAnimationFrame(gameLoop);
        });
    }
    
    // Initialize game
    initGame();
    requestAnimationFrame(gameLoop);
});