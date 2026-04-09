import { User } from '@/interfaces/Usuario.interface';
import { Cliente } from "./Cliente.interface";
import { Pagamento } from "./Pagamento.interface";
import { Item } from './Item.interface';

export interface Venda {
    id: number;
    id_usuario: number;
    id_cliente: number;
    cliente?: Cliente;
    usuario?: User;
    valor_total: string;
    data: Date;
    created_at: Date,
    updated_at: Date;
    pagamento: Pagamento;
    itens: Item[];
}