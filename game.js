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

// Game objects
let tank;
let enemies = [];
let bullets = [];
let questionMarks = [];
let boss = null;

// Quiz data from file
const quizData = {
    1: [ // Chapter 1: Globalization & Social Structure
        {
            question: "Toàn cầu hóa đã giúp Việt Nam:",
            options: ["A. Tăng trưởng GDP và mở rộng thị trường xuất khẩu", "B. Thu hẹp cơ hội đầu tư nước ngoài", "C. Giảm năng lực cạnh tranh quốc gia", "D. Tách biệt khỏi xu hướng thế giới"],
            correct: 0
        },
        {
            question: "Năm 2023, khu vực dịch vụ chiếm khoảng bao nhiêu % GDP của Việt Nam?",
            options: ["A. 30%", "B. 42,5%", "C. 50%", "D. 60%"],
            correct: 1
        },
        {
            question: "Ngành kinh tế số lõi đóng góp bao nhiêu % vào GDP?",
            options: ["A. 3,5%", "B. 5,2%", "C. 7,99%", "D. 12%"],
            correct: 2
        },
        {
            question: "Tầng lớp nào sau đây không được xem là tầng lớp xã hội mới?",
            options: ["A. Doanh nhân công nghệ", "B. Lao động dịch vụ", "C. Trí thức trẻ toàn cầu hóa", "D. Nông dân truyền thống"],
            correct: 3
        },
        {
            question: "Trong 6 tháng đầu năm 2024, khu vực dịch vụ đóng góp tăng trưởng GDP khoảng:",
            options: ["A. 2,5%", "B. 4,1%", "C. 6,64%", "D. 8%"],
            correct: 2
        }
    ],
    2: [ // Chapter 2: Class Alliance
        {
            question: "Liên minh công – nông – trí thức được coi là:",
            options: ["A. Liên minh kinh tế tạm thời", "B. Nền tảng chính trị – xã hội của CNXH", "C. Nhóm lợi ích cục bộ", "D. Cơ chế chia sẻ lợi nhuận"],
            correct: 1
        },
        {
            question: "Thách thức lớn nhất với giai cấp công nhân hiện nay là:",
            options: ["A. Thiếu việc làm", "B. Phải \"trí thức hóa\" để thích ứng công nghệ", "C. Không tham gia vào sản xuất", "D. Mất vai trò lãnh đạo"],
            correct: 1
        },
        {
            question: "Nông dân Việt Nam hiện đối diện khó khăn gì trong chuyển đổi số?",
            options: ["A. Không có nhu cầu học hỏi", "B. Thiếu vốn, hạ tầng mạng và kiến thức công nghệ", "C. Quá nhiều đất canh tác", "D. Dư thừa nhân lực nông thôn"],
            correct: 1
        },
        {
            question: "Đảng Cộng sản Việt Nam khẳng định cần mở rộng liên minh để bổ sung lực lượng nào?",
            options: ["A. Giới doanh nhân", "B. Giới nghệ sĩ", "C. Quân đội", "D. Tầng lớp trung lưu"],
            correct: 0
        },
        {
            question: "Sự chuyển đổi liên minh hiện nay hướng đến mô hình:",
            options: ["A. Liên minh dựa trên dòng vốn", "B. Liên minh các chủ thể phát triển (không chỉ giai cấp truyền thống)", "C. Liên minh quốc tế", "D. Liên minh tôn giáo"],
            correct: 1
        }
    ],
    3: [ // Chapter 3: Social Stratification
        {
            question: "Chênh lệch thu nhập giữa 20% nhóm giàu nhất và 20% nhóm nghèo nhất năm 2012 là:",
            options: ["A. 5,5 lần", "B. 7 lần", "C. 9,35 lần", "D. 12 lần"],
            correct: 2
        },
        {
            question: "Tỷ lệ hộ nghèo dân tộc thiểu số chiếm bao nhiêu % tổng số hộ nghèo cả nước?",
            options: ["A. 15%", "B. 25%", "C. 47%", "D. 60%"],
            correct: 2
        },
        {
            question: "Mức lương trung bình của lao động CNTT là:",
            options: ["A. 5–8 triệu/tháng", "B. 10–15 triệu/tháng", "C. 20–35 triệu/tháng", "D. 40–50 triệu/tháng"],
            correct: 2
        },
        {
            question: "Một trong những giải pháp chiến lược để giảm bất bình đẳng là:",
            options: ["A. Xóa bỏ kinh tế thị trường", "B. Hoàn thiện chính sách thuế và an sinh xã hội", "C. Hạn chế đầu tư công nghệ", "D. Ngăn cản hội nhập quốc tế"],
            correct: 1
        },
        {
            question: "Bất bình đẳng thu nhập được coi là:",
            options: ["A. Vấn đề kinh tế thuần túy", "B. Vấn đề an ninh xã hội và chính trị", "C. Vấn đề tạm thời của phát triển", "D. Vấn đề chỉ của các nước phát triển"],
            correct: 1
        }
    ]
};

