// Конфігурація серверних статусів, кольорової індикації та переходів станів
export const SERVER_STATUSES = {
  ONLINE: 'Online',
  DEGRADED: 'Degraded',
  MAINTENANCE: 'Maintenance',
  OFFLINE: 'Offline',
};

export const STATUS_CONFIG = {
  [SERVER_STATUSES.ONLINE]: {
    label: 'В мережі',
    color: 'emerald',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    dotClass: 'bg-emerald-400',
    glowClass: 'shadow-[0_0_12px_rgba(16,185,129,0.35)]',
    description: 'Всі системи функціонують у штатному режимі. Тикрейт стабільний.',
  },
  [SERVER_STATUSES.DEGRADED]: {
    label: 'Деградація',
    color: 'amber',
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    dotClass: 'bg-amber-400 animate-pulse',
    glowClass: 'shadow-[0_0_12px_rgba(245,158,11,0.35)]',
    description: 'Спостерігаються затримки мережі або підвищене навантаження процесора.',
  },
  [SERVER_STATUSES.MAINTENANCE]: {
    label: 'Обслуговування',
    color: 'blue',
    badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    dotClass: 'bg-blue-400',
    glowClass: 'shadow-[0_0_12px_rgba(59,130,246,0.35)]',
    description: 'Сервер ізольовано від нових гравців для технічних робіт чи оновлення патчу.',
  },
  [SERVER_STATUSES.OFFLINE]: {
    label: 'Відключено',
    color: 'rose',
    badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    dotClass: 'bg-rose-400',
    glowClass: 'shadow-[0_0_12px_rgba(244,63,94,0.35)]',
    description: 'Критична аварія або планове вимкнення. Потрібне диспетчерське втручання.',
  },
};

// Регіони розміщення серверних нод
export const REGIONS = [
  { id: 'all', name: 'Усі регіони', flag: '🌐' },
  { id: 'eu-central', name: 'EU-Central (Франкфурт)', flag: '🇪🇺', latencyBase: 24 },
  { id: 'us-east', name: 'US-East (Вірджинія)', flag: '🇺🇸', latencyBase: 110 },
  { id: 'asia-pacific', name: 'Asia-Pacific (Токіо)', flag: '🇯🇵', latencyBase: 185 },
  { id: 'sa-east', name: 'SA-East (Сан-Паулу)', flag: '🇧🇷', latencyBase: 215 },
];

// Типи ігрових серверів
export const GAME_TYPES = [
  'Battle Royale Cluster',
  'Competitive 5v5 Arena',
  'MMORPG Realm Node',
  'Survival Dedicated Host',
];
