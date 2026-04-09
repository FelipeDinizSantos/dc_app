import { Produto } from "./Produto.interface";

export interface Item {
    id: number;
    id_venda: number;
    id_produto: number;
    valor_unitario: string;
    qtd: number;
    sub_total: string;
    created_at: string,
    updated_at: string,
    deleted_at?: string,
    produto: Produto;
}