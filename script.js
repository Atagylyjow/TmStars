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
    lastLoginDate: null,
    totalAdsWatched: 0 // Added for total watched ads
};

// Level system configuration (total watched ads based)
const LEVELS = [
    { min: 0, max: 49, multiplier: 1.0 },      // 1. Seviye
    { min: 50, max: 99, multiplier: 1.1 },     // 2. Seviye
    { min: 100, max: 199, multiplier: 1.2 },   // 3. Seviye
    { min: 200, max: 349, multiplier: 1.3 },   // 4. Seviye
    { min: 350, max: 499, multiplier: 1.4 },   // 5. Seviye
    { min: 500, max: 699, multiplier: 1.5 },   // 6. Seviye
    { min: 700, max: 899, multiplier: 1.6 },   // 7. Seviye
    { min: 900, max: 1199, multiplier: 1.7 },  // 8. Seviye
    { min: 1200, max: 1499, multiplier: 1.8 }, // 9. Seviye
    { min: 1500, max: Infinity, multiplier: 2.0 } // 10. Seviye
];

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
    // Seviye modalı eventleri
    const levelInfoBtn = document.getElementById('level-info-btn');
    if (levelInfoBtn) {
        levelInfoBtn.addEventListener('click', openLevelModal);
    }
    document.getElementById('level-modal-close').addEventListener('click', closeLevelModal);
    window.addEventListener('click', function(event) {
        if (event.target === document.getElementById('level-modal')) {
            closeLevelModal();
        }
    });
    // Alt menüdeki profil sekmesi
    const profileNavBtn = document.getElementById('profile-nav-btn');
    if (profileNavBtn) {
        profileNavBtn.addEventListener('click', showProfileSection);
    }
    document.getElementById('profile-modal-close').addEventListener('click', closeProfileModal);
    window.addEventListener('click', function(event) {
        if (event.target === document.getElementById('profile-modal')) {
            closeProfileModal();
        }
    });
    addLevelInfoBtnListener(); // Sayfa yüklendiğinde ve profil section gösterildiğinde çağır
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
    const watchAdBtn = document.getElementById('watch-ad-btn');
    if (watchAdBtn) {
        // Önce eski event'i temizle
        watchAdBtn.replaceWith(watchAdBtn.cloneNode(true));
        const newWatchAdBtn = document.getElementById('watch-ad-btn');
        newWatchAdBtn.addEventListener('click', watchAd);
    }
    // Task buttons
    document.querySelectorAll('.task-btn').forEach(btn => {
        btn.replaceWith(btn.cloneNode(true));
    });
    document.querySelectorAll('.task-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const taskType = this.dataset.task;
            claimTaskReward(taskType);
        });
    });
    // Withdrawal buttons
    document.querySelectorAll('.withdrawal-btn').forEach(btn => {
        btn.replaceWith(btn.cloneNode(true));
    });
    document.querySelectorAll('.withdrawal-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const method = this.dataset.method;
            showWithdrawalModal(method);
        });
    });
    // Navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.replaceWith(btn.cloneNode(true));
    });
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const section = this.dataset.section;
            navigateToSection(section);
        });
    });
    // Leaderboard tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.replaceWith(btn.cloneNode(true));
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.dataset.tab;
            switchLeaderboardTab(tab);
        });
    });
    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(closeBtn => {
        closeBtn.replaceWith(closeBtn.cloneNode(true));
    });
    document.querySelectorAll('.modal-close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    // Withdrawal form
    const withdrawalConfirm = document.getElementById('withdrawal-confirm');
    if (withdrawalConfirm) {
        withdrawalConfirm.replaceWith(withdrawalConfirm.cloneNode(true));
        document.getElementById('withdrawal-confirm').addEventListener('click', confirmWithdrawal);
    }
    const withdrawalCancel = document.getElementById('withdrawal-cancel');
    if (withdrawalCancel) {
        withdrawalCancel.replaceWith(withdrawalCancel.cloneNode(true));
        document.getElementById('withdrawal-cancel').addEventListener('click', function() {
            document.getElementById('withdrawal-modal').style.display = 'none';
        });
    }
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.replaceWith(themeToggle.cloneNode(true));
        document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    }
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList && event.target.classList.contains('modal')) {
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
                    lastLoginDate: userData.lastLoginDate,
                    totalAdsWatched: userData.totalAdsWatched
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
    document.getElementById('user-level').textContent = userData.level + '. Seviye';
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
    let level = 1;
    let watched = userData.totalAdsWatched || 0;
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (watched >= LEVELS[i].min) {
            level = i + 1;
            break;
        }
    }
    userData.level = level;
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

    // Butonu devre dışı bırak ve yükleniyor göster
    watchAdBtn.disabled = true;
    watchAdBtn.innerHTML = '<i class="fas fa-clock"></i> Reklam Yükleniyor...';
    progressContainer.style.display = 'none';

    // Reklamı göster
    show_9499819().then(() => {
        // Reklam başarıyla izlendi, ödül ver
        if (!userData.totalAdsWatched) userData.totalAdsWatched = 0;
        userData.totalAdsWatched++;
        updateUserLevel();
        const multiplier = LEVELS[userData.level - 1].multiplier;
        const earned = 0.10 * multiplier;
        userData.stars += earned;
        userData.dailyAdsWatched++;
        userData.totalEarnings += earned;
        userData.tasks.watchAds.completed++;
        // Update level
        updateUserLevel();
        // Save data
        saveUserData();
        // Update UI
        updateUI();
        // Show success message
        showMessage(`+${earned.toFixed(2)} yıldız kazandınız!`, 'success');
        // Reset button
        watchAdBtn.disabled = false;
        watchAdBtn.innerHTML = '<i class="fas fa-play"></i> Reklam İzle';
        // Yıldız animasyonu
        const starDisplay = document.getElementById('user-stars');
        starDisplay.classList.add('star-earned');
        setTimeout(() => starDisplay.classList.remove('star-earned'), 500);
    }).catch(() => {
        // Reklam izlenmeden kapatıldı veya hata oluştu
        showMessage('Reklam izlenmeden kapatıldı.', 'error');
        watchAdBtn.disabled = false;
        watchAdBtn.innerHTML = '<i class="fas fa-play"></i> Reklam İzle';
    });
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

