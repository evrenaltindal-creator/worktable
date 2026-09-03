# AI Ofis

Birden fazla yapay zeka ajanini tek bir "sanal ofis" arayuzunden yonetmek icin
kucuk bir orkestrasyon platformu. Her ajanin bir masasi vardir; bir gorev
uzerinde calisirken durumu ("Calisiyor", "Tartisiyor", "Kota Doldu" ...)
masasinda gorunur. Bir proje olusturdugunuzda ilgili yetkinliklere sahip
ajanlar kendi aralarinda kisa bir tartisma yapar ve size tek bir nihai oneri
sunar. Bir ajanin token kotasi tukenmeye yaklastiginda gorev otomatik olarak
ayni isi yapabilecek baska bir ajana devredilir (handoff).

## Mimari

```
src/
  types.ts              Ajan / gorev / mesaj veri modelleri
  config/agents.json     Ofisteki ajan roster'i (isim, rol, saglayici, masa konumu, token butcesi)
  providers/             Saglayici soyutlamasi (Anthropic, OpenAI, Ollama/yerel modeller, anahtarsiz demo icin Mock)
  orchestrator/          Gorev atama, ajanlar arasi tartisma, senteze varma, token bazli devir
  server.ts              Express + WebSocket sunucusu (REST API + gercek zamanli guncellemeler)
public/                  Ofis arayuzu (masalar, sohbet paneli) - build adimi gerektirmez
```

Akis: `POST /api/tasks` -> Orchestrator ilgili yetkinliklere sahip ajanlari
sirayla cagirir -> her ajanin gorusu sohbet gecmisine eklenir -> lider ajan
(varsayilan: planlama yetkinligi olan) hepsini tek bir nihai oneriye
donusturur -> WebSocket ile arayuze aninda yansir.

## Kurulum

```bash
npm install
cp .env.example .env   # en az bir API anahtari girin (ANTHROPIC_API_KEY / OPENAI_API_KEY)
npm run dev
```

Tarayicida `http://localhost:3000` adresini acin. Hicbir API anahtari
girmezseniz ajanlar demo amacli sahte (mock) yanitlar uretir; uygulamanin
tum akisini (tartisma, oneri, devir) anahtarsiz da deneyebilirsiniz.

## Yonetim (admin) ekrani

`http://localhost:3000/admin.html` uzerinden ofisin tum yonetimi tek ekrandan
yapilir:

- **Ajanlar**: yeni ajan ekleme/duzenleme/silme, her ajana ozel **API anahtari**
  girme (bos birakilirsa saglayicinin genel `.env` anahtari kullanilir), model,
  yetkinlik etiketleri, masa konumu ve token butcesini degistirme. Anahtarlar
  sadece sunucu tarafinda `data/agents.json` icinde saklanir; API/arayuze asla
  geri donmez (sadece "anahtar var/yok" bilgisi gosterilir).
- **Projeler**: yeni proje/gorev yazma, devam eden projelerin sohbetini
  goruntuleme/mesaj yazma ve nihai oneriyi onaylama - "Ofis" ekranindakiyle
  ayni islevi buradan da yapabilirsiniz.

Ajan roster'i artik `src/config/agents.default.json` (ilk calistirmada
kopyalanan, anahtarsiz varsayilan sablon, git'e dahil) ile calisma zamaninda
duzenlenen `data/agents.json` (gitignore'da, gercek anahtarlari icerir) olarak
ikiye ayrilir. Var olan bir kurulumu sifirlamak icin `data/agents.json`
dosyasini silmeniz yeterli; bir sonraki baslatmada varsayilanlardan yeniden
olusturulur.

Yeni bir saglayici eklemek icin `src/providers/` altina `Provider`
arayuzunu (`complete()`) uygulayan yeni bir sinif yazip `providers/index.ts`
icindeki fabrikaya ekleyin.

## Yerel modeller (Ollama)

Kendi bilgisayarinizda `ollama serve` ile calisan bir modeli (orn.
`ollama pull qwen2.5-coder:7b`) ekibe katmak icin Yonetim ekraninda
"+ Yeni Ajan" ile saglayici olarak **ollama** secin, model adina
`qwen2.5-coder:7b` yazin ve "Sunucu Adresi" alanina Ollama'nin adresini
girin (varsayilan `http://localhost:11434`, bos birakilirsa bu kullanilir).
Ollama icin API anahtari gerekmez. Varsayilan roster'da ("Kaan" adiyla)
buna hazir bir ornek zaten var; eger daha once uygulamayi calistirdiysaniz
ve `data/agents.json` olusmussa, bu yeni varsayilani gormek icin ya o
dosyayi silip yeniden baslatin ya da ajani Yonetim ekranindan elle ekleyin.

AI Ofis sunucusu ile Ollama'nin **ayni bilgisayarda** calismasi gerekir
(varsayilan adres `localhost`); sunucuyu baska bir makinede/uzakta
calistiriyorsaniz "Sunucu Adresi" alanina Ollama'nin agdaki gercek
adresini (orn. `http://192.168.1.20:11434`) girmeniz gerekir.

## Token bazli otomatik devir

`Orchestrator` her ajanin kumulatif `tokensUsed / tokenBudget` oranini
izler. Oran `%90`'i gectiginde (`HANDOFF_THRESHOLD`, `src/orchestrator/Orchestrator.ts`)
veya saglayicidan hiz siniri/kota hatasi donduğunde, gorev ayni yetkinlige
sahip, kotasi musait baska bir ajana otomatik devredilir ve bu devir sohbet
gecmisine sistem mesaji olarak islenir.

## Uzaktan erisim / kontrol

Sunucu varsayilan olarak `0.0.0.0` uzerinde dinler, yani ayni ag icinden
veya bir tunel (Cloudflare Tunnel, ngrok, Tailscale Funnel vb.) araciligiyla
disaridan da erisilebilir. Internete acacaksaniz `.env` icindeki
`REMOTE_ACCESS_TOKEN` degerini doldurun; bu durumda hem API hem arayuz
`?token=GIZLI_DEGER` parametresi (veya `x-access-token` header'i) olmadan
erisilemez hale gelir. Bu basit bir koruma katmanidir; kalici/coklu
kullanicili bir kuruluma gecerken gercek bir kimlik dogrulama (orn. OAuth)
eklemeniz onerilir.

## Sonraki adimlar (yol haritasi fikirleri)

- Kalici depolama (su an gorevler/ajan durumu bellekte tutuluyor, sunucu
  yeniden baslayinca sifirlanir)
- Daha fazla saglayici (Google Gemini, Mistral vb.)
- Ajanlar arasi gercek zamanli/coklu-tur muzakere (su an sirali tek turlu)
- Masa animasyonlari, avatarlar icin gorsel iyilestirme
- Cok kullanicili kimlik dogrulama ve yetkilendirme
