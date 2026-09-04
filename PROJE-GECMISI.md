# AI Ofis — Proje Geçmişi ve Devir Teslim Notu

Bu belge, projenin sıfırdan bugüne nasıl geliştiğini, **hangi kararların neden**
alındığını ve nelerin açık kaldığını anlatır. Amaç: projeye devam edecek
kişinin (veya başka bir AI asistanının) bağlamı kaybetmeden devam edebilmesi.

---

## 1. Projenin amacı (kullanıcının kendi ifadesiyle)

> "Bütün yapay zekalarımı tek bir yerden kullanabileceğim bir yapı kurmak
> istiyorum. Sanki bir office gibi olacak, hatta bir ofis ortamı görünecek ve
> her yapay zekanın masası olacak. Onlar çalışırken masa başında çalıştıkları
> görünecek. Yapmak istediğim projeleri onlarla konuşacağım, onlar kendi
> aralarında karar verecek ve bana sunacak. Ama bu sadece bilgisayarda
> çalışmalı, gerekirse uzaktan bağlanarak iş akışını kontrol etmeliyim.
> Ardından hangisinin tokenı erken biterse işi yanındaki ve onu yapabilecek
> diğer AI devretmeli."

Sonradan eklenen iki kritik şart:

- **Ücretsiz olmalı.** Kullanıcı bulut API'lerinin ücretli olduğunu öğrenince
  ekibin tamamı yerel (Ollama) modellere geçirildi.
- **Gizlilik.** "Belki önemli bilgiler paylaşacağım ve internete sızmasını
  istemiyorum." Bunun üzerine çevrimdışı mod eklendi ve **varsayılan olarak
  açık** yapıldı.

---

## 2. Mimari (özet)

```
src/
  types.ts                 Ajan / görev / mesaj veri modelleri
  offline.ts               Çevrimdışı mod denetimi (bulut sağlayıcı + adres engelleme)
  config/agents.default.json   Varsayılan ajan kadrosu (git'e dahil, anahtarsız)
  store/
    AgentStore.ts          data/agents.json  (ajanlar + API anahtarları)
    TaskStore.ts           data/tasks.json   (projeler + sohbet + görseller)
  providers/
    Provider.ts            Ortak arayüz (kind: 'text' | 'image')
    OllamaProvider.ts      Yerel metin modelleri
    ComfyUIProvider.ts     Yerel görsel üretimi
    AnthropicProvider.ts   Bulut (çevrimdışı modda engelli)
    OpenAIProvider.ts      Bulut (çevrimdışı modda engelli)
    MockProvider.ts        Anahtarsız demo yanıtları
    index.ts               Ajan → sağlayıcı fabrikası + önbellek
  orchestrator/
    Orchestrator.ts        Görev atama, tartışma, sentez, devir (handoff)
  server.ts                Express + WebSocket (REST API + canlı güncelleme)

public/
  index.html / app.js      Ofis ekranı
  office.js               Piksel ofis çizici (canvas)
  admin.html / admin.js    Yönetim ekranı
  style.css                Ortak stiller

AI-Ofis-Ac.bat             Windows başlatıcı (kendi kendine kurar)
AI-Ofis-Guncelle.bat       Güncelleme (tek internet gerektiren işlem)
AI-Ofis-Onar.bat           Bozuk kurulumu projeleri koruyarak onarır
```

**Akış:** `POST /api/tasks` → Orchestrator, istenen yetkinliklere sahip
ajanları sırayla çağırır → her ajanın görüşü sohbete eklenir → lider ajan
(planlama yetkinliği olan) hepsini tek bir nihai öneriye dönüştürür →
WebSocket ile arayüze anında yansır.

---

## 3. Önemli kararlar ve **gerekçeleri**

Bu bölüm en değerli kısımdır: kodu okuyarak anlaşılmayan "neden" bilgileri.

### 3.1 Neden kendi orkestrasyonumuzu yazdık?

İki hazır proje incelendi:

- **pixel-agents** (MIT) — görsel olarak tam istenen şey (masada çalışan
  piksel karakterler), ama Claude Code oturumlarını izlemek için yapılmış,
  gömülebilir bir kütüphane değil, bitmiş bir uygulama. **Karar:** kodu ve
  görselleri kullanılmadı, sadece fikir alındı; karakterler sıfırdan kod ile
  çizildi (lisans derdi ve indirme yok).