// Boss questions (advanced questions for each chapter)
const bossQuizData = {
    1: [ // Advanced Chapter 1 questions
        {
            question: "Theo WTO, Việt Nam cam kết mở cửa thị trường dịch vụ tài chính bao nhiêu %?",
            options: ["A. 49%", "B. 51%", "C. 65%", "D. 100%"],
            correct: 0
        },
        {
            question: "FDI vào Việt Nam năm 2023 đạt khoảng bao nhiêu tỷ USD?",
            options: ["A. 15,4 tỷ USD", "B. 20,2 tỷ USD", "C. 23,1 tỷ USD", "D. 28,5 tỷ USD"],
            correct: 2
        },
        {
            question: "Việt Nam tham gia ASEAN từ năm nào?",
            options: ["A. 1995", "B. 1997", "C. 1999", "D. 2001"],
            correct: 0
        },
        {
            question: "Tỷ trọng xuất khẩu công nghệ cao trong tổng xuất khẩu của Việt Nam là:",
            options: ["A. 25%", "B. 35%", "C. 45%", "D. 55%"],
            correct: 2
        },
        {
            question: "EVFTA có hiệu lực từ năm nào?",
            options: ["A. 2019", "B. 2020", "C. 2021", "D. 2022"],
            correct: 1
        }
    ],
    2: [ // Advanced Chapter 2 questions
        {
            question: "Theo Đại hội XIII, tỷ lệ lao động qua đào tạo cần đạt bao nhiêu % vào 2030?",
            options: ["A. 70%", "B. 75%", "C. 80%", "D. 85%"],
            correct: 2
        },
        {
            question: "Số lượng hợp tác xã nông nghiệp hiện tại của Việt Nam là:",
            options: ["A. 15.000", "B. 18.500", "C. 21.000", "D. 25.000"],
            correct: 1
        },
        {
            question: "Tỷ lệ doanh nghiệp tư nhân trong tổng số doanh nghiệp Việt Nam:",
            options: ["A. 85%", "B. 90%", "C. 95%", "D. 97%"],
            correct: 3
        },
        {
            question: "Chính sách 'Tam nông' của Trung Quốc ảnh hưởng đến liên minh công-nông-trí thức Việt Nam như thế nào?",
            options: ["A. Không ảnh hưởng", "B. Tích cực học hỏi", "C. Phản đối hoàn toàn", "D. Áp dụng một phần"],
            correct: 1
        },
        {
            question: "Mô hình 'Triple Helix' trong liên minh giai cấp bao gồm:",
            options: ["A. Nhà nước-Doanh nghiệp-Trường học", "B. Công-Nông-Trí thức", "C. Công-Tư-Xã hội", "D. Trong-Ngoài-Quốc tế"],
            correct: 0
        }
    ],
    3: [ // Advanced Chapter 3 questions
        {
            question: "Hệ số Gini của Việt Nam năm 2020 là:",
            options: ["A. 0,35", "B. 0,415", "C. 0,48", "D. 0,52"],
            correct: 1
        },
        {
            question: "Tỷ lệ hộ cận nghèo theo chuẩn quốc gia là:",
            options: ["A. 3,2%", "B. 4,5%", "C. 6,1%", "D. 8,3%"],
            correct: 2
        },
        {
            question: "Thu nhập bình quân đầu người của Việt Nam năm 2023:",
            options: ["A. 3.500 USD", "B. 4.110 USD", "C. 4.620 USD", "D. 5.200 USD"],
            correct: 1
        },
        {
            question: "Tỷ lệ lao động nông nghiệp trong tổng lực lượng lao động:",
            options: ["A. 25%", "B. 30%", "C. 35%", "D. 40%"],
            correct: 0
        },
        {
            question: "Chỉ số phát triển con người (HDI) của Việt Nam xếp thứ mấy trên thế giới?",
            options: ["A. 105", "B. 115", "C. 125", "D. 135"],
            correct: 1
        }
    ]
};

// Player stats
let health = 3;
let hasShield = false;
let canShoot = false;
let questionsAnswered = 0;
let currentQuestionIndex = 0;
let isBossFight = false;
let lastQuestionTime = 0;
let questionCooldown = 3000; // 3 seconds between questions

