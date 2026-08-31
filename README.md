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
  providers/             Saglayici soyutlamasi (Anthropic, OpenAI, anahtarsiz demo icin Mock)
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

## Ajan ekleme / cikarma

`src/config/agents.json` dosyasini duzenleyin. Her ajan icin:

- `provider`: `anthropic`, `openai` veya `mock`
- `model`: o saglayicidaki model kimligi
- `capabilities`: bu ajanin uzmanlik etiketleri (proje olustururken bu
  etiketlerle eslesen ajanlar tartismaya katilir)
- `deskPosition`: ofis izgarasinda `{x, y}` hucre konumu
- `tokenBudget`: bu ajanin donemlik token butcesi (asilinca otomatik devir tetiklenir)

Yeni bir saglayici eklemek icin `src/providers/` altina `Provider`
arayuzunu (`complete()`) uygulayan yeni bir sinif yazip `providers/index.ts`
icindeki fabrikaya ekleyin.

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
- Daha fazla saglayici (Google Gemini, Mistral, yerel modeller)
- Ajanlar arasi gercek zamanli/coklu-tur muzakere (su an sirali tek turlu)
- Masa animasyonlari, avatarlar icin gorsel iyilestirme
- Cok kullanicili kimlik dogrulama ve yetkilendirme
