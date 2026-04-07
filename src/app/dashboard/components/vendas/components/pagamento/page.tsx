"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import styles from "./../../vendas.module.css";
import { Produto } from "@/interfaces/Produto.interface";
import toast from "react-hot-toast";
import { ItemVenda } from "@/interfaces/ItemVenda.interface";
import { Cliente } from "@/interfaces/Cliente.interface";
import AbaItens from "../abaItens/abaItens";
import AbaPagamentos from "../abaPagamento/page";

type Aba = "itens" | "pagamento";

export default function Pagamentos({
    itensVenda,
    setItensVenda,
    clienteSelecionado
}:
    {
        itensVenda: ItemVenda[]
        setItensVenda: Dispatch<SetStateAction<ItemVenda[]>>
        clienteSelecionado: Cliente | null
    }) {
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
    const [quantidade, setQuantidade] = useState<number>(1);
    const [valorUnitario, setValorUnitario] = useState<number>(0);
    const [abaAtiva, setAbaAtiva] = useState<Aba>("itens");
    const [valorTotal, setValorTotal] = useState<number>(0);

    useEffect(() => {
        const fetchProdutos = async () => {
            try {
                const res = await fetch(`/api/laravel/produtos`, {
                    method: "GET",
                    credentials: "include",
                });

                if (!res.ok) throw new Error("Erro ao buscar produtos");

                const data: Produto[] = await res.json();
                setProdutos(data);
            } catch (error: any) {
                console.error(error);
                toast.error(error.message);
            }
        };
        fetchProdutos();
    }, []);

    useEffect(() => {
        if (produtoSelecionado) {
            setValorUnitario(produtoSelecionado.valor);
            setQuantidade(1);
        }
    }, [produtoSelecionado]);

    return (
        <div className={styles.container}>
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${abaAtiva === "itens" ? styles.ativo : ""}`}
                >
                    Itens
                </button>
                <button
                    className={`${styles.tab} ${abaAtiva === "pagamento" ? styles.ativo : ""}`}
                    onClick={() => {
                        toast.error("Deve preencher as informações antes de prosseguir!");
                    }}
                >
                    Pagamento
                </button>
            </div>

            <div className={styles.conteudo}>
                {abaAtiva == "itens" && (
                    <AbaItens
                        quantidade={quantidade}
                        produtos={produtos}
                        setProdutoSelecionado={setProdutoSelecionado}
                        setItensVenda={setItensVenda}
                        setQuantidade={setQuantidade}
                        valorUnitario={valorUnitario}
                        setValorUnitario={setValorUnitario}
                        setAbaAtiva={setAbaAtiva}
                        produtoSelecionado={produtoSelecionado}
                        clienteSelecionado={clienteSelecionado}
                        itensVenda={itensVenda}
                        setValorTotal={setValorTotal}
                    />
                )}

                {abaAtiva === "pagamento" && (
                    <AbaPagamentos
                        valorTotal={valorTotal}
                        setAbaAtiva={setAbaAtiva}
                        itensVenda={itensVenda}
                        clienteSelecionado={clienteSelecionado}
                    />
                )}
            </div>
        </div>
    );
}