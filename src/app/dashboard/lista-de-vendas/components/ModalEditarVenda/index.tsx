import { Venda } from "@/interfaces/Venda.interface";
import listaVendasStyles from "./../../styles.module.css";
import { Cliente } from "@/interfaces/Cliente.interface";
import { Produto } from "@/interfaces/Produto.interface";
import { Dispatch, SetStateAction } from "react";
import { Parcela } from "@/interfaces/Parcela.interface";

export function ModalEditarVenda({
    vendaEditando,
    clientes,
    clienteEdit,
    setClienteEdit,
    numParcelasEdit,
    setNumParcelasEdit,
    gerarParcelasEdit,
    quantidadeEdit,
    produtos,
    valorUnitarioEdit,
    produtoSelecionadoEdit,
    setProdutoSelecionadoEdit,
    setValorUnitarioEdit,
    itensEdit,
    setQuantidadeEdit,
    adicionarItemEdit,
    atualizarItemEdit,
    parcelasEdit,
    removerItemEdit,
    handleParcelaEditChange,
    parcelasInputEdit,
    onClose,
    onSave,
}:
    {
        vendaEditando: Venda;
        clientes: Cliente[];
        quantidadeEdit: number;
        clienteEdit: number | "";
        valorUnitarioEdit: number;
        setClienteEdit: Dispatch<SetStateAction<number | "">>;
        produtos: Produto[];
        numParcelasEdit: number;
        setNumParcelasEdit: Dispatch<SetStateAction<number>>;
        setValorUnitarioEdit: Dispatch<SetStateAction<number>>;
        gerarParcelasEdit: () => void;
        setQuantidadeEdit: Dispatch<SetStateAction<number>>;
        itensEdit: any[];
        produtoSelecionadoEdit: any;
        setProdutoSelecionadoEdit: Dispatch<any>;
        parcelasEdit: Parcela[];
        adicionarItemEdit: () => void;
        handleParcelaEditChange: (id: number, campo: keyof Parcela, valorInput: string) => void;
        atualizarItemEdit: (index: number, campo: "quantidade" | "valorUnitario", valor: number) => void;
        removerItemEdit: (index: number) => void;
        parcelasInputEdit: { [key: number]: string };
        onClose: () => void;
        onSave: () => Promise<void>;
    }) {
    if (!vendaEditando) return null;

    return (
        <div className={listaVendasStyles.modalOverlay}>
            <h3 className={listaVendasStyles.modalTitulo}>
                Editar venda #{vendaEditando.id}
            </h3>

            <div className={listaVendasStyles.modalCampos}>
                <div className={listaVendasStyles.modalCampo}>
                    <label>Cliente</label>
                    <select value={clienteEdit} onChange={e => setClienteEdit(Number(e.target.value) || "")}>
                        <option value="">Selecione cliente</option>
                        {clientes.map(c => <option key={c.id} value={c.id}>{c.nome.toUpperCase()}</option>)}
                    </select>
                </div>
            </div>

            <hr className={listaVendasStyles.modalDivisor} />

            <p className={listaVendasStyles.modalSubtitulo}>Parcelas</p>

            <div className={listaVendasStyles.modalGerarParcelas}>
                <input
                    type="number"
                    min={1}
                    value={numParcelasEdit}
                    onChange={(e) => setNumParcelasEdit(Number(e.target.value))}
                />
                <button onClick={() => gerarParcelasEdit()}>Gerar</button>
            </div>

            <hr className={listaVendasStyles.modalDivisor} />

            <p className={listaVendasStyles.modalSubtitulo}>Itens</p>

            <div className={listaVendasStyles.modalGerarParcelas}>
                <select
                    className={listaVendasStyles.selectProduto}
                    value={produtoSelecionadoEdit?.id || ""}
                    onChange={(e) => {
                        const selected = produtos.find(p => p.id === Number(e.target.value));
                        setProdutoSelecionadoEdit(selected || null);
                        if (selected) {
                            setValorUnitarioEdit(selected.valor);
                            setQuantidadeEdit(1);
                        }
                    }}
                >
                    <option value="">Selecione produto</option>
                    {produtos.map(p => (
                        <option key={p.id} value={p.id}>
                            {p.nome} (R$ {p.valor})
                        </option>
                    ))}
                </select>

                {produtoSelecionadoEdit && (
                    <>
                        <input
                            type="number"
                            min={1}
                            value={quantidadeEdit}
                            onChange={(e) => setQuantidadeEdit(Number(e.target.value))}
                        />

                        <input
                            type="number"
                            value={valorUnitarioEdit}
                            onChange={(e) => setValorUnitarioEdit(Number(e.target.value))}
                        />

                        <button onClick={() => adicionarItemEdit()}>+</button>
                    </>
                )}
            </div>

            <table className={listaVendasStyles.modalTabela}>
                <thead>
                    <tr>
                        <th>Produto</th>
                        <th>Qtd</th>
                        <th>Valor</th>
                        <th>Subtotal</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {itensEdit.map((item: any, index: number) => (
                        <tr key={index}>
                            <td>{item.produto.nome}</td>
                            <td>
                                <input
                                    type="number"
                                    min={1}
                                    value={item.quantidade}
                                    onChange={(e) =>
                                        atualizarItemEdit(index, "quantidade", Number(e.target.value))
                                    }
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    value={item.valorUnitario}
                                    onChange={(e) =>
                                        atualizarItemEdit(index, "valorUnitario", Number(e.target.value))
                                    }
                                />
                            </td>
                            <td>R$ {item.subTotal.toFixed(2)}</td>
                            <td>
                                <button
                                    className={listaVendasStyles.btnRemoverItem}
                                    onClick={() => removerItemEdit(index)}
                                >
                                    🗑️
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <table className={listaVendasStyles.modalTabela}>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Vencimento</th>
                        <th>Valor</th>
                        <th>Forma de Pagamento</th>
                    </tr>
                </thead>
                <tbody>
                    {parcelasEdit.map((p: Parcela) => (
                        <tr key={p.id}>
                            <td>{p.id + 1}</td>
                            <td>
                                <input type="date" value={p.vencimento}
                                    onChange={(e) => handleParcelaEditChange(p.id, "vencimento", e.target.value)} />
                            </td>
                            <td>
                                <input type="number" value={parcelasInputEdit[p.id] ?? p.valor.toFixed(2)}
                                    onChange={(e) => handleParcelaEditChange(p.id, "valor", e.target.value)} />
                            </td>
                            <td>
                                <select value={p.formaPagamento}
                                    onChange={(e) => handleParcelaEditChange(p.id, "formaPagamento", e.target.value)}>
                                    <option value="dinheiro">Dinheiro</option>
                                    <option value="pix">Pix</option>
                                    <option value="boleto">Boleto</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <p className={listaVendasStyles.modalTotal}>
                Total: R$ {vendaEditando.valor_total}
            </p>

            <div className={listaVendasStyles.modalAcoes}>
                <button className={listaVendasStyles.btnCancelar} onClick={onClose}>Cancelar</button>
                <button className={listaVendasStyles.btnSalvar} onClick={onSave}>Salvar</button>
            </div>
        </div>
    );
}