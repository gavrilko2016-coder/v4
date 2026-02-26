import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'uk' | 'ru' | 'de' | 'tr' | 'pt' | 'es' | 'fr' | 'it' | 'id' | 'hi';

export interface Translations {
  // Nav
  games: string;
  history: string;
  profile: string;
  wallet: string;
  earn: string;
  // Header
  deposit: string;
  online: string;
  // Account linking
  linkEmail: string;
  // Wallet/Finance
  withdraw: string;
  recentDeposits: string;
  accountSecurity: string;
  // Games
  chooseGame: string;
  liveJackpot: string;
  winBigIn: string;
  crypto: string;
  instantPayouts: string;
  comingSoon: string;
  dailyBonus: string;
  dailyBonusDesc: string;
  claim: string;
  placeBet: string;
  // Bet Controls
  balance: string;
  half: string;
  max: string;
  // Game tags
  classic: string;
  live: string;
  jackpot: string;
  casino: string;
  // History
  betHistory: string;
  bets: string;
  noBetsYet: string;
  noBetsDesc: string;
  win: string;
  loss: string;
  // Profile
  totalBets: string;
  wins: string;
  winRate: string;
  walletBalances: string;
  achievements: string;
  playResponsibly: string;
  settings: string;
  language: string;
  sound: string;
  on: string;
  off: string;
  // Deposit
  depositTitle: string;
  depositDesc: string;
  connectWallet: string;
  telegramStars: string;
  starsDesc: string;
  metamaskDesc: string;
  tonkeeperDesc: string;
  connected: string;
  connect: string;
  buyStars: string;
  starsAmount: string;
  processing: string;
  depositSuccess: string;
  depositFailed: string;
  // Blackjack
  hit: string;
  stand: string;
  dealerHand: string;
  yourHand: string;
  bust: string;
  blackjack: string;
  push: string;
  dealerWins: string;
  youWin: string;
  dealCards: string;
  // Dice
  rollDice: string;
  rolling: string;
  winChance: string;
  multiplier: string;
  mode: string;
  over: string;
  under: string;
  target: string;
  rollOver: string;
  rollUnder: string;
  // CoinFlip
  coinFlip: string;
  flipping: string;
  flipCoin: string;
  chooseSide: string;
  heads: string;
  tails: string;
  // Crash
  nextRoundIn: string;
  betPlaced: string;
  cashOut: string;
  crashedAt: string;
  cashedOutAt: string;
  noActiveBet: string;
  gameInProgress: string;
  crashed: string;
  // Slots
  spinning: string;
  spin: string;
  paytable: string;
  anyTwoMatch: string;
  // Roulette
  spinRoulette: string;
  chooseBet: string;
  red: string;
  black: string;
  green: string;
  odd: string;
  even: string;
  low: string;
  high: string;
}

const EN: Translations = {
  games: 'Games', history: 'History', profile: 'Profile', wallet: 'Wallet', earn: 'Earn',
  deposit: 'Deposit', online: 'Online', linkEmail: 'Link Email', withdraw: 'Withdraw', recentDeposits: 'Recent Deposits', accountSecurity: 'Account Security',
  chooseGame: 'Choose a Game', liveJackpot: 'Live Jackpot', winBigIn: 'Win Big in', crypto: 'Crypto!',
  instantPayouts: '5 games · Instant payouts · No KYC', comingSoon: 'Coming Soon',
  dailyBonus: 'Daily Bonus Available!', dailyBonusDesc: 'Claim 1 TON every day for free', claim: 'Claim',
  placeBet: 'Place Bet', balance: 'Balance', half: '½', max: 'Max',
  classic: 'Classic', live: 'Live', jackpot: 'Jackpot', casino: 'Casino',
  betHistory: 'Bet History', bets: 'bets', noBetsYet: 'No bets yet', noBetsDesc: 'Start playing to see your history here',
  win: 'Win', loss: 'Loss',
  totalBets: 'Total Bets', wins: 'Wins', winRate: 'Win Rate',
  walletBalances: 'Wallet Balances', achievements: 'Achievements', playResponsibly: '🛡 Play responsibly. Demo app — no real money.',
  settings: 'Settings', language: 'Language', sound: 'Sound', on: 'ON', off: 'OFF',
  depositTitle: 'Deposit Funds', depositDesc: 'Choose a payment method to top up your balance',
  connectWallet: 'Connect Wallet', telegramStars: 'Telegram Stars', starsDesc: 'Buy Stars and convert to game balance instantly',
  metamaskDesc: 'Connect your MetaMask wallet to deposit ETH/tokens',
  tonkeeperDesc: 'Connect TONKeeper to deposit TON instantly',
  connected: 'Connected', connect: 'Connect', buyStars: 'Buy Stars', starsAmount: 'Stars Amount',
  processing: 'Processing...', depositSuccess: 'Deposit Successful!', depositFailed: 'Deposit Failed',
  hit: 'Hit', stand: 'Stand', dealerHand: 'Dealer', yourHand: 'Your Hand',
  bust: 'BUST!', blackjack: 'BLACKJACK!', push: 'PUSH — Tie!', dealerWins: 'Dealer Wins', youWin: 'You Win!',
  dealCards: 'Deal Cards',
  rollDice: 'Roll Dice 🎲', rolling: 'Rolling...', winChance: 'Win Chance', multiplier: 'Multiplier',
  mode: 'Mode', over: 'Over', under: 'Under', target: 'Target', rollOver: 'Roll over', rollUnder: 'Roll under',
  coinFlip: 'Coin Flip', flipping: 'Flipping...', flipCoin: 'Flip Coin 🪙', chooseSide: 'Choose your side', heads: 'HEADS', tails: 'TAILS',
  nextRoundIn: 'Next round in', betPlaced: 'Bet placed', cashOut: 'Cash Out', crashedAt: 'Crashed at',
  cashedOutAt: 'Cashed out @', noActiveBet: 'No active bet', gameInProgress: 'Game in progress...', crashed: 'CRASHED!',
  spinning: 'Spinning...', spin: 'Spin 🎰', paytable: 'Paytable', anyTwoMatch: 'Any 2 match',
  spinRoulette: 'Spin Roulette 🎡', chooseBet: 'Choose your bet',
  red: 'Red', black: 'Black', green: '0 (Green)', odd: 'Odd', even: 'Even', low: '1–18', high: '19–36',
};

