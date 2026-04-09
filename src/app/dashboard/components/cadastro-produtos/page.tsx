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

    const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);

    const [formEdit, setFormEdit] = useState({
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

            console.log(res);

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

    const handleEditar = (produto: Produto) => {
        setProdutoEditando(produto);

        setFormEdit({
            nome: produto.nome,
            valor: Number(produto.valor),
        });
    };

    const handleExcluir = async (produto: Produto) => {
        if (!confirm(`Deseja realmente excluir o produto #${produto.id}?`)) return;

        try {
            const res = await fetch(`/api/laravel/produtos/${produto.id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Erro ao excluir produto");

            setProdutos(prev => prev.filter(p => p.id !== produto.id));

            toast.success("Produto excluído com sucesso!");
        } catch (error: any) {
            console.error(error);
            toast.error(error.message);
        }
    };

    const handleSalvarEdicao = async () => {
        if (!produtoEditando) return;

        const payload = {
            nome: formEdit.nome,
            valor: Number(formEdit.valor),
        };

        try {
            const res = await fetch(`/api/laravel/produtos/${produtoEditando.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Erro ao atualizar produto");

            toast.success("Produto atualizado!");

            setProdutos(prev =>
                prev.map(p => (p.id === produtoEditando.id ? data.produto : p))
            );

            setProdutoEditando(null);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message);
        }
    };

    const handleCancelarEdicao = () => {
        setProdutoEditando(null);
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
                <h2 className={styles.title}>Cadastro de Produtos</h2>

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
                        <th>Ações</th>
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
                                <td>
                                    <button
                                        className={cadastroClienteStyles.btnEditar}
                                        onClick={() => handleEditar(produto)}
                                    >
                                        Editar
                                    </button>

                                    <button
                                        className={cadastroClienteStyles.btnExcluir}
                                        onClick={() => handleExcluir(produto)}
                                    >
                                        Excluir
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {produtoEditando && (
                <div key={produtoEditando.id} className={cadastroClienteStyles.modalOverlay}>
                    <h3 className={cadastroClienteStyles.modalTitulo}>
                        Editar Produto #{produtoEditando.id}
                    </h3>

                    <div className={cadastroClienteStyles.modalCampo}>
                        <label>Nome</label>
                        <input
                            type="text"
                            value={formEdit.nome}
                            onChange={(e) =>
                                setFormEdit({ ...formEdit, nome: e.target.value })
                            }
                        />
                    </div>

                    <div className={cadastroClienteStyles.modalCampo}>
                        <label>Valor</label>
                        <input
                            type="number"
                            step={0.01}
                            value={formEdit.valor}
                            onChange={(e) =>
                                setFormEdit({ ...formEdit, valor: Number(e.target.value) })
                            }
                        />
                    </div>

                    <div className={cadastroClienteStyles.modalAcoes}>
                        <button
                            className={cadastroClienteStyles.btnSalvar}
                            onClick={handleSalvarEdicao}
                        >
                            Salvar
                        </button>
                        <button
                            className={cadastroClienteStyles.btnCancelar}
                            onClick={handleCancelarEdicao}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}