export const FormaPago = {
 MENSUAL: "MENSUAL",
 TRIMESTRAL: "TRIMESTRAL",
 SEMESTRAL: "SEMESTRAL",
 ANUAL: "ANUAL",
} as const;
export type FormaPago = (typeof FormaPago)[keyof typeof FormaPago];