- **paperclip** (MIT) — aynı problem alanı, çok daha olgun (organizasyon
  şeması, ticket, bütçe, onay akışları). **Karar:** geçilmedi, çünkü
  desteklediği ajanlar bulut servisleri (Claude Code, Codex, Cursor),
  yerel model desteği ve çevrimdışı modu yok — kullanıcının iki temel şartını
  karşılamıyor. **Ama** en değerli fikri alındı: görevlerin kalıcı olması.

### 3.2 Neden ajan başına API anahtarı?

Kullanıcı "her ajan için API girilecek" dedi. Anahtarlar `data/agents.json`
içinde **sadece sunucu tarafında** tutulur; API ve arayüze **asla** dönmez —
`server.ts` içindeki `redactAgent()` sadece `hasApiKey: true/false` gönderir.

### 3.3 Çevrimdışı mod neden iki katmanlı?

`src/offline.ts` hem **yapılandırma** anında (Yönetim ekranından bulut
sağlayıcılı ajan kaydedilemez) hem de **çalışma** anında (`getProvider()`
istek gönderilmeden önce engeller) devreye girer. İkinci katman şart:
`data/agents.json` elle düzenlenirse bile veri dışarı çıkmamalı.

Yalnızca yerel adreslere izin verilir: `localhost`, `127.0.0.1`, `192.168.x.x`,
`10.x.x.x`, `172.16-31.x.x`, `*.local`.

### 3.4 Devir (handoff) mantığı

`Orchestrator.classifyFailure()` hatayı sınıflandırır:
- kota/limit hatası → ajan `quota_low`
- ağ/bağlantı hatası → ajan `error`

Her iki durumda da `handoff()` çağrılır. **Önemli:** `handoff()` yeni ajanı
`askAgent()` ile değil `runAgentTurnWithHandoff()` ile çağırır — böylece
devredilen ajan da başarısız olursa zincir devam eder. Sonsuz döngü olmaz
çünkü `task.previousAgentIds` sürekli büyür ve `pickAgent()` onları hariç
tutar.

`askAgent()` içindeki `try/catch/finally` şart: hata durumunda ajan durumu
sıfırlanmazsa masası sonsuza kadar "Çalışıyor" görünür (bu hata bir kez
yaşandı ve düzeltildi).

### 3.5 Görsel ajanlar neden farklı davranıyor?

`Provider.kind === 'image'` olan sağlayıcılara (ComfyUI) sohbet geçmişi
**gönderilmez**; onlara sadece görsel brief'i (`başlık + açıklama`) gider.
Sebep: "Diğer ekip arkadaşlarının katkılarını dikkate alarak görüş sun"
gibi bir metin, görsel modeli için berbat bir prompt olur.

### 3.6 Piksel ofis nasıl çiziliyor?

`public/office.js` iki aşamalı çizer:
1. Piksel sanatı 420x250 düşük çözünürlüklü bir tampona çizilir, tam sayı
   ölçekle büyütülür (`imageSmoothingEnabled = false`) → keskin pikseller.
2. Yazılar tam çözünürlükte, tampon üzerine çizilir → okunaklı metin.

Masalar karakterlerden **sonra** çizilir (oturanın önünde dursun diye); ajanı
masasında olmayanların masası ise **önce** çizilir (boş mobilya olarak arkada
kalsın). Toplantıya katılım `task.previousAgentIds` + aktif görev
durumlarından (`discussing`/`in_progress`/`handed_off`) hesaplanır.

### 3.7 Görevlerin kalıcılığı

`TaskStore` önce geçici dosyaya yazıp sonra `rename` yapar — yazma sırasında
kapanma olursa mevcut kayıt bozulmaz. Kaydetme `Orchestrator.emit()` içine
bağlıdır: görevi değiştiren her işlem zaten olay yayınladığı için hiçbir
değişiklik kaydedilmeden kalamaz. Yazımlar 400 ms geciktirilerek toplanır.

