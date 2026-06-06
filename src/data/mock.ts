import type { User, Server, DirectMessage, Message } from '../types/discord';

export const currentUser: User = {
  id: 'me',
  username: 'tilki_dev',
  displayName: 'Tilki Dev',
  avatar: '',
  status: 'online',
  customStatus: 'Kod yazıyorum 🦊',
};

export const users: User[] = [
  { id: 'u1', username: 'kara_kuyruk', displayName: 'Kara Kuyruk', avatar: '', status: 'online', customStatus: 'Oyun oynuyorum' },
  { id: 'u2', username: 'ateş_tilki', displayName: 'Ateş Tilki', avatar: '', status: 'idle' },
  { id: 'u3', username: 'buz_tilkisi', displayName: 'Buz Tilkisi', avatar: '', status: 'dnd', customStatus: 'Müzik yapıyorum' },
  { id: 'u4', username: 'gece_hayaleti', displayName: 'Gece Hayaleti', avatar: '', status: 'offline' },
  { id: 'u5', username: 'yumuşak_patiler', displayName: 'Yumuşak Patiler', avatar: '', status: 'online' },
  { id: 'u6', username: 'orman_koşucusu', displayName: 'Orman Koşucusu', avatar: '', status: 'online', customStatus: 'Bir sonraki versiyona hazırlanıyorum' },
  { id: 'u7', username: 'kayalık_zirve', displayName: 'Kayalık Zirve', avatar: '', status: 'idle' },
  { id: 'u8', username: 'gizli_iz', displayName: 'Gizli İz', avatar: '', status: 'dnd' },
  { id: 'u9', username: 'tunç_pençe', displayName: 'Tunç Pençe', avatar: '', status: 'online' },
  { id: 'u10', username: 'yıldız_avcısı', displayName: 'Yıldız Avcısı', avatar: '', status: 'offline' },
];

const makeMessages = (channelId: string): Message[] => {
  const pool: Message[] = [
    { id: `${channelId}-1`, author: users[0], content: 'Herkese merhaba! FIX\'e hoş geldiniz 🦊', timestamp: new Date(Date.now() - 3600000 * 5), reactions: [{ emoji: '🦊', count: 7 }, { emoji: '👋', count: 4 }] },
    { id: `${channelId}-2`, author: users[1], content: 'Sunucuya yeni katıldım, buradaki atmosfer harika!', timestamp: new Date(Date.now() - 3600000 * 4.5) },
    { id: `${channelId}-3`, author: users[2], content: 'Yeni proje üzerinde çalışıyorum, biraz yardım lazım olabilir mi?', timestamp: new Date(Date.now() - 3600000 * 4) },
    { id: `${channelId}-4`, author: users[0], content: 'Tabii yardımcı olabilirim! Ne tür bir proje bu?', timestamp: new Date(Date.now() - 3600000 * 3.8) },
    { id: `${channelId}-5`, author: users[2], content: 'React ile bir dashboard uygulaması. Grafik kütüphanesi konusunda öneriniz var mı?', timestamp: new Date(Date.now() - 3600000 * 3.5), reactions: [{ emoji: '💡', count: 3 }] },
    { id: `${channelId}-6`, author: users[4], content: 'Recharts veya Tremor denediniz mi? İkisi de çok iyi.', timestamp: new Date(Date.now() - 3600000 * 3) },
    { id: `${channelId}-7`, author: users[5], content: 'Ben Visx kullanıyorum, D3 tabanlı ama React friendly. Biraz öğrenme eğrisi var ama güçlü.', timestamp: new Date(Date.now() - 3600000 * 2.5) },
    { id: `${channelId}-8`, author: users[2], content: 'Harika, hepsine bakacağım. Teşekkürler!', timestamp: new Date(Date.now() - 3600000 * 2) },
    { id: `${channelId}-9`, author: users[3], content: 'Bu hafta toplantı var mı? Kaçırdım mı bir şey?', timestamp: new Date(Date.now() - 3600000 * 1.5) },
    { id: `${channelId}-10`, author: users[0], content: 'Evet Cuma 20:00\'de sesli kanalda görüşme planlandı.', timestamp: new Date(Date.now() - 3600000), reactions: [{ emoji: '✅', count: 5 }] },
    { id: `${channelId}-11`, author: users[6], content: 'Yeni sürüm notları çıktı mı? Bekleyenler var.', timestamp: new Date(Date.now() - 3600000 * 0.8) },
    { id: `${channelId}-12`, author: users[7], content: 'v2.3 bu hafta sonuna kadar çıkması planlanıyor.', timestamp: new Date(Date.now() - 3600000 * 0.5), edited: true },
    { id: `${channelId}-13`, author: users[8], content: 'Her zaman harika içerik paylaşıyorsunuz, teşekkürler!', timestamp: new Date(Date.now() - 3600000 * 0.2) },
    { id: `${channelId}-14`, author: users[1], content: 'Bugün çok verimli bir gündü. Neler yaptınız?', timestamp: new Date(Date.now() - 600000) },
    { id: `${channelId}-15`, author: currentUser, content: 'Ben de FIX üzerinde çalışıyordum. Tasarım mükemmel oldu!', timestamp: new Date(Date.now() - 300000), reactions: [{ emoji: '🔥', count: 8 }, { emoji: '💯', count: 3 }] },
  ];
  return pool;
};

