export interface Parcela {
    id: number;
    valor: number;
    vencimento: string;
    formaPagamento: "dinheiro" | "cartao_credito" | "cartao_debito" | "pix" | "boleto";
}