// Game classes
class Tank {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height - 80;
        this.width = 60;
        this.height = 40;
        this.lane = 1; // 0, 1, 2 (left, center, right)
        this.targetX = this.x;
        this.speed = 8;
    }

    update() {
        // Smooth movement to target lane
        if (Math.abs(this.x - this.targetX) > 2) {
            this.x += (this.targetX - this.x) * 0.2;
        } else {
            this.x = this.targetX;
        }
    }

    draw() {
        // Draw tank shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(this.x - this.width/2 + 2, this.y - this.height/2 + 3, this.width, this.height);
        
        // Draw tank body with gradient
        const gradient = ctx.createLinearGradient(this.x - this.width/2, this.y - this.height/2, this.x + this.width/2, this.y + this.height/2);
        gradient.addColorStop(0, '#6a6a6a');
        gradient.addColorStop(0.5, '#4a4a4a');
        gradient.addColorStop(1, '#2a2a2a');
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
        
        // Draw tank body outline
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
        
        // Draw tank turret with gradient
        const turretGradient = ctx.createLinearGradient(this.x - 15, this.y - 25, this.x + 15, this.y - 5);
        turretGradient.addColorStop(0, '#888');
        turretGradient.addColorStop(0.5, '#666');
        turretGradient.addColorStop(1, '#444');
        ctx.fillStyle = turretGradient;
        ctx.fillRect(this.x - 15, this.y - 25, 30, 20);
        ctx.strokeStyle = '#aaa';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x - 15, this.y - 25, 30, 20);
        
        // Draw tank barrel with metallic effect
        ctx.fillStyle = '#555';
        ctx.fillRect(this.x - 3, this.y - 35, 6, 15);
        ctx.fillStyle = '#777';
        ctx.fillRect(this.x - 2, this.y - 35, 4, 15);
        ctx.fillStyle = '#999';
        ctx.fillRect(this.x - 1, this.y - 35, 2, 15);
        
        // Draw tracks with detail
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x - this.width/2 - 5, this.y - this.height/2 + 5, 10, this.height - 10);
        ctx.fillRect(this.x + this.width/2 - 5, this.y - this.height/2 + 5, 10, this.height - 10);
        
        // Draw track treads
        ctx.fillStyle = '#555';
        for (let i = 0; i < 4; i++) {
            const treadY = this.y - this.height/2 + 8 + i * 8;
            ctx.fillRect(this.x - this.width/2 - 4, treadY, 8, 3);
            ctx.fillRect(this.x + this.width/2 - 4, treadY, 8, 3);
        }
        
        // Draw tank details (bolts, etc.)
        ctx.fillStyle = '#aaa';
        ctx.beginPath();
        ctx.arc(this.x - 8, this.y - 5, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + 8, this.y - 5, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw shield if active
        if (hasShield) {
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#00ff00';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.width/2 + 10, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
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
        this.wingFlap = 0;
    }

    update() {
        this.y += this.speed;
        this.wingFlap += 0.3;
    }

    draw() {
        // Draw bat shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(this.x - 8 + 2, this.y - 5 + 2, 16, 10);
        
        // Draw wings with flapping animation and gradient
        const wingOffset = Math.sin(this.wingFlap) * 5;
        const wingRotation = Math.sin(this.wingFlap) * 0.3;
        
        // Wing gradients
        const wingGradient = ctx.createRadialGradient(this.x - 12, this.y + wingOffset, 0, this.x - 12, this.y + wingOffset, 12);
        wingGradient.addColorStop(0, '#3d2820');
        wingGradient.addColorStop(0.5, '#2d1810');
        wingGradient.addColorStop(1, '#1a0f08');
        
        // Left wing
        ctx.save();
        ctx.translate(this.x - 12, this.y + wingOffset);
        ctx.rotate(wingRotation);
        ctx.fillStyle = wingGradient;
        ctx.beginPath();
        ctx.ellipse(0, 0, 12, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0d0504';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
        
        // Right wing
        ctx.save();
        ctx.translate(this.x + 12, this.y + wingOffset);
        ctx.rotate(-wingRotation);
        ctx.fillStyle = wingGradient;
        ctx.beginPath();
        ctx.ellipse(0, 0, 12, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0d0504';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
        
        // Draw bat body with gradient
        const bodyGradient = ctx.createLinearGradient(this.x - 8, this.y - 5, this.x + 8, this.y + 5);
        bodyGradient.addColorStop(0, '#4d3020');
        bodyGradient.addColorStop(0.5, '#2d1810');
        bodyGradient.addColorStop(1, '#1d1008');
        ctx.fillStyle = bodyGradient;
        ctx.fillRect(this.x - 8, this.y - 5, 16, 10);
        
        // Body outline
        ctx.strokeStyle = '#0d0504';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x - 8, this.y - 5, 16, 10);
        
        // Draw ears
        ctx.fillStyle = '#2d1810';
        ctx.beginPath();
        ctx.moveTo(this.x - 6, this.y - 5);
        ctx.lineTo(this.x - 4, this.y - 9);
        ctx.lineTo(this.x - 2, this.y - 5);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(this.x + 2, this.y - 5);
        ctx.lineTo(this.x + 4, this.y - 9);
        ctx.lineTo(this.x + 6, this.y - 5);
        ctx.fill();
        
        // Eyes with glow effect
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 5;
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(this.x - 3, this.y - 2, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + 3, this.y - 2, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye pupils
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.x - 3, this.y - 2, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + 3, this.y - 2, 1, 0, Math.PI * 2);
        ctx.fill();
        
        // Small fangs
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.x - 2, this.y + 2, 1, 3);
        ctx.fillRect(this.x + 1, this.y + 2, 1, 3);
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
        this.pulse = 0;
    }

    update() {
        this.y += this.speed;
        this.pulse += 0.2;
    }

    draw() {
        const pulseSize = 12 + Math.sin(this.pulse) * 6;
        
        // Draw outer glow
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 20;
        ctx.fillStyle = 'rgba(255, 215, 0, 0.4)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, pulseSize + 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw question mark background
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(this.x, this.y, pulseSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw inner highlight
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#FFEF94';
        ctx.beginPath();
        ctx.arc(this.x - pulseSize/4, this.y - pulseSize/4, pulseSize/3, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw question mark
        ctx.fillStyle = '#000';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', this.x, this.y);
        
        // Reset shadow
        ctx.shadowBlur = 0;
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
        // Draw bullet trail
        ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
        ctx.fillRect(this.x - this.width/2, this.y, this.width, 15);
        
        // Draw bullet core with gradient
        const bulletGradient = ctx.createLinearGradient(this.x - this.width/2, this.y - this.height/2, this.x + this.width/2, this.y + this.height/2);
        bulletGradient.addColorStop(0, '#ffff88');
        bulletGradient.addColorStop(0.5, '#ffff00');
        bulletGradient.addColorStop(1, '#ffaa00');
        
        ctx.fillStyle = bulletGradient;
        ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
        
        // Add outer glow
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x - this.width/4, this.y - this.height/4, this.width/2, this.height/2);
        
        // Add core highlight
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x - 1, this.y - this.height/2, 1, this.height);
    }

    isOffScreen() {
        return this.y < -10;
    }
}

