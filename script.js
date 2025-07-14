// StarEarn - Reklam İzleyerek Yıldız Kazanma App

// Telegram Web App initialization
let tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// App state
let userData = {
    stars: 0.00,
    level: 'Bronze',
    experience: 0,
    dailyAdsWatched: 0,
    lastAdDate: null,
    totalEarnings: 0.00,
    withdrawalHistory: [],
    tasks: {
        watchAds: { completed: 0, target: 10, reward: 0.50, claimed: false },
        inviteFriends: { completed: 0, target: 3, reward: 5.00, claimed: false },
        dailyLogin: { completed: 0, target: 7, reward: 5.00, claimed: false }
    },
    consecutiveLogins: 0,
    lastLoginDate: null
};

// Level system configuration
const LEVELS = {
    'Bronze': { min: 0, max: 100, multiplier: 1.0 },
    'Silver': { min: 101, max: 250, multiplier: 1.2 },
    'Gold': { min: 251, max: 500, multiplier: 1.5 },
    'Platinum': { min: 501, max: Infinity, multiplier: 2.0 }
};

// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';
// Production: const API_BASE_URL = 'https://your-domain.com/api';

// Initialize app
document.addEventListener('DOMContentLoaded', async function() {
    initializeApp();
    setupEventListeners();
    await loadUserData();
    updateUI();
    await loadLeaderboard();
});

// Initialize app
function initializeApp() {
    // Set theme colors
    tg.setHeaderColor('#FFD700');
    tg.setBackgroundColor('#f8f9fa');
    
    // Get user info
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user;
        userData.userId = user.id;
        userData.username = user.username || `User${user.id}`;
        userData.firstName = user.first_name || 'User';
        userData.lastName = user.last_name || '';
    }
    
    // Update user info display
    document.getElementById('user-name').textContent = userData.firstName;
    document.getElementById('user-id').textContent = `ID: ${userData.userId}`;
}

// Setup event listeners
function setupEventListeners() {
    // Watch ad button
    document.getElementById('watch-ad-btn').addEventListener('click', watchAd);
    
    // Task buttons
    document.querySelectorAll('.task-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const taskType = this.dataset.task;
            claimTaskReward(taskType);
        });
    });
    
    // Withdrawal buttons
    document.querySelectorAll('.withdrawal-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const method = this.dataset.method;
            showWithdrawalModal(method);
        });
    });
    
    // Navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const section = this.dataset.section;
            navigateToSection(section);
        });
    });
    
    // Leaderboard tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.dataset.tab;
            switchLeaderboardTab(tab);
        });
    });
    
    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Withdrawal form
    document.getElementById('withdrawal-confirm').addEventListener('click', confirmWithdrawal);
    document.getElementById('withdrawal-cancel').addEventListener('click', function() {
        document.getElementById('withdrawal-modal').style.display = 'none';
    });
    
    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
}

