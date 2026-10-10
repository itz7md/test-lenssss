import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { order, carrier } = await req.json();

    if (!order) {
      return NextResponse.json({ success: false, error: 'الرجاء توفير بيانات الطلب.' }, { status: 400 });
    }

    const otoToken = process.env.OTO_API_TOKEN;
    if (!otoToken) {
      return NextResponse.json({
        success: false,
        error: 'لم يتم العثور على رمز اتصال OTO (OTO_API_TOKEN) في بيئة العمل. الرجاء إضافته في لوحة تحكم فايربيس.'
      }, { status: 500 });
    }

    // Format OTO order customer phone correctly
    let customerMobile = order.customer.phone || '0500000000';
    // Remove any leading plus signs or non-digits for OTO API
    customerMobile = customerMobile.replace(/\D/g, '');

    // Construct customer details according to OTO API V2 spec
    const customerData = {
      name: order.customer.name,
      email: order.customer.email || 'customer@lenscode.sa',
      mobile: customerMobile,
      address: order.customer.address || 'Saudi Arabia',
      city: order.customer.city || 'Riyadh',
      district: order.customer.district || 'Al Olaya',
      country: order.customer.country || 'SA',
      buildingNo: order.customer.buildingNo || '',
      shortAddressCode: order.customer.shortAddressCode || ''
    };

    // Format item objects for OTO items spec
    const otoItems = order.items.map((item: any) => ({
      productId: parseInt(item.product.id?.replace(/\D/g, '')) || 101,
      name: item.product.nameAr || item.product.nameEn || 'عدسات لنس كود',
      price: item.unitPriceSAR || 100,
      currency: 'SAR',
      quantity: item.quantity || 1,
      rowTotal: (item.unitPriceSAR || 100) * (item.quantity || 1)
    }));

    // Sender Info (LensCode Store headquarters in Riyadh)
    const senderInformation = {
      senderFullName: 'مستودع لِـنس كود الرئيسي',
      senderMobile: '966500000000',
      senderEmail: 'fulfillment@lenscode.sa',
      senderCountry: 'SA',
      senderCity: 'Riyadh',
      senderDistrict: 'Al-Deera',
      senderAddressLine: 'شارع الإمام فيصل بن تركي، حي الديرة، الرياض'
    };

    // Construct Payload for OTO createOrder REST API
    const otoPayload = {
      orderId: order.orderNumber || `LC-ORD-${order.id}`,
      createShipment: true,
      shippingMethod: 'express', // standard, express, etc.
      deliveryOptionId: carrier || 'Aramex', // user-selected carrier acts as deliveryOptionId or option
      payment_method: 'paid', // since paid via Tap Payments
      amount: order.totalSAR || 100,
      amount_due: 0,
      currency: 'SAR',
      customer: customerData,
      senderInformation: senderInformation,
      items: otoItems,
      metadata: {
        channel: 'LensCode E-Commerce Web'
      }
    };

    // Connect to OTO REST API Endpoint
    const response = await fetch('https://api.tryoto.com/rest/v2/createOrder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${otoToken}`
      },
      body: JSON.stringify(otoPayload)
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: data.message || `خطأ من OTO: ${response.statusText}`
      }, { status: response.status });
    }

    // Return the response data with shipment and tracking details
    return NextResponse.json({
      success: true,
      otoResponse: data,
      message: 'تم تسجيل الشحنة بنجاح في OTO وتم توليد بوليصة الشحن!',
      shipmentDetails: {
        otoId: data.otoId,
        trackingNumber: data.trackingNumber,
        trackingUrl: data.trackingUrl,
        waybillPdf: data.waybillPdf || data.waybillPdfUrl || data.waybillUrl || null,
        deliveryCompany: data.deliveryCompany || carrier
      }
    });

  } catch (err: any) {
    console.error('OTO Create Order Error:', err);
    return NextResponse.json({
      success: false,
      error: err.message || 'حدث خطأ غير متوقع أثناء الاتصال بسيرفر OTO.'
    }, { status: 500 });
  }
}
