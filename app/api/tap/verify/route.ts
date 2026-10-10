import { NextRequest, NextResponse } from 'next/server';
import { retrieveTapCharge } from '@/lib/tapService';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tapId = searchParams.get('tap_id') || searchParams.get('charge_id');

  if (!tapId) {
    return NextResponse.json(
      { success: false, error: 'معرف المعاملة tap_id مطلوب للتحقق من الدفع' },
      { status: 400 }
    );
  }

  const result = await retrieveTapCharge(tapId);

  if (!result.success || !result.data) {
    return NextResponse.json(
      {
        success: false,
        error: result.error || 'تعذر التحقق من حالة المعاملة لدى Tap Payments',
      },
      { status: 422 }
    );
  }

  const charge = result.data;
  const isPaid = charge.status === 'CAPTURED' || charge.status === 'AUTHORIZED';

  return NextResponse.json({
    success: true,
    isPaid,
    status: charge.status,
    chargeId: charge.id,
    amount: charge.amount,
    currency: charge.currency,
    customer: charge.customer,
    card: charge.card,
    reference: charge.reference,
    receipt: charge.receipt,
    response: charge.response,
    metadata: charge.metadata,
  });
}
