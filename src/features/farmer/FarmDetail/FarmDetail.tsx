import { useEffect, useState } from 'react';
import { ArrowLeft, Edit2, Trash2, X, Upload } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { toast } from 'sonner';
import { CertificateViewer } from '../../../components/CertificateViewer';
import { useNavigate, useParams } from 'react-router-dom';
import { getFarmDetail, updateFarm, deleteFarm, uploadCertificate, updateCertificate, deleteCertificate } from './api';
import type { FarmDetail as FarmDetailType } from './types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { AddFarmDialog } from '../FarmManage/components/AddFarmDialog';
import { useFarmCheck } from '../../../hooks/useFarmCheck';
import { getProvinces, getDistricts, getWards } from '../FarmManage/api';
import type { Province, District, Ward } from '../FarmManage/types';
import { getFarms } from '../FarmManage/api';
import useCertificate from '../../../hooks/useCertificate';

interface FarmDetailProps {
  farmId?: string;
}

export function FarmDetail({ farmId: propFarmId }: FarmDetailProps) {
  const [farmDetail, setFarmDetail] = useState<FarmDetailType>(
    {} as FarmDetailType
  );
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | undefined>();
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [showAddFarmDialog, setShowAddFarmDialog] = useState(false);
  const [isCertificateLoading, setIsCertificateLoading] = useState(false);
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);

  // Location states
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  // Track if user is actively editing (to prevent auto-fetch on initial load)
  const [isEditingLocation, setIsEditingLocation] = useState(false);

  const [formData, setFormData] = useState({
    farmName: '',
    farmDesc: '',
    phone: '',
    area: '',
    province: '',
    district: '',
    ward: '',
    detail: '',
  });
  const navigate = useNavigate();
  const { farmId: paramFarmId } = useParams();
  const { hasFarmId, saveFarmIdToLocalStorage } = useFarmCheck();

  // Use prop farmId if provided, otherwise use route param
  const farmId = propFarmId || paramFarmId;

  const onBack = () => {
    // If farmId was passed as a prop (not from route params), navigate back to farms
    if (propFarmId && !paramFarmId) {
      navigate('/farmer/farms');
    } else {
      navigate(-1);
    }
  };

  useEffect(() => {
    const fetchFarmDetails = async () => {
      try {
        const response = await getFarmDetail(farmId || '');
        if (response.success && response.data) {
          setFarmDetail(response.data);
          setFormData({
            farmName: response.data.farmName,
            farmDesc: response.data.farmDesc,
            phone: response.data.phone,
            area: response.data.area,
            province: response.data.address?.province || '',
            district: response.data.address?.district || '',
            ward: response.data.address?.ward || '',
            detail: response.data.address?.detail || '',
          });
          // Load certificate from API response
          if (response.data.certificateUrl) {
            setCertificateUrl(response.data.certificateUrl);
            setCertificatePreview(response.data.certificateUrl);
          }
          console.log(response.data);
        } else {
          toast.error('Failed to fetch farm details');
        }
      } catch (error) {
        console.error('Error fetching farm details:', error);
      }
    };
    fetchFarmDetails();
  }, [farmId]);

  const fetchProvinces = async () => {
    setIsLoadingProvinces(true);
    try {
      const data = await getProvinces();
      setProvinces(data);
    } catch (error) {
      console.error('Error fetching provinces:', error);
      toast.error('Failed to load provinces');
    } finally {
      setIsLoadingProvinces(false);
    }
  };

  const fetchDistricts = async (provinceCode: string) => {
    setIsLoadingDistricts(true);
    try {
      const data = await getDistricts(provinceCode);
      setDistricts(data);
    } catch (error) {
      console.error('Error fetching districts:', error);
      toast.error('Failed to load districts');
    } finally {
      setIsLoadingDistricts(false);
    }
  };

  const fetchWards = async (districtCode: string) => {
    setIsLoadingWards(true);
    try {
      const data = await getWards(districtCode);
      setWards(data);
    } catch (error) {
      console.error('Error fetching wards:', error);
      toast.error('Failed to load wards');
    } finally {
      setIsLoadingWards(false);
    }
  };

  // Load districts when province changes (only if actively editing)
  useEffect(() => {
    if (formData.province && isEditingLocation) {
      setFormData((prev) => ({
        ...prev,
        district: '',
        ward: '',
      }));
      setDistricts([]);
      setWards([]);
      fetchDistricts(formData.province);
    }
  }, [formData.province, isEditingLocation]);

  // Load wards when district changes (only if actively editing)
  useEffect(() => {
    if (formData.district && isEditingLocation) {
      setFormData((prev) => ({
        ...prev,
        ward: '',
      }));
      setWards([]);
      console.log(formData.district);
      fetchWards(formData.district);
    }
  }, [formData.district, isEditingLocation]);

  const handleEditOpen = () => {
    // Note: Location fields (province, district, ward) cannot be pre-filled because
    // the backend stores them as names (strings), but the external API requires codes (numbers).
    // User must reselect location from dropdowns when editing.
    setFormData({
      farmName: farmDetail.farmName,
      farmDesc: farmDetail.farmDesc,
      phone: farmDetail.phone,
      area: farmDetail.area,
      province: farmDetail.address?.province || '',
      district: farmDetail.address?.district || '',
      ward: farmDetail.address?.ward || '',
      detail: farmDetail.address?.detail || '',
    });

    // Load current banner image if exists
    if (farmDetail.bannerUrl) {
      setBannerPreview(farmDetail.bannerUrl);
    } else {
      setBannerFile(undefined);
      setBannerPreview(null);
    }

    // Reset location state
    setDistricts([]);
    setWards([]);
    setIsEditingLocation(true);

    fetchProvinces();
    setIsEditOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size must be less than 10MB');
        return;
      }
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBanner = () => {
    setBannerFile(undefined);
    setBannerPreview(null);
  };

  // Certificate handling (client-side fallback)
  const { getCertificate, uploadCertificate: uploadCertificateLocal, removeCertificate } =
    useCertificate();
  const [certificatePreview, setCertificatePreview] = useState<string | null>(
    null
  );
  useEffect(() => {
    if (!farmId) return;
    // Check for server-side certificate URL first, then fall back to local storage
    if (certificateUrl) {
      setCertificatePreview(certificateUrl);
    } else {
      const cert = getCertificate(farmId);
      setCertificatePreview(cert ? cert.imageBase64 : null);
    }
  }, [farmId, certificateUrl, getCertificate]);

  const handleUpdateSubmit = async () => {
    if (
      !formData.farmName ||
      !formData.farmDesc ||
      !formData.phone ||
      !formData.area
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await updateFarm(farmId || '', formData, bannerFile);
      if (response.success && response.data) {
        setFarmDetail(response.data);
        setIsEditOpen(false);
        toast.success('Farm updated successfully');
      } else {
        toast.error(response.message || 'Failed to update farm');
      }
    } catch (error) {
      console.error('Error updating farm:', error);
      toast.error('Error updating farm');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await deleteFarm(farmId || '');
      if (response.success) {
        toast.success('Farm deleted successfully');
        navigate('/farmer/farms');
      } else {
        toast.error(response.message || 'Failed to delete farm');
      }
    } catch (error) {
      console.error('Error deleting farm:', error);
      toast.error('Error deleting farm');
    } finally {
      setIsLoading(false);
    }
  };

  // Show add farm dialog if no farm exists
  if (!hasFarmId() || !farmDetail.id) {
    return (
      <>
        <div className='space-y-6'>
          <div className='flex items-center gap-4'>
            <Button variant='ghost' size='icon' onClick={onBack}>
              <ArrowLeft className='h-5 w-5' />
            </Button>
            <div>
              <h2 className='text-gray-900'>Farm Profile</h2>
            </div>
          </div>

          <div className='flex justify-center items-center py-12'>
            <div className='text-center'>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                No Farm Found
              </h3>
              <p className='text-muted-foreground mb-6'>
                You don't have any farms yet. Create your first farm to get
                started.
              </p>
              <Button
                className='bg-green-600 hover:bg-green-700'
                onClick={() => setShowAddFarmDialog(true)}
              >
                Create First Farm
              </Button>
            </div>
          </div>
        </div>

        {/* Add Farm Dialog */}
        <AddFarmDialog
          open={showAddFarmDialog}
          onOpenChange={setShowAddFarmDialog}
          onFarmAdded={() => {
            // Refresh farm details after adding
            const fetchFarmDetails = async () => {
              try {
                const farmsResponse = await getFarms();
                if (farmsResponse.success && farmsResponse.data) {
                  saveFarmIdToLocalStorage(farmsResponse.data.id);
                  const response = await getFarmDetail(farmsResponse.data.id);
                  if (response.success && response.data) {
                    setFarmDetail(response.data);
                    setShowAddFarmDialog(false);
                    toast.success('Farm created successfully!');
                  }
                }
              } catch (error) {
                console.error('Error fetching farm details:', error);
              }
            };
            fetchFarmDetails();
          }}
        />
      </>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' size='icon' onClick={onBack}>
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <div>
            <h2 className='text-gray-900'>Farm Profile</h2>
          </div>
        </div>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleEditOpen}
            className='gap-2'
          >
            <Edit2 className='h-4 w-4' />
            Edit
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setIsDeleteOpen(true)}
            className='gap-2 text-red-600 hover:text-red-700'
          >
            <Trash2 className='h-4 w-4' />
            Delete
          </Button>
        </div>
      </div>

      {/* Farm Banner */}
      {farmDetail.bannerUrl && (
        <Card className='overflow-hidden'>
          <img
            src={farmDetail.bannerUrl}
            alt={farmDetail.farmName}
            className='w-1/3 object-cover'
            style={{
              maxHeight: '80vh',
            }}
          />
        </Card>
      )}

      <div className='space-y-6'>
        {/* Farm Information */}
        <Card className='p-6'>
          <h3 className='text-2xl font-bold text-gray-900 mb-6'>
            {farmDetail.farmName}
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <p className='text-sm text-muted-foreground'>Area</p>
              <p className='text-base font-medium'>{farmDetail.area}</p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Phone</p>
              <p className='text-base font-medium'>{farmDetail.phone}</p>
            </div>

            <div>
              <p className='text-sm text-muted-foreground'>Created Date</p>
              <p className='text-base font-medium'>
                {new Date(farmDetail.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          {farmDetail.farmDesc && (
            <div className='mt-6 pt-6 border-t'>
              <p className='text-sm text-muted-foreground mb-2'>Description</p>
              <p className='text-base text-gray-700'>{farmDetail.farmDesc}</p>
            </div>
          )}
        </Card>

        {/* Certificate Section */}
         <Card className='p-6'>
           <h3 className='text-lg font-semibold text-gray-900 mb-4'>
             Certificate
           </h3>
           {certificatePreview ? (
             <div className='space-y-3'>
               <img
                 src={certificatePreview}
                 alt='certificate'
                 className='w-64 h-auto object-contain rounded shadow'
               />
               <div className='flex flex-wrap gap-2'>
                 <CertificateViewer imageUrl={certificatePreview} altText='Farm Certificate' />
                 <Button
                   variant='outline'
                   onClick={() => {
                     document.getElementById('certificate-update')?.click();
                   }}
                   disabled={isCertificateLoading}
                   className='gap-2'
                 >
                   Update
                 </Button>
                 <Button
                   variant='outline'
                   onClick={async () => {
                     if (!farmId) return;
                     setIsCertificateLoading(true);
                     try {
                       const response = await deleteCertificate(farmId);
                       if (response.success) {
                         setCertificateUrl(null);
                         setCertificatePreview(null);
                         removeCertificate(farmId);
                         toast.success('Certificate deleted successfully');
                       } else {
                         toast.error(response.message || 'Failed to delete certificate');
                       }
                     } catch (err) {
                       console.error(err);
                       toast.error('Failed to delete certificate');
                     } finally {
                       setIsCertificateLoading(false);
                     }
                   }}
                   disabled={isCertificateLoading}
                   className='gap-2 text-red-600 hover:text-red-700'
                 >
                   Delete
                 </Button>
               </div>
               <input
                 id='certificate-update'
                 type='file'
                 accept='image/*'
                 disabled={isCertificateLoading}
                 onChange={async (e) => {
                   const file = e.target.files?.[0];
                   if (!file || !farmId) return;
                   if (!file.type.startsWith('image/')) {
                     toast.error('Please select an image file');
                     return;
                   }
                   setIsCertificateLoading(true);
                   try {
                     const response = await updateCertificate(farmId, file);
                     if (response.success && response.data) {
                       setCertificateUrl(response.data);
                       setCertificatePreview(response.data);
                       toast.success('Certificate updated successfully');
                     } else {
                       toast.error(response.message || 'Failed to update certificate');
                     }
                   } catch (err) {
                     console.error(err);
                     toast.error('Failed to update certificate');
                   } finally {
                     setIsCertificateLoading(false);
                   }
                 }}
                 className='hidden'
               />
             </div>
           ) : (
             <div className='space-y-3'>
               <p className='text-sm text-muted-foreground'>
                 No certificate uploaded yet.
               </p>
               <input
                 id='certificate'
                 type='file'
                 accept='image/*'
                 disabled={isCertificateLoading}
                 onChange={async (e) => {
                   const file = e.target.files?.[0];
                   if (!file || !farmId) return;
                   if (!file.type.startsWith('image/')) {
                     toast.error('Please select an image file');
                     return;
                   }
                   setIsCertificateLoading(true);
                   try {
                     // Upload to server
                     const response = await uploadCertificate(farmId, file);
                     if (response.success && response.data) {
                       setCertificateUrl(response.data);
                       setCertificatePreview(response.data);
                       toast.success('Certificate uploaded successfully');
                     } else {
                       toast.error(response.message || 'Failed to upload certificate');
                     }
                   } catch (err) {
                     console.error(err);
                     toast.error('Failed to upload certificate');
                   } finally {
                     setIsCertificateLoading(false);
                   }
                 }}
               />
             </div>
           )}
         </Card>

        {/* Location Information */}
        {farmDetail.address && (
          <Card className='p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-6'>
              Location
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <p className='text-sm text-muted-foreground'>Province</p>
                <p className='text-base font-medium'>
                  {farmDetail.address.province}
                </p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>District</p>
                <p className='text-base font-medium'>
                  {farmDetail.address.district}
                </p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Ward</p>
                <p className='text-base font-medium'>
                  {farmDetail.address.ward}
                </p>
              </div>
            </div>
            {farmDetail.address.detail && (
              <div className='mt-6 pt-6 border-t'>
                <p className='text-sm text-muted-foreground mb-2'>
                  Detailed Address
                </p>
                <p className='text-base text-gray-700'>
                  {farmDetail.address.detail}
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Farm Status */}
        <Card className='p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-6'>
            Farm Status
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <p className='text-sm text-muted-foreground'>Valid for Selling</p>
              <div className='mt-1'>
                {farmDetail.isValidForSelling ? (
                  <Badge className='bg-green-100 text-green-800'>Yes</Badge>
                ) : (
                  <Badge className='bg-gray-100 text-gray-800'>No</Badge>
                )}
              </div>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Confirmed as Mall</p>
              <div className='mt-1'>
                {farmDetail.isConfirmAsMall ? (
                  <Badge className='bg-green-100 text-green-800'>Yes</Badge>
                ) : (
                  <Badge className='bg-gray-100 text-gray-800'>No</Badge>
                )}
              </div>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Banned Status</p>
              <div className='mt-1'>
                {farmDetail.isBanned ? (
                  <Badge className='bg-red-100 text-red-800'>Banned</Badge>
                ) : (
                  <Badge className='bg-green-100 text-green-800'>Active</Badge>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Seasons */}
        {farmDetail.seasons && farmDetail.seasons.length > 0 && (
          <Card className='p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-6'>
              Active Seasons
            </h3>
            <div className='space-y-4'>
              {farmDetail.seasons.map((season) => (
                <div
                  key={season.id}
                  className='border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition'
                >
                  <div className='flex items-center justify-between mb-3'>
                    <h4 className='font-medium text-gray-900'>
                      {season.seasonName}
                    </h4>
                    <Badge variant='secondary'>{season.status}</Badge>
                  </div>
                  {season.seasonDesc && (
                    <p className='text-sm text-muted-foreground mb-2'>
                      {season.seasonDesc}
                    </p>
                  )}
                  <div className='text-xs text-muted-foreground'>
                    {new Date(season.startDate).toLocaleDateString()} -{' '}
                    {new Date(season.endDate).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Edit Farm Dialog */}
      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) {
            setIsEditingLocation(false);
          }
        }}
      >
        <DialogContent
          className='max-w-2xl flex flex-col'
          style={{
            maxHeight: '90vh',
          }}
        >
          <DialogHeader>
            <DialogTitle>Edit Farm</DialogTitle>
            <DialogDescription>Update farm information.</DialogDescription>
          </DialogHeader>

          <div className='space-y-4 overflow-y-auto flex-1'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='farmName'>Farm Name</Label>
                <Input
                  id='farmName'
                  name='farmName'
                  value={formData.farmName}
                  onChange={handleInputChange}
                  placeholder='Enter farm name'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='phone'>Phone</Label>
                <Input
                  id='phone'
                  name='phone'
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder='Enter phone number'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='farmDesc'>Description</Label>
              <Textarea
                id='farmDesc'
                name='farmDesc'
                value={formData.farmDesc}
                onChange={handleInputChange}
                placeholder='Enter farm description'
                rows={3}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='area'>Area</Label>
              <Input
                id='area'
                name='area'
                value={formData.area}
                onChange={handleInputChange}
                placeholder='Enter farm area'
              />
            </div>

            {/* Farm Banner */}
            <div className='space-y-2'>
              <Label htmlFor='banner' className='text-sm font-medium'>
                Farm Banner
              </Label>
              {bannerPreview ? (
                <div className='space-y-2'>
                  <div className='relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden'>
                    <img
                      src={bannerPreview}
                      alt='Banner Preview'
                      className='w-full h-full object-cover'
                    />
                    <button
                      type='button'
                      onClick={handleRemoveBanner}
                      className='absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600'
                      disabled={isLoading}
                    >
                      <X className='h-4 w-4' />
                    </button>
                  </div>
                  <p className='text-xs text-gray-600'>
                    {bannerFile ? (
                      <>
                        {bannerFile.name} (
                        {`${((bannerFile.size || 0) / 1024 / 1024).toFixed(2)}`}{' '}
                        MB)
                      </>
                    ) : (
                      'Current banner image'
                    )}
                  </p>
                  <input
                    id='banner'
                    type='file'
                    accept='image/*'
                    onChange={handleBannerChange}
                    className='block w-full text-sm text-gray-600'
                    disabled={isLoading}
                  />
                </div>
              ) : (
                <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition'>
                  <input
                    id='banner'
                    type='file'
                    accept='image/*'
                    onChange={handleBannerChange}
                    className='hidden'
                    disabled={isLoading}
                  />
                  <label htmlFor='banner' className='cursor-pointer block'>
                    <Upload className='h-8 w-8 mx-auto mb-2 text-gray-600' />
                    <p className='text-sm text-gray-600 font-medium'>
                      Click to upload banner
                    </p>
                    <p className='text-xs text-gray-500 mt-1'>
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </label>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsEditOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateSubmit} disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Farm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Farm Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Farm</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this farm? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsDeleteOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={handleDeleteSubmit}
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete Farm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