class Boss {
    constructor(chapter) {
        this.chapter = chapter;
        this.x = canvas.width / 2;
        this.y = 120;
        this.width = canvas.width * 0.8; // Chiếm hầu hết 3 lanes
        this.height = 120;
        this.health = 5;
        this.maxHealth = 5;
        this.lastAttack = 0;
        this.attackCooldown = 4000; // 4 seconds
        this.pulse = 0;
        this.breathe = 0;
        this.eyeGlow = 0;
        
        const names = ["Quái Vật Toàn Cầu Hóa", "Ác Ma Liên Minh", "Yêu Tinh Phân Hóa"];
        this.name = names[chapter - 1];
    }

    update() {
        this.pulse += 0.1;
        this.breathe += 0.05;
        this.eyeGlow += 0.15;
        
        // Boss attacks
        if (Date.now() - this.lastAttack > this.attackCooldown) {
            this.attack();
            this.lastAttack = Date.now();
        }
    }

    attack() {
        switch(this.chapter) {
            case 1: // Summon 3 bats in one lane
                const lane1 = Math.floor(Math.random() * 3);
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => {
                        enemies.push(new Bat(lane1));
                    }, i * 200);
                }
                break;
                
            case 2: // Summon 2x2 bats in one lane
                const lane2 = Math.floor(Math.random() * 3);
                for (let i = 0; i < 2; i++) {
                    setTimeout(() => {
                        enemies.push(new Bat(lane2));
                        enemies.push(new Bat(lane2));
                    }, i * 300);
                }
                break;
                
