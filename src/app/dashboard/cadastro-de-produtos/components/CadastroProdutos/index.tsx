"use client";

import { useState } from "react";
import styles from "./../../../../page.module.css";
import cadastroClienteStyles from "./styles.module.css";
import toast from "react-hot-toast";
import { Produto } from "@/interfaces/Produto.interface";
import { useProdutos } from "@/hooks/useProdutos";

export default function CadastroProdutos() {
    const [formData, setFormData] = useState({
        nome: "",
        valor: 0,
    });

    const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);

    const {
        produtos,
        atualizarProduto,
        criarProduto,
        deletarProduto,
        loading
    } = useProdutos();

    const [formEdit, setFormEdit] = useState({
        nome: "",
        valor: 0,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

        await deletarProduto(produto.id);
    };

    const handleSalvarEdicao = async () => {
        if (!produtoEditando) return;

        await atualizarProduto(produtoEditando.id, {
            nome: formEdit.nome,
            valor: formEdit.valor,
        });

        setProdutoEditando(null);
    };

    const handleCancelarEdicao = () => {
        setProdutoEditando(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.nome.trim()) {
            return toast.error("Nome é obrigatório.");
        }

        if (formData.valor <= 0) {
            return toast.error("Valor deve ser maior que 0.");
        }

        await criarProduto({
            nome: formData.nome,
            valor: formData.valor,
        });

        setFormData({ nome: "", valor: 0 });
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
                            value={formEdit.valor || ""}
                            onChange={(e) =>
                                setFormEdit({ ...formEdit, valor: Number(e.target.value) })
                            }
                        />
                    </div>

                    <div className={cadastroClienteStyles.modalAcoes}>
                        <button
                            className={cadastroClienteStyles.btnSalvar}
                            onClick={handleSalvarEdicao}
                            disabled={loading}
                        >
                            {loading ? "Salvando..." : "Salvar"}
                        </button>
                        <button
                            className={cadastroClienteStyles.btnCancelar}
                            onClick={handleCancelarEdicao}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}