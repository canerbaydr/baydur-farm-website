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

## Cloudflare Pages ile ücretsiz yayın

1. Kaynak kodu `canerbaydr/baydur-farm-website` deposunun `albas-oto-kaporta` dalındadır. Dalın kök ağacı yalnızca bu siteye aittir.
2. Cloudflare hesabında Workers & Pages → Create application → Pages → Connect to Git yolunu izleyin. Yalnızca bu depoya erişim verin.
3. Production branch: `albas-oto-kaporta`. Framework: `None`. Build command: `node scripts/configure-seo.mjs`. Build output directory: `dist`.
4. İlk yayın sonrası verilen gerçek adresi kontrol edin. İsim müsaitse `albas-oto-kaporta.pages.dev` olacaktır; müsait olduğu önceden varsayılmıyor.
5. Projenin ortam değişkenlerine `SITE_URL` olarak gerçek ana yayın adresini ve `PRODUCTION_BRANCH` olarak `albas-oto-kaporta` değerini ekleyin ve yeniden yayınlayın. Cloudflare Pages ilk kurulumda `CF_PAGES_URL` adresini sağlar; script geçici önizleme adreslerini indekslemeye kapatır. Ana adres için `SITE_URL` kullanın.
6. GitHub'da `albas-oto-kaporta` dalına yaptığınız her değişiklik otomatik yayınlanır. Tasarım değişikliklerini ayrı dalda inceleyip `albas-oto-kaporta` dalına birleştirebilirsiniz.

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

## Önizleme

ChatGPT Sites üzerinde hazırlanmış sürüm sahibiyle sınırlı önizlemedir. GitHub kaynakları kaydedilmiştir; Cloudflare Pages ve Google/Yandex kayıt adımları henüz tamamlanmamıştır. Google/Yandex kayıt işlemleri nihai herkese açık adresle yapılmalıdır.