export const servers: Server[] = [
  {
    id: 's1',
    name: 'FIX Merkez',
    acronym: 'FX',
    color: '#E8722A',
    unread: true,
    mention: 2,
    categories: [
      {
        id: 'c1-1', name: 'GENEL', channels: [
          { id: 'ch1', name: 'kurallar', type: 'announcement', topic: 'Sunucu kuralları burada.' },
          { id: 'ch2', name: 'duyurular', type: 'announcement', topic: 'Resmi duyurular' },
          { id: 'ch3', name: 'genel', type: 'text', topic: 'Genel sohbet kanalı', unread: true, mention: 2 },
          { id: 'ch4', name: 'off-topic', type: 'text', topic: 'Konu dışı her şey' },
        ]
      },
      {
        id: 'c1-2', name: 'GELİŞTİRME', channels: [
          { id: 'ch5', name: 'kod-paylaşım', type: 'text', topic: 'Kod parçacıklarını paylaşın', unread: true },
          { id: 'ch6', name: 'hatalar', type: 'text', topic: 'Hata bildirimleri' },
          { id: 'ch7', name: 'fikirler', type: 'text', topic: 'Yeni özellik fikirleri' },
        ]
      },
      {
        id: 'c1-3', name: 'SES KANALLARI', channels: [
          { id: 'ch8', name: 'Genel Sohbet', type: 'voice' },
          { id: 'ch9', name: 'Çalışma Odası', type: 'voice' },
          { id: 'ch10', name: 'Oyun Odası', type: 'voice' },
        ]
      },
    ],
    members: [
      { user: currentUser, role: 'owner' },
      { user: users[0], role: 'admin' },
      { user: users[1], role: 'mod' },
      { user: users[2], role: 'member' },
      { user: users[3], role: 'member' },
      { user: users[4], role: 'member' },
      { user: users[5], role: 'member' },
      { user: users[6], role: 'member' },
      { user: users[7], role: 'member' },
    ],
  },
  {
    id: 's2',
    name: 'Tilki Oyun Kulübü',
    acronym: 'TK',
    color: '#C0522A',
    categories: [
      {
        id: 'c2-1', name: 'OYUNLAR', channels: [
          { id: 'ch11', name: 'valorant', type: 'text', topic: 'Valorant konuşmaları' },
          { id: 'ch12', name: 'minecraft', type: 'text', unread: true },
          { id: 'ch13', name: 'cs2', type: 'text' },
        ]
      },
      {
        id: 'c2-2', name: 'SES', channels: [
          { id: 'ch14', name: 'Lobi', type: 'voice' },
          { id: 'ch15', name: 'Takım 1', type: 'voice' },
        ]
      },
    ],
    members: [
      { user: currentUser, role: 'admin' },
      { user: users[0], role: 'member' },
      { user: users[3], role: 'member' },
      { user: users[8], role: 'member' },
      { user: users[9], role: 'member' },
    ],
  },
  {
    id: 's3',
    name: 'Sanat Atölyesi',
    acronym: 'SA',
    color: '#8B3A1A',
    categories: [
      {
        id: 'c3-1', name: 'PAYLAŞIM', channels: [
          { id: 'ch16', name: 'eserler', type: 'text', topic: 'Sanat eserlerinizi paylaşın' },
          { id: 'ch17', name: 'feedback', type: 'text', topic: 'Geri bildirim alın' },
        ]
      },
    ],
    members: [
      { user: currentUser, role: 'member' },
      { user: users[2], role: 'owner' },
      { user: users[5], role: 'member' },
    ],
  },
  {
    id: 's4',
    name: 'Müzik Odası',
    acronym: 'MO',
    color: '#D4611E',
    mention: 1,
    categories: [
      {
        id: 'c4-1', name: 'MÜZİK', channels: [
          { id: 'ch18', name: 'şarkı-önerileri', type: 'text', mention: 1 },
          { id: 'ch19', name: 'çalma-listesi', type: 'text' },
        ]
      },
      {
        id: 'c4-2', name: 'DİNLEME ODASI', channels: [
          { id: 'ch20', name: 'Konser', type: 'voice' },
        ]
      },
    ],
    members: [
      { user: currentUser, role: 'member' },
      { user: users[4], role: 'owner' },
      { user: users[6], role: 'mod' },
    ],
  },
];

