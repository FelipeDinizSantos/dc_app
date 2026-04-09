"use client";

import { useEffect, useState } from "react";
import styles from "./../../../page.module.css";
import cadastroClienteStyles from "./cadastroProdutos.module.css";
import toast from "react-hot-toast";
import { Produto } from "@/interfaces/Produto.interface";

export default function CadastroProdutos() {
    const [formData, setFormData] = useState({
        nome: "",
        valor: 0,
    });

    const [produtos, setProdutos] = useState<Produto[]>([]);

    const fetchProdutos = async () => {
        try {
            const res = await fetch('/api/laravel/produtos', {
                method: "GET",
                credentials: "include"
            });

            if (!res.ok) throw new Error('Erro ao buscar produtos');

            const data: Produto[] = await res.json();
            setProdutos(data);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message);
        }
    };

    useEffect(() => {
        fetchProdutos();
    }, []);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            valor: formData.valor,
            nome: formData.nome,
        };

        try {
            const res = await fetch(`/api/laravel/produtos`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Erro ao registrar produto!");

            toast.success("Produto cadastrado!");
            setFormData({ nome: "", valor: 0 });

            fetchProdutos();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message);
        }
    };

    return (
        <>
            <div className={styles.card}>
                <h2 className={styles.title}>Cadastro de Cliente</h2>

                <form onSubmit={handleSubmit}>

                    <div className={styles.field}>
                        <label className={styles.label}>Nome</label>
                        <input
                            className={styles.input}
                            type="text"
                            name="nome"
                            value={formData.nome}
                            onChange={handleChange}
                            placeholder="Digite o nome do produto"
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Valor</label>
                        <input
                            className={styles.input}
                            type="number"
                            name="valor"
                            value={formData.valor}
                            onChange={handleChange}
                            placeholder="Digite o valor"
                        />
                    </div>

                    <button type="submit" className={styles.botao}>
                        Cadastrar
                    </button>

                </form>
            </div>

            <table className={cadastroClienteStyles.tabela}>
                <thead className={cadastroClienteStyles.cabecalho}>
                    <tr>
                        <th>#</th>
                        <th>Nome</th>
                        <th>Valor</th>
                    </tr>
                </thead>
                <tbody>
                    {produtos.length === 0 ? (
                        <tr>
                            <td colSpan={3}>
                                Nenhum produto cadastrado
                            </td>
                        </tr>
                    ) : (
                        produtos.map((produto) => (
                            <tr key={produto.id} className={cadastroClienteStyles.linha}>
                                <td className={cadastroClienteStyles.id}>{produto.id}</td>
                                <td>{produto.nome}</td>
                                <td>R$ {produto.valor}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </>
    );
}