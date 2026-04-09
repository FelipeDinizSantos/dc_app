"use client";

import { useState, useEffect } from "react";
import { Parcela } from "@/interfaces/Parcela.interface";

export default function ParcelasEditor({
    valorTotal,
    parcelas,
    setParcelas
}: {
    valorTotal: number;
    parcelas: Parcela[];
    setParcelas: (parcelas: Parcela[]) => void;
}) {

    const [parcelasInput, setParcelasInput] = useState<{ [key: number]: string }>({});
    const [numParcelas, setNumParcelas] = useState<number>(parcelas.length || 1);

    useEffect(() => {
        setNumParcelas(parcelas.length || 1);
    }, [parcelas]);

    const gerarParcelas = () => {
        if (numParcelas <= 0) return;

        const valorInit = parseFloat((valorTotal / numParcelas).toFixed(2));
        const hoje = new Date();

        const novas: Parcela[] = [];

        for (let i = 0; i < numParcelas; i++) {
            const venc = new Date(hoje);
            venc.setMonth(venc.getMonth() + i + 1);

            novas.push({
                id: i,
                valor: valorInit,
                vencimento: venc.toISOString().split("T")[0],
                formaPagamento: "dinheiro"
            });
        }

        let soma = novas.reduce((acc, p) => acc + p.valor, 0);
        const diff = parseFloat((valorTotal - soma).toFixed(2));
        novas[numParcelas - 1].valor += diff;

        setParcelas(novas);
    };

    const handleChange = (id: number, campo: keyof Parcela, valor: string) => {
        if (campo === "valor") {
            setParcelasInput(prev => ({ ...prev, [id]: valor }));

            setParcelas(prev => {
                const novas = [...prev];
                const index = novas.findIndex(p => p.id === id);
                if (index === -1) return prev;

                let val = parseFloat(valor);
                if (isNaN(val)) val = 0;
                if (val < 0) val = 0;

                novas[index].valor = val;

                let soma = novas.reduce((acc, p) => acc + p.valor, 0);
                const diff = parseFloat((valorTotal - soma).toFixed(2));

                novas[novas.length - 1].valor += diff;

                return novas;
            });
        } else {
            setParcelas(prev => {
                const novas = [...prev];
                const index = novas.findIndex(p => p.id === id);
                if (index === -1) return prev;

                novas[index] = { ...novas[index], [campo]: valor };
                return novas;
            });
        }
    };

    return (
        <div>
            <h4>Parcelas</h4>

            <div>
                <input
                    type="number"
                    min={1}
                    value={numParcelas}
                    onChange={(e) => setNumParcelas(Number(e.target.value))}
                />
                <button onClick={gerarParcelas}>Gerar</button>
            </div>

            {parcelas.length === 0 ? (
                <p>Nenhuma parcela gerada.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Vencimento</th>
                            <th>Valor</th>
                            <th>Forma</th>
                        </tr>
                    </thead>
                    <tbody>
                        {parcelas.map(p => (
                            <tr key={p.id}>
                                <td>{p.id + 1}</td>
                                <td>
                                    <input
                                        type="date"
                                        value={p.vencimento}
                                        onChange={(e) => handleChange(p.id, "vencimento", e.target.value)}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={parcelasInput[p.id] ?? p.valor.toFixed(2)}
                                        onChange={(e) => handleChange(p.id, "valor", e.target.value)}
                                    />
                                </td>
                                <td>
                                    <select
                                        value={p.formaPagamento}
                                        onChange={(e) => handleChange(p.id, "formaPagamento", e.target.value)}
                                    >
                                        <option value="dinheiro">Dinheiro</option>
                                        <option value="pix">Pix</option>
                                        <option value="boleto">Boleto</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}