const UK: Translations = {
  games: 'Ігри', history: 'Історія', profile: 'Профіль', wallet: 'Гаманець', earn: 'Заробити',
  deposit: 'Поповнення', online: 'Онлайн', linkEmail: 'Привʼязати email', withdraw: 'Вивести', recentDeposits: 'Останні поповнення', accountSecurity: 'Безпека акаунта',
  chooseGame: 'Оберіть гру', liveJackpot: 'Живий Джекпот', winBigIn: 'Великий виграш у', crypto: 'Крипті!',
  instantPayouts: '5 ігор · Миттєві виплати · Без KYC', comingSoon: 'Незабаром',
  dailyBonus: 'Щоденний бонус!', dailyBonusDesc: 'Отримайте 1 TON щодня безкоштовно', claim: 'Забрати',
  placeBet: 'Зробити ставку', balance: 'Баланс', half: '½', max: 'Макс',
  classic: 'Класика', live: 'Живе', jackpot: 'Джекпот', casino: 'Казино',
  betHistory: 'Історія ставок', bets: 'ставок', noBetsYet: 'Ставок ще немає', noBetsDesc: 'Починайте грати, щоб побачити свою історію',
  win: 'Виграш', loss: 'Програш',
  totalBets: 'Всього ставок', wins: 'Виграші', winRate: 'Відсоток виграшів',
  walletBalances: 'Баланс гаманців', achievements: 'Досягнення', playResponsibly: '🛡 Грайте відповідально. Демо-застосунок.',
  settings: 'Налаштування', language: 'Мова', sound: 'Звук', on: 'ВКЛ', off: 'ВИКЛ',
  depositTitle: 'Поповнення рахунку', depositDesc: 'Оберіть спосіб поповнення балансу',
  connectWallet: 'Підключити гаманець', telegramStars: 'Telegram Stars', starsDesc: 'Придбайте Зірки та конвертуйте в ігровий баланс',
  metamaskDesc: 'Підключіть MetaMask для депозиту ETH/токенів',
  tonkeeperDesc: 'Підключіть TONKeeper для миттєвого депозиту TON',
  connected: 'Підключено', connect: 'Підключити', buyStars: 'Придбати Зірки', starsAmount: 'Кількість зірок',
  processing: 'Обробка...', depositSuccess: 'Поповнення успішне!', depositFailed: 'Помилка поповнення',
  hit: 'Ще', stand: 'Стоп', dealerHand: 'Дилер', yourHand: 'Ваша рука',
  bust: 'ПЕРЕБІР!', blackjack: 'БЛЕКДЖЕК!', push: 'НІЧИЯ!', dealerWins: 'Дилер виграв', youWin: 'Ви виграли!',
  dealCards: 'Роздати карти',
  rollDice: 'Кинути кубик 🎲', rolling: 'Кидаємо...', winChance: 'Шанс виграшу', multiplier: 'Множник',
  mode: 'Режим', over: 'Більше', under: 'Менше', target: 'Ціль', rollOver: 'Більше ніж', rollUnder: 'Менше ніж',
  coinFlip: 'Підкинути монету', flipping: 'Підкидаємо...', flipCoin: 'Підкинути 🪙', chooseSide: 'Оберіть сторону', heads: 'ОРЕЛ', tails: 'РЕШКА',
  nextRoundIn: 'Наступний раунд через', betPlaced: 'Ставку зроблено', cashOut: 'Забрати',
  cashedOutAt: 'Забрано @', noActiveBet: 'Немає активної ставки', gameInProgress: 'Гра триває...', crashed: 'ВПАВ!', crashedAt: 'Впав на',
  spinning: 'Крутимо...', spin: 'Крутити 🎰', paytable: 'Таблиця виплат', anyTwoMatch: 'Будь-які 2 однакові',
  spinRoulette: 'Крутити рулетку 🎡', chooseBet: 'Оберіть ставку',
  red: 'Червоне', black: 'Чорне', green: '0 (Зелене)', odd: 'Непарне', even: 'Парне', low: '1–18', high: '19–36',
};

