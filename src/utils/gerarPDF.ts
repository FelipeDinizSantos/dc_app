import { Venda } from "@/interfaces/Venda.interface";
import jsPDF from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";

export default function gerarPDF(vendas: Venda[]) {
    const doc = new jsPDF();

    let currentY = 15;

    doc.setFontSize(16);
    doc.text("Relatório de Vendas", 14, currentY);
    currentY += 10;

    vendas.forEach((venda, index) => {
        doc.setFontSize(12);
        doc.text(`Venda #${venda.id}`, 14, currentY);
        currentY += 6;

        doc.setFontSize(10);
        doc.text(`Cliente: ${venda.cliente?.nome}`, 14, currentY);
        currentY += 5;

        doc.text(
            `Data: ${new Date(venda.data).toLocaleString("pt-BR")}`,
            14,
            currentY
        );
        currentY += 5;

        doc.text(`Usuário: ${venda.usuario?.nome}`, 14, currentY);
        currentY += 5;

        doc.text(
            `Forma de pagamento: ${venda.pagamento?.forma_de_pagamento}`,
            14,
            currentY
        );
        currentY += 5;

        doc.text(`Total: R$ ${venda.valor_total}`, 14, currentY);
        currentY += 6;

        autoTable(doc, {
            startY: currentY,
            head: [["Produto", "Qtd", "Valor Unitário", "Subtotal"]],
            body: venda.itens.map(item => [
                item.produto?.nome,
                item.qtd,
                `R$ ${Number(item.valor_unitario).toFixed(2)}`,
                `R$ ${Number(item.sub_total).toFixed(2)}`
            ]),
            headStyles: {
                fillColor: [230, 97, 1],
                textColor: 255
            }
        });

        currentY = (doc as any).lastAutoTable.finalY + 5;

        autoTable(doc, {
            startY: currentY,
            head: [["Parcela", "Vencimento", "Valor", "Pagamento"]],
            body: venda.pagamento?.parcelas.map((p, i) => [
                i + 1,
                new Date(p.vencimento || p.data_vencimento!).toLocaleDateString("pt-BR"),
                `R$ ${Number(p.valor).toFixed(2)}`,
                p.forma_de_pagamento
            ]) as RowInput[] | [],
            headStyles: {
                fillColor: [230, 97, 1],
                textColor: 255
            }
        });

        currentY = (doc as any).lastAutoTable.finalY + 10;

        if (currentY > 260 && index < vendas.length - 1) {
            doc.addPage();
            currentY = 15;
        }
    });

    doc.save("vendas.pdf");
}