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

// Powerup system
let activePowerups = [];
let powerupChoices = [];
let isSelectingPowerup = false;

// Powerup definitions - 30 unique powerups in 6 groups
const POWERUP_GROUPS = {
    ATTACK: 'attack',
    DEFENSE: 'defense', 
    SPEED: 'speed',
    UTILITY: 'utility',
    ECONOMIC: 'economic',
    SPECIAL: 'special'
};

const POWERUPS = [
    // Attack Group (5 powerups) - Chiến Thần set
    { id: 1, name: 'Chiến Thần: Hỏa Lực', desc: 'Bắn nhanh hơn 50%', group: 'attack', effect: 'rapidFire' },
    { id: 2, name: 'Chiến Thần: Song Đạn', desc: 'Bắn 2 đạn cùng lúc', group: 'attack', effect: 'doubleShot' },
    { id: 3, name: 'Chiến Thần: Xuyên Thấu', desc: 'Đạn xuyên qua nhiều quái', group: 'attack', effect: 'piercingBullets' },
    { id: 4, name: 'Chiến Thần: Nổ Tung', desc: 'Đạn có sát thương AOE', group: 'attack', effect: 'explosiveRounds' },
    { id: 5, name: 'Chiến Thần: Tự Dẫn', desc: 'Đạn tự động tìm mục tiêu', group: 'attack', effect: 'heatSeeking' },
    
    // Defense Group (5 powerups) - Giáp Sắt set
    { id: 6, name: 'Giáp Sắt: Khiên Năng', desc: 'Khiên hấp thụ 3 sát thương', group: 'defense', effect: 'energyShield' },
    { id: 7, name: 'Giáp Sắt: Áo Giáp', desc: 'Giảm 50% sát thương nhận', group: 'defense', effect: 'armorPlating' },
    { id: 8, name: 'Giáp Sắt: Sửa Chữa', desc: 'Tự động hồi 1 HP khi dưới 50%', group: 'defense', effect: 'emergencyRepair' },
    { id: 9, name: 'Giáp Sắt: Lực Trường', desc: 'Miễn nhiệm sát thương 5 giây', group: 'defense', effect: 'forceField' },
    { id: 10, name: 'Giáp Sắt: Tái Sinh', desc: 'Hồi 1 HP mỗi 30 giây', group: 'defense', effect: 'regeneration' },
    
    // Speed Group (5 powerups) - Tốc Độ set
    { id: 11, name: 'Tốc Độ: Đuôi Lửa', desc: 'Tốc độ di chuyển +100%', group: 'speed', effect: 'afterburner' },
    { id: 12, name: 'Tốc Độ: Phản Xạ', desc: 'Thời gian phản ứng nhanh hơn', group: 'speed', effect: 'quickReflexes' },
    { id: 13, name: 'Tốc Độ: Lướt Qua', desc: 'Có thể dash qua quái', group: 'speed', effect: 'dashAbility' },
    { id: 14, name: 'Tốc Độ: Giãn Thời', desc: 'Làm chậm thời gian 20%', group: 'speed', effect: 'timeDilation' },
    { id: 15, name: 'Tốc Độ: Siêu Tăng', desc: 'Di chuyển không giới hạn tốc độ', group: 'speed', effect: 'boostEngine' },
    
    // Utility Group (5 powerups) - Hỗ Trợ set
    { id: 16, name: 'Hỗ Trợ: Nam Châm', desc: 'Thu hút câu hỏi từ xa', group: 'utility', effect: 'questionMagnet' },
    { id: 17, name: 'Hỗ Trợ: Đóng Băng', desc: 'Dừng thời gian 10 giây', group: 'utility', effect: 'timeFreeze' },
    { id: 18, name: 'Hỗ Trợ: Radar', desc: 'Hiển thị vị trí quái sắp xuất hiện', group: 'utility', effect: 'enemyDetector' },
    { id: 19, name: 'Hỗ Trợ: Tự Lái', desc: 'Tự động tránh quái 15 giây', group: 'utility', effect: 'autoPilot' },
    { id: 20, name: 'Hỗ Trợ: Quét Năng', desc: 'Xem trước 3 powerup tiếp theo', group: 'utility', effect: 'powerScanner' },
    
    // Economic Group (5 powerups) - Tiết Kiệm set
    { id: 21, name: 'Tiết Kiệm: Nhân Bội', desc: 'Điểm số x2', group: 'economic', effect: 'scoreMultiplier' },
    { id: 22, name: 'Tiết Kiệm: Thưởng Thêm', desc: '+50% điểm từ câu hỏi đúng', group: 'economic', effect: 'bonusHunter' },
    { id: 23, name: 'Tiết Kiệm: Giảm Giờ', desc: 'Giảm 20 giây timer', group: 'economic', effect: 'timeBonus' },
    { id: 24, name: 'Tiết Kiệm: Chuyên Gia', desc: 'Cần ít câu hỏi hơn để qua màn', group: 'economic', effect: 'efficiencyExpert' },
    { id: 25, name: 'Tiết Kiệm: Tái Chế', desc: 'Có cơ hội nhận lại powerup đã dùng', group: 'economic', effect: 'resourceRecycler' },
    
    // Special Group (5 powerups) - Hư Vô set
    { id: 26, name: 'Hư Vô: Phượng Hoàng', desc: 'Hồi sinh 1 lần khi chết', group: 'special', effect: 'phoenixWing' },
    { id: 27, name: 'Hư Vô: Lượng Tử', desc: 'Teleport đến vị trí an toàn', group: 'special', effect: 'quantumLeap' },
    { id: 28, name: 'Hư Vô: Thực Tại', desc: 'Hoán đổi HP với số câu hỏi còn lại', group: 'special', effect: 'realityShift' },
    { id: 29, name: 'Hư Vô: Xác Suất', desc: 'Tăng 30% cơ hội powerup tốt', group: 'special', effect: 'probabilityManipulator' },
    { id: 30, name: 'Hư Vô: Nghịch Lý', desc: 'Kích hoạt tất cả powerup cùng lúc 10s', group: 'special', effect: 'paradoxEngine' }
];

