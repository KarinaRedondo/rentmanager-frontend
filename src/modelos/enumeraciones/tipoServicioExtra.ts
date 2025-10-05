export const TipoServicioExtra = {
    MANTEMIENTO: "MANTENIMIENTO",
    ASEO: "ASEO",
    PARQUEADERO_EXTRA: "PARQUEADERO_EXTRA",
    REPARACION: "REPARACION",
    OTRO: "OTRO",
} as const;
export type TipoServicioExtra = typeof TipoServicioExtra[keyof typeof TipoServicioExtra];