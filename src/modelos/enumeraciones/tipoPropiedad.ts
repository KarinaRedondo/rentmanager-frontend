export const TipoPropiedad = {
     APARTAMENTO:"APARTAMENTO",
    CASA:"CASA",
    DUPLEX:"DUPLEX",
    PENTHOUSE:"PENTHOUSE",
    APARTAMENTO_ESTUDIO:"APARTAMENTO_ESTUDIO",
    CASA_PLAYA:"CASA_PLAYA",

    // Tipos comerciales
    OFICINA:"OFICINA",
    LOCAL_COMERCIAL:"LOCAL_COMERCIAL",
    BODEGA:"BODEGA",
    GALPON:"GALPON",
    CONSULTORIO:"CONSULTORIO",

    // Otros tipos
    TERRENO:"TERRENO",
    FINCA:"FINCA",
    GARAJE:"GARAJE",
}as const;

export type TipoPropiedad = (typeof TipoPropiedad)[keyof typeof TipoPropiedad];