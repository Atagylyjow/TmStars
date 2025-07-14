require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const TelegramBot = require('node-telegram-bot-api');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const os = require('os');

// Debug ve loglama sistemi
const DEBUG_MODE = process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development';
const LOG_FILE = 'app.log';

// --- MongoDB Bağlantısı ---
const dbUrl = process.env.DATABASE_URL || 'mongodb+srv://starearn_user:mongodb@cluster0.76mty5j.mongodb.net/starearn?retryWrites=true&w=majority&appName=Cluster0';
let db;

async function connectToDb() {
    try {
        const client = new MongoClient(dbUrl);
        await client.connect();
        db = client.db();
        log('info', 'MongoDB veritabanına başarıyla bağlanıldı.');

        // Veritabanı koleksiyonlarının var olduğundan emin ol
        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);

        if (!collectionNames.includes('users')) {
            await db.createCollection('users');
            log('info', '`users` koleksiyonu oluşturuldu.');
        }
        if (!collectionNames.includes('withdrawals')) {
            await db.createCollection('withdrawals');
            log('info', '`withdrawals` koleksiyonu oluşturuldu.');
        }
        if (!collectionNames.includes('stats')) {
            await db.createCollection('stats');
            // Başlangıç istatistiklerini ekle
            const stats = await db.collection('stats').findOne();
            if (!stats) {
                await db.collection('stats').insertOne({
                    totalUsers: 0,
                    totalStarsEarned: 0,
                    totalWithdrawals: 0,
                    totalAdsWatched: 0,
                    lastUpdated: new Date()
                });
                log('info', 'Başlangıç istatistikleri oluşturuldu.');
            }
        }
        if (!collectionNames.includes('admins')) {
            await db.createCollection('admins');
            const admin = await db.collection('admins').findOne({ chatId: 7749779502 });
            if (!admin) {
                await db.collection('admins').insertOne({ chatId: 7749779502, addedAt: new Date() });
                log('info', 'Varsayılan yönetici eklendi.');
            }
        }
    } catch (error) {
        log('error', 'MongoDB bağlantı hatası', { error: error.message });
        process.exit(1); // Hata durumunda uygulamayı sonlandır
    }
}
// ----------------------------

// Multer configuration for file uploads
const upload = multer({
    dest: 'uploads/',
    limits: {
        fileSize: 1024 * 1024 // 1MB limit
    }
});

// Loglama fonksiyonu
function log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        level,
        message,
        data
    };
    
    const logString = `[${timestamp}] ${level.toUpperCase()}: ${message}${data ? ` | Data: ${JSON.stringify(data)}` : ''}`;
    
    // Console'a yazdır
    if (DEBUG_MODE || level === 'error') {
        console.log(logString);
    }
    
    // Dosyaya yazdır
    try {
        fs.appendFileSync(LOG_FILE, logString + '\n');
    } catch (error) {
        console.error('Log dosyasına yazma hatası:', error);
    }
}

// Debug fonksiyonu
function debug(message, data = null) {
    if (DEBUG_MODE) {
        log('debug', message, data);
    }
}

// Error handling middleware
function errorHandler(err, req, res, next) {
    log('error', 'Express error handler', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip
    });
    
    res.status(500).json({
        success: false,
        error: DEBUG_MODE ? err.message : 'Internal server error'
    });
}

const app = express();
const PORT = process.env.PORT || 3000;

// Botu tekrar aktif hale getir
const token = '7383203177:AAHCZfjN__b9UgUmnBYUTpYZywmKKRwUDi0';
const bot = new TelegramBot(token, { polling: true });

bot.on('polling_error', (error) => {
    log('error', 'Bot polling error', { error: error.message });
});

// Web App URL (güncel URL'nizi buraya yazın)
const WEB_APP_URL = 'https://tmstars.onrender.com/';

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const opts = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '⭐ StarEarn\'a Git', web_app: { url: WEB_APP_URL } }
                ],
                [
                    { text: '🆔 ID Öğren', callback_data: 'get_id' }
                ]
            ]
        }
    };
    bot.sendMessage(chatId, 'Hoş geldin! 👋\n\nStarEarn uygulamasına hoş geldiniz! Reklam izleyerek yıldız kazanabilirsiniz.', opts);
});

bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    if (query.data === 'get_id') {
        bot.answerCallbackQuery(query.id, { text: `ID: ${chatId}` });
        bot.sendMessage(chatId, `Telegram ID'niz: <code>${chatId}</code>`, { parse_mode: 'HTML' });
    }
});

// Middleware
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID']
}));
app.use(express.json());
app.use(express.static('.'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware
app.use((req, res, next) => {
    debug('Incoming request', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    next();
});

// Kullanıcı ID'lerini normalize et
function normalizeUserId(userId) {
    if (!userId) {
        return 'anonymous';
    }
    // String'e çevir ve temizle, başka bir işlem yapma
    return userId.toString().trim();
}

// Request'ten user ID'yi al
function getUserId(req) {
    // Headers'dan al (Öncelikli)
    if (req.headers && req.headers['x-user-id']) {
        return req.headers['x-user-id'].toString();
    }
    
    // Body'den al
    if (req.body && req.body.telegramId) {
        return req.body.telegramId.toString();
    }
    
    // Query params'dan al
    if (req.query && req.query.userId) {
        return req.query.userId.toString();
    }
    
    // URL params'dan al
    if (req.params && req.params.userId) {
        return req.params.userId.toString();
    }
    
    return null;
}

// Admin kontrolü
async function isAdmin(chatId) {
    try {
        const admin = await db.collection('admins').findOne({ chatId: parseInt(chatId) });
        return !!admin;
    } catch (error) {
        log('error', 'Admin kontrolü hatası', { error: error.message, chatId });
        return false;
    }
}

// Admin middleware (şimdilik devre dışı)
const adminAuth = (req, res, next) => { next(); } // Admin kontrolü devre dışı

// İstatistik güncelleme
async function updateStats(type, value = 1) {
    try {
        const updateField = {};
        updateField[type] = value;
        updateField.lastUpdated = new Date();
        
        await db.collection('stats').updateOne(
            {},
            { $inc: updateField },
            { upsert: true }
        );
        
        log('info', 'İstatistik güncellendi', { type, value });
    } catch (error) {
        log('error', 'İstatistik güncelleme hatası', { error: error.message, type, value });
    }
}

// Level sistemi
const LEVELS = {
    'Bronze': { min: 0, max: 100, multiplier: 1.0 },
    'Silver': { min: 101, max: 250, multiplier: 1.2 },
    'Gold': { min: 251, max: 500, multiplier: 1.5 },
    'Platinum': { min: 501, max: Infinity, multiplier: 2.0 }
};

function calculateLevel(stars) {
    if (stars >= 501) return 'Platinum';
    if (stars >= 251) return 'Gold';
    if (stars >= 101) return 'Silver';
    return 'Bronze';
}

// API Routes

// Kullanıcı profili getir
app.get('/api/users/profile/:userId', async (req, res) => {
    try {
        const userId = normalizeUserId(req.params.userId);
        
        let user = await db.collection('users').findOne({ telegramId: userId });
        
        if (!user) {
            // Yeni kullanıcı oluştur
            user = {
                telegramId: userId,
                username: `User${userId}`,
                firstName: 'User',
                lastName: '',
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
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            await db.collection('users').insertOne(user);
            await updateStats('totalUsers');
            
            log('info', 'Yeni kullanıcı oluşturuldu', { userId });
        }
        
        res.json({
            success: true,
            user: user
        });
        
    } catch (error) {
        log('error', 'Kullanıcı profili getirme hatası', { error: error.message, userId: req.params.userId });
        res.status(500).json({
            success: false,
            error: 'Kullanıcı profili getirilemedi'
        });
    }
});

// Kullanıcı profili güncelle
app.put('/api/users/profile/:userId', async (req, res) => {
    try {
        const userId = normalizeUserId(req.params.userId);
        const updateData = req.body;
        
        // Level hesapla
        if (updateData.stars !== undefined) {
            updateData.level = calculateLevel(updateData.stars);
        }
        
        updateData.updatedAt = new Date();
        
        const result = await db.collection('users').updateOne(
            { telegramId: userId },
            { $set: updateData },
            { upsert: true }
        );
        
        if (result.upsertedCount > 0) {
            await updateStats('totalUsers');
        }
        
        res.json({
            success: true,
            message: 'Kullanıcı profili güncellendi'
        });
        
    } catch (error) {
        log('error', 'Kullanıcı profili güncelleme hatası', { error: error.message, userId: req.params.userId });
        res.status(500).json({
            success: false,
            error: 'Kullanıcı profili güncellenemedi'
        });
    }
});

// Reklam izleme
app.post('/api/users/watch-ad', async (req, res) => {
    try {
        const userId = normalizeUserId(req.body.telegramId);
        
        let user = await db.collection('users').findOne({ telegramId: userId });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Kullanıcı bulunamadı'
            });
        }
        
        // Günlük limit kontrolü
        const today = new Date().toDateString();
        if (user.lastAdDate === today && user.dailyAdsWatched >= 50) {
            return res.status(400).json({
                success: false,
                error: 'Günlük reklam limitiniz doldu'
            });
        }
        
        // Yıldız hesapla
        const baseReward = 0.10;
        const levelMultiplier = LEVELS[user.level].multiplier;
        const reward = baseReward * levelMultiplier;
        
        // Kullanıcıyı güncelle
        const updateData = {
            stars: user.stars + reward,
            totalEarnings: user.totalEarnings + reward,
            dailyAdsWatched: user.lastAdDate === today ? user.dailyAdsWatched + 1 : 1,
            lastAdDate: today,
            updatedAt: new Date()
        };
        
        // Level güncelle
        updateData.level = calculateLevel(updateData.stars);
        
        await db.collection('users').updateOne(
            { telegramId: userId },
            { $set: updateData }
        );
        
        await updateStats('totalAdsWatched');
        await updateStats('totalStarsEarned', reward);
        
        res.json({
            success: true,
            message: `${reward.toFixed(2)} yıldız kazandınız!`,
            stars: updateData.stars,
            level: updateData.level,
            reward: reward
        });
        
    } catch (error) {
        log('error', 'Reklam izleme hatası', { error: error.message, userId: req.body.telegramId });
        res.status(500).json({
            success: false,
            error: 'Reklam izleme işlemi başarısız'
        });
    }
});

// Çekim talebi
app.post('/api/users/withdraw', async (req, res) => {
    try {
        const userId = normalizeUserId(req.body.telegramId);
        const { amount, method, phoneNumber } = req.body;
        
        if (!amount || amount < 20) {
            return res.status(400).json({
                success: false,
                error: 'Minimum çekim miktarı 20 yıldızdır'
            });
        }
        
        let user = await db.collection('users').findOne({ telegramId: userId });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Kullanıcı bulunamadı'
            });
        }
        
        if (user.stars < amount) {
            return res.status(400).json({
                success: false,
                error: 'Yeterli yıldızınız yok'
            });
        }
        
        // Çekim talebi oluştur
        const withdrawal = {
            userId: userId,
            amount: amount,
            method: method,
            phoneNumber: phoneNumber,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        await db.collection('withdrawals').insertOne(withdrawal);
        
        // Kullanıcı yıldızlarını güncelle
        await db.collection('users').updateOne(
            { telegramId: userId },
            { 
                $inc: { stars: -amount },
                $push: { withdrawalHistory: withdrawal },
                $set: { updatedAt: new Date() }
            }
        );
        
        await updateStats('totalWithdrawals');
        
        res.json({
            success: true,
            message: 'Çekim talebiniz alındı! En kısa sürede işleme alınacaktır.',
            withdrawalId: withdrawal._id
        });
        
    } catch (error) {
        log('error', 'Çekim hatası', { error: error.message, userId: req.body.telegramId });
        res.status(500).json({
            success: false,
            error: 'Çekim işlemi başarısız'
        });
    }
});

