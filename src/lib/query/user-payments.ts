import {
  type UserPaymentParams,
  type UserPaymentResponse,
  type UserPaymentTableData,
} from "@/types/user-payments";
import api from "@/lib/axios";

// Fetch user's payment history
export const fetchUserPayments = async (
  params: UserPaymentParams = {}
): Promise<UserPaymentResponse> => {
  try {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.set("page", params.page.toString());
    if (params.limit) searchParams.set("limit", params.limit.toString());
    if (params.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);
    if (params.method) searchParams.set("method", params.method);
    if (params.status) searchParams.set("status", params.status);
    if (params.dateFrom)
      searchParams.set("dateFrom", params.dateFrom.toISOString());
    if (params.dateTo) searchParams.set("dateTo", params.dateTo.toISOString());

    console.log("🔍 [fetchUserPayments] Calling API with params:", {
      url: `/user/payments?${searchParams.toString()}`,
      params,
    });

    const res = await api.get(`/user/payments?${searchParams.toString()}`);

    console.log("📦 [fetchUserPayments] Raw API response:", {
      hasData: !!res,
      dataKeys: res ? Object.keys(res) : [],
      data: res,
    });

    // The API returns NextResponse.json({ data: result })
    // But our axios wrapper (src/lib/axios.ts) already unwraps res.data
    // So api.get() returns the response body directly: { data: { payments, pagination } }
    // We need to access res.data to get { payments, pagination }
    const apiResponse = res?.data;
    
    console.log("🔍 [fetchUserPayments] Checking response:", {
      hasRes: !!res,
      hasApiResponse: !!apiResponse,
      apiResponseKeys: apiResponse ? Object.keys(apiResponse) : [],
      paymentsCount: apiResponse?.payments?.length,
    });

    if (!apiResponse || !apiResponse.payments) {
      console.log("⚠️ [fetchUserPayments] No data in response, returning empty");
      return {
        payments: [],
        pagination: {
          page: params.page || 1,
          limit: params.limit || 10,
          totalCount: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }

    

    return apiResponse;
  } catch (err: any) {
    console.error("❌ [fetchUserPayments] Error:", {
      message: err?.message,
      response: err?.response?.data,
      status: err?.response?.status,
    });
    // Return empty result instead of throwing to prevent undefined query data
    return {
      payments: [],
      pagination: {
        page: params.page || 1,
        limit: params.limit || 10,
        totalCount: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    };
  }
};

// Fetch individual payment details
export const fetchUserPaymentById = async (
  id: string
): Promise<UserPaymentTableData> => {
  try {
    const res = await api.get(`/user/payments/${id}`);
    return res.data.data;
  } catch (err: any) {
    throw err?.response?.data || { error: "Failed to fetch payment details" };
  }
};

// Update payment details (for cash payments)
export const updateUserPayment = async (
  id: string,
  data: { deliveryAddress?: string; deliveryNotes?: string }
): Promise<UserPaymentTableData> => {
  try {
    const res = await api.put(`/user/payments/${id}`, data);
    return res.data.data;
  } catch (err: any) {
    throw err?.response?.data || { error: "Failed to update payment" };
  }
};

// Download receipt
export const downloadReceipt = async (id: string): Promise<any> => {
  try {
    const res = await api.get(`/user/payments/${id}/receipt`);
    return res.data.data;
  } catch (err: any) {
    throw err?.response?.data || { error: "Failed to download receipt" };
  }
};

// Request refund
export const requestRefund = async (
  id: string,
  reason: string
): Promise<void> => {
  try {
    await api.post(`/user/payments/${id}/refund`, { reason });
  } catch (err: unknown) {
    throw err?.response?.data || { error: "Failed to request refund" };
  }
};
