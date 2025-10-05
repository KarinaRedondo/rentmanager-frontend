export const TipoContrato = {
    ARRENDAMIENTO: "ARRENDAMIENTO",
    SUBARRENDAMIENTO: "SUBARRENDAMIENTO",
    ADMINISTRACION: "ADMINISTRACION",
} as const;

export type TipoContrato = (typeof TipoContrato)[keyof typeof TipoContrato];