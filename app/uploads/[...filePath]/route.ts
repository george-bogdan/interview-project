import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "/app/uploads";

export const runtime = "nodejs";

export async function GET(
    _request: NextRequest,
    context: { params: Promise<{ filePath: string[] }> },
) {
    const { filePath } = await context.params;
    console.log("[uploads] request for:", filePath);

    try {
        const absolutePath = path.join(UPLOAD_DIR, ...filePath);
        const normalizedPath = path.normalize(absolutePath);

        // Basic path traversal protection
        if (!normalizedPath.startsWith(UPLOAD_DIR)) {
            console.warn("[uploads] blocked path:", normalizedPath);
            return new NextResponse("Forbidden", { status: 403 });
        }

        const file = await fs.readFile(normalizedPath);

        const extension = path.extname(normalizedPath).toLowerCase();
        const contentType =
            extension === ".jpg" || extension === ".jpeg"
                ? "image/jpeg"
                : extension === ".png"
                    ? "image/png"
                    : extension === ".gif"
                        ? "image/gif"
                        : extension === ".webp"
                            ? "image/webp"
                            : "application/octet-stream";

        console.log("[uploads] serving:", normalizedPath, "as", contentType);

        return new NextResponse(file, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error: any) {
        if (error?.code === "ENOENT") {
            console.warn("[uploads] file not found");
            return new NextResponse("Not found", { status: 404 });
        }

        console.error("[uploads] error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}