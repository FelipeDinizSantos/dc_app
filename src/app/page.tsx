"use client";

import styles from "./page.module.css";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      const user = await login({ email, senha });

      if (!user) {
        toast.error("Erro ao carregar usuário");
        return;
      }

      toast.success("Logado")
      return router.replace("/dashboard/criar-vendas");
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Erro inesperado. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Login</h2>

      <form onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label}>E-mail</label>
          <input
            className={styles.input}
            type="email"
            name="email"
            id="email"
            autoComplete="email"
            placeholder="eu@email.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Senha</label>
          <input
            className={styles.input}
            type={"password"}
            name="password"
            autoComplete="current-password"
            id="password"
            placeholder="••••••••"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>

        <button type="submit" className={styles.botao} disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <p className={styles.registerText}>
          Sem acesso?{" "}
          <Link className={styles.registerLink} href="/cadastro">
            Cadastre-se
          </Link>
        </p>
      </form>
    </div>
  );
}