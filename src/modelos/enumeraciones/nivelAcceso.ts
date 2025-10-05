export const NivelAcceso = {
    BASICO: "BASICO",
    MEDIO: "MEDIO",
    AVANZADO: "AVANZADO",
    SUPERADMI: "SUPERADMI"
} as const;

export type NivelAcceso = (typeof NivelAcceso)[keyof typeof NivelAcceso];
