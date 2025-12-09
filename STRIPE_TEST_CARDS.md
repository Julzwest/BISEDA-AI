# 🧪 Stripe Test Card Details

Use these test cards to test payments **without charging real money**.

## ✅ Success Cards

### Standard Success Card (Most Common)
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

### Visa Success
```
Card Number: 4242 4242 4242 4242
Expiry: 12/25
CVC: 123
```

### Mastercard Success
```
Card Number: 5555 5555 5555 4444
Expiry: 12/25
CVC: 123
```

### American Express Success
```
Card Number: 3782 822463 10005
Expiry: 12/25
CVC: 1234 (4 digits for Amex)
```

## ❌ Decline Cards

### Card Declined
```
Card Number: 4000 0000 0000 0002
Expiry: 12/25
CVC: 123
```

### Insufficient Funds
```
Card Number: 4000 0000 0000 9995
Expiry: 12/25
CVC: 123
```

### Expired Card
```
Card Number: 4000 0000 0000 0069
Expiry: Any past date
CVC: 123
```

## 🔄 3D Secure Cards (Requires Authentication)

### 3D Secure Required
```
Card Number: 4000 0027 6000 3184
Expiry: 12/25
CVC: 123
```
*Note: Will prompt for authentication*

### 3D Secure Authentication Failed
```
Card Number: 4000 0000 0000 3055
Expiry: 12/25
CVC: 123
```

## 💳 Subscription Testing

### Recurring Payment Success
```
Card Number: 4242 4242 4242 4242
Expiry: 12/25
CVC: 123
```
*Works for subscriptions - will charge monthly*

### Subscription Requires Payment Method
```
Card Number: 4000 0025 0000 3155
Expiry: 12/25
CVC: 123
```

## 🌍 International Cards

### UK Card
```
Card Number: 4000 0082 6000 0000
Expiry: 12/25
CVC: 123
```

### EU Card
```
Card Number: 4000 0024 0000 0003
Expiry: 12/25
CVC: 123
```

## 📝 Quick Reference

**Most Common Test Card:**
- **Card:** `4242 4242 4242 4242`
- **Expiry:** Any future date
- **CVC:** Any 3 digits
- **ZIP:** Any 5 digits

**For Testing:**
1. Use `4242 4242 4242 4242` for successful payments
2. Use `4000 0000 0000 0002` to test declined cards
3. Use `4000 0027 6000 3184` to test 3D Secure

---

**Important:** These cards only work in **Test Mode**. Make sure your Stripe dashboard is set to "Test Mode" (toggle in top right).

**Switch to Live Mode:** When ready for real payments, toggle to "Live Mode" in Stripe dashboard.

