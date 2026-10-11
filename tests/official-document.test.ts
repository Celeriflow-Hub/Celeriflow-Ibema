import { test } from "node:test";
import assert from "node:assert/strict";
import { renderOfficialDocument } from "../src/lib/platform/official-document";
test("documento oficial tem brasão, rodapé e escapa conteúdo", () => {
  const h = renderOfficialDocument({ title: "Teste <x>", sections: [{ title: "A", head: ["c"], rows: [["<b>"]] }], code: "X1" });
  assert.match(h, /brasao-cacimba/); assert.match(h, /08\.929\.648/); assert.match(h, /&lt;b&gt;/); assert.match(h, /X1/);
});