Program bir görevin ortasında kapanırsa o görev açılışta `interrupted`
("Yarım Kaldı") olarak işaretlenir — yoksa sonsuza kadar "tartışılıyor"
görünür ve ofiste karakterler ebediyen toplantıya yürür.

**Bilinçli tercih:** Ajan token sayaçları her açılışta sıfırlanır. Yerel
modeller ücretsiz olduğu için kota takibi oturum bazında tutulur.

---

## 4. Geliştirme geçmişi (commit sırası)

| Commit | Ne yapıldı |
|---|---|
| `07ea0a8` | MVP: çoklu ajan orkestrasyonu + ofis arayüzü |
| `20620ec` | Yönetim ekranı: ajan CRUD + ajan başına API anahtarı |
| `a81050f` | Ollama sağlayıcısı (yerel modeller) |
| `7e649e1` | Varsayılan ekip tamamen ücretsiz/yerel modellere geçirildi |
| `abaad95` | "Varsayılanlara Sıfırla" butonu |
| `dbe23fc` | Windows başlatıcı + masaüstü kısayolu |
| `d9626ab` | Başlatıcı kendi kendine yeter hale getirildi (self-bootstrapping) |
| `7be9d34` | Dolu C: diskine karşı dayanıklılık (F: diskine kurulum) |
| `679cf2c` | **Çevrimdışı mod** (varsayılan açık) |
| `b84f0ec` | **ComfyUI** ile yerel görsel üretimi |
| `ee8d94a` | **Piksel ofis**: masada çalışan, toplantıya yürüyen karakterler |
| `f8fe4d5` | **Görevlerin kalıcılığı** + silme + "Yarım Kaldı" durumu |
| `4715f61` | Görsel üretim süresinin raporlanması |
| `2b02522` | Güncelleme betiği hata teşhisi düzeltildi |
| `b17b6fa` | Onarım betiği eklendi |
| `cf2846c` | Onarım betiğindeki klasör taşıma hatası düzeltildi |

Tam gerekçeler için commit mesajlarına bakın (`git log`) — hepsi ayrıntılı
yazıldı.

---

## 5. Yol boyunca bulunan ve düzeltilen gerçek hatalar

Bunlar test sırasında ortaya çıktı, tekrar etmemesi için not edildi:

1. **Ajan masası sonsuza kadar "Çalışıyor" kalıyordu** — `askAgent()` hata
   durumunda durumu sıfırlamıyordu. `try/finally` eklendi.
2. **Devir sadece bir kez deneniyordu** — ilk yedek ajan da başarısız olursa
   zincir duruyordu. `handoff()` artık özyinelemeli olarak devam ediyor.
3. **Yanlış hata mesajı** — bağlantı hatasında sistem "token kotası bitti"
   diyordu. Artık gerçek neden ayrıştırılıyor (`classifyFailure`).
4. **XSS açığı** — Ofis ekranında proje başlığı/açıklaması HTML kaçırılmadan
   basılıyordu (Yönetim ekranında kaçırılıyordu). Düzeltildi.
5. **Sohbet balonları satır sonlarını yok sayıyordu** — Ollama'nın maddeli
   yanıtları tek bloğa sıkışıyordu. `white-space: pre-wrap` eklendi.
6. **Batch: `move` iç içe klasör oluşturuyor** — Windows'ta hedef klasör
   varsa `move` kaynağı onun içine taşır. `ren` ile değiştirildi.
7. **Batch: parantez bloğu içinde `%errorlevel%`** — blok tek seferde
   çözümlendiği için kontrol çalışmıyordu. Etiketlerle yeniden yazıldı.

---

## 6. Nasıl çalıştırılır

```bash
# Gereksinimler: Node.js 18+, Ollama, (görsel için) ComfyUI
ollama pull llama3.1:8b
ollama pull qwen2.5-coder:7b
ollama pull mistral:7b
ollama pull deepseek-coder:6.7b
ollama serve

npm install
cp .env.example .env      # boş bırakılabilir
npm run dev               # http://localhost:3000
```

Windows'ta: `AI-Ofis-Ac.bat` çift tıklamak yeterli (gerekirse kendisi kurar).

**Varsayılan ekip:**