// Group combo effects (2/4 instead of 3/6) - BALANCED FOR GAMEPLAY
const GROUP_COMBOS = {
    attack: {
        2: { name: 'Chiến Thần', desc: 'Bắn nhanh hơn 100% và xuyên thấu' },
        4: { name: 'Hủy Diệt', desc: 'Đạn nổ và tự dẫn mục tiêu' }
    },
    defense: {
        2: { name: 'Giáp Sắt', desc: 'Khiên +2 lớp và hồi máu chậm' },
        4: { name: 'Bất Tử', desc: 'Hồi sinh 1 lần + miễn nhiệm 10s' }
    },
    speed: {
        2: { name: 'Tốc Độ', desc: 'Di chuyển nhanh +150% và dash qua quái' },
        4: { name: 'Thần Tốc', desc: 'Teleport tức thời và làm chậm thời gian' }
    },
    utility: {
        2: { name: 'Hỗ Trợ', desc: 'Thu hút items và dừng thời gian' },
        4: { name: 'Toàn Năng', desc: 'Tự động né và radar quái' }
    },
    economic: {
        2: { name: 'Tiết Kiệm', desc: 'Giảm 30s timer và ít câu hỏi hơn' },
        4: { name: 'Hiệu Quả', desc: 'Skip boss + điểm x3' }
    },
    special: {
        2: { name: 'Hư Vô', desc: 'Hồi sinh + hoán đổi HP-timer' },
        4: { name: 'Siêu Việt', desc: 'Kích hoạt mọi buff 15 giây' }
    }
};

// Game classes
class Airplane {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height - 80;
        this.width = 50;
        this.height = 40;
        this.lane = 1; // 0, 1, 2 (left, center, right)
        this.targetX = this.x;
        this.speed = 8;
        this.engineGlow = 0;
        this.propeller = 0;
        this.tilt = 0;
    }

    update() {
        // Smooth movement to target lane
        const isMoving = Math.abs(this.x - this.targetX) > 2;
        if (isMoving) {
            this.x += (this.targetX - this.x) * 0.25;
            this.tilt = (this.targetX - this.x) * 0.1; // Banking effect
        } else {
            this.x = this.targetX;
            this.tilt *= 0.9; // Gradual return to level
        }
        
        // Animation updates
        this.engineGlow += 0.2;
        this.propeller += 1.5;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.tilt);
        
        // Main fuselage gradient (vertical orientation)
        const fuselageGrad = ctx.createLinearGradient(-8, -25, 8, 25);
        fuselageGrad.addColorStop(0, '#E6E6FA');
        fuselageGrad.addColorStop(0.5, '#4169E1');
        fuselageGrad.addColorStop(1, '#191970');
        ctx.fillStyle = fuselageGrad;
        ctx.fillRect(-8, -25, 16, 50);
        
        // Cockpit (front)
        const cockpitGrad = ctx.createLinearGradient(-6, -25, 6, -15);
        cockpitGrad.addColorStop(0, '#87CEEB');
        cockpitGrad.addColorStop(1, '#4682B4');
        ctx.fillStyle = cockpitGrad;
        ctx.fillRect(-6, -25, 12, 10);
        
        // Wings (horizontal)
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(-25, -5, 50, 10);
        
        // Wing details
        ctx.fillStyle = '#A9A9A9';
        ctx.fillRect(-23, -3, 46, 6);
        
        // Tail wings
        ctx.fillStyle = '#4169E1';
        ctx.fillRect(-15, 15, 30, 8);
        ctx.fillRect(-8, 20, 16, 5);
        
        // Propeller blur effect (front)
        const propBlur = Math.sin(this.propeller) * 0.3;
        ctx.fillStyle = `rgba(200, 200, 200, ${0.3 + propBlur})`;
        ctx.fillRect(-6, -35, 12, 10);
        
        // Engine glow (back)
        const glowIntensity = 0.5 + Math.sin(this.engineGlow) * 0.3;
        ctx.fillStyle = `rgba(255, 100, 0, ${glowIntensity})`;
        ctx.fillRect(-4, 20, 8, 6);
        
        // Landing gear
        ctx.fillStyle = '#696969';
        ctx.fillRect(-8, 8, 3, 8);
        ctx.fillRect(5, 8, 3, 8);
        
        // Nose cone (front tip)
        ctx.fillStyle = '#FF6347';
        ctx.fillRect(-5, -30, 10, 8);
        
        // Windows
        ctx.fillStyle = '#87CEEB';
        for(let i = 0; i < 3; i++) {
            ctx.fillRect(-4, -20 + i*6, 8, 4);
        }
        
        ctx.restore();
        
        // Shield effect
        if (hasShield) {
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#00ff00';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.width/2 + 15, 0, Math.PI * 2);
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

// Chapter 1 Enemies - Sky Theme
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
        this.type = 'bat';
        this.hp = 1;
    }

    update() {
        this.y += this.speed;
        this.wingFlap += 0.3;
    }

    draw() {
        // Shadow removed for cleaner bright theme
        
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

// Chapter 1 Additional Enemies
class Eagle {
    constructor(lane) {
        this.lane = lane;
        const lanePositions = [canvas.width * 0.25, canvas.width * 0.5, canvas.width * 0.75];
        this.x = lanePositions[lane];
        this.y = -40;
        this.width = 40;
        this.height = 25;
        this.speed = 2;
        this.wingFlap = 0;
        this.type = 'eagle';
        this.hp = 2;
        this.lastDive = 0;
    }

    update() {
        // Eagles can dive to other lanes
        if (Date.now() - this.lastDive > 3000 && Math.random() < 0.1) {
            this.lane = Math.floor(Math.random() * 3);
            const lanePositions = [canvas.width * 0.25, canvas.width * 0.5, canvas.width * 0.75];
            this.x = lanePositions[this.lane];
            this.speed = 6; // Dive speed
            this.lastDive = Date.now();
        }
        
        this.y += this.speed;
        this.wingFlap += 0.2;
        
        // Return to normal speed after dive
        if (this.speed > 2) {
            this.speed = Math.max(2, this.speed - 0.1);
        }
    }

    draw() {
        // Draw eagle with larger wings
        const wingOffset = Math.sin(this.wingFlap) * 8;
        
        // Wings
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x - 20, this.y + wingOffset - 5, 15, 8);
        ctx.fillRect(this.x + 5, this.y + wingOffset - 5, 15, 8);
        
        // Body
        ctx.fillStyle = '#654321';
        ctx.fillRect(this.x - 10, this.y - 8, 20, 16);
        
        // Head
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(this.x - 6, this.y - 12, 12, 8);
        
        // Beak
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(this.x - 8, this.y - 8, 4, 3);
        
        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x - 4, this.y - 10, 2, 2);
        ctx.fillRect(this.x + 2, this.y - 10, 2, 2);
    }

    isOffScreen() {
        return this.y > canvas.height + 50;
    }
}

