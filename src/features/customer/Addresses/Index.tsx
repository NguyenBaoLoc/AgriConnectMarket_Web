import { useEffect, useState } from 'react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '../../../components/ui/dialog';
import {
  getAddressesMe,
  addAddress,
  updateAddress,
  deleteAddress,
  type AddressItem,
  setDefaultAddress,
} from './api';
import OpenApiService from './openApiService';
import { Trash2, Edit2, Plus, MapPin } from 'lucide-react';

function AddressForm({
  initial,
  onCancel,
  onSave,
}: {
  initial?: Partial<AddressItem>;
  onCancel: () => void;
  onSave: (data: Partial<AddressItem>) => void;
}) {
  const [province, setProvince] = useState(initial?.province || '');
  const [district, setDistrict] = useState(initial?.district || '');
  const [ward, setWard] = useState(initial?.ward || '');
  const [detail, setDetail] = useState(initial?.detail || '');
  const [isDefault, setIsDefault] = useState(initial?.isDefault || false);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<
    string | null
  >(null);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<
    string | null
  >(null);
  const [selectedWardCode, setSelectedWardCode] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadProvinces = async () => {
      try {
        const list = await OpenApiService.getProvinces();
        if (!mounted) return;
        setProvinces(list || []);

        // If editing and initial province exists, try to map to code
        if (initial?.province) {
          const match = list.find(
            (p: any) =>
              p.name === initial.province ||
              p.codename === initial.province ||
              p.name.includes(initial.province)
          );
          if (match) {
            setSelectedProvinceCode(String(match.code));
            setProvince(match.name);
            // load districts
            const dList = await OpenApiService.getDistricts(match.code);
            if (!mounted) return;
            setDistricts(dList || []);
            if (initial?.district) {
              const dMatch = dList.find(
                (d: any) =>
                  d.name === initial.district ||
                  d.codename === initial.district ||
                  d.name.includes(initial.district)
              );
              if (dMatch) {
                setSelectedDistrictCode(String(dMatch.code));
                setDistrict(dMatch.name);
                const wList = await OpenApiService.getWards(dMatch.code);
                if (!mounted) return;
                setWards(wList || []);
                if (initial?.ward) {
                  const wMatch = wList.find(
                    (w: any) =>
                      w.name === initial.ward ||
                      w.codename === initial.ward ||
                      w.name.includes(initial.ward)
                  );
                  if (wMatch) {
                    setWard(wMatch.name);
                    setSelectedWardCode(String(wMatch.code));
                  }
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('OpenApi load error', err);
      }
    };
    loadProvinces();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className='space-y-3'>
      <div>
        <Label>Province</Label>
        <select
          className='w-full border px-2 py-2 rounded'
          value={selectedProvinceCode || ''}
          onChange={async (e) => {
            const code = e.target.value || null;
            setSelectedProvinceCode(code);
            const selected = provinces.find(
              (p) => String(p.code) === String(code)
            );
            setProvince(selected?.name || '');
            setDistrict('');
            setWard('');
            setDistricts([]);
            setWards([]);
            setSelectedDistrictCode(null);
            setSelectedWardCode(null);
            if (code) {
              try {
                const dList = await OpenApiService.getDistricts(code);
                setDistricts(dList || []);
              } catch (err) {
                console.error('Error loading districts', err);
              }
            }
          }}
        >
          <option value=''>Select province</option>
          {provinces.map((p) => (
            <option key={String(p.code)} value={String(p.code)}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label>District</Label>
        <select
          className='w-full border px-2 py-2 rounded'
          value={selectedDistrictCode || ''}
          onChange={async (e) => {
            const code = e.target.value || null;
            setSelectedDistrictCode(code);
            const sel = districts.find((d) => String(d.code) === String(code));
            setDistrict(sel?.name || '');
            setWard('');
            setWards([]);
            setSelectedWardCode(null);
            if (code) {
              try {
                const wList = await OpenApiService.getWards(code);
                setWards(wList || []);
              } catch (err) {
                console.error('Error loading wards', err);
              }
            }
          }}
        >
          <option value=''>Select district</option>
          {districts.map((d) => (
            <option key={String(d.code)} value={String(d.code)}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label>Ward</Label>
        <select
          className='w-full border px-2 py-2 rounded'
          value={selectedWardCode || ''}
          onChange={(e) => {
            const code = e.target.value || null;
            setSelectedWardCode(code);
            const sel = wards.find((w) => String(w.code) === String(code));
            setWard(sel?.name || '');
          }}
        >
          <option value=''>Select ward</option>
          {wards.map((w) => (
            <option key={String(w.code)} value={String(w.code)}>
              {w.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label>Detail</Label>
        <Input
          value={detail}
          onChange={(e: any) => setDetail(e.target.value)}
        />
      </div>
      <div className='flex items-center gap-2'>
        <input
          type='checkbox'
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
        />
        <span>Set as default</span>
      </div>
      <div className='flex justify-end gap-2 pt-4'>
        <Button variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={() =>
            onSave({ province, district, ward, detail, isDefault })
          }
        >
          Save
        </Button>
      </div>
    </div>
  );
}

export function AddressesPage() {
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<AddressItem | null>(null);
  const [viewing, setViewing] = useState<AddressItem | null>(null);

  const fetch = async () => {
    try {
      setLoading(true);
      const resp = await getAddressesMe();
      if (resp.success) setAddresses(resp.data || []);
      else toast.error(resp.message || 'Failed to load addresses');
    } catch (err) {
      console.error(err);
      toast.error('Error loading addresses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const handleAdd = () => {
    setEditing(null);
    setShowDialog(true);
  };
  const handleEdit = (a: AddressItem) => {
    setEditing(a);
    setShowDialog(true);
  };
  const handleView = (a: AddressItem) => {
    setViewing(a);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this address?')) return;
    try {
      const resp = await deleteAddress(id);
      if (resp.success) {
        toast.success('Address deleted');
        fetch();
      } else toast.error(resp.message || 'Failed to delete');
    } catch (err) {
      console.error(err);
      toast.error('Error deleting address');
    }
  };

  const handleSave = async (data: Partial<AddressItem>) => {
    try {
      if (editing) {
        const resp = await updateAddress(editing.id, data);
        if (resp.success) {
          toast.success('Address updated');
          setShowDialog(false);
          fetch();
        } else toast.error(resp.message || 'Failed to update address');
      } else {
        const payload = { ...(data as any) };
        const resp = await addAddress(payload as any);
        if (resp.success) {
          toast.success('Address added');
          setShowDialog(false);
          fetch();
        } else toast.error(resp.message || 'Failed to add address');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error saving address');
    }
  };

  const handleSetDefault = async (a: AddressItem) => {
    try {
      const resp = await setDefaultAddress(a.id);
      if (resp.success) {
        toast.success('Default address set');
        fetch();
      } else toast.error(resp.message || 'Failed to set default');
    } catch (err) {
      console.error(err);
      toast.error('Error setting default');
    }
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-2xl font-semibold'>Manage Addresses</h1>
        <div className='flex items-center gap-2'>
          <Button onClick={handleAdd} className='flex items-center gap-2'>
            <Plus /> Add Address
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {loading && <p>Loading...</p>}
        {!loading && addresses.length === 0 && (
          <p className='text-gray-500'>No addresses yet</p>
        )}
        {!loading &&
          addresses.map((a) => (
            <Card key={a.id} className='p-4'>
              <div className='flex justify-between items-start'>
                <div>
                  <h3 className='font-semibold'>
                    {a.province} / {a.district}
                  </h3>
                  <p className='text-sm text-gray-600'>{a.detail}</p>
                  <p className='text-sm text-gray-500'>{a.ward}</p>
                  {a.isDefault && (
                    <div className='mt-2 text-sm text-green-700'>Default</div>
                  )}
                </div>
                <div className='flex flex-col items-end gap-2'>
                  <div className='flex gap-2'>
                    <Button
                      variant='ghost'
                      onClick={() => handleView(a)}
                      title='View'
                    >
                      <MapPin />
                    </Button>
                    <Button
                      variant='ghost'
                      onClick={() => handleEdit(a)}
                      title='Edit'
                    >
                      <Edit2 />
                    </Button>
                    <Button
                      variant='ghost'
                      onClick={() => handleDelete(a.id)}
                      title='Delete'
                    >
                      <Trash2 />
                    </Button>
                  </div>
                  {!a.isDefault && (
                    <Button onClick={() => handleSetDefault(a)}>
                      Set Default
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
      </div>

      <Dialog
        open={showDialog}
        onOpenChange={(open) => {
          if (!open) setShowDialog(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit Address' : 'Add Address'}
            </DialogTitle>
          </DialogHeader>
          <AddressForm
            initial={editing || undefined}
            onCancel={() => setShowDialog(false)}
            onSave={handleSave}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(viewing)}
        onOpenChange={(open) => {
          if (!open) setViewing(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Address Details</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className='space-y-3'>
              <p>
                <strong>Province:</strong> {viewing.province}
              </p>
              <p>
                <strong>District:</strong> {viewing.district}
              </p>
              <p>
                <strong>Ward:</strong> {viewing.ward}
              </p>
              <p>
                <strong>Detail:</strong> {viewing.detail}
              </p>
              <p>
                <strong>Default:</strong> {viewing.isDefault ? 'Yes' : 'No'}
              </p>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='outline'>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddressesPage;