// Load user data from MongoDB API
async function loadUserData() {
    try {
        if (userData.userId) {
            const response = await fetch(`${API_BASE_URL}/users/profile/${userData.userId}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    userData = { ...userData, ...data.user };
                }
            }
        }
    } catch (error) {
        console.error('Failed to load user data:', error);
        // Fallback to localStorage if API fails
        const saved = localStorage.getItem('starearn_user_data');
        if (saved) {
            const savedData = JSON.parse(saved);
            userData = { ...userData, ...savedData };
        }
    }
    
    // Check daily reset
    checkDailyReset();
    // Check consecutive login
    checkConsecutiveLogin();
    // Update level
    updateUserLevel();
}

// Save user data to MongoDB API
async function saveUserData() {
    try {
        if (userData.userId) {
            const response = await fetch(`${API_BASE_URL}/users/profile/${userData.userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    telegramId: userData.userId,
                    stars: userData.stars,
                    level: userData.level,
                    experience: userData.experience,
                    dailyAdsWatched: userData.dailyAdsWatched,
                    lastAdDate: userData.lastAdDate,
                    totalEarnings: userData.totalEarnings,
                    tasks: userData.tasks,
                    consecutiveLogins: userData.consecutiveLogins,
                    lastLoginDate: userData.lastLoginDate
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to save user data');
            }
        }
    } catch (error) {
        console.error('Failed to save user data:', error);
        // Fallback to localStorage
        localStorage.setItem('starearn_user_data', JSON.stringify(userData));
    }
}

// Update UI with current data
function updateUI() {
    document.getElementById('user-stars').textContent = userData.stars.toFixed(2);
    document.getElementById('user-level').textContent = userData.level;
    document.getElementById('ads-watched-today').textContent = userData.dailyAdsWatched;
    document.getElementById('ads-limit').textContent = '50';
    
    // Update task progress
    updateTaskProgress();
    
    // Update withdrawal modal
    document.getElementById('current-stars').textContent = userData.stars.toFixed(2);
    
    // Update watch ad button
    const watchAdBtn = document.getElementById('watch-ad-btn');
    if (userData.dailyAdsWatched >= 50) {
        watchAdBtn.disabled = true;
        watchAdBtn.innerHTML = '<i class="fas fa-clock"></i> Günlük Limit Doldu';
    } else {
        watchAdBtn.disabled = false;
        watchAdBtn.innerHTML = '<i class="fas fa-play"></i> Reklam İzle';
    }
}

// Check daily reset
function checkDailyReset() {
    const now = new Date();
    const today = now.toDateString();
    
    if (userData.lastAdDate !== today) {
        userData.dailyAdsWatched = 0;
        userData.lastAdDate = today;
        
        // Reset task progress
        userData.tasks.watchAds.completed = 0;
        userData.tasks.watchAds.claimed = false;
        userData.tasks.inviteFriends.claimed = false;
    }
}

// Check consecutive login
function checkConsecutiveLogin() {
    const now = new Date();
    const today = now.toDateString();
    
    if (userData.lastLoginDate !== today) {
        if (userData.lastLoginDate) {
            const lastLogin = new Date(userData.lastLoginDate);
            const daysDiff = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === 1) {
                userData.consecutiveLogins++;
                userData.tasks.dailyLogin.completed = Math.min(userData.consecutiveLogins, 7);
            } else if (daysDiff > 1) {
                userData.consecutiveLogins = 1;
                userData.tasks.dailyLogin.completed = 1;
            }
        } else {
            userData.consecutiveLogins = 1;
            userData.tasks.dailyLogin.completed = 1;
        }
        
        userData.lastLoginDate = today;
    }
}

// Update user level based on stars
function updateUserLevel() {
    const stars = userData.stars;
    
    if (stars >= 501) {
        userData.level = 'Platinum';
    } else if (stars >= 251) {
        userData.level = 'Gold';
    } else if (stars >= 101) {
        userData.level = 'Silver';
    } else {
        userData.level = 'Bronze';
    }
}

