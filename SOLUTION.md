# Mladen Tsvetkov's Solution

## Analysis

1. Started the app locally (outside Docker) and uploaded images to confirm the expected behaviour.
2. Started Docker and ran the `compose` command.
3. Retested and saw:
   - Browser dev tools logged `http://localhost:3000/uploads/image-1763567231636.jpg 404 (Not Found)`.
   - The UI reported a successful upload, but the preview showed the default `<img>` placeholder.
   - The network tab confirmed the upload succeeded, yet fetching the image returned `404`.
4. Compared behaviour between dev mode and Docker—no obvious differences surfaced.
5. Verified images were stored on the host filesystem and that Docker volumes were configured; access permissions were not the culprit.
6. Realised the app could read existing images but not the newly uploaded ones.
7. Confirmed we were saving images under `public`, which is designed for static assets rather than dynamic user content.

## Solution

Created an API route to serve images dynamically instead of depending on static `public` assets.

## Solution (improved)

Storing user uploads in `public` raises privacy and security concerns, so I created a dedicated `user-data` directory for runtime uploads.

## Testing

1. Image upload and preview work in both development and Docker environments.
2. Uploaded files persist even after restarting the Docker container.

- Upload an image in dev mode.
- Start in prod mode and confirm existing images remain accessible.
- Upload an image in prod mode.
- Confirm the new image is accessible immediately.
- Return to dev mode and verify prod-uploaded images still load.

3. Upload an image from the user's workstation.
4. Confirm the browser preview appears before the server upload.
5. Upload the file to the server.
6. Confirm the server-loaded preview renders correctly.
7. Open the full-page view and ensure the server-loaded image displays.
