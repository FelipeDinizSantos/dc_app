import { Venda } from "@/interfaces/Venda.interface";
import listaVendasStyles from "./../../styles.module.css";

export function TabelaVendas({
    vendasFiltradas,
    onEditar,
    onExcluir
}: {
    vendasFiltradas: Venda[];
    onEditar: (venda: Venda) => void;
    onExcluir: (venda: Venda) => Promise<void>;
}) {
    return (
        <table className={listaVendasStyles.tabela}>
            <thead className={listaVendasStyles.cabecalho}>
                <tr>
                    <th>#</th>
                    <th>Cliente</th>
                    <th>Data de Registro</th>
                    <th>Forma de Pagamento</th>
                    <th>Usuario</th>
                    <th>Valor Integral</th>
                    <th>Número de Parcelas</th>
                    <th>Ações</th>
                </tr>
            </thead>

            <tbody>
                {vendasFiltradas.length === 0 ? (
                    <tr>
                        <td colSpan={8}>Nenhuma venda registrada</td>
                    </tr>
                ) : (
                    vendasFiltradas.map(venda => (
                        <tr key={venda.id} className={listaVendasStyles.linha}>
                            <td className={listaVendasStyles.id}>{venda.id}</td>
                            <td>{venda.cliente?.nome.toUpperCase()}</td>
                            <td>
                                {new Intl.DateTimeFormat('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                }).format(new Date(venda.data))}
                            </td>
                            <td>{venda.pagamento.forma_de_pagamento.toUpperCase()}</td>
                            <td>{venda.usuario?.nome.toUpperCase()}</td>
                            <td>R$ {venda.valor_total}</td>
                            <td>{venda.pagamento.parcelas?.length || 0} parcela(s)</td>
                            <td>
                                <button
                                    className={listaVendasStyles.btnEditar}
                                    onClick={() => onEditar(venda)}
                                >
                                    Editar
                                </button>
                                <button
                                    className={listaVendasStyles.btnExcluir}
                                    onClick={() => onExcluir(venda)}
                                >
                                    Excluir
                                </button>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    );
}