import { User, Mail, Phone, MapPin, Edit2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface ProfileData {
  collegeName: string;
  adminName: string;
  email: string;
  phone: string;
  address: string;
  collegeId: string;
  established: string;
  accreditation: string;
  website: string;
}

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);

  // Static college profile data
  const [profileData, setProfileData] = useState<ProfileData>({
    collegeName: "Dr. Ambedkar Institute of Medical Sciences",
    adminName: "Dr. Rajesh Kumar Sharma",
    email: "admin@daims.edu.in",
    phone: "+91 11-2659-7135",
    address: "123 Medical Park Avenue, New Delhi, Delhi 110001",
    collegeId: "DAIMS-2024-0001",
    established: "2010",
    accreditation: "National Board of Accreditation (NBA) - Full Accreditation",
    website: "www.daims.edu.in",
  });

  const [editData, setEditData] = useState<ProfileData>(profileData);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(profileData);
  };

  const handleSave = () => {
    setProfileData(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-8 w-full">
      {/* Edit Controls */}
      <div className="flex items-center gap-3">
        {!isEditing ?
          <Button
            onClick={handleEdit}
            className="bg-primary text-primary-foreground flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </Button>
        : <>
            <Button
              onClick={handleSave}
              className="bg-success text-white flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
          </>
        }
      </div>

      {/* Organization Overview Card */}
      <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-6 py-8 flex items-start gap-6">
          <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {isEditing ?
                <Input
                  value={editData.collegeName}
                  onChange={(e) =>
                    handleInputChange("collegeName", e.target.value)
                  }
                  className="text-xl font-bold bg-white"
                />
              : profileData.collegeName}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              ID:{" "}
              <span className="font-mono font-semibold">
                {profileData.collegeId}
              </span>
            </p>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6 space-y-6">
          {
            !isEditing ?
              // View Mode
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Admin Name */}
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2">
                        Administrator
                      </p>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 mt-1">
                          <User className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <p className="text-base font-semibold text-foreground">
                            {profileData.adminName}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Primary Administrator
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2">
                        Email Address
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Mail className="w-5 h-5 text-primary" />
                        </div>
                        <a
                          href={`mailto:${profileData.email}`}
                          className="text-base text-primary hover:underline font-medium"
                        >
                          {profileData.email}
                        </a>
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2">
                        Phone Number
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                          <Phone className="w-5 h-5 text-success" />
                        </div>
                        <a
                          href={`tel:${profileData.phone}`}
                          className="text-base font-medium text-foreground hover:text-primary"
                        >
                          {profileData.phone}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Address */}
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2">
                        Address
                      </p>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-1">
                          <MapPin className="w-5 h-5 text-destructive" />
                        </div>
                        <p className="text-base text-foreground leading-relaxed">
                          {profileData.address}
                        </p>
                      </div>
                    </div>

                    {/* Website */}
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2">
                        Official Website
                      </p>
                      <a
                        href={`https://${profileData.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base text-primary hover:underline font-medium"
                      >
                        {profileData.website} ↗
                      </a>
                    </div>

                    {/* Established */}
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2">
                        Established
                      </p>
                      <p className="text-base font-semibold text-foreground">
                        {profileData.established}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Accreditation Section */}
                <div className="border-t border-border pt-6">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-3">
                    Accreditation Status
                  </p>
                  <div className="bg-success/10 border border-success/20 rounded-lg p-4 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-success font-bold">✓</span>
                    </div>
                    <div>
                      <p className="font-semibold text-success text-sm">
                        {profileData.accreditation}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Valid through 2028
                      </p>
                    </div>
                  </div>
                </div>
              </>
              // Edit Mode
            : <form className="grid grid-cols-1 md:grid-cols-2 gap-6 space-y-6 md:space-y-0">
                <div className="md:col-span-2">
                  <Label className="text-sm font-semibold mb-2">
                    College Name
                  </Label>
                  <Input
                    value={editData.collegeName}
                    onChange={(e) =>
                      handleInputChange("collegeName", e.target.value)
                    }
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold mb-2">
                    Administrator Name
                  </Label>
                  <Input
                    value={editData.adminName}
                    onChange={(e) =>
                      handleInputChange("adminName", e.target.value)
                    }
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold mb-2">
                    Email Address
                  </Label>
                  <Input
                    type="email"
                    value={editData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold mb-2">
                    Phone Number
                  </Label>
                  <Input
                    value={editData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-sm font-semibold mb-2">Address</Label>
                  <Input
                    value={editData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold mb-2">
                    Established Year
                  </Label>
                  <Input
                    value={editData.established}
                    onChange={(e) =>
                      handleInputChange("established", e.target.value)
                    }
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold mb-2">Website</Label>
                  <Input
                    value={editData.website}
                    onChange={(e) =>
                      handleInputChange("website", e.target.value)
                    }
                    className="mt-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-sm font-semibold mb-2">
                    Accreditation
                  </Label>
                  <Input
                    value={editData.accreditation}
                    onChange={(e) =>
                      handleInputChange("accreditation", e.target.value)
                    }
                    className="mt-2"
                  />
                </div>
              </form>

          }
        </div>
      </div>

      {/* Additional Information Section */}
      {!isEditing && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Organization Statistics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-sm text-muted-foreground">
                  Active Patients
                </span>
                <span className="text-lg font-semibold text-foreground">
                  1,245
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-sm text-muted-foreground">
                  Total Cases
                </span>
                <span className="text-lg font-semibold text-foreground">
                  2,847
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-sm text-muted-foreground">
                  Funds Disbursed
                </span>
                <span className="text-lg font-semibold text-success">
                  ₹2.5 Cr
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Success Rate
                </span>
                <span className="text-lg font-semibold text-foreground">
                  94.2%
                </span>
              </div>
            </div>
          </div>

          {/* Recent Actions */}
          <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Account Settings
            </h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start text-left"
              >
                Change Password
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-left"
              >
                Two-Factor Authentication
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-left"
              >
                Notification Preferences
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-left"
              >
                Download Account Data
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