const RU: Translations = {
  games: 'Игры', history: 'История', profile: 'Профиль', wallet: 'Кошелёк', earn: 'Заработать',
  deposit: 'Пополнить', online: 'Онлайн', linkEmail: 'Привязать email', withdraw: 'Вывести', recentDeposits: 'Недавние пополнения', accountSecurity: 'Безопасность аккаунта',
  chooseGame: 'Выберите игру', liveJackpot: 'Живой Джекпот', winBigIn: 'Выигрывайте в', crypto: 'Крипте!',
  instantPayouts: '5 игр · Мгновенные выплаты · Без KYC', comingSoon: 'Скоро',
  dailyBonus: 'Ежедневный бонус!', dailyBonusDesc: 'Получайте 1 TON каждый день бесплатно', claim: 'Забрать',
  placeBet: 'Сделать ставку', balance: 'Баланс', half: '½', max: 'Макс',
  classic: 'Классика', live: 'Живое', jackpot: 'Джекпот', casino: 'Казино',
  betHistory: 'История ставок', bets: 'ставок', noBetsYet: 'Ставок нет', noBetsDesc: 'Начните игру, чтобы видеть историю',
  win: 'Выигрыш', loss: 'Проигрыш',
  totalBets: 'Всего ставок', wins: 'Выигрыши', winRate: 'Процент побед',
  walletBalances: 'Баланс кошельков', achievements: 'Достижения', playResponsibly: '🛡 Играйте ответственно. Демо-приложение.',
  settings: 'Настройки', language: 'Язык', sound: 'Звук', on: 'ВКЛ', off: 'ВЫКЛ',
  depositTitle: 'Пополнение счёта', depositDesc: 'Выберите способ пополнения баланса',
  connectWallet: 'Подключить кошелёк', telegramStars: 'Telegram Stars', starsDesc: 'Купите Звёзды и конвертируйте в игровой баланс',
  metamaskDesc: 'Подключите MetaMask для депозита ETH/токенов',
  tonkeeperDesc: 'Подключите TONKeeper для мгновенного депозита TON',
  connected: 'Подключён', connect: 'Подключить', buyStars: 'Купить Звёзды', starsAmount: 'Количество звёзд',
  processing: 'Обработка...', depositSuccess: 'Пополнение успешно!', depositFailed: 'Ошибка пополнения',
  hit: 'Ещё', stand: 'Стоп', dealerHand: 'Дилер', yourHand: 'Ваша рука',
  bust: 'ПЕРЕБОР!', blackjack: 'БЛЕКДЖЕК!', push: 'НИЧЬЯ!', dealerWins: 'Дилер выиграл', youWin: 'Вы выиграли!',
  dealCards: 'Раздать карты',
  rollDice: 'Бросить кубик 🎲', rolling: 'Бросаем...', winChance: 'Шанс выигрыша', multiplier: 'Множитель',
  mode: 'Режим', over: 'Больше', under: 'Меньше', target: 'Цель', rollOver: 'Больше чем', rollUnder: 'Меньше чем',
  coinFlip: 'Подбросить монету', flipping: 'Подбрасываем...', flipCoin: 'Подбросить 🪙', chooseSide: 'Выберите сторону', heads: 'ОРЁЛ', tails: 'РЕШКА',
  nextRoundIn: 'Следующий раунд через', betPlaced: 'Ставка сделана', cashOut: 'Забрать',
  cashedOutAt: 'Забрано @', noActiveBet: 'Нет активной ставки', gameInProgress: 'Игра идёт...', crashed: 'УПАЛ!', crashedAt: 'Упал на',
  spinning: 'Крутим...', spin: 'Крутить 🎰', paytable: 'Таблица выплат', anyTwoMatch: 'Любые 2 одинаковых',
  spinRoulette: 'Крутить рулетку 🎡', chooseBet: 'Выберите ставку',
  red: 'Красное', black: 'Чёрное', green: '0 (Зелёное)', odd: 'Нечётное', even: 'Чётное', low: '1–18', high: '19–36',
};

const DE: Translations = {
  games: 'Spiele', history: 'Verlauf', profile: 'Profil', wallet: 'Wallet', earn: 'Verdienen',
  deposit: 'Einzahlung', online: 'Online', linkEmail: 'E-Mail verknüpfen', withdraw: 'Auszahlen', recentDeposits: 'Letzte Einzahlungen', accountSecurity: 'Kontosicherheit',
  chooseGame: 'Spiel wählen', liveJackpot: 'Live Jackpot', winBigIn: 'Groß gewinnen in', crypto: 'Krypto!',
  instantPayouts: '5 Spiele · Sofortige Auszahlung · Kein KYC', comingSoon: 'Demnächst',
  dailyBonus: 'Täglicher Bonus!', dailyBonusDesc: 'Täglich 1 TON kostenlos beanspruchen', claim: 'Beanspruchen',
  placeBet: 'Wette platzieren', balance: 'Guthaben', half: '½', max: 'Max',
  classic: 'Klassik', live: 'Live', jackpot: 'Jackpot', casino: 'Casino',
  betHistory: 'Wettverlauf', bets: 'Wetten', noBetsYet: 'Noch keine Wetten', noBetsDesc: 'Spielen Sie, um Ihren Verlauf zu sehen',
  win: 'Gewinn', loss: 'Verlust',
  totalBets: 'Wetten gesamt', wins: 'Gewinne', winRate: 'Gewinnrate',
  walletBalances: 'Wallet-Guthaben', achievements: 'Errungenschaften', playResponsibly: '🛡 Spielen Sie verantwortungsbewusst. Demo-App.',
  settings: 'Einstellungen', language: 'Sprache', sound: 'Sound', on: 'AN', off: 'AUS',
  depositTitle: 'Einzahlung', depositDesc: 'Wählen Sie eine Zahlungsmethode',
  connectWallet: 'Wallet verbinden', telegramStars: 'Telegram Stars', starsDesc: 'Stars kaufen und in Spielguthaben umwandeln',
  metamaskDesc: 'MetaMask verbinden für ETH/Token-Einzahlungen',
  tonkeeperDesc: 'TONKeeper verbinden für sofortige TON-Einzahlungen',
  connected: 'Verbunden', connect: 'Verbinden', buyStars: 'Stars kaufen', starsAmount: 'Stars-Menge',
  processing: 'Verarbeitung...', depositSuccess: 'Einzahlung erfolgreich!', depositFailed: 'Einzahlung fehlgeschlagen',
  hit: 'Karte', stand: 'Halten', dealerHand: 'Dealer', yourHand: 'Ihre Hand',
  bust: 'ÜBERKAUFT!', blackjack: 'BLACKJACK!', push: 'UNENTSCHIEDEN!', dealerWins: 'Dealer gewinnt', youWin: 'Sie gewinnen!',
  dealCards: 'Karten ausgeben',
  rollDice: 'Würfeln 🎲', rolling: 'Würfeln...', winChance: 'Gewinnchance', multiplier: 'Multiplikator',
  mode: 'Modus', over: 'Über', under: 'Unter', target: 'Ziel', rollOver: 'Würfeln über', rollUnder: 'Würfeln unter',
  coinFlip: 'Münze werfen', flipping: 'Werfen...', flipCoin: 'Münze werfen 🪙', chooseSide: 'Seite wählen', heads: 'KOPF', tails: 'ZAHL',
  nextRoundIn: 'Nächste Runde in', betPlaced: 'Wette platziert', cashOut: 'Auszahlen',
  cashedOutAt: 'Ausgezahlt @', noActiveBet: 'Keine aktive Wette', gameInProgress: 'Spiel läuft...', crashed: 'ABGESTÜRZT!', crashedAt: 'Abgestürzt bei',
  spinning: 'Dreht...', spin: 'Drehen 🎰', paytable: 'Auszahlungstabelle', anyTwoMatch: 'Jede 2 gleiche',
  spinRoulette: 'Roulette drehen 🎡', chooseBet: 'Wette wählen',
  red: 'Rot', black: 'Schwarz', green: '0 (Grün)', odd: 'Ungerade', even: 'Gerade', low: '1–18', high: '19–36',
};

