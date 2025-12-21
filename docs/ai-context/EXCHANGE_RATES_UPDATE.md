# Exchange Rates Update - December 20, 2025

## 📊 **Current Exchange Rates**

As of December 20, 2025, the following exchange rates are in effect:

### **Macedonian Denar (MKD)**

- 1 MKD = 0.0190 USD
- 1 MKD = 0.0162 EUR

### **US Dollar (USD)**

- 1 USD = 52.54 MKD
- 1 USD = 0.85 EUR

### **Euro (EUR)**

- 1 EUR = 61.53 MKD
- 1 EUR = 1.16 USD

---

## 🔄 **What Changed**

### **Previous Rates (December 2024)**

```typescript
MKD: { MKD: 1, USD: 0.0163, EUR: 0.0149 }
USD: { MKD: 61.5, USD: 1, EUR: 0.91 }
EUR: { MKD: 67.0, USD: 1.1, EUR: 1 }
```

### **Updated Rates (December 20, 2025)**

```typescript
MKD: { MKD: 1, USD: 0.0190, EUR: 0.0162 }
USD: { MKD: 52.54, USD: 1, EUR: 0.85 }
EUR: { MKD: 61.53, USD: 1.16, EUR: 1 }
```

### **Key Changes**

- **MKD strengthened** against USD: 61.5 → 52.54 MKD per USD (14.6% stronger)
- **MKD strengthened** against EUR: 67.0 → 61.53 MKD per EUR (8.2% stronger)
- **EUR strengthened** against USD: 1.1 → 1.16 USD per EUR (5.5% stronger)

---

## 💰 **Impact on Pricing**

### **Example: 70,000 MKD Product**

**Old Rates:**

- USD: 70,000 ÷ 61.5 = $1,138.21
- EUR: 70,000 ÷ 67.0 = €1,044.78

**New Rates:**

- USD: 70,000 × 0.0190 = $1,330.00 (+16.8%)
- EUR: 70,000 × 0.0162 = €1,134.00 (+8.5%)

**Result:** Products appear more expensive in USD/EUR due to MKD strengthening.

---

## 📝 **Files Updated**

1. **docs/ai-context/plans/007c-plan-dynamic-currency-handling.md**
   - Updated `HARDCODED_FALLBACK_RATES` constant
   - Updated currency conversion examples
   - Updated last updated date to December 20, 2025

---

## ✅ **Next Steps**

### **Immediate Actions**

1. ✅ Plan updated with current rates
2. ⏳ Implement enhanced `currency.ts` with new rates
3. ⏳ Test currency conversions with new rates
4. ⏳ Deploy to production

### **Monthly Maintenance**

Set a calendar reminder for **January 20, 2026** to:

1. Check current rates at https://www.xe.com/currencyconverter/
2. Update `HARDCODED_FALLBACK_RATES` in `src/lib/query/currency.ts`
3. Update this documentation file
4. Test conversions
5. Deploy updates

---

## 🔍 **Rate Sources**

**Primary Sources (Free APIs):**

- https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/
- https://latest.currency-api.pages.dev/v1/currencies/

**Verification Sources:**

- https://www.xe.com/currencyconverter/
- https://www.google.com/finance/quote/MKD-USD
- https://www.google.com/finance/quote/MKD-EUR
- https://www.google.com/finance/quote/EUR-USD

---

## 📈 **Historical Trend**

| Date         | MKD/USD    | MKD/EUR   | EUR/USD   |
| ------------ | ---------- | --------- | --------- |
| Dec 2024     | 61.50      | 67.00     | 1.10      |
| Dec 20, 2025 | 52.54      | 61.53     | 1.16      |
| **Change**   | **-14.6%** | **-8.2%** | **+5.5%** |

**Trend:** MKD has strengthened significantly against both USD and EUR over the past year.

---

**Last Updated:** December 20, 2025
**Next Review:** January 20, 2026
