import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { 
  RotateCw, 
  Wrench, 
  Trash2, 
  PowerOff, 
  Activity, 
  Cpu, 
  Wifi, 
  Users, 
  ShieldAlert, 
  CheckCircle,
  Terminal,
  Zap
} from 'lucide-react';
import { STATUS_CONFIG, SERVER_STATUSES } from '../constants/serverConfig';

/**
 * Детальна панель аналітики та диспетчерського керування вибраним серверним вузлом
 */
export const ServerDetails = ({
  server,
  onRestart,
  onToggleMaintenance,
  onTogglePower,
  onResetLogs,
  isRestarting,
}) => {
  const [metricTab, setMetricTab] = useState('cpu'); // 'cpu' | 'ping' | 'players' | 'tickRate'

  if (!server) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500">
        <Activity className="h-10 w-10 mx-auto mb-3 opacity-40 animate-pulse text-cyan-500" />
        <h4 className="text-sm font-semibold text-slate-400">Вузол не вибрано</h4>
        <p className="text-xs mt-1">Оберіть сервер у списку ліворуч для перегляду графіків телеметрії та панелі дій.</p>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[server.status] || STATUS_CONFIG[SERVER_STATUSES.OFFLINE];
  const isOffline = server.status === SERVER_STATUSES.OFFLINE;

  // Конфігурація відображення графіків
  const metricConfigs = {
    cpu: { label: 'Навантаження CPU (%)', color: '#06b6d4', stroke: '#0891b2', unit: '%' },
    ping: { label: 'Мережева затримка (ms)', color: '#10b981', stroke: '#059669', unit: ' ms' },
    players: { label: 'Онлайн гравців', color: '#6366f1', stroke: '#4f46e5', unit: ' гравців' },
    tickRate: { label: 'Стабільність Tickrate', color: '#f59e0b', stroke: '#d97706', unit: ' tick/s' },
  };

  const currentMetric = metricConfigs[metricTab];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-5">
      {/* Шапка детальної картки */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">{server.name}</h2>
            <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusCfg.badgeClass}`}>
              {statusCfg.label}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 font-mono">
            <span>{server.ip}</span>
            <span>•</span>
            <span>{server.regionName}</span>
            <span>•</span>
            <span>Версія: {server.version}</span>
          </div>
        </div>

        {/* Кнопки оперативного диспетчерського реагування */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onRestart(server.id)}
            disabled={isRestarting || isOffline}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-all disabled:opacity-40 disabled:hover:bg-cyan-600 shadow-sm cursor-pointer"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isRestarting ? 'animate-spin' : ''}`} />
            <span>{isRestarting ? 'Перезапуск...' : 'Restart Node'}</span>
          </button>

          <button
            onClick={() => onToggleMaintenance(server.id)}
            disabled={isOffline}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border cursor-pointer ${
              server.status === SERVER_STATUSES.MAINTENANCE
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-blue-500/50 hover:text-blue-300'
            }`}
          >
            <Wrench className="h-3.5 w-3.5" />
            <span>{server.status === SERVER_STATUSES.MAINTENANCE ? 'Зняти ТО' : 'Maintenance'}</span>
          </button>

          <button
            onClick={() => onTogglePower(server.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border cursor-pointer ${
              isOffline
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500'
                : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30'
            }`}
          >
            <PowerOff className="h-3.5 w-3.5" />
            <span>{isOffline ? 'Увімкнути ноду' : 'Вимкнути'}</span>
          </button>
        </div>
      </div>

      {/* Опис поточного стану згідно моделі State Machine */}
      <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs flex items-center gap-3">
        <div className={`p-2 rounded-md ${statusCfg.badgeClass}`}>
          <Activity className="h-4 w-4" />
        </div>
        <div>
          <div className="font-semibold text-slate-300">Діагностичне резюме вузла:</div>
          <div className="text-slate-400 mt-0.5">{statusCfg.description}</div>
        </div>
      </div>

      {/* Перемикання метрик для графіків */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-cyan-400" /> Динаміка метрик у часі
          </h3>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {Object.entries(metricConfigs).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setMetricTab(key)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                  metricTab === key
                    ? 'bg-slate-800 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {key.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Інтерактивний графік Recharts */}
        <div className="h-56 w-full bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={server.history}>
              <defs>
                <linearGradient id={`gradient-${metricTab}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={currentMetric.color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={currentMetric.color} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  color: '#e2e8f0',
                }}
                formatter={(value) => [`${value}${currentMetric.unit}`, currentMetric.label]}
              />
              <Area
                type="monotone"
                dataKey={metricTab}
                stroke={currentMetric.stroke}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#gradient-${metricTab})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Додаткові параметри сервера */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800">
          <div className="text-slate-400 text-[10px]">Втрати пакетів</div>
          <div className={`font-mono font-semibold text-sm ${server.packetLoss > 1 ? 'text-rose-400' : 'text-slate-200'}`}>
            {server.packetLoss}%
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800">
          <div className="text-slate-400 text-[10px]">Пам'ять RAM</div>
          <div className="font-mono font-semibold text-sm text-slate-200">
            {server.ramUsage}%
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800">
          <div className="text-slate-400 text-[10px]">Аптайм процесу</div>
          <div className="font-mono font-semibold text-sm text-slate-200">
            {server.uptimeHours} год
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800">
          <div className="text-slate-400 text-[10px]">Цільовий Tickrate</div>
          <div className="font-mono font-semibold text-sm text-slate-200">
            {server.targetTickRate} Hz
          </div>
        </div>
      </div>
    </div>
  );
};
