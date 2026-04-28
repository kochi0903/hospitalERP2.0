import { useState, useEffect } from "react";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { User, Mail, CalendarDays } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useUpdateUserMutation } from "../services/userApi";
import { resetMessages } from "../store/userSlice";
import { useChangePasswordMutation } from "../services/userApi";
import { useGetSettingsQuery, useUpdateSettingsMutation } from "../services/settingsApi";
import renderPasswordInput from "../components/users/PasswordInput";

const SettingsPage = () => {
  const dispatch = useDispatch();
  const { user, isLoading, message } = useSelector((state) => state.user);
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    department: user?.department || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Admin settings
  const isAdmin = user?.role === "admin";
  const { data: settingsData, isLoading: isLoadingSettings } = useGetSettingsQuery();
  const [updateSettingsMut, { isLoading: isUpdatingSettings }] = useUpdateSettingsMutation();
  const [dataEntryDays, setDataEntryDays] = useState("");
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [settingsError, setSettingsError] = useState("");

  useEffect(() => {
    if (settingsData?.settings?.dataEntryWindowDays !== undefined) {
      setDataEntryDays(settingsData.settings.dataEntryWindowDays.toString());
    }
  }, [settingsData]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    if (passwordError) setPasswordError("");
    if (passwordSuccess) setPasswordSuccess(false);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    dispatch(resetMessages());
    try {
      await updateUser(profileForm).unwrap();
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  const [changePassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSuccess(false);
    setPasswordError("");

    if (passwordForm.currentPassword.length < 6) {
      setPasswordError("Current password must be at least 6 characters");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    try {
      await changePassword({
        oldPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }).unwrap();
      setPasswordSuccess(true);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (err) {
      setPasswordError(err?.data?.message || "Failed to change password");
    }
  };

  useEffect(() => {
    dispatch(resetMessages());
  }, [dispatch]);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage your profile and security
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <Card title="Profile Settings">
          {message && (
            <div
              className={`mb-4 p-3 rounded-lg border text-sm font-medium ${message.includes("success")
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-red-50 text-red-800 border-red-200"
                }`}
            >
              {message}
            </div>
          )}
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Full Name
              </label>
              <div>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  icon={<User size={15} className="text-slate-400" />}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Email Address
              </label>
              <div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  disabled={true}
                  icon={<Mail size={15} className="text-slate-400" />}
                  className="bg-slate-50 text-slate-500 border-slate-200"
                />
              </div>
            </div>
            <div className="pt-2">
              <Button type="submit" isLoading={isUpdating}>
                Save Changes
              </Button>
            </div>
          </form>
        </Card>

        {/* Password Settings */}
        <Card title="Change Password">
          {passwordSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 text-sm font-medium">
              Password updated successfully!
            </div>
          )}
          {passwordError && (
            <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-lg border border-red-200 text-sm font-medium">
              {passwordError}
            </div>
          )}
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {renderPasswordInput(
              "currentPassword",
              "currentPassword",
              passwordForm.currentPassword,
              handlePasswordChange,
              showCurrentPassword,
              () => setShowCurrentPassword(!showCurrentPassword),
              "Current Password",
            )}
            {renderPasswordInput(
              "newPassword",
              "newPassword",
              passwordForm.newPassword,
              handlePasswordChange,
              showNewPassword,
              () => setShowNewPassword(!showNewPassword),
              "New Password",
              "••••••",
              "Password must be at least 6 characters.",
            )}
            {renderPasswordInput(
              "confirmPassword",
              "confirmPassword",
              passwordForm.confirmPassword,
              handlePasswordChange,
              showConfirmPassword,
              () => setShowConfirmPassword(!showConfirmPassword),
              "Confirm New Password",
            )}
            <div className="pt-2">
              <Button type="submit" isLoading={isChangingPassword}>
                Update Password
              </Button>
            </div>
          </form>
        </Card>

        {/* Admin Settings */}

        {isAdmin && (
          <Card title="Data Entry Window" subtitle="Control how far back staff can enter data">
            {settingsSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 text-sm font-medium">
                Setting updated successfully!
              </div>
            )}
            {settingsError && (
              <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-lg border border-red-200 text-sm font-medium">
                {settingsError}
              </div>
            )}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSettingsSuccess(false);
                setSettingsError("");
                const numVal = parseInt(dataEntryDays, 10);
                if (isNaN(numVal) || numVal < 1 || numVal > 365) {
                  setSettingsError("Value must be between 1 and 365 days");
                  return;
                }
                try {
                  await updateSettingsMut({
                    key: "dataEntryWindowDays",
                    value: numVal,
                  }).unwrap();
                  setSettingsSuccess(true);
                  setTimeout(() => setSettingsSuccess(false), 3000);
                } catch (err) {
                  setSettingsError(err?.data?.error || "Failed to update setting");
                }
              }}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="dataEntryDays"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Allowed Days (past)
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CalendarDays size={15} className="text-slate-400" />
                    </div>
                    <input
                      id="dataEntryDays"
                      type="number"
                      min="1"
                      max="365"
                      value={dataEntryDays}
                      onChange={(e) => setDataEntryDays(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 sm:text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g. 7"
                    />
                  </div>
                  <span className="text-sm text-slate-500 whitespace-nowrap">days</span>
                </div>
                <p className="mt-1.5 text-xs text-slate-400">
                  Accountants can only select dates within this many days in the past when creating expenses or bills.
                </p>
              </div>
              <div className="pt-2">
                <Button type="submit" isLoading={isUpdatingSettings}>
                  Save Setting
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>


    </div>
  );
};

export default SettingsPage;
