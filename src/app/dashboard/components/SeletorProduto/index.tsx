import { Produto } from "@/interfaces/Produto.interface";
import styles from "./styles.module.css";
import { Dispatch, SetStateAction } from "react";

export function SeletorProduto(
{
    produtos,
    produtoSelecionado,
    setProdutoSelecionado,
    quantidade,
    setQuantidade,
    valorUnitario,
    setValorUnitario,
    onAdicionar
}:
{
    produtos: Produto[];
    produtoSelecionado: Produto | null;
    setProdutoSelecionado: Dispatch<SetStateAction<Produto | null>>;
    quantidade: number;
    setQuantidade: Dispatch<SetStateAction<number>>;
    valorUnitario: number;
    setValorUnitario: Dispatch<SetStateAction<number>>;
    onAdicionar: (produtoSelecionado: Produto, quantidade: number, valorUnitario: number) => void;
}) {
    return (
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
                    onAdicionar(produtoSelecionado, quantidade, valorUnitario);
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
    );
}