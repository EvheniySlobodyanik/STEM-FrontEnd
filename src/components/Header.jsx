import React from 'react';
import { 
  Server, 
  Activity, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCw,
  Cpu
} from 'lucide-react';
import { SERVER_STATUSES } from '../constants/serverConfig';

/**
 * Верхня навігаційна панель та зведені KPI-метрики інфраструктури
 */
export const Header = ({ servers, isLiveUpdating, setIsLiveUpdating, onTriggerBulkHealthCheck }) => {
  const totalServers = servers.length;
  const onlineCount = servers.filter(s => s.status === SERVER_STATUSES.ONLINE).length;
  const degradedCount = servers.filter(s => s.status === SERVER_STATUSES.DEGRADED).length;
  const offlineCount = servers.filter(s => s.status === SERVER_STATUSES.OFFLINE).length;
  
  const totalPlayers = servers.reduce((acc, s) => acc + s.playersOnline, 0);
  const avgCpu = Math.round(
    servers.filter(s => s.status !== SERVER_STATUSES.OFFLINE)
      .reduce((acc, s) => acc + s.cpuUsage, 0) / (servers.filter(s => s.status !== SERVER_STATUSES.OFFLINE).length || 1)
  );

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
      {/* Основний рядок навігації */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/30">
            <Server className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-mono">GameOps Core</h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/80">
                v1.2 Live
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Розподілена веб-панель оперативного диспетчерського моніторингу ігрових серверів
            </p>
          </div>
        </div>

        {/* Кнопки керування живим оновленням */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLiveUpdating(!isLiveUpdating)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
              isLiveUpdating 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${isLiveUpdating ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
            {isLiveUpdating ? 'Жива телеметрія (3с)' : 'Оновлення призупинено'}
          </button>

          <button
            onClick={onTriggerBulkHealthCheck}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-sm cursor-pointer"
            title="Запустити примусовий пінґ та перевірку стану всіх вузлів"
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span>Діагностика мережі</span>
          </button>
        </div>
      </div>

      {/* Швидкі KPI віджети */}
      <div className="border-t border-slate-800/60 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <Activity className="h-4 w-4 text-emerald-400" />
            <div>
              <div className="text-slate-400">Статус системи</div>
              <div className="font-semibold text-slate-200">
                {onlineCount}/{totalServers} вузлів онлайн ({Math.round((onlineCount / totalServers) * 100)}%)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <Users className="h-4 w-4 text-cyan-400" />
            <div>
              <div className="text-slate-400">Загальний онлайн</div>
              <div className="font-semibold text-slate-200 font-mono">
                {totalPlayers.toLocaleString('uk-UA')} гравців
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <Cpu className="h-4 w-4 text-indigo-400" />
            <div>
              <div className="text-slate-400">Середнє навантаження CPU</div>
              <div className="font-semibold text-slate-200 font-mono">
                {avgCpu}% <span className="text-[10px] text-slate-400">(по активних нодах)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <AlertTriangle className={`h-4 w-4 ${degradedCount + offlineCount > 0 ? 'text-amber-400' : 'text-slate-500'}`} />
            <div>
              <div className="text-slate-400">Аномалії / Сбої</div>
              <div className={`font-semibold ${degradedCount + offlineCount > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                {degradedCount} деградація / {offlineCount} офлайн
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