const TR: Translations = {
  games: 'Oyunlar', history: 'Geçmiş', profile: 'Profil', wallet: 'Cüzdan', earn: 'Kazanç',
  deposit: 'Para Yatır', online: 'Çevrimiçi', linkEmail: 'E-postayı bağla', withdraw: 'Çek', recentDeposits: 'Son yatırımlar', accountSecurity: 'Hesap güvenliği',
  chooseGame: 'Oyun Seç', liveJackpot: 'Canlı Jackpot', winBigIn: 'Büyük Kazan', crypto: 'Kripto!',
  instantPayouts: '5 oyun · Anlık ödeme · KYC yok', comingSoon: 'Yakında',
  dailyBonus: 'Günlük Bonus!', dailyBonusDesc: 'Her gün ücretsiz 1 TON al', claim: 'Al',
  placeBet: 'Bahis Yap', balance: 'Bakiye', half: '½', max: 'Maks',
  classic: 'Klasik', live: 'Canlı', jackpot: 'Jackpot', casino: 'Kumarhane',
  betHistory: 'Bahis Geçmişi', bets: 'bahis', noBetsYet: 'Henüz bahis yok', noBetsDesc: 'Geçmişi görmek için oynamaya başlayın',
  win: 'Kazanç', loss: 'Kayıp',
  totalBets: 'Toplam Bahis', wins: 'Kazananlar', winRate: 'Kazanma Oranı',
  walletBalances: 'Cüzdan Bakiyeleri', achievements: 'Başarılar', playResponsibly: '🛡 Sorumlu oynayın. Demo uygulama.',
  settings: 'Ayarlar', language: 'Dil', sound: 'Ses', on: 'AÇIK', off: 'KAPALI',
  depositTitle: 'Para Yatır', depositDesc: 'Ödeme yöntemi seçin',
  connectWallet: 'Cüzdan Bağla', telegramStars: 'Telegram Yıldızları', starsDesc: 'Yıldız satın al ve oyun bakiyesine dönüştür',
  metamaskDesc: 'ETH/token yatırmak için MetaMask bağla',
  tonkeeperDesc: 'Anlık TON yatırmak için TONKeeper bağla',
  connected: 'Bağlandı', connect: 'Bağlan', buyStars: 'Yıldız Al', starsAmount: 'Yıldız Miktarı',
  processing: 'İşleniyor...', depositSuccess: 'Para Yatırma Başarılı!', depositFailed: 'Para Yatırma Başarısız',
  hit: 'Kart Al', stand: 'Dur', dealerHand: 'Krupiye', yourHand: 'Eliniz',
  bust: 'PATLAMA!', blackjack: 'BLACKJACK!', push: 'BERABERE!', dealerWins: 'Krupiye Kazandı', youWin: 'Kazandınız!',
  dealCards: 'Kart Dağıt',
  rollDice: 'Zar At 🎲', rolling: 'Atılıyor...', winChance: 'Kazanma Şansı', multiplier: 'Çarpan',
  mode: 'Mod', over: 'Üstünde', under: 'Altında', target: 'Hedef', rollOver: 'Üstünde at', rollUnder: 'Altında at',
  coinFlip: 'Yazı Tura', flipping: 'Atılıyor...', flipCoin: 'Yazı Tura 🪙', chooseSide: 'Taraf seç', heads: 'YAZI', tails: 'TURA',
  nextRoundIn: 'Sonraki tur', betPlaced: 'Bahis yapıldı', cashOut: 'Çek',
  cashedOutAt: 'Çekildi @', noActiveBet: 'Aktif bahis yok', gameInProgress: 'Oyun devam ediyor...', crashed: 'ÇAKTI!', crashedAt: 'Çakıldı',
  spinning: 'Dönüyor...', spin: 'Döndür 🎰', paytable: 'Ödeme Tablosu', anyTwoMatch: 'Herhangi 2 aynı',
  spinRoulette: 'Rulet Döndür 🎡', chooseBet: 'Bahis seç',
  red: 'Kırmızı', black: 'Siyah', green: '0 (Yeşil)', odd: 'Tek', even: 'Çift', low: '1–18', high: '19–36',
};

