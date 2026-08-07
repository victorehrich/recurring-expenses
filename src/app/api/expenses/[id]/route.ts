import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Expense from "@/models/Expense";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const expense = await Expense.findById(params.id);
    if (!expense) {
      return NextResponse.json({ error: "Despesa não encontrada" }, { status: 404 });
    }
    return NextResponse.json({ expense });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const expense = await Expense.findByIdAndUpdate(
      params.id,
      {
        name: body.name,
        amount: body.amount,
        category: body.category,
        frequency: body.frequency,
        dueDay: body.dueDay,
        dueMonth: body.dueMonth,
        active: body.active,
        reminderDays: body.reminderDays,
        chatId: body.chatId || undefined,
      },
      { new: true, runValidators: true }
    );

    if (!expense) {
      return NextResponse.json({ error: "Despesa não encontrada" }, { status: 404 });
    }

    return NextResponse.json({ expense });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const expense = await Expense.findByIdAndDelete(params.id);
    if (!expense) {
      return NextResponse.json({ error: "Despesa não encontrada" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
