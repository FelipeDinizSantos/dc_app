import { Parcela } from "@/interfaces/Parcela.interface";
import { Dispatch, SetStateAction } from "react";

import styles from "./styles.module.css";

export function TabelaParcelas(
{
    parcelas,
    parcelasInput,
    valorTotal,
    onChangeInput,
    onBlurInput,
}
:
{
    parcelas: Parcela[];
    parcelasInput: { [key: number]: string };
    valorTotal: number;
    onChangeInput: (id: number, campo: keyof Parcela, valorInput: string) => void;
    onBlurInput: Dispatch<SetStateAction<{ [key: number]: string }>>;
}) {
    return (
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
                                onChange={(e) => onChangeInput(parcela.id, "vencimento", e.target.value)}
                            />
                        </td>
                        <td>
                            <input
                                className={`${styles.input} ${styles.inputTabela}`}
                                type="number"
                                value={parcelasInput[parcela.id] ?? parcela.valor.toFixed(2)}
                                step={0.01}
                                min={0}
                                onChange={(e) => onChangeInput(parcela.id, "valor", e.target.value)}
                                onBlur={() => onBlurInput(prev => {
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
                                onChange={(e) => onChangeInput(parcela.id, "formaPagamento", e.target.value as Parcela["formaPagamento"])}
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
    );
}