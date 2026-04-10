import { Dispatch, SetStateAction, useEffect, useState } from "react";
import toast from "react-hot-toast";
import styles from "./../../vendas.module.css";
import { Produto } from "@/interfaces/Produto.interface";
import { ItemVenda } from "@/interfaces/ItemVenda.interface";
import { Cliente } from "@/interfaces/Cliente.interface";
import { useProdutoSelecionado } from "@/hooks/useProdutoSelecionado";
import { SeletorProduto } from "@/app/dashboard/components/SeletorProduto";
import { TabelaItens } from "@/app/dashboard/components/TabelaItens";
import { useItensVenda } from "@/hooks/useItensVenda";

export default function AbaItens({
    produtos,
    itensVenda,
    setItensVenda,
    setAbaAtiva,
    setValorTotal,
    clienteSelecionado
}: {
    produtos: Produto[];
    itensVenda: ItemVenda[];
    setItensVenda: Dispatch<SetStateAction<ItemVenda[]>>;
    setAbaAtiva: Dispatch<SetStateAction<any>>;
    setValorTotal: Dispatch<SetStateAction<number>>;
    clienteSelecionado: Cliente | null;
}) {
    const {
        produtoSelecionado,
        setProdutoSelecionado,
        quantidade,
        setQuantidade,
        valorUnitario,
        setValorUnitario,
    } = useProdutoSelecionado();

    const [totalVenda, setTotalVenda] = useState<number>(0)

    const {
        adicionarItem,
        atualizarItem,
        removerItem
    } = useItensVenda({
        setValorTotal,
        setTotalVenda,
        itensVenda,
        setItensVenda
    });

    return (
        <>
            <SeletorProduto
                onAdicionar={adicionarItem}
                produtoSelecionado={produtoSelecionado}
                setProdutoSelecionado={setProdutoSelecionado}
                quantidade={quantidade}
                setQuantidade={setQuantidade}
                produtos={produtos}
                valorUnitario={valorUnitario}
                setValorUnitario={setValorUnitario}
            />

            <hr className={styles.divisor} />

            <div>
                <h3 className={styles.tituloSecao}>Itens adicionados</h3>
                {itensVenda.length === 0 ? (
                    <p className={styles.vazio}>Nenhum item adicionado</p>
                ) : (
                    <TabelaItens
                        itensVenda={itensVenda}
                        onAtualizar={atualizarItem}
                        onRemover={removerItem}
                        totalVenda={totalVenda}
                    />
                )}
            </div>

            <button className={styles.botao} onClick={() => {
                if (itensVenda.length > 0 && clienteSelecionado) {
                    setAbaAtiva("pagamento");
                } else {
                    toast.error("É necessário selecionar um cliente e ao menos um produto!")
                }
            }}>Pagamento {'>'}</button>
        </>
    )
}