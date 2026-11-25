import { z } from 'zod';

// Schema dinâmico do Check-in (recebe a capacidade máxima da UH)
export const criarCheckinSchema = (capacidadeMaxima: number) =>
  z.object({
    hospedes: z
      .array(
        z.object({
          nome: z.string().min(3, 'Mínimo 3 letras'),
          cpf: z.string().regex(/^\d{11}$/, 'Informe 11 dígitos numéricos'),
          idPensao: z.coerce.number().min(1, 'Selecione a pensão'),
          titular: z.boolean(),
        })
      )
      .min(1, 'Vincule pelo menos 1 hóspede.')
      .max(capacidadeMaxima, `Capacidade máxima de ${capacidadeMaxima} PAX excedida.`)
      .refine((lista) => lista.filter((h) => h.titular).length === 1, {
        message: 'Deve haver exatamente 1 hóspede marcado como Titular da conta.',
      }),
  });

export type CheckinFormInput = z.input<ReturnType<typeof criarCheckinSchema>>;
export type CheckinFormData = z.infer<ReturnType<typeof criarCheckinSchema>>;

// Schemas dos Cadastros Base
export const pensaoSchema = z.object({
  codigo: z.string().min(2, 'Mín. 2 caracteres').max(10),
  descricao: z.string().min(3, 'Informe a descrição'),
  valorAdicional: z.coerce.number().min(0, 'Valor inválido'),
});
export type PensaoFormInput = z.input<typeof pensaoSchema>;
export type PensaoFormData = z.infer<typeof pensaoSchema>;

export const categoriaUHSchema = z.object({
  codigo: z.string().min(2, 'Mín. 2 caracteres').max(10),
  descricao: z.string().min(3, 'Informe a descrição'),
});
export type CategoriaUHFormData = z.infer<typeof categoriaUHSchema>;

export const tarifaSchema = z.object({
  descricao: z.string().min(3, 'Informe a descrição da tarifa'),
  valorBaseDiaria: z.coerce.number().positive('Deve ser maior que zero'),
  idPensaoPadrao: z.coerce.number().min(1, 'Selecione uma pensão'),
});
export type TarifaFormInput = z.input<typeof tarifaSchema>;
export type TarifaFormData = z.infer<typeof tarifaSchema>;

export const uhSchema = z.object({
  numeroUH: z.string().min(1, 'Informe o número da UH'),
  categoria: z.coerce.number().min(1, 'Selecione uma categoria'),
  capacidadeMaxima: z.coerce.number().int().min(1).max(12),
  idTarifa: z.coerce.number().min(1, 'Selecione uma tarifa'),
});
export type UHFormInput = z.input<typeof uhSchema>;
export type UHFormData = z.infer<typeof uhSchema>;