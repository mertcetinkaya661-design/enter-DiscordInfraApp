# Discord Benzeri Uygulama - Plan

## Context
Kullanıcı Discord altyapısına benzer bir frontend uygulaması istiyor. Tam 4-kolon Discord düzeni, koyu tema, mock data ile çalışacak.

## Aesthetic Direction
- **Tema**: Discord'un karakteristik koyu renk paleti — derin gri-lacivert tonlar
- **Renkler**: `#313338` (bg), `#2B2D31` (sidebar), `#1E1F22` (sunucu listesi), `#5865F2` (blurple/brand), `#3BA55C` (yeşil/online)
- **Font**: `JetBrains Mono` display + `DM Sans` body — teknolojik ama insani
- **Motion**: Kanal geçişlerinde smooth fade, mesaj hover'da subtle lift

## Dosya Yapısı

### Yeni Dosyalar
- `src/data/mock.ts` — sunucular, kanallar, mesajlar, kullanıcılar için mock data
- `src/types/discord.ts` — TypeScript tipleri (Server, Channel, Message, User)
- `src/pages/App.tsx` — Ana Discord layout sayfası
- `src/components/discord/ServerSidebar.tsx` — Sol dar sidebar (sunucu ikonları)
- `src/components/discord/ChannelSidebar.tsx` — Kanal listesi + kategori grupları
- `src/components/discord/ChatArea.tsx` — Mesajlaşma alanı
- `src/components/discord/MessageInput.tsx` — Mesaj gönderme kutusu
- `src/components/discord/MembersSidebar.tsx` — Sağ üye listesi
- `src/components/discord/UserPanel.tsx` — Sol altta kullanıcı bilgisi + ses kontrolleri
- `src/components/discord/DMSidebar.tsx` — DM listesi (DM modu için)

### Değiştirilecek Dosyalar
- `src/index.css` — Discord renk sistemi token'ları
- `src/pages/Index.tsx` — App.tsx'e yönlendirme
- `tailwind.config.ts` — Discord token'larını ekle

## Bileşen Mimarisi

```
App.tsx (state: activeServer, activeChannel, activeView)
├── ServerSidebar (sunucu ikonları + DM butonu)
├── ChannelSidebar (kanallar, kategoriler, UserPanel)
│   └── DMSidebar (DM modunda)
├── ChatArea (mesajlar + MessageInput)
└── MembersSidebar (üye listesi)
```

## Mock Data İçeriği
- 4 sunucu (farklı ikonlar, isimler, kanallar)
- Her sunucuda 3-4 kategori, her kategoride 2-4 kanal (metin + ses)
- Her kanalda 15-20 mock mesaj, zaman damgaları ile
- 10-15 kullanıcı (online/offline/DND/idle durumları + roller)
- 3 DM konuşması

## Özellikler
- [x] Sunucu ikonları sol sidebar'da
- [x] Kanal listesi kategoriler halinde açılır/kapanır
- [x] Aktif kanal vurgulaması
- [x] Mesaj alanında scroll
- [x] Mesaj gönderme (mock — state'e ekle)
- [x] Kullanıcı durumu ikonları (online/offline/dnd/idle)
- [x] Sağda üye listesi
- [x] DM modu (sunucu listesinden DM'e geçiş)
- [x] Responsive tasarım

## Token'lar (index.css)
```css
--dc-bg: 220 8.9% 20%; /* #313338 */
--dc-sidebar: 220 6.7% 18.4%; /* #2B2D31 */
--dc-surface: 220 7.7% 13.3%; /* #1E1F22 */
--dc-brand: 235 85.6% 64.7%; /* #5865F2 */
--dc-green: 139 47.3% 43.9%; /* #3BA55C */
--dc-text-primary: 0 0% 98%;
--dc-text-muted: 215 8.8% 73.3%;
--dc-channel-hover: 220 6.7% 22%;
--dc-message-hover: 220 8.9% 21.6%;
```

## Verification
- Tüm 4 kolon görünür mü?
- Sunucu değiştirince kanallar değişiyor mu?
- Kanal değiştirince mesajlar değişiyor mu?
- Mesaj gönderilebiliyor mu (mock)?
- DM modu çalışıyor mu?
