# StarEarn - Reklam İzleyerek Yıldız Kazanma Telegram Web App

Bu proje, Telegram Web App teknolojisi kullanarak reklam izleyerek yıldız kazanma uygulamasıdır.

## 🌟 Özellikler

- **Reklam İzleme Sistemi**: 15 saniye reklam izleyerek 0.10 yıldız kazanma
- **Seviye Sistemi**: Bronze, Silver, Gold, Platinum seviyeleri ile çarpan sistemi
- **Günlük Görevler**: 10 reklam izleme, arkadaş davet etme, 7 gün üst üste giriş
- **Yıldız Çekme**: Telegram hesabına veya telefon numarasına TMT olarak çekme
- **Liderlik Tablosu**: Günlük, haftalık, aylık sıralamalar
- **Modern UI/UX**: Dark/Light tema desteği ile modern tasarım
- **Telegram Entegrasyonu**: Telegram Web App API'si ile tam entegrasyon
- **Responsive Tasarım**: Mobil ve masaüstü cihazlarda mükemmel görünüm
- **Animasyonlar**: Yıldız kazanma ve seviye atlama animasyonları

## 🎮 Oyunlaştırma Sistemi

### Seviye Sistemi
- **Bronze** (0-100 yıldız): 1.0x kazanç
- **Silver** (101-250 yıldız): 1.2x kazanç
- **Gold** (251-500 yıldız): 1.5x kazanç
- **Platinum** (501+ yıldız): 2.0x kazanç

### Günlük Görevler
- **10 Reklam İzle**: 0.50 bonus yıldız
- **3 Arkadaş Davet Et**: 5.00 bonus yıldız
- **7 Gün Üst Üste Giriş**: 5.00 bonus yıldız

### Özel Etkinlikler
- **Hafta Sonu**: 1.5x yıldız kazanç
- **Özel Günler**: 3x yıldız kazanç (yönetici tarafından belirlenir)

## 💰 Para Çekme Sistemi

### Minimum Çekim
- **20 yıldız** minimum çekim miktarı

### Ödeme Yöntemleri
- **Telegram Hesabına**: Yıldızları Telegram hesabına gönderme
- **Telefon Numarasına TMT**: Telefon numarasına TMT olarak gönderme

## 🎨 Tasarım Özellikleri