function openLevelModal() {
    // Kullanıcı bilgileri
    const watched = userData.totalAdsWatched || 0;
    const level = userData.level || 1;
    const multiplier = LEVELS[level-1].multiplier;
    document.getElementById('level-modal-user-info').innerHTML = `Mevcut seviyeniz: <b>${level}. Seviye</b> <br>Çarpan: <b>${multiplier.toFixed(2)}x</b> <br>Toplam izlenen reklam: <b>${watched}</b>`;
    // Tablo
    let table = '';
    for (let i = 0; i < LEVELS.length; i++) {
        const rowClass = (i+1) === level ? 'current-level' : '';
        table += `<tr class="${rowClass}"><td>${i+1}</td><td>${LEVELS[i].min} - ${LEVELS[i].max === Infinity ? '+' : LEVELS[i].max}</td><td>${LEVELS[i].multiplier.toFixed(2)}x</td></tr>`;
    }
    document.getElementById('level-table-body').innerHTML = table;
    // Sonraki seviyeye kalan reklam
    let nextInfo = '';
    if (level < LEVELS.length) {
        const kalan = LEVELS[level].min - watched;
        nextInfo = `Sonraki seviyeye geçmek için <b>${kalan}</b> reklam daha izlemelisin.`;
    } else {
        nextInfo = 'Maksimum seviyedesiniz!';
    }
    document.getElementById('level-modal-next-info').innerHTML = nextInfo;
    document.getElementById('level-modal').style.display = 'block';
}
function closeLevelModal() {
    document.getElementById('level-modal').style.display = 'none';
} 

