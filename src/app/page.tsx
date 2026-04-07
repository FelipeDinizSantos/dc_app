"use client";
import styles from "./page.module.css";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

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
      return router.replace("/dashboard/");
    } catch (err: any) {
      toast.error(err.message);
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
            type="text"
            name="email"
            id="email"
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
          <a className={styles.registerLink} href="/cadastro">
            Cadastre-se
          </a>
        </p>
      </form>
    </div>
  );
}