class StormCloud {
    constructor(lane) {
        this.lane = lane;
        const lanePositions = [canvas.width * 0.25, canvas.width * 0.5, canvas.width * 0.75];
        this.x = lanePositions[lane];
        this.y = -60;
        this.width = 60;
        this.height = 30;
        this.speed = 1;
        this.type = 'stormcloud';
        this.hp = 3;
        this.opacity = 0.8;
        this.lightningCharge = 0;
    }

    update() {
        this.y += this.speed;
        this.lightningCharge += 0.05;
        
        // Lightning attack every 5 seconds
        if (this.lightningCharge > 5 && Math.random() < 0.02) {
            this.createLightning();
            this.lightningCharge = 0;
        }
    }

    createLightning() {
        // Create lightning projectile
        enemies.push(new Lightning(this.lane, this.y + 20));
    }

    draw() {
        const glow = 0.3 + Math.sin(this.lightningCharge) * 0.2;
        
        // Cloud body
        ctx.fillStyle = `rgba(100, 100, 100, ${this.opacity})`;
        ctx.fillRect(this.x - 30, this.y - 15, 60, 30);
        ctx.fillRect(this.x - 20, this.y - 25, 40, 20);
        
        // Lightning glow when charging
        if (this.lightningCharge > 3) {
            ctx.fillStyle = `rgba(255, 255, 0, ${glow})`;
            ctx.fillRect(this.x - 25, this.y - 10, 50, 20);
        }
    }

    isOffScreen() {
        return this.y > canvas.height + 100;
    }
}

class Lightning {
    constructor(lane, startY) {
        this.lane = lane;
        const lanePositions = [canvas.width * 0.25, canvas.width * 0.5, canvas.width * 0.75];
        this.x = lanePositions[lane];
        this.y = startY;
        this.width = 8;
        this.height = 40;
        this.speed = 8;
        this.type = 'lightning';
        this.hp = 1;
    }

    update() {
        this.y += this.speed;
    }

    draw() {
        // Lightning bolt
        ctx.strokeStyle = '#FFFF00';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - 5, this.y + 10);
        ctx.lineTo(this.x + 5, this.y + 20);
        ctx.lineTo(this.x - 3, this.y + 30);
        ctx.lineTo(this.x + 3, this.y + 40);
        ctx.stroke();
        
        // Glow effect
        ctx.shadowColor = '#FFFF00';
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    isOffScreen() {
        return this.y > canvas.height + 50;
    }
}

// Chapter 2 Enemies - Ocean Theme
class Shark {
    constructor(lane) {
        this.lane = lane;
        const lanePositions = [canvas.width * 0.25, canvas.width * 0.5, canvas.width * 0.75];
        this.x = lanePositions[lane];
        this.y = -50;
        this.width = 45;
        this.height = 25;
        this.speed = 4;
        this.type = 'shark';
        this.hp = 3;
        this.swimMotion = 0;
        this.chargeUp = false;
    }