export const directMessages: DirectMessage[] = [
  {
    id: 'dm1',
    user: users[0],
    unread: 3,
    messages: [
      { id: 'dm1-1', author: users[0], content: 'Hey! Yeni projen nasıl gidiyor?', timestamp: new Date(Date.now() - 7200000) },
      { id: 'dm1-2', author: currentUser, content: 'Çok iyi gidiyor! FIX harika çıktı.', timestamp: new Date(Date.now() - 3600000) },
      { id: 'dm1-3', author: users[0], content: 'Harika! Bana bir demo gösterebilir misin?', timestamp: new Date(Date.now() - 1800000) },
      { id: 'dm1-4', author: users[0], content: 'Gerçekten merak ettim!', timestamp: new Date(Date.now() - 900000) },
    ],
  },
  {
    id: 'dm2',
    user: users[2],
    messages: [
      { id: 'dm2-1', author: users[2], content: 'Müzik ürettim, dinlemek ister misin?', timestamp: new Date(Date.now() - 86400000) },
      { id: 'dm2-2', author: currentUser, content: 'Tabii ki! Gönder.', timestamp: new Date(Date.now() - 80000000) },
    ],
  },
  {
    id: 'dm3',
    user: users[5],
    messages: [
      { id: 'dm3-1', author: users[5], content: 'Cuma toplantıya katılıyor musun?', timestamp: new Date(Date.now() - 172800000) },
      { id: 'dm3-2', author: currentUser, content: 'Evet katılıyorum!', timestamp: new Date(Date.now() - 170000000) },
    ],
  },
];

export const channelMessages: Record<string, Message[]> = {
  ch1: makeMessages('ch1'),
  ch2: makeMessages('ch2'),
  ch3: makeMessages('ch3'),
  ch4: makeMessages('ch4'),
  ch5: makeMessages('ch5'),
  ch6: makeMessages('ch6'),
  ch7: makeMessages('ch7'),
  ch11: makeMessages('ch11'),
  ch12: makeMessages('ch12'),
  ch13: makeMessages('ch13'),
  ch16: makeMessages('ch16'),
  ch17: makeMessages('ch17'),
  ch18: makeMessages('ch18'),
  ch19: makeMessages('ch19'),
};
