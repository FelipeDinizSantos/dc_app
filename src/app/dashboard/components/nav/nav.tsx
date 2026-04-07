"use client";

import styles from "./nav.module.css";

export type Aba = "vendas" | "cadastro-cliente" | "cadastro-produto" | "lista-vendas"

const abas = [
    { id: "vendas", rotulo: "Vendas" },
    { id: "lista-vendas", rotulo: "Lista de Vendas" },
    { id: "cadastro-cliente", rotulo: "Cadastrar Cliente" },
    { id: "cadastro-produto", rotulo: "Cadastrar Produto" },
];

export default function Nav({ abaAtiva, onMudarAba }: any) {
    return (
        <nav className={styles.nav}>
            {abas.map((aba) => (
                <button
                    key={aba.id}
                    className={`${styles.item} ${abaAtiva === aba.id ? styles.ativo : ""}`}
                    onClick={() => onMudarAba(aba.id)}
                >
                    {aba.rotulo}
                </button>
            ))}
        </nav>
    );
}