    update() {
        this.swimMotion += 0.3;
        
        // Charge attack when close to player
        if (this.y > canvas.height - 200 && !this.chargeUp) {
            this.speed = 8;
            this.chargeUp = true;
        }
        
        this.y += this.speed;
    }

    draw() {
        const sway = Math.sin(this.swimMotion) * 3;
        
        // Shark body
        ctx.fillStyle = this.chargeUp ? '#FF4444' : '#708090';
        ctx.fillRect(this.x - 20 + sway, this.y - 8, 40, 16);
        
        // Fins
        ctx.fillStyle = '#556B2F';
        ctx.fillRect(this.x - 25 + sway, this.y - 12, 10, 8);
        ctx.fillRect(this.x + 15 + sway, this.y - 12, 10, 8);
        ctx.fillRect(this.x + 20 + sway, this.y - 5, 8, 10);
        
        // Eyes
        ctx.fillStyle = this.chargeUp ? '#FF0000' : '#000';
        ctx.fillRect(this.x - 15 + sway, this.y - 6, 3, 3);
        
        // Teeth
        ctx.fillStyle = '#FFF';
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(this.x - 15 + i * 4 + sway, this.y + 2, 2, 4);
        }
    }

    isOffScreen() {
        return this.y > canvas.height + 50;
    }
}

class Jellyfish {
    constructor(lane) {
        this.lane = lane;
        const lanePositions = [canvas.width * 0.25, canvas.width * 0.5, canvas.width * 0.75];
        this.x = lanePositions[lane];
        this.y = -40;
        this.width = 35;
        this.height = 30;
        this.speed = 1.5;
        this.type = 'jellyfish';
        this.hp = 2;
        this.pulse = 0;
        this.electricField = false;
    }

    update() {
        this.y += this.speed;
        this.pulse += 0.2;
        
        // Create electric field randomly
        if (Math.random() < 0.005) {
            this.electricField = true;
            setTimeout(() => this.electricField = false, 2000);
        }
    }

    draw() {
        const pulsing = Math.sin(this.pulse) * 3;
        
        // Jellyfish body
        ctx.fillStyle = this.electricField ? '#00FFFF' : '#FF69B4';
        ctx.beginPath();
        ctx.arc(this.x, this.y - 10 + pulsing, 15, 0, Math.PI);
        ctx.fill();
        
        // Tentacles
        ctx.strokeStyle = this.electricField ? '#FFFF00' : '#FF1493';
        ctx.lineWidth = 2;
        for (let i = 0; i < 6; i++) {
            const tentacleX = this.x - 12 + i * 5;
            ctx.beginPath();
            ctx.moveTo(tentacleX, this.y);
            ctx.lineTo(tentacleX + Math.sin(this.pulse + i) * 3, this.y + 20);
            ctx.stroke();
        }
        
        // Electric field effect
        if (this.electricField) {
            ctx.strokeStyle = '#FFFF00';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 30, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    isOffScreen() {
        return this.y > canvas.height + 50;
    }
}

class Seahorse {
    constructor(lane) {
        this.lane = lane;
        const lanePositions = [canvas.width * 0.25, canvas.width * 0.5, canvas.width * 0.75];
        this.x = lanePositions[lane];
        this.y = -45;
        this.width = 25;
        this.height = 35;
        this.speed = 2.5;
        this.type = 'seahorse';
        this.hp = 2;
        this.bubble = 0;
        this.direction = 1;
    }

    update() {
        this.y += this.speed;
        this.bubble += 0.1;
        
        // Zigzag movement
        this.x += this.direction * 2;
        if (this.x < canvas.width * 0.1 || this.x > canvas.width * 0.9) {
            this.direction *= -1;
        }
        
        // Create bubbles
        if (Math.random() < 0.1) {
            this.createBubble();
        }
    }

    createBubble() {
        enemies.push(new Bubble(this.x, this.y - 10));
    }

    draw() {
        // Seahorse body
        ctx.fillStyle = '#FFA500';
        ctx.fillRect(this.x - 8, this.y - 15, 16, 30);
        
        // Head
        ctx.fillStyle = '#FF8C00';
        ctx.fillRect(this.x - 6, this.y - 20, 12, 10);
        
        // Tail curl
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x + 8, this.y + 10, 8, 0, Math.PI * 1.5);
        ctx.stroke();
        
        // Eye
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x - 2, this.y - 18, 2, 2);
    }

    isOffScreen() {
        return this.y > canvas.height + 50;
    }
}

class Bubble {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 12;
        this.height = 12;
        this.speed = 3;
        this.type = 'bubble';
        this.hp = 1;
        this.float = 0;
    }

    update() {
        this.y += this.speed;
        this.float += 0.3;
        this.x += Math.sin(this.float) * 0.5;
    }

    draw() {
        // Bubble
        ctx.strokeStyle = '#87CEEB';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);
        ctx.stroke();
        
        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(this.x - 2, this.y - 2, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    isOffScreen() {
        return this.y > canvas.height + 50;
    }
}

// Chapter 3 Enemies - Space Theme
class Asteroid {
    constructor(lane) {
        this.lane = lane;
        const lanePositions = [canvas.width * 0.25, canvas.width * 0.5, canvas.width * 0.75];
        this.x = lanePositions[lane];
        this.y = -60;
        this.width = 50;
        this.height = 50;
        this.speed = 2;
        this.type = 'asteroid';
        this.hp = 4;
        this.rotation = 0;
        this.size = Math.random() * 0.5 + 0.8;
    }