| Ajan | Rol | Sağlayıcı | Model |
|---|---|---|---|
| Aylin | Proje Yöneticisi | ollama | `llama3.1:8b` |
| Kaan | Yazılım Mühendisi | ollama | `qwen2.5-coder:7b` |
| Deniz | Araştırmacı / Analist | ollama | `mistral:7b` |
| Mert | Test ve Kalite Kontrol | ollama | `deepseek-coder:6.7b` |
| Selin | Görsel Tasarımcı | comfyui | `auto` (ilk checkpoint) |

---

## 7. Test durumu — dürüst değerlendirme

**Otomatik test paketi yoktur.** Doğrulama, gerçek sunucu çalıştırılıp
uçtan uca senaryolarla ve headless tarayıcıyla (Playwright) yapıldı.

Doğrulananlar:
- Görev oluşturma → tartışma → sentez → öneri akışı
- Ajan CRUD, API anahtarının arayüze sızmaması
- Çevrimdışı modun bulut sağlayıcıyı ve uzak adresi engellemesi
  (gerçek görünümlü anahtarla "ÇOK GİZLİ" metinli test yapıldı; veri çıkmadı)
- ComfyUI akışı (sahte bir ComfyUI sunucusu yazılarak), görsel proxy'si,
  dizin gezme saldırısının engellenmesi
- Piksel ofis çizimi, toplantıya yürüme, karaktere tıklama
- Görevlerin kalıcılığı: sunucu öldürülüp açıldı, görev+mesaj+görsel korundu

**Doğrulanamayanlar (bu ortamda mümkün değildi):**
- Gerçek Ollama ile canlı yanıt (sandbox'ta Ollama yok)
- Gerçek ComfyUI ile canlı görsel üretimi (sahte sunucu ile test edildi)
- Windows `.bat` dosyalarının gerçek çalışması (Linux ortamı)

---

## 8. Açık işler / sonraki adımlar

Öncelik sırasıyla:

1. **Gerçek ortamda doğrulama** — kullanıcının makinesinde Ollama + ComfyUI
   ile uçtan uca akışın çalıştığı henüz teyit edilmedi.
2. **Otomatik testler yok.** En azından `Orchestrator` için birim testleri
   (devir zinciri, yetkinlik eşleşmesi, kalıcılık) yazılmalı.
3. **Ajanlar arası gerçek müzakere yok.** Şu an sıralı tek turlu: herkes bir
   kez konuşur, lider özetler. Gerçek tartışma (birbirine cevap verme,
   itiraz) yapılmadı.
4. **Uzaktan erişim ilkel.** `REMOTE_ACCESS_TOKEN` tek bir paylaşılan sırdır;
   çok kullanıcılı kullanım için gerçek kimlik doğrulama gerekir.
5. **Görsel iyileştirme** — hazır sprite paketi (örn. itch.io) desteği
   eklenebilir; şu an karakterler kod ile çiziliyor.
6. **Paperclip'ten alınabilecek diğer fikirler:** zamanlanmış tetikleyiciler
   ("her sabah şu raporu hazırla"), ajan hiyerarşisi.
7. **`data/` klasörü yedeklenmiyor.** Kullanıcı yanlışlıkla silerse projeler
   gider.

---

## 9. Kod okurken dikkat edilecekler

- `data/` klasörü **gitignore'da** — API anahtarları ve projeler orada, asla
  commit edilmemeli.
- Ajan kadrosu iki dosyaya ayrılmıştır: `src/config/agents.default.json`
  (şablon, git'te) ve `data/agents.json` (çalışma zamanı, git'te değil).
  Varsayılanları değiştirmek mevcut kurulumları etkilemez — kullanıcı
  Yönetim ekranındaki "Varsayılanlara Sıfırla" ile alabilir.
- Arayüz derleme adımı gerektirmez (düz HTML/CSS/JS). `public/office.js`
  ES modülü değildir, `window.PixelOffice` olarak global tanımlanır.
- Tüm kullanıcıya görünen metinler Türkçedir. Kod içi yorumlar Türkçe ama
  ASCII (Windows konsol uyumluluğu için betiklerde Türkçe karakter yok).
