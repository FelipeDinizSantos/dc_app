"use client";

import { useEffect, useState } from "react";
import styles from "./../../../page.module.css";
import listaVendasStyles from "./listaVendas.module.css";
import toast from "react-hot-toast";
import { Venda } from "@/interfaces/Venda.interface";
import { Cliente } from "@/interfaces/Cliente.interface";
import { User } from "@/interfaces/Usuario.interface";
import gerarPDF from "@/utils/gerarPDF";

export default function ListaDeVendas() {
    const [vendas, setVendas] = useState<Venda[]>([]);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [usuarios, setUsuarios] = useState<User[]>([]);

    const [filtroCliente, setFiltroCliente] = useState<number | "">("");
    const [filtroDataInicio, setFiltroDataInicio] = useState<string>("");
    const [filtroDataFim, setFiltroDataFim] = useState<string>("");

    const [vendasFiltradas, setVendasFiltradas] = useState<Venda[]>([]);

    const [vendaEditando, setVendaEditando] = useState<Venda | null>(null);
    const [clienteEdit, setClienteEdit] = useState<number | "">("");
    const [usuarioEdit, setUsuarioEdit] = useState<number | "">("");

    useEffect(() => {
        const fetchVendas = async () => {
            try {
                const res = await fetch('/api/laravel/vendas', { method: "GET", credentials: "include" });
                if (!res.ok) throw new Error('Erro ao buscar vendas!');
                const data: Venda[] = await res.json();
                setVendas(data);
                setVendasFiltradas(data);
            } catch (error: any) {
                console.error(error);
                toast.error(error.message);
            }
        };

        const fetchClientes = async () => {
            try {
                const res = await fetch('/api/laravel/clientes', { method: "GET", credentials: "include" });
                if (!res.ok) throw new Error('Erro ao buscar clientes');
                const data: Cliente[] = await res.json();
                setClientes(data);
                console.log(data);
            } catch (error: any) {
                console.error(error);
                toast.error(error.message);
            }
        };

        const fetchUsuarios = async () => {
            try {
                const res = await fetch('/api/laravel/usuarios', { method: "GET", credentials: "include" });
                if (!res.ok) throw new Error('Erro ao buscar usuários');
                const data: User[] = await res.json();
                setUsuarios(data);
            } catch (error: any) {
                console.error(error);
                toast.error(error.message);
            }
        };

        fetchVendas();
        fetchClientes();
        fetchUsuarios();
    }, []);

    const handleEditar = (venda: Venda) => {
        setVendaEditando(venda);
        setClienteEdit(venda.cliente?.id || "");
        setUsuarioEdit(venda.usuario?.id || "");
    };

    const handleExcluir = async (venda: Venda) => {
        if (!confirm(`Deseja realmente excluir a venda #${venda.id}?`)) return;

        try {
            const res = await fetch(`/api/laravel/vendas/${venda.id}`, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData?.mensagem || "Erro ao excluir venda!");
            }

            const data = await res.json();

            setVendas(prev => prev.filter(v => v.id !== venda.id));
            setVendasFiltradas(prev => prev.filter(v => v.id !== venda.id));

            toast.success(data.mensagem || "Venda excluída com sucesso!");
        } catch (error: any) {
            console.error(error);
            toast.error(error.message);
        }
    };

    const handleSalvarEdicao = async () => {
        if (!vendaEditando) return;

        const payload = {
            id: vendaEditando.id,
            id_cliente: clienteEdit,
            id_usuario: usuarioEdit,
            valor_total: vendaEditando.valor_total,
            created_at: vendaEditando.created_at,
            updated_at: vendaEditando.updated_at,
        }

        try {
            const res = await fetch(`/api/laravel/vendas/${vendaEditando.id}`, {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const erro = await res.json();
                throw new Error(erro?.mensagem || "Erro ao atualizar venda!");
            }

            const updatedVenda: Venda = await res.json();

            setVendas(prev => prev.map(v => v.id === updatedVenda.id ? updatedVenda : v));
            setVendasFiltradas(prev => prev.map(v => v.id === updatedVenda.id ? updatedVenda : v));

            toast.success("Venda atualizada com sucesso!");
            setVendaEditando(null);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message);
        }
    };

    const handleCancelarEdicao = () => {
        setVendaEditando(null);
    };

    const aplicarFiltros = () => {
        let filtradas = [...vendas];

        if (filtroCliente) filtradas = filtradas.filter(v => v.cliente?.id === filtroCliente);
        if (filtroDataInicio) filtradas = filtradas.filter(v => new Date(v.data) >= new Date(filtroDataInicio));
        if (filtroDataFim) filtradas = filtradas.filter(v => new Date(v.data) <= new Date(filtroDataFim));

        setVendasFiltradas(filtradas);
    };

    const limparFiltros = () => {
        setFiltroCliente("");
        setFiltroDataInicio("");
        setFiltroDataFim("");
        setVendasFiltradas(vendas);
    };

    return (
        <div className={styles.card}>
            <h2 className={styles.title}>Lista de Vendas</h2>
            <div className={listaVendasStyles.filtros}>
                <label>Cliente</label>
                <select value={filtroCliente} onChange={e => setFiltroCliente(Number(e.target.value) || "")}>
                    <option value="">Todos</option>
                    {clientes.map(c => <option key={c.id} value={c.id}>{c.nome.toUpperCase()}</option>)}
                </select>

                <div className={listaVendasStyles.filtroSeparador} />

                <label>De</label>
                <input type="date" value={filtroDataInicio} onChange={e => setFiltroDataInicio(e.target.value)} />
                <label>Até</label>
                <input type="date" value={filtroDataFim} onChange={e => setFiltroDataFim(e.target.value)} />

                <div className={listaVendasStyles.filtroSeparador} />

                <button className={listaVendasStyles.btnFiltrar} onClick={aplicarFiltros}>Filtrar</button>
                <button className={listaVendasStyles.btnLimpar} onClick={limparFiltros}>Limpar</button>
            </div>

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
                        <tr><td colSpan={8}>Nenhuma venda registrada</td></tr>
                    ) : (
                        vendasFiltradas.map(venda => (
                            <tr key={venda.id} className={listaVendasStyles.linha}>
                                <td className={listaVendasStyles.id}>{venda.id}</td>
                                <td>{venda.cliente?.nome.toUpperCase()}</td>
                                <td>{new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(venda.data))}</td>
                                <td>{venda.pagamento.forma_de_pagamento.toUpperCase()}</td>
                                <td>{venda.usuario?.nome.toUpperCase()}</td>
                                <td>R$ {venda.valor_total}</td>
                                <td>{venda.pagamento.parcelas?.length || 0} parcela(s)</td>
                                <td>
                                    <button className={listaVendasStyles.btnEditar} onClick={() => handleEditar(venda)}>Editar</button>
                                    <button className={listaVendasStyles.btnExcluir} onClick={() => handleExcluir(venda)}>Excluir</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {vendaEditando && (
                <div className={listaVendasStyles.modalOverlay}>
                    <h3 className={listaVendasStyles.modalTitulo}>Editar venda #{vendaEditando.id}</h3>
                    <div className={listaVendasStyles.modalCampos}>
                        <div className={listaVendasStyles.modalCampo}>
                            <label>Cliente</label>
                            <select value={clienteEdit} onChange={e => setClienteEdit(Number(e.target.value) || "")}>
                                <option value="">Selecione cliente</option>
                                {clientes.map(c => <option key={c.id} value={c.id}>{c.nome.toUpperCase()}</option>)}
                            </select>
                        </div>
                        <div className={listaVendasStyles.modalCampo}>
                            <label>Usuário</label>
                            <select value={usuarioEdit} onChange={e => setUsuarioEdit(Number(e.target.value) || "")}>
                                <option value="">Selecione usuário</option>
                                {usuarios.map(u => <option key={u.id} value={u.id}>{u.nome.toUpperCase()}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className={listaVendasStyles.modalAcoes}>
                        <button className={listaVendasStyles.btnSalvar} onClick={handleSalvarEdicao}>Salvar</button>
                        <button className={listaVendasStyles.btnCancelar} onClick={handleCancelarEdicao}>Cancelar</button>
                    </div>
                </div>
            )}

            <div className={listaVendasStyles.relatorioBar}>
                <span className={listaVendasStyles.relatorioLabel}>Gerar relatório</span>
                <button className={listaVendasStyles.btnPdf} onClick={() => gerarPDF(vendasFiltradas)}>
                    PDF
                </button>
            </div>
        </div>
    );
}