const PT: Translations = {
  games: 'Jogos', history: 'Histórico', profile: 'Perfil', wallet: 'Carteira', earn: 'Ganhar',
  deposit: 'Depositar', online: 'Online', linkEmail: 'Vincular e-mail', withdraw: 'Sacar', recentDeposits: 'Depósitos recentes', accountSecurity: 'Segurança da conta',
  chooseGame: 'Escolha um Jogo', liveJackpot: 'Jackpot ao Vivo', winBigIn: 'Ganhe Grande em', crypto: 'Cripto!',
  instantPayouts: '5 jogos · Pagamentos instantâneos · Sem KYC', comingSoon: 'Em Breve',
  dailyBonus: 'Bônus Diário!', dailyBonusDesc: 'Claim 10 TON todos os dias de graça', claim: 'Receber',
  placeBet: 'Apostar', balance: 'Saldo', half: '½', max: 'Máx',
  classic: 'Clássico', live: 'Ao Vivo', jackpot: 'Jackpot', casino: 'Cassino',
  betHistory: 'Histórico de Apostas', bets: 'apostas', noBetsYet: 'Sem apostas ainda', noBetsDesc: 'Comece a jogar para ver seu histórico',
  win: 'Vitória', loss: 'Derrota',
  totalBets: 'Total de Apostas', wins: 'Vitórias', winRate: 'Taxa de Vitória',
  walletBalances: 'Saldos da Carteira', achievements: 'Conquistas', playResponsibly: '🛡 Jogue com responsabilidade. App demonstração.',
  settings: 'Configurações', language: 'Idioma', sound: 'Som', on: 'LIGADO', off: 'DESLIGADO',
  depositTitle: 'Depositar Fundos', depositDesc: 'Escolha um método de pagamento',
  connectWallet: 'Conectar Carteira', telegramStars: 'Telegram Stars', starsDesc: 'Compre Stars e converta em saldo instantaneamente',
  metamaskDesc: 'Conecte MetaMask para depositar ETH/tokens',
  tonkeeperDesc: 'Conecte TONKeeper para depositar TON instantaneamente',
  connected: 'Conectado', connect: 'Conectar', buyStars: 'Comprar Stars', starsAmount: 'Quantidade de Stars',
  processing: 'Processando...', depositSuccess: 'Depósito Realizado!', depositFailed: 'Depósito Falhou',
  hit: 'Pedir', stand: 'Parar', dealerHand: 'Dealer', yourHand: 'Sua Mão',
  bust: 'BUST!', blackjack: 'BLACKJACK!', push: 'EMPATE!', dealerWins: 'Dealer Venceu', youWin: 'Você Venceu!',
  dealCards: 'Distribuir Cartas',
  rollDice: 'Rolar Dado 🎲', rolling: 'Rolando...', winChance: 'Chance de Ganhar', multiplier: 'Multiplicador',
  mode: 'Modo', over: 'Acima', under: 'Abaixo', target: 'Alvo', rollOver: 'Rolar acima', rollUnder: 'Rolar abaixo',
  coinFlip: 'Cara ou Coroa', flipping: 'Lançando...', flipCoin: 'Lançar 🪙', chooseSide: 'Escolha o lado', heads: 'CARA', tails: 'COROA',
  nextRoundIn: 'Próxima rodada em', betPlaced: 'Aposta feita', cashOut: 'Retirar',
  cashedOutAt: 'Retirado @', noActiveBet: 'Sem aposta ativa', gameInProgress: 'Jogo em andamento...', crashed: 'CAIU!', crashedAt: 'Caiu em',
  spinning: 'Girando...', spin: 'Girar 🎰', paytable: 'Tabela de Pagamentos', anyTwoMatch: 'Quaisquer 2 iguais',
  spinRoulette: 'Girar Roleta 🎡', chooseBet: 'Escolha sua aposta',
  red: 'Vermelho', black: 'Preto', green: '0 (Verde)', odd: 'Ímpar', even: 'Par', low: '1–18', high: '19–36',
};

const ES: Translations = {
  games: 'Juegos', history: 'Historial', profile: 'Perfil', wallet: 'Billetera', earn: 'Ganar',
  deposit: 'Depósito', online: 'En línea', linkEmail: 'Vincular correo', withdraw: 'Retirar', recentDeposits: 'Depósitos recientes', accountSecurity: 'Seguridad de la cuenta',
  chooseGame: 'Elige un juego', liveJackpot: 'Bote en vivo', winBigIn: 'Gana a lo grande en', crypto: '¡Cripto!',
  instantPayouts: '5 juegos · Pagos instantáneos · Sin KYC', comingSoon: 'Próximamente',
  dailyBonus: '¡Bono diario!', dailyBonusDesc: 'Reclama 1 estrella gratis cada día', claim: 'Reclamar',
  placeBet: 'Apostar', balance: 'Saldo', half: '½', max: 'Max',
  classic: 'Clásico', live: 'En vivo', jackpot: 'Bote', casino: 'Casino',
  betHistory: 'Historial de apuestas', bets: 'apuestas', noBetsYet: 'Aún no hay apuestas', noBetsDesc: 'Empieza a jugar para ver tu historial',
  win: 'Ganar', loss: 'Perder',
  totalBets: 'Apuestas totales', wins: 'Victorias', winRate: 'Tasa de victoria',
  walletBalances: 'Saldos de billetera', achievements: 'Logros', playResponsibly: '🛡 Juega responsablemente. App demo.',
  settings: 'Ajustes', language: 'Idioma', sound: 'Sonido', on: 'ENC', off: 'APAG',
  depositTitle: 'Depositar fondos', depositDesc: 'Elige un método de pago',
  connectWallet: 'Conectar billetera', telegramStars: 'Estrellas de Telegram', starsDesc: 'Compra Estrellas y conviértelas en saldo',
  metamaskDesc: 'Conecta MetaMask para depositar ETH/tokens',
  tonkeeperDesc: 'Conecta TONKeeper para depositar TON',
  connected: 'Conectado', connect: 'Conectar', buyStars: 'Comprar Estrellas', starsAmount: 'Cantidad de Estrellas',
  processing: 'Procesando...', depositSuccess: '¡Depósito exitoso!', depositFailed: 'Depósito fallido',
  hit: 'Pedir', stand: 'Plantarse', dealerHand: 'Crupier', yourHand: 'Tu mano',
  bust: '¡PASADO!', blackjack: '¡BLACKJACK!', push: 'EMPATE', dealerWins: 'Gana el crupier', youWin: '¡Ganaste!',
  dealCards: 'Repartir cartas',
  rollDice: 'Lanzar dado 🎲', rolling: 'Lanzando...', winChance: 'Probabilidad', multiplier: 'Multiplicador',
  mode: 'Modo', over: 'Más de', under: 'Menos de', target: 'Objetivo', rollOver: 'Lanzar más de', rollUnder: 'Lanzar menos de',
  coinFlip: 'Cara o Cruz', flipping: 'Lanzando...', flipCoin: 'Lanzar moneda 🪙', chooseSide: 'Elige lado', heads: 'CARA', tails: 'CRUZ',
  nextRoundIn: 'Próxima ronda en', betPlaced: 'Apuesta realizada', cashOut: 'Retirar',
  cashedOutAt: 'Retirado @', noActiveBet: 'Sin apuesta activa', gameInProgress: 'Juego en curso...', crashed: '¡CHOCÓ!', crashedAt: 'Chocó en',
  spinning: 'Girando...', spin: 'Girar 🎰', paytable: 'Tabla de pagos', anyTwoMatch: 'Cualquier 2 igual',
  spinRoulette: 'Girar Ruleta 🎡', chooseBet: 'Elige apuesta',
  red: 'Rojo', black: 'Negro', green: '0 (Verde)', odd: 'Impar', even: 'Par', low: '1–18', high: '19–36',
};