            case 3: // Summon 3 bats across all lanes
                for (let lane = 0; lane < 3; lane++) {
                    setTimeout(() => {
                        enemies.push(new Bat(lane));
                    }, lane * 150);
                }
                break;
        }
    }

    draw() {
        const pulseSize = 15 + Math.sin(this.pulse) * 8;
        const breatheOffset = Math.sin(this.breathe) * 3;
        const eyeGlowIntensity = 0.5 + Math.sin(this.eyeGlow) * 0.5;
        
        // Draw boss body (scary monster) with breathing animation
        const bodyY = this.y + breatheOffset;
        ctx.fillStyle = '#4a0e4e';
        ctx.fillRect(this.x - this.width/2, bodyY - this.height/2, this.width, this.height);
        
        // Draw spikes across the top
        ctx.fillStyle = '#2d082f';
        const numSpikes = Math.floor(this.width / 40);
        for (let i = 0; i < numSpikes; i++) {
            const spikeX = this.x - this.width/2 + (i * this.width/numSpikes) + 20;
            const spikeHeight = 15 + Math.sin(this.pulse + i) * 5;
            ctx.beginPath();
            ctx.moveTo(spikeX - 10, bodyY - this.height/2);
            ctx.lineTo(spikeX, bodyY - this.height/2 - spikeHeight);
            ctx.lineTo(spikeX + 10, bodyY - this.height/2);
            ctx.fill();
        }
        
        // Draw evil eyes with glow effect
        const eyeSize = 12 + Math.sin(this.breathe) * 2;
        ctx.shadowColor = `rgba(255, 0, 0, ${eyeGlowIntensity})`;
        ctx.shadowBlur = 15;
        
        ctx.fillStyle = `rgba(255, 0, 0, ${eyeGlowIntensity})`;
        ctx.beginPath();
        ctx.arc(this.x - 40, bodyY - 20, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + 40, bodyY - 20, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw pupils
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.x - 40, bodyY - 20, eyeSize/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + 40, bodyY - 20, eyeSize/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw animated mouth
        const mouthWidth = 50 + Math.sin(this.breathe) * 10;
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(this.x, bodyY + 20, mouthWidth/2, 0, Math.PI);
        ctx.stroke();
        
        // Draw multiple fangs
        ctx.fillStyle = '#fff';
        for (let i = -2; i <= 2; i++) {
            if (i === 0) continue;
            const fangX = this.x + i * 15;
            const fangSize = Math.abs(i) === 2 ? 15 : 20;
            ctx.beginPath();
            ctx.moveTo(fangX - 3, bodyY + 20);
            ctx.lineTo(fangX, bodyY + 20 + fangSize);
            ctx.lineTo(fangX + 3, bodyY + 20);
            ctx.fill();
        }
        
        // Pulsing aura with multiple layers
        for (let i = 0; i < 3; i++) {
            ctx.strokeStyle = `rgba(255, 0, 0, ${0.2 - i * 0.05})`;
            ctx.lineWidth = 3 - i;
            ctx.beginPath();
            ctx.arc(this.x, bodyY, this.width/2 + pulseSize + i * 10, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Draw boss health outline
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - this.width/2, bodyY - this.height/2, this.width, this.height);
    }

    takeDamage() {
        this.health--;
        return this.health <= 0;
    }
}

// Game initialization
function initGame() {
    tank = new Tank();
    enemies = [];
    bullets = [];
    questionMarks = [];
    boss = null;
    health = 3;
    hasShield = false;
    canShoot = false;
    questionsAnswered = 0;
    currentQuestionIndex = 0;
    isBossFight = false;
    gameTime = 0;
    chapterStartTime = Date.now();
    initBackgroundParticles();
    updateUI();
}

function updateUI() {
    // Update timer (always show minutes:seconds)
    const totalSeconds = Math.floor(gameTime);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    document.getElementById('timer').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Update chapter
    document.getElementById('chapter').textContent = currentChapter;
    
    // Update hearts
    let heartsDisplay = '';
    for (let i = 0; i < health; i++) {
        heartsDisplay += '❤️';
    }
    for (let i = health; i < 3; i++) {
        heartsDisplay += '🖤';
    }
    document.getElementById('hearts').innerHTML = heartsDisplay;
    
    // Update buffs
    const hasAnyBuff = hasShield || canShoot;
    document.getElementById('shield').style.display = hasShield ? 'block' : 'none';
    document.getElementById('shootBuff').style.display = canShoot ? 'block' : 'none';
    document.getElementById('noBuffs').style.display = hasAnyBuff ? 'none' : 'block';
    
    // Update boss UI
    if (isBossFight && boss) {
        document.getElementById('bossSection').style.display = 'block';
        document.getElementById('bossName').textContent = boss.name;
        const healthPercent = (boss.health / boss.maxHealth) * 100;
        document.getElementById('bossHealthBar').style.width = healthPercent + '%';
        document.getElementById('bossHealthText').textContent = `${boss.health}/${boss.maxHealth} HP`;
    } else {
        document.getElementById('bossSection').style.display = 'none';
    }
}

// Pause system
function showPause(title, message, callback) {
    gameState = 'paused';
    document.getElementById('pauseTitle').textContent = title;
    document.getElementById('pauseMessage').textContent = message;
    document.getElementById('pauseModal').style.display = 'block';
    window.pauseCallback = callback;
}

function continuGame() {
    document.getElementById('pauseModal').style.display = 'none';
    if (window.pauseCallback) {
        window.pauseCallback();
        window.pauseCallback = null;
    } else {
        gameState = 'playing';
    }
}

// Quiz system
function showQuiz() {
    if (questionsAnswered >= 5 && !isBossFight) {
        // Start boss fight
        startBossFight();
        return;
    }
    
    // Check cooldown for regular questions (not during boss fight)
    if (!isBossFight && Date.now() - lastQuestionTime < questionCooldown) {
        return;
    }
    
    gameState = 'quiz';
    
    // Use boss questions during boss fight, regular questions otherwise
    const questionData = isBossFight ? bossQuizData[currentChapter] : quizData[currentChapter];
    const question = questionData[currentQuestionIndex];
    
    document.getElementById('quizQuestion').textContent = question.question;
    
    const optionsContainer = document.getElementById('quizOptions');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'quiz-option';
        button.textContent = option;
        button.onclick = () => answerQuestion(index);
        optionsContainer.appendChild(button);
    });
    
    document.getElementById('quizFeedback').textContent = '';
    document.getElementById('quizModal').style.display = 'block';
    lastQuestionTime = Date.now();
}

