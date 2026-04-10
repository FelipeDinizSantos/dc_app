import { Dispatch, SetStateAction } from "react";

import styles from "./styles.module.css";

export function ParcelasForm({ numParcelas, setNumParcelas, gerar }: {
    numParcelas: number;
    setNumParcelas: Dispatch<SetStateAction<number>>;
    gerar: () => void;
}) {
    return (
        <form
            className={styles.formParcelas}
            onSubmit={(e) => {
                e.preventDefault();
                gerar();
            }}
        >
            <div className={styles.campo}>
                <label className={styles.label}>Número de parcelas</label>
                <input
                    className={styles.input}
                    type="number"
                    min={1}
                    value={numParcelas}
                    onChange={(e) => setNumParcelas(parseInt(e.target.value))}
                />
            </div>
            <button type="submit" className={styles.botaoAdicionar} title="Gerar">
                Gerar Parcelas
            </button>
        </form>
    );
}