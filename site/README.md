# Production Engineering Handbook — Site

Interactive companion website for the Production Engineering Handbook. Displays nine books on an SVG shelf, opening into an interactive book reader with 3D page turns, measured table of contents pagination, and synchronized URL hash routing.

## Geliştirme ve Çalıştırma

### Gereksinimler
- Node.js 22+
- npm

### Kurulum
```bash
npm install
```

### Lokal Geliştirme
```bash
npm run dev
```
`predev` adımı otomatik olarak `scripts/build-data.mjs` betiğini çalıştırıp `public/data/` altındaki veri dosyalarını üretir, ardından Vite geliştirme sunucusunu başlatır.

### Üretim Derlemesi
```bash
npm run build
```
`prebuild` adımı verileri derler, ardından Vite statik bundle'ı `dist/` klasörüne çıkarır.

### Önizleme
```bash
npm run preview
```

## Veri Akışı (Data Pipeline)

Site üzerindeki tüm kitaplar ve vakalar doğrudan repodaki markdown dosyalarından üretilir; veriler elle iki kez yazılmaz.

1. **Quick Problem Index**: `scripts/build-data.mjs`, kök dizindeki ana `README.md` dosyasındaki Quick Problem Index tablosunu okuyarak kitap ve vaka listesini, sırasını ve başlıklarını belirler.
2. **Vaka İçerikleri**: Her vaka için ilgili klasördeki (`XX-domain/case-slug/README.md`) dosya taranarak aşağıdaki bölümler ayrıştırılır:
   - *The Problem* (Sorun tanımı)
   - *First Tries* (Başarısız ilk denemeler, üzeri çizili adımlar ve el yazısı notlar)
   - *What Held* (Kalıcı çözüm ve mimari analiz)
   - *Verified* (Doğrulama adımları ve test komutları)
   - *Source Link* (Kaynak kod bağlantısı)
3. **Bütünlük Doğrulaması**:
   - Quick Index'te yer alan bir vakanın klasörü veya `README.md` dosyası eksikse derleme hata verir.
   - Vakada belirtilen `src` dosyasının diskte fiziki olarak var olduğu kontrol edilir; dosya yoksa derleme kırılır.
   - `src/config.js` içerisindeki `SPINE` girdilerinin her kitap için tanımlı olduğu doğrulanır.
4. **Çıktı**:
   - `public/data/index.json`: Kitap üst verileri ve vaka başlıkları (raf ve içindekiler için).
   - `public/data/book-<n>.json`: İlgili kitaba ait detaylı vaka içerikleri (kitap açıldığında isteğe bağlı yüklenir).
   - `public/data/` dizini `.gitignore` içerisindedir ve versiyon kontrolüne dahil edilmez.

## Cloudflare Pages Dağıtım Ayarları

Dağıtım Cloudflare Pages üzerinden yapılır:

| Ayar | Değer |
|---|---|
| **Framework preset** | `Vite` (veya `None`) |
| **Root directory** | `site` |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Node.js version** | `22` (Environment variable: `NODE_VERSION: 22`) |
| **Custom domain** | `handbook.onuracar.dev` |
