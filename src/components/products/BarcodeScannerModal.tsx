"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, ScanLine, AlertCircle } from "lucide-react";

interface BarcodeScannerModalProps {
  onDetected: (code: string) => void;
  onClose: () => void;
}

const SCANNER_ELEMENT_ID = "barcode-scanner-viewport";

export default function BarcodeScannerModal({ onDetected, onClose }: BarcodeScannerModalProps) {
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<any>(null);
  const hasDetectedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;

        const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 150 } },
          (decodedText: string) => {
            if (hasDetectedRef.current) return;
            hasDetectedRef.current = true;
            onDetected(decodedText);
          },
          () => {
            // ignore per-frame "not found" errors, they fire constantly while scanning
          }
        );
      } catch (err: any) {
        if (!cancelled) {
          setError(
            err?.message?.includes("Permission")
              ? "Accès à la caméra refusé. Autorise la caméra dans les paramètres de ton navigateur."
              : "Impossible d'accéder à la caméra sur cet appareil."
          );
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      const scanner = scannerRef.current;
      if (scanner) {
        scanner
          .stop()
          .then(() => scanner.clear())
          .catch(() => {});
      }
    };
  }, [onDetected]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <ScanLine className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Scanner un code-barres</h2>
              <p className="text-xs text-slate-400">Cadre le code-barres du produit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {error ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          ) : (
            <div
              id={SCANNER_ELEMENT_ID}
              className="w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 min-h-[280px]"
            />
          )}
          <p className="text-[11px] text-slate-500 mt-3 text-center">
            Fonctionne avec les codes-barres EAN/UPC et les QR codes.
          </p>
        </div>
      </div>
    </div>
  );
}
