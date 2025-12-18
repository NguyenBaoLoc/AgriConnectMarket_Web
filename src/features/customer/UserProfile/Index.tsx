import { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, Edit2, Save } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../../components/ui/avatar';
import { toast } from 'sonner';
import { OrderHistory } from './components/OrderHistory';
import { DeleteAccountDialog } from './components/DeleteAccountDialog';
import { InfoRow } from './components/InfoRow';
import { InputRow } from './components/InputRow';
import { Footer } from '../components';
import type { Order, UserInfo } from './types';
import {
  deleteUserInfo,
  getOrderList,
  getUserAddress,
  getUserInfo,
  updateUserInfo,
} from './api';
import { getMyFavoriteFarms } from '../FavoriteFarms/api';
import { useNavigate } from 'react-router-dom';

const defaultUserInfo: UserInfo = {
  accountId: '',
  avartarUrl: '',
  createdAt: '',
  createdBy: '',
  email: '',
  fullname: '',
  id: '',
  phone: '',
};
export function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [address, setAddress] = useState<string>('');
  const [userInfo, setUserInfo] = useState<UserInfo>(defaultUserInfo);
  const [orderList, setOrderList] = useState<Order[]>([]);
  const [editedInfo, setEditedInfo] = useState<UserInfo>(userInfo);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [favoriteFarms, setFavoriteFarms] = useState<any[]>([]);
  const navigate = useNavigate();

  function onNavigateToOrders() {
    navigate('/orders');
  }

  function onLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    navigate('/');
    window.location.reload();
  }

  const handleSave = () => {
    if (!editedInfo.fullname || !editedInfo.email || !editedInfo.phone) {
      toast.error('Please fill in all required fields');
      return;
    }
    setIsEditing(false);
    updateUser();
  };

  const updateUser = async () => {
    try {
      const updateResponse = await updateUserInfo(editedInfo);
      if (updateResponse.success) {
        setUserInfo(editedInfo);
        toast.success('Profile updated successfully');
      } else {
        toast.error(`Update profile failed: ${updateResponse.message}`);
      }
    } catch (error) {
      console.error('Unexpected login error:', error);
    }
  };

  const handleCancel = () => {
    setEditedInfo(userInfo);
    setIsEditing(false);
  };

  const handleDeleteAccount = async () => {
    try {
      const deleteResponse = await deleteUserInfo(userInfo);
      if (deleteResponse.success) {
        toast.success('Account deleted successfully');
        setShowDeleteDialog(false);
        setTimeout(() => onLogout(), 1000);
      } else {
        toast.error(`Delete account failed: ${deleteResponse.message}`);
      }
    } catch (error) {
      console.error('Unexpected login error:', error);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userResponse = await getUserInfo();
        if (userResponse.success && userResponse.data) {
          setUserInfo(userResponse.data);
          setEditedInfo(userResponse.data);

          const orderResponse = await getOrderList({
            userId: userResponse.data.id,
          });
          if (orderResponse.success && orderResponse.data) {
            setOrderList(orderResponse.data);
          } else {
            toast.error(`Get order list failed: ${orderResponse.message}`);
          }
        } else {
          toast.error(`Get user info failed: ${userResponse.message}`);
        }
        const addressResponse = await getUserAddress();
        if (addressResponse.success && addressResponse.data) {
          setAddress(addressResponse.data[0].detail);
        } else {
          toast.error(`Get user address failed: ${addressResponse.message}`);
        }

        // Load favorite farms
        try {
          const favRes = await getMyFavoriteFarms();
          if (Array.isArray(favRes)) {
            setFavoriteFarms(favRes);
          } else if (favRes && favRes.success && favRes.data) {
            setFavoriteFarms(favRes.data);
          }
        } catch (err) {
          console.error('Get favorite farms failed', err);
        }
      } catch (error) {
        console.error('Unexpected login error:', error);
      }
    };
    fetchUserInfo();
  }, []);
  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={null} />
                  <AvatarFallback className="bg-green-600 text-white text-2xl">
                    {getInitials(userInfo.fullname)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="mb-2">{userInfo.fullname}</h2>
                  <p className="text-muted-foreground">{userInfo.email}</p>
                  <div className="flex gap-2 mt-4 justify-center md:justify-start">
                    {!isEditing && (
                      <Button
                        onClick={() => setIsEditing(true)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Edit2 className="mr-2 w-4 h-4" />
                        Edit Profile
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={onLogout}
                      className="border-red-600 text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteDialog(true)}
                      className="border-red-600 text-red-600 hover:bg-red-50"
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                {isEditing
                  ? 'Update your personal details below'
                  : 'View your personal information'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  {isEditing ? (
                    <InputRow
                      icon={User}
                      id="name"
                      type="text"
                      value={editedInfo.fullname}
                      onChange={(e) =>
                        setEditedInfo({
                          ...editedInfo,
                          fullname: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <InfoRow icon={User} value={userInfo.fullname} />
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  {isEditing ? (
                    <InputRow
                      icon={Mail}
                      id="email"
                      type="email"
                      value={editedInfo.email}
                      onChange={(e) =>
                        setEditedInfo({ ...editedInfo, email: e.target.value })
                      }
                    />
                  ) : (
                    <InfoRow icon={Mail} value={userInfo.email} />
                  )}
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  {isEditing ? (
                    <InputRow
                      icon={Phone}
                      id="phone"
                      type="tel"
                      value={editedInfo.phone}
                      onChange={(e) =>
                        setEditedInfo({ ...editedInfo, phone: e.target.value })
                      }
                    />
                  ) : (
                    <InfoRow icon={Phone} value={userInfo.phone} />
                  )}
                </div>

                {/* Address Field */}
                <div className="space-y-2">
                  <Label htmlFor="address">Delivery Address</Label>
                  <div className="flex items-center justify-between">
                    <InfoRow icon={MapPin} value={address} />
                    <div>
                      <Button
                        variant="outline"
                        onClick={() => navigate('/addresses')}
                      >
                        Manage Addresses
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSave}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="mr-2 w-4 h-4" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order History Section */}
          <OrderHistory
            orderList={orderList}
            onNavigateToOrders={onNavigateToOrders}
          />
          {/* Delete Account Dialog */}
          <DeleteAccountDialog
            showDeleteDialog={showDeleteDialog}
            setShowDeleteDialog={setShowDeleteDialog}
            handleDeleteAccount={handleDeleteAccount}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}
