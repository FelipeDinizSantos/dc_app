"use client";
import styles from "./nav.module.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const abas = [
    { href: "/dashboard/criar-vendas", label: "Vendas" },
    { href: "/dashboard/lista-vendas", label: "Lista de Vendas" },
    { href: "/dashboard/cadastro-cliente", label: "Cadastrar Cliente" },
    { href: "/dashboard/cadastro-produto", label: "Cadastrar Produto" },
];

export default function Nav() {
    const pathname = usePathname();
    const { logout } = useAuth();

    return (
        <nav className={styles.nav}>
            <h1 className={styles.logoEmpresa}>
                TECNOLOGIA <span>DC</span>
            </h1>
            {abas.map((aba) => (
                <Link
                    key={aba.href}
                    href={aba.href}
                    className={`${styles.item} ${pathname === aba.href ? styles.ativo : ""}`}
                >
                    {aba.label}
                </Link>
            ))}
            <button className={styles.btnLogout} onClick={logout}>
                Sair
            </button>
        </nav>
    );
}