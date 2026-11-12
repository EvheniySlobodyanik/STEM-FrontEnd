import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { ServerCard } from './components/ServerCard';
import { ServerDetails } from './components/ServerDetails';
import { EventLogFeed } from './components/EventLogFeed';
import { INITIAL_SERVERS, INITIAL_LOGS } from './data/mockServers';
import { SERVER_STATUSES } from './constants/serverConfig';

export function App() {
  const [servers, setServers] = useState(INITIAL_SERVERS);
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [selectedServerId, setSelectedServerId] = useState('srv-eu-01');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [isLiveUpdating, setIsLiveUpdating] = useState(true);
  const [restartingServerId, setRestartingServerId] = useState(null);

  // Жива симуляція оновлення телеметрії розподілених серверів (кожні 3.5 секунди)
  useEffect(() => {
    if (!isLiveUpdating) return;

    const interval = setInterval(() => {
      setServers((prevServers) =>
        prevServers.map((server) => {
          if (server.status === SERVER_STATUSES.OFFLINE) {
            return server; // Офлайн сервер не змінює показники CPU/онлайн без ввімкнення
          }

          // Додаємо природні коливання метрик (jitter)
          const cpuDelta = (Math.random() - 0.48) * 4;
          const pingDelta = (Math.random() - 0.5) * 3;
          const playerDelta = Math.floor((Math.random() - 0.48) * 8);

          let newCpu = Math.min(100, Math.max(5, Math.round(server.cpuUsage + cpuDelta)));
          let newPing = Math.max(10, Math.round(server.ping + pingDelta));
          let newPlayers = Math.min(server.maxPlayers, Math.max(0, server.playersOnline + playerDelta));

          // Перерахунок статусу деградації якщо навантаження критичне
          let newStatus = server.status;
          if (server.status !== SERVER_STATUSES.MAINTENANCE) {
            if (newCpu > 85 || newPing > 150) {
              newStatus = SERVER_STATUSES.DEGRADED;
            } else if (newCpu < 75 && newPing < 120 && server.status === SERVER_STATUSES.DEGRADED) {
              newStatus = SERVER_STATUSES.ONLINE;
            }
          }

          // Оновлюємо історію для графіків
          const now = new Date();
          const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
          
          const newHistoryPoint = {
            time: timeStr,
            cpu: newCpu,
            ping: newPing,
            players: newPlayers,
            tickRate: newStatus === SERVER_STATUSES.DEGRADED ? Number((server.targetTickRate * 0.88).toFixed(1)) : server.targetTickRate,
          };

          const updatedHistory = [...server.history.slice(-7), newHistoryPoint];

          return {
            ...server,
            cpuUsage: newCpu,
            ping: newPing,
            playersOnline: newPlayers,
            status: newStatus,
            history: updatedHistory,
          };
        })
      );
    }, 3500);

    return () => clearInterval(interval);
  }, [isLiveUpdating]);

  // Фільтрація списку серверів за кількома критеріями
  const filteredServers = useMemo(() => {
    return servers.filter((server) => {
      // Фільтр регіону
      if (selectedRegion !== 'all' && server.region !== selectedRegion) {
        return false;
      }
      // Фільтр статусу
      if (statusFilter !== 'all' && server.status !== statusFilter) {
        return false;
      }
      // Фільтр тільки критичних (MTTR фокус)
      if (criticalOnly && server.status !== SERVER_STATUSES.DEGRADED && server.status !== SERVER_STATUSES.OFFLINE) {
        return false;
      }
      // Текстовий пошук за ім'ям або IP
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesName = server.name.toLowerCase().includes(query);
        const matchesIp = server.ip.toLowerCase().includes(query);
        if (!matchesName && !matchesIp) return false;
      }
      return true;
    });
  }, [servers, selectedRegion, statusFilter, criticalOnly, searchQuery]);

  // Вибраний у деталях сервер
  const selectedServer = useMemo(() => {
    return servers.find((s) => s.id === selectedServerId) || servers[0];
  }, [servers, selectedServerId]);

  // Диспетчерська дія 1: Перезапуск сервера (Restart Node)
  const handleRestart = (id) => {
    const target = servers.find((s) => s.id === id);
    if (!target) return;

    setRestartingServerId(id);

    // Додаємо лог про початок перезапуску
    const now = new Date();
    const timeStr = now.toLocaleTimeString('uk-UA');
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: timeStr,
      level: 'WARNING',
      serverId: target.id,
      serverName: target.name,
      message: `Ініційовано диспетчерський перезапуск вузла. Скидання мережевих сокетів та перезапуск daemon-процесу.`,
    };
    setLogs((prev) => [newLog, ...prev]);

    // Симулюємо процес перезапуску (2.2 секунди)
    setTimeout(() => {
      setServers((prev) =>
        prev.map((s) => {
          if (s.id !== id) return s;
          return {
            ...s,
            status: SERVER_STATUSES.ONLINE,
            cpuUsage: 25,
            ping: Math.max(15, s.ping - 10),
            uptimeHours: 0,
            packetLoss: 0.0,
            tickRate: s.targetTickRate,
          };
        })
      );
      setRestartingServerId(null);

      // Лог про успішний старт
      const successLog = {
        id: `log-${Date.now()}-done`,
        timestamp: new Date().toLocaleTimeString('uk-UA'),
        level: 'INFO',
        serverId: target.id,
        serverName: target.name,
        message: `Вузол успішно перезапущено. Всі системні сервіси працюють у штатному режимі (ONLINE).`,
      };
      setLogs((prev) => [successLog, ...prev]);
    }, 2200);
  };

  // Диспетчерська дія 2: Перемикання режиму технічного обслуговування (Maintenance)
  const handleToggleMaintenance = (id) => {
    const target = servers.find((s) => s.id === id);
    if (!target) return;

    const nextStatus =
      target.status === SERVER_STATUSES.MAINTENANCE ? SERVER_STATUSES.ONLINE : SERVER_STATUSES.MAINTENANCE;

    setServers((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        return {
          ...s,
          status: nextStatus,
          playersOnline: nextStatus === SERVER_STATUSES.MAINTENANCE ? 0 : Math.round(s.maxPlayers * 0.5),
        };
      })
    );

    const logEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('uk-UA'),
      level: nextStatus === SERVER_STATUSES.MAINTENANCE ? 'WARNING' : 'INFO',
      serverId: target.id,
      serverName: target.name,
      message:
        nextStatus === SERVER_STATUSES.MAINTENANCE
          ? `Сервер переведено в режим Maintenance. Маршрутизацію нових сесій гравців призупинено.`
          : `Сервер виведено з режиму Maintenance. Відновлено прийом ігрових сесій (ONLINE).`,
    };
    setLogs((prev) => [logEntry, ...prev]);
  };

  // Диспетчерська дія 3: Повне ввімкнення / вимкнення сервера (Power toggle)
  const handleTogglePower = (id) => {
    const target = servers.find((s) => s.id === id);
    if (!target) return;

    const isNowOffline = target.status !== SERVER_STATUSES.OFFLINE;

    setServers((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        return {
          ...s,
          status: isNowOffline ? SERVER_STATUSES.OFFLINE : SERVER_STATUSES.ONLINE,
          playersOnline: isNowOffline ? 0 : Math.round(s.maxPlayers * 0.4),
          cpuUsage: isNowOffline ? 0 : 35,
          ping: isNowOffline ? 0 : 45,
          uptimeHours: isNowOffline ? 0 : 1,
        };
      })
    );

    const logEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('uk-UA'),
      level: isNowOffline ? 'CRITICAL' : 'INFO',
      serverId: target.id,
      serverName: target.name,
      message: isNowOffline
        ? `Аварійне / планове відключення вузла диспетчером. Статус змінено на OFFLINE.`
        : `Вузол увімкнено та успішно підключено до центральної магістралі балансувальника навантаження.`,
    };
    setLogs((prev) => [logEntry, ...prev]);
  };

  // Диспетчерська дія 4: Примусова перевірка здоров'я всіх кластерів (Bulk Health Check)
  const handleBulkHealthCheck = () => {
    const logEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('uk-UA'),
      level: 'INFO',
      serverId: 'global-check',
      serverName: 'Кластерний діагност',
      message: `Запущено глобальну перевірку цілісності та пінґ усіх гео-розподілених кластерів.`,
    };
    setLogs((prev) => [logEntry, ...prev]);

    // Тимчасово оновлюємо аптайми та пінґи
    setServers((prev) =>
      prev.map((s) => ({
        ...s,
        ping: s.status === SERVER_STATUSES.OFFLINE ? 0 : Math.max(15, Math.round(s.ping + (Math.random() - 0.5) * 5)),
      }))
    );
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Навігаційна панель та статус інфраструктури */}
      <Header
        servers={servers}
        isLiveUpdating={isLiveUpdating}
        setIsLiveUpdating={setIsLiveUpdating}
        onTriggerBulkHealthCheck={handleBulkHealthCheck}
      />

      {/* Основна робоча область */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Фільтрація та гео-кластеризація */}
        <FilterBar
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          criticalOnly={criticalOnly}
          setCriticalOnly={setCriticalOnly}
        />

        {/* Робоча сітка: Список серверів (ліворуч) + Деталі та графік (праворуч) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Колонка карток серверів (5 колонок на великих екранах) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Знайдено серверних нод: <strong className="text-slate-200">{filteredServers.length}</strong></span>
              <span>Клацніть для перегляду</span>
            </div>

            {filteredServers.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500">
                <p className="text-sm">За заданими критеріями пошуку вузлів не знайдено.</p>
                <button
                  onClick={() => {
                    setSelectedRegion('all');
                    setStatusFilter('all');
                    setSearchQuery('');
                    setCriticalOnly(false);
                  }}
                  className="mt-3 text-xs text-cyan-400 hover:underline cursor-pointer"
                >
                  Скинути всі фільтри
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1 scrollbar-thin">
                {filteredServers.map((server) => (
                  <ServerCard
                    key={server.id}
                    server={server}
                    isSelected={server.id === selectedServerId}
                    onSelect={() => setSelectedServerId(server.id)}
                    onRestart={handleRestart}
                    onToggleMaintenance={handleToggleMaintenance}
                    isRestarting={restartingServerId === server.id}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Колонка детального моніторингу та логів (7 колонок на великих екранах) */}
          <div className="lg:col-span-7 space-y-6">
            <ServerDetails
              server={selectedServer}
              onRestart={handleRestart}
              onToggleMaintenance={handleToggleMaintenance}
              onTogglePower={handleTogglePower}
              isRestarting={restartingServerId === selectedServer?.id}
            />

            <EventLogFeed logs={logs} onClearLogs={handleClearLogs} />
          </div>
        </div>
      </main>

      {/* Підвал з інформацією про STEM-проєкт */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            STEM-проєкт: «Веб-панель моніторингу доступності, навантаження та розподіленого статусу ігрових серверів»
          </div>
          <div>
            Розробник: <span className="text-slate-400 font-medium">Слободяник Євгеній Олександрович</span> (ІПЗ-23, ПГ-8)
          </div>
        </div>
      </footer>
    </div>
  );
}
export default App;
