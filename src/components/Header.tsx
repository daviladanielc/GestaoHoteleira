import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useHotelStore } from '../store/useHotelStore';
import { buscarUHs } from '../lib/api';

export function Header() {
  const { operador } = useHotelStore();
  const { data: uhs = [] } = useQuery({ queryKey: ['uhs'], queryFn: buscarUHs });

  const livres = uhs.filter((u) => u.status === 'LIVRE').length;
  const ocupadas = uhs.filter((u) => u.status === 'OCUPADA').length;
  const manutencao = uhs.filter((u) => u.status === 'MANUTENCAO').length;

  return (
    <header className="bg-slate-900 text-white p-4 shadow-md mb-6">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div>
            <Link to="/" className="text-xl font-bold tracking-tight hover:text-blue-400">
              ERP Hotel — SQLite
            </Link>
            <p className="text-xs text-slate-400">Operador: {operador}</p>
          </div>

          <nav className="flex gap-2">
            <Link
              to="/"
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold"
            >
              Mapa de UHs
            </Link>
            <Link
              to="/cadastros"
              className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-xs font-semibold"
            >
              + Cadastros (Pensão / Tarifa / Categoria / UH)
            </Link>
          </nav>
        </div>

        <div className="flex gap-3 text-xs font-semibold">
          <span className="bg-emerald-900/80 border border-emerald-500 text-emerald-200 px-3 py-1 rounded-full">
            Livres: {livres}
          </span>
          <span className="bg-rose-900/80 border border-rose-500 text-rose-200 px-3 py-1 rounded-full">
            Ocupadas: {ocupadas}
          </span>
          <span className="bg-amber-900/80 border border-amber-500 text-amber-200 px-3 py-1 rounded-full">
            Manutenção: {manutencao}
          </span>
        </div>
      </div>
    </header>
  );
}