import { NextRequest, NextResponse } from 'next/server';
import { createTapCharge } from '@/lib/tapService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      amount,
      currency = 'SAR',
      customer,
      orderId,
      orderNumber,
      sourceId = 'src_all',
      description,
      metadata,
    } = body;

    if (!amount || !customer || !orderNumber) {
      return NextResponse.json(
        { success: false, error: 'بيانات الطلب غير مكتملة (المبلغ، بيانات العميل، رقم الطلب مطلوبة)' },
        { status: 400 }
      );
    }

    // Determine absolute base URL for callbacks
    const origin =
      process.env.APP_URL ||
      req.headers.get('origin') ||
      req.headers.get('x-forwarded-host')
        ? `${req.headers.get('x-forwarded-proto') || 'https'}://${req.headers.get('x-forwarded-host')}`
        : 'https://lenscode.sa';

    const cleanOrigin = origin.replace(/\/$/, '');
    const redirectUrl = `${cleanOrigin}/checkout/result`;
    const postUrl = `${cleanOrigin}/api/tap/webhook`;

    // Process charge creation with Tap Payments
    const result = await createTapCharge({
      amount: Number(amount),
      currency,
      customer: {
        first_name: customer.name?.split(' ')[0] || customer.name || 'عميل',
        last_name: customer.name?.split(' ').slice(1).join(' ') || 'LensCode',
        email: customer.email,
        phone: {
          country_code: customer.phoneCountryCode || '966',
          number: customer.phone || '500000000',
        },
      },
      orderId: orderId || `ord_${Date.now()}`,
      orderNumber,
      description: description || `طلب لِـنس كود #${orderNumber}`,
      sourceId,
      redirectUrl,
      postUrl,
      metadata,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'فشلت عملية إنشاء بوابة الدفع لدى Tap Payments',
          details: result.data,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      chargeId: result.data?.id,
      status: result.data?.status,
      redirectUrl: result.redirectUrl || result.data?.transaction?.url,
      transaction: result.data?.transaction,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'حدث خطأ داخلي أثناء معالجة طلب الدفع',
      },
      { status: 500 }
    );
  }
}
