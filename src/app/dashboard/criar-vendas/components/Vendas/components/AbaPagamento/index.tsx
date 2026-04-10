"use client";

import { Dispatch, SetStateAction, useState } from "react";
import styles from "./../../vendas.module.css";
import { Cliente } from "@/interfaces/Cliente.interface";
import toast from "react-hot-toast";
import { ItemVenda } from "@/interfaces/ItemVenda.interface";
import { useParcelas } from "@/hooks/useParcelas";
import { ParcelasForm } from "@/app/dashboard/components/ParcelasForm";
import { TabelaParcelas } from "@/app/dashboard/components/TabelaParcelas";
import { useSalvarVenda } from "@/hooks/useSalvarVenda";

export default function AbaPagamentos({
    valorTotal,
    setAbaAtiva,
    clienteSelecionado,
    itensVenda
}: {
    setAbaAtiva: Dispatch<SetStateAction<any>>;
    valorTotal: number;
    clienteSelecionado: Cliente | null;
    itensVenda: ItemVenda[]
}) {
    const {
        parcelas,
        parcelasInput,
        numParcelas,
        setNumParcelas,
        gerarParcelas,
        handleChange,
        setParcelasInput,
    } = useParcelas(valorTotal);

    const { salvarVenda } = useSalvarVenda({ clienteSelecionado, itensVenda, parcelas, valorTotal });

    return (
        <>
            <div className={styles.painelPagamento}>
                <div className={styles.painelEsquerdo}>
                    <h2 className={styles.tituloSecao}>Pagamento</h2>
                    <ParcelasForm
                        gerar={gerarParcelas}
                        numParcelas={numParcelas}
                        setNumParcelas={setNumParcelas}
                    />
                </div>

                <div className={styles.painelDireito}>
                    <h3 className={styles.tituloSecao}>Parcelas</h3>

                    {parcelas.length === 0 ? (
                        <p className={styles.vazio}>Nenhuma parcela gerada.</p>
                    ) : (
                        <TabelaParcelas
                            parcelas={parcelas}
                            parcelasInput={parcelasInput}
                            onChangeInput={handleChange}
                            onBlurInput={setParcelasInput}
                            valorTotal={valorTotal}
                        />
                    )}
                </div>
            </div>

            <hr className={styles.divisor} />

            <div className={styles.acoes}>
                <button className={styles.botao} onClick={() => setAbaAtiva("itens")}>
                    Voltar
                </button>
                <button className={styles.botao} onClick={() => salvarVenda()}>
                    Salvar Venda
                </button>
            </div>
        </>
    );
}