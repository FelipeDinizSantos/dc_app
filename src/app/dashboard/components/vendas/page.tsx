import { Cliente } from "@/interfaces/Cliente.interface";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import styles from "./vendas.module.css"
import Pagamentos from "./components/pagamento/page";
import { ItemVenda } from "@/interfaces/ItemVenda.interface";

export default function Vendas() {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [itensVenda, setItensVenda] = useState<ItemVenda[]>([]);
    const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);

    useEffect(() => {
        const fetchClientes = async () => {
            try {
                const res = await fetch(`/api/laravel/clientes`, {
                    method: "GET",
                    credentials: "include",
                });
                if (!res.ok) throw new Error("Erro ao buscar clientes");
                const data: Cliente[] = await res.json();
                setClientes(data);
            } catch (error: any) {
                console.error(error);
                toast.error(error.message);
            }
        };
        fetchClientes();
    }, []);

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
                                const encontrado = clientes.find(c => c.id === Number(e.target.value));
                                setClienteSelecionado(encontrado || null);
                            }}
                        >
                            <option value="">Selecione</option>
                            {clientes.map((cliente) => (
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

            <Pagamentos 
                clienteSelecionado={clienteSelecionado}
                itensVenda={itensVenda}
                setItensVenda={setItensVenda}
            />
        </div>
    );
}