import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireTenant } from "@/lib/tenant";

export async function POST(req: Request) {
  try {
    await requireTenant();
    const data = await req.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "jpg";
    const filename = `product-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const blob = await put(filename, file, { access: "public" });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Échec de l'upload d'image" }, { status: 500 });
  }
}
