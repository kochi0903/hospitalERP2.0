import { useState } from "react";
import { User, Mail, Lock, UserCheck } from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Input from "../ui/Input";

const UserForm = ({ onSuccess, editUser }) => {
  const isEditMode = !!editUser;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: editUser?.name || "",
    email: editUser?.email || "",
    password: "",
    role: editUser?.role || "accountant",
    department: editUser?.department || "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!isEditMode && !formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (!isEditMode && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.role === "department_head" && !formData.department.trim()) {
      newErrors.department = "Department is required for Department Head";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    // Create the user object
    const newUser = {
      id: editUser?.id || Math.random().toString(36).substring(2, 9),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      ...(formData.role === "department_head" && {
        department: formData.department,
      }),
    };

    // Mock API call - in a real app, this would be an API call
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);

      if (!isEditMode) {
        // Reset form for new user creation
        setFormData({
          name: "",
          email: "",
          password: "",
          role: "accountant",
          department: "",
        });
      }

      // Call onSuccess with the new/updated user
      if (onSuccess) {
        onSuccess(newUser);
      }

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }, 1000);
  };

  return (
    <Card title={isEditMode ? "Edit User" : "Add New User"}>
      {showSuccess && (
        <div className="mb-4 p-3 bg-green-50 text-green-800 rounded-md border border-green-200">
          User {isEditMode ? "updated" : "created"} successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Full Name
          </label>
          <div>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              icon={<User size={16} className="text-gray-400" />}
              placeholder="John Doe"
              className={`${errors.name ? "border-red-300" : "border-gray-300"}`}
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email Address
          </label>
          <div>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              icon={<Mail size={16} className="text-gray-400" />}
              placeholder="user@example.com"
              className={`${errors.email ? "border-red-300" : "border-gray-300"}`}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {!isEditMode && (
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <div>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                icon={<Lock size={16} className="text-gray-400" />}
                placeholder="••••••"
                className={`${errors.password ? "border-red-300" : "border-gray-300"}`}
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>
        )}

        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Role
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserCheck size={16} className="text-gray-400" />
            </div>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-2 sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="admin">Admin</option>
              <option value="accountant">Accountant</option>
              <option value="department_head">Department Head</option>
            </select>
          </div>
        </div>

        {formData.role === "department_head" && (
          <div>
            <label
              htmlFor="department"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Department
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={16} className="text-gray-400" />
              </div>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 py-2 sm:text-sm border ${
                  errors.department ? "border-red-300" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 appearance-none`}
              >
                <option value="">Select Department</option>
                <option value="cardiology">Cardiology</option>
                <option value="neurology">Neurology</option>
                <option value="pediatrics">Pediatrics</option>
                <option value="orthopedics">Orthopedics</option>
                <option value="oncology">Oncology</option>
              </select>
            </div>
            {errors.department && (
              <p className="mt-1 text-sm text-red-600">{errors.department}</p>
            )}
          </div>
        )}

        <div className="pt-4">
          <Button type="submit" isLoading={isSubmitting} className="w-full">
            {isEditMode ? "Update User" : "Create User"}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default UserForm;
