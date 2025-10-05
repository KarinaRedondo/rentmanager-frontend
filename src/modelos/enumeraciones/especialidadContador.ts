export const EspecialidadContador = {
    TRIBUTARIO: "TRIBUTARIO",
    FINANCIERO: "FINANCIERO",
    AUDITORIA: "AUDITORIA",
    GENERAL: "GENERAL"
}as const;
export type EspecialidadContador = typeof EspecialidadContador[keyof typeof EspecialidadContador];