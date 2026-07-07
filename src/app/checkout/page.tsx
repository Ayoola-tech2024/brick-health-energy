"use client";

import dynamic from "next/dynamic";

const CheckoutForm = dynamic(() => import("./checkout-form"), { ssr: false });

export default function CheckoutPage() {
  return <CheckoutForm />;
}
