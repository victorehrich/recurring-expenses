import { NextResponse, NextRequest } from "next/server";
import Payment from "@/models/Payment";
import Expense from "@/models/Expense";
import { connectToDatabase } from "@/lib/mongodb";
import { getNextOccurrence } from "@/lib/dueDate";

/**
 * GET /api/payments?expenseId=xxxxx
 * Returns the payment history for the given expense.
 */
export async function GET(request: NextRequest) {
  const expenseId = request.nextUrl.searchParams.get("expenseId");
  if (!expenseId) {
    return NextResponse.json({ error: "expenseId is required" }, { status: 400 });
  }

  await connectToDatabase();
  const payments = await Payment.find({ expenseId }).sort({ paidAt: -1 }).lean();
  return NextResponse.json({ payments });
}

/**
 * POST /api/payments
 * Body: { expenseId, paidAt?, amount?, method?, notes? }
 * Registers a payment for the current period of the expense.
 */
export async function POST(request: NextRequest) {
  const { expenseId, paidAt, amount, method, notes } = await request.json();
  if (!expenseId) {
    return NextResponse.json({ error: "expenseId is required" }, { status: 400 });
  }

  await connectToDatabase();
  const expense = await Expense.findById(expenseId);
  if (!expense) {
    return NextResponse.json({ error: "Despesa não encontrada" }, { status: 404 });
  }

  const paymentDate = paidAt ? new Date(paidAt) : new Date();
  const { periodKey } = getNextOccurrence(expense, paymentDate);

  // avoid duplicate payment for the same period
  const exists = await Payment.findOne({ expenseId, periodKey });
  if (exists) {
    return NextResponse.json({ error: "Pagamento já registrado para este período" }, { status: 400 });
  }

  const payment = await Payment.create({
    expenseId,
    paidAt: paymentDate,
    periodKey,
    amount: amount ?? expense.amount,
    method,
    notes,
    confirmed: true,
  });

  // Mark expense as having payment for this period to avoid future notifications/status
  expense.lastNotifiedKey = periodKey;
  await expense.save();

  return NextResponse.json({ payment }, { status: 201 });
}
