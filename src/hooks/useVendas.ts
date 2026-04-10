import { Cliente } from "@/interfaces/Cliente.interface";
import { Parcela } from "@/interfaces/Parcela.interface";
import { Venda } from "@/interfaces/Venda.interface";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export function useVendas() {
    const [vendas, setVendas] = useState<Venda[]>([]);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [produtos, setProdutos] = useState<any[]>([]);
    const [vendasFiltradas, setVendasFiltradas] = useState<Venda[]>([]);

    const [vendaEditando, setVendaEditando] = useState<Venda | null>(null);

    const [filtroCliente, setFiltroCliente] = useState<number | "">("");
    const [filtroDataInicio, setFiltroDataInicio] = useState("");
    const [filtroDataFim, setFiltroDataFim] = useState("");

    const [itensEdit, setItensEdit] = useState<any[]>([]);
    const [parcelasEdit, setParcelasEdit] = useState<Parcela[]>([]);

    const fetchAll = async () => {
        const fetchVendas = async () => {
            try {
                const res = await fetch('/api/laravel/vendas', {
                    method: "GET",
                    credentials: "include"
                });

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
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const aplicarFiltros = () => {
        const filtradas = vendas.filter(v => {
            if (filtroCliente && v.cliente?.id !== filtroCliente) return false;
            if (filtroDataInicio && new Date(v.data) < new Date(filtroDataInicio)) return false;
            if (filtroDataFim && new Date(v.data) > new Date(filtroDataFim)) return false;
            return true;
        });

        setVendasFiltradas(filtradas);
    };

    return {
        vendasFiltradas,
        clientes,
        produtos,

        fetchAll,

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

        vendas,
        setVendas
    };
}