const FR: Translations = {
  games: 'Jeux', history: 'Historique', profile: 'Profil', wallet: 'Portefeuille', earn: 'Gagner',
  deposit: 'Dépôt', online: 'En ligne', linkEmail: 'Lier l’e‑mail', withdraw: 'Retrait', recentDeposits: 'Dépôts récents', accountSecurity: 'Sécurité du compte',
  chooseGame: 'Choisir un jeu', liveJackpot: 'Jackpot en direct', winBigIn: 'Gagnez gros en', crypto: 'Crypto !',
  instantPayouts: '5 jeux · Paiements instantanés · Pas de KYC', comingSoon: 'Bientôt',
  dailyBonus: 'Bonus quotidien !', dailyBonusDesc: 'Réclamez 1 étoile gratuitement chaque jour', claim: 'Réclamer',
  placeBet: 'Parier', balance: 'Solde', half: '½', max: 'Max',
  classic: 'Classique', live: 'En direct', jackpot: 'Jackpot', casino: 'Casino',
  betHistory: 'Historique des paris', bets: 'paris', noBetsYet: 'Aucun pari', noBetsDesc: 'Commencez à jouer pour voir votre historique',
  win: 'Gain', loss: 'Perte',
  totalBets: 'Total des paris', wins: 'Gains', winRate: 'Taux de victoire',
  walletBalances: 'Soldes du portefeuille', achievements: 'Succès', playResponsibly: '🛡 Jouez responsablement. App démo.',
  settings: 'Paramètres', language: 'Langue', sound: 'Son', on: 'ON', off: 'OFF',
  depositTitle: 'Dépôt de fonds', depositDesc: 'Choisissez une méthode de paiement',
  connectWallet: 'Connecter le portefeuille', telegramStars: 'Étoiles Telegram', starsDesc: 'Achetez des Étoiles et convertissez-les',
  metamaskDesc: 'Connectez MetaMask pour déposer ETH/tokens',
  tonkeeperDesc: 'Connectez TONKeeper pour déposer TON',
  connected: 'Connecté', connect: 'Connecter', buyStars: 'Acheter des Étoiles', starsAmount: 'Montant d\'Étoiles',
  processing: 'Traitement...', depositSuccess: 'Dépôt réussi !', depositFailed: 'Échec du dépôt',
  hit: 'Tirer', stand: 'Rester', dealerHand: 'Croupier', yourHand: 'Votre main',
  bust: 'SAUTÉ !', blackjack: 'BLACKJACK !', push: 'ÉGALITÉ', dealerWins: 'Le croupier gagne', youWin: 'Vous gagnez !',
  dealCards: 'Distribuer',
  rollDice: 'Lancer le dé 🎲', rolling: 'Lancement...', winChance: 'Chance de gain', multiplier: 'Multiplicateur',
  mode: 'Mode', over: 'Plus de', under: 'Moins de', target: 'Cible', rollOver: 'Lancer plus de', rollUnder: 'Lancer moins de',
  coinFlip: 'Pile ou Face', flipping: 'Lancement...', flipCoin: 'Lancer pièce 🪙', chooseSide: 'Choisir le côté', heads: 'FACE', tails: 'PILE',
  nextRoundIn: 'Prochain tour dans', betPlaced: 'Pari placé', cashOut: 'Encaisser',
  cashedOutAt: 'Encaissé @', noActiveBet: 'Pas de pari actif', gameInProgress: 'Jeu en cours...', crashed: 'CRASH !', crashedAt: 'Crash à',
  spinning: 'Rotation...', spin: 'Tourner 🎰', paytable: 'Table de paiement', anyTwoMatch: '2 identiques',
  spinRoulette: 'Tourner Roulette 🎡', chooseBet: 'Choisir pari',
  red: 'Rouge', black: 'Noir', green: '0 (Vert)', odd: 'Impair', even: 'Pair', low: '1–18', high: '19–36',
};

