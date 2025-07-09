# TmStars - Telegram Mini App

🌟 **Yıldız Kazanma Sistemi** - Telegram Mini App

Bu proje, Telegram kullanıcılarının yıldız kazanabilecekleri, reklam izleyebilecekleri ve ödüllerini çekebilecekleri modern bir mini uygulamadır.

## ✨ Özellikler

### 🎯 Ana Özellikler
- **Günlük Bonus Sistemi** - Her gün 50 yıldız bonus
- **Reklam İzleme** - Her reklam için 5 yıldız kazanma
- **Günlük Görevler** - Çeşitli görevlerle yıldız kazanma
- **Arkadaş Davet Etme** - Her davet için 20 yıldız
- **Yıldız Çekim Sistemi** - Minimum 100 yıldız ile çekim talebi
- **Lider Tablosu** - En çok yıldız kazananları görme

### 🎨 Tasarım Özellikleri
- **Modern UI/UX** - Gradient renkler ve animasyonlar
- **Responsive Tasarım** - Tüm cihazlarda uyumlu
- **Telegram Entegrasyonu** - Native Telegram Web App API
- **Haptic Feedback** - Dokunsal geri bildirim
- **Smooth Animations** - Akıcı geçişler ve efektler

### 📱 Teknik Özellikler
- **Vanilla JavaScript** - Framework bağımsız
- **LocalStorage** - Veri saklama
- **Telegram Web App API** - Tam entegrasyon
- **Progressive Web App** - PWA özellikleri
- **Cross-Platform** - Web ve Telegram uyumlu

## 🚀 Kurulum

### Gereksinimler
- Modern web tarayıcısı
- Telegram hesabı (mini app için)
- Web sunucusu (canlıya almak için)

### Yerel Geliştirme
1. Projeyi klonlayın:
```bash
git clone https://github.com/kullaniciadi/TmStars.git
cd TmStars
```

2. Dosyaları web sunucusunda çalıştırın:
```bash
# Python ile
python -m http.server 8000

# Node.js ile
npx serve .

# PHP ile
php -S localhost:8000
```

3. Tarayıcıda açın:
```
http://localhost:8000
```

## 📁 Proje Yapısı

```
TmStars/
├── index.html          # Ana HTML dosyası
├── styles.css          # CSS stilleri
├── script.js           # JavaScript fonksiyonları
├── README.md           # Proje dokümantasyonu
└── .gitignore          # Git ignore dosyası
```

## 🎮 Kullanım

### Kullanıcı İşlemleri
1. **Günlük Bonus Al** - Her gün bir kez 50 yıldız
2. **Reklam İzle** - 3 saniye reklam izleyerek 5 yıldız kazan
3. **Görevleri Tamamla** - Günlük görevlerle ekstra yıldız kazan
4. **Arkadaş Davet Et** - Davet linkini paylaşarak 20 yıldız kazan
5. **Yıldız Çek** - Minimum 100 yıldız ile çekim talebi oluştur

### Görev Sistemi
- **Giriş Yap** - 10 yıldız
- **3 Reklam İzle** - 15 yıldız
- **Arkadaş Davet Et** - 25 yıldız
- **Günlük Bonus Al** - 20 yıldız

## 🔧 Telegram Mini App Kurulumu

### 1. BotFather ile Bot Oluşturma
1. Telegram'da @BotFather'a mesaj gönderin
2. `/newbot` komutunu kullanın
3. Bot adı ve kullanıcı adı belirleyin
4. Bot token'ını kaydedin

### 2. Mini App Oluşturma
1. @BotFather'a `/newapp` komutunu gönderin
2. Bot'unuzu seçin
3. Mini app adı ve açıklaması girin
4. Web App URL'sini girin (canlı sunucu adresi)

### 3. Web App URL Formatı
```
https://yourdomain.com/tmstars/
```

## 🌐 Canlıya Alma

### 1. Hosting Seçenekleri
- **GitHub Pages** - Ücretsiz hosting
- **Netlify** - Otomatik deployment
- **Vercel** - Hızlı deployment
- **Heroku** - Ücretli hosting
- **VPS** - Kendi sunucunuz

### 2. GitHub Pages ile Deployment
1. GitHub'da repository oluşturun
2. Dosyaları yükleyin
3. Settings > Pages > Source: Deploy from branch
4. Branch: main, folder: / (root)
5. URL'yi kopyalayın

### 3. Netlify ile Deployment
1. Netlify hesabı oluşturun
2. "New site from Git" seçin
3. GitHub repository'nizi bağlayın
4. Deploy butonuna tıklayın
5. URL'yi kopyalayın

## 📊 Veri Yönetimi

### LocalStorage Yapısı
```javascript
{
  "stars": 150,
  "dailyBonusClaimed": false,
  "lastDailyBonus": "Mon Dec 18 2023",
  "completedTasks": ["login", "daily_bonus"],
  "withdrawalHistory": [
    {
      "id": 1703123456789,
      "amount": 100,
      "note": "Test çekim",
      "status": "pending",
      "date": "2023-12-18T10:30:56.789Z"
    }
  ]
}
```

## 🎨 Özelleştirme

### Renk Teması Değiştirme
`styles.css` dosyasında CSS değişkenlerini düzenleyin:

```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --accent-color: #ffd700;
  --success-color: #28a745;
  --error-color: #dc3545;
}
```

### Yıldız Miktarlarını Değiştirme
`script.js` dosyasında değerleri güncelleyin:

```javascript
const DAILY_BONUS = 50;
const AD_REWARD = 5;
const INVITE_REWARD = 20;
const MIN_WITHDRAWAL = 100;
```

## 🔒 Güvenlik

### Öneriler
- HTTPS kullanın
- Input validasyonu yapın
- XSS koruması ekleyin
- Rate limiting uygulayın
- Backend API kullanın

### Backend Entegrasyonu
Gerçek bir uygulama için:
- Node.js/Express backend
- MongoDB/PostgreSQL veritabanı
- JWT authentication
- API rate limiting
- Admin paneli

## 📈 Gelecek Özellikler

### Planlanan Özellikler
- [ ] Gerçek reklam entegrasyonu
- [ ] Sosyal medya paylaşımı
- [ ] Seviye sistemi
- [ ] Başarım rozetleri
- [ ] Turnuva sistemi
- [ ] Gerçek para çekimi
- [ ] Push bildirimleri
- [ ] Çoklu dil desteği

### Teknik İyileştirmeler
- [ ] Service Worker (PWA)
- [ ] IndexedDB kullanımı
- [ ] WebSocket entegrasyonu
- [ ] Progressive loading
- [ ] Offline desteği

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit yapın (`git commit -m 'Add some AmazingFeature'`)
4. Push yapın (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakın.

## 📞 İletişim

- **Proje Linki:** [https://github.com/kullaniciadi/TmStars](https://github.com/kullaniciadi/TmStars)
- **Telegram:** [@kullaniciadi](https://t.me/kullaniciadi)
- **Email:** kullanici@email.com

## 🙏 Teşekkürler

- Telegram Web App API
- Font Awesome ikonları
- Modern CSS teknikleri
- Açık kaynak topluluğu

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın! 