import { useQuery } from '@tanstack/react-query';
import { useHotelStore, type StatusUH } from '../store/useHotelStore';
import { buscarUHs } from '../lib/api';
import { Button } from '../components/ui/Button';
import { CardUH } from '../components/CardUH';

export function PaginaMapaUHs() {
  const { filtroStatus, setFiltroStatus } = useHotelStore();
  const { data: uhs = [], isLoading } = useQuery({ queryKey: ['uhs'], queryFn: buscarUHs });

  if (isLoading) return <p className="text-slate-600">Carregando mapa de UHs do SQLite...</p>;

  const uhsFiltradas =
    filtroStatus === 'TODAS' ? uhs : uhs.filter((u) => u.status === filtroStatus);
  const filtros: Array<StatusUH | 'TODAS'> = ['TODAS', 'LIVRE', 'OCUPADA', 'MANUTENCAO'];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Mapa de UHs</h1>
        <div className="flex gap-2">
          {filtros.map((f) => (
            <Button
              key={f}
              variant={filtroStatus === f ? 'primary' : 'outline'}
              onClick={() => setFiltroStatus(f)}
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      {uhsFiltradas.map((uh) => (
        <CardUH key={uh.numeroUH} uh={uh} />
      ))}
    </div>
  );
}