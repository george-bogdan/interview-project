import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
const UPLOAD_DIR = process.env.UPLOAD_DIR || "/app/uploads";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File | null;

    if (!image) {
      return NextResponse.json(
          { success: false, error: "No image file provided" },
          { status: 400 },
      );
    }

    if (!image.type.startsWith("image/")) {
      return NextResponse.json(
          { success: false, error: "Only image files are allowed" },
          { status: 400 },
      );
    }

    const originalName = image.name || "upload";
    const extension =
        originalName.includes(".") ? originalName.split(".").pop() : "bin";

    const safeExtension = (extension ?? "bin").replace(/[^\w]/g, "");
    const imageId = Date.now().toString();
    const fileName = `${imageId}.${safeExtension}`;

    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filePath = path.join(UPLOAD_DIR, fileName);
    await fs.writeFile(filePath, buffer);

    const publicPath = `/uploads/${fileName}`;

    console.log("[upload-image] saved:", filePath, "=>", publicPath);

    return NextResponse.json({
      success: true,
      imagePath: publicPath,
    });
  } catch (error) {
    console.error("[upload-image] error:", error);
    return NextResponse.json(
        { success: false, error: "Failed to upload image" },
        { status: 500 },
    );
  }
}