import React from 'react';
import { 
  Users, 
  Cpu, 
  Wifi, 
  Clock, 
  ShieldCheck, 
  Radio, 
  RotateCw, 
  PowerOff, 
  Wrench,
  Activity
} from 'lucide-react';
import { STATUS_CONFIG, SERVER_STATUSES } from '../constants/serverConfig';

/**
 * Картка окремого серверного вузла з візуалізацією телеметрії та швидкими діями
 */
export const ServerCard = ({
  server,
  isSelected,
  onSelect,
  onRestart,
  onToggleMaintenance,
  isRestarting,
}) => {
  const statusCfg = STATUS_CONFIG[server.status] || STATUS_CONFIG[SERVER_STATUSES.OFFLINE];
  const isOffline = server.status === SERVER_STATUSES.OFFLINE;

  return (
    <div
      onClick={onSelect}
      className={`group relative rounded-xl border p-4.5 transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'bg-slate-900 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/50'
          : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Індикатор вибору */}
      {isSelected && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
        </span>
      )}

      {/* Верхня частина: Назва, Регіон та Статус */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
              {server.regionName}
            </span>
            <span className="text-xs text-slate-400 font-mono">{server.ip}</span>
          </div>
          <h3 className="font-semibold text-sm text-white group-hover:text-cyan-300 transition-colors">
            {server.name}
          </h3>
          <p className="text-[11px] text-slate-400">{server.type}</p>
        </div>

        {/* Статусний бейдж */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${statusCfg.badgeClass} ${
            isSelected ? statusCfg.glowClass : ''
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dotClass}`} />
          {statusCfg.label}
        </div>
      </div>

      {/* Сітка телеметрії */}
      <div className="grid grid-cols-2 gap-2 my-3 text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
        <div className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400">Гравці онлайн</div>
            <div className="font-medium text-slate-200 font-mono">
              {isOffline ? '0' : server.playersOnline} <span className="text-slate-400 text-[10px]">/ {server.maxPlayers}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Cpu className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
          <div className="w-full">
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>CPU</span>
              <span className="font-mono text-slate-300">{isOffline ? '0%' : `${server.cpuUsage}%`}</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  server.cpuUsage > 80 ? 'bg-rose-500' : server.cpuUsage > 60 ? 'bg-amber-500' : 'bg-cyan-500'
                }`}
                style={{ width: `${isOffline ? 0 : server.cpuUsage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Wifi className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400">Затримка мережі (Ping)</div>
            <div className="font-medium text-slate-200 font-mono">
              {isOffline ? 'N/A' : `${server.ping} ms`}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-blue-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400">Стабільність Tickrate</div>
            <div className="font-medium text-slate-200 font-mono">
              {isOffline ? '0' : `${server.tickRate} / ${server.targetTickRate}`}
            </div>
          </div>
        </div>
      </div>

      {/* Нижні метадані та швидкі дії */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-slate-400" />
          <span>Аптайм: {server.uptimeHours} год.</span>
        </div>

        {/* Швидкі диспетчерські кнопки */}
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onRestart(server.id)}
            disabled={isRestarting}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors disabled:opacity-50 cursor-pointer"
            title="Швидкий перезапуск сервера"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isRestarting ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          <button
            onClick={() => onToggleMaintenance(server.id)}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
            title={server.status === SERVER_STATUSES.MAINTENANCE ? 'Зняти з обслуговування' : 'Режим Maintenance'}
          >
            <Wrench className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
