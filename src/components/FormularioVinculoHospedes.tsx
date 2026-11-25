import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { atualizarUH } from '../lib/api';
import type { UH, Pensao } from '../store/useHotelStore';
import {
  criarCheckinSchema,
  type CheckinFormInput,
  type CheckinFormData,
} from '../schemas/hotelSchemas';
import { Button } from './ui/Button';

export function FormularioVinculoHospedes({ uh, pensoes }: { uh: UH; pensoes: Pensao[] }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckinFormInput, unknown, CheckinFormData>({
    resolver: zodResolver(criarCheckinSchema(uh.capacidadeMaxima)),
    defaultValues: {
      hospedes:
        uh.hospedes && uh.hospedes.length > 0
          ? uh.hospedes.map((h) => ({
              nome: h.nome,
              cpf: h.cpf,
              idPensao: h.idPensao,
              titular: h.titular,
            }))
          : [{ nome: '', cpf: '', idPensao: uh.idPensaoPadrao, titular: true }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'hospedes' });

  const mutation = useMutation({
    mutationFn: (dados: CheckinFormData) =>
      atualizarUH(uh.numeroUH, { status: 'OCUPADA', hospedes: dados.hospedes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uhs'] });
      toast.success(`Hóspedes gravados no SQLite para a UH ${uh.numeroUH}!`);
      navigate('/');
    },
    onError: () => toast.error('Erro ao salvar hóspedes no banco.'),
  });

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-800">
          Hóspedes Vinculados ({fields.length} / {uh.capacidadeMaxima} PAX)
        </h3>

        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (fields.length >= uh.capacidadeMaxima) {
              toast.warning(`Limite de ${uh.capacidadeMaxima} hóspedes atingido!`);
              return;
            }
            append({ nome: '', cpf: '', idPensao: uh.idPensaoPadrao, titular: false });
          }}
        >
          + Adicionar Acompanhante
        </Button>
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="p-4 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-3 items-start"
          >
            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Nome do Hóspede #{index + 1}
              </label>
              <input
                {...register(`hospedes.${index}.nome`)}
                placeholder="Nome completo"
                className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-md"
              />
              {errors.hospedes?.[index]?.nome && (
                <p className="text-xs text-red-600 mt-1">{errors.hospedes[index]?.nome?.message}</p>
              )}
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                CPF (11 dígitos)
              </label>
              <input
                {...register(`hospedes.${index}.cpf`)}
                maxLength={11}
                placeholder="Somente números"
                className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-md"
              />
              {errors.hospedes?.[index]?.cpf && (
                <p className="text-xs text-red-600 mt-1">{errors.hospedes[index]?.cpf?.message}</p>
              )}
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Pensão (Do Banco SQLite)
              </label>
              <select
                {...register(`hospedes.${index}.idPensao`)}
                className="w-full px-2 py-1.5 text-sm bg-white border border-slate-300 rounded-md"
              >
                {pensoes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.codigo} (+R$ {p.valorAdicional.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-1 flex flex-col items-center justify-center pt-5">
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  {...register(`hospedes.${index}.titular`)}
                  className="w-4 h-4 accent-blue-600"
                />
                Titular
              </label>
            </div>

            <div className="md:col-span-1 flex justify-end pt-4">
              <Button
                type="button"
                variant="danger"
                onClick={() => remove(index)}
                disabled={fields.length <= 1}
              >
                X
              </Button>
            </div>
          </div>
        ))}
      </div>

      {(errors.hospedes?.root || errors.hospedes?.message) && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-md">
          {errors.hospedes?.root?.message ?? errors.hospedes?.message}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        <Button type="button" variant="outline" onClick={() => navigate('/')}>
          Cancelar
        </Button>
        <Button type="submit" variant="success" disabled={mutation.isPending}>
          {mutation.isPending ? 'Gravando...' : 'Salvar Vínculo no SQLite'}
        </Button>
      </div>
    </form>
  );
}