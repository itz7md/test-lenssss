/**
 * Tap Payments Integration Service for LensCode
 * Supports Mada, Visa, Mastercard, Apple Pay, KNET, Benefit, and GCC local debit cards.
 * Documentation: https://developers.tap.company
 */

export interface TapCustomerPayload {
  first_name: string;
  middle_name?: string;
  last_name?: string;
  email: string;
  phone: {
    country_code: string;
    number: string;
  };
}

export interface CreateTapChargeParams {
  amount: number;
  currency: string;
  customer: TapCustomerPayload;
  orderId: string;
  orderNumber: string;
  description?: string;
  sourceId?: string; // 'src_all' | 'src_cards' | 'src_sa.mada' | 'src_kw.knet' | 'src_bh.benefit' | token
  redirectUrl?: string;
  postUrl?: string;
  metadata?: Record<string, string>;
}

export interface TapChargeResponse {
  id: string;
  status: 'INITIATED' | 'IN_PROGRESS' | 'CAPTURED' | 'AUTHORIZED' | 'FAILED' | 'DECLINED' | 'CANCELLED' | 'TIMEDOUT' | 'ABANDONED';
  amount: number;
  currency: string;
  transaction?: {
    authorization_id?: string;
    created?: string;
    url?: string;
    expiry?: {
      period?: number;
      type?: string;
    };
  };
  reference?: {
    transaction?: string;
    order?: string;
    payment?: string;
    gateway?: string;
    acquirer?: string;
    track?: string;
  };
  response?: {
    code?: string;
    message?: string;
  };
  receipt?: {
    id?: string;
    email?: boolean;
    sms?: boolean;
    url?: string;
  };
  card?: {
    id?: string;
    first_six?: string;
    brand?: string;
    last_four?: string;
  };
  customer?: {
    id?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: {
      country_code?: string;
      number?: string;
    };
  };
  metadata?: Record<string, string>;
  errors?: Array<{
    code: string;
    description: string;
  }>;
}

const TAP_API_BASE = 'https://api.tap.company/v2';

/**
 * Server-side helper to create a Charge with Tap Payments
 */
export async function createTapCharge(
  params: CreateTapChargeParams,
  secretKey?: string
): Promise<{ success: boolean; data?: TapChargeResponse; error?: string; redirectUrl?: string }> {
  const apiKey = secretKey || process.env.TAP_SECRET_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: 'مفتاح الربط الخاص بـ Tap Payments (TAP_SECRET_KEY) غير معين في متغيرات البيئة.',
    };
  }

  try {
    const payload = {
      amount: Number(params.amount.toFixed(2)),
      currency: params.currency.toUpperCase(),
      threeDSecure: true,
      save_card: false,
      description: params.description || `LensCode Order ${params.orderNumber}`,
      statement_descriptor: 'LENSCODE',
      metadata: {
        orderId: params.orderId,
        orderNumber: params.orderNumber,
        customerName: `${params.customer.first_name} ${params.customer.last_name || ''}`.trim(),
        customerEmail: params.customer.email,
        ...params.metadata,
      },
      reference: {
        transaction: `txn_${params.orderNumber}_${Date.now()}`,
        order: params.orderNumber,
      },
      receipt: {
        email: true,
        sms: false,
      },
      customer: {
        first_name: params.customer.first_name || 'Customer',
        last_name: params.customer.last_name || 'LensCode',
        email: params.customer.email,
        phone: {
          country_code: params.customer.phone.country_code.replace('+', ''),
          number: params.customer.phone.number.replace(/^0+/, ''),
        },
      },
      merchant: process.env.NEXT_PUBLIC_TAP_MERCHANT_ID || process.env.TAP_MERCHANT_ID
        ? { id: process.env.NEXT_PUBLIC_TAP_MERCHANT_ID || process.env.TAP_MERCHANT_ID }
        : undefined,
      source: {
        id: params.sourceId || 'src_all', // 'src_all' automatically accepts Mada, Visa, Mastercard, Apple Pay, KNET, etc.
      },
      post: params.postUrl ? { url: params.postUrl } : undefined,
      redirect: params.redirectUrl ? { url: params.redirectUrl } : undefined,
    };

    const response = await fetch(`${TAP_API_BASE}/charges`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = (await response.json()) as TapChargeResponse;

    if (!response.ok || (result.errors && result.errors.length > 0)) {
      const errorMsg =
        result.errors?.map((e) => `${e.code}: ${e.description}`).join(' | ') ||
        result.response?.message ||
        `Tap API Error (${response.status})`;
      return {
        success: false,
        error: errorMsg,
        data: result,
      };
    }

    const redirectUrl = result.transaction?.url;

    return {
      success: true,
      data: result,
      redirectUrl,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'فشل الاتصال بخوادم بوابة الدفع Tap Payments',
    };
  }
}

/**
 * Server-side helper to retrieve charge status by Tap ID (chg_xxx)
 */
export async function retrieveTapCharge(
  tapId: string,
  secretKey?: string
): Promise<{ success: boolean; data?: TapChargeResponse; error?: string }> {
  const apiKey = secretKey || process.env.TAP_SECRET_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: 'مفتاح الربط الخاص بـ Tap Payments (TAP_SECRET_KEY) غير معين في متغيرات البيئة.',
    };
  }

  try {
    const response = await fetch(`${TAP_API_BASE}/charges/${tapId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    const result = (await response.json()) as TapChargeResponse;

    if (!response.ok || (result.errors && result.errors.length > 0)) {
      const errorMsg =
        result.errors?.map((e) => `${e.code}: ${e.description}`).join(' | ') ||
        result.response?.message ||
        `Tap API Error (${response.status})`;
      return {
        success: false,
        error: errorMsg,
        data: result,
      };
    }

    return {
      success: true,
      data: result,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'فشل استرجاع بيانات المعاملة من Tap Payments',
    };
  }
}
