"use client";

import { useState } from "react";
import styles from "./../../../../page.module.css";
import cadastroClienteStyles from "./styles.module.css";
import toast from "react-hot-toast";
import { Cliente } from "@/interfaces/Cliente.interface";
import { useClientes } from "@/hooks/useClientes";

export default function CadastroClientes() {
    const [formData, setFormData] = useState({
        nome: "",
        cpfCnpj: "",
        email: "",
    });

    const [formEdit, setFormEdit] = useState({
        nome: "",
        cpfCnpj: "",
        email: "",
    });

    const {
        clientes,
        loading,
        criarCliente,
        atualizarCliente,
        deletarCliente,
        setClientes
    } = useClientes();

    const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleEditar = (cliente: Cliente) => {
        setClienteEditando(cliente);

        setFormEdit({
            nome: cliente.nome,
            email: cliente.email,
            cpfCnpj: cliente.cpf_cnpj,
        });
    };

    const handleExcluir = async (cliente: Cliente) => {
        if (!confirm(`Deseja realmente excluir o cliente #${cliente.id}?`)) return;
        await deletarCliente(cliente.id);
    };

    const handleSalvarEdicao = async () => {
        if (!clienteEditando) return;

        const payload = {
            email: formEdit.email,
            nome: formEdit.nome,
            cpf_cnpj: formEdit.cpfCnpj.replace(/\D/g, ""),
        };

        await atualizarCliente(clienteEditando.id, payload);
        setClienteEditando(null);
    }

    const handleCancelarEdicao = () => {
        setClienteEditando(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.nome.trim()) {
            return toast.error("Nome é obrigatório");
        }

        if (!formData.cpfCnpj.trim()) {
            return toast.error("CPF/CNPJ é obrigatório");
        }

        if (!formData.email.trim()) {
            return toast.error("Email é obrigatório");
        }

        const payload = {
            email: formData.email,
            nome: formData.nome,
            cpf_cnpj: formData.cpfCnpj.replace(/\D/g, ""),
        };

        try {
            await criarCliente(payload);
            setFormData({ nome: "", email: "", cpfCnpj: "" });
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
                        <th>Ações</th>
                    </tr>
                </thead>
                {
                    loading ? (
                        <tbody>
                            <tr>
                                <td colSpan={5}>
                                    Carregando...
                                </td>
                            </tr>
                        </tbody>
                    ) : (
                        <tbody>
                            {clientes.length === 0 ? (
                                <tr>
                                    <td colSpan={5}>
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
                                        <td>
                                            <button
                                                className={cadastroClienteStyles.btnEditar}
                                                onClick={() => handleEditar(cliente)}
                                            >
                                                Editar
                                            </button>

                                            <button
                                                className={cadastroClienteStyles.btnExcluir}
                                                onClick={() => handleExcluir(cliente)}
                                            >
                                                Excluir
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    )
                }
            </table>

            {clienteEditando && (
                <div className={cadastroClienteStyles.modalOverlay}>
                    <h3 className={cadastroClienteStyles.modalTitulo}>
                        Editar Cliente #{clienteEditando.id}
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
                        <label>CPF / CNPJ</label>
                        <input
                            type="text"
                            value={formEdit.cpfCnpj}
                            onChange={(e) =>
                                setFormEdit({ ...formEdit, cpfCnpj: e.target.value })
                            }
                        />
                    </div>

                    <div className={cadastroClienteStyles.modalCampo}>
                        <label>Email</label>
                        <input
                            type="email"
                            value={formEdit.email}
                            onChange={(e) =>
                                setFormEdit({ ...formEdit, email: e.target.value })
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
                </div >
            )
            }
        </>
    );
}