// Watch ad function
async function watchAd() {
    if (userData.dailyAdsWatched >= 50) {
        showMessage('Günlük reklam limitiniz doldu!', 'error');
        return;
    }
    
    const watchAdBtn = document.getElementById('watch-ad-btn');
    const progressContainer = document.getElementById('progress-container');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    // Disable button and show progress
    watchAdBtn.disabled = true;
    watchAdBtn.innerHTML = '<i class="fas fa-clock"></i> Reklam İzleniyor...';
    progressContainer.style.display = 'block';
    
    // Simulate ad watching (15 seconds)
    const adDuration = 15000; // 15 seconds
    const updateInterval = 100; // Update every 100ms
    const totalUpdates = adDuration / updateInterval;
    let currentUpdate = 0;
    
    const progressInterval = setInterval(() => {
        currentUpdate++;
        const progress = (currentUpdate / totalUpdates) * 100;
        
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${Math.round(progress)}%`;
        
        if (currentUpdate >= totalUpdates) {
            clearInterval(progressInterval);
            
            // Ad completed
            const baseReward = 0.10;
            const levelMultiplier = LEVELS[userData.level].multiplier;
            const reward = baseReward * levelMultiplier;
            
            userData.stars += reward;
            userData.dailyAdsWatched++;
            userData.totalEarnings += reward;
            userData.tasks.watchAds.completed++;
            
            // Update level
            updateUserLevel();
            
            // Save data
            saveUserData();
            
            // Update UI
            updateUI();
            
            // Show success message
            showMessage(`+${reward.toFixed(2)} yıldız kazandınız!`, 'success');
            
            // Reset button and hide progress
            watchAdBtn.disabled = false;
            watchAdBtn.innerHTML = '<i class="fas fa-play"></i> Reklam İzle';
            progressContainer.style.display = 'none';
            progressFill.style.width = '0%';
            progressText.textContent = '0%';
            
            // Add star earned animation
            const starDisplay = document.getElementById('user-stars');
            starDisplay.classList.add('star-earned');
            setTimeout(() => starDisplay.classList.remove('star-earned'), 500);
        }
    }, updateInterval);
}

// Update task progress
function updateTaskProgress() {
    // Watch ads task
    const watchProgress = (userData.tasks.watchAds.completed / userData.tasks.watchAds.target) * 100;
    document.getElementById('task-watch-progress').style.width = `${watchProgress}%`;
    document.getElementById('task-watch-text').textContent = `${userData.tasks.watchAds.completed}/${userData.tasks.watchAds.target}`;
    
    // Invite friends task
    const inviteProgress = (userData.tasks.inviteFriends.completed / userData.tasks.inviteFriends.target) * 100;
    document.getElementById('task-invite-progress').style.width = `${inviteProgress}%`;
    document.getElementById('task-invite-text').textContent = `${userData.tasks.inviteFriends.completed}/${userData.tasks.inviteFriends.target}`;
    
    // Daily login task
    const loginProgress = (userData.tasks.dailyLogin.completed / userData.tasks.dailyLogin.target) * 100;
    document.getElementById('task-login-progress').style.width = `${loginProgress}%`;
    document.getElementById('task-login-text').textContent = `${userData.tasks.dailyLogin.completed}/${userData.tasks.dailyLogin.target}`;
    
    // Update task buttons
    updateTaskButtons();
}

// Update task buttons
function updateTaskButtons() {
    const tasks = ['watch-ads', 'invite-friends', 'daily-login'];
    
    tasks.forEach(taskType => {
        const task = userData.tasks[taskType.replace('-', '')];
        const btn = document.querySelector(`[data-task="${taskType}"]`);
        
        if (task.completed >= task.target && !task.claimed) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-gift"></i> Ödülü Al';
            btn.classList.remove('btn-secondary');
            btn.classList.add('btn-primary');
        } else if (task.claimed) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-check"></i> Tamamlandı';
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-secondary');
        } else {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-lock"></i> Kilitli';
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-secondary');
        }
    });
}

// Claim task reward
async function claimTaskReward(taskType) {
    const taskKey = taskType.replace('-', '');
    const task = userData.tasks[taskKey];
    
    if (task.completed >= task.target && !task.claimed) {
        userData.stars += task.reward;
        task.claimed = true;
        
        // Update level
        updateUserLevel();
        
        // Save data
        await saveUserData();
        
        // Update UI
        updateUI();
        
        // Show success message
        showMessage(`+${task.reward.toFixed(2)} yıldız kazandınız!`, 'success');
        
        // Add star earned animation
        const starDisplay = document.getElementById('user-stars');
        starDisplay.classList.add('star-earned');
        setTimeout(() => starDisplay.classList.remove('star-earned'), 500);
    }
}

// Show withdrawal modal
function showWithdrawalModal(method) {
    const modal = document.getElementById('withdrawal-modal');
    const phoneGroup = document.getElementById('phone-group');
    
    if (method === 'phone') {
        phoneGroup.style.display = 'block';
    } else {
        phoneGroup.style.display = 'none';
    }
    
    modal.style.display = 'block';
}

// Confirm withdrawal
async function confirmWithdrawal() {
    const amount = parseFloat(document.getElementById('withdrawal-amount').value);
    const method = document.querySelector('.withdrawal-btn.active')?.dataset.method || 'telegram';
    const phoneNumber = document.getElementById('phone-number').value;
    
    if (!amount || amount < 20) {
        showMessage('Minimum çekim miktarı 20 yıldızdır!', 'error');
        return;
    }
    
    if (amount > userData.stars) {
        showMessage('Yeterli yıldızınız yok!', 'error');
        return;
    }
    
    if (method === 'phone' && !phoneNumber) {
        showMessage('Telefon numarası gerekli!', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/users/withdraw`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                telegramId: userData.userId,
                amount: amount,
                method: method,
                phoneNumber: phoneNumber
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                userData.stars -= amount;
                userData.withdrawalHistory.push({
                    amount: amount,
                    method: method,
                    date: new Date(),
                    status: 'pending'
                });
                
                await saveUserData();
                updateUI();
                
                document.getElementById('withdrawal-modal').style.display = 'none';
                showSuccessMessage('Çekim talebiniz alındı! En kısa sürede işleme alınacaktır.');
            } else {
                showMessage(data.message || 'Çekim işlemi başarısız!', 'error');
            }
        } else {
            showMessage('Çekim işlemi başarısız!', 'error');
        }
    } catch (error) {
        console.error('Withdrawal error:', error);
        showMessage('Çekim işlemi başarısız!', 'error');
    }
}

