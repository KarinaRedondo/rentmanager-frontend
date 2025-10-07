export const EntidadFinanciera = {
    BANCOLOMBIA: "BANCOLOMBIA",
    DAVIVIENDA: "DAVIVIENDA",
    BANCO_DE_BOGOTA:  "BANCO_DE_BOGOTA",
    BANCO_POPULAR: "BANCO_POPULAR",
    BANCO_CAJA_SOCIAL: "BANCO_CAJA_SOCIAL",
    BBVA: "BBVA",
    BANCO_DE_OCCIDENTE: "BANCO_DE_OCCIDENTE",
    BANCO_AGRARIO: "BANCO_AGRARIO",
    BANCO_MUNDO_MUJER: "BANCO_MUNDO_MUJER",
    BANCO_W: "BANCO_W",
    // --- SEDPE y entidades digitales ---
    NEQUI: "NEQUI",
    DALE: "DALE",
    MOVII: "MOVII",

    // --- Opción genérica ---
    OTRO: "OTRO"
}as const;

export type EntidadFinanciera = typeof EntidadFinanciera[keyof typeof EntidadFinanciera];