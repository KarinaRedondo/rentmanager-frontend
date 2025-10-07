export const TipoDocumento = {
    CC: "CC",
    CE: "CE",
    NIT: "NIT",
    PASAPORTE: "PASAPORTE",
}as const;
export type TipoDocumento = typeof TipoDocumento[keyof typeof TipoDocumento];