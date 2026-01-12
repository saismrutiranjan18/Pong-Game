const canvas = document.getElementById('pong');
const context = canvas.getContext('2d');

// Game state
let isPaused = false;
let gameStarted = false;

// Create paddles
const user = {
    x: 0,
    y: canvas.height / 2 - 100 / 2,
    width: 10,
    height: 100,
    color: 'WHITE',
    score: 0
};

const com = {
    x: canvas.width - 10,
    y: canvas.height / 2 - 100 / 2,
    width: 10,
    height: 100,
    color: 'WHITE',
    score: 0
};

// Create ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    speed: 5,
    velocityX: 5,
    velocityY: 5,
    color: 'WHITE'
};

// Create net
const net = {
    x: canvas.width / 2 - 2 / 2,
    y: 0,
    width: 2,
    height: 10,
    color: 'WHITE'
};

// Draw rectangle
function drawRect(x, y, w, h, color) {
    context.fillStyle = color;
    context.fillRect(x, y, w, h);
}

// Draw circle
function drawCircle(x, y, r, color) {
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, r, 0, Math.PI * 2, false);
    context.closePath();
    context.fill();
}

// Draw text
function drawText(text, x, y, color) {
    context.fillStyle = color;
    context.font = '45px fantasy';
    context.fillText(text, x, y);
}

// Draw net
function drawNet() {
    for (let i = 0; i <= canvas.height; i += 15) {
        drawRect(net.x, net.y + i, net.width, net.height, net.color);
    }
}

// Draw pause overlay
function drawPauseScreen() {
    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.fillStyle = 'WHITE';
    context.font = '60px fantasy';
    context.textAlign = 'center';
    context.fillText('PAUSED', canvas.width / 2, canvas.height / 2 - 20);
    
    context.font = '25px fantasy';
    context.fillText('Press SPACE to resume', canvas.width / 2, canvas.height / 2 + 30);
    context.textAlign = 'left';
}

// Render game
function render() {
    // Clear canvas
    drawRect(0, 0, canvas.width, canvas.height, 'BLACK');
    
    // Draw net
    drawNet();
    
    // Draw score
    drawText(user.score, canvas.width / 4, canvas.height / 5, 'WHITE');
    drawText(com.score, 3 * canvas.width / 4, canvas.height / 5, 'WHITE');
    
    // Draw paddles
    drawRect(user.x, user.y, user.width, user.height, user.color);
    drawRect(com.x, com.y, com.width, com.height, com.color);
    
    // Draw ball
    drawCircle(ball.x, ball.y, ball.radius, ball.color);
    
    // Draw pause screen if paused
    if (isPaused) {
        drawPauseScreen();
    }
}

// Control user paddle
canvas.addEventListener('mousemove', movePaddle);

function movePaddle(evt) {
    if (!isPaused) {
        let rect = canvas.getBoundingClientRect();
        user.y = evt.clientY - rect.top - user.height / 2;
    }
}

// Keyboard controls for pause
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (gameStarted) {
            togglePause();
        }
    }
});

// Toggle pause function
function togglePause() {
    isPaused = !isPaused;
    const pauseBtn = document.getElementById('pauseBtn');
    if (pauseBtn) {
        pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
    }
}

// Pause button handler
function pauseGame() {
    if (gameStarted) {
        togglePause();
    }
}

// Collision detection
function collision(b, p) {
    b.top = b.y - b.radius;
    b.bottom = b.y + b.radius;
    b.left = b.x - b.radius;
    b.right = b.x + b.radius;
    
    p.top = p.y;
    p.bottom = p.y + p.height;
    p.left = p.x;
    p.right = p.x + p.width;
    
    return b.right > p.left && b.bottom > p.top && b.left < p.right && b.top < p.bottom;
}

// Reset ball
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = 5;
    ball.velocityX = -ball.velocityX;
}

// Update game
function update() {
    if (isPaused) {
        return;
    }
    
    gameStarted = true;
    
    // Move ball
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    
    // Simple AI for computer
    com.y += (ball.y - (com.y + com.height / 2)) * 0.1;
    
    // Ball collision with top and bottom walls
    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.velocityY = -ball.velocityY;
    }
    
    // Check which paddle is being hit
    let player = (ball.x < canvas.width / 2) ? user : com;
    
    // Check collision with paddles
    if (collision(ball, player)) {
        // Calculate where ball hit the paddle
        let collidePoint = ball.y - (player.y + player.height / 2);
        collidePoint = collidePoint / (player.height / 2);
        
        // Calculate angle in radians
        let angleRad = collidePoint * Math.PI / 4;
        
        // Direction of ball when hit
        let direction = (ball.x < canvas.width / 2) ? 1 : -1;
        
        // Change velocity
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);
        
        // Increase speed
        ball.speed += 0.1;
    }
    
    // Update score
    if (ball.x - ball.radius < 0) {
        com.score++;
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        user.score++;
        resetBall();
    }
}

// Game loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Start game
gameLoop();