### Renk Paleti
- **Ana Renk**: Altın sarısı (#FFD700)
- **İkincil**: Koyu mavi (#1E3A8A)
- **Vurgu**: Turuncu (#FF6B35)

### Animasyonlar
- Yıldız kazanma animasyonu
- Seviye atlama efekti
- Reklam izleme progress bar'ı
- Smooth geçişler ve hover efektleri

## 🌐 Canlı Demo

Web App'e erişmek için: [Render Link](https://tmstars.onrender.com/)

## 📁 Dosya Yapısı

```
├── index.html          # Ana HTML dosyası
├── styles.css          # CSS stilleri
├── script.js           # JavaScript kodu
├── server.js           # Backend server
├── admin.html          # Admin paneli
├── admin.js            # Admin panel JavaScript
├── package.json        # Bağımlılıklar
├── README.md           # Bu dosya
└── mongodb-backups/    # Veritabanı yedekleri
```

## 🚀 Kurulum

### 1. Telegram Bot Oluşturma

1. Telegram'da [@BotFather](https://t.me/botfather) ile konuşun
2. `/newbot` komutunu gönderin
3. Bot adını ve kullanıcı adını belirleyin
4. Bot token'ınızı alın (örn: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2. Web App URL'sini Ayarlama

1. [@BotFather](https://t.me/botfather)'a `/setmenubutton` komutunu gönderin
2. Botunuzu seçin
3. Web App URL'sini girin: `https://your-domain.com/index.html`

### 3. Proje Kurulumu

```bash
# Bağımlılıkları yükleyin
npm install

# Bot token'ını ayarlayın
# server.js dosyasında YOUR_BOT_TOKEN_HERE yerine gerçek token'ınızı yazın
```

### 4. MongoDB Kurulumu

1. [MongoDB Atlas](https://cloud.mongodb.com) hesabı oluşturun
2. Yeni cluster oluşturun (M0 ücretsiz plan)
3. Database Access'te yeni kullanıcı oluşturun
4. Network Access'te IP whitelist ekleyin (0.0.0.0/0)
5. Connection string'i alın

### 5. Environment Variables

`.env` dosyası oluşturun:

```env
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/starearn
DEBUG=true
NODE_ENV=development
```

### 6. Web Sunucusu Kurulumu

#### A) Render (Önerilen)
```bash
# Render CLI kurun
npm i -g render-cli

# Projeyi deploy edin
render deploy
```

#### B) Vercel
```bash
# Vercel CLI kurun
npm i -g vercel

# Projeyi deploy edin
vercel

# Domain'i ayarlayın
vercel --prod
```

#### C) Netlify
```bash
# Netlify CLI kurun
npm i -g netlify-cli

# Projeyi deploy edin
netlify deploy
```

### 7. Bot Token'ını Güncelleme

`server.js` dosyasında:
```javascript
const token = 'YOUR_BOT_TOKEN_HERE'; // Buraya gerçek token'ınızı yazın
```

### 8. Web App URL'sini Güncelleme

`server.js` dosyasında:
```javascript
const WEB_APP_URL = 'https://tmstars.onrender.com/'; // Buraya gerçek URL'nizi yazın
```

## 🛠️ Teknolojiler

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Telegram API:** Telegram Web App SDK, node-telegram-bot-api
- **Hosting:** Render.com
- **Güvenlik:** HMAC-SHA256 doğrulaması

## 🔧 API Endpoints

### Kullanıcı İşlemleri
- `GET /api/users/profile/:userId` - Kullanıcı profili getir
- `PUT /api/users/profile/:userId` - Kullanıcı profili güncelle
- `POST /api/users/watch-ad` - Reklam izleme
- `POST /api/users/withdraw` - Yıldız çekme

### Liderlik Tablosu
- `GET /api/leaderboard/:period` - Liderlik tablosu (daily/weekly/monthly)

### İstatistikler
- `GET /api/stats` - Genel istatistikler

### Admin İşlemleri
- `GET /api/admin/users` - Kullanıcı listesi
- `GET /api/admin/withdrawals` - Çekim listesi
- `PUT /api/admin/withdrawals/:id` - Çekim durumu güncelle

## 🔒 Güvenlik

- Web App sadece Telegram'dan açıldığında çalışır
- HMAC doğrulaması ile güvenlik sağlanır
- HTTPS zorunluluğu
- XSS ve CSRF koruması
- Rate limiting (gelecek sürümde)

## 📊 Veritabanı Yapısı

### Users Collection
```javascript
{
  telegramId: String,
  username: String,
  firstName: String,
  lastName: String,
  stars: Number,
  level: String,
  experience: Number,
  dailyAdsWatched: Number,
  lastAdDate: Date,
  totalEarnings: Number,
  withdrawalHistory: Array,
  tasks: Object,
  consecutiveLogins: Number,
  lastLoginDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Withdrawals Collection
```javascript
{
  userId: String,
  amount: Number,
  method: String,
  phoneNumber: String,
  status: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Stats Collection
```javascript
{
  totalUsers: Number,
  totalStarsEarned: Number,
  totalWithdrawals: Number,
  totalAdsWatched: Number,
  lastUpdated: Date
}
```

## 📱 Kullanım

1. Telegram'da botunuzu bulun
2. `/start` komutunu gönderin
3. "StarEarn'a Git" butonuna tıklayın
4. Reklam izleyerek yıldız kazanın
5. Görevleri tamamlayarak bonus yıldızlar kazanın
6. Yıldızlarınızı çekin

## 🔧 Yapılandırma

### Admin Ayarları
`server.js` dosyasında admin chat ID'sini ayarlayın:
```javascript
if (!collectionNames.includes('admins')) {
    await db.createCollection('admins');
    const admin = await db.collection('admins').findOne({ chatId: YOUR_CHAT_ID });
    if (!admin) {
        await db.collection('admins').insertOne({ chatId: YOUR_CHAT_ID, addedAt: new Date() });
    }
}
```

### Özel Günler
Admin panelinden özel günleri belirleyebilirsiniz:
```javascript
const specialDays = [
    '2024-01-01', // Yılbaşı
    '2024-05-01', // İşçi Bayramı
    '2024-10-29'  // Cumhuriyet Bayramı
];
```

## 📄 Lisans

MIT License

## 📞 Destek

Sorunlarınız için:
- GitHub Issues
- Telegram: @your_support_username
- Email: support@yourdomain.com

## 🙏 Teşekkürler

- Telegram Web App API
- Font Awesome ikonları
- MongoDB Atlas
- Render.com hosting

---

**Not**: Bu Web App eğitim amaçlıdır. Gerçek para kazanma uygulamaları için gerekli lisansları almayı unutmayın.

## 🚀 Gelecek Özellikler

- [ ] Gerçek reklam entegrasyonu (AdMob, Facebook Ads)
- [ ] Arkadaş davet sistemi
- [ ] Özel etkinlikler yönetimi
- [ ] Push bildirimleri
- [ ] Çoklu dil desteği
- [ ] Gelişmiş analitikler
- [ ] Otomatik ödeme sistemi
- [ ] Referans sistemi
- [ ] Başarım rozetleri
- [ ] Haftalık yarışmalar

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın! 