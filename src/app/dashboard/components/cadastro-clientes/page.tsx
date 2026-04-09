"use client";

import { useEffect, useState } from "react";
import styles from "./../../../page.module.css";
import cadastroClienteStyles from "./cadastroClientes.module.css";
import toast from "react-hot-toast";
import { Cliente } from "@/interfaces/Cliente.interface";

export default function CadastroClientes() {
    const [formData, setFormData] = useState({
        nome: "",
        cpfCnpj: "",
        email: "",
    });

    const [clientes, setClientes] = useState<Cliente[]>([]);

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
            toast.error(error.message)
        }
    };

    useEffect(() => {
        fetchClientes();
    }, []);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            email: formData.email,
            nome: formData.nome,
            cpf_cnpj: formData.cpfCnpj.replace(/\D/g, ""),
        };

        try {
            const res = await fetch(`/api/laravel/clientes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Erro ao cadastrar o cliente!");

            toast.success("Cliente cadastrado!");
            setFormData({ nome: "", email: "", cpfCnpj: "" });

            fetchClientes();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message)
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
                            placeholder="Digite o nome"
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>CPF / CNPJ</label>
                        <input
                            className={styles.input}
                            type="text"
                            name="cpfCnpj"
                            value={formData.cpfCnpj}
                            onChange={handleChange}
                            placeholder="Digite o CPF ou CNPJ"
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>E-mail</label>
                        <input
                            className={styles.input}
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Digite o E-mail"
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
                        <th>CPF / CNPJ</th>
                        <th>E-mail</th>
                    </tr>
                </thead>
                <tbody>
                    {clientes.length === 0 ? (
                        <tr>
                            <td>
                                Nenhum cliente cadastrado
                            </td>
                        </tr>
                    ) : (
                        clientes.map((cliente) => (
                            <tr key={cliente.id} className={cadastroClienteStyles.linha}>
                                <td className={cadastroClienteStyles.id}>{cliente.id}</td>
                                <td>{cliente.nome}</td>
                                <td>{cliente.cpf_cnpj}</td>
                                <td>{cliente.email}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </>
    );
}