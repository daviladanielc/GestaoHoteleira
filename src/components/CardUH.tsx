import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { atualizarUH } from '../lib/api';
import type { UH } from '../store/useHotelStore';
import { Button } from './ui/Button';

export function CardUH({ uh }: { uh: UH }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (dados: Partial<Pick<UH, 'status' | 'qtdePessoas' | 'hospedes'>>) =>
      atualizarUH(uh.numeroUH, dados),
    onSuccess: (_, variaveis) => {
      queryClient.invalidateQueries({ queryKey: ['uhs'] });
      toast.success(`UH ${uh.numeroUH} alterada para ${variaveis.status}!`);
    },
  });

  const titular = uh.hospedes?.find((h) => h.titular);

  return (
    <div
      className={cn('rounded-xl border-2 p-5 shadow-sm transition-all', {
        'border-emerald-400 bg-emerald-50/70': uh.status === 'LIVRE',
        'border-rose-400 bg-rose-50/70': uh.status === 'OCUPADA',
        'border-amber-400 bg-amber-50/70': uh.status === 'MANUTENCAO',
        'opacity-60': mutation.isPending,
      })}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-lg font-bold text-slate-800">
            UH {uh.numeroUH}{' '}
            <span className="text-sm font-normal text-slate-500">
              ({uh.descricaoCategoria ?? uh.categoria})
            </span>
          </h3>
          <p className="text-xs text-slate-500">
            Tarifa: <strong>{uh.descricaoTarifa}</strong> (Base: R$ {uh.valorBaseDiaria.toFixed(2)}{' '}
            | Diária Atual: <strong>R$ {uh.valorDiariaTotal.toFixed(2)}</strong>)
          </p>
        </div>

        <span
          className={cn('px-2.5 py-0.5 rounded-full text-xs font-bold', {
            'bg-emerald-200 text-emerald-900': uh.status === 'LIVRE',
            'bg-rose-200 text-rose-900': uh.status === 'OCUPADA',
            'bg-amber-200 text-amber-900': uh.status === 'MANUTENCAO',
          })}
        >
          {uh.status}
        </span>
      </div>

      <div className="text-sm text-slate-700 my-3 space-y-1">
        <p>
          <strong>Ocupação:</strong> {uh.qtdePessoas} / {uh.capacidadeMaxima} PAX
        </p>
        {titular && (
          <p className="text-xs text-slate-700 bg-white/80 px-2.5 py-1 rounded border border-slate-200 inline-block">
            <strong>Titular:</strong> {titular.nome} ({titular.codigoPensao}) — +
            {uh.hospedes.length - 1} acompanhante(s)
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-200/80">
        <Button
          variant="success"
          onClick={() => navigate(`/uh/${uh.numeroUH}`)}
          disabled={uh.status === 'MANUTENCAO'}
        >
          {uh.status === 'OCUPADA'
            ? 'Gerenciar Hóspedes / Ficha'
            : 'Realizar Check-in (Vincular PAX)'}
        </Button>

        <Button
          variant="primary"
          onClick={() => mutation.mutate({ status: 'LIVRE' })}
          disabled={uh.status === 'LIVRE' || mutation.isPending}
        >
          Check-out / Liberar UH
        </Button>

        <Button
          variant="warning"
          onClick={() => mutation.mutate({ status: 'MANUTENCAO' })}
          disabled={uh.status === 'MANUTENCAO' || uh.status === 'OCUPADA' || mutation.isPending}
        >
          Manutenção
        </Button>
      </div>
    </div>
  );
}