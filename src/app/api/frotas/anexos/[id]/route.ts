import { NextRequest, NextResponse } from "next/server";
import { AccessError, getTenantContextForModuleOperation } from "@/lib/platform/tenant-context";
import { downloadFilename, getFile } from "@/lib/platform/blob";
import { fleetScope } from "@/lib/frotas/service";
import { listFleetAttachments } from "@/lib/frotas/attachments";
import type { FleetAttachmentOwnerType } from "@/lib/frotas/attachments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const context = await getTenantContextForModuleOperation("FROTAS", "update");
    const scope = fleetScope(context);
    const row = await context.prisma.fleetAttachment.findUnique({ where: { id } });
    if (!row) return NextResponse.json({ error: "Anexo não encontrado." }, { status: 404 });
    // Confirma o escopo do setor reaproveitando a mesma checagem da listagem.
    await listFleetAttachments(context.prisma, scope, row.ownerType as FleetAttachmentOwnerType, row.ownerId ?? "");
    const file = await getFile(row.url);
    if (!file?.stream) return NextResponse.json({ error: "Arquivo indisponível." }, { status: 404 });
    return new NextResponse(file.stream, {
      headers: {
        "Content-Type": file.blob.contentType || row.mimeType || "application/octet-stream",
        "Content-Disposition": `inline; filename="${downloadFilename(row.fileName)}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    if (error instanceof AccessError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (error instanceof Error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ error: "Erro interno ao baixar o anexo." }, { status: 500 });
  }
}
