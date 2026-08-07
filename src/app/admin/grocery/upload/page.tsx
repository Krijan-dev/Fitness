"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Upload } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";

export default function AdminGroceryUploadPage() {
  const [csv, setCsv] = useState(
    "store,name,currentPrice,regularPrice,size,barcode,isOnSpecial,catalogueExpiresAt\ncoles,Demo Milk 2L,3.50,4.20,2L,,true,\n"
  );
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const uploadText = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/grocery/upload", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Upload failed");
      setMessage(`Uploaded ${body.data.upserted} products.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/grocery/upload", {
        method: "POST",
        credentials: "include",
        body: form,
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Upload failed");
      setMessage(`Uploaded ${body.data.upserted} products from file.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Upload grocery CSV"
        description="Manually update supermarket prices. Columns: store, name, currentPrice, regularPrice, size, barcode, isOnSpecial, catalogueExpiresAt."
      >
        <Link href="/admin/grocery">
          <Button variant="secondary">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Paste CSV</CardTitle>
        </CardHeader>
        <div className="px-5 pb-5 space-y-3">
          <textarea
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            rows={10}
            className="w-full rounded-xl border border-[#2B3548] bg-[#0A0F1C] px-3 py-2 font-mono text-xs"
          />
          <Button onClick={() => void uploadText()} disabled={loading}>
            <Upload className="h-4 w-4" />
            Upload pasted CSV
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upload file</CardTitle>
        </CardHeader>
        <div className="px-5 pb-5 space-y-3">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-slate-300"
          />
          <Button onClick={() => void uploadFile()} disabled={loading || !file}>
            <Upload className="h-4 w-4" />
            Upload file
          </Button>
        </div>
      </Card>

      {message ? (
        <p className="text-sm text-emerald-300" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-rose-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
