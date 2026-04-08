"use client";

import { Dispatch, SetStateAction, useState } from "react";
import styles from "./../../vendas.module.css";
import { Parcela } from "@/interfaces/Parcela.interface";
import { Cliente } from "@/interfaces/Cliente.interface";
import toast from "react-hot-toast";
import { ItemVenda } from "@/interfaces/ItemVenda.interface";

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
    // Campo input dos valores de cada parcela. Não são as parfcelas em si
    const [parcelasInput, setParcelasInput] = useState<{ [key: number]: string }>({});
    const [numParcelas, setNumParcelas] = useState<number>(1);
    const [parcelas, setParcelas] = useState<Parcela[]>([]);

    const gerarParcelas = () => {
        if (numParcelas <= 0) return;

        const valorInit = parseFloat((valorTotal / numParcelas).toFixed(2));
        const hoje = new Date();

        const parcelasFormat: Parcela[] = [];

        for (let i = 0; i < numParcelas; i++) {
            const vencimento = new Date(hoje);
            vencimento.setMonth(vencimento.getMonth() + i + 1);
            const vencimentoTxt = vencimento.toISOString().split("T")[0];

            const parcela: Parcela = {
                id: i,
                valor: valorInit,
                vencimento: vencimentoTxt,
                formaPagamento: "dinheiro",
            };

            parcelasFormat.push(parcela);
        }

        let soma = 0;
        for (let i = 0; i < parcelasFormat.length; i++) {
            soma += parcelasFormat[i].valor;
        }

        // Calcula a diferença gerada pelo arredondamento, subtraindo e jogando o valor na ultima parcela
        const diff = parseFloat((valorTotal - soma).toFixed(2));
        parcelasFormat[numParcelas - 1].valor += diff;
        setParcelas(parcelasFormat);
    };

    const handleChange = (id: number, campo: keyof Parcela, valorInput: string) => {
        if (campo === "valor") {
            setParcelasInput(prev => {
                const copia = { ...prev };
                copia[id] = valorInput;
                return copia;
            });

            setParcelas(prev => {
                const novasParcelas = [...prev];
                const index = novasParcelas.findIndex(p => p.id === id);
                if (index === -1) return prev;

                let valor = parseFloat(valorInput);
                if (isNaN(valor)) valor = 0;
                if (valor < 0) valor = 0;

                novasParcelas[index] = { ...novasParcelas[index], valor };

                //Apos mudancça verifica quanto sobra para completar o total da venda, e repassa para parcelas restantes
                const indicesOutrasParc: number[] = [];
                for (let i = 0; i < novasParcelas.length; i++) {
                    if (i !== index) {
                        indicesOutrasParc.push(i);
                    }
                }

                let totalOutrasParc = 0;
                for (let i = 0; i < indicesOutrasParc.length; i++) {
                    totalOutrasParc += novasParcelas[indicesOutrasParc[i]].valor;
                }
                const restante = parseFloat((valorTotal - valor - totalOutrasParc).toFixed(2));

                for (let i = 0; i < indicesOutrasParc.length; i++) {
                    const indice = indicesOutrasParc[i];

                    // Regra de tres para proporcao de cada parcela para com o total
                    const proporcao = novasParcelas[indice].valor / totalOutrasParc;
                    const novoValor = parseFloat((novasParcelas[indice].valor + proporcao * restante).toFixed(2));
                    novasParcelas[indice] = { ...novasParcelas[indice], valor: novoValor };
                }

                let somaFinal = 0;
                for (let i = 0; i < novasParcelas.length; i++) {
                    somaFinal += novasParcelas[i].valor;
                }

                // Resolve o mesmo B.O da GerarParcelas (diferença gerada pelo arredondamento)
                const diff = parseFloat((valorTotal - somaFinal).toFixed(2));
                const last = novasParcelas.length - 1;
                novasParcelas[last] = { ...novasParcelas[last], valor: novasParcelas[last].valor + diff };

                setParcelasInput(prev => {
                    const copia = { ...prev };

                    // Usei para remover os inputs antigos e trocar pelos novos re calculados. Para tirar a inconsistencia da UI 
                    for (let i = 0; i < indicesOutrasParc.length; i++) {
                        const indice = indicesOutrasParc[i];
                        delete copia[novasParcelas[indice].id];
                    }

                    return copia;
                });

                return novasParcelas;
            });
        } else {
            setParcelas(prev => {
                const novasParcelas = [...prev];
                const index = novasParcelas.findIndex(p => p.id === id);
                if (index === -1) return prev;
                novasParcelas[index] = { ...novasParcelas[index], [campo]: valorInput };
                return novasParcelas;
            });
        }
    };

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

    return (
        <>
            <div className={styles.painelPagamento}>
                <div className={styles.painelEsquerdo}>
                    <h2 className={styles.tituloSecao}>Pagamento</h2>
                    <form
                        className={styles.formParcelas}
                        onSubmit={(e) => { e.preventDefault(); gerarParcelas(); }}
                    >
                        <div className={styles.campo}>
                            <label className={styles.label}>Número de parcelas</label>
                            <input
                                className={styles.input}
                                type="number"
                                min={1}
                                value={numParcelas}
                                onChange={(e) => setNumParcelas(parseInt(e.target.value))}
                            />
                        </div>
                        <button type="submit" className={styles.botaoAdicionar} title="Gerar">
                            Gerar Parcelas
                        </button>
                    </form>
                </div>

                <div className={styles.painelDireito}>
                    <h3 className={styles.tituloSecao}>Parcelas</h3>

                    {parcelas.length === 0 ? (
                        <p className={styles.vazio}>Nenhuma parcela gerada.</p>
                    ) : (
                        <table className={styles.tabelaItens}>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Vencimento</th>
                                    <th>Valor</th>
                                    <th>Forma de Pagamento</th>
                                </tr>
                            </thead>
                            <tbody>
                                {parcelas.map((parcela) => (
                                    <tr key={parcela.id}>
                                        <td className={styles.totalLabel} style={{ width: 32 }}>
                                            {parcela.id + 1}
                                        </td>
                                        <td>
                                            <input
                                                className={`${styles.input} ${styles.inputTabela}`}
                                                type="date"
                                                value={parcela.vencimento}
                                                onChange={(e) => handleChange(parcela.id, "vencimento", e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                className={`${styles.input} ${styles.inputTabela}`}
                                                type="number"
                                                value={parcelasInput[parcela.id] ?? parcela.valor.toFixed(2)}
                                                step={0.01}
                                                min={0}
                                                onChange={(e) => handleChange(parcela.id, "valor", e.target.value)}
                                                onBlur={() => setParcelasInput(prev => {
                                                    const next = { ...prev };
                                                    delete next[parcela.id];
                                                    return next;
                                                })}
                                            />
                                        </td>
                                        <td>
                                            <select
                                                className={`${styles.select} ${styles.selectTabela}`}
                                                value={parcela.formaPagamento}
                                                onChange={(e) => handleChange(parcela.id, "formaPagamento", e.target.value as Parcela["formaPagamento"])}
                                            >
                                                <option value="dinheiro">Dinheiro</option>
                                                <option value="cartao_credito">Cartão Crédito</option>
                                                <option value="cartao_debito">Cartão Débito</option>
                                                <option value="pix">Pix</option>
                                                <option value="boleto">Boleto</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={2} className={styles.totalLabel}>Total:</td>
                                    <td>{valorTotal.toFixed(2)}</td>
                                    <td />
                                </tr>
                            </tfoot>
                        </table>
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