// Liderlik tablosu
app.get('/api/leaderboard/:period', async (req, res) => {
    try {
        const period = req.params.period; // daily, weekly, monthly
        
        let dateFilter = {};
        const now = new Date();
        
        if (period === 'daily') {
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            dateFilter = { updatedAt: { $gte: startOfDay } };
        } else if (period === 'weekly') {
            const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
            dateFilter = { updatedAt: { $gte: startOfWeek } };
        } else if (period === 'monthly') {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            dateFilter = { updatedAt: { $gte: startOfMonth } };
        }
        
        const leaderboard = await db.collection('users')
            .find(dateFilter)
            .sort({ stars: -1 })
            .limit(10)
            .project({
                telegramId: 1,
                username: 1,
                firstName: 1,
                lastName: 1,
                stars: 1,
                level: 1
            })
            .toArray();
        
        res.json({
            success: true,
            leaderboard: leaderboard.map(user => ({
                id: user.telegramId,
                username: user.firstName || user.username || `User${user.telegramId}`,
                stars: user.stars,
                level: user.level
            }))
        });
        
    } catch (error) {
        log('error', 'Liderlik tablosu hatası', { error: error.message, period: req.params.period });
        res.status(500).json({
            success: false,
            error: 'Liderlik tablosu yüklenemedi'
        });
    }
});

