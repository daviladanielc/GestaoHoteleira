import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { buscarUHs, buscarPensoes } from '../lib/api';
import { Button } from '../components/ui/Button';
import { FormularioVinculoHospedes } from '../components/FormularioVinculoHospedes';

export function PaginaDetalheUH() {
  const { numeroUH } = useParams<{ numeroUH: string }>();
  const navigate = useNavigate();

  const { data: uhs = [], isLoading: loadingUHs } = useQuery({
    queryKey: ['uhs'],
    queryFn: buscarUHs,
  });
  const { data: pensoes = [], isLoading: loadingPensoes } = useQuery({
    queryKey: ['pensoes'],
    queryFn: buscarPensoes,
  });

  if (loadingUHs || loadingPensoes) return <p className="text-slate-600">Carregando ficha...</p>;

  const uh = uhs.find((u) => u.numeroUH === numeroUH);
  if (!uh) return <p className="text-red-600 font-bold">UH não encontrada!</p>;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Check-in & Hóspedes — UH {uh.numeroUH}
          </h2>
          <p className="text-sm text-slate-500">
            {uh.descricaoCategoria ?? uh.categoria} | Tarifa: {uh.descricaoTarifa} (Base R${' '}
            {uh.valorBaseDiaria.toFixed(2)})
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/')}>
          ← Voltar ao Mapa
        </Button>
      </div>

      <FormularioVinculoHospedes uh={uh} pensoes={pensoes} />
    </div>
  );
}