const IT: Translations = {
  games: 'Giochi', history: 'Cronologia', profile: 'Profilo', wallet: 'Portafoglio', earn: 'Guadagna',
  deposit: 'Deposito', online: 'Online', linkEmail: 'Collega email', withdraw: 'Prelievo', recentDeposits: 'Depositi recenti', accountSecurity: 'Sicurezza account',
  chooseGame: 'Scegli un gioco', liveJackpot: 'Jackpot dal vivo', winBigIn: 'Vinci alla grande in', crypto: 'Cripto!',
  instantPayouts: '5 giochi · Pagamenti istantanei · No KYC', comingSoon: 'Presto',
  dailyBonus: 'Bonus giornaliero!', dailyBonusDesc: 'Richiedi 1 stella gratis ogni giorno', claim: 'Richiedi',
  placeBet: 'Scommetti', balance: 'Saldo', half: '½', max: 'Max',
  classic: 'Classico', live: 'Dal vivo', jackpot: 'Jackpot', casino: 'Casinò',
  betHistory: 'Cronologia scommesse', bets: 'scommesse', noBetsYet: 'Nessuna scommessa', noBetsDesc: 'Inizia a giocare per vedere la cronologia',
  win: 'Vincita', loss: 'Perdita',
  totalBets: 'Scommesse totali', wins: 'Vincite', winRate: 'Percentuale vincite',
  walletBalances: 'Saldi portafoglio', achievements: 'Obiettivi', playResponsibly: '🛡 Gioca responsabilmente. App demo.',
  settings: 'Impostazioni', language: 'Lingua', sound: 'Suono', on: 'ON', off: 'OFF',
  depositTitle: 'Deposita fondi', depositDesc: 'Scegli un metodo di pagamento',
  connectWallet: 'Connetti portafoglio', telegramStars: 'Stelle Telegram', starsDesc: 'Compra Stelle e convertile in saldo',
  metamaskDesc: 'Connetti MetaMask per depositare ETH/token',
  tonkeeperDesc: 'Connetti TONKeeper per depositare TON',
  connected: 'Connesso', connect: 'Connetti', buyStars: 'Compra Stelle', starsAmount: 'Quantità Stelle',
  processing: 'Elaborazione...', depositSuccess: 'Deposito riuscito!', depositFailed: 'Deposito fallito',
  hit: 'Carta', stand: 'Stai', dealerHand: 'Banco', yourHand: 'Tua mano',
  bust: 'SBALLATO!', blackjack: 'BLACKJACK!', push: 'PAREGGIO', dealerWins: 'Vince il banco', youWin: 'Hai vinto!',
  dealCards: 'Dai carte',
  rollDice: 'Lancia dado 🎲', rolling: 'Lancio...', winChance: 'Probabilità', multiplier: 'Moltiplicatore',
  mode: 'Modalità', over: 'Sopra', under: 'Sotto', target: 'Obiettivo', rollOver: 'Lancia sopra', rollUnder: 'Lancia sotto',
  coinFlip: 'Testa o Croce', flipping: 'Lancio...', flipCoin: 'Lancia moneta 🪙', chooseSide: 'Scegli lato', heads: 'TESTA', tails: 'CROCE',
  nextRoundIn: 'Prossimo round in', betPlaced: 'Scommessa piazzata', cashOut: 'Incassa',
  cashedOutAt: 'Incassato @', noActiveBet: 'Nessuna scommessa', gameInProgress: 'Gioco in corso...', crashed: 'SCHIANTATO!', crashedAt: 'Schiantato a',
  spinning: 'Giro...', spin: 'Gira 🎰', paytable: 'Tabella pagamenti', anyTwoMatch: 'Qualsiasi 2 uguali',
  spinRoulette: 'Gira Roulette 🎡', chooseBet: 'Scegli puntata',
  red: 'Rosso', black: 'Nero', green: '0 (Verde)', odd: 'Dispari', even: 'Pari', low: '1–18', high: '19–36',
};

const ID: Translations = {
  games: 'Permainan', history: 'Riwayat', profile: 'Profil', wallet: 'Dompet', earn: 'Dapatkan',
  deposit: 'Setoran', online: 'Online', linkEmail: 'Tautkan email', withdraw: 'Tarik', recentDeposits: 'Setoran terbaru', accountSecurity: 'Keamanan akun',
  chooseGame: 'Pilih Permainan', liveJackpot: 'Jackpot Langsung', winBigIn: 'Menang Besar di', crypto: 'Kripto!',
  instantPayouts: '5 permainan · Pembayaran instan · Tanpa KYC', comingSoon: 'Segera',
  dailyBonus: 'Bonus Harian!', dailyBonusDesc: 'Klaim 1 Bintang gratis setiap hari', claim: 'Klaim',
  placeBet: 'Pasang Taruhan', balance: 'Saldo', half: '½', max: 'Maks',
  classic: 'Klasik', live: 'Langsung', jackpot: 'Jackpot', casino: 'Kasino',
  betHistory: 'Riwayat Taruhan', bets: 'taruhan', noBetsYet: 'Belum ada taruhan', noBetsDesc: 'Mulai main untuk lihat riwayat',
  win: 'Menang', loss: 'Kalah',
  totalBets: 'Total Taruhan', wins: 'Kemenangan', winRate: 'Rasio Menang',
  walletBalances: 'Saldo Dompet', achievements: 'Pencapaian', playResponsibly: '🛡 Main bertanggung jawab. App demo.',
  settings: 'Pengaturan', language: 'Bahasa', sound: 'Suara', on: 'ON', off: 'OFF',
  depositTitle: 'Setor Dana', depositDesc: 'Pilih metode pembayaran',
  connectWallet: 'Hubungkan Dompet', telegramStars: 'Bintang Telegram', starsDesc: 'Beli Bintang dan konversi ke saldo',
  metamaskDesc: 'Hubungkan MetaMask untuk setor ETH/token',
  tonkeeperDesc: 'Hubungkan TONKeeper untuk setor TON',
  connected: 'Terhubung', connect: 'Hubungkan', buyStars: 'Beli Bintang', starsAmount: 'Jumlah Bintang',
  processing: 'Memproses...', depositSuccess: 'Setoran Berhasil!', depositFailed: 'Setoran Gagal',
  hit: 'Tambah', stand: 'Berhenti', dealerHand: 'Bandar', yourHand: 'Kartu Anda',
  bust: 'HANGUS!', blackjack: 'BLACKJACK!', push: 'SERI!', dealerWins: 'Bandar Menang', youWin: 'Anda Menang!',
  dealCards: 'Bagi Kartu',
  rollDice: 'Lempar Dadu 🎲', rolling: 'Melempar...', winChance: 'Peluang Menang', multiplier: 'Pengali',
  mode: 'Mode', over: 'Di Atas', under: 'Di Bawah', target: 'Target', rollOver: 'Lempar di atas', rollUnder: 'Lempar di bawah',
  coinFlip: 'Koin', flipping: 'Melempar...', flipCoin: 'Lempar Koin 🪙', chooseSide: 'Pilih sisi', heads: 'KEPALA', tails: 'EKOR',
  nextRoundIn: 'Ronde berikut', betPlaced: 'Taruhan dipasang', cashOut: 'Cairkan',
  cashedOutAt: 'Dicairkan @', noActiveBet: 'Tak ada taruhan', gameInProgress: 'Permainan jalan...', crashed: 'JATUH!', crashedAt: 'Jatuh di',
  spinning: 'Berputar...', spin: 'Putar 🎰', paytable: 'Tabel Bayar', anyTwoMatch: 'Cocokkan 2',
  spinRoulette: 'Putar Roulette 🎡', chooseBet: 'Pilih taruhan',
  red: 'Merah', black: 'Hitam', green: '0 (Hijau)', odd: 'Ganjil', even: 'Genap', low: '1–18', high: '19–36',
};

