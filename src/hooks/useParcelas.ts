import { Parcela } from "@/interfaces/Parcela.interface";
import { useState } from "react";

export function useParcelas(valorTotal: number) {
    // Campo input dos valores de cada parcela. Não são as parfcelas em si
    const [parcelasInput, setParcelasInput] = useState<{ [key: number]: string }>({});
    const [numParcelas, setNumParcelas] = useState<number>(1);
    const [parcelas, setParcelas] = useState<Parcela[]>([]);

    const gerarParcelas = () => {
        if (numParcelas <= 0) return;

        const valorInit = parseFloat((valorTotal / numParcelas).toFixed(2));
        const hoje = new Date();

        const parcelasFormat: Parcela[] = [];

        for (let i = 0; i < numParcelas; i++) {
            const vencimento = new Date(hoje);
            vencimento.setMonth(vencimento.getMonth() + i + 1);
            const vencimentoTxt = vencimento.toISOString().split("T")[0];

            const parcela: Parcela = {
                id: i,
                valor: valorInit,
                vencimento: vencimentoTxt,
                formaPagamento: "dinheiro",
            };

            parcelasFormat.push(parcela);
        }

        let soma = 0;
        for (let i = 0; i < parcelasFormat.length; i++) {
            soma += parcelasFormat[i].valor;
        }

        // Calcula a diferença gerada pelo arredondamento, subtraindo e jogando o valor na ultima parcela
        const diff = parseFloat((valorTotal - soma).toFixed(2));
        parcelasFormat[numParcelas - 1].valor += diff;
        setParcelas(parcelasFormat);
    };

    const handleChange = (id: number, campo: keyof Parcela, valorInput: string) => {
        if (campo === "valor") {
            setParcelasInput(prev => {
                const copia = { ...prev };
                copia[id] = valorInput;
                return copia;
            });

            setParcelas(prev => {
                const novasParcelas = [...prev];
                const index = novasParcelas.findIndex(p => p.id === id);
                if (index === -1) return prev;

                let valor = parseFloat(valorInput);
                if (isNaN(valor)) valor = 0;
                if (valor < 0) valor = 0;

                novasParcelas[index] = { ...novasParcelas[index], valor };

                //Apos mudancça verifica quanto sobra para completar o total da venda, e repassa para parcelas restantes
                const indicesOutrasParc: number[] = [];
                for (let i = 0; i < novasParcelas.length; i++) {
                    if (i !== index) {
                        indicesOutrasParc.push(i);
                    }
                }

                let totalOutrasParc = 0;
                for (let i = 0; i < indicesOutrasParc.length; i++) {
                    totalOutrasParc += novasParcelas[indicesOutrasParc[i]].valor;
                }
                const restante = parseFloat((valorTotal - valor - totalOutrasParc).toFixed(2));

                for (let i = 0; i < indicesOutrasParc.length; i++) {
                    const indice = indicesOutrasParc[i];

                    // Regra de tres para proporcao de cada parcela para com o total
                    const proporcao = novasParcelas[indice].valor / totalOutrasParc;
                    const novoValor = parseFloat((novasParcelas[indice].valor + proporcao * restante).toFixed(2));
                    novasParcelas[indice] = { ...novasParcelas[indice], valor: novoValor };
                }

                let somaFinal = 0;
                for (let i = 0; i < novasParcelas.length; i++) {
                    somaFinal += novasParcelas[i].valor;
                }

                // Resolve o mesmo B.O da GerarParcelas (diferença gerada pelo arredondamento)
                const diff = parseFloat((valorTotal - somaFinal).toFixed(2));
                const last = novasParcelas.length - 1;
                novasParcelas[last] = { ...novasParcelas[last], valor: novasParcelas[last].valor + diff };

                setParcelasInput(prev => {
                    const copia = { ...prev };

                    // Usei para remover os inputs antigos e trocar pelos novos re calculados. Para tirar a inconsistencia da UI 
                    for (let i = 0; i < indicesOutrasParc.length; i++) {
                        const indice = indicesOutrasParc[i];
                        delete copia[novasParcelas[indice].id];
                    }

                    return copia;
                });

                return novasParcelas;
            });
        } else {
            setParcelas(prev => {
                const novasParcelas = [...prev];
                const index = novasParcelas.findIndex(p => p.id === id);
                if (index === -1) return prev;
                novasParcelas[index] = { ...novasParcelas[index], [campo]: valorInput };
                return novasParcelas;
            });
        }
    };

    return {
        parcelas,
        parcelasInput,
        numParcelas,
        setNumParcelas,
        gerarParcelas,
        handleChange,
        setParcelasInput,
    };
}