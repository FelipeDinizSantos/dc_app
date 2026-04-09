
import toast from "react-hot-toast";
import styles from "./../../vendas.module.css";
import { Produto } from "@/interfaces/Produto.interface";
import { ItemVenda } from "@/interfaces/ItemVenda.interface";
import { Cliente } from "@/interfaces/Cliente.interface";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

export default function AbaItens({
    produtos,
    produtoSelecionado,
    setProdutoSelecionado,
    itensVenda,
    setItensVenda,
    quantidade,
    setQuantidade,
    valorUnitario,
    setValorUnitario,
    setAbaAtiva,
    clienteSelecionado,
    setValorTotal,
}: {
    produtos: Produto[];
    produtoSelecionado: Produto | null;
    setProdutoSelecionado: Dispatch<SetStateAction<Produto | null>>;
    itensVenda: ItemVenda[];
    setItensVenda: Dispatch<SetStateAction<ItemVenda[]>>;
    quantidade: number;
    setQuantidade: Dispatch<SetStateAction<number>>;
    valorUnitario: number;
    setValorUnitario: Dispatch<SetStateAction<number>>;
    setAbaAtiva: Dispatch<SetStateAction<any>>;
    clienteSelecionado: Cliente | null;
    setValorTotal: any;
}) {
    const [totalVenda, setTotalVenda] = useState<number>(0)

    const adicionarItem = () => {
        if (!produtoSelecionado) return;

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

    return (
        <>
            <>
                <div className={styles.itemVenda}>
                    <div className={styles.campo}>
                        <label className={styles.label}>Produto</label>
                        <select
                            className={styles.select}
                            value={produtoSelecionado?.id || ""}
                            onChange={(e) => {
                                const selected = produtos.find(p => p.id === Number(e.target.value));
                                setProdutoSelecionado(selected || null);
                            }}
                        >
                            <option value="">Selecione</option>
                            {produtos.map((produto) => (
                                <option key={produto.id} value={produto.id}>
                                    {produto.nome} (R$ {produto.valor})
                                </option>
                            ))}
                        </select>
                    </div>

                    {produtoSelecionado && (
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            adicionarItem();
                        }}>
                            <div className={styles.campo}>
                                <label className={styles.label}>Quantidade</label>
                                <input
                                    className={styles.input}
                                    type="number"
                                    min={1}
                                    value={quantidade}
                                    onChange={(e) => setQuantidade(Number(e.target.value))}
                                />
                            </div>
                            <div className={styles.campo}>
                                <label className={styles.label}>Valor Unitário</label>
                                <input
                                    className={styles.input}
                                    type="number"
                                    value={valorUnitario}
                                    onChange={(e) => setValorUnitario(Number(e.target.value))}
                                />
                            </div>
                            <div className={styles.campo}>
                                <label className={styles.label}>Subtotal</label>
                                <input
                                    className={styles.input}
                                    type="text"
                                    value={(quantidade * valorUnitario).toFixed(2)}
                                    readOnly
                                />
                            </div>
                            <button type="submit" className={styles.botaoAdicionar}>+</button>
                        </form>
                    )}
                </div>

                <hr className={styles.divisor} />

                <div>
                    <h3 className={styles.tituloSecao}>Itens adicionados</h3>
                    {itensVenda.length === 0 ? (
                        <p className={styles.vazio}>Nenhum item adicionado</p>
                    ) : (
                        <table className={styles.tabelaItens}>
                            <thead>
                                <tr>
                                    <th>Produto</th>
                                    <th>Quantidade</th>
                                    <th>Valor Unitário</th>
                                    <th>Subtotal</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {itensVenda.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.produto.nome}</td>
                                        <td>
                                            <input
                                                type="number"
                                                min={1}
                                                className={styles.input}
                                                value={item.quantidade}
                                                onChange={(e) => atualizarItem(index, "quantidade", Number(e.target.value))}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                min={0}
                                                className={styles.input}
                                                value={item.valorUnitario}
                                                onChange={(e) => atualizarItem(index, "valorUnitario", Number(e.target.value))}
                                            />
                                        </td>
                                        <td>R$ {item.subTotal.toFixed(2)}</td>
                                        <td>
                                            <button
                                                className={styles.botaoAdicionar}
                                                type="button"
                                                onClick={() => removerItem(index)}
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={3} className={styles.totalLabel}>Total:</td>
                                    <td colSpan={2}>R$ {totalVenda.toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    )}
                </div>

                <button className={styles.botao} onClick={() => {
                    if (itensVenda.length > 0 && clienteSelecionado) {
                        setAbaAtiva("pagamento");
                    } else {
                        toast.error("É necessário selecionar um cliente e ao menos um produto!")
                    }
                }}>Pagamento {'>'}</button>
            </>
        </>
    )
}