    update() {
        this.y += this.speed;
        this.rotation += 0.1;
        
        // Break into smaller pieces when hit
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.size, this.size);
        
        // Asteroid body
        ctx.fillStyle = '#696969';
        ctx.fillRect(-25, -25, 50, 50);
        ctx.fillRect(-20, -30, 40, 10);
        ctx.fillRect(-30, -20, 10, 40);
        
        // Craters
        ctx.fillStyle = '#2F4F4F';
        ctx.fillRect(-15, -15, 8, 8);
        ctx.fillRect(5, -10, 6, 6);
        ctx.fillRect(-10, 10, 10, 10);
        
        ctx.restore();
    }

    isOffScreen() {
        return this.y > canvas.height + 100;
    }
}

class UFO {
    constructor(lane) {
        this.lane = lane;
        const lanePositions = [canvas.width * 0.25, canvas.width * 0.5, canvas.width * 0.75];
        this.x = lanePositions[lane];
        this.y = -40;
        this.width = 40;
        this.height = 20;
        this.speed = 3;
        this.type = 'ufo';
        this.hp = 3;
        this.beam = false;
        this.hover = 0;
    }

    update() {
        this.y += this.speed;
        this.hover += 0.2;
        
        // Activate tractor beam randomly
        if (Math.random() < 0.01) {
            this.beam = true;
            setTimeout(() => this.beam = false, 3000);
        }
    }

    draw() {
        const hoverOffset = Math.sin(this.hover) * 2;
        
        // UFO body
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(this.x - 20, this.y - 5 + hoverOffset, 40, 10);
        
        // UFO dome
        ctx.fillStyle = '#87CEEB';
        ctx.beginPath();
        ctx.arc(this.x, this.y - 5 + hoverOffset, 15, 0, Math.PI);
        ctx.fill();
        
        // Lights
        ctx.fillStyle = this.beam ? '#FFFF00' : '#00FF00';
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(this.x - 15 + i * 8, this.y + 3 + hoverOffset, 3, 3);
        }
        
        // Tractor beam
        if (this.beam) {
            ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
            ctx.fillRect(this.x - 10, this.y + 10, 20, 100);
        }
    }

    isOffScreen() {
        return this.y > canvas.height + 50;
    }
}

class Satellite {
    constructor(lane) {
        this.lane = lane;
        const lanePositions = [canvas.width * 0.25, canvas.width * 0.5, canvas.width * 0.75];
        this.x = lanePositions[lane];
        this.y = -35;
        this.width = 30;
        this.height = 25;
        this.speed = 2.5;
        this.type = 'satellite';
        this.hp = 2;
        this.signal = 0;
        this.jamming = false;
    }

    update() {
        this.y += this.speed;
        this.signal += 0.15;
        
        // Signal jamming attack
        if (Math.random() < 0.008) {
            this.jamming = true;
            setTimeout(() => this.jamming = false, 2000);
        }
    }

