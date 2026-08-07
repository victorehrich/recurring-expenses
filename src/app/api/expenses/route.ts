import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Expense from "@/models/Expense";

export async function GET() {
  try {
    await connectToDatabase();
    const expenses = await Expense.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ expenses });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const expense = await Expense.create({
      name: body.name,
      amount: body.amount,
      category: body.category || "Geral",
      frequency: body.frequency || "mensal",
      dueDay: body.dueDay,
      dueMonth: body.dueMonth,
      active: body.active ?? true,
      reminderDays: body.reminderDays ?? Number(process.env.DIAS_DE_AVISO ?? 3),
      chatId: body.chatId || undefined,
      boletoUrl: body.boletoUrl || undefined,
      observation: body.observation || undefined,
    });

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
