import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getFile, isInstanceDocumentPath, downloadFilename } from "@/lib/platform/blob";
import { getTransparencySettings } from "@/lib/transparencia/presentation-settings";
import { verifiedPublicationBytes,isPublicationPublic } from "@/lib/transparencia/publication-policy";
import { byteStream } from "@/lib/transparencia/export-files";
import { getTenantContextForModule } from "@/lib/platform/tenant-context";

export const dynamic = "force-dynamic";
export async function GET(request: Request, { params }: { params: Promise<{ publicKey: string }> }) {
  const { publicKey } = await params;
  const entry = await prisma.transparencyPublication.findUnique({ where: { publicKey } });
  const settings = await getTransparencySettings(prisma);
   const preview=new URL(request.url).searchParams.get("preview")==="1";
   if(preview){try{await getTenantContextForModule("TRANSPARENCIA");}catch{return Response.json({error:"Acesso não autorizado."},{status:403});}}
   if (!entry || !preview && !isPublicationPublic(entry,settings)) return Response.json({ error: "Publicação não disponível." }, { status: 404 });
   if(entry.linkUrl){const link=new URL(entry.linkUrl);if(!["http:","https:"].includes(link.protocol))return new Response(null,{status:404});return new Response(null,{status:307,headers:{Location:link.toString(),"Cache-Control":"no-store"}});}
  if (!entry.fileUrl || !entry.sha256 || !entry.filePathname || !isInstanceDocumentPath(entry.filePathname)) return Response.json({ error: "Arquivo não disponível." }, { status: 404 });
  const file = await getFile(entry.fileUrl);
  if (!file || file.blob.pathname !== entry.filePathname) return Response.json({ error: "Armazenamento indisponível." }, { status: 503 });
  try {
    const bytes = new Uint8Array(await new Response(file.stream).arrayBuffer());
    verifiedPublicationBytes(bytes, entry.sha256, value => createHash("sha256").update(value).digest("hex"));
     return new Response(byteStream(bytes), { headers: { "Content-Type": entry.contentType || "application/octet-stream", "Content-Disposition": `attachment; filename="${downloadFilename(entry.filename || entry.filePathname)}"`, "Cache-Control": "no-store", "X-Content-SHA256": entry.sha256, "X-Content-Type-Options": "nosniff" } });
  } catch {
    return Response.json({ error: "Integridade do arquivo não confirmada." }, { status: 503 });
  }
}
