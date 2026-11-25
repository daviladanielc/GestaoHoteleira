import axios from 'axios';
import type { UH, Pensao, Tarifa, CategoriaUH } from '../store/useHotelStore';

export const api = axios.create({
  baseURL: 'http://localhost:3333',
});

export async function buscarUHs(): Promise<UH[]> {
  const { data } = await api.get<UH[]>('/uhs');
  return data;
}

export async function criarUH(novaUH: {
  numeroUH: string;
  categoria: number;
  capacidadeMaxima: number;
  idTarifa: number;
}) {
  const { data } = await api.post('/uhs', novaUH);
  return data;
}

export async function atualizarUH(
  numeroUH: string,
  dados: Partial<Pick<UH, 'status' | 'qtdePessoas' | 'hospedes'>>
) {
  const { data } = await api.patch(`/uhs/${numeroUH}`, dados);
  return data;
}

export async function buscarPensoes(): Promise<Pensao[]> {
  const { data } = await api.get<Pensao[]>('/pensoes');
  return data;
}

export async function criarPensao(novaPensao: Omit<Pensao, 'id'>) {
  const { data } = await api.post('/pensoes', novaPensao);
  return data;
}

export async function buscarCategoriasUH(): Promise<CategoriaUH[]> {
  const { data } = await api.get<CategoriaUH[]>('/categorias_uh');
  return data;
}

export async function criarCategoriaUH(novaCategoria: Omit<CategoriaUH, 'id'>) {
  const { data } = await api.post('/categorias_uh', novaCategoria);
  return data;
}

export async function buscarTarifas(): Promise<Tarifa[]> {
  const { data } = await api.get<Tarifa[]>('/tarifas');
  return data;
}

export async function criarTarifa(novaTarifa: {
  descricao: string;
  valorBaseDiaria: number;
  idPensaoPadrao: number;
}) {
  const { data } = await api.post('/tarifas', novaTarifa);
  return data;
}