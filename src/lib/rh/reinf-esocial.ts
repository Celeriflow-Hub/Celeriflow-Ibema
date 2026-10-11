/**
 * Sprint 3 (pós-merge) — EFD-Reinf R-4010 (substitui a DIRF) e eSocial S-1010 (rubricas).
 * Gera XML no leiaute oficial simplificado, SEM assinatura/transmissão.
 * PENDENTE: assinatura ICP-Brasil (certificado A1 da Prefeitura) e envio ao webservice.
 */
export type R4010Payment = { cpf: string; name: string; natRend: string; date: string; gross: number; irrf: number };
export type S1010Rubric = { code: string; description: string; nature: string; type: 1 | 2 | 3; startCompetence: string };

const esc = (v: string) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const money = (v: number) => v.toFixed(2).replace(".", ",");
const digits = (v: string) => v.replace(/\D/g, "");

export function eventId(cnpj: string, seq: number, at = new Date()) {
  const ts = at.toISOString().replace(/\D/g, "").slice(0, 14);
  return `ID1${digits(cnpj).padEnd(14, "0")}${ts}${String(seq).padStart(5, "0")}`;
}

export function buildR4010(cnpj: string, competence: string, beneficiary: { cpf: string; name: string }, payments: R4010Payment[], seq = 1) {
  const pays = payments.map((p) => `<idePgto><natRend>${p.natRend}</natRend><infoPgto><dtFG>${p.date}</dtFG><vlrRendBruto>${money(p.gross)}</vlrRendBruto><vlrRendTrib>${money(p.gross)}</vlrRendTrib><vlrIR>${money(p.irrf)}</vlrIR></infoPgto></idePgto>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><Reinf xmlns="http://www.reinf.esocial.gov.br/schemas/evt4010PagtoBeneficiarioPF/v2_01_02"><evtRetPF id="${eventId(cnpj, seq)}"><ideEvento><indRetif>1</indRetif><perApur>${competence}</perApur><tpAmb>2</tpAmb><procEmi>1</procEmi><verProc>CeleriFlow</verProc></ideEvento><ideContri><tpInsc>1</tpInsc><nrInsc>${digits(cnpj).slice(0, 8)}</nrInsc></ideContri><ideEstab><tpInscEstab>1</tpInscEstab><nrInscEstab>${digits(cnpj)}</nrInscEstab><ideBenef><cpfBenef>${digits(beneficiary.cpf)}</cpfBenef><nmBenef>${esc(beneficiary.name)}</nmBenef>${pays}</ideBenef></ideEstab></evtRetPF></Reinf>`;
}

export function buildS1010(cnpj: string, rubric: S1010Rubric, seq = 1) {
  return `<?xml version="1.0" encoding="UTF-8"?><eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtTabRubrica/v_S_01_02_00"><evtTabRubrica Id="${eventId(cnpj, seq)}"><ideEvento><tpAmb>2</tpAmb><procEmi>1</procEmi><verProc>CeleriFlow</verProc></ideEvento><ideEmpregador><tpInsc>1</tpInsc><nrInsc>${digits(cnpj).slice(0, 8)}</nrInsc></ideEmpregador><infoRubrica><inclusao><ideRubrica><codRubr>${esc(rubric.code)}</codRubr><ideTabRubr>CF</ideTabRubr><iniValid>${rubric.startCompetence}</iniValid></ideRubrica><dadosRubrica><dscRubr>${esc(rubric.description)}</dscRubr><natRubr>${rubric.nature}</natRubr><tpRubr>${rubric.type}</tpRubr><codIncCP>11</codIncCP><codIncIRRF>11</codIncIRRF><codIncFGTS>11</codIncFGTS></dadosRubrica></inclusao></infoRubrica></evtTabRubrica></eSocial>`;
}
