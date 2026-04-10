import { Produto } from "@/interfaces/Produto.interface";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export function useProdutos() {
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchProdutos = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/laravel/produtos", {
                credentials: "include",
            });

            if (!res.ok) throw new Error("Erro ao buscar produtos");

            const data: Produto[] = await res.json();
            setProdutos(data);
        } catch (error) {
            if (error instanceof Error) toast.error(error.message);
            else toast.error("Erro inesperado ao buscar produtos.");
        } finally {
            setLoading(false);
        }
    };

    const criarProduto = async (payload: { nome: string; valor: number }) => {
        try {
            const res = await fetch("/api/laravel/produtos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Erro ao cadastrar produto");

            setProdutos(prev => [...prev, data.produto]);
            toast.success("Produto cadastrado!");
            return data.produto;
        } catch (error: any) {
            toast.error(error.message);
            throw error;
        }
    };

    const atualizarProduto = async (
        id: number,
        payload: { nome: string; valor: number }
    ) => {
        try {
            const res = await fetch(`/api/laravel/produtos/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Erro ao atualizar produto");

            setProdutos(prev =>
                prev.map(p => (p.id === id ? data.produto : p))
            );

            toast.success("Produto atualizado!");
            return data.produto;
        } catch (error: any) {
            toast.error(error.message);
            throw error;
        }
    };

    const deletarProduto = async (id: number) => {
        try {
            const res = await fetch(`/api/laravel/produtos/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Erro ao excluir produto");

            setProdutos(prev => prev.filter(p => p.id !== id));

            toast.success("Produto excluído!");
        } catch (error: any) {
            toast.error(error.message);
            throw error;
        }
    };

    useEffect(() => {
        fetchProdutos();
    }, []);

    return {
        produtos,
        loading,
        fetchProdutos,
        criarProduto,
        atualizarProduto,
        deletarProduto,
        setProdutos
    };
}