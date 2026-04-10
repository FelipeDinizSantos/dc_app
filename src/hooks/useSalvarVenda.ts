import { Cliente } from "@/interfaces/Cliente.interface";
import { ItemVenda } from "@/interfaces/ItemVenda.interface";
import { Parcela } from "@/interfaces/Parcela.interface";
import toast from "react-hot-toast";

export function useSalvarVenda(
{
    clienteSelecionado, 
    itensVenda, 
    parcelas, 
    valorTotal 
}:
{
    clienteSelecionado: Cliente | null;
    itensVenda: ItemVenda[];
    parcelas: Parcela[];
    valorTotal: number;
}) {
    const salvarVenda = async () => {
        if (!confirm("Tem certeza que deseja salvar a venda?")) return;

        if (!clienteSelecionado) {
            toast.error("Um cliente precisa estar selecionado!");
            return;
        }

        const temValorNegativo = parcelas.some(p => p.valor < 0);
        if (temValorNegativo) {
            toast.error("Não é permitido parcelas com valor negativo.");
            return;
        }

        let soma = 0;
        for (let i = 0; i < parcelas.length; i++) {
            soma += parcelas[i].valor;
        }
        soma = Number(soma.toFixed(2));
        const total = Number(valorTotal.toFixed(2));

        if (soma < total) {
            toast.error(`Soma das parcelas é MENOR que o total!`);
            return;
        }

        if (soma > total) {
            toast.error(`Soma das parcelas é MAIOR que o total!`);
            return;
        }

        const itensPayload = itensVenda.map(item => ({
            id_produto: item.produto.id,
            valor_unitario: Number(item.valorUnitario),
            qtd: item.quantidade
        }));

        const parcelasPayload = parcelas.map(p => ({
            valor: p.valor,
            data_vencimento: p.vencimento,
            forma_de_pagamento: p.formaPagamento
        }));

        const payload = {
            id_cliente: clienteSelecionado.id,
            items: itensPayload,
            parcelas: parcelasPayload
        };

        try {
            const res = await fetch(`/api/laravel/vendas`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Erro ao registrar venda");

            toast.success("Venda registrada com sucesso!");
            setTimeout(() => {
                window.location.reload();
            }, 500);
        } catch (err: unknown) {
            if (err instanceof Error) toast.error(err.message);
            else toast.error("Ocorreu um erro inesperado!");
        }
    };

    return { salvarVenda };
}