// Navigate to section
function navigateToSection(section) {
    // Remove active class from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to clicked button
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    
    // Show/hide sections based on navigation
    const sections = ['welcome-section', 'watch-ad-section', 'tasks-section', 'withdrawal-section', 'leaderboard-section'];
    
    sections.forEach(sec => {
        const element = document.querySelector(`.${sec}`);
        if (element) {
            if (section === 'home' && (sec === 'welcome-section' || sec === 'watch-ad-section')) {
                element.style.display = 'block';
            } else if (section === 'tasks' && sec === 'tasks-section') {
                element.style.display = 'block';
            } else if (section === 'withdrawal' && sec === 'withdrawal-section') {
                element.style.display = 'block';
            } else if (section === 'profile') {
                // Show profile section (implement later)
                element.style.display = 'none';
            } else {
                element.style.display = 'none';
            }
        }
    });
}

// Switch leaderboard tab
function switchLeaderboardTab(tab) {
    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to clicked tab
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    
    // Load leaderboard data for selected tab
    loadLeaderboard(tab);
}

// Load leaderboard
async function loadLeaderboard(period = 'daily') {
    try {
        const response = await fetch(`${API_BASE_URL}/leaderboard/${period}`);
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                displayLeaderboard(data.leaderboard);
            }
        }
    } catch (error) {
        console.error('Failed to load leaderboard:', error);
        // Show placeholder data
        displayLeaderboard([]);
    }
}

// Display leaderboard
function displayLeaderboard(leaderboard) {
    const leaderboardList = document.getElementById('leaderboard-list');
    
    if (leaderboard.length === 0) {
        leaderboardList.innerHTML = '<p class="text-center">Henüz veri yok</p>';
        return;
    }
    
    leaderboardList.innerHTML = leaderboard.map((user, index) => `
        <div class="leaderboard-item">
            <div class="rank">${index + 1}</div>
            <div class="user-info">
                <div class="username">${user.username}</div>
                <div class="stars">${user.stars.toFixed(2)} yıldız</div>
            </div>
        </div>
    `).join('');
}

// Toggle theme
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('starearn_theme', newTheme);
    updateThemeToggleIcon(newTheme);
}

function updateThemeToggleIcon(theme) {
    const themeToggle = document.getElementById('theme-toggle');
    if (theme === 'dark') {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

// Show message
function showMessage(message, type = 'success') {
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type}`;
    messageEl.textContent = message;
    
    // Add styles
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    
    if (type === 'success') {
        messageEl.style.background = '#28a745';
    } else if (type === 'error') {
        messageEl.style.background = '#dc3545';
    } else {
        messageEl.style.background = '#17a2b8';
    }
    
    // Add to page
    document.body.appendChild(messageEl);
    
    // Remove after 3 seconds
    setTimeout(() => {
        messageEl.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 300);
    }, 3000);
}

// Show success modal
function showSuccessMessage(message) {
    document.getElementById('success-message').textContent = message;
    document.getElementById('success-modal').style.display = 'block';
    
    setTimeout(() => {
        document.getElementById('success-modal').style.display = 'none';
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .leaderboard-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        border-bottom: 1px solid var(--border-color);
    }
    
    .rank {
        background: var(--gradient-primary);
        color: var(--secondary-blue);
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 0.9rem;
    }
    
    .user-info {
        flex: 1;
    }
    
    .username {
        font-weight: bold;
        color: var(--text-primary);
    }
    
    .stars {
        font-size: 0.9rem;
        color: var(--text-secondary);
    }
`;
document.head.appendChild(style);

// Load theme on startup
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('starearn_theme');
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
        updateThemeToggleIcon(savedTheme);
    } else {
        updateThemeToggleIcon('light');
    }
}); 