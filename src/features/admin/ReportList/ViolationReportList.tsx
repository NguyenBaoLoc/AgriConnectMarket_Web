import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  Image as ImageIcon,
  Shield,
  RefreshCw,
  FileText,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import axios from 'axios';
import { API } from '../../../api';
import { toast } from 'sonner';
import { formatUtcDateTime } from '../../../utils/timeUtils';

interface ViolationReport {
  content: string;
  evidenceUrl: string;
  createdAt: string;
  violationType?: string;
  farmId?: string;
}

export function ViolationReportList() {
  const [reports, setReports] = useState<ViolationReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isBanning, setIsBanning] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(API.violationReports.create, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success && Array.isArray(response.data.data)) {
        setReports(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to load reports');
      }
    } catch (err) {
      console.error('Error fetching violation reports:', err);
      const errorMessage =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as Error)?.message ||
        'Failed to load violation reports';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const getViolationTypeColor = (type?: string) => {
    if (!type) return 'bg-gray-100 text-gray-800';
    if (type === 'Fake Product') return 'bg-red-100 text-red-800';
    if (type === 'Fake Care Event') return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return formatUtcDateTime(dateString);
  };

  const handleBanFarm = async (farmId: string, reportIndex: number) => {
    if (!farmId) {
      toast.error('Farm ID is missing from this report');
      return;
    }

    if (
      !confirm(
        'Are you sure you want to ban this farm? This action will restrict the farm from the platform.'
      )
    ) {
      return;
    }

    try {
      setIsBanning(farmId);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.patch(
        API.farm.ban(farmId),
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success('Farm has been banned successfully!');
        // Remove the report from the list
        setReports((prevReports) =>
          prevReports.filter((_, index) => index !== reportIndex)
        );
      } else {
        throw new Error(response.data.message || 'Failed to ban farm');
      }
    } catch (err) {
      console.error('Error banning farm:', err);
      const errorMessage =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as Error)?.message ||
        'Failed to ban farm';
      toast.error(errorMessage);
    } finally {
      setIsBanning(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div
            className="flex items-center justify-center rounded-2xl shadow-2xl"
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
            }}
          >
            <Shield
              className="text-white"
              style={{ width: '40px', height: '40px' }}
            />
          </div>
          <div>
            <h2
              className="text-gray-900"
              style={{
                fontSize: '32px',
                fontWeight: '800',
                marginBottom: '8px',
              }}
            >
              Violation Reports
            </h2>
            <p className="text-gray-600" style={{ fontSize: '16px' }}>
              Review and manage reported violations
            </p>
          </div>
        </div>

        {/* Loading State */}
        <Card className="p-12 text-center border-2">
          <div
            className="mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          >
            <RefreshCw
              className="text-white animate-spin"
              style={{ width: '40px', height: '40px' }}
            />
          </div>
          <p
            className="text-gray-600"
            style={{ fontSize: '18px', fontWeight: '600' }}
          >
            Loading violation reports...
          </p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div
            className="flex items-center justify-center rounded-2xl shadow-2xl"
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
            }}
          >
            <Shield
              className="text-white"
              style={{ width: '40px', height: '40px' }}
            />
          </div>
          <div>
            <h2
              className="text-gray-900"
              style={{
                fontSize: '32px',
                fontWeight: '800',
                marginBottom: '8px',
              }}
            >
              Violation Reports
            </h2>
            <p className="text-gray-600" style={{ fontSize: '16px' }}>
              Review and manage reported violations
            </p>
          </div>
        </div>

        {/* Error State */}
        <Card
          className="p-12 text-center border-2"
          style={{ borderColor: '#fecaca' }}
        >
          <div
            className="mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#fee2e2',
            }}
          >
            <AlertCircle
              className="text-red-600"
              style={{ width: '40px', height: '40px' }}
            />
          </div>
          <p
            className="text-red-600 mb-4"
            style={{ fontSize: '20px', fontWeight: '700' }}
          >
            {error}
          </p>
          <Button
            onClick={fetchReports}
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
              color: 'white',
              padding: '12px 32px',
              fontSize: '16px',
              fontWeight: '600',
            }}
          >
            <RefreshCw
              className="mr-2"
              style={{ width: '18px', height: '18px' }}
            />
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="flex items-center justify-center rounded-2xl shadow-2xl"
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
            }}
          >
            <Shield
              className="text-white"
              style={{ width: '40px', height: '40px' }}
            />
          </div>
          <div>
            <h2
              className="text-gray-900"
              style={{
                fontSize: '32px',
                fontWeight: '800',
                marginBottom: '8px',
              }}
            >
              Violation Reports
            </h2>
            <p className="text-gray-600" style={{ fontSize: '16px' }}>
              {reports.length} {reports.length === 1 ? 'report' : 'reports'}{' '}
              pending review
            </p>
          </div>
        </div>

        <Button
          onClick={fetchReports}
          variant="outline"
          className="border-2 hover:bg-gray-50"
          style={{ padding: '12px 24px', fontSize: '16px', fontWeight: '600' }}
        >
          <RefreshCw
            className="mr-2"
            style={{ width: '18px', height: '18px' }}
          />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 mb-32"
        style={{
          margin: '32px 0',
        }}
      >
        <Card
          className="p-6 border-2 shadow-lg hover:shadow-xl transition-all"
          style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            borderColor: '#fcd34d',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-yellow-800 mb-2"
                style={{ fontSize: '14px', fontWeight: '600' }}
              >
                Total Reports
              </p>
              <p
                className="text-yellow-900"
                style={{ fontSize: '36px', fontWeight: '800' }}
              >
                {reports.length}
              </p>
            </div>
            <div
              className="rounded-full flex items-center justify-center"
              style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#fef3c7',
              }}
            >
              <FileText
                className="text-yellow-600"
                style={{ width: '30px', height: '30px' }}
              />
            </div>
          </div>
        </Card>

        <Card
          className="p-6 border-2 shadow-lg hover:shadow-xl transition-all"
          style={{
            background: 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)',
            borderColor: '#f87171',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-red-800 mb-2"
                style={{ fontSize: '14px', fontWeight: '600' }}
              >
                Fake Products
              </p>
              <p
                className="text-red-900"
                style={{ fontSize: '36px', fontWeight: '800' }}
              >
                {
                  reports.filter((r) => r.violationType === 'Fake Product')
                    .length
                }
              </p>
            </div>
            <div
              className="rounded-full flex items-center justify-center"
              style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#fee2e2',
              }}
            >
              <AlertTriangle
                className="text-red-600"
                style={{ width: '30px', height: '30px' }}
              />
            </div>
          </div>
        </Card>

        <Card
          className="p-6 border-2 shadow-lg hover:shadow-xl transition-all"
          style={{
            background: 'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)',
            borderColor: '#fb923c',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-orange-800 mb-2"
                style={{ fontSize: '14px', fontWeight: '600' }}
              >
                Fake Events
              </p>
              <p
                className="text-orange-900"
                style={{ fontSize: '36px', fontWeight: '800' }}
              >
                {
                  reports.filter((r) => r.violationType === 'Fake Care Event')
                    .length
                }
              </p>
            </div>
            <div
              className="rounded-full flex items-center justify-center"
              style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#ffedd5',
              }}
            >
              <AlertCircle
                className="text-orange-600"
                style={{ width: '30px', height: '30px' }}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Reports List */}
      {reports.length === 0 ? (
        <Card
          className="p-12 text-center border-2"
          style={{ borderColor: '#d1d5db', borderStyle: 'dashed' }}
        >
          <div
            className="mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#f3f4f6',
            }}
          >
            <CheckCircle
              className="text-green-600"
              style={{ width: '40px', height: '40px' }}
            />
          </div>
          <p
            className="text-gray-900 mb-2"
            style={{ fontSize: '20px', fontWeight: '700' }}
          >
            No Violation Reports
          </p>
          <p className="text-gray-600" style={{ fontSize: '16px' }}>
            There are currently no violation reports to review
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {reports.map((report, index) => (
            <Card
              key={index}
              className="overflow-hidden border-2 hover:shadow-2xl transition-all"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
              }}
            >
              {/* Report Header */}
              <div
                className="p-6"
                style={{
                  background:
                    'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                  borderBottom: '2px solid #f87171',
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        width: '48px',
                        height: '48px',
                        background:
                          'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
                      }}
                    >
                      <AlertTriangle
                        className="text-white"
                        style={{ width: '24px', height: '24px' }}
                      />
                    </div>
                    <div>
                      <Badge
                        className={getViolationTypeColor(report.violationType)}
                        style={{
                          fontSize: '12px',
                          fontWeight: '700',
                          padding: '4px 12px',
                        }}
                      >
                        {report.violationType || 'Violation Report'}
                      </Badge>
                      <div className="flex items-center gap-2 mt-2 text-gray-600">
                        <Calendar style={{ width: '14px', height: '14px' }} />
                        <span style={{ fontSize: '13px' }}>
                          {formatDate(report.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Report Content */}
              <div className="p-6">
                <div className="mb-4">
                  <h4
                    className="text-gray-900 mb-2"
                    style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Description
                  </h4>
                  <p
                    className="text-gray-700"
                    style={{ fontSize: '15px', lineHeight: '1.6' }}
                  >
                    {report.content}
                  </p>
                </div>

                {/* Evidence Image */}
                {report.evidenceUrl && (
                  <div>
                    <h4
                      className="text-gray-900 mb-3"
                      style={{
                        fontSize: '14px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Evidence
                    </h4>
                    <div
                      className="relative rounded-xl overflow-hidden border-2 cursor-pointer hover:opacity-90 transition-all"
                      style={{
                        borderColor: '#e5e7eb',
                        height: '240px',
                      }}
                      onClick={() => setSelectedImage(report.evidenceUrl)}
                    >
                      <img
                        src={report.evidenceUrl}
                        alt="Evidence"
                        className="w-full h-full object-cover"
                      />
                      <div
                        className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                        style={{
                          background: 'rgba(0, 0, 0, 0.7)',
                        }}
                      >
                        <ImageIcon
                          className="text-white"
                          style={{ width: '48px', height: '48px' }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div
                className="p-4 flex items-center justify-between"
                style={{
                  backgroundColor: '#f9fafb',
                  borderTop: '2px solid #e5e7eb',
                }}
              >
                <span
                  className="text-gray-600"
                  style={{ fontSize: '13px', fontWeight: '600' }}
                >
                  Report #{index + 1}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleBanFarm(report.farmId || '', index)}
                    disabled={isBanning === report.farmId || !report.farmId}
                    style={{
                      background:
                        isBanning === report.farmId
                          ? '#9ca3af'
                          : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '600',
                      opacity: !report.farmId ? 0.5 : 1,
                      cursor: !report.farmId ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isBanning === report.farmId ? (
                      <>
                        <RefreshCw
                          className="mr-2 animate-spin"
                          style={{ width: '16px', height: '16px' }}
                        />
                        Banning...
                      </>
                    ) : (
                      'Ban This Farm'
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
          }}
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-6xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 rounded-full flex items-center justify-center hover:bg-white/20 transition-all z-10"
              style={{
                width: '48px',
                height: '48px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }}
            >
              <span
                className="text-white"
                style={{ fontSize: '32px', lineHeight: '1' }}
              >
                ×
              </span>
            </button>
            <img
              src={selectedImage}
              alt="Evidence full view"
              className="w-full h-full object-contain rounded-2xl"
              style={{ maxHeight: '90vh' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
