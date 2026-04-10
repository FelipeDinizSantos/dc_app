import { Cliente } from "@/interfaces/Cliente.interface";
import { useState } from "react";
import styles from "./vendas.module.css"
import { useClientes } from "@/hooks/useClientes";
import Pagamentos from "./components/Pagamento";

export default function Vendas() {
    const { clientes, loading } = useClientes();
    const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);

    return (
        <div className={styles.geral}>
            <div className={styles.container}>
                <div className={styles.conteudo}>
                    <h1 className={styles.tituloSecao}>Selecione um cliente</h1>

                    <div className={styles.campo}>
                        <select
                            className={styles.select}
                            value={clienteSelecionado?.id || ""}
                            onChange={(e) => {
                                setClienteSelecionado(clientes.find(c => c.id === Number(e.target.value)) || null);
                            }}
                        >
                            <option value="">{loading ? "Carregando..." : "Selecione"}</option>
                            {!loading && clientes.map((cliente) => (
                                <option key={cliente.id} value={cliente.id}>
                                    {cliente.nome} ({cliente.cpf_cnpj})
                                </option>
                            ))}
                        </select>
                    </div>

                    {clienteSelecionado && (
                        <>
                            <hr className={styles.divisor} />
                            <h1 className={styles.tituloSecao}>Cliente Selecionado:</h1>
                            <div className={styles.infoCliente}>
                                <div className={styles.infoItem}>
                                    <span className={styles.label}>Nome</span>
                                    <strong><span className={styles.infoValor}>{clienteSelecionado.nome}</span></strong>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.label}>E-mail</span>
                                    <strong><span className={styles.infoValor}>{clienteSelecionado.email}</span></strong>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.label}>CPF / CNPJ</span>
                                    <strong><span className={styles.infoValor}>{clienteSelecionado.cpf_cnpj}</span></strong>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <Pagamentos clienteSelecionado={clienteSelecionado} />
        </div >
    );
}