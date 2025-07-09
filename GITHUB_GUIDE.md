# GitHub'a Yükleme Rehberi

## 📋 Adım Adım GitHub'a Yükleme

### 1️⃣ GitHub'da Repository Oluşturma

1. **GitHub.com'a gidin** ve hesabınıza giriş yapın
2. **Sağ üst köşedeki "+" butonuna tıklayın**
3. **"New repository" seçin**
4. **Repository bilgilerini doldurun:**
   - Repository name: `TmStars`
   - Description: `Telegram Mini App - Yıldız Kazanma Sistemi`
   - Public/Private: Public (önerilen)
   - README ekleme: ❌ (zaten var)
   - .gitignore: ❌ (zaten var)
   - License: MIT License
5. **"Create repository" butonuna tıklayın**

### 2️⃣ Yerel Git Repository Oluşturma

Terminal/PowerShell'de proje klasörüne gidin:

```bash
cd "C:\Users\Nowruz\Desktop\TG projects\TmStars"
```

### 3️⃣ Git Repository Başlatma

```bash
# Git repository başlat
git init

# Dosyaları staging area'ya ekle
git add .

# İlk commit'i oluştur
git commit -m "Initial commit: TmStars Telegram Mini App"

# Remote repository'yi ekle (GitHub URL'nizi kullanın)
git remote add origin https://github.com/KULLANICI_ADINIZ/TmStars.git

# Main branch'i oluştur
git branch -M main

# GitHub'a push yap
git push -u origin main
```

### 4️⃣ GitHub Pages ile Canlıya Alma

1. **GitHub repository'nize gidin**
2. **Settings sekmesine tıklayın**
3. **Sol menüden "Pages" seçin**
4. **Source kısmında:**
   - Deploy from a branch: ✅
   - Branch: main
   - Folder: / (root)
5. **Save butonuna tıklayın**
6. **URL'yi kopyalayın** (örn: `https://kullaniciadi.github.io/TmStars/`)

### 5️⃣ Telegram Bot Oluşturma

1. **Telegram'da @BotFather'a gidin**
2. **`/newbot` komutunu gönderin**
3. **Bot adı girin:** `TmStars Bot`
4. **Bot username girin:** `tmstars_bot` (sonu _bot ile bitmeli)
5. **Bot token'ını kaydedin**

### 6️⃣ Mini App Oluşturma

1. **@BotFather'a `/newapp` komutunu gönderin**
2. **Bot'unuzu seçin**
3. **Mini app adı:** `TmStars`
4. **Açıklama:** `Yıldız kazanma sistemi`
5. **Web App URL:** GitHub Pages URL'nizi girin
6. **Mini app oluşturuldu!**

## 🔧 Alternatif Hosting Seçenekleri

### Netlify ile Deployment

1. **Netlify.com'a gidin**
2. **"New site from Git" tıklayın**
3. **GitHub'ı seçin**
4. **Repository'nizi seçin**
5. **Deploy butonuna tıklayın**
6. **URL'yi kopyalayın**

### Vercel ile Deployment

1. **Vercel.com'a gidin**
2. **GitHub ile giriş yapın**
3. **"New Project" tıklayın**
4. **Repository'nizi seçin**
5. **Deploy butonuna tıklayın**

## 📱 Telegram Mini App Test Etme

1. **Bot'unuzu Telegram'da bulun**
2. **Start butonuna tıklayın**
3. **Menu'den mini app'i açın**
4. **Uygulamayı test edin**

## 🎯 Önemli Notlar

- **HTTPS zorunlu:** Telegram mini app'ler HTTPS gerektirir
- **Responsive tasarım:** Mobil uyumlu olmalı
- **Telegram API:** Web App API'sini kullanın
- **LocalStorage:** Veri saklama için kullanılıyor
- **Rate limiting:** Gerçek uygulamada backend gerekli

## 🚨 Hata Çözümleri

### Git Push Hatası
```bash
# Eğer authentication hatası alırsanız:
git remote set-url origin https://KULLANICI_ADINIZ@github.com/KULLANICI_ADINIZ/TmStars.git
```

### GitHub Pages Çalışmıyor
- Repository'nin public olduğundan emin olun
- Settings > Pages'te doğru branch seçili mi kontrol edin
- Birkaç dakika bekleyin (deployment zaman alabilir)

### Telegram Mini App Açılmıyor
- URL'nin HTTPS olduğundan emin olun
- URL'nin doğru olduğunu kontrol edin
- Bot'un aktif olduğundan emin olun

## 📞 Yardım

Sorun yaşarsanız:
- GitHub Issues kullanın
- Telegram'da @BotFather'a sorun
- Stack Overflow'da arayın

---

🎉 Tebrikler! TmStars uygulamanız artık canlıda! 