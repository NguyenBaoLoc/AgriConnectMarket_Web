import { useState } from 'react';
import { AlertTriangle, Upload, X, Send, Shield } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '../../../../api';

interface ReportFarmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farmId: string;
  farmName: string;
}

const VIOLATION_TYPES = ['Fake Product', 'Fake Care Event'] as const;

export function ReportFarmDialog({
  open,
  onOpenChange,
  farmId,
  farmName,
}: ReportFarmDialogProps) {
  const [violationType, setViolationType] = useState<string>('');
  const [content, setContent] = useState('');
  const [evidenceImage, setEvidenceImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (file: File | null) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size should be less than 10MB');
      return;
    }

    setEvidenceImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setEvidenceImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!violationType) {
      toast.error('Please select a violation type');
      return;
    }

    if (!content.trim()) {
      toast.error('Please describe the violation');
      return;
    }

    if (!evidenceImage) {
      toast.error('Please upload evidence image');
      return;
    }

    try {
      setIsSubmitting(true);

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please sign in to report violations');
        return;
      }

      const formData = new FormData();
      formData.append('farmId', farmId);
      formData.append('content', content.trim());
      formData.append('violationType', violationType);
      formData.append('evidenceImage', evidenceImage);

      const response = await axios.post(API.violationReports.create, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success('Report submitted successfully. We will review it shortly.');
        handleClose();
      } else {
        toast.error(response.data.message || 'Failed to submit report');
      }
    } catch (error: any) {
      console.error('Error submitting report:', error);
      if (error.response?.status === 401) {
        toast.error('Please sign in to report violations');
      } else {
        toast.error(error.response?.data?.message || 'Failed to submit report');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setViolationType('');
    setContent('');
    setEvidenceImage(null);
    setImagePreview(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Report Violation</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Help us maintain quality by reporting violations for{' '}
                <span className="font-semibold text-gray-900">{farmName}</span>
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Violation Type */}
          <div className="space-y-3">
            <Label htmlFor="violation-type" className="flex items-center gap-2 text-base font-semibold">
              <Shield className="h-4 w-4 text-red-600" />
              Violation Type *
            </Label>
            <Select value={violationType} onValueChange={setViolationType}>
              <SelectTrigger
                id="violation-type"
                className="h-12 text-base border-2 focus:border-red-500"
              >
                <SelectValue placeholder="Select violation type" />
              </SelectTrigger>
              <SelectContent>
                {VIOLATION_TYPES.map((type) => (
                  <SelectItem key={type} value={type} className="text-base py-3">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose the type of violation you're reporting
            </p>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <Label htmlFor="content" className="text-base font-semibold">
              Description *
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Please provide detailed information about the violation. Include specific products, events, or practices that concern you..."
              rows={6}
              className="resize-none border-2 focus:border-red-500 text-base"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              {content.length} / 1000 characters
            </p>
          </div>

          {/* Evidence Image */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Upload className="h-4 w-4 text-red-600" />
              Evidence Image *
            </Label>

            {!imagePreview ? (
              <div className="relative">
                <input
                  id="evidence-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
                  className="hidden"
                  disabled={isSubmitting}
                />
                <label
                  htmlFor="evidence-upload"
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-red-500 hover:bg-red-50 transition-all"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-3">
                      <Upload className="h-8 w-8 text-red-600" />
                    </div>
                    <p className="mb-2 text-sm font-semibold text-gray-700">
                      Click to upload evidence image
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, JPEG up to 10MB
                    </p>
                  </div>
                </label>
              </div>
            ) : (
              <div className="relative inline-block w-full">
                <div className="relative w-full h-64 bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200">
                  <img
                    src={imagePreview}
                    alt="Evidence preview"
                    className="w-full h-full object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-110"
                  disabled={isSubmitting}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Upload clear evidence of the violation (screenshots, photos, etc.)
            </p>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Your Report is Important
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Reports are reviewed by our moderation team</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Your identity will be kept confidential</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>False reports may result in account restrictions</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <DialogFooter className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 h-12 text-base border-2"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !violationType || !content.trim() || !evidenceImage}
              className="flex-1 h-12 text-base bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: 'green'
              }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Report
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