// Profil modalı fonksiyonlarını kaldırıyorum. Profil sekmesine tıklanınca ana içerikteki profile-section'ı gösteriyorum.
async function showProfileSection() {
    // Tüm ana section'ları gizle
    document.querySelectorAll('.main-content > section').forEach(sec => sec.style.display = 'none');
    // Profil section'ı göster
    document.getElementById('profile-section').style.display = 'block';
    // Profil açıldığında kullanıcı verisini güncelle
    await loadUserData();
    const user = userData;
    let photoUrl = '';
    if (window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user && window.Telegram.WebApp.initDataUnsafe.user.photo_url) {
        photoUrl = window.Telegram.WebApp.initDataUnsafe.user.photo_url;
    }
    document.getElementById('profile-photo').src = photoUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.firstName || user.username || 'Kullanıcı');
    document.getElementById('profile-username').textContent = user.firstName || user.username || 'Unconnected';
    document.getElementById('profile-id').textContent = 'ID: ' + (user.userId || user.telegramId || '-');
    // Seviye ve çarpan
    let levelNum = user.level || 1;
    if (typeof levelNum === 'string' && !isNaN(parseInt(levelNum))) levelNum = parseInt(levelNum);
    document.getElementById('profile-level').textContent = (levelNum) + '. Seviye';
    document.getElementById('profile-multiplier').textContent = (LEVELS[levelNum-1]?.multiplier || 1).toFixed(2) + 'x';
    // İstatistikler
    document.getElementById('profile-total-ads').textContent = user.totalAdsWatched || 0;
    document.getElementById('profile-total-stars').textContent = user.stars ? user.stars.toFixed(2) : '0.00';
    let joinDate = user.joinDate || user.createdAt;
    document.getElementById('profile-join-date').textContent = joinDate ? new Date(joinDate).toLocaleDateString('tr-TR') : '-';
    // Davet linki ve istatistikler
    const refId = user.userId || user.telegramId || '-';
    const refLink = refId !== '-' ? `https://t.me/TmStarts_bot?start=ref_${refId}` : '-';
    document.getElementById('profile-ref-link').textContent = refLink;
    document.getElementById('copy-ref-link').onclick = function() {
        if (refLink && refLink !== '-') {
            navigator.clipboard.writeText(refLink);
            showMessage('Davet linki kopyalandı!', 'success');
        }
    };
    document.getElementById('profile-ref-count').textContent = user.refCount || 0;
    document.getElementById('profile-ref-stars').textContent = user.refStars ? user.refStars.toFixed(2) : '0.00';
    addLevelInfoBtnListener(); // Her profil gösteriminde tekrar ekle
    setupEventListeners(); // Profildeki butonlar için tekrar ekle
}
// Alt menüdeki profil sekmesine tıklanınca showProfileSection çağrılacak.
document.addEventListener('DOMContentLoaded', function() {
    const profileNavBtn = document.getElementById('profile-nav-btn');
    if (profileNavBtn) {
        profileNavBtn.addEventListener('click', showProfileSection);
    }
}); 

function addLevelInfoBtnListener() {
    // Birden fazla buton varsa hepsine ekle
    document.querySelectorAll('#level-info-btn').forEach(btn => {
        btn.onclick = openLevelModal;
    });
} 

async function showSection(sectionName) {
    // Tüm ana section'ları gizle
    document.querySelectorAll('.main-content > section').forEach(sec => sec.style.display = 'none');
    // İlgili section'ı göster
    const sec = document.getElementById(sectionName + '-section');
    if (sec) sec.style.display = 'block';
    // Her section geçişinde kullanıcı verisini güncelle
    await loadUserData();
    updateUI();
    setupEventListeners(); // Event listener'ları tekrar ekle
    addLevelInfoBtnListener(); // Seviye modalı butonları için tekrar ekle
    // Ekstra: Profil gösteriliyorsa profil bilgilerini doldur
    if (sectionName === 'profile') await showProfileSection();
}
// Alt menüdeki tüm sekmelere event ekle

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });
    // Sayfa ilk açıldığında ana sayfa section'ı göster
    showSection('home');
}); 