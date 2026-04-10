import { Cliente } from "@/interfaces/Cliente.interface";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export function useClientes() {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchClientes = async () => {
        try {
            setLoading(true);

            const res = await fetch("/api/laravel/clientes", {
                credentials: "include",
            });

            if (!res.ok) throw new Error("Erro ao buscar clientes");

            const data: Cliente[] = await res.json();
            setClientes(data);
        } catch (error) {
            if (error instanceof Error) toast.error(error.message);
            else toast.error("Erro inesperado ao buscar clientes.");
        } finally {
            setLoading(false);
        }
    };

    const criarCliente = async (payload: any) => {
        try {
            const res = await fetch("/api/laravel/clientes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Erro ao cadastrar cliente");

            setClientes(prev => [...prev, data.cliente]);

            toast.success("Cliente cadastrado!");
            return data.cliente;
        } catch (error: any) {
            toast.error(error.message);
            throw error;
        }
    };

    const atualizarCliente = async (id: number, payload: any) => {
        try {
            const res = await fetch(`/api/laravel/clientes/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Erro ao atualizar cliente");

            setClientes(prev =>
                prev.map(c => (c.id === id ? data.cliente : c))
            );

            toast.success("Cliente atualizado!");
            return data.cliente;
        } catch (error: any) {
            toast.error(error.message);
            throw error;
        }
    };

    const deletarCliente = async (id: number) => {
        try {
            const res = await fetch(`/api/laravel/clientes/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Erro ao excluir cliente");

            setClientes(prev => prev.filter(c => c.id !== id));

            toast.success("Cliente excluído!");
        } catch (error: any) {
            toast.error(error.message);
            throw error;
        }
    };

    useEffect(() => {
        fetchClientes();
    }, []);

    return {
        clientes,
        loading,
        criarCliente,
        atualizarCliente,
        deletarCliente,
        fetchClientes,
        setClientes
    };
}