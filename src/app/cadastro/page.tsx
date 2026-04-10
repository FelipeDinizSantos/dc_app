"use client";

import { useState } from "react";
import styles from "./../page.module.css";
import toast from "react-hot-toast";
import Link from "next/link";

export default function Cadastro() {
    const [formData, setFormData] = useState({
        nome: "",
        senha: "",
        confirmarSenha: "",
        cpfCnpj: "",
        email: "",
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        setLoading(true);
        e.preventDefault();

        if (formData.senha !== formData.confirmarSenha) {
            toast.error("As senhas não conferem.");
            return;
        }

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
        } finally {
            setLoading(false);
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
                        required
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
                        required
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
                        required
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
                        required
                        onChange={handleChange}
                        placeholder="Crie uma senha"
                    />
                    {formData.senha.length > 0 && (
                        <div className={styles.passwordRules}>
                            <div className={`${styles.passwordRule} ${formData.senha.length >= 8 ? styles.valid : styles.invalid}`}>
                                <span className={styles.check}>{formData.senha.length >= 8 ? "✔" : "✖"}</span>
                                Mínimo de 8 caracteres
                            </div>
                            <div className={`${styles.passwordRule} ${/[A-Za-z]/.test(formData.senha) ? styles.valid : styles.invalid}`}>
                                <span className={styles.check}>{/[A-Za-z]/.test(formData.senha) ? "✔" : "✖"}</span>
                                Ao menos 1 letra
                            </div>
                            <div className={`${styles.passwordRule} ${/[0-9]/.test(formData.senha) ? styles.valid : styles.invalid}`}>
                                <span className={styles.check}>{/[0-9]/.test(formData.senha) ? "✔" : "✖"}</span>
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
                        required
                        onChange={handleChange}
                        placeholder="Repita a senha"
                    />
                </div>

                <button type="submit" disabled={loading} className={styles.botao}>
                    {loading ? "Cadastrando..." : "Cadastrar"}
                </button>

            </form>
            <p className={styles.registerText}>
                Possui acesso?{" "}
                <Link className={styles.registerLink} href="/">
                    Entrar
                </Link>
            </p>
        </div>
    );
}