import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin/auth";

export const runtime = "nodejs";
import {
  getTransactions,
  addTransaction,
  deleteTransaction,
  updateTransaction,
} from "@/lib/admin/data";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const transactions = await getTransactions();
    return NextResponse.json(transactions);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("GET /api/admin/transactions:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { type, amount, description, category, date } = body;
    if (!type || !amount || !description || !category || !date) {
      return NextResponse.json({ error: "Eksik alanlar" }, { status: 400 });
    }
    if (!["income", "expense"].includes(type)) {
      return NextResponse.json({ error: "Geçersiz tür" }, { status: 400 });
    }
    const tx = await addTransaction({
      type,
      amount: Number(amount),
      description,
      category,
      date,
    });
    return NextResponse.json(tx, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("POST /api/admin/transactions:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id, ...updates } = await request.json();
    if (!id) return NextResponse.json({ error: "ID gerekli" }, { status: 400 });
    const tx = await updateTransaction(id, updates);
    if (!tx) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    return NextResponse.json(tx);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("PUT /api/admin/transactions:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "ID gerekli" }, { status: 400 });
    const deleted = await deleteTransaction(id);
    if (!deleted) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("DELETE /api/admin/transactions:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
