"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { formatNaira } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getUserProfileAction, updateUserProfileAction } from "@/app/auth-actions";

const WHATSAPP_NUMBER = "2347035689394";
const COD_FEE = 2500;
const COD_CITIES = ["Lagos", "Abuja", "Ibadan", "Akure", "Port Harcourt", "Benin City", "Enugu", "Kano"];
const COUNTRIES = ["Nigeria", "Ghana", "Kenya", "South Africa", "Tanzania", "Uganda", "Other"];
const BANK_DETAILS = {
  bank: "ZENITH BANK",
  accountName: "BRICK HEALTH ENERGY SOLUTIONS",
  accountNumber: "1226624481",
};

type Step = 1 | 2 | 3;
type PaymentMethod = "bank_deposit" | "whatsapp" | "cod" | null;

export default function CheckoutForm() {
  const { items, getTotal, clearCart } = useCartStore();
  const router = useRouter();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    country: "Nigeria",
    state: "",
    city: "",
    address: "",
    specialRequests: "",
  });

  useEffect(() => {
    setMounted(true);
    document.title = "Checkout | Brick Health Energy";
  }, []);

  useEffect(() => {
    if (mounted && user) {
      setForm((prev) => ({
        ...prev,
        email: prev.email || user.email || "",
      }));

      if (user.name) {
        const parts = user.name.trim().split(/\s+/);
        const first = parts[0] || "";
        const last = parts.slice(1).join(" ") || "";
        setForm((prev) => ({
          ...prev,
          firstName: prev.firstName || first,
          lastName: prev.lastName || last,
        }));
      }

      getUserProfileAction(user.id).then((res) => {
        if (res.profile) {
          const prof = res.profile;
          setForm((prev) => ({
            ...prev,
            phone: prev.phone || prof.phone || "",
            address: prev.address || prof.address || "",
            city: prev.city || prof.city || "",
            state: prev.state || prof.state || "",
          }));
        }
      });
    }
  }, [mounted, user]);

  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoStatus, setPromoStatus] = useState<"idle" | "validating" | "valid" | "invalid">("idle");
  const [promoError, setPromoError] = useState("");

  const subtotal = getTotal();
  const deliveryFee = subtotal >= 50000 ? 0 : 2000;
  const total = Math.max(0, subtotal + deliveryFee + (paymentMethod === "cod" ? COD_FEE : 0) - promoDiscount);

  async function handleApplyPromo() {
    const code = promoCode.trim();
    if (!code) return;
    setPromoStatus("validating");
    setPromoError("");
    setPromoDiscount(0);
    try {
      const res = await fetch("/api/discounts/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setPromoDiscount(data.discount_amount);
        setPromoStatus("valid");
      } else {
        setPromoError(data.error || "Invalid code");
        setPromoStatus("invalid");
        setTimeout(() => setPromoStatus("idle"), 3000);
      }
    } catch {
      setPromoError("Could not validate code");
      setPromoStatus("invalid");
      setTimeout(() => setPromoStatus("idle"), 3000);
    }
  }

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function isValidStep1(): boolean {
    return (
      form.firstName.trim() !== "" &&
      form.lastName.trim() !== "" &&
      form.phone.trim() !== "" &&
      form.email.trim() !== "" &&
      form.state.trim() !== "" &&
      form.city.trim() !== "" &&
      form.address.trim() !== ""
    );
  }

  async function createOrderInDb(orderId: string, reference?: string) {
    if (user) {
      await updateUserProfileAction(user.id, {
        name: `${form.firstName} ${form.lastName}`,
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
      });
    }

    const orderData = {
      id: orderId,
      user_id: user?.id || null,
      items: items.map(item => ({
        product_id: item.product_id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image
      })),
      subtotal,
      delivery_fee: deliveryFee,
      total,
      status: 'pending',
      payment_method: paymentMethod,
      payment_reference: reference || null,
      delivery_name: `${form.firstName} ${form.lastName}`,
      delivery_phone: form.phone,
      delivery_email: form.email,
      delivery_address: form.address,
      delivery_city: form.city,
      delivery_state: form.state
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Order save failed (${response.status})`);
      }

      const saved = await response.json().catch(() => null);
      // Persist the server-confirmed order id so the success page reflects
      // reality, never a locally fabricated one.
      localStorage.setItem(
        "last-order",
        JSON.stringify({ ...orderData, id: saved?.id ?? orderData.id })
      );
    } catch (err) {
      console.error("Error saving order:", err);
      throw err; // surface to caller so we don't claim success falsely
    }
  }


  async function handleOrderSuccess(orderId: string, reference?: string) {
    await createOrderInDb(orderId, reference);
    clearCart();
    setOrderError(null);
    router.push(`/checkout/success?order=${orderId}`);
  }

  function buildWhatsappLink(orderId: string): string {
    const lines = [
      `Hello Brick Health Energy, I'd like to place an order.`,
      `Order ID: ${orderId}`,
      `Name: ${form.firstName} ${form.lastName}`,
      `Phone: ${form.phone}`,
      `Delivery: ${form.address}, ${form.city}, ${form.state}`,
      `Items:`,
      ...items.map((i) => `- ${i.product.name} x${i.quantity} (${formatNaira(i.product.price * i.quantity)})`),
      `Total: ${formatNaira(total)}`,
    ];
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
  }

  async function handleConfirm() {
    setLoading(true);
    setOrderError(null);

    try {
      if (paymentMethod === "whatsapp") {
        const orderId = crypto.randomUUID();
        await createOrderInDb(orderId);
        clearCart();
        window.open(buildWhatsappLink(orderId), "_blank");
        router.push(`/checkout/success?order=${orderId}`);
        return;
      }

      if (paymentMethod === "cod") {
        await handleOrderSuccess(crypto.randomUUID());
        return;
      }

      if (paymentMethod === "bank_deposit") {
        const orderId = crypto.randomUUID();
        await createOrderInDb(orderId);
        setPlaced(true);
        clearCart();
      }
    } catch (err: any) {
      setOrderError(
        err?.message ||
          "We couldn't place your order. Please try again or contact us on WhatsApp."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) {
    return <div className="mx-auto max-w-7xl px-4 py-20 text-center animate-pulse"><h1 className="text-2xl font-bold font-serif text-secondary">Loading Checkout...</h1></div>;
  }

  if (items.length === 0 && !placed) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-32 text-center">
        <h1 className="text-4xl font-semibold font-serif text-secondary mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground font-light mb-8">Add some premium products before checking out.</p>
        <Link href="/products">
          <Button size="lg" className="rounded-none px-10 py-6 uppercase tracking-widest text-sm font-semibold">Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 font-sans">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-semibold font-serif text-secondary">Secure Checkout</h1>
      </div>

      <div className="mb-12">
        <div className="flex items-center justify-center gap-0">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    step === s
                      ? "bg-secondary text-white"
                      : step > s
                      ? "bg-secondary/10 text-secondary"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {s}
                </div>
                <span className={`hidden text-sm font-medium uppercase tracking-wider sm:inline ${step === s ? "text-secondary" : "text-slate-400"}`}>
                  {s === 1 ? "Details" : s === 2 ? "Payment" : "Confirm"}
                </span>
              </div>
              {s < 3 && <div className={`mx-4 h-px w-12 sm:w-20 ${step > s ? "bg-secondary/30" : "bg-slate-200"}`} />}
            </div>
          ))}
        </div>
      </div>

      {placed && paymentMethod === "bank_deposit" ? (
        <div className="mx-auto max-w-2xl text-center py-12">
          <div className="mb-6 text-6xl">🏦</div>
          <h2 className="text-3xl font-semibold font-serif text-secondary mb-4">Order Submitted!</h2>
          <p className="text-muted-foreground font-light mb-8">Transfer the total amount to the bank account below.</p>
          <div className="text-left border border-border p-8 bg-white mb-8 space-y-4">
             <div className="flex justify-between border-b pb-4"><span className="text-muted-foreground">Bank</span><span className="font-semibold text-secondary">{BANK_DETAILS.bank}</span></div>
             <div className="flex justify-between border-b pb-4"><span className="text-muted-foreground">Account Name</span><span className="font-semibold text-secondary">{BANK_DETAILS.accountName}</span></div>
             <div className="flex justify-between border-b pb-4"><span className="text-muted-foreground">Account Number</span><span className="font-semibold text-primary text-xl">{BANK_DETAILS.accountNumber}</span></div>
             <div className="flex justify-between pt-2"><span className="text-muted-foreground">Amount</span><span className="font-semibold text-xl text-secondary">{formatNaira(total)}</span></div>
          </div>
          <Button className="w-full rounded-none py-6 text-base" size="lg">Send Receipt via WhatsApp</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <Card className="rounded-sm shadow-sm border-border/50">
              <CardContent className="p-8">
                {step === 1 && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-2xl font-semibold font-serif text-secondary mb-6">Customer Details</h2>
                    <div className="space-y-5">
                      <div className="grid grid-cols-2 gap-5">
                        <Input placeholder="First Name" className="rounded-none h-12" value={form.firstName} onChange={(e) => updateField("firstName", e.target.value)} />
                        <Input placeholder="Last Name" className="rounded-none h-12" value={form.lastName} onChange={(e) => updateField("lastName", e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-5">
                        <Input placeholder="Phone Number" className="rounded-none h-12" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
                        <Input type="email" placeholder="Email Address" className="rounded-none h-12" value={form.email} onChange={(e) => updateField("email", e.target.value)} />
                      </div>
                      <Separator className="my-8" />
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-secondary mb-4">Shipping Address</h3>
                      <Input placeholder="Street Address" className="rounded-none h-12" value={form.address} onChange={(e) => updateField("address", e.target.value)} />
                      <div className="grid grid-cols-2 gap-5">
                        <Input placeholder="City" className="rounded-none h-12" value={form.city} onChange={(e) => updateField("city", e.target.value)} />
                        <Input placeholder="State" className="rounded-none h-12" value={form.state} onChange={(e) => updateField("state", e.target.value)} />
                      </div>
                    </div>
                    <div className="mt-10">
                      <Button className="w-full rounded-none h-14 text-base tracking-widest uppercase" disabled={!isValidStep1()} onClick={() => setStep(2)}>Continue to Payment</Button>
                    </div>
                  </div>
                )}
                {step === 2 && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-2xl font-semibold font-serif text-secondary mb-6">Payment Method</h2>
                    <div className="space-y-4">
                      
                      <div onClick={() => setPaymentMethod("bank_deposit")} className={`cursor-pointer border p-6 transition-all ${paymentMethod === "bank_deposit" ? "border-primary bg-primary/5" : "border-border hover:border-secondary"}`}>
                        <div className="flex items-center gap-4">
                          <div className="text-3xl">🏦</div>
                          <div>
                            <h3 className="font-semibold text-secondary">Bank Transfer</h3>
                            <p className="text-sm text-muted-foreground mt-1">Transfer directly to our corporate bank account.</p>
                          </div>
                        </div>
                      </div>

                      <div onClick={() => setPaymentMethod("whatsapp")} className={`cursor-pointer border p-6 transition-all ${paymentMethod === "whatsapp" ? "border-primary bg-primary/5" : "border-border hover:border-secondary"}`}>
                        <div className="flex items-center gap-4">
                          <div className="text-3xl">💬</div>
                          <div>
                            <h3 className="font-semibold text-secondary">Order via WhatsApp</h3>
                            <p className="text-sm text-muted-foreground mt-1">Speak with our team to customise your order.</p>
                          </div>
                        </div>
                      </div>

                      <div onClick={() => setPaymentMethod("cod")} className={`cursor-pointer border p-6 transition-all ${paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-border hover:border-secondary"}`}>
                        <div className="flex items-center gap-4">
                          <div className="text-3xl">🚚</div>
                          <div>
                            <h3 className="font-semibold text-secondary">Cash on Delivery</h3>
                            <p className="text-sm text-muted-foreground mt-1">Pay when your order arrives (₦{COD_FEE.toLocaleString()} fee, selected cities only).</p>
                          </div>
                        </div>
                      </div>

                    </div>
                    <div className="mt-10 flex gap-4">
                      <Button variant="outline" className="rounded-none h-14 px-8 border-secondary text-secondary hover:bg-secondary hover:text-white" onClick={() => setStep(1)}>Back</Button>
                      <Button className="flex-1 rounded-none h-14 text-base tracking-widest uppercase" disabled={!paymentMethod} onClick={() => setStep(3)}>Review Order</Button>
                    </div>
                  </div>
                )}
                {step === 3 && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <h2 className="text-2xl font-semibold font-serif text-secondary mb-6">Review & Confirm</h2>
                     <div className="space-y-6">
                        <div className="bg-slate-50 p-6 border border-border">
                           <h3 className="text-sm font-semibold uppercase tracking-wider text-secondary mb-4">Contact Info</h3>
                           <p className="text-muted-foreground">{form.firstName} {form.lastName} • {form.email} • {form.phone}</p>
                        </div>
                        <div className="bg-slate-50 p-6 border border-border">
                           <h3 className="text-sm font-semibold uppercase tracking-wider text-secondary mb-4">Shipping</h3>
                           <p className="text-muted-foreground">{form.address}, {form.city}, {form.state}</p>
                        </div>
                        <div className="bg-slate-50 p-6 border border-border">
                           <h3 className="text-sm font-semibold uppercase tracking-wider text-secondary mb-4">Payment</h3>
                           <p className="text-muted-foreground capitalize">{paymentMethod?.replace('_', ' ')}</p>
                        </div>
                     </div>
                     {orderError && (
                       <div className="mb-4 bg-red-50 border border-red-200 text-red-800 p-4 text-sm font-light">
                         {orderError}
                       </div>
                     )}
                     <div className="mt-10 flex gap-4">
                      <Button variant="outline" className="rounded-none h-14 px-8 border-secondary text-secondary hover:bg-secondary hover:text-white" onClick={() => setStep(2)} disabled={loading}>Back</Button>
                      <Button className="flex-1 rounded-none h-14 text-base tracking-widest uppercase" disabled={loading} onClick={handleConfirm}>{loading ? "Processing..." : "Place Order"}</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
             <Card className="rounded-sm shadow-sm border-border/50 bg-slate-50">
                <CardContent className="p-8">
                   <h3 className="text-lg font-semibold font-serif text-secondary mb-6 border-b border-border pb-4">Order Summary</h3>
                   <div className="space-y-4 mb-6">
                      {items.map(item => (
                         <div key={item.id} className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">{item.product.name} x{item.quantity}</span>
                            <span className="font-semibold text-secondary">{formatNaira(item.product.price * item.quantity)}</span>
                         </div>
                      ))}
                   </div>
                    <Separator className="my-4" />
                    <div className="mb-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Promo code"
                          className="flex-1 h-10 rounded-none border border-border px-3 text-sm"
                          value={promoCode}
                          onChange={(e) => { setPromoCode(e.target.value); setPromoStatus("idle"); setPromoError(""); }}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApplyPromo())}
                          disabled={promoStatus === "valid"}
                        />
                        <button
                          onClick={handleApplyPromo}
                          disabled={promoStatus === "validating" || promoStatus === "valid" || !promoCode.trim()}
                          className="h-10 px-4 text-sm font-medium bg-secondary text-white hover:bg-secondary/90 disabled:opacity-50 uppercase tracking-wider"
                        >
                          {promoStatus === "validating" ? "..." : promoStatus === "valid" ? "Applied" : "Apply"}
                        </button>
                      </div>
                      {promoError && <p className="text-xs text-red-600 mt-1">{promoError}</p>}
                      {promoDiscount > 0 && <p className="text-xs text-green-600 mt-1">-{formatNaira(promoDiscount)} discount applied</p>}
                    </div>
                    <Separator className="my-4" />
                     <div className="space-y-3 text-sm">
                        <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatNaira(subtotal)}</span></div>
                        <div className="flex justify-between text-muted-foreground"><span>Delivery</span><span>{deliveryFee === 0 ? "FREE" : formatNaira(deliveryFee)}</span></div>
                        {paymentMethod === "cod" && (
                          <div className="flex justify-between text-muted-foreground"><span>COD Surcharge</span><span>{formatNaira(COD_FEE)}</span></div>
                        )}
                        {promoDiscount > 0 && (
                          <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatNaira(promoDiscount)}</span></div>
                        )}
                     </div>
                    <Separator className="my-4" />
                    <div className="flex justify-between text-lg font-semibold text-secondary">
                       <span>Total</span>
                       <span>{formatNaira(total)}</span>
                    </div>
                </CardContent>
             </Card>
          </div>
        </div>
      )}
    </div>
  );
}
