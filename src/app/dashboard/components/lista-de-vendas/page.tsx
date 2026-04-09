"use client";

import { useEffect, useState } from "react";
import styles from "./../../../page.module.css";
import listaVendasStyles from "./listaVendas.module.css";
import toast from "react-hot-toast";
import { Venda } from "@/interfaces/Venda.interface";
import { Cliente } from "@/interfaces/Cliente.interface";
import { User } from "@/interfaces/Usuario.interface";
import gerarPDF from "@/utils/gerarPDF";
import { Parcela } from "@/interfaces/Parcela.interface";

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
    const [parcelasEdit, setParcelasEdit] = useState<Parcela[]>([]);
    const [parcelasInputEdit, setParcelasInputEdit] = useState<{ [key: number]: string }>({});
    const [numParcelasEdit, setNumParcelasEdit] = useState<number>(1);

    useEffect(() => {
        const fetchVendas = async () => {
            try {
                const res = await fetch('/api/laravel/vendas', {
                    method: "GET",
                    credentials: "include"
                });
                if (!res.ok) throw new Error('Erro ao buscar vendas!');
                const data: Venda[] = await res.json();
                console.log(data);
                setVendas(data);
                setVendasFiltradas(data);
            } catch (error: any) {
                console.error(error);
                toast.error(error.message);
            }
        };

        const fetchClientes = async () => {
            try {
                const res = await fetch('/api/laravel/clientes', {
                    method: "GET",
                    credentials: "include"
                });
                if (!res.ok) throw new Error('Erro ao buscar clientes');
                const data: Cliente[] = await res.json();
                setClientes(data);
            } catch (error: any) {
                console.error(error);
                toast.error(error.message);
            }
        };

        const fetchUsuarios = async () => {
            try {
                const res = await fetch('/api/laravel/usuarios', {
                    method: "GET",
                    credentials: "include"
                });
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

        const parcelas = venda.pagamento.parcelas.map((p, index) => ({
            id: index,
            valor: Number(p.valor),
            vencimento: p.data_vencimento
                ? p.data_vencimento.split("T")[0]
                : "",
            formaPagamento: p.forma_de_pagamento || p.formaPagamento
        }));

        setParcelasEdit(parcelas);
        setNumParcelasEdit(parcelas.length);
    };

    const gerarParcelasEdit = () => {
        if (!vendaEditando) return;

        const valorTotal = Number(vendaEditando.valor_total);
        const valorInit = parseFloat((valorTotal / numParcelasEdit).toFixed(2));
        const hoje = new Date();
        const novas: Parcela[] = [];

        for (let i = 0; i < numParcelasEdit; i++) {
            const venc = new Date(hoje);
            venc.setMonth(venc.getMonth() + i + 1);

            novas.push({
                id: i,
                valor: valorInit,
                vencimento: venc.toISOString().split("T")[0],
                formaPagamento: "dinheiro"
            });
        }

        let soma = novas.reduce((acc, p) => acc + p.valor, 0);
        const diff = parseFloat((valorTotal - soma).toFixed(2));
        novas[numParcelasEdit - 1].valor += diff;

        setParcelasEdit(novas);
    };

    const handleParcelaEditChange = (
        id: number,
        campo: keyof Parcela,
        valor: string
    ) => {
        if (!vendaEditando) return;

        const valorTotal = Number(vendaEditando.valor_total);

        if (campo === "valor") {
            setParcelasInputEdit(prev => ({ ...prev, [id]: valor }));

            setParcelasEdit(prev => {
                const novas = [...prev];
                const index = novas.findIndex(p => p.id === id);
                if (index === -1) return prev;

                let val = parseFloat(valor);
                if (isNaN(val)) val = 0;
                if (val < 0) val = 0;

                novas[index].valor = val;

                let soma = novas.reduce((acc, p) => acc + p.valor, 0);
                const diff = parseFloat((valorTotal - soma).toFixed(2));
                novas[novas.length - 1].valor += diff;

                return novas;
            });
        } else {
            setParcelasEdit(prev => {
                const novas = [...prev];
                const index = novas.findIndex(p => p.id === id);
                if (index === -1) return prev;

                novas[index] = { ...novas[index], [campo]: valor };
                return novas;
            });
        }
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

            if (!res.ok) throw new Error('Erro ao excluir venda!');

            setVendas(prev => prev.filter(v => v.id !== venda.id));
            setVendasFiltradas(prev => prev.filter(v => v.id !== venda.id));

            toast.success("Venda excluída com sucesso!");
        } catch (error: any) {
            console.error(error);
            toast.error(error.message);
        }
    };

    const handleSalvarEdicao = async () => {
        if (!vendaEditando) return;

        const parcelasPayload = parcelasEdit.map(p => ({
            valor: p.valor,
            data_vencimento: p.vencimento,
            forma_de_pagamento: p.formaPagamento
        }));

        const payload = {
            id: vendaEditando.id,
            id_cliente: clienteEdit,
            id_usuario: usuarioEdit,
            parcelas: parcelasPayload,
        };

        try {
            const res = await fetch(`/api/laravel/vendas/${vendaEditando.id}`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Erro ao buscar usuários');

            const novaVenda: Venda = await res.json();

            setVendas(prev =>
                prev.map(v => (v.id === novaVenda.id ? novaVenda : v))
            );

            setVendasFiltradas(prev =>
                prev.map(v => (v.id === novaVenda.id ? novaVenda : v))
            );

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
        const filtradas: Venda[] = [];

        for (let i = 0; i < vendas.length; i++) {
            const venda = vendas[i];

            if (filtroCliente && venda.cliente?.id !== filtroCliente) continue;
            if (filtroDataInicio && new Date(venda.data) < new Date(filtroDataInicio)) continue;
            if (filtroDataFim && new Date(venda.data) > new Date(filtroDataFim)) continue;

            filtradas.push(venda);
        }

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
                                        onClick={() => handleEditar(venda)}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        className={listaVendasStyles.btnExcluir}
                                        onClick={() => handleExcluir(venda)}
                                    >
                                        Excluir
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {vendaEditando && (
                <div className={listaVendasStyles.modalOverlay}>
                    <h3 className={listaVendasStyles.modalTitulo}>
                        Editar venda #{vendaEditando.id}
                    </h3>

                    <div className={listaVendasStyles.modalCampos}>
                        <div className={listaVendasStyles.modalCampo}>
                            <label>Cliente</label>
                            <select
                                value={clienteEdit}
                                onChange={e => setClienteEdit(Number(e.target.value) || "")}
                            >
                                <option value="">Selecione cliente</option>
                                {clientes.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.nome.toUpperCase()}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={listaVendasStyles.modalCampo}>
                            <label>Usuário</label>
                            <select
                                value={usuarioEdit}
                                onChange={e => setUsuarioEdit(Number(e.target.value) || "")}
                            >
                                <option value="">Selecione usuário</option>
                                {usuarios.map(u => (
                                    <option key={u.id} value={u.id}>
                                        {u.nome.toUpperCase()}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <hr />

                    <h4>Parcelas</h4>

                    <div>
                        <input
                            type="number"
                            min={1}
                            value={numParcelasEdit}
                            onChange={(e) => setNumParcelasEdit(Number(e.target.value))}
                        />
                        <button onClick={gerarParcelasEdit}>Gerar</button>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Vencimento</th>
                                <th>Valor</th>
                                <th>Forma</th>
                            </tr>
                        </thead>

                        <tbody>
                            {parcelasEdit.map(p => (
                                <tr key={p.id}>
                                    <td>{p.id + 1}</td>
                                    <td>
                                        <input
                                            type="date"
                                            value={p.vencimento}
                                            onChange={(e) =>
                                                handleParcelaEditChange(p.id, "vencimento", e.target.value)
                                            }
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            value={parcelasInputEdit[p.id] ?? p.valor.toFixed(2)}
                                            onChange={(e) =>
                                                handleParcelaEditChange(p.id, "valor", e.target.value)
                                            }
                                        />
                                    </td>
                                    <td>
                                        <select
                                            value={p.formaPagamento}
                                            onChange={(e) =>
                                                handleParcelaEditChange(p.id, "formaPagamento", e.target.value)
                                            }
                                        >
                                            <option value="dinheiro">Dinheiro</option>
                                            <option value="pix">Pix</option>
                                            <option value="boleto">Boleto</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className={listaVendasStyles.modalAcoes}>
                        <button
                            className={listaVendasStyles.btnSalvar}
                            onClick={handleSalvarEdicao}
                        >
                            Salvar
                        </button>
                        <button
                            className={listaVendasStyles.btnCancelar}
                            onClick={handleCancelarEdicao}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            <div className={listaVendasStyles.relatorioBar}>
                <span className={listaVendasStyles.relatorioLabel}>
                    Gerar relatório
                </span>
                <button
                    className={listaVendasStyles.btnPdf}
                    onClick={() => gerarPDF(vendasFiltradas)}
                >
                    PDF
                </button>
            </div>
        </div>
    );
}