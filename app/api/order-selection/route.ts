import { auth } from "@/auth";
import {
  hasSelectionItems,
  normalizeOrderUnits,
  normalizeQuantities,
  type SharedOrderSelection,
} from "@/lib/shared-order-selection";
import {
  isSharedSelectionConfigured,
  readSharedOrderSelection,
  writeSharedOrderSelection,
} from "@/lib/shared-order-selection-kv";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  if (!isSharedSelectionConfigured()) {
    return NextResponse.json(
      { syncEnabled: false, reason: "kv_not_configured" },
      { status: 503 },
    );
  }

  const stored = await readSharedOrderSelection();
  if (!stored) {
    return NextResponse.json({
      syncEnabled: true,
      quantities: {},
      orderUnits: {},
      updatedAt: null,
      updatedBy: null,
    });
  }

  return NextResponse.json({
    syncEnabled: true,
    quantities: normalizeQuantities(stored.quantities),
    orderUnits: normalizeOrderUnits(stored.orderUnits),
    updatedAt: stored.updatedAt,
    updatedBy: stored.updatedBy ?? null,
  });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  if (!isSharedSelectionConfigured()) {
    return NextResponse.json(
      { syncEnabled: false, reason: "kv_not_configured" },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const o = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const quantities = normalizeQuantities(
    o.quantities as Record<string, unknown> | undefined,
  );
  const orderUnits = normalizeOrderUnits(
    o.orderUnits as Record<string, unknown> | undefined,
  );

  const clientUpdatedAt =
    typeof o.updatedAt === "string" ? o.updatedAt.trim() : "";

  const existing = await readSharedOrderSelection();
  if (
    existing?.updatedAt &&
    clientUpdatedAt &&
    clientUpdatedAt < existing.updatedAt &&
    hasSelectionItems(existing.quantities)
  ) {
    return NextResponse.json(
      {
        conflict: true,
        quantities: normalizeQuantities(existing.quantities),
        orderUnits: normalizeOrderUnits(existing.orderUnits),
        updatedAt: existing.updatedAt,
        updatedBy: existing.updatedBy ?? null,
      },
      { status: 409 },
    );
  }

  const payload: SharedOrderSelection = {
    quantities,
    orderUnits,
    updatedAt: new Date().toISOString(),
    updatedBy: session.user?.email ?? undefined,
  };

  const ok = await writeSharedOrderSelection(payload);
  if (!ok) {
    return NextResponse.json(
      { error: "Échec enregistrement" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    syncEnabled: true,
    quantities: payload.quantities,
    orderUnits: payload.orderUnits,
    updatedAt: payload.updatedAt,
    updatedBy: payload.updatedBy ?? null,
  });
}
