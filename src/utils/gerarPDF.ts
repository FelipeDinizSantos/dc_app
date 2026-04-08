import { Venda } from "@/interfaces/Venda.interface";
import jsPDF from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";

export default function gerarPDF(vendas: Venda[]) {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Relatório de Vendas", 14, 15);

    const rows = vendas.map(v => [
        v.id,
        v.cliente?.nome,
        new Date(v.data).toLocaleString("pt-BR"),
        v.pagamento?.forma_de_pagamento,
        v.usuario?.nome,
        `R$ ${v.valor_total}`,
        v.pagamento?.parcelas?.length || 0
    ]);

    autoTable(doc, {
        startY: 20, 
        head: [[
            "#",
            "Cliente",
            "Data",
            "Pagamento",
            "Usuário",
            "Valor",
            "Parcelas"
        ]],
        body: rows as RowInput[]
    });

    doc.save("vendas.pdf");
}