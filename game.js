// Helicopter Quiz Runner Game
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
let helicopter;
let enemies = [];
let bullets = [];
let questionMarks = [];
let boss = null;

// Quiz data from file
const quizData = {
    1: [ // Chapter 1: Tư tưởng Hồ Chí Minh về văn hóa
        {
            question: "Hồ Chí Minh định nghĩa văn hóa là:",
            options: ["A. Văn học nghệ thuật", "B. Toàn bộ sáng tạo của loài người", "C. Chỉ tôn giáo, đạo đức", "D. Pháp luật và chính trị"],
            correct: 1
        },
        {
            question: "Quan hệ của văn hóa với kinh tế là:",
            options: ["A. Văn hóa quyết định kinh tế", "B. Kinh tế quyết định văn hóa", "C. Kinh tế là nền tảng vật chất cho văn hóa", "D. Không liên quan"],
            correct: 2
        },
        {
            question: "Phát biểu “Văn hóa phải soi đường cho quốc dân đi” của Hồ Chí Minh nhằm nhấn mạnh:",
            options: ["A. Văn hóa là công cụ chính trị", "B. Văn hóa định hướng sự phát triển xã hội", "C. Văn hóa chỉ là sản phẩm tinh thần", "D. Văn hóa phục vụ nghệ sĩ"],
            correct: 1
        },
        {
            question: "Phương châm xây dựng văn hóa trong kháng chiến chống Pháp là:",
            options: ["A. Dân chủ – công bằng – văn minh", "B. Tiên tiến – hội nhập – hiện đại", "C. Dân tộc – khoa học – đại chúng", "D. Độc lập – tự do – hạnh phúc"],
            correct: 2
        },
        {
            question: "Văn hóa phục vụ cho:",
            options: ["A. Nhà nước", "B. Giới trí thức", "C. Quần chúng nhân dân", "D. Đảng viên"],
            correct: 2
        }
    ],
    2: [ // Chapter 2: Văn hóa trong đời sống hiện đại Việt Nam
        {
            question: "Hồ Chí Minh coi giáo dục là:",
            options: ["A. Công cụ tuyên truyền", "B. Quốc sách hàng đầu", "C. Hoạt động phụ trợ", "D. Quyền lợi riêng của trí thức"],
            correct: 1
        },
        {
            question: "Bộ Quy tắc ứng xử trên mạng xã hội được ban hành năm:",
            options: ["A. 2015", "B. 2018", "C. 2021", "D. 2023"],
            correct: 2
        },
        {
            question: "Phương châm xây dựng văn hóa hiện nay:",
            options: ["A. Tiên tiến – đậm đà bản sắc dân tộc", "B. Toàn cầu – hội nhập – tự do", "C. Hiện đại – dân tộc – văn minh", "D. Công bằng – dân chủ – văn minh"],
            correct: 0
        },
        {
            question: "Ngành kinh tế gắn trực tiếp với văn hóa là:",
            options: ["A. Du lịch", "B. Xây dựng", "C. Tài chính", "D. Nông nghiệp"],
            correct: 0
        },
        {
            question: "Một phong trào văn hóa xã hội tiêu biểu hiện nay là:",
            options: ["A. Toàn dân đoàn kết xây dựng đời sống văn hóa", "B. Công nghiệp hóa – hiện đại hóa", "C. Đổi mới sáng tạo", "D. Ứng dụng công nghệ số"],
            correct: 0
        }
    ],
    3: [ // Chapter 3: Xây dựng con người Việt Nam hiện đại theo tư tưởng Hồ Chí Minh
        {
            question: "Hồ Chí Minh coi “đức” là:",
            options: ["A. Gốc của con người", "B. Quan trọng ngang tài", "C. Không cần thiết", "D. Thứ yếu hơn tài"],
            correct: 0
        },
        {
            question: "Người nói: “Muốn xây dựng CNXH, trước hết cần có…”",
            options: ["A. Công nghiệp hiện đại", "B. Con người XHCN", "C. Khoa học kỹ thuật", "D. Đảng lãnh đạo"],
            correct: 1
        },
        {
            question: "Một giá trị truyền thống mà Hồ Chí Minh coi trọng:",
            options: ["A. Chủ nghĩa cá nhân", "B. Lòng yêu nước", "C. Chủ nghĩa tiêu dùng", "D. Văn hóa ngoại lai"],
            correct: 1
        },
        {
            question: "Đại hội XIII xác định nhiệm vụ xây dựng:",
            options: ["A. Kinh tế thị trường", "B. Hệ giá trị văn hóa và chuẩn mực con người Việt Nam", "C. Hệ thống hạ tầng số", "D. Nông nghiệp bền vững"],
            correct: 1
        },
        {
            question: "Một phẩm chất của con người XHCN:",
            options: ["A. Cần, kiệm, liêm, chính", "B. Giàu có vật chất", "C. Biết hưởng thụ", "D. Cá nhân chủ nghĩa"],
            correct: 0
        }
    ]
};

