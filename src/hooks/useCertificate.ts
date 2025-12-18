import { useCallback } from "react";

export interface CertificateData {
  farmId: string;
  imageBase64: string;
  uploadedAt: string;
  uploaderAccountId?: string;
}

const STORAGE_KEY = "agri_certificates_v1";

function readAll(): Record<string, CertificateData> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, CertificateData>;
  } catch (e) {
    console.error("Failed to read certificates from localStorage", e);
    return {};
  }
}

function writeAll(data: Record<string, CertificateData>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to write certificates to localStorage", e);
  }
}

export const useCertificate = () => {
  const getCertificate = useCallback((farmId: string) => {
    const all = readAll();
    return all[farmId] || null;
  }, []);

  const uploadCertificate = useCallback(async (farmId: string, file: File, uploaderAccountId?: string) => {
    // convert to base64
    const toBase64 = (f: File) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(f);
      });
    const base64 = await toBase64(file);
    const all = readAll();
    const entry: CertificateData = {
      farmId,
      imageBase64: base64,
      uploadedAt: new Date().toISOString(),
      uploaderAccountId,
    };
    all[farmId] = entry;
    writeAll(all);
    return entry;
  }, []);

  const removeCertificate = useCallback((farmId: string) => {
    const all = readAll();
    if (all[farmId]) {
      delete all[farmId];
      writeAll(all);
    }
  }, []);

  return {
    getCertificate,
    uploadCertificate,
    removeCertificate,
  } as const;
};

export default useCertificate;
