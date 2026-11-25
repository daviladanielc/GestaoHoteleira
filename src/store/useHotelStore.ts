import { create } from 'zustand';

export type StatusUH = 'LIVRE' | 'OCUPADA' | 'MANUTENCAO';

export interface Pensao {
  id: number;
  codigo: string;
  descricao: string;
  valorAdicional: number;
}

export interface CategoriaUH {
  id: number;
  codigo: string;
  descricao: string;
}

export interface Tarifa {
  id: number;
  descricao: string;
  valorBaseDiaria: number;
  idPensaoPadrao: number;
  codigoPensao?: string;
  descricaoPensao?: string;
}

export interface Hospede {
  id?: number;
  nome: string;
  cpf: string;
  idPensao: number;
  codigoPensao?: string;
  valorAdicional?: number;
  titular: boolean;
}

export interface UH {
  numeroUH: string;
  categoria: number;
  codigoCategoria?: string;
  descricaoCategoria?: string;
  capacidadeMaxima: number;
  status: StatusUH;
  qtdePessoas: number;
  idTarifa: number;
  descricaoTarifa: string;
  valorBaseDiaria: number;
  idPensaoPadrao: number;
  valorDiariaTotal: number;
  hospedes: Hospede[];
}

interface HotelStore {
  operador: string;
  filtroStatus: StatusUH | 'TODAS';
  setFiltroStatus: (filtro: StatusUH | 'TODAS') => void;
}

export const useHotelStore = create<HotelStore>((set) => ({
  operador: 'Daniel (Recepção Turno A)',
  filtroStatus: 'TODAS',
  setFiltroStatus: (filtro) => set({ filtroStatus: filtro }),
}));