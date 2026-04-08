"use client";

import { useState } from "react";
import Nav, { Aba } from "./components/nav/nav";
import Vendas from "./components/vendas/page";
import CadastroClientes from "./components/cadastro-clientes/page";
import CadastroProdutos from "./components/cadastro-produtos/page";
import ListaDeVendas from "./components/lista-de-vendas/page";

export default function Dashboard() {
    const [abaAtiva, setAbaAtiva] = useState<Aba>("vendas");

    return (
        <div>
            <Nav abaAtiva={abaAtiva} onMudarAba={setAbaAtiva} />
            {abaAtiva === "vendas" && <Vendas />}
            {abaAtiva === "lista-vendas" && <ListaDeVendas />}
            {abaAtiva === "cadastro-cliente" && <CadastroClientes />}
            {abaAtiva === "cadastro-produto" && <CadastroProdutos />}
        </div>
    );
}