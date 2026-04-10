import { Produto } from "@/interfaces/Produto.interface";
import { useEffect, useState } from "react";

export function useProdutoSelecionado() {
    const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
    const [quantidade, setQuantidade] = useState<number>(1);
    const [valorUnitario, setValorUnitario] = useState<number>(0);

    useEffect(() => {
        if (produtoSelecionado) {
            setValorUnitario(produtoSelecionado.valor);
            setQuantidade(1);
        }
    }, [produtoSelecionado]);

    return {
        produtoSelecionado,
        setProdutoSelecionado,
        quantidade,
        setQuantidade,
        valorUnitario,
        setValorUnitario,
    };
}