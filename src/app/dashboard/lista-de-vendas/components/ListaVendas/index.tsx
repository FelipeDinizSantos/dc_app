"use client";

import { useEffect, useState } from "react";
import styles from "./../../../../page.module.css";
import listaVendasStyles from "./../../styles.module.css";
import toast from "react-hot-toast";
import { Venda } from "@/interfaces/Venda.interface";
import gerarPDF from "@/utils/gerarPDF";
import { Parcela } from "@/interfaces/Parcela.interface";
import { useVendas } from "@/hooks/useVendas";
import FiltrosVendas from "../FiltrosVendas";
import { TabelaVendas } from "../TabelaVendas";
import { ModalEditarVenda } from "../ModalEditarVenda";

export default function ListaVendas() {
    const [clienteEdit, setClienteEdit] = useState<number | "">("");
    const [usuarioEdit, setUsuarioEdit] = useState<number | "">("");
    const [parcelasInputEdit, setParcelasInputEdit] = useState<{ [key: number]: string }>({});
    const [numParcelasEdit, setNumParcelasEdit] = useState<number>(1);

    const [produtoSelecionadoEdit, setProdutoSelecionadoEdit] = useState<any | null>(null);
    const [quantidadeEdit, setQuantidadeEdit] = useState<number>(1);
    const [valorUnitarioEdit, setValorUnitarioEdit] = useState<number>(0);

    const {
        vendasFiltradas,
        clientes,
        produtos,

        filtroCliente,
        setFiltroCliente,
        filtroDataInicio,
        setFiltroDataInicio,
        filtroDataFim,
        setFiltroDataFim,
        aplicarFiltros,
        setVendasFiltradas,

        vendaEditando,
        setVendaEditando,
        itensEdit,
        setItensEdit,
        parcelasEdit,
        setParcelasEdit,

        setVendas,
        fetchAll
    } = useVendas()

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

                    const proporcao = totalOutras === 0 ? 1 / indicesOutras.length : novas[idx].valor / totalOutras;

                    const novoValor = parseFloat((novas[idx].valor + proporcao * restante).toFixed(2));

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
                throw new Error(data.message || Object.values(data.errors || {}).flat().join(" | ") || "Erro ao atualizar a venda!");
            }

            const novaVenda: Venda = data;

            setVendas(prev =>
                prev.map(v => (v.id === novaVenda.id ? novaVenda : v))
            );

            setVendasFiltradas(prev =>
                prev.map(v => (v.id === novaVenda.id ? novaVenda : v))
            );

            toast.success("Venda atualizada com sucesso!");
            fetchAll();
            setVendaEditando(null);
        } catch (error: any) {
            console.error("Erro completo:", error);
            toast.error(error.message);
        }
    };

    const handleCancelarEdicao = () => {
        setVendaEditando(null);
    };

    const limparFiltros = () => {
        setFiltroCliente("");
        setFiltroDataInicio("");
        setFiltroDataFim("");
        fetchAll();
    };

    return (
        <div className={styles.card}>
            <h2 className={styles.title}>Lista de Vendas</h2>

            <FiltrosVendas
                aplicarFiltros={aplicarFiltros}
                clientes={clientes}
                filtroCliente={filtroCliente}
                filtroDataFim={filtroDataFim}
                filtroDataInicio={filtroDataInicio}
                limparFiltros={limparFiltros}
                setFiltroCliente={setFiltroCliente}
                setFiltroDataFim={setFiltroDataFim}
                setFiltroDataInicio={setFiltroDataInicio}
            />

            <TabelaVendas
                onEditar={handleEditar}
                onExcluir={handleExcluir}
                vendasFiltradas={vendasFiltradas}
            />

            {vendaEditando && (
                <ModalEditarVenda
                    adicionarItemEdit={adicionarItemEdit}
                    atualizarItemEdit={atualizarItemEdit}
                    clienteEdit={clienteEdit}
                    clientes={clientes}
                    gerarParcelasEdit={gerarParcelasEdit}
                    handleParcelaEditChange={handleParcelaEditChange}
                    itensEdit={itensEdit}
                    numParcelasEdit={numParcelasEdit}
                    onClose={handleCancelarEdicao}
                    onSave={handleSalvarEdicao}
                    parcelasEdit={parcelasEdit}
                    parcelasInputEdit={parcelasInputEdit}
                    produtoSelecionadoEdit={produtoSelecionadoEdit}
                    produtos={produtos}
                    quantidadeEdit={quantidadeEdit}
                    removerItemEdit={removerItemEdit}
                    setClienteEdit={setClienteEdit}
                    setNumParcelasEdit={setNumParcelasEdit}
                    setProdutoSelecionadoEdit={setProdutoSelecionadoEdit}
                    setQuantidadeEdit={setQuantidadeEdit}
                    setValorUnitarioEdit={setValorUnitarioEdit}
                    valorUnitarioEdit={valorUnitarioEdit}
                    vendaEditando={vendaEditando}
                />
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