export const TipoDocumento = {
    CEDULA: "CEDULA",
    CEDULA_EXTRANJERIA: "CEDULA_EXTRANJERIA",
    NIT: "NIT",
    PASAPORTE: "PASAPORTE",
}as const;
export type TipoDocumento = typeof TipoDocumento[keyof typeof TipoDocumento];