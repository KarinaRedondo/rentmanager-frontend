export const EstadoCivil = {
    SOLTERO:"SOLTERO",
    CASADO: "CASADO",
    UNION_LIBRE: "UNION_LIBRE",
    DIVORCIADO: "DIVORCIADO",
    VIUDO: "VIUDO"
} as const;

export type EstadoCivil = (typeof EstadoCivil)[keyof typeof EstadoCivil];