import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  buscarPensoes,
  criarPensao,
  buscarTarifas,
  criarTarifa,
  criarUH,
  criarCategoriaUH,
  buscarCategoriasUH,
} from '../lib/api';
import {
  pensaoSchema,
  tarifaSchema,
  uhSchema,
  categoriaUHSchema,
  type PensaoFormInput,
  type PensaoFormData,
  type TarifaFormInput,
  type TarifaFormData,
  type UHFormInput,
  type UHFormData,
  type CategoriaUHFormData,
} from '../schemas/hotelSchemas';
import { Button } from '../components/ui/Button';

export function PaginaCadastros() {
  const queryClient = useQueryClient();
  const { data: pensoes = [] } = useQuery({ queryKey: ['pensoes'], queryFn: buscarPensoes });
  const { data: tarifas = [] } = useQuery({ queryKey: ['tarifas'], queryFn: buscarTarifas });
  const { data: categoriasUH = [] } = useQuery({
    queryKey: ['categorias_uh'],
    queryFn: buscarCategoriasUH,
  });

  const formPensao = useForm<PensaoFormInput, unknown, PensaoFormData>({
    resolver: zodResolver(pensaoSchema),
    defaultValues: { codigo: '', descricao: '', valorAdicional: 0 },
  });

  const formTarifa = useForm<TarifaFormInput, unknown, TarifaFormData>({
    resolver: zodResolver(tarifaSchema),
    defaultValues: { descricao: '', valorBaseDiaria: 350, idPensaoPadrao: 1 },
  });

  const formCategoriaUH = useForm<CategoriaUHFormData>({
    resolver: zodResolver(categoriaUHSchema),
    defaultValues: { codigo: '', descricao: '' },
  });

  const formUH = useForm<UHFormInput, unknown, UHFormData>({
    resolver: zodResolver(uhSchema),
    defaultValues: { numeroUH: '', categoria: 0, capacidadeMaxima: 2, idTarifa: 1 },
  });

  const mutPensao = useMutation({
    mutationFn: criarPensao,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pensoes'] });
      formPensao.reset();
      toast.success('Pensão cadastrada no SQLite!');
    },
    onError: () => toast.error('Erro: Código de pensão já existe!'),
  });

  const mutTarifa = useMutation({
    mutationFn: criarTarifa,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tarifas'] });
      formTarifa.reset();
      toast.success('Tarifa cadastrada no SQLite!');
    },
  });

  const mutCategoriaUH = useMutation({
    mutationFn: criarCategoriaUH,
    onSuccess: () => {
      // Correção 1: Mesma queryKey ['categorias_uh'] usada no useQuery
      queryClient.invalidateQueries({ queryKey: ['categorias_uh'] });
      // Correção 2: Limpa o formCategoriaUH em vez do formUH
      formCategoriaUH.reset();
      toast.success('Nova categoria de UH cadastrada!');
    },
    onError: () => toast.error('Erro: Código de categoria já existe!'),
  });

  const mutUH = useMutation({
    mutationFn: criarUH,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uhs'] });
      formUH.reset();
      toast.success('Nova UH cadastrada e já disponível no Mapa!');
    },
    onError: () => toast.error('Erro: Número de UH já cadastrado!'),
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 1. Cadastro de Pensão */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-800 border-b pb-2">
          1. Nova Pensão
        </h2>
        <form
          onSubmit={formPensao.handleSubmit((d) => mutPensao.mutate(d))}
          className="space-y-3 text-sm"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-600">
              Código (Ex: ALL)
            </label>
            <input
              {...formPensao.register('codigo')}
              className="w-full px-3 py-1.5 border rounded-md"
            />
            {formPensao.formState.errors.codigo && (
              <p className="text-xs text-red-600 mt-1">
                {formPensao.formState.errors.codigo.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600">
              Descrição
            </label>
            <input
              {...formPensao.register('descricao')}
              placeholder="Ex: All Inclusive"
              className="w-full px-3 py-1.5 border rounded-md"
            />
            {formPensao.formState.errors.descricao && (
              <p className="text-xs text-red-600 mt-1">
                {formPensao.formState.errors.descricao.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600">
              Valor Adicional por PAX (R$)
            </label>
            <input
              type="number"
              step="0.01"
              {...formPensao.register('valorAdicional')}
              className="w-full px-3 py-1.5 border rounded-md"
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={mutPensao.isPending}
          >
            Cadastrar Pensão
          </Button>
        </form>

        <div className="pt-3 border-t text-xs space-y-1 text-slate-600">
          <strong className="block text-slate-800">Pensões no Banco:</strong>
          {pensoes.map((p) => (
            <div key={p.id} className="flex justify-between">
              <span>
                {p.codigo} - {p.descricao}
              </span>
              <strong>+R$ {p.valorAdicional.toFixed(2)}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Cadastro de Tarifa */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-800 border-b pb-2">
          2. Nova Tarifa
        </h2>
        <form
          onSubmit={formTarifa.handleSubmit((d) => mutTarifa.mutate(d))}
          className="space-y-3 text-sm"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-600">
              Nome da Tarifa
            </label>
            <input
              {...formTarifa.register('descricao')}
              placeholder="Ex: Tarifa Corporativa"
              className="w-full px-3 py-1.5 border rounded-md"
            />
            {formTarifa.formState.errors.descricao && (
              <p className="text-xs text-red-600 mt-1">
                {formTarifa.formState.errors.descricao.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600">
              Diária Base (R$)
            </label>
            <input
              type="number"
              step="0.01"
              {...formTarifa.register('valorBaseDiaria')}
              className="w-full px-3 py-1.5 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600">
              Pensão Padrão
            </label>
            <select
              {...formTarifa.register('idPensaoPadrao')}
              className="w-full px-2 py-1.5 border rounded-md bg-white"
            >
              {pensoes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.codigo} - {p.descricao}
                </option>
              ))}
            </select>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={mutTarifa.isPending}
          >
            Cadastrar Tarifa
          </Button>
        </form>

        <div className="pt-3 border-t text-xs space-y-1 text-slate-600">
          <strong className="block text-slate-800">Tarifas no Banco:</strong>
          {tarifas.map((t) => (
            <div key={t.id} className="flex justify-between">
              <span>
                {t.descricao} ({t.codigoPensao})
              </span>
              <strong>R$ {t.valorBaseDiaria.toFixed(2)}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Cadastro de Categoria de UH (NOVO!) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-800 border-b pb-2">
          3. Nova Categoria de UH
        </h2>
        <form
          onSubmit={formCategoriaUH.handleSubmit((d) =>
            mutCategoriaUH.mutate(d)
          )}
          className="space-y-3 text-sm"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-600">
              Código (Ex: STD, LUX, MASTER)
            </label>
            <input
              {...formCategoriaUH.register('codigo', {
                onChange: (e) => {
                  e.target.value = e.target.value.toUpperCase();
                },
              })}
              placeholder="Ex: LUX"
              className="w-full px-3 py-1.5 border rounded-md uppercase"
            />
            {formCategoriaUH.formState.errors.codigo && (
              <p className="text-xs text-red-600 mt-1">
                {formCategoriaUH.formState.errors.codigo.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600">
              Descrição da Categoria
            </label>
            <input
              {...formCategoriaUH.register('descricao')}
              placeholder="Ex: Suíte Luxo Frente Mar"
              className="w-full px-3 py-1.5 border rounded-md"
            />
            {formCategoriaUH.formState.errors.descricao && (
              <p className="text-xs text-red-600 mt-1">
                {formCategoriaUH.formState.errors.descricao.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={mutCategoriaUH.isPending}
          >
            {mutCategoriaUH.isPending ? 'Salvando...' : 'Cadastrar Categoria'}
          </Button>
        </form>

        <div className="pt-3 border-t text-xs space-y-1 text-slate-600">
          <strong className="block text-slate-800">
            Categorias de UH no Banco:
          </strong>
          {categoriasUH.length === 0 ? (
            <p className="text-slate-400 italic">
              Nenhuma categoria cadastrada ainda.
            </p>
          ) : (
            categoriasUH.map((c) => (
              <div key={c.id ?? c.codigo} className="flex justify-between">
                <span>
                  <strong>{c.codigo}</strong> - {c.descricao}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. Cadastro de UH */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-800 border-b pb-2">
          4. Nova UH
        </h2>
        <form
          onSubmit={formUH.handleSubmit((d) => mutUH.mutate(d))}
          className="space-y-3 text-sm"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-600">
              Número da UH
            </label>
            <input
              {...formUH.register('numeroUH')}
              placeholder="Ex: 401"
              className="w-full px-3 py-1.5 border rounded-md"
            />
            {formUH.formState.errors.numeroUH && (
              <p className="text-xs text-red-600 mt-1">
                {formUH.formState.errors.numeroUH.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600">
              Categoria
            </label>
            <select
              {...formUH.register('categoria')}
              className="w-full px-2 py-1.5 border rounded-md bg-white"
              disabled={categoriasUH.length === 0}
            >
              <option value={0}>
                {categoriasUH.length === 0
                  ? 'Cadastre uma categoria primeiro...'
                  : 'Selecione uma categoria...'}
              </option>
              {categoriasUH.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.codigo} - {c.descricao}
                </option>
              ))}
            </select>
            {formUH.formState.errors.categoria && (
              <p className="text-xs text-red-600 mt-1">
                {formUH.formState.errors.categoria.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600">
              Capacidade Máx (PAX)
            </label>
            <input
              type="number"
              {...formUH.register('capacidadeMaxima')}
              className="w-full px-3 py-1.5 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600">
              Tarifa Vinculada
            </label>
            <select
              {...formUH.register('idTarifa')}
              className="w-full px-2 py-1.5 border rounded-md bg-white"
            >
              {tarifas.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.descricao} (R$ {t.valorBaseDiaria.toFixed(2)})
                </option>
              ))}
            </select>
          </div>
          <Button
            type="submit"
            variant="success"
            className="w-full"
            disabled={mutUH.isPending}
          >
            Cadastrar UH
          </Button>
        </form>
      </div>
    </div>
  );
}