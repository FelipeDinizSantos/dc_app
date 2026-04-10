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


    const [itensEdit, setItensEdit] = useState<any[]>([]);
    const [produtos, setProdutos] = useState<any[]>([]);
    const [produtoSelecionadoEdit, setProdutoSelecionadoEdit] = useState<any | null>(null);
    const [quantidadeEdit, setQuantidadeEdit] = useState<number>(1);
    const [valorUnitarioEdit, setValorUnitarioEdit] = useState<number>(0);

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

        const fetchProdutos = async () => {
            try {
                const res = await fetch('/api/laravel/produtos', {
                    method: "GET",
                    credentials: "include"
                });
                if (!res.ok) throw new Error('Erro ao buscar produtos');
                const data = await res.json();
                setProdutos(data);
            } catch (error: any) {
                toast.error(error.message);
            }
        };

        fetchProdutos();
        fetchVendas();
        fetchClientes();
    }, []);

    const recalcularParcelas = (novoTotal: number) => {
        if (parcelasEdit.length === 0) return;
        const qtd = parcelasEdit.length;
        const valorBase = parseFloat((novoTotal / qtd).toFixed(2));
        const novas = parcelasEdit.map((p, index) => ({
            ...p,
            valor: valorBase
        }));
        let soma = 0;
        for (let i = 0; i < novas.length; i++) {
            soma += novas[i].valor;
        }
        const diff = parseFloat((novoTotal - soma).toFixed(2));
        novas[qtd - 1].valor += diff;
        setParcelasEdit(novas);
    };

    useEffect(() => {
        if (!vendaEditando) return;

        let total = 0;
        for (let i = 0; i < itensEdit.length; i++) {
            total += itensEdit[i].subTotal;
        }

        const totalFormatado = parseFloat(total.toFixed(2));

        setVendaEditando(prev => prev ? {
            ...prev,
            valor_total: totalFormatado.toFixed(2)
        } : null);

        recalcularParcelas(totalFormatado);

    }, [itensEdit]);

    const adicionarItemEdit = () => {
        if (!produtoSelecionadoEdit) return;

        const novoItem = {
            produto: produtoSelecionadoEdit,
            quantidade: quantidadeEdit,
            valorUnitario: valorUnitarioEdit,
            subTotal: quantidadeEdit * valorUnitarioEdit,
        };

        setItensEdit(prev => [...prev, novoItem]);
        setProdutoSelecionadoEdit(null);
        setQuantidadeEdit(1);
        setValorUnitarioEdit(0);
    };

    const removerItemEdit = (index: number) => {
        setItensEdit(prev => prev.filter((_, i) => i !== index));
    };

    const atualizarItemEdit = (index: number, campo: "quantidade" | "valorUnitario", valor: number) => {
        const lista = [...itensEdit];
        lista[index][campo] = valor;
        lista[index].subTotal = lista[index].quantidade * lista[index].valorUnitario;
        setItensEdit(lista);
    };

    const handleEditar = (venda: Venda) => {
        setVendaEditando(venda);

        setParcelasInputEdit({});

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

        const itens = venda.itens.map((item, index) => ({
            id: index,
            produto: item.produto,
            quantidade: item.qtd,
            valorUnitario: Number(item.valor_unitario),
            subTotal: Number(item.sub_total),
        }));

        setItensEdit(itens);
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

    const handleParcelaEditChange = (id: number, campo: keyof Parcela, valorInput: string) => {
        if (!vendaEditando) return;

        const valorTotal = Number(vendaEditando.valor_total);

        if (campo === "valor") {
            setParcelasInputEdit(prev => ({ ...prev, [id]: valorInput }));

            setParcelasEdit(prev => {
                const novas = [...prev];
                const index = novas.findIndex(p => p.id === id);
                if (index === -1) return prev;

                let valor = parseFloat(valorInput);
                if (isNaN(valor)) valor = 0;
                if (valor < 0) valor = 0;

                novas[index].valor = valor;

                const indicesOutras: number[] = [];
                for (let i = 0; i < novas.length; i++) {
                    if (i !== index) indicesOutras.push(i);
                }

                let totalOutras = 0;
                for (let i = 0; i < indicesOutras.length; i++) {
                    totalOutras += novas[indicesOutras[i]].valor;
                }

                const restante = parseFloat(
                    (valorTotal - valor - totalOutras).toFixed(2)
                );

                for (let i = 0; i < indicesOutras.length; i++) {
                    const idx = indicesOutras[i];

                    const proporcao =
                        totalOutras === 0
                            ? 1 / indicesOutras.length
                            : novas[idx].valor / totalOutras;

                    const novoValor = parseFloat(
                        (novas[idx].valor + proporcao * restante).toFixed(2)
                    );

                    novas[idx].valor = novoValor;
                }

                let somaFinal = 0;
                for (let i = 0; i < novas.length; i++) {
                    somaFinal += novas[i].valor;
                }

                const diff = parseFloat((valorTotal - somaFinal).toFixed(2));
                const last = novas.length - 1;
                novas[last].valor += diff;

                setParcelasInputEdit(prev => {
                    const copia = { ...prev };
                    for (let i = 0; i < indicesOutras.length; i++) {
                        delete copia[novas[indicesOutras[i]].id];
                    }
                    return copia;
                });

                return novas;
            });
        } else {
            setParcelasEdit(prev => {
                const novas = [...prev];
                const index = novas.findIndex(p => p.id === id);
                if (index === -1) return prev;

                novas[index] = { ...novas[index], [campo]: valorInput };
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

        const itensPayload = itensEdit.map(item => ({
            id_produto: item.produto.id,
            qtd: item.quantidade,
            valor_unitario: item.valorUnitario
        }));

        const payload = {
            id: vendaEditando.id,
            id_cliente: clienteEdit,
            parcelas: parcelasPayload,
            itens: itensPayload
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

            const data = await res.json();

            if (!res.ok) {
                console.error("Erro backend:", data);

                throw new Error(
                    data.message ||
                    Object.values(data.errors || {}).flat().join(" | ") ||
                    "Erro ao atualizar a venda!"
                );
            }

            const novaVenda: Venda = data;

            setVendas(prev =>
                prev.map(v => (v.id === novaVenda.id ? novaVenda : v))
            );

            setVendasFiltradas(prev =>
                prev.map(v => (v.id === novaVenda.id ? novaVenda : v))
            );

            toast.success("Venda atualizada com sucesso!");
            setVendaEditando(null);

        } catch (error: any) {
            console.error("Erro completo:", error);
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
                        <button onClick={gerarParcelasEdit}>Gerar</button>
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

                                <button onClick={adicionarItemEdit}>+</button>
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
                            {itensEdit.map((item, index) => (
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
                            {parcelasEdit.map(p => (
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
                        <button className={listaVendasStyles.btnCancelar} onClick={handleCancelarEdicao}>Cancelar</button>
                        <button className={listaVendasStyles.btnSalvar} onClick={handleSalvarEdicao}>Salvar</button>
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