import { useState, useEffect } from "react";
import {
  User,
  Lock,
  Trash2,
  Mail,
  Phone,
  Edit2,
  Save,
  Leaf,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  getFarmerProfile,
  updateFarmerProfile,
  deleteFarmerAccount,
} from "./api";
import type { FarmerProfileInfo } from "./types";

const defaultFarmerInfo: FarmerProfileInfo = {
  fullname: "",
  email: "",
  phone: "",
  avatarUrl: "",
  accountId: "",
  createdAt: "",
  id: "",
};

export function FarmerProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [farmerInfo, setFarmerInfo] =
    useState<FarmerProfileInfo>(defaultFarmerInfo);
  const [editedInfo, setEditedInfo] = useState<FarmerProfileInfo>(farmerInfo);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Password form states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Fetch farmer profile on component mount
  useEffect(() => {
    const fetchFarmerProfile = async () => {
      try {
        setIsLoading(true);
        const response = await getFarmerProfile();
        if (response.success && response.data) {
          setFarmerInfo(response.data);
          setEditedInfo(response.data);
        } else {
          toast.error(`Failed to load profile: ${response.message}`);
        }
      } catch (error) {
        console.error("Error fetching farmer profile:", error);
        toast.error("Failed to load profile. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFarmerProfile();
  }, []);

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    toast.success("Password changed successfully");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSave = async () => {
    if (!editedInfo.fullname || !editedInfo.email || !editedInfo.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const response = await updateFarmerProfile(editedInfo);
      if (response.success) {
        setFarmerInfo(editedInfo);
        setIsEditing(false);
        toast.success("Profile updated successfully");
      } else {
        toast.error(`Update failed: ${response.message}`);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  const handleCancel = () => {
    setEditedInfo(farmerInfo);
    setIsEditing(false);
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await deleteFarmerAccount();
      if (response.success) {
        toast.success("Account deleted successfully");
        setShowDeleteDialog(false);
        setTimeout(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          localStorage.removeItem("role");
          localStorage.removeItem("farmId");
          navigate("/");
          window.location.reload();
        }, 1000);
      } else {
        toast.error(`Delete failed: ${response.message}`);
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account. Please try again.");
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={farmerInfo.avatarUrl || undefined} />
                <AvatarFallback className="bg-green-600 text-white text-2xl font-bold">
                  {getInitials(farmerInfo.fullname)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {farmerInfo.fullname}
                </h2>
                <div className="flex items-center gap-2 justify-center md:justify-start mb-3">
                  <Leaf className="w-4 h-4 text-green-600" />
                  <p className="text-muted-foreground text-sm">
                    Farmer Account
                  </p>
                </div>
                <p className="text-muted-foreground mb-4">{farmerInfo.email}</p>
                <div className="flex gap-2 flex-wrap justify-center md:justify-start">
                  {!isEditing && activeTab === "profile" && (
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
                    onClick={() => setShowDeleteDialog(true)}
                    className="border-red-600 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="mr-2 w-4 h-4" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs and Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-0">
              <nav className="space-y-0">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full flex items-center gap-3 px-4 py-4 rounded-t-lg transition-colors border-b ${
                    activeTab === "profile"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "text-gray-700 hover:bg-gray-50 border-gray-200"
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">Profile</span>
                </button>
                <button
                  onClick={() => setActiveTab("password")}
                  className={`w-full flex items-center gap-3 px-4 py-4 rounded-b-lg transition-colors ${
                    activeTab === "password"
                      ? "bg-green-50 text-green-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Lock className="w-5 h-5" />
                  <span className="font-medium">Change Password</span>
                </button>
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "profile" && (
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    {isEditing
                      ? "Update your profile details below"
                      : "View and manage your profile information"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Full Name Field */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="fullname"
                        className="text-gray-700 font-medium"
                      >
                        Full Name
                      </Label>
                      {isEditing ? (
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="fullname"
                            type="text"
                            value={editedInfo.fullname}
                            onChange={(e) =>
                              setEditedInfo({
                                ...editedInfo,
                                fullname: e.target.value,
                              })
                            }
                            className="pl-10"
                            placeholder="Enter your full name"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <User className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-900">
                            {farmerInfo.fullname}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-gray-700 font-medium"
                      >
                        Email Address
                      </Label>
                      {isEditing ? (
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            value={editedInfo.email}
                            onChange={(e) =>
                              setEditedInfo({
                                ...editedInfo,
                                email: e.target.value,
                              })
                            }
                            className="pl-10"
                            placeholder="Enter your email"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <Mail className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-900">
                            {farmerInfo.email}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Phone Field */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="phone"
                        className="text-gray-700 font-medium"
                      >
                        Phone Number
                      </Label>
                      {isEditing ? (
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="phone"
                            type="tel"
                            value={editedInfo.phone}
                            onChange={(e) =>
                              setEditedInfo({
                                ...editedInfo,
                                phone: e.target.value,
                              })
                            }
                            className="pl-10"
                            placeholder="Enter your phone number"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <Phone className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-900">
                            {farmerInfo.phone}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {isEditing && (
                      <div className="flex gap-3 pt-6 border-t">
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
            )}

            {activeTab === "password" && (
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Current Password */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="current-password"
                        className="text-gray-700 font-medium"
                      >
                        Current Password
                      </Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                      />
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="new-password"
                        className="text-gray-700 font-medium"
                      >
                        New Password
                      </Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Must be at least 8 characters long
                      </p>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="confirm-password"
                        className="text-gray-700 font-medium"
                      >
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4 border-t">
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={handleChangePassword}
                      >
                        <Lock className="mr-2 w-4 h-4" />
                        Change Password
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Delete Account Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              Delete Account
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Deleting your account will
              permanently remove all your data including farms, seasons,
              products, and production logs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
