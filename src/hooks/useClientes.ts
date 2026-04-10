import { Cliente } from "@/interfaces/Cliente.interface";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export function useClientes() {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchClientes = async () => {
            try {
                setLoading(true);
                const res = await fetch("/api/laravel/clientes", {
                    method: "GET",
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

        fetchClientes();
    }, []);

    return { clientes, loading };
}