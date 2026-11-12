import React from 'react';
import { 
  Terminal, 
  Trash2, 
  AlertCircle, 
  Info, 
  AlertTriangle, 
  Radio,
  Clock
} from 'lucide-react';

/**
 * Термінал оперативних системних подій, журналів та тригерів інцидентів
 */
export const EventLogFeed = ({ logs, onClearLogs }) => {
  const getLogBadge = (level) => {
    switch (level) {
      case 'CRITICAL':
        return (
          <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <AlertCircle className="h-3 w-3" /> КРИТИЧНО
          </span>
        );
      case 'WARNING':
        return (
          <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="h-3 w-3" /> УВАГА
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Info className="h-3 w-3" /> ІНФО
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
      {/* Шапка журналу логів */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-cyan-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Оперативний журнал подій (Event Feed)
          </h3>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 font-mono">
            {logs.length}
          </span>
        </div>

        <button
          onClick={onClearLogs}
          className="flex items-center gap-1 px-2.5 py-1 rounded text-xs text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
          title="Очистити локальний буфер журналів"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Очистити</span>
        </button>
      </div>

      {/* Список подій */}
      <div className="space-y-2 max-h-56 overflow-y-auto pr-1 font-mono text-xs scrollbar-thin">
        {logs.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs font-sans">
            Журнал порожній. Всі системи працюють стабільно.
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:border-slate-700/80 transition-colors space-y-1"
            >
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  {getLogBadge(log.level)}
                  <span className="font-semibold text-slate-300">{log.serverName}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-500 text-[10px]">
                  <Clock className="h-3 w-3" />
                  <span>{log.timestamp}</span>
                </div>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed pl-1 border-l-2 border-slate-800">
                {log.message}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
