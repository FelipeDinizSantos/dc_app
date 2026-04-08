import { Parcela } from "./Parcela.interface";

export interface Pagamento {
    id: number;
    id_venda: number;
    forma_de_pagamento: string;
    valor: string;
    created_at: Date,
    updated_at: Date;
    parcelas: Parcela[];
}