function answerQuestion(selectedIndex) {
    const questionData = isBossFight ? bossQuizData[currentChapter] : quizData[currentChapter];
    const question = questionData[currentQuestionIndex];
    const feedback = document.getElementById('quizFeedback');
    
    if (selectedIndex === question.correct) {
        feedback.style.color = '#00ff00';
        if (isBossFight) {
            feedback.textContent = 'Chính xác! Boss nhận sát thương!';
        } else {
            feedback.textContent = 'Chính xác! Bạn nhận được buff ngẫu nhiên!';
        }
        
        setTimeout(() => {
            if (isBossFight && boss) {
                // Damage boss during boss fight
                if (boss.takeDamage()) {
                    // Boss defeated - immediate cleanup
                    boss = null;
                    isBossFight = false;
                    enemies = []; // Clear all enemies
                    bullets = []; // Clear all bullets  
                    questionMarks = []; // Clear all question marks
                    gameState = 'paused'; // Prevent any further actions
                    closeQuiz();
                    completeChapter();
                    return; // Exit early to prevent further processing
                }
                updateUI();
                closeQuiz();
                currentQuestionIndex++;
                questionsAnswered++;
            } else {
                giveRandomBuff();
                closeQuiz();
                currentQuestionIndex++;
                questionsAnswered++;
                
                // Only trigger boss fight if we're not already in one and haven't completed chapter
                if (questionsAnswered >= 5 && !isBossFight && gameState === 'playing') {
                    setTimeout(() => startBossFight(), 1000);
                }
            }
        }, 1500);
    } else {
        feedback.style.color = '#ff0000';
        feedback.textContent = 'Sai rồi! +5 giây penalty. Hãy thử lại!';
        gameTime += 5; // Add 5 seconds penalty
        updateUI();
    }
}

function giveRandomBuff() {
    const buffs = [
        () => { canShoot = true; showMessage('Buff: Có thể bắn!', '#00ff00'); },
        () => { 
            if (health < 3) {
                health++; 
                showMessage('Buff: Hồi 1 máu!', '#ff69b4');
            } else {
                showMessage('Buff: Máu đã đầy!', '#ffff00');
            }
        },
        () => { 
            health = Math.min(3, health + 3); 
            showMessage('Buff: Hồi 3 máu!', '#ff1493');
        },
        () => { 
            gameTime = Math.max(0, gameTime - 10); 
            showMessage('Buff: -10 giây!', '#00bfff');
        },
        () => { 
            hasShield = true; 
            showMessage('Buff: Khiên bảo vệ!', '#ffd700');
        }
    ];
    
    const randomBuff = buffs[Math.floor(Math.random() * buffs.length)];
    randomBuff();
    updateUI();
}

function showMessage(text, color) {
    // Create temporary message display
    const messageDiv = document.createElement('div');
    messageDiv.style.position = 'absolute';
    messageDiv.style.top = '50%';
    messageDiv.style.left = '50%';
    messageDiv.style.transform = 'translate(-50%, -50%)';
    messageDiv.style.color = color;
    messageDiv.style.fontSize = '24px';
    messageDiv.style.fontWeight = 'bold';
    messageDiv.style.textShadow = '2px 2px 4px rgba(0,0,0,0.7)';
    messageDiv.style.zIndex = '1000';
    messageDiv.textContent = text;
    
    document.getElementById('gameContainer').appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 2000);
}

function closeQuiz() {
    document.getElementById('quizModal').style.display = 'none';
    gameState = 'playing';
}

function startBossFight() {
    isBossFight = true;
    boss = new Boss(currentChapter);
    enemies = []; // Clear existing enemies
    questionMarks = []; // Clear question marks
    currentQuestionIndex = 0; // Reset for boss questions
    questionsAnswered = 0;
    updateUI();
    
    showPause('👹 Boss Xuất Hiện!', `${boss.name} đã xuất hiện! Thu thập dấu ? để trả lời câu hỏi boss và gây sát thương!`, () => {
        gameState = 'playing';
    });
}

// Collision detection
function checkCollisions() {
    const tankRect = {
        x: tank.x - tank.width/2,
        y: tank.y - tank.height/2,
        width: tank.width,
        height: tank.height
    };
    
    // Check tank vs enemies
    enemies.forEach((enemy, enemyIndex) => {
        const enemyRect = {
            x: enemy.x - enemy.width/2,
            y: enemy.y - enemy.height/2,
            width: enemy.width,
            height: enemy.height
        };
        
        if (isColliding(tankRect, enemyRect)) {
            enemies.splice(enemyIndex, 1);
            takeDamage();
        }
    });
    
    // Check tank vs question marks
    questionMarks.forEach((qm, qmIndex) => {
        const qmRect = {
            x: qm.x - qm.width/2,
            y: qm.y - qm.height/2,
            width: qm.width,
            height: qm.height
        };
        
        if (isColliding(tankRect, qmRect)) {
            questionMarks.splice(qmIndex, 1);
            showQuiz();
        }
    });
    
    // Check bullets vs enemies
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            const bulletRect = {
                x: bullet.x - bullet.width/2,
                y: bullet.y - bullet.height/2,
                width: bullet.width,
                height: bullet.height
            };
            
            const enemyRect = {
                x: enemy.x - enemy.width/2,
                y: enemy.y - enemy.height/2,
                width: enemy.width,
                height: enemy.height
            };
            
            if (isColliding(bulletRect, enemyRect)) {
                bullets.splice(bulletIndex, 1);
                enemies.splice(enemyIndex, 1);
            }
        });
    });
    
    // Check bullets vs boss (bullets just pass through, no damage)
    if (boss) {
        bullets.forEach((bullet, bulletIndex) => {
            const bulletRect = {
                x: bullet.x - bullet.width/2,
                y: bullet.y - bullet.height/2,
                width: bullet.width,
                height: bullet.height
            };
            
            const bossRect = {
                x: boss.x - boss.width/2,
                y: boss.y - boss.height/2,
                width: boss.width,
                height: boss.height
            };
            
            if (isColliding(bulletRect, bossRect)) {
                bullets.splice(bulletIndex, 1);
                // Bullets hit boss but don't damage - only quiz answers damage boss
            }
        });
    }
}

