import { test } from "node:test";
import assert from "node:assert/strict";
import { validateFleetAttachmentFile, FLEET_ATTACHMENT_MAX_SIZE_BYTES, FLEET_ATTACHMENT_OWNER_TYPES } from "../src/lib/frotas/attachments";

test("1.578: aceita formatos permitidos e tamanho até 20 MB", () => {
  assert.doesNotThrow(() => validateFleetAttachmentFile({ name: "laudo.pdf", size: 1024 }));
  assert.doesNotThrow(() => validateFleetAttachmentFile({ name: "foto.jpeg", size: FLEET_ATTACHMENT_MAX_SIZE_BYTES }));
});

test("1.578: recusa extensão não permitida", () => {
  assert.throws(() => validateFleetAttachmentFile({ name: "virus.exe", size: 1024 }), /Extensão não permitida/);
});

test("1.578: recusa arquivo acima de 20 MB", () => {
  assert.throws(() => validateFleetAttachmentFile({ name: "arquivo.pdf", size: FLEET_ATTACHMENT_MAX_SIZE_BYTES + 1 }), /20 MB/);
});

test("1.578: recusa arquivo vazio ou sem nome", () => {
  assert.throws(() => validateFleetAttachmentFile({ name: "", size: 1024 }), /válido/);
  assert.throws(() => validateFleetAttachmentFile({ name: "a.pdf", size: 0 }), /válido/);
});

test("tipos de registro de anexo cobrem veículo, motorista, multa, sinistro e autorização", () => {
  assert.deepEqual([...FLEET_ATTACHMENT_OWNER_TYPES], ["VEICULO", "MOTORISTA", "MULTA", "SINISTRO", "AUTORIZACAO"]);
});
