"use client";

import { useState } from "react";
import styles from "./../../vendas.module.css";
import toast from "react-hot-toast";
import { ItemVenda } from "@/interfaces/ItemVenda.interface";
import { Cliente } from "@/interfaces/Cliente.interface";
import AbaItens from "../AbaItens";
import AbaPagamentos from "../AbaPagamento";
import { useProdutos } from "@/hooks/useProdutos";
import { useProdutoSelecionado } from "@/hooks/useProdutoSelecionado";

type Aba = "itens" | "pagamento";

export default function Pagamentos({
    clienteSelecionado
}:
    {
        clienteSelecionado: Cliente | null
    }) {
    const [itensVenda, setItensVenda] = useState<ItemVenda[]>([]);
    const [abaAtiva, setAbaAtiva] = useState<Aba>("itens");
    const [valorTotal, setValorTotal] = useState<number>(0);

    const { produtos, loading } = useProdutos();

    if (loading) return <p>Carregando...</p>

    return (
        <div className={styles.container}>
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${abaAtiva === "itens" ? styles.ativo : ""}`}
                    onClick={() => {
                        setAbaAtiva("itens");
                    }}
                >
                    Itens
                </button>
                <button
                    className={`${styles.tab} ${abaAtiva === "pagamento" ? styles.ativo : ""}`}
                    onClick={() => {
                        if (itensVenda.length === 0) {
                            toast.error("Adicione ao menos um item antes de prosseguir.");
                            return;
                        }

                        if (!clienteSelecionado) {
                            toast.error("Associe um cliente a venda.");
                            return;
                        }

                        setAbaAtiva("pagamento");
                    }}
                >
                    Pagamento
                </button>
            </div>

            <div className={styles.conteudo}>
                {abaAtiva == "itens" && (
                    <AbaItens
                        produtos={produtos}
                        setItensVenda={setItensVenda}
                        setAbaAtiva={setAbaAtiva}
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