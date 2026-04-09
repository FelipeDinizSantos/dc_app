export interface Parcela {
    id: number;
    valor: number;
    vencimento: string;
    data_vencimento?: string;
    formaPagamento: "dinheiro" | "cartao_credito" | "cartao_debito" | "pix" | "boleto";
    forma_de_pagamento?: "dinheiro" | "cartao_credito" | "cartao_debito" | "pix" | "boleto";
}
