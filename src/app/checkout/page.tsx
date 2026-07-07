"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCartStore } from "@/lib/cart-store";
import { formatNaira } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

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

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCartStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [placed, setPlaced] = useState(false);
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
  }, []);

  const subtotal = getTotal();
  const deliveryFee = subtotal >= 50000 ? 0 : 2000;
  const total = subtotal + deliveryFee + (paymentMethod === "cod" ? COD_FEE : 0);

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

  function buildWhatsAppMessage(): string {
    const methodLabels: Record<string, string> = {
      bank_deposit: "Bank Deposit",
      whatsapp: "WhatsApp Payment",
      cod: "Cash on Delivery",
    };

    let msg = "New Order — Brick Health Energy Solutions\n\n";
    msg += "Customer Information\n";
    msg += `Name: ${form.firstName} ${form.lastName}\n`;
    msg += `Phone: ${form.phone}\n`;
    msg += `Email: ${form.email}\n\n`;
    msg += "Shipping Address\n";
    msg += `${form.address}, ${form.city}, ${form.state}, ${form.country}\n\n`;
    msg += "Items Ordered\n";
    items.forEach((item) => {
      msg += `${item.product.name} x${item.quantity} = ₦${(item.product.price * item.quantity).toLocaleString()}\n`;
    });
    msg += `\nSubtotal: ₦${subtotal.toLocaleString()}`;
    msg += `\nDelivery: ${deliveryFee === 0 ? "FREE" : `₦${deliveryFee.toLocaleString()}`}`;
    if (paymentMethod === "cod") {
      msg += `\nCOD Fee: ₦${COD_FEE.toLocaleString()}`;
    }
    msg += `\nTotal: ₦${total.toLocaleString()}\n\n`;
    msg += `Payment Method: ${methodLabels[paymentMethod || ""]}\n\n`;
    if (form.specialRequests.trim()) {
      msg += `Special Requests: ${form.specialRequests.trim()}\n\n`;
    }
    msg += "Please confirm availability and delivery timeline.";

    return msg;
  }

  function handleConfirm() {
    setLoading(true);

    if (paymentMethod === "whatsapp") {
      const order = {
        id: crypto.randomUUID(),
        items: items.map((item) => ({
          product_id: item.product_id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          variant_sku: item.variant_sku,
          image: item.product.image,
        })),
        subtotal,
        delivery_fee: deliveryFee,
        total,
        cod_fee: COD_FEE,
        status: "pending",
        payment_method: "whatsapp",
        delivery_name: `${form.firstName} ${form.lastName}`,
        delivery_phone: form.phone,
        delivery_email: form.email,
        delivery_address: form.address,
        delivery_city: form.city,
        delivery_state: form.state,
        country: form.country,
        special_requests: form.specialRequests,
        created_at: new Date().toISOString(),
      };
      localStorage.setItem("last-order", JSON.stringify(order));
      clearCart();
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMessage())}`;
      window.open(url, "_blank");
      setLoading(false);
      router.push(`/checkout/success?order=${order.id}`);
      return;
    }

    if (paymentMethod === "cod") {
      const order = {
        id: crypto.randomUUID(),
        items: items.map((item) => ({
          product_id: item.product_id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          variant_sku: item.variant_sku,
          image: item.product.image,
        })),
        subtotal,
        delivery_fee: deliveryFee,
        cod_fee: COD_FEE,
        total,
        status: "pending",
        payment_method: "cod",
        delivery_name: `${form.firstName} ${form.lastName}`,
        delivery_phone: form.phone,
        delivery_email: form.email,
        delivery_address: form.address,
        delivery_city: form.city,
        delivery_state: form.state,
        country: form.country,
        special_requests: form.specialRequests,
        created_at: new Date().toISOString(),
      };
      localStorage.setItem("last-order", JSON.stringify(order));
      clearCart();
      setLoading(false);
      router.push(`/checkout/success?order=${order.id}`);
      return;
    }

    if (paymentMethod === "bank_deposit") {
      setPlaced(true);
      setLoading(false);
    }
  }

  if (!mounted) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center animate-pulse">
        <h1 className="text-2xl font-bold text-slate-800">Loading Checkout...</h1>
      </div>
    );
  }

  if (items.length === 0 && !placed) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="text-3xl font-bold">Your Cart is Empty</h1>
        <p className="mt-4 text-muted-foreground">Add some products before checking out.</p>
        <Link href="/products">
          <Button className="mt-8">Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-0">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    step === s
                      ? "bg-primary text-white"
                      : step > s
                      ? "bg-primary/20 text-primary"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {s}
                </div>
                <span
                  className={`hidden text-sm font-medium sm:inline ${
                    step === s ? "text-primary" : "text-slate-400"
                  }`}
                >
                  {s === 1 ? "Details" : s === 2 ? "Payment" : "Confirm"}
                </span>
              </div>
              {s < 3 && <div className={`mx-3 h-px w-12 sm:w-20 ${step > s ? "bg-primary/30" : "bg-slate-200"}`} />}
            </div>
          ))}
        </div>
      </div>

      {placed && paymentMethod === "bank_deposit" ? (
        /* Bank Deposit — Post-Confirm View */
        <div className="mx-auto max-w-2xl">
          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="p-8 text-center">
              <div className="mb-4 text-5xl">🏦</div>
              <h2 className="text-2xl font-bold text-slate-900">Order Submitted!</h2>
              <p className="mt-2 text-muted-foreground">
                Transfer the total amount to the bank account below and send your payment receipt to our WhatsApp for confirmation.
              </p>
              <div className="mt-8 rounded-lg border bg-white p-6 text-left shadow-sm">
                <h3 className="mb-4 text-lg font-semibold">Bank Transfer Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Bank</span>
                    <span className="font-semibold">{BANK_DETAILS.bank}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Account Name</span>
                    <span className="font-semibold">{BANK_DETAILS.accountName}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Account Number</span>
                    <span className="font-semibold text-primary text-lg">{BANK_DETAILS.accountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-semibold text-lg">{formatNaira(total)}</span>
                  </div>
                </div>
              </div>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                  `Hello, I have made a transfer of ${formatNaira(total)} for my order. Please find the receipt attached.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="mt-6 w-full" size="lg">
                  Send Receipt via WhatsApp
                </Button>
              </a>
              <Link href="/products">
                <Button variant="outline" className="mt-3 w-full">
                  Continue Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Form Area */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6 sm:p-8">
                {step === 1 && (
                  <div>
                    <h2 className="text-xl font-bold">Customer Details</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Provide your contact and shipping information.</p>
                    <div className="mt-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="mb-1 block text-sm font-medium">First Name *</label>
                          <Input
                            placeholder="First Name"
                            required
                            value={form.firstName}
                            onChange={(e) => updateField("firstName", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium">Last Name *</label>
                          <Input
                            placeholder="Last Name"
                            required
                            value={form.lastName}
                            onChange={(e) => updateField("lastName", e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="mb-1 block text-sm font-medium">Phone Number *</label>
                          <Input
                            placeholder="080 1234 5678"
                            required
                            value={form.phone}
                            onChange={(e) => updateField("phone", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium">Email Address *</label>
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            required
                            value={form.email}
                            onChange={(e) => updateField("email", e.target.value)}
                          />
                        </div>
                      </div>
                      <Separator />
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Shipping Address
                      </h3>
                      <div>
                        <label className="mb-1 block text-sm font-medium">Country *</label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={form.country}
                          onChange={(e) => updateField("country", e.target.value)}
                        >
                          {COUNTRIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="mb-1 block text-sm font-medium">State/Province *</label>
                          <Input
                            placeholder="State"
                            required
                            value={form.state}
                            onChange={(e) => updateField("state", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium">City *</label>
                          <Input
                            placeholder="City"
                            required
                            value={form.city}
                            onChange={(e) => updateField("city", e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium">Street Address *</label>
                        <Input
                          placeholder="Street address"
                          required
                          value={form.address}
                          onChange={(e) => updateField("address", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium">Special Requests (Optional)</label>
                        <textarea
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Any special requests or delivery instructions..."
                          value={form.specialRequests}
                          onChange={(e) => updateField("specialRequests", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="mt-8 flex justify-end">
                      <Button
                        type="button"
                        size="lg"
                        disabled={!isValidStep1()}
                        onClick={() => setStep(2)}
                      >
                        Next — Payment Method
                      </Button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <h2 className="text-xl font-bold">Payment Method</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Choose how you want to complete your order.
                    </p>
                    <div className="mt-6 space-y-4">
                      {/* Bank Deposit */}
                      <div
                        onClick={() => setPaymentMethod("bank_deposit")}
                        className={`cursor-pointer rounded-lg border p-5 transition-all ${
                          paymentMethod === "bank_deposit"
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-2xl">
                            🏦
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">Bank Deposit</h3>
                              {paymentMethod === "bank_deposit" && <Badge>Selected</Badge>}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Transfer directly to our business bank account. Send payment receipt via WhatsApp for confirmation.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* WhatsApp Payment */}
                      <div
                        onClick={() => setPaymentMethod("whatsapp")}
                        className={`cursor-pointer rounded-lg border p-5 transition-all ${
                          paymentMethod === "whatsapp"
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-2xl">
                            💬
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">WhatsApp Payment</h3>
                              {paymentMethod === "whatsapp" && <Badge>Selected</Badge>}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Order via WhatsApp. Our team will provide secure payment options including mobile money or bank transfers.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Cash on Delivery */}
                      <div
                        onClick={() => setPaymentMethod("cod")}
                        className={`cursor-pointer rounded-lg border p-5 transition-all ${
                          paymentMethod === "cod"
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-2xl">
                            🚚
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">Cash on Delivery</h3>
                              {paymentMethod === "cod" && <Badge>Selected</Badge>}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Pay when your order arrives. Available in {COD_CITIES.length} cities including Lagos, Abuja, Ibadan, Akure.
            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              A COD fee of {formatNaira(COD_FEE)} will be added. Delivery: 3–5 business days.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-8 flex justify-between">
                      <Button type="button" variant="outline" size="lg" onClick={() => setStep(1)}>
                        Back
                      </Button>
                      <Button
                        type="button"
                        size="lg"
                        disabled={!paymentMethod}
                        onClick={() => setStep(3)}
                      >
                        Next — Review Order
                      </Button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div>
                    <h2 className="text-xl font-bold">Review Your Order</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Please review your order details before confirming.
                    </p>
                    <div className="mt-6 space-y-6">
                      <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                          Customer Information
                        </h3>
                        <div className="mt-2 space-y-1 text-sm">
                          <p>
                            <span className="text-muted-foreground">Name:</span> {form.firstName} {form.lastName}
                          </p>
                          <p>
                            <span className="text-muted-foreground">Email:</span> {form.email}
                          </p>
                          <p>
                            <span className="text-muted-foreground">Phone:</span> {form.phone}
                          </p>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                          Shipping Address
                        </h3>
                        <div className="mt-2 space-y-1 text-sm">
                          <p>{form.address}</p>
                          <p>
                            {form.city}, {form.state}, {form.country}
                          </p>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                          Payment Method
                        </h3>
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          <span>
                            {paymentMethod === "bank_deposit"
                              ? "🏦 Bank Deposit"
                              : paymentMethod === "whatsapp"
                              ? "💬 WhatsApp Payment"
                              : "🚚 Cash on Delivery"}
                          </span>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                          Items ({items.length})
                        </h3>
                        <div className="mt-2 space-y-3">
                          {items.map((item) => (
                            <div key={item.id} className="flex items-center gap-3">
                              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-gray-100">
                                {item.product.image ? (
                                  <Image
                                    src={item.product.image}
                                    alt={item.product.name}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center text-xl text-emerald-200">
                                    ⚡
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 text-sm">
                                <p className="font-medium">{item.product.name}</p>
                                <p className="text-muted-foreground">Qty: {item.quantity}</p>
                              </div>
                              <span className="text-sm font-semibold">
                                {formatNaira(item.product.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {form.specialRequests.trim() && (
                        <>
                          <Separator />
                          <div>
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                              Special Requests
                            </h3>
                            <p className="mt-1 text-sm">{form.specialRequests.trim()}</p>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="mt-8 flex justify-between">
                      <Button type="button" variant="outline" size="lg" onClick={() => setStep(2)}>
                        Back
                      </Button>
                      <Button type="button" size="lg" disabled={loading} onClick={handleConfirm}>
                        {loading ? "Processing..." : "Confirm Order"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 text-lg font-semibold">Order Summary</h3>
                <div className="max-h-80 space-y-3 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-gray-100">
                        {item.product.image ? (
                          <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-emerald-200">⚡</div>
                        )}
                      </div>
                      <div className="flex-1 text-sm">
                        <p className="font-medium leading-tight">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold">{formatNaira(item.product.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatNaira(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>{deliveryFee === 0 ? "FREE" : formatNaira(deliveryFee)}</span>
                  </div>
                  {paymentMethod === "cod" && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">COD Fee</span>
                      <span>{formatNaira(COD_FEE)}</span>
                    </div>
                  )}
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span className="text-primary">{formatNaira(total)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
