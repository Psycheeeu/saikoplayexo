import { useState } from "react";
import { Send } from "lucide-react";

const QR_URL = "https://i.imgur.com/pnEkFDL.jpeg";
const GCASH_LOGO_URL =
  "https://images.seeklogo.com/logo-png/52/2/gcash-logo-png_seeklogo-522261.png";

export default function Donate() {
  const [qrFailed, setQrFailed] = useState(false);

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 md:px-12">
      <div className="max-w-md mx-auto flex flex-col items-center text-center pt-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted mb-2">
          Donate
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary mb-2">
          Support SaikoPlay
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed mb-10 max-w-sm">
          Your support keeps SaikoPlay fast, independent, and ad-free. Scan the
          code below with GCash to send a donation of any amount.
        </p>

        {/* QR code — swap this asset later without layout changes */}
        <div className="w-64 h-64 md:w-72 md:h-72 rounded-2xl bg-white ring-1 ring-line shadow-lift p-3">
          {qrFailed ? (
            <div className="w-full h-full rounded-xl border-2 border-dashed border-line-strong flex flex-col items-center justify-center gap-2 text-text-muted">
              <span className="text-4xl font-bold tracking-tight">QR</span>
              <span className="text-xs">QR code coming soon</span>
            </div>
          ) : (
            <img
              src={QR_URL}
              alt="GCash donation QR code"
              className="w-full h-full object-contain rounded-xl"
              onError={() => setQrFailed(true)}
            />
          )}
        </div>

        {/* GCash brand mark */}
        <img
          src={GCASH_LOGO_URL}
          alt="GCash"
          className="mt-8 h-10 w-10 rounded-xl ring-1 ring-line bg-white"
        />

        {/* Contact information */}
        <div className="w-full mt-12 text-left bg-bg-secondary ring-1 ring-line rounded-2xl p-6 md:p-7">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted mb-4">
            Contact Information
          </h2>
          <dl className="space-y-4">
            <div className="flex items-start gap-3">
              <Send size={13} className="text-text-muted mt-0.5 shrink-0" />
              <div>
                <dt className="text-xs text-text-muted mb-0.5">GCash</dt>
                <dd className="text-sm text-text-primary leading-relaxed">
                  JE***K Q.
                </dd>
                <dd className="text-sm text-text-secondary leading-relaxed tnum">
                  +63 9** *** 8442
                </dd>
              </div>
            </div>
          </dl>
          <p className="text-xs text-text-muted leading-relaxed mt-6 pt-4 border-t border-line">
            Send donations via GCash by scanning the QR code above. Every
            contribution keeps the service free for everyone.
          </p>
        </div>
      </div>
    </div>
  );
}
