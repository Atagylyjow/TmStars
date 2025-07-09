// Telegram Web App initialization
let tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// App state
let userData = {
    stars: 0,
    dailyBonusClaimed: false,
    lastDailyBonus: null,
    completedTasks: [],
    withdrawalHistory: []
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadUserData();
    updateUI();
    loadLeaderboard();
});

// Initialize app
function initializeApp() {
    // Set theme colors
    tg.setHeaderColor('#667eea');
    tg.setBackgroundColor('#f8f9fa');
    
    // Get user info
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user;
        userData.userId = user.id;
        userData.username = user.username || `User${user.id}`;
        userData.firstName = user.first_name || 'User';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Daily bonus button
    document.getElementById('dailyBonusBtn').addEventListener('click', claimDailyBonus);
    
    // Watch ad button
    document.getElementById('watchAdBtn').addEventListener('click', watchAd);
    
    // Tasks button
    document.getElementById('tasksBtn').addEventListener('click', showTasks);
    
    // Invite button
    document.getElementById('inviteBtn').addEventListener('click', inviteFriends);
    
    // Withdrawal button
    document.getElementById('withdrawBtn').addEventListener('click', showWithdrawalModal);
    
    // Navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const section = this.dataset.section;
            navigateToSection(section);
        });
    });
    
    // Modal close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Confirm withdrawal button
    document.getElementById('confirmWithdrawalBtn').addEventListener('click', confirmWithdrawal);
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
}

// Load user data from localStorage
function loadUserData() {
    const saved = localStorage.getItem('tmstars_user_data');
    if (saved) {
        const savedData = JSON.parse(saved);
        userData = { ...userData, ...savedData };
    }
    
    // Check if daily bonus can be claimed
    checkDailyBonus();
}

// Save user data to localStorage
function saveUserData() {
    localStorage.setItem('tmstars_user_data', JSON.stringify(userData));
}

// Update UI with current data
function updateUI() {
    document.getElementById('totalStars').textContent = userData.stars;
    document.getElementById('availableStars').textContent = userData.stars;
    
    // Update daily bonus button
    const dailyBonusBtn = document.getElementById('dailyBonusBtn');
    if (userData.dailyBonusClaimed) {
        dailyBonusBtn.innerHTML = '<i class="fas fa-check"></i> Bugün Alındı';
        dailyBonusBtn.disabled = true;
        dailyBonusBtn.style.opacity = '0.6';
    } else {
        dailyBonusBtn.innerHTML = '<i class="fas fa-gift"></i> Günlük Bonus Al';
        dailyBonusBtn.disabled = false;
        dailyBonusBtn.style.opacity = '1';
    }
}

// Check daily bonus availability
function checkDailyBonus() {
    const now = new Date();
    const today = now.toDateString();
    
    if (userData.lastDailyBonus === today) {
        userData.dailyBonusClaimed = true;
    } else {
        userData.dailyBonusClaimed = false;
    }
}

// Claim daily bonus
function claimDailyBonus() {
    if (userData.dailyBonusClaimed) {
        showMessage('Bugün zaten günlük bonusunuzu aldınız!', 'error');
        return;
    }
    
    const bonus = 50; // Daily bonus amount
    userData.stars += bonus;
    userData.dailyBonusClaimed = true;
    userData.lastDailyBonus = new Date().toDateString();
    
    saveUserData();
    updateUI();
    
    showMessage(`🎉 Günlük bonus alındı! +${bonus} yıldız kazandınız!`, 'success');
    
    // Haptic feedback
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }
}

// Watch ad function
function watchAd() {
    const button = document.getElementById('watchAdBtn');
    const originalText = button.innerHTML;
    
    // Simulate ad watching
    button.innerHTML = '<div class="loading"></div> Reklam İzleniyor...';
    button.disabled = true;
    
    setTimeout(() => {
        const reward = 5;
        userData.stars += reward;
        saveUserData();
        updateUI();
        
        button.innerHTML = originalText;
        button.disabled = false;
        
        showMessage(`📺 Reklam izlendi! +${reward} yıldız kazandınız!`, 'success');
        
        // Haptic feedback
        if (tg.HapticFeedback) {
            tg.HapticFeedback.impactOccurred('light');
        }
    }, 3000);
}

