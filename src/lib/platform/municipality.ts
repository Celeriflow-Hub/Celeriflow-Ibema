/**
 * Identidade institucional única da instância (dados do Edital PE 00014/2026).
 * Toda referência a nome, endereço, UF, códigos oficiais e links do município
 * deve vir deste módulo, nunca de texto fixo em páginas ou seeds.
 */
export const municipality = {
  name: "Cacimba de Dentro",
  cityName: "Cacimba de Dentro",
  cityShort: "Cacimba de Dentro",
  state: "PB",
  stateName: "Paraíba",
  region: "Curimataú",
  prefectureName: "Prefeitura Municipal de Cacimba de Dentro",
  legalName: "Município de Cacimba de Dentro",
  cityHallShort: "Prefeitura de Cacimba de Dentro",
  cnpj: "08.929.648/0001-59",
  /** Chave Pix de arrecadação (provisória: CNPJ). Confirmar com a Tesouraria. */
  pixKey: process.env.NEXT_PUBLIC_MUNICIPAL_PIX_KEY || "08929648000159",
  /** Código IBGE (7 dígitos) informado pela Prefeitura para os leiautes SAGRES. */
  ibgeCode: "2503506",
  /** Código IBGE resumido (6 dígitos) informado pela Prefeitura. */
  ibgeCodeShort: "250355",
  /** Código de identificação interno do município na tabela histórica do TCE-PB. */
  sagresUnitCode: process.env.NEXT_PUBLIC_SAGRES_UNIT_CODE || "035",
  siafiCode: "1971",
  tseCode: "19712",
  auditCourt: "TCE-PB",
  address: "Rua Capitão Pedro Moreira, 15 — Centro",
  addressStreet: "Rua Capitão Pedro Moreira, 15 — Centro",
  zipCode: "58230-000",
  postalCode: "58230-000",
  email: "cpl@cacimbadedentro.pb.gov.br",
  phone: null as string | null,
  website: "https://www.cacimbadedentro.pb.gov.br",
  officialGazetteUrl: "https://www.cacimbadedentro.pb.gov.br",
  lawsUrl: "https://www.cacimbadedentro.pb.gov.br",
  facebookUrl: "https://www.facebook.com/",
  systemDomain: "cacimbadedentro.celeriflow.com.br",
  coatOfArms: "/brasao-cacimba-de-dentro.png",
};

export const municipalityLabel = `${municipality.name}/${municipality.state}`;

export function fullAddress() {
  return `${municipality.address}, ${municipality.name}/${municipality.state} — CEP ${municipality.zipCode}`;
}
