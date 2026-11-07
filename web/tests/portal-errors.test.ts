import test from "node:test";
import assert from "node:assert/strict";
import { PortalError, isPortalError } from "../src/lib/server/repository";

test("expected errors remain recognizable across separately loaded server bundles", async () => {
  const separateModule = "../src/lib/server/repository.ts?other-bundle";
  const { PortalError: OtherPortalError } = await import(separateModule);
  const error = new OtherPortalError("Edição concorrente", 409);
  assert.equal(error instanceof PortalError, false);
  assert.equal(isPortalError(error), true);
  assert.equal(error.status, 409);
  assert.equal(isPortalError(new Error("Internal error")), false);
});
