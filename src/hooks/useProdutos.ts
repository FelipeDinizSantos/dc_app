import { Produto } from "@/interfaces/Produto.interface";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export function useProdutos() {
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
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

        fetchProdutos();
    }, []);

    return { produtos, loading };
}