import { useState } from "react";
import { ArrowLeft, User, Mail, Phone, Shield, Edit2, Save } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface AdminInfo {
  name: string;
  email: string;
  phone: string;
  role: string;
}

export function AdminProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [adminInfo, setAdminInfo] = useState<AdminInfo>({
    name: "Admin User",
    email: "admin@agriconnect.com",
    phone: "+1 (555) 999-0000",
    role: "System Administrator",
  });
  const navigate = useNavigate();
  const onBack = () => {
    navigate("/admin");
  };

  const [editedInfo, setEditedInfo] = useState<AdminInfo>(adminInfo);

  const handleSave = () => {
    if (!editedInfo.name || !editedInfo.email || !editedInfo.phone || !editedInfo.role) {
      toast.error("Please fill in all required fields");
      return;
    }
    setAdminInfo(editedInfo);
    setIsEditing(false);
    toast.success("Profile updated successfully");
  };

  const handleCancel = () => {
    setEditedInfo(adminInfo);
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-6">
        <ArrowLeft className="mr-2 w-4 h-4" />
        Back to Dashboard
      </Button>

      <div className="max-w-3xl">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="w-24 h-24">
                 <AvatarImage src={null} />
                 <AvatarFallback className="bg-green-600 text-white text-2xl">
                  {getInitials(adminInfo.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left">
                <h2 className="mb-2">{adminInfo.name}</h2>
                <div className="flex items-center gap-2 justify-center md:justify-start mb-4">
                  <Shield className="w-4 h-4 text-green-600" />
                  <p className="text-muted-foreground">{adminInfo.role}</p>
                </div>
                {!isEditing && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Edit2 className="mr-2 w-4 h-4" />
                    Edit Profile
                  </Button>
                )}
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
                ? "Update your personal details below"
                : "View your administrator account information"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                {isEditing ? (
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      value={editedInfo.name}
                      onChange={(e) =>
                        setEditedInfo({ ...editedInfo, name: e.target.value })
                      }
                      className="pl-10"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-400" />
                    <span>{adminInfo.name}</span>
                  </div>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                {isEditing ? (
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={editedInfo.email}
                      onChange={(e) =>
                        setEditedInfo({ ...editedInfo, email: e.target.value })
                      }
                      className="pl-10"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span>{adminInfo.email}</span>
                  </div>
                )}
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                {isEditing ? (
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      value={editedInfo.phone}
                      onChange={(e) =>
                        setEditedInfo({ ...editedInfo, phone: e.target.value })
                      }
                      className="pl-10"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span>{adminInfo.phone}</span>
                  </div>
                )}
              </div>

              {/* Role Field (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span>{adminInfo.role}</span>
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

        {/* Security Settings */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Enable Two-Factor Authentication
            </Button>
            <Button variant="outline" className="w-full justify-start">
              View Login History
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
