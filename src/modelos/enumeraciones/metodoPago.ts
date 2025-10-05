export const MetodoPago = {
    EFECTIVO: "EFECTIVO",
    TRANSFERENCIA: "TRANSFERENCIA",
}as const;

export type MetodoPago = typeof MetodoPago[keyof typeof MetodoPago];