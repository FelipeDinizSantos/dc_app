"use client";

import styles from "./nav.module.css";
import { useAuth } from "@/context/AuthContext";

export type Aba = "vendas" | "cadastro-cliente" | "cadastro-produto" | "lista-vendas"

const abas = [
    { id: "vendas", rotulo: "Vendas" },
    { id: "lista-vendas", rotulo: "Lista de Vendas" },
    { id: "cadastro-cliente", rotulo: "Cadastrar Cliente" },
    { id: "cadastro-produto", rotulo: "Cadastrar Produto" },
];

export default function Nav({ abaAtiva, onMudarAba }: any) {

    const { logout } = useAuth();

    return (
        <nav className={styles.nav}>
            <h1 className={styles.logoEmpresa}>
                TECNOLOGIA <span>DC</span>
            </h1>
            {abas.map((aba) => (
                <button
                    key={aba.id}
                    className={`${styles.item} ${abaAtiva === aba.id ? styles.ativo : ""}`}
                    onClick={() => onMudarAba(aba.id)}
                >
                    {aba.rotulo}
                </button>
            ))}
            <button className={styles.btnLogout} onClick={logout}>
                Sair
            </button>
        </nav>
    );
}