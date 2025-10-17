export const TipoContrato = {
   RESIDENCIAL: "RESIDENCIAL",
    COMERCIAL: "COMERCIAL",
    TEMPORADA_CORTA: "TEMPORADA_CORTA",
    TEMPORADA_LARGA: "TEMPORADA_LARGA",
} as const;

export type TipoContrato = (typeof TipoContrato)[keyof typeof TipoContrato];