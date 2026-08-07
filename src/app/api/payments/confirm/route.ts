import { NextResponse, NextRequest } from "next/server";
import Payment from "@/models/Payment";
import { connectToDatabase } from "@/lib/mongodb";

/**
 * POST /api/payments/confirm
 * Body: { paymentId, confirmDate? }
 * Marks a payment as confirmed (for old payments) and optionally overrides the date.
 */
export async function POST(request: NextRequest) {
  const { paymentId, confirmDate } = await request.json();
  if (!paymentId) {
    return NextResponse.json({ error: "paymentId is required" }, { status: 400 });
  }

  await connectToDatabase();
  const payment = await Payment.findById(paymentId);
  if (!payment) {
    return NextResponse.json({ error: "Pagamento não encontrado" }, { status: 404 });
  }

  payment.confirmed = true;
  if (confirmDate) payment.paidAt = new Date(confirmDate);
  await payment.save();

  return NextResponse.json({ payment });
}
