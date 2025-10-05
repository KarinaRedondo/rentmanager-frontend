export const TipoCuenta = {
    AHORROS: "AHORROS",
    CORRIENTE: "CORRIENTE"
}as const;
export type TipoCuenta = (typeof TipoCuenta)[keyof typeof TipoCuenta];