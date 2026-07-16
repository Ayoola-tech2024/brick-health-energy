"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ContactFormSkeleton } from "@/components/ui/skeleton";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from "lucide-react";


export default function ContactPage() {
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.title = "Contact Us | Brick Health Energy";
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to send message");
      } else {
        setSuccess(true);
        setForm({ name: "", email: "", subject: "", message: "" });
      }
    } catch {
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <ContactFormSkeleton />
      </div>
    );
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <section className="relative min-h-[40vh] flex items-center justify-center bg-white overflow-hidden border-b">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-white/30 to-background" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center space-y-6 py-20">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-xs font-semibold tracking-widest text-primary uppercase"
          >
            Get In Touch
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-5xl font-semibold tracking-tight text-secondary leading-tight"
          >
            We&apos;d Love to <span className="text-primary italic">Hear From You</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed"
          >
            Have a question about our products, need help with an order, or interested in bulk pricing? Reach out — our team is ready to assist.
          </motion.p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="lg:col-span-2"
            >
              <Card className="rounded-sm border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-2xl font-serif text-secondary">Send a Message</CardTitle>
                  <CardDescription className="font-light">
                    Fill out the form and we&apos;ll get back to you within 24 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {success ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12 space-y-4"
                    >
                      <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                      <h3 className="text-xl font-semibold text-secondary">Message Sent!</h3>
                      <p className="text-muted-foreground font-light">
                        Thank you for reaching out. We&apos;ll respond to your inquiry shortly.
                      </p>
                      <Button variant="outline" onClick={() => setSuccess(false)} className="mt-4">
                        Send Another Message
                      </Button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      {error && (
                        <div className="bg-red-50 border border-red-200 text-red-800 p-4 text-sm font-light">
                          {error}
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <Input
                          placeholder="Your Name"
                          className="rounded-none h-12"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          disabled={loading}
                          required
                        />
                        <Input
                          type="email"
                          placeholder="Email Address"
                          className="rounded-none h-12"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          disabled={loading}
                          required
                        />
                      </div>
                      <Input
                        placeholder="Subject"
                        className="rounded-none h-12"
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        disabled={loading}
                        required
                      />
                      <textarea
                        placeholder="Your Message"
                        rows={6}
                        className="flex w-full rounded-none border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary transition-all"
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        disabled={loading}
                        required
                      />
                      <Button type="submit" disabled={loading} className="w-full rounded-none h-14 text-base tracking-widest uppercase">
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Sending...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Send className="h-5 w-5" />
                            Send Message
                          </span>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              <Card className="rounded-sm border-border/50 shadow-sm bg-slate-50">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-secondary">Email</h4>
                      <a href="mailto:info@brickhealthenergy.org" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        info@brickhealthenergy.org
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-secondary">Phone</h4>
                      <a href="tel:+2347035689394" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        +234 703 568 9394
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-secondary">Location</h4>
                      <p className="text-sm text-muted-foreground">Lagos, Nigeria</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-secondary">Business Hours</h4>
                      <p className="text-sm text-muted-foreground">Mon – Fri: 8:00 AM – 6:00 PM</p>
                      <p className="text-sm text-muted-foreground">Sat: 9:00 AM – 3:00 PM</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-sm border-border/50 shadow-sm bg-white">
                <CardContent className="p-8 space-y-4">
                  <h4 className="font-semibold text-secondary">WhatsApp</h4>
                  <p className="text-sm text-muted-foreground font-light">
                    Prefer instant messaging? Reach us on WhatsApp for quick inquiries and order assistance.
                  </p>
                  <a
                    href="https://wa.me/2347035689394"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="w-full rounded-none border-green-600 text-green-700 hover:bg-green-50">
                      Chat on WhatsApp
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
