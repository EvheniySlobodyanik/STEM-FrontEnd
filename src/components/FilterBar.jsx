import React from 'react';
import { Search, Filter, Globe2, ShieldAlert } from 'lucide-react';
import { REGIONS, SERVER_STATUSES, STATUS_CONFIG } from '../constants/serverConfig';

/**
 * Панель фільтрації та швидкого пошуку серверних кластерів
 */
export const FilterBar = ({
  selectedRegion,
  setSelectedRegion,
  statusFilter,
  setStatusFilter,
  searchQuery,
  setSearchQuery,
  criticalOnly,
  setCriticalOnly,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-4">
      {/* Верхній рядок: регіональні таби та пошук */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Вибір гео-регіону */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <Globe2 className="h-4 w-4 text-slate-500 mr-1 shrink-0" />
          {REGIONS.map((region) => {
            const isActive = selectedRegion === region.id;
            return (
              <button
                key={region.id}
                onClick={() => setSelectedRegion(region.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
                }`}
              >
                <span className="mr-1.5">{region.flag}</span>
                {region.name}
              </button>
            );
          })}
        </div>

        {/* Поле живого пошуку за назвою або IP */}
        <div className="relative min-w-[260px]">
          <Search className="h-4 w-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Пошук ноди за ім'ям, IP або портом..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
          />
        </div>
      </div>

      {/* Нижній рядок: фільтр статусів та кнопка фокусу на інцидентах */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium mr-1">
            <Filter className="h-3.5 w-3.5" /> Фільтр стану:
          </span>

          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-700 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Всі
          </button>

          {Object.entries(SERVER_STATUSES).map(([key, value]) => {
            const config = STATUS_CONFIG[value];
            const isSelected = statusFilter === value;
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(value)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? config.badgeClass + ' border'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-transparent'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} />
                {config.label}
              </button>
            );
          })}
        </div>

        {/* Швидке перемикання для фокусу на аваріях (MTTR) */}
        <button
          onClick={() => setCriticalOnly(!criticalOnly)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
            criticalOnly
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.3)] animate-pulse'
              : 'bg-slate-800/70 text-slate-400 border-slate-700 hover:text-rose-400 hover:border-rose-500/30'
          }`}
        >
          <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
          <span>Тільки інциденти (Degraded + Offline)</span>
        </button>
      </div>
    </div>
  );
};