// Show tasks modal
function showTasks() {
    const modal = document.getElementById('taskModal');
    const taskList = document.getElementById('taskList');
    
    // Generate daily tasks
    const tasks = generateDailyTasks();
    
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const taskItem = createTaskElement(task);
        taskList.appendChild(taskItem);
    });
    
    modal.style.display = 'block';
}

// Generate daily tasks
function generateDailyTasks() {
    const tasks = [
        {
            id: 'login',
            title: 'Giriş Yap',
            description: 'Uygulamaya giriş yap',
            reward: 10,
            completed: userData.completedTasks.includes('login')
        },
        {
            id: 'watch_3_ads',
            title: '3 Reklam İzle',
            description: '3 farklı reklam izle',
            reward: 15,
            completed: userData.completedTasks.includes('watch_3_ads')
        },
        {
            id: 'invite_friend',
            title: 'Arkadaş Davet Et',
            description: 'Bir arkadaşını davet et',
            reward: 25,
            completed: userData.completedTasks.includes('invite_friend')
        },
        {
            id: 'daily_bonus',
            title: 'Günlük Bonus Al',
            description: 'Günlük bonusunu al',
            reward: 20,
            completed: userData.dailyBonusClaimed
        }
    ];
    
    return tasks;
}

// Create task element
function createTaskElement(task) {
    const taskItem = document.createElement('div');
    taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
    
    taskItem.innerHTML = `
        <div class="task-checkbox" onclick="completeTask('${task.id}')">
            ${task.completed ? '<i class="fas fa-check"></i>' : ''}
        </div>
        <div class="task-content">
            <h4>${task.title}</h4>
            <p>${task.description}</p>
        </div>
        <div class="task-reward">
            <i class="fas fa-star"></i>
            ${task.reward}
        </div>
    `;
    
    return taskItem;
}

// Complete task
function completeTask(taskId) {
    const task = generateDailyTasks().find(t => t.id === taskId);
    
    if (!task || task.completed) {
        return;
    }
    
    // Mark task as completed
    if (!userData.completedTasks.includes(taskId)) {
        userData.completedTasks.push(taskId);
        userData.stars += task.reward;
        saveUserData();
        updateUI();
        
        showMessage(`✅ Görev tamamlandı! +${task.reward} yıldız kazandınız!`, 'success');
        
        // Refresh task list
        showTasks();
        
        // Haptic feedback
        if (tg.HapticFeedback) {
            tg.HapticFeedback.impactOccurred('medium');
        }
    }
}

// Invite friends
function inviteFriends() {
    const inviteText = `🌟 TmStars uygulamasını deneyin! Yıldız kazanın ve ödüllerinizi alın! 🎁\n\n${window.location.href}`;
    
    if (tg.showPopup) {
        tg.showPopup({
            title: 'Arkadaş Davet Et',
            message: 'Arkadaşlarınızı davet etmek için paylaşım yapın!',
            buttons: [
                {
                    type: 'share',
                    text: 'Paylaş'
                },
                {
                    type: 'cancel',
                    text: 'İptal'
                }
            ]
        });
    } else {
        // Fallback for web
        if (navigator.share) {
            navigator.share({
                title: 'TmStars - Yıldız Kazan',
                text: inviteText,
                url: window.location.href
            });
        } else {
            // Copy to clipboard
            navigator.clipboard.writeText(inviteText).then(() => {
                showMessage('Davet linki kopyalandı!', 'success');
            });
        }
    }
}

// Show withdrawal modal
function showWithdrawalModal() {
    const modal = document.getElementById('withdrawalModal');
    document.getElementById('modalWithdrawalAmount').value = '';
    document.getElementById('withdrawalNote').value = '';
    modal.style.display = 'block';
}

