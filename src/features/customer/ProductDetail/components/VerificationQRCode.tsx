import React from "react";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";

interface VerificationQRCodeProps {
  farmId: string;
  productId: string;
  qrSrc: string;
}

export const VerificationQRCode: React.FC<VerificationQRCodeProps> = ({ farmId, productId, qrSrc }) => {
  // Construct a verification URL. Replace domain when real API is available.
  // const verificationUrl = `${window.location.origin}/verify?farmId=${encodeURIComponent(farmId)}&productId=${encodeURIComponent(productId)}`;
  // const qrSrc = `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(verificationUrl)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrSrc);
      alert("Verification link copied to clipboard");
    } catch (e) {
      console.error(e);
      alert("Failed to copy link.\n" + qrSrc);
    }
  };

  return (
    <Card className="p-6 mt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Verification QR Code</h3>
      <p className="text-sm text-muted-foreground mb-4">Scan this code to verify product origin and authenticity.</p>
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="bg-white p-2 rounded shadow">
          <img src={qrSrc} alt="Verification QR" className="w-48 h-48 object-contain" />
        </div>
        <div className="flex-1">
          <p className="text-sm break-all mb-3">Link: <span className="text-green-600">{qrSrc}</span></p>
          <div className="flex gap-2">
            <Button onClick={handleCopy}>Copy Link</Button>
            <Button variant="outline" onClick={() => window.open(qrSrc, "_blank")}>Open QR Image</Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default VerificationQRCode;