// Boss questions (advanced questions for each chapter)
const bossQuizData = {
    1: [ // Advanced Chapter 1
        {
            question: "Tại sao Hồ Chí Minh khẳng định “chính trị giải phóng thì văn hóa mới được giải phóng”?",
            options: ["A. Văn hóa phụ thuộc tuyệt đối vào chính trị", "B. Văn hóa chỉ tồn tại khi có dân chủ", "C. Độc lập chính trị là điều kiện cho văn hóa phát triển tự do", "D. Chính trị là hình thức cao nhất của văn hóa"],
            correct: 2
        },
        {
            question: "Hồ Chí Minh coi văn hóa là “mặt trận” vì:",
            options: ["A. Văn hóa giống như chiến trường quân sự", "B. Văn hóa là công cụ tuyên truyền", "C. Văn hóa đấu tranh chống nô dịch tinh thần", "D. Văn hóa phục vụ chiến tranh"],
            correct: 2
        },
        {
            question: "Nội dung “đức – trí – thể – mỹ” thuộc lĩnh vực nào?",
            options: ["A. Xây dựng con người toàn diện", "B. Chính trị", "C. Kinh tế", "D. Khoa học – công nghệ"],
            correct: 0
        },
        {
            question: "Nền văn hóa mới Việt Nam phải có đặc trưng:",
            options: ["A. Hiện đại – dân tộc – nhân văn", "B. Dân tộc – khoa học – đại chúng", "C. Tiên tiến – hội nhập – bản sắc", "D. Toàn cầu – đa dạng – mở rộng"],
            correct: 1
        },
        {
            question: "Ý nghĩa thời sự của tư tưởng Hồ Chí Minh về văn hóa trong hội nhập là:",
            options: ["A. Không còn phù hợp", "B. Chỉ còn giá trị lịch sử", "C. Vẫn định hướng xây dựng nền văn hóa tiên tiến, đậm đà bản sắc dân tộc", "D. Chỉ có giá trị lý luận"],
            correct: 2
        }
    ],
    2: [ // Advanced Chapter 2
        {
            question: "Thách thức lớn nhất của giáo dục Việt Nam hiện nay là:",
            options: ["A. Thiếu trường lớp", "B. Bệnh thành tích, chất lượng chưa đồng đều", "C. Không hội nhập quốc tế", "D. Thiếu giáo viên"],
            correct: 1
        },
        {
            question: "Mặt tiêu cực của mạng xã hội:",
            options: ["A. Kết nối cộng đồng", "B. Quảng bá du lịch", "C. Tin giả, bạo lực mạng, lệch chuẩn", "D. Nâng cao dân trí"],
            correct: 2
        },
        {
            question: "Hội nhập văn hóa quốc tế có nghĩa là:",
            options: ["A. Từ bỏ truyền thống", "B. Giữ bản sắc, tiếp thu tinh hoa nhân loại", "C. Đóng cửa với thế giới", "D. Hòa tan hoàn toàn"],
            correct: 1
        },
        {
            question: "Vai trò văn hóa trong kinh tế hiện đại:",
            options: ["A. Trang trí xã hội", "B. Động lực nội sinh, công nghiệp sáng tạo", "C. Thứ yếu, không quan trọng", "D. Công cụ tuyên truyền"],
            correct: 1
        },
        {
            question: "Văn hóa góp phần ổn định chính trị – xã hội bằng cách:",
            options: ["A. Tăng trưởng kinh tế", "B. Định hình lối sống, củng cố đồng thuận xã hội", "C. Làm giàu cho văn nghệ sĩ", "D. Xây dựng pháp luật"],
            correct: 1
        }
    ],
    3: [ // Advanced Chapter 3
        {
            question: "Vì sao Hồ Chí Minh nhấn mạnh đức là gốc nhưng phải có tài?",
            options: ["A. Xã hội cần bằng cấp", "B. Đức quan trọng hơn tài", "C. Con người chỉ hoàn thiện khi có cả đức và tài", "D. Chỉ cần tài là đủ"],
            correct: 2
        },
        {
            question: "Yêu nước trong thời kỳ hội nhập là:",
            options: ["A. Chống giặc ngoại xâm", "B. Học tập, sáng tạo, xây dựng đất nước giàu mạnh", "C. Xuất khẩu lao động", "D. Đi học nước ngoài"],
            correct: 1
        },
        {
            question: "Giữ bản sắc dân tộc trong toàn cầu hóa bằng cách:",
            options: ["A. Đóng cửa với văn hóa ngoại lai", "B. Tiếp thu tinh hoa có chọn lọc, giữ truyền thống", "C. Từ bỏ cái cũ", "D. Hòa tan toàn bộ"],
            correct: 1
        },
        {
            question: "Hệ giá trị con người Việt Nam hiện đại gồm:",
            options: ["A. Yêu nước, nhân ái, trung thực, sáng tạo, trách nhiệm", "B. Giàu có, thành đạt, quyền lực", "C. Hưởng thụ, cá nhân, vật chất", "D. Hội nhập, giàu có, vui chơi"],
            correct: 0
        },
        {
            question: "Giải pháp theo tư tưởng Hồ Chí Minh để khắc phục suy thoái đạo đức hiện nay là:",
            options: ["A. Hạn chế hội nhập", "B. Giáo dục đạo đức, nêu gương, phát huy truyền thống", "C. Tự do vô hạn", "D. Tăng hình phạt nặng"],
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
class Helicopter {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height - 80;
        this.width = 50;
        this.height = 40;
        this.lane = 1; // 0, 1, 2 (left, center, right)
        this.targetX = this.x;
        this.speed = 8;
        this.rotorFrame = 0;
        this.hoverFrame = 0;
        this.isMoving = false;
    }

    update() {
        // Smooth movement to target lane
        this.isMoving = Math.abs(this.x - this.targetX) > 2;
        if (this.isMoving) {
            this.x += (this.targetX - this.x) * 0.2;
        } else {
            this.x = this.targetX;
        }
        
        // Always animate rotor and hover
        this.rotorFrame += 0.8; // Fast rotor animation
        this.hoverFrame += 0.1; // Slow hover animation
    }

    draw() {
        const hoverOffset = Math.sin(this.hoverFrame) * 2; // Gentle hover effect
        
        // Draw helicopter body
        const bodyGradient = ctx.createLinearGradient(this.x - 25, this.y - 10, this.x + 25, this.y + 10);
        bodyGradient.addColorStop(0, '#4A90E2');
        bodyGradient.addColorStop(0.5, '#357ABD');
        bodyGradient.addColorStop(1, '#2E5984');
        ctx.fillStyle = bodyGradient;
        ctx.fillRect(this.x - 25, this.y - 10 + hoverOffset, 50, 20);
        
        // Draw cockpit
        const cockpitGradient = ctx.createLinearGradient(this.x - 20, this.y - 20, this.x + 20, this.y - 5);
        cockpitGradient.addColorStop(0, '#87CEEB');
        cockpitGradient.addColorStop(0.5, '#6BB6FF');
        cockpitGradient.addColorStop(1, '#4A90E2');
        ctx.fillStyle = cockpitGradient;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y - 15 + hoverOffset, 20, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw cockpit window reflection
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.ellipse(this.x - 5, this.y - 18 + hoverOffset, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw tail boom
        ctx.fillStyle = '#357ABD';
        ctx.fillRect(this.x + 20, this.y - 3 + hoverOffset, 25, 6);
        
        // Draw tail fin
        ctx.fillStyle = '#2E5984';
        ctx.beginPath();
        ctx.moveTo(this.x + 40, this.y - 8 + hoverOffset);
        ctx.lineTo(this.x + 50, this.y - 12 + hoverOffset);
        ctx.lineTo(this.x + 50, this.y + 2 + hoverOffset);
        ctx.lineTo(this.x + 45, this.y + 3 + hoverOffset);
        ctx.fill();
        
        // Draw main rotor (spinning effect)
        const rotorBlur = Math.sin(this.rotorFrame) * 0.3;
        ctx.strokeStyle = `rgba(200, 200, 200, ${0.7 + rotorBlur})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y - 25 + hoverOffset, 35, 3, this.rotorFrame * 0.1, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw rotor hub
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(this.x, this.y - 25 + hoverOffset, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw tail rotor
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(this.x + 47, this.y - 5 + hoverOffset, 2, 8, this.rotorFrame * 0.15, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw landing skids
        ctx.fillStyle = '#666';
        ctx.fillRect(this.x - 20, this.y + 8 + hoverOffset, 40, 3);
        ctx.fillRect(this.x - 15, this.y + 11 + hoverOffset, 8, 2);
        ctx.fillRect(this.x + 7, this.y + 11 + hoverOffset, 8, 2);
        
        // Draw shield if active
        if (hasShield) {
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#00ff00';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(this.x, this.y + hoverOffset, this.width/2 + 15, 0, Math.PI * 2);
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
    helicopter = new Helicopter();
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
    const helicopterRect = {
        x: helicopter.x - helicopter.width/2,
        y: helicopter.y - helicopter.height/2,
        width: helicopter.width,
        height: helicopter.height
    };
    
    // Check helicopter vs enemies
    enemies.forEach((enemy, enemyIndex) => {
        const enemyRect = {
            x: enemy.x - enemy.width/2,
            y: enemy.y - enemy.height/2,
            width: enemy.width,
            height: enemy.height
        };
        
        if (isColliding(helicopterRect, enemyRect)) {
            enemies.splice(enemyIndex, 1);
            takeDamage();
        }
    });
    
    // Check helicopter vs question marks
    questionMarks.forEach((qm, qmIndex) => {
        const qmRect = {
            x: qm.x - qm.width/2,
            y: qm.y - qm.height/2,
            width: qm.width,
            height: qm.height
        };
        
        if (isColliding(helicopterRect, qmRect)) {
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
    
    // Simple and reliable bat spawning
    const batSpawnInterval = isBossFight ? 1800 : 2500; // Consistent intervals
    if (now - lastBatSpawn > batSpawnInterval) {
        const lane = Math.floor(Math.random() * 3);
        enemies.push(new Bat(lane));
        lastBatSpawn = now;
    }
    
    // Simple and reliable question spawning
    const questionSpawnInterval = isBossFight ? 3000 : 5000; // Regular intervals
    const maxQuestions = 5;
    
    // Always spawn questions if we haven't reached the limit
    if (questionsAnswered < maxQuestions && now - lastQuestionSpawn > questionSpawnInterval) {
        const lane = Math.floor(Math.random() * 3);
        questionMarks.push(new QuestionMark(lane));
        lastQuestionSpawn = now;
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
        helicopter.update();
        
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
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity * 0.7})`;
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
    helicopter.draw();
    
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
            if (helicopter.lane > 0) {
                helicopter.moveTo(helicopter.lane - 1);
            }
            break;
        case 'ArrowRight':
        case 'KeyD':
            if (helicopter.lane < 2) {
                helicopter.moveTo(helicopter.lane + 1);
            }
            break;
        case 'ControlLeft':
        case 'ControlRight':
            e.preventDefault();
            helicopter.shoot();
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