function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function takeDamage() {
    if (hasShield) {
        hasShield = false;
        showMessage('Khiên đã bảo vệ bạn!', '#ffd700');
    } else {
        health--;
        showMessage('Mất 1 máu!', '#ff0000');
        
        if (health <= 0) {
            // Game over with restart option
            showPause('💀 Game Over!', 
                `Bạn đã chết tại chương ${currentChapter}!\nBạn có muốn chơi lại từ chương này không?`, 
                () => {
                    // Restart from current chapter
                    restartFromChapter(currentChapter);
                });
            return;
        }
    }
    updateUI();
}

function restartFromChapter(chapter) {
    currentChapter = chapter;
    gameStartChapter = chapter;
    questionsAnswered = 0;
    currentQuestionIndex = 0;
    chapterStartTime = Date.now();
    gameTime = 0;
    health = 3;
    hasShield = false;
    canShoot = false;
    isBossFight = false;
    boss = null;
    enemies = [];
    bullets = [];
    questionMarks = [];
    lastBatSpawn = 0;
    lastQuestionSpawn = 0;
    
    updateUI();
    gameState = 'playing';
}

function completeChapter() {
    const chapterTime = Math.floor((Date.now() - chapterStartTime) / 1000);
    
    if (currentChapter < 3) {
        // Show chapter completion pause
        showPause('🎉 Chương Hoàn Thành!', 
            `Chương ${currentChapter} hoàn thành!\nThời gian: ${Math.floor(chapterTime/60)}:${(chapterTime%60).toString().padStart(2, '0')}\nChuẩn bị chương tiếp theo...`, 
            () => {
                // Reset everything for new chapter
                currentChapter++;
                questionsAnswered = 0;
                currentQuestionIndex = 0;
                chapterStartTime = Date.now();
                gameTime = 0; // Reset timer
                health = 3; // Reset health
                hasShield = false; // Reset buffs
                canShoot = false;
                isBossFight = false;
                boss = null;
                enemies = [];
                bullets = [];
                questionMarks = [];
                lastBatSpawn = 0;
                lastQuestionSpawn = 0;
                
                updateUI();
                gameState = 'playing';
            });
    } else {
        // Game completed
        const totalTime = Math.floor(gameTime);
        showPause('🏆 Chúc Mừng!', 
            `Bạn đã hoàn thành tất cả 3 chương!\nTổng thời gian: ${Math.floor(totalTime/60)}:${(totalTime%60).toString().padStart(2, '0')}\nNhấn F5 để chơi lại từ đầu.`, 
            () => {
                gameState = 'gameOver';
            });
    }
}

// Spawn enemies and question marks
let lastBatSpawn = 0;
let lastQuestionSpawn = 0;

function spawnObjects() {
    if (gameState !== 'playing') return;
    
    const now = Date.now();
    
    // More natural random intervals
    const baseInterval = isBossFight ? 1500 : 2000; // Base time between spawns
    const chapterMultiplier = 1 - (currentChapter - 1) * 0.2; // Chapter 1: 1x, Chapter 2: 0.8x, Chapter 3: 0.6x
    const batInterval = baseInterval * chapterMultiplier;
    
    // Add randomness to spawn timing (±50% variation)
    const randomVariation = 0.5 + Math.random(); // 0.5 to 1.5
    const actualBatInterval = batInterval * randomVariation;
    
    // Spawn bats with natural timing
    if (now - lastBatSpawn > actualBatInterval) {
        // Random chance to spawn (not every interval)
        if (Math.random() < 0.7) { // 70% chance to spawn when interval reached
            const lane = Math.floor(Math.random() * 3);
            enemies.push(new Bat(lane));
            lastBatSpawn = now;
            
            // Chapter-based multi-spawn with delays
            if (currentChapter >= 2 && Math.random() < 0.25) {
                const delay = 400 + Math.random() * 600; // 400-1000ms delay
                setTimeout(() => {
                    if (gameState === 'playing') {
                        const lane2 = Math.floor(Math.random() * 3);
                        enemies.push(new Bat(lane2));
                    }
                }, delay);
            }
            if (currentChapter >= 3 && Math.random() < 0.15) {
                const delay = 800 + Math.random() * 800; // 800-1600ms delay
                setTimeout(() => {
                    if (gameState === 'playing') {
                        const lane3 = Math.floor(Math.random() * 3);
                        enemies.push(new Bat(lane3));
                    }
                }, delay);
            }
        } else {
            // Skip this spawn but reset timer with shorter interval
            lastBatSpawn = now - actualBatInterval * 0.3;
        }
    }
    
    // Question mark spawn with natural variation
    const questionBaseInterval = isBossFight ? 4000 : 6000;
    const questionVariation = 0.7 + Math.random() * 0.6; // 0.7 to 1.3
    const actualQuestionInterval = questionBaseInterval * questionVariation;
    
    if (questionsAnswered < 5 && now - lastQuestionSpawn > actualQuestionInterval) {
        if (Math.random() < 0.8) { // 80% chance when interval reached
            const lane = Math.floor(Math.random() * 3);
            questionMarks.push(new QuestionMark(lane));
            lastQuestionSpawn = now;
        } else {
            // Skip but reset with shorter interval
            lastQuestionSpawn = now - actualQuestionInterval * 0.4;
        }
    }
}

