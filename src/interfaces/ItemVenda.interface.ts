import { Produto } from "./Produto.interface";

export interface ItemVenda {
    produto: Produto;
    quantidade: number;
    valorUnitario: number;
    subTotal: number;
}