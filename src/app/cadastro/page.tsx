"use client";

import { useState } from "react";
import styles from "./../page.module.css";
import toast from "react-hot-toast";

export default function Cadastro() {
    const [formData, setFormData] = useState({
        nome: "",
        senha: "",
        confirmarSenha: "",
        cpfCnpj: "",
        email: "",
    });

    const senha = formData.senha;

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            senha: formData.senha,
            email: formData.email,
            nome: formData.nome,
            cpf_cnpj: formData.cpfCnpj.replace(/\D/g, ""),
            senha_confirmacao: formData.confirmarSenha,
        };

        try {
            const res = await fetch(`/api/laravel/dev/usuarios`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Erro ao cadastrar!");

            toast.success("Usuário cadastrado!");
            setFormData({ nome: "", senha: "", email: "", cpfCnpj: "", confirmarSenha: "" });
        } catch (err: unknown) {
            if (err instanceof Error) toast.error(err.message);
            else toast.error("Ocorreu um erro inesperado!");
        }
    };

    return (
        <div className={styles.card}>
            <h2 className={styles.title}>Cadastre-se</h2>

            <form onSubmit={handleSubmit}>

                <div className={styles.field}>
                    <label className={styles.label}>Nome</label>
                    <input
                        className={styles.input}
                        type="text"
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        placeholder="Digite seu nome"
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
                        placeholder="Digite seu CPF ou CNPJ"
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
                        placeholder="Digite seu e-mail"
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Senha</label>
                    <input
                        className={styles.input}
                        type="password"
                        name="senha"
                        value={formData.senha}
                        onChange={handleChange}
                        placeholder="Crie uma senha"
                    />
                    {senha.length > 0 && (
                        <div className={styles.passwordRules}>
                            <div className={`${styles.passwordRule} ${senha.length >= 8 ? styles.valid : styles.invalid}`}>
                                <span className={styles.check}>{senha.length >= 8 ? "✔" : "✖"}</span>
                                Mínimo de 8 caracteres
                            </div>
                            <div className={`${styles.passwordRule} ${/[A-Za-z]/.test(senha) ? styles.valid : styles.invalid}`}>
                                <span className={styles.check}>{/[A-Za-z]/.test(senha) ? "✔" : "✖"}</span>
                                Ao menos 1 letra
                            </div>
                            <div className={`${styles.passwordRule} ${/[0-9]/.test(senha) ? styles.valid : styles.invalid}`}>
                                <span className={styles.check}>{/[0-9]/.test(senha) ? "✔" : "✖"}</span>
                                Ao menos 1 número
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Confirmar senha</label>
                    <input
                        className={styles.input}
                        type="password"
                        name="confirmarSenha"
                        value={formData.confirmarSenha}
                        onChange={handleChange}
                        placeholder="Repita a senha"
                    />
                </div>

                <button type="submit" className={styles.botao}>
                    Cadastrar
                </button>

            </form>
            <p className={styles.registerText}>
                Possui acesso?{" "}
                <a className={styles.registerLink} href="/">
                    Entrar
                </a>
            </p>
        </div>
    );
}