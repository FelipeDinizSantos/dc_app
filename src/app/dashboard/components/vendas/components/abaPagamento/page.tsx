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
    const [parcelasInput, setParcelasInput] = useState<{ [key: number]: string }>({});
    const [numParcelas, setNumParcelas] = useState<number>(1);
    const [parcelas, setParcelas] = useState<Parcela[]>([]);

    const gerarParcelas = () => {
        if (numParcelas <= 0) return;

        const valorBase = parseFloat((valorTotal / numParcelas).toFixed(2));
        const hoje = new Date();

        const novoArray: Parcela[] = Array.from({ length: numParcelas }, (_, i) => {
            const vencimento = new Date(hoje);
            vencimento.setMonth(vencimento.getMonth() + i + 1);

            const vencimentoStr = vencimento.toISOString().split("T")[0];

            return {
                id: i,
                valor: valorBase,
                vencimento: vencimentoStr,
                formaPagamento: "dinheiro",
            };
        });

        const soma = novoArray.reduce((acc, p) => acc + p.valor, 0);
        const diff = parseFloat((valorTotal - soma).toFixed(2));
        novoArray[numParcelas - 1].valor += diff;

        setParcelas(novoArray);
    };

    const handleParcelaChange = (id: number, campo: keyof Parcela, valor: string) => {
        if (campo === "valor") {
            setParcelasInput(prev => ({ ...prev, [id]: valor }));

            setParcelas(prev => {
                const novasParcelas = [...prev];
                const idx = novasParcelas.findIndex(p => p.id === id);
                if (idx === -1) return prev;

                let valorNum = parseFloat(valor);
                if (isNaN(valorNum)) valorNum = 0;
                if (valorNum < 0) valorNum = 0;

                novasParcelas[idx] = { ...novasParcelas[idx], valor: valorNum };

                const indicesOutros = novasParcelas.map((_, i) => i).filter(i => i !== idx);
                const totalOutros = indicesOutros.reduce((acc, i) => acc + novasParcelas[i].valor, 0);
                const restante = parseFloat(
                    (valorTotal - valorNum - indicesOutros.reduce((acc, i) => acc + novasParcelas[i].valor, 0)).toFixed(2)
                );

                if (totalOutros > 0) {
                    indicesOutros.forEach(i => {
                        const proporcao = novasParcelas[i].valor / totalOutros;
                        novasParcelas[i] = {
                            ...novasParcelas[i],
                            valor: parseFloat((novasParcelas[i].valor + proporcao * restante).toFixed(2))
                        };
                    });
                } else if (indicesOutros.length > 0) {
                    const valorDistribuir = parseFloat((restante / indicesOutros.length).toFixed(2));
                    indicesOutros.forEach(i => {
                        novasParcelas[i] = { ...novasParcelas[i], valor: valorDistribuir };
                    });
                }

                const somaFinal = novasParcelas.reduce((acc, p) => acc + p.valor, 0);
                const diff = parseFloat((valorTotal - somaFinal).toFixed(2));
                const last = novasParcelas.length - 1;
                novasParcelas[last] = { ...novasParcelas[last], valor: novasParcelas[last].valor + diff };

                setParcelasInput(prev => {
                    const next = { ...prev };
                    indicesOutros.forEach(i => delete next[novasParcelas[i].id]);
                    return next;
                });

                return novasParcelas;
            });
        } else {
            setParcelas(prev => {
                const novasParcelas = [...prev];
                const idx = novasParcelas.findIndex(p => p.id === id);
                if (idx === -1) return prev;
                novasParcelas[idx] = { ...novasParcelas[idx], [campo]: valor };
                return novasParcelas;
            });
        }
    };

    const salvarVenda = async () => {
        const salvar = confirm("Tem certeza que deseja salvar a venda?");
        if (!salvar) return;

        if (!clienteSelecionado) {
            toast.error("Um cliente precisa estar selecionado!");
            return;
        }

        const dataInvalida = parcelas.some(p => !p.vencimento || isNaN(new Date(p.vencimento).getTime()));
        if (dataInvalida) {
            toast.error("Todas as parcelas devem ter uma data de vencimento válida.");
            return;
        }

        const temValorNegativo = parcelas.some(p => p.valor < 0);

        if (temValorNegativo) {
            toast.error("Não é permitido parcelas com valor negativo.");
            return;
        }

        const somaParcelas = parcelas.reduce((acc, p) => acc + p.valor, 0);

        const soma = Number(somaParcelas.toFixed(2));
        const total = Number(valorTotal.toFixed(2));

        if (soma < total) {
            toast.error(`A soma das parcelas (${soma.toFixed(2)}) é MENOR que o total (${total.toFixed(2)}).`);
            return;
        }

        if (soma > total) {
            toast.error(`A soma das parcelas (${soma.toFixed(2)}) é MAIOR que o total (${total.toFixed(2)}).`);
            return;
        }

        const itensParaPayload = itensVenda.map(item => ({
            id_produto: item.produto.id,
            valor_unitario: Number(item.valorUnitario),
            qtd: item.quantidade
        }));

        const parcelasParaPayload = parcelas.map(p => ({
            valor: p.valor,
            data_vencimento: p.vencimento,
            forma_de_pagamento: p.formaPagamento
        }));

        const payload = {
            id_cliente: clienteSelecionado.id,
            items: itensParaPayload,
            parcelas: parcelasParaPayload
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
                                                onChange={(e) => handleParcelaChange(parcela.id, "vencimento", e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                className={`${styles.input} ${styles.inputTabela}`}
                                                type="number"
                                                value={parcelasInput[parcela.id] ?? parcela.valor.toFixed(2)}
                                                step={0.01}
                                                min={0}
                                                onChange={(e) => handleParcelaChange(parcela.id, "valor", e.target.value)}
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
                                                onChange={(e) => handleParcelaChange(parcela.id, "formaPagamento", e.target.value as Parcela["formaPagamento"])}
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