// İstatistikler
app.get('/api/stats', async (req, res) => {
    try {
        const stats = await db.collection('stats').findOne() || {};
        const totalUsers = await db.collection('users').countDocuments();
        
        res.json({
            success: true,
            stats: {
                ...stats,
                totalUsers: totalUsers
            }
        });
        
    } catch (error) {
        log('error', 'İstatistik hatası', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'İstatistikler yüklenemedi'
        });
    }
});

// Admin routes
app.get('/api/admin/users', adminAuth, async (req, res) => {
    try {
        const users = await db.collection('users')
            .find({})
            .sort({ createdAt: -1 })
            .limit(100)
            .toArray();
        
        res.json({
            success: true,
            users: users
        });
        
    } catch (error) {
        log('error', 'Admin kullanıcı listesi hatası', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Kullanıcı listesi yüklenemedi'
        });
    }
});

app.get('/api/admin/withdrawals', adminAuth, async (req, res) => {
    try {
        const withdrawals = await db.collection('withdrawals')
            .find({})
            .sort({ createdAt: -1 })
            .limit(100)
            .toArray();
        
        res.json({
            success: true,
            withdrawals: withdrawals
        });
        
    } catch (error) {
        log('error', 'Admin çekim listesi hatası', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Çekim listesi yüklenemedi'
        });
    }
});

// Çekim durumu güncelle
app.put('/api/admin/withdrawals/:id', adminAuth, async (req, res) => {
    try {
        const withdrawalId = req.params.id;
        const { status } = req.body;
        
        await db.collection('withdrawals').updateOne(
            { _id: new ObjectId(withdrawalId) },
            { 
                $set: { 
                    status: status,
                    updatedAt: new Date()
                }
            }
        );
        
        res.json({
            success: true,
            message: 'Çekim durumu güncellendi'
        });
        
    } catch (error) {
        log('error', 'Çekim durumu güncelleme hatası', { error: error.message, withdrawalId: req.params.id });
        res.status(500).json({
            success: false,
            error: 'Çekim durumu güncellenemedi'
        });
    }
});

// Error handling middleware
app.use(errorHandler);

// Server başlatma
async function startServer() {
    try {
        await connectToDb();
        
        app.listen(PORT, () => {
            log('info', `Server ${PORT} portunda başlatıldı`);
            console.log(`🚀 StarEarn Server ${PORT} portunda çalışıyor`);
            console.log(`📱 Web App URL: ${WEB_APP_URL}`);
            console.log(`🤖 Bot Token: ${token.substring(0, 20)}...`);
        });
        
    } catch (error) {
        log('error', 'Server başlatma hatası', { error: error.message });
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', () => {
    log('info', 'SIGTERM sinyali alındı, server kapatılıyor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    log('info', 'SIGINT sinyali alındı, server kapatılıyor...');
    process.exit(0);
});

// Unhandled promise rejection
process.on('unhandledRejection', (reason, promise) => {
    log('error', 'Unhandled Promise Rejection', { reason: reason.toString(), promise: promise.toString() });
});

// Uncaught exception
process.on('uncaughtException', (error) => {
    log('error', 'Uncaught Exception', { error: error.message, stack: error.stack });
    process.exit(1);
});

// Server'ı başlat
startServer(); 