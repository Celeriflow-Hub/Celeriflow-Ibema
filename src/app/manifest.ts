import type { MetadataRoute } from "next";
import { municipality } from "@/lib/platform/municipality";

// Permite instalar o sistema na tela inicial do celular (acesso mobile).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `CeleriFlow — ${municipality.prefectureName}`,
    short_name: "CeleriFlow",
    description: `Sistema de gestão pública da ${municipality.prefectureName}/${municipality.state}.`,
    start_url: "/",
    display: "standalone",
    background_color: "#f1f5f9",
    theme_color: "#0e4c7e",
    lang: "pt-BR",
    icons: [{ src: "/favicon.png", sizes: "any", type: "image/png" }],
    shortcuts: [
      { name: "Portal do Servidor", short_name: "Servidor", url: "/portal-servidor" },
      { name: "Meus documentos", short_name: "Documentos", url: "/portal-servidor/emissao" },
      { name: "Solicitações", short_name: "Solicitar", url: "/portal-servidor/solicitacoes" },
      { name: "Portal da Frota — Motorista", short_name: "Frota", url: "/portal-frota" },
    ],
  };
}