// Game loop
function gameLoop(currentTime) {
    if (lastTime === 0) lastTime = currentTime;
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    
    // Timer always runs (even during quiz)
    if (gameState === 'playing' || gameState === 'quiz') {
        gameTime += deltaTime;
    }
    
    if (gameState === 'playing') {
        // Update objects
        tank.update();
        
        enemies.forEach(enemy => enemy.update());
        bullets.forEach(bullet => bullet.update());
        questionMarks.forEach(qm => qm.update());
        
        if (boss) {
            boss.update();
        }
        
        // Remove off-screen objects
        enemies = enemies.filter(enemy => !enemy.isOffScreen());
        bullets = bullets.filter(bullet => !bullet.isOffScreen());
        questionMarks = questionMarks.filter(qm => !qm.isOffScreen());
        
        // Spawn new objects
        spawnObjects();
        
        // Check collisions
        checkCollisions();
    }
    
    // Always update UI and draw
    updateUI();
    draw();
    
    if (gameState !== 'gameOver') {
        requestAnimationFrame(gameLoop);
    }
}

// Background particles for atmosphere
let backgroundParticles = [];

function initBackgroundParticles() {
    backgroundParticles = [];
    for (let i = 0; i < 50; i++) {
        backgroundParticles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            speed: Math.random() * 0.5 + 0.2,
            opacity: Math.random() * 0.3 + 0.1
        });
    }
}

function updateBackgroundParticles() {
    backgroundParticles.forEach(particle => {
        particle.y += particle.speed;
        if (particle.y > canvas.height) {
            particle.y = -10;
            particle.x = Math.random() * canvas.width;
        }
    });
}

function drawBackgroundParticles() {
    backgroundParticles.forEach(particle => {
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background particles
    updateBackgroundParticles();
    drawBackgroundParticles();
    
    // Draw lane dividers with better visibility
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 3;
    ctx.setLineDash([15, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.375, 0);
    ctx.lineTo(canvas.width * 0.375, canvas.height);
    ctx.moveTo(canvas.width * 0.625, 0);
    ctx.lineTo(canvas.width * 0.625, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Add glow effect to lane dividers
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 6;
    ctx.setLineDash([15, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.375, 0);
    ctx.lineTo(canvas.width * 0.375, canvas.height);
    ctx.moveTo(canvas.width * 0.625, 0);
    ctx.lineTo(canvas.width * 0.625, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw game objects
    tank.draw();
    
    enemies.forEach(enemy => enemy.draw());
    bullets.forEach(bullet => bullet.draw());
    questionMarks.forEach(qm => qm.draw());
    
    if (boss) {
        boss.draw();
    }
    
    // Draw game over screen
    if (gameState === 'gameOver') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (health <= 0) {
            ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2 - 50);
        } else {
            ctx.fillText('CHÚC MỪNG!', canvas.width/2, canvas.height/2 - 50);
        }
        
        ctx.font = '20px Arial';
        const totalTime = Math.floor(gameTime);
        ctx.fillText(`Thời gian: ${Math.floor(totalTime/60)}:${(totalTime%60).toString().padStart(2, '0')}`, canvas.width/2, canvas.height/2);
        
        ctx.font = '16px Arial';
        ctx.fillText('Nhấn F5 để chơi lại', canvas.width/2, canvas.height/2 + 40);
    }
}

// Event handlers
document.addEventListener('keydown', (e) => {
    if (gameState !== 'playing') return;
    
    switch(e.code) {
        case 'ArrowLeft':
        case 'KeyA':
            if (tank.lane > 0) {
                tank.moveTo(tank.lane - 1);
            }
            break;
        case 'ArrowRight':
        case 'KeyD':
            if (tank.lane < 2) {
                tank.moveTo(tank.lane + 1);
            }
            break;
        case 'Space':
            e.preventDefault();
            tank.shoot();
            break;
    }
});

// Start game
document.getElementById('startButton').addEventListener('click', () => {
    document.getElementById('startScreen').style.display = 'none';
    gameState = 'playing';
    initGame();
    requestAnimationFrame(gameLoop);
});

// Initialize
initGame();