import { ItemVenda } from "@/interfaces/ItemVenda.interface";
import styles from "./styles.module.css";

export function TabelaItens(
{
    itensVenda,
    onRemover,
    onAtualizar,
    totalVenda
}:
{
    itensVenda: ItemVenda[];
    onRemover: (index: number) => void;
    onAtualizar: (index: number, campo: "quantidade" | "valorUnitario", valor: number) => void;
    totalVenda: number;
}) {
    return (
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
                                onChange={(e) => onAtualizar(index, "quantidade", Number(e.target.value))}
                            />
                        </td>
                        <td>
                            <input
                                type="number"
                                min={0}
                                className={styles.input}
                                value={item.valorUnitario}
                                onChange={(e) => onAtualizar(index, "valorUnitario", Number(e.target.value))}
                            />
                        </td>
                        <td>R$ {item.subTotal.toFixed(2)}</td>
                        <td>
                            <button
                                className={styles.botaoAdicionar}
                                type="button"
                                onClick={() => onRemover(index)}
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
    );
}