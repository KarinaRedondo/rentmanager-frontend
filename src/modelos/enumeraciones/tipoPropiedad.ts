export const TipoPropiedad = {
    CASA: "CASA",
    APARTAMENTO: "APARTAMENTO",
    OFICINA: "OFICINA",
    LOCAL: "LOCAL",
    BODEGA: "BODEGA",
    TERRENO: "TERRENO"
}as const;

export type TipoPropiedad = (typeof TipoPropiedad)[keyof typeof TipoPropiedad];