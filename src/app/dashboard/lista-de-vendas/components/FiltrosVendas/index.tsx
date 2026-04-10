import { Cliente } from "@/interfaces/Cliente.interface";

import listaVendasStyles from "./../../styles.module.css";

import { Dispatch, SetStateAction } from "react";

export default function FiltrosVendas({
    clientes,
    filtroCliente,
    setFiltroCliente,
    filtroDataInicio,
    setFiltroDataInicio,
    filtroDataFim,
    setFiltroDataFim,
    aplicarFiltros,
    limparFiltros
}:
{
    clientes: Cliente[];
    filtroCliente: number | "";
    setFiltroCliente: Dispatch<SetStateAction<number | "">>;
    filtroDataInicio: string;
    setFiltroDataInicio: Dispatch<SetStateAction<string>>;
    filtroDataFim: string;
    setFiltroDataFim: Dispatch<SetStateAction<string>>;
    aplicarFiltros: () => void;
    limparFiltros: () => void;
}) {
    return (
        <div className={listaVendasStyles.filtros}>
            <label>Cliente</label>
            <select
                value={filtroCliente}
                onChange={e => setFiltroCliente(Number(e.target.value) || "")}
            >
                <option value="">Todos</option>
                {clientes.map(c => (
                    <option key={c.id} value={c.id}>
                        {c.nome.toUpperCase()}
                    </option>
                ))}
            </select>

            <div className={listaVendasStyles.filtroSeparador} />

            <label>De</label>
            <input
                type="date"
                value={filtroDataInicio}
                onChange={e => setFiltroDataInicio(e.target.value)}
            />

            <label>Até</label>
            <input
                type="date"
                value={filtroDataFim}
                onChange={e => setFiltroDataFim(e.target.value)}
            />

            <div className={listaVendasStyles.filtroSeparador} />

            <button
                className={listaVendasStyles.btnFiltrar}
                onClick={aplicarFiltros}
            >
                Filtrar
            </button>

            <button
                className={listaVendasStyles.btnLimpar}
                onClick={limparFiltros}
            >
                Limpar
            </button>
        </div>
    );
}