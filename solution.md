# SOLUTION
## 1. Problem I Found
When the app runs in Docker, uploaded images don’t work right away:
- The upload API receives the file and saves it.
- The file is visible inside the running container.
- But when you open `/uploads/<filename>` in the browser, you get a 404.
- After restarting or rebuilding the container, the same URL suddenly starts working.
  The main reasons:
1. Uploaded files were written into `public/uploads`. Files in `public/` are meant to be static and known at build time. New files added at runtime are not handled reliably by Next.js.
2. There was no clear separation between build‑time assets and runtime data in Docker, and no dedicated uploads directory.
   Result: uploads only worked properly after a restart/build, which is not acceptable for a runtime upload feature.
---
## 2. What I Changed
###  Store uploads in a dedicated runtime folder
Instead of saving to `public/uploads`, I now save uploaded files to a separate folder that is only for runtime data:
- Actual path in the container: `/app/uploads`
- In code: `const UPLOAD_DIR = process.env.UPLOAD_DIR || "/app/uploads";`
  This folder is created in the Docker image and can be mounted as a volume. It is no longer mixed with build‑time assets.
### New upload API: `app/api/upload-image/route.ts`
The upload API now:
- Accepts an image file in `FormData` under the key `"image"`.
- Checks that a file exists and that the MIME type starts with `image/`.
- Writes the file into `/app/uploads`.
- Returns a URL under `/uploads/...` that the frontend can use directly.

###  New route to serve uploads: `app/uploads/[...filePath]/route.ts`
I added a route handler in the App Router to serve the uploaded files.
Folder structure:
```text
app/
  uploads/
    [...filePath]/
      route.ts
```
### Command I used with Docker
```bash
docker build --no-cache -t interview-project-nextjs-app .
docker run -p 3000:3000 interview-project-nextjs-app
```

## 3. Possible Next Steps

If I had more time, I would also:

- Add **file size limits** and stricter validation on the server (and optionally on the client) to avoid very large or unexpected uploads.
- Use a small library to **detect the MIME type from the file bytes** instead of trusting the file extension and browser‑provided type.
- Add **authentication/authorization** so that only logged‑in users can upload files, and (optionally) only the owner can access their own uploads.
- Replace the local `/app/uploads` storage with an **object storage service** like S3 or GCS for a more realistic production setup.
- Add a few **tests** for the upload API and the `/uploads` route: happy path, invalid file type, missing file, non‑existent file, and path traversal attempts.