    draw() {
        // Satellite body
        ctx.fillStyle = '#708090';
        ctx.fillRect(this.x - 10, this.y - 8, 20, 16);
        
        // Solar panels
        ctx.fillStyle = '#000080';
        ctx.fillRect(this.x - 25, this.y - 12, 12, 24);
        ctx.fillRect(this.x + 13, this.y - 12, 12, 24);
        
        // Antenna
        ctx.strokeStyle = '#C0C0C0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - 8);
        ctx.lineTo(this.x, this.y - 20);
        ctx.stroke();
        
        // Signal waves
        if (this.jamming) {
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 1;
            for (let i = 1; i <= 3; i++) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, i * 15, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
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

// ESC Menu functions
let escMenuOpen = false;

function openEscMenu() {
    if (gameState === 'quiz' || isSelectingPowerup) return; // Don't open during quiz/powerup selection
    
    escMenuOpen = true;
    document.getElementById('escMenu').style.display = 'flex';
    
    // Update history in menu
    updateHistoryInMenu();
    
    // Pause game if playing
    if (gameState === 'playing') {
        gameState = 'paused';
    }
}

function closeEscMenu() {
    escMenuOpen = false;
    document.getElementById('escMenu').style.display = 'none';
    
    // Resume game if it was playing
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

// Game initialization
function initGame() {
    airplane = new Airplane();
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
    updateHistoryDisplay();
}

function updatePowerupsDisplay() {
    const powerupContainer = document.getElementById('powerupContainer');
    const noPowerups = document.getElementById('noPowerups');
    
    if (!powerupContainer) return;
    
    // Clear current display
    powerupContainer.innerHTML = '';
    
    if (activePowerups.length === 0) {
        const noPowerupsDiv = document.createElement('div');
        noPowerupsDiv.id = 'noPowerups';
        noPowerupsDiv.style.cssText = 'color: #999; font-style: italic; text-align: center;';
        noPowerupsDiv.textContent = 'Chưa có powerup nào';
        powerupContainer.appendChild(noPowerupsDiv);
        return;
    }
    
    // Group powerups by type for display
    const groupedPowerups = {};
    activePowerups.forEach(powerup => {
        if (!groupedPowerups[powerup.group]) {
            groupedPowerups[powerup.group] = [];
        }
        groupedPowerups[powerup.group].push(powerup);
    });
    
    // Display powerups grouped by type
    Object.entries(groupedPowerups).forEach(([group, powerups]) => {
        // Group header
        const groupHeader = document.createElement('div');
        groupHeader.style.cssText = 'color: #FFD700; font-weight: bold; font-size: 12px; margin: 8px 0 4px 0; text-transform: uppercase;';
        groupHeader.textContent = `${group.toUpperCase()} (${powerups.length})`;
        powerupContainer.appendChild(groupHeader);
        
        // Individual powerups
        powerups.forEach(powerup => {
            const powerupDiv = document.createElement('div');
            powerupDiv.className = 'powerup-item';
            
            powerupDiv.innerHTML = `
                <div class="powerup-name">${powerup.name}</div>
                <div class="powerup-desc">${powerup.desc}</div>
            `;
            
            powerupContainer.appendChild(powerupDiv);
        });
    });
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
    
    // Update powerups display
    updatePowerupsDisplay();
    
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
                closeQuiz();
                currentQuestionIndex++;
                questionsAnswered++;
                
                // Show powerup selection instead of random buff
                setTimeout(() => showPowerupSelection(), 500);
                
                // Only trigger boss fight if we're not already in one and haven't completed chapter
                if (questionsAnswered >= 5 && !isBossFight && gameState === 'playing') {
                    setTimeout(() => startBossFight(), 2000);
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

function showPowerupSelection() {
    isSelectingPowerup = true;
    gameState = 'powerupSelection';
    
    // Get 3 random powerups that player doesn't have
    const availablePowerups = POWERUPS.filter(p => !activePowerups.find(ap => ap.id === p.id));
    powerupChoices = [];
    
    for (let i = 0; i < 3 && i < availablePowerups.length; i++) {
        const randomIndex = Math.floor(Math.random() * availablePowerups.length);
        powerupChoices.push(availablePowerups[randomIndex]);
        availablePowerups.splice(randomIndex, 1);
    }
    
    // Show powerup selection modal
    showPowerupModal();
}

function showPowerupModal() {
    const modal = document.createElement('div');
    modal.id = 'powerupModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: linear-gradient(135deg, #2c3e50, #34495e);
        border-radius: 15px;
        padding: 30px;
        text-align: center;
        box-shadow: 0 0 30px rgba(0,0,0,0.8);
        max-width: 800px;
    `;
    
    content.innerHTML = `
        <h2 style="color: #FFD700; margin-bottom: 20px;">⚡ CHỌN POWERUP ⚡</h2>
        <p style="color: white; margin-bottom: 30px;">Chọn 1 trong 3 powerup để nâng cấp máy bay!</p>
        <div id="powerupChoices" style="display: flex; gap: 20px; justify-content: center;"></div>
    `;
    
    const choicesContainer = content.querySelector('#powerupChoices');
    powerupChoices.forEach((powerup, index) => {
        const powerupDiv = document.createElement('div');
        powerupDiv.style.cssText = `
            background: linear-gradient(135deg, #3498db, #2980b9);
            border: 2px solid #FFD700;
            border-radius: 10px;
            padding: 20px;
            cursor: pointer;
            width: 200px;
            transition: transform 0.3s;
        `;
        
        powerupDiv.innerHTML = `
            <h3 style="color: #FFD700; margin: 0 0 10px 0;">${powerup.name}</h3>
            <p style="color: white; font-size: 14px; margin: 0 0 10px 0;">${powerup.desc}</p>
            <p style="color: #95a5a6; font-size: 12px; margin: 0;">Nhóm: ${powerup.group.toUpperCase()}</p>
        `;
        
        powerupDiv.onmouseover = () => powerupDiv.style.transform = 'scale(1.05)';
        powerupDiv.onmouseout = () => powerupDiv.style.transform = 'scale(1)';
        powerupDiv.onclick = () => selectPowerup(index);
        
        choicesContainer.appendChild(powerupDiv);
    });
    
    modal.appendChild(content);
    document.body.appendChild(modal);
}

function selectPowerup(choiceIndex) {
    const selectedPowerup = powerupChoices[choiceIndex];
    activePowerups.push(selectedPowerup);
    
    // Apply powerup effect
    applyPowerupEffect(selectedPowerup);
    
    // Check for group combos
    checkGroupCombos();
    
    // Remove modal
    const modal = document.getElementById('powerupModal');
    if (modal) modal.remove();
    
    isSelectingPowerup = false;
    gameState = 'playing';
    
    // Update powerups display
    updatePowerupsDisplay();
    
    showMessage(`Nhận được: ${selectedPowerup.name}!`, '#FFD700');
}

function applyPowerupEffect(powerup) {
    switch(powerup.effect) {
        case 'rapidFire':
            canShoot = true;
            // Implement rapid fire logic
            break;
        case 'energyShield':
            hasShield = true;
            break;
        case 'timeBonus':
            gameTime = Math.max(0, gameTime - 20);
            break;
        // Add more effects as needed
        default:
            canShoot = true; // Default effect for now
    }
}

function checkGroupCombos() {
    const groupCounts = {};
    activePowerups.forEach(p => {
        groupCounts[p.group] = (groupCounts[p.group] || 0) + 1;
    });
    
    Object.entries(groupCounts).forEach(([group, count]) => {
        if (count === 2 && GROUP_COMBOS[group][2]) {
            showSetUnlockPopup(`🔥 SET COMBO: ${GROUP_COMBOS[group][2].name}!`, GROUP_COMBOS[group][2].desc);
        } else if (count === 4 && GROUP_COMBOS[group][4]) {
            showSetUnlockPopup(`💥 ULTIMATE SET: ${GROUP_COMBOS[group][4].name}!`, GROUP_COMBOS[group][4].desc);
        }
    });
}

function showSetUnlockPopup(title, description) {
    gameState = 'paused';
    
    const modal = document.createElement('div');
    modal.id = 'setUnlockModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 3000;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: linear-gradient(135deg, #FFD700, #FFA500);
        border: 3px solid #FF6B6B;
        border-radius: 20px;
        padding: 40px;
        text-align: center;
        box-shadow: 0 0 50px rgba(255, 107, 107, 0.8);
        max-width: 500px;
        animation: setGlow 2s infinite;
    `;
    
    content.innerHTML = `
        <h1 style="color: #8B0000; margin: 0 0 20px 0; font-size: 28px;">${title}</h1>
        <p style="color: #2F4F4F; font-size: 18px; margin: 0 0 30px 0;">${description}</p>
        <p style="color: #696969; font-size: 14px; margin: 0;">Nhấn SPACE để tiếp tục</p>
    `;
    
    // Add glow animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes setGlow {
            0%, 100% { box-shadow: 0 0 50px rgba(255, 107, 107, 0.8); }
            50% { box-shadow: 0 0 80px rgba(255, 215, 0, 1); }
        }
    `;
    document.head.appendChild(style);
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Handle space key to continue
    const handleSpaceKey = (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            modal.remove();
            style.remove();
            gameState = 'playing';
            document.removeEventListener('keydown', handleSpaceKey);
        }
    };
    
    document.addEventListener('keydown', handleSpaceKey);
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
    lastQuestionSpawn = 0; // Reset question spawn timer để spawn ngay lập tức
    lastBatSpawn = Date.now(); // Reset bat spawn timer
    updateUI();
    
    showPause('👹 Boss Xuất Hiện!', `${boss.name} đã xuất hiện! Thu thập dấu ? để trả lời câu hỏi boss và gây sát thương!`, () => {
        gameState = 'playing';
        // Spawn một câu hỏi ngay lập tức khi boss fight bắt đầu
        setTimeout(() => {
            if (isBossFight && questionsAnswered < 5) {
                const lane = Math.floor(Math.random() * 3);
                questionMarks.push(new QuestionMark(lane));
                lastQuestionSpawn = Date.now();
            }
        }, 1000); // Spawn sau 1 giây
    });
}

// Collision detection
function checkCollisions() {
    const airplaneRect = {
        x: airplane.x - airplane.width/2,
        y: airplane.y - airplane.height/2,
        width: airplane.width,
        height: airplane.height
    };
    
    // Check airplane vs enemies
    enemies.forEach((enemy, enemyIndex) => {
        const enemyRect = {
            x: enemy.x - enemy.width/2,
            y: enemy.y - enemy.height/2,
            width: enemy.width,
            height: enemy.height
        };
        
        if (isColliding(airplaneRect, enemyRect)) {
            enemies.splice(enemyIndex, 1);
            takeDamage();
        }
    });
    
    // Check airplane vs question marks
    questionMarks.forEach((qm, qmIndex) => {
        const qmRect = {
            x: qm.x - qm.width/2,
            y: qm.y - qm.height/2,
            width: qm.width,
            height: qm.height
        };
        
        if (isColliding(airplaneRect, qmRect)) {
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
            // Save failure to history
            saveGameHistory(currentChapter, false, Math.floor(gameTime));
            
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

// Game history functions
function saveGameHistory(chapter, success, time) {
    const entry = {
        chapter: chapter,
        success: success,
        time: time,
        timestamp: new Date().toLocaleString()
    };
    
    gameHistory.push(entry);
    
    // Keep only last 20 entries
    if (gameHistory.length > 20) {
        gameHistory = gameHistory.slice(-20);
    }
    
    localStorage.setItem('tankGameHistory', JSON.stringify(gameHistory));
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    const historyContainer = document.getElementById('historyList');
    if (!historyContainer) return;
    
    historyContainer.innerHTML = '';
    
    gameHistory.slice(-10).reverse().forEach(entry => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const icon = entry.success ? '🎉' : '💀';
        const minutes = Math.floor(entry.time / 60);
        const seconds = entry.time % 60;
        const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        historyItem.innerHTML = `
            <span class="history-icon">${icon}</span>
            <span class="history-text">Chương ${entry.chapter} - ${timeStr}</span>
        `;
        
        historyContainer.appendChild(historyItem);
    });
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
    
    // Save success to history
    saveGameHistory(currentChapter, true, chapterTime);
    
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
        // Game completed - show victory trophy
        const totalTime = Math.floor(gameTime);
        showVictoryScreen(totalTime);
    }
}

function showVictoryScreen(totalTime) {
    gameState = 'gameOver';
    
    // Create victory modal
    const victoryModal = document.createElement('div');
    victoryModal.id = 'victoryModal';
    victoryModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    const victoryContent = document.createElement('div');
    victoryContent.style.cssText = `
        background: linear-gradient(135deg, #ffd700, #ffed4e);
        border-radius: 20px;
        padding: 40px;
        text-align: center;
        box-shadow: 0 0 50px rgba(255, 215, 0, 0.8);
        animation: victoryPulse 2s infinite;
    `;
    
    victoryContent.innerHTML = `
        <div style="font-size: 80px; margin-bottom: 20px;">🏆</div>
        <h1 style="color: #8b4513; font-size: 36px; margin: 20px 0;">CHÚC MỪNG!</h1>
        <p style="color: #654321; font-size: 24px; margin: 10px 0;">Bạn đã hoàn thành tất cả 3 chương!</p>
        <p style="color: #654321; font-size: 18px; margin: 10px 0;">Tổng thời gian: ${Math.floor(totalTime/60)}:${(totalTime%60).toString().padStart(2, '0')}</p>
        <button onclick="location.reload()" style="
            background: linear-gradient(135deg, #ff6b6b, #ee5a52);
            color: white;
            border: none;
            padding: 15px 30px;
            font-size: 18px;
            border-radius: 10px;
            cursor: pointer;
            margin-top: 20px;
            box-shadow: 0 4px 15px rgba(238, 90, 82, 0.4);
        ">Chơi lại từ đầu</button>
    `;
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes victoryPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
    `;
    document.head.appendChild(style);
    
    victoryModal.appendChild(victoryContent);
    document.body.appendChild(victoryModal);
}

// Spawn enemies and question marks
let lastBatSpawn = 0;
let lastQuestionSpawn = 0;

function spawnObjects() {
    if (gameState !== 'playing') return;
    
    const now = Date.now();
    
    // Faster and more exciting spawning with different enemies per chapter
    const enemySpawnInterval = isBossFight ? 1200 : 1800; // Much faster intervals
    if (now - lastBatSpawn > enemySpawnInterval) {
        const lane = Math.floor(Math.random() * 3);
        spawnRandomEnemy(lane);
        lastBatSpawn = now;
    }
    
    // Faster question spawning for better gameplay
    const questionSpawnInterval = isBossFight ? 2000 : 3000; // Much faster intervals
    const maxQuestions = 5;
    
    // Always spawn questions if we haven't reached the limit
    if (questionsAnswered < maxQuestions && now - lastQuestionSpawn > questionSpawnInterval) {
        const lane = Math.floor(Math.random() * 3);
        questionMarks.push(new QuestionMark(lane));
        lastQuestionSpawn = now;
    }
}

function spawnRandomEnemy(lane) {
    let enemyPool = [];
    
    switch(currentChapter) {
        case 1: // Sky Chapter
            enemyPool = [
                () => new Bat(lane),
                () => new Eagle(lane),
                () => new StormCloud(lane)
            ];
            break;
            
        case 2: // Ocean Chapter  
            enemyPool = [
                () => new Shark(lane),
                () => new Jellyfish(lane),
                () => new Seahorse(lane),
                () => new Bat(lane) // Keep some bats for variety
            ];
            break;
            
        case 3: // Space Chapter
            enemyPool = [
                () => new Asteroid(lane),
                () => new UFO(lane),
                () => new Satellite(lane),
                () => new Bat(lane) // Keep some bats for variety
            ];
            break;
    }
    
    // Select random enemy from pool
    const randomEnemyConstructor = enemyPool[Math.floor(Math.random() * enemyPool.length)];
    enemies.push(randomEnemyConstructor());
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
        airplane.update();
        
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

function drawChapterBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    
    switch(currentChapter) {
        case 1: // Sky theme
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(0.5, '#98D8E8');
            gradient.addColorStop(1, '#B0E0E6');
            break;
            
        case 2: // Ocean theme
            gradient.addColorStop(0, '#4682B4');
            gradient.addColorStop(0.5, '#5F9EA0');
            gradient.addColorStop(1, '#008B8B');
            break;
            
        case 3: // Space theme
            gradient.addColorStop(0, '#191970');
            gradient.addColorStop(0.5, '#483D8B');
            gradient.addColorStop(1, '#2F4F4F');
            break;
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawBackgroundParticles() {
    backgroundParticles.forEach(particle => {
        let particleColor = 'rgba(255, 255, 255, ';
        
        // Different particle effects per chapter
        switch(currentChapter) {
            case 1: // Sky - clouds
                particleColor = 'rgba(255, 255, 255, ';
                break;
            case 2: // Ocean - bubbles  
                particleColor = 'rgba(173, 216, 230, ';
                break;
            case 3: // Space - stars
                particleColor = 'rgba(255, 255, 0, ';
                break;
        }
        
        ctx.fillStyle = particleColor + `${particle.opacity * 0.7})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw chapter-specific background
    drawChapterBackground();
    
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
    airplane.draw();
    
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
            if (airplane.lane > 0) {
                airplane.moveTo(airplane.lane - 1);
            }
            break;
        case 'ArrowRight':
        case 'KeyD':
            if (airplane.lane < 2) {
                airplane.moveTo(airplane.lane + 1);
            }
            break;
        case 'Space':
            e.preventDefault();
            airplane.shoot();
            break;
    }
});

// Start game
document.getElementById('startButton').addEventListener('click', () => {
    document.getElementById('startScreen').style.display = 'none';
    gameState = 'playing';
    initGame();
    requestAnimationFrame(gameLoop);
}

// FIXED: Add ESC key handler for menu
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (escMenuOpen) {
            closeEscMenu();
        } else {
            openEscMenu();
        }
    }
});

// Initialize
initGame();