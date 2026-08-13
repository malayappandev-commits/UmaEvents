import * as tus from "tus-js-client";

type ProgressFn = (bytesUploaded: number, bytesTotal: number) => void;

export type ResumableUploadHandle = {
  abort: () => Promise<void>;
};

export async function resumableUpload(options: {
  supabaseUrl: string;
  accessToken: string;
  bucket: string;
  objectName: string;
  file: File | Blob;
  contentType: string;
  onProgress?: ProgressFn;
  signal?: AbortSignal;
}): Promise<void> {
  const { supabaseUrl, accessToken, bucket, objectName, file, contentType, onProgress, signal } =
    options;

  return new Promise((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint: `${supabaseUrl.replace(/\/$/, "")}/storage/v1/upload/resumable`,
      retryDelays: [0, 1000, 3000, 5000, 10000, 20000],
      headers: {
        authorization: `Bearer ${accessToken}`,
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
        "x-upsert": "false",
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      metadata: {
        bucketName: bucket,
        objectName,
        contentType,
        cacheControl: "3600",
      },
      chunkSize: 6 * 1024 * 1024,
      onError(error) {
        reject(error);
      },
      onProgress(bytesUploaded, bytesTotal) {
        onProgress?.(bytesUploaded, bytesTotal);
      },
      onSuccess() {
        resolve();
      },
    });

    const abort = () => {
      void upload.abort(true).then(() => reject(new DOMException("Aborted", "AbortError")));
    };

    if (signal) {
      if (signal.aborted) {
        abort();
        return;
      }
      signal.addEventListener("abort", abort, { once: true });
    }

    upload
      .findPreviousUploads()
      .then((previous) => {
        if (previous.length) {
          upload.resumeFromPreviousUpload(previous[0]);
        }
        upload.start();
      })
      .catch(reject);
  });
}
