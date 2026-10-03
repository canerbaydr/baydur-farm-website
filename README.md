# Albaş Oto Kaporta — Menemen

Bağımlılıksız, mobil uyumlu HTML/CSS/JavaScript tanıtım sitesi. İşletmenin Google Haritalar kaydındaki bilgiler ve işletme hesabının yüklediği gerçek fotoğraflar kullanıldı. Kaynak dosyaları `dist/` içinde. Fotoğraf kaynakları `photo-sources.json` dosyasında.

## İşletme bilgileri

- Telefon: +90 545 550 12 14
- Adres: Mermerli Mahallesi, 1406. Sokak No:20, 35660 Menemen / İzmir
- Çalışma saatleri: Pazartesi–Cumartesi 08.30–18.30; Pazar kapalı
- Konum: 38.6159295, 27.0651482
- Google Place ID: ChIJhyEsTQDTuxQRkRgataSC-r8
- Bilgiler 3 Ekim 2026 tarihinde Google Haritalar'da kontrol edildi.
- Google değerlendirme bilgisi bu tarihte 5,0/5 ve 2 değerlendirmeydi. Sayı ve puan değişirse `dist/index.html` içindeki `.rating` alanını güncelleyin.

## Cloudflare Pages ile otomatik yayın

Canlı site: https://albasotokaporta.pages.dev

Kaynak kodu `canerbaydr/baydur-farm-website` deposunun yalnızca `albas-oto-kaporta` dalındadır. Baydur Farm'ın `main` dalı ayrı tutulur.

`.github/workflows/publish-albas.yml`, bu dalda `dist/`, SEO scripti veya yayın iş akışı değiştiğinde çalışır. SEO adreslerini düzenler ve Wrangler ile mevcut `albasotokaporta` Pages projesine yayınlar. GitHub Secrets içinde `CLOUDFLARE_API_TOKEN` ve `CLOUDFLARE_ACCOUNT_ID` kullanır; değerlerini kodda tutmayın.

Cloudflare projesi Direct Upload yöntemiyle oluşturulmuştur. Yayındaki Pages üretim dalı etiketi `main` olduğundan deploy komutunda `--branch=main` kullanılır. Bu etiket GitHub'ın `main` dalını checkout etmez veya değiştirmez; kaynak her zaman `albas-oto-kaporta` dalıdır.

Yayın sonucunu GitHub Actions sekmesindeki **Publish Albas to Cloudflare Pages** çalışmasından kontrol edin.

## Google ve Yandex

- Nihai sitede canonical, Open Graph ve AutoBodyShop yapılandırılmış verileri bulunur. `sitemap.xml` ve `robots.txt` yayın adresine göre script tarafından üretilir.
- Google Search Console'a nihai siteyi URL öneki mülkü olarak ekleyin. Verilen HTML doğrulama dosyasını `dist/` içine koyun veya doğrulama meta etiketini `dist/index.html` dosyasına ekleyin.
- Siteyi doğruladıktan sonra `sitemap.xml` dosyasını gönderin; URL Denetimi ile ana sayfa için dizine eklenme isteyin.
- Mevcut işletme kaydının web sitesi alanına nihai adresi ekleyin.
- Yandex Webmaster'da aynı adresi doğrulayıp site haritasını gönderin.
- Yayınlama ve site haritası gönderimi Google'a veya Yandex'e eklenme ya da sıralama garantisi vermez.

## Düzenleme

Metinler, adres, telefon, saatler ve SEO verileri: `dist/index.html`. Tasarım: `dist/style.css`. Menü ve fotoğraf penceresi: `dist/app.js`. Görseller: `dist/assets/`.

Siteyi başka adrese taşırken `SITE_URL` değerini yeni gerçek adres olarak değiştirin. Form/veritabanı veya ücretli üçüncü taraf servis bulunmuyor. Telefon ve WhatsApp bağlantıları ilgili uygulamayı açar; otomatik mesaj göndermez.

## Yayın adresi

Herkese açık ana yayın adresi `https://albasotokaporta.pages.dev` olarak ayarlanmıştır. Google/Yandex doğrulama ve site haritası kayıtları bu adresle yapılmalıdır.
