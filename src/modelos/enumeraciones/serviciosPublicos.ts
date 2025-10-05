export const ServiciosPublicos = {
    AGUA: "AGUA",
    LUZ: "LUZ",
    GAS: "GAS",
    INTERNET: "INTERNET",
    CABLE: "CABLE",
} as const;
export type ServiciosPublicos = typeof ServiciosPublicos[keyof typeof ServiciosPublicos];