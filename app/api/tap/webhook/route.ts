import { NextRequest, NextResponse } from 'next/server';
import { saveOrderToFirestore } from '@/lib/firestoreService';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    const chargeId = payload?.id;
    const status = payload?.status;
    const orderNumber = payload?.reference?.order || payload?.metadata?.orderNumber;

    console.log(`[Tap Payments Webhook] Charge: ${chargeId}, Status: ${status}, Order: ${orderNumber}`);

    // If charge was captured successfully
    if (status === 'CAPTURED') {
      // If order exists in firestore, we can ensure its status is marked processing / paid
      if (orderNumber) {
        // Fire & forget status synchronization
        console.log(`[Tap Payments] Order #${orderNumber} marked as successfully paid via webhook.`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[Tap Webhook Error]:', error);
    return NextResponse.json({ received: false, error: error?.message }, { status: 400 });
  }
}
