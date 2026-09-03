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

Varsayilan ekip tamamen **Ollama uzerinden calisan yerel modellerden**
olusur - hicbir API anahtari veya ucret gerektirmez:

```bash
# 1) Ollama kurulu degilse: https://ollama.com
ollama pull llama3.1:8b
ollama pull qwen2.5-coder:7b
ollama pull mistral:7b
ollama pull deepseek-coder:6.7b
ollama serve   # genelde kurulumdan sonra zaten arka planda calisir

# 2) Uygulama
npm install
cp .env.example .env   # bos birakabilirsiniz, hicbir sey girmeniz gerekmez
npm run dev
```

Tarayicida `http://localhost:3000` adresini acin. Isterseniz `.env`'e
`ANTHROPIC_API_KEY` / `OPENAI_API_KEY` ekleyip veya Yonetim ekranindan
ajanlara anahtar girip Claude/GPT gibi ucretli bulut modellerini de
ekibe katabilirsiniz, ama bu zorunlu degildir.

### Windows: tek dosyayla kurulum (git clone/npm install gerekmez)

`AI-Ofis-Ac.bat` dosyasi kendi kendine yeterlidir - projeyi onceden
indirmenize gerek yok. Dosyayi **dogrudan masaustune** koyup cift
tiklamaniz yeterli:

- Programi bilgisayarinizda bulamazsa once kendisi indirir (`git clone`),
  sonra bagimliliklari kurar (`npm install`). Kurulum konumu: `F:` diski
  varsa `F:\AI-Ofis` (C: dolu olan makineler icin), yoksa
  `%USERPROFILE%\AI-Ofis`.
- Bir sonraki tikladiginizda mevcut kurulumu bulup gunceller (`git pull`)
  ve dogrudan baslatir.
- Sunucuyu baslatip birkac saniye sonra tarayicinizda otomatik olarak
  `http://localhost:3000` acar.

Gereksinim: bilgisayarinizda **Git** (https://git-scm.com/downloads) ve
**Node.js** (https://nodejs.org) kurulu olmali - dosya bunlardan biri
eksikse size hangisini kurmaniz gerektigini soyler.

Sunucuyu durdurmek icin acilan siyah "AI Ofis Sunucu" penceresini
kapatmaniz yeterli.

(Ollama'nin ayrica `ollama serve` ile calisiyor olmasi gerekir - bunu
sisteme kurulumdan sonra genelde otomatik baslar; degilse Ollama
uygulamasini bir kez elle acmaniz yeterli.)

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

## Yerel modeller (Ollama) - varsayilan ve ucretsiz

Varsayilan 4 ajanin (Aylin, Kaan, Deniz, Mert) hepsi Ollama uzerinden
calisir, hicbir API anahtari gerektirmez:

| Ajan  | Rol                     | Model                  |
|-------|-------------------------|-------------------------|
| Aylin | Proje Yoneticisi        | `llama3.1:8b`           |
| Kaan  | Yazilim Muhendisi       | `qwen2.5-coder:7b`      |
| Deniz | Arastirmaci / Analist   | `mistral:7b`            |
| Mert  | Test ve Kalite Kontrol  | `deepseek-coder:6.7b`   |

Bu modelleri `ollama pull <model-adi>` ile indirip `ollama serve`'i
calistirdiginizda ekip hazir olur. Farkli bir model kullanmak isterseniz
Yonetim ekranindan ilgili ajani duzenleyip "Model" alanini degistirmeniz
yeterli (o modeli de once `ollama pull` ile indirmeniz gerekir).

Yeni bir Ollama ajani eklemek icin Yonetim ekraninda "+ Yeni Ajan" ile
saglayici olarak **ollama** secin, model adini yazin ve "Sunucu Adresi"
alanina Ollama'nin adresini girin (varsayilan `http://localhost:11434`,
bos birakilirsa bu kullanilir). Eger daha once uygulamayi calistirdiysaniz
ve eski (ucretli) varsayilanlarla bir `data/agents.json` olusmussa, yeni
ucretsiz varsayilanlari gormek icin o dosyayi silip yeniden baslatin.

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