// Confirm withdrawal
function confirmWithdrawal() {
    const amount = parseInt(document.getElementById('modalWithdrawalAmount').value);
    const note = document.getElementById('withdrawalNote').value;
    
    if (!amount || amount < 100) {
        showMessage('Minimum çekim miktarı 100 yıldızdır!', 'error');
        return;
    }
    
    if (amount > userData.stars) {
        showMessage('Yeterli yıldızınız yok!', 'error');
        return;
    }
    
    // Create withdrawal request
    const withdrawal = {
        id: Date.now(),
        amount: amount,
        note: note,
        status: 'pending',
        date: new Date().toISOString()
    };
    
    userData.stars -= amount;
    userData.withdrawalHistory.push(withdrawal);
    
    saveUserData();
    updateUI();
    
    document.getElementById('withdrawalModal').style.display = 'none';
    
    showMessage(`✅ Çekim talebi oluşturuldu! ${amount} yıldız çekildi.`, 'success');
    
    // Haptic feedback
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }
}

// Navigate to section
function navigateToSection(section) {
    // Update navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    
    // Show/hide sections based on navigation
    // For now, we'll just scroll to the appropriate section
    const sections = {
        home: '.welcome-section',
        tasks: '.earning-methods',
        withdrawal: '.withdrawal-section',
        profile: '.leaderboard-section'
    };
    
    const targetSection = document.querySelector(sections[section]);
    if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Load leaderboard
function loadLeaderboard() {
    const leaderboardList = document.getElementById('leaderboardList');
    
    // Sample leaderboard data
    const leaderboard = [
        { rank: 1, name: 'Ahmet Yılmaz', stars: 1250, isCurrentUser: false },
        { rank: 2, name: 'Ayşe Demir', stars: 980, isCurrentUser: false },
        { rank: 3, name: 'Mehmet Kaya', stars: 750, isCurrentUser: false },
        { rank: 4, name: 'Fatma Özkan', stars: 620, isCurrentUser: false },
        { rank: 5, name: 'Ali Çelik', stars: 480, isCurrentUser: false }
    ];
    
    // Add current user if not in top 5
    if (userData.username) {
        const currentUserRank = leaderboard.findIndex(user => user.stars <= userData.stars) + 1;
        if (currentUserRank > 5) {
            leaderboard.push({
                rank: currentUserRank,
                name: userData.firstName,
                stars: userData.stars,
                isCurrentUser: true
            });
        }
    }
    
    leaderboardList.innerHTML = '';
    leaderboard.slice(0, 10).forEach(user => {
        const rankClass = user.rank === 1 ? 'gold' : user.rank === 2 ? 'silver' : user.rank === 3 ? 'bronze' : '';
        const userClass = user.isCurrentUser ? 'current-user' : '';
        
        const leaderboardItem = document.createElement('div');
        leaderboardItem.className = `leaderboard-item ${userClass}`;
        
        leaderboardItem.innerHTML = `
            <div class="leaderboard-rank ${rankClass}">${user.rank}</div>
            <div class="leaderboard-user">
                <h4>${user.name}</h4>
                <p>${user.isCurrentUser ? 'Sen' : 'Oyuncu'}</p>
            </div>
            <div class="leaderboard-stars">
                <i class="fas fa-star"></i>
                ${user.stars}
            </div>
        `;
        
        leaderboardList.appendChild(leaderboardItem);
    });
}

// Show message
function showMessage(message, type = 'success') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    
    // Insert at the top of main content
    const mainContent = document.querySelector('.main-content');
    mainContent.insertBefore(messageElement, mainContent.firstChild);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (messageElement.parentNode) {
            messageElement.remove();
        }
    }, 3000);
}

// Periodic updates
setInterval(() => {
    checkDailyBonus();
    updateUI();
}, 60000); // Check every minute

// Save data before page unload
window.addEventListener('beforeunload', () => {
    saveUserData();
});

// Export functions for global access
window.completeTask = completeTask; 