"use client";

import { useState } from 'react';
import Script from 'next/script';

export default function RazorpayCheckout({ amount, label = "Support Now", onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    try {
      // 1. Create order on the server
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }), // amount in paise
      });

      const order = await res.json();

      if (order.error) {
        alert(order.error);
        setLoading(false);
        return;
      }

      // 2. Initialize Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "DSA Tracker",
        description: "Support our mission",
        order_id: order.id,
        handler: async function (response) {
          // 3. Verify payment on the server
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            alert("Payment Successful! Thank you for your support.");
            if (onSuccess) onSuccess();
          } else {
            alert("Payment Verification Failed: " + verifyData.message);
          }
        },
        prefill: {
          name: "", // Can be pre-filled if user is logged in
          email: "",
        },
        theme: {
          color: "#000000",
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response) {
        alert("Payment Failed: " + response.error.description);
        setLoading(false);
      });

      rzp.open();
    } catch (err) {
      console.error("Checkout Error:", err);
      alert("Something went wrong with the checkout.");
      setLoading(false);
    }
  };

  return (
    <>
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />
      <button 
        className="btn btn-primary" 
        onClick={handlePayment} 
        disabled={loading}
        style={{ padding: '1rem 2rem', fontSize: '1.1rem', borderRadius: '9999px', width: '100%' }}
      >
        {loading ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-coffee"></i> {label}</>}
      </button>
    </>
  );
}