const HI: Translations = {
  games: 'खेल', history: 'इतिहास', profile: 'प्रोफाइल', wallet: 'वॉलेट', earn: 'कमाएँ',
  deposit: 'जमा करें', online: 'ऑनलाइन', linkEmail: 'ईमेल जोड़ें', withdraw: 'निकासी', recentDeposits: 'हालिया जमा', accountSecurity: 'खाते की सुरक्षा',
  chooseGame: 'खेल चुनें', liveJackpot: 'लाइव जैकपॉट', winBigIn: 'बड़ा जीतें', crypto: 'क्रिप्टो!',
  instantPayouts: '5 खेल · तत्काल भुगतान · कोई KYC नहीं', comingSoon: 'जल्द आ रहा है',
  dailyBonus: 'दैनिक बोनस!', dailyBonusDesc: 'रोज़ 1 स्टार मुफ़्त पाएं', claim: 'दावा करें',
  placeBet: 'सट्टा लगाएं', balance: 'शेष', half: '½', max: 'अधिकतम',
  classic: 'क्लासिक', live: 'लाइव', jackpot: 'जैकपॉट', casino: 'कैसीनो',
  betHistory: 'सट्टा इतिहास', bets: 'सट्टे', noBetsYet: 'कोई सट्टा नहीं', noBetsDesc: 'इतिहास देखने के लिए खेलना शुरू करें',
  win: 'जीत', loss: 'हार',
  totalBets: 'कुल सट्टे', wins: 'जीतें', winRate: 'जीत दर',
  walletBalances: 'वॉलेट शेष', achievements: 'उपलब्धियां', playResponsibly: '🛡 जिम्मेदारी से खेलें। डेमो ऐप।',
  settings: 'सेटिंग्स', language: 'भाषा', sound: 'ध्वनि', on: 'चालू', off: 'बंद',
  depositTitle: 'फंड जमा करें', depositDesc: 'भुगतान विधि चुनें',
  connectWallet: 'वॉलेट जोड़ें', telegramStars: 'टेलीग्राम सितारे', starsDesc: 'सितारे खरीदें और शेष में बदलें',
  metamaskDesc: 'ETH/टोकन जमा करने के लिए MetaMask जोड़ें',
  tonkeeperDesc: 'TON जमा करने के लिए TONKeeper जोड़ें',
  connected: 'जुड़ा हुआ', connect: 'जोड़ें', buyStars: 'सितारे खरीदें', starsAmount: 'सितारों की मात्रा',
  processing: 'प्रक्रिया जारी...', depositSuccess: 'जमा सफल!', depositFailed: 'जमा विफल',
  hit: 'हिट', stand: 'स्टैंड', dealerHand: 'डीलर', yourHand: 'आपका हाथ',
  bust: 'बस्ट!', blackjack: 'ब्लैकजैक!', push: 'टाई!', dealerWins: 'डीलर जीता', youWin: 'आप जीते!',
  dealCards: 'कार्ड बांटें',
  rollDice: 'पासा फेंकें 🎲', rolling: 'फेंक रहा है...', winChance: 'जीतने का मौका', multiplier: 'गुणांक',
  mode: 'मोड', over: 'से अधिक', under: 'से कम', target: 'लक्ष्य', rollOver: 'से अधिक फेंकें', rollUnder: 'से कम फेंकें',
  coinFlip: 'सिक्का उछालें', flipping: 'उछाल रहा है...', flipCoin: 'सिक्का उछालें 🪙', chooseSide: 'पक्ष चुनें', heads: 'चित', tails: 'पट',
  nextRoundIn: 'अगला राउंड', betPlaced: 'सट्टा लगा', cashOut: 'कैश आउट',
  cashedOutAt: 'कैश आउट @', noActiveBet: 'कोई सक्रिय सट्टा नहीं', gameInProgress: 'खेल जारी...', crashed: 'क्रैश!', crashedAt: 'क्रैश हुआ',
  spinning: 'घूम रहा है...', spin: 'घुमाएं 🎰', paytable: 'भुगतान तालिका', anyTwoMatch: 'कोई भी 2 मैच',
  spinRoulette: 'रूलेट घुमाएं 🎡', chooseBet: 'सट्टा चुनें',
  red: 'लाल', black: 'काला', green: '0 (हरा)', odd: 'विषम', even: 'सम', low: '1–18', high: '19–36',
};

export const TRANSLATIONS: Record<Language, Translations> = { en: EN, uk: UK, ru: RU, de: DE, tr: TR, pt: PT, es: ES, fr: FR, it: IT, id: ID, hi: HI };

export const LANGUAGE_NAMES: Record<Language, string> = {
  en: '🇬🇧 English', uk: '🇺🇦 Українська', ru: '🇷🇺 Русский', de: '🇩🇪 Deutsch', tr: '🇹🇷 Türkçe', pt: '🇧🇷 Português',
  es: '🇪🇸 Español', fr: '🇫🇷 Français', it: '🇮🇹 Italiano', id: '🇮🇩 Indonesia', hi: '🇮🇳 हिन्दी',
};

interface LanguageContextType {
  language: Language;
  setLanguage: (l: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('cryptobet_language_v1') as Language | null;
    return saved && (['en','uk','ru','de','tr','pt','es','fr','it','id','hi'] as Language[]).includes(saved as Language) ? saved as Language : 'en';
  });
  useEffect(() => {
    try { localStorage.setItem('cryptobet_language_v1', language); } catch {}
  }, [language]);
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: TRANSLATIONS[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
