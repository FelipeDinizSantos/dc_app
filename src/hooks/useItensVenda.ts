import { ItemVenda } from "@/interfaces/ItemVenda.interface";
import { Produto } from "@/interfaces/Produto.interface";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useProdutoSelecionado } from "./useProdutoSelecionado";

export function useItensVenda({
    setValorTotal,
    setTotalVenda,
    itensVenda,
    setItensVenda
}: {
    setValorTotal: Dispatch<SetStateAction<number>>;
    setTotalVenda: Dispatch<SetStateAction<number>>;
    itensVenda: ItemVenda[];
    setItensVenda: Dispatch<SetStateAction<ItemVenda[]>>;
}) {
    const {
        setProdutoSelecionado,
        setQuantidade,
        setValorUnitario,
    } = useProdutoSelecionado();

    const adicionarItem = (produtoSelecionado: Produto, quantidade: number, valorUnitario: number) => {
        if (!produtoSelecionado) return;
        if (quantidade <= 0) {
            toast.error("Quantidade deve ser maior que zero.");
            return;
        }
        if (valorUnitario < 0) {
            toast.error("Valor unitário não pode ser negativo.");
            return;
        }

        const novoItem: ItemVenda = {
            produto: produtoSelecionado,
            quantidade,
            valorUnitario,
            subTotal: quantidade * valorUnitario,
        };

        setItensVenda([...itensVenda, novoItem]);
        setProdutoSelecionado(null);
        setQuantidade(1);
        setValorUnitario(0);
    };

    const removerItem = (index: number) => {
        const listaAtualizada = itensVenda.filter((_, i) => i !== index);
        setItensVenda(listaAtualizada);
    };

    const atualizarItem = (index: number, campo: "quantidade" | "valorUnitario", valor: number) => {
        const listaAtualizada = [...itensVenda];
        const item = listaAtualizada[index];
        item[campo] = valor;
        item.subTotal = item.quantidade * item.valorUnitario;
        setItensVenda(listaAtualizada);
    };

    useEffect(() => {
        let total = 0;
        for (let i = 0; i < itensVenda.length; i++) {
            total += itensVenda[i].subTotal;
        }
        setTotalVenda(total);
        setValorTotal(total);
    }, [itensVenda]);

    return { itensVenda, adicionarItem, removerItem, atualizarItem };
}