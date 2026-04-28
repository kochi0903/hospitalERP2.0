import { useState, useEffect } from "react";
import { Calendar, User, IndianRupee, Plus, Trash2 } from "lucide-react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { useSelector, useDispatch } from "react-redux";
import {
  useCreateBillMutation,
  useUpdateBillMutation,
} from "../../services/billingApi";
import {
  setMessage,
  setError,
  clearSelectedBill,
} from "../../store/billingSlice";
import { useGetSettingsQuery } from "../../services/settingsApi";

const BillingForm = ({ onSuccess, onClose: onCancel }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { selectedBill } = useSelector((state) => state.bill);
  const [createBill, { isLoading: isCreating }] = useCreateBillMutation();
  const [updateBill, { isLoading: isUpdating }] = useUpdateBillMutation();
  const [showSuccess, setShowSuccess] = useState(false);

  const isEditing = !!selectedBill;

  // Get current month abbreviation
  const getMonthPrefix = () => {
    const monthAbbr = [
      "Jan-",
      "Feb-",
      "Mar-",
      "Apr-",
      "May-",
      "Jun-",
      "Jul-",
      "Aug-",
      "Sep-",
      "Oct-",
      "Nov-",
      "Dec-",
    ];
    return monthAbbr[new Date().getMonth()];
  };

  const [formData, setFormData] = useState({
    patientName: "",
    patientId: getMonthPrefix(),
    admissionDate: new Date().toISOString().split("T")[0],
    dischargeDate: new Date().toISOString().split("T")[0],
    paymentMethod: "cash",
    address: "",
    doctorName: "",
    services: [
      { description: "Bed Rent for ", cost: 0 },
      { description: "OT Charge ", cost: 0 },
      { description: "LR Charge ", cost: 0 },
      { description: "Oxygen ", cost: 0 },
      { description: "IV Charge ", cost: 0 },
      { description: "Dressing Charge ", cost: 0 },
      { description: "Pulsoxymeter Charge", cost: 0 },
      { description: "Service Charge ", cost: 0 },
      { description: "Diatherame Charge ", cost: 0 },
    ],
    status: "paid",
  });

  const [errors, setErrors] = useState({});

  // Fetch admin-configured data entry window
  const { data: settingsData } = useGetSettingsQuery();
  const dataEntryDays = settingsData?.settings?.dataEntryWindowDays || 7;
  const isAdmin = user?.role === "admin";

  // Calculate min and max dates for the date input
  const today = new Date();
  const maxDate = today.toISOString().split("T")[0];
  // Admins bypass the date restriction
  const minDate = isAdmin
    ? new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    : new Date(Date.now() - dataEntryDays * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  // Populate form when editing
  useEffect(() => {
    if (isEditing && selectedBill) {
      setFormData({
        patientName: selectedBill.patientName || "",
        patientId: selectedBill.patientId || getMonthPrefix(),
        admissionDate: selectedBill.admissionDate
          ? selectedBill.admissionDate.split("T")[0]
          : new Date().toISOString().split("T")[0],
        dischargeDate: selectedBill.dischargeDate
          ? selectedBill.dischargeDate.split("T")[0]
          : new Date().toISOString().split("T")[0],
        paymentMethod: selectedBill.paymentMethod || "cash",
        services: selectedBill.services?.map((s) => ({
          description: s.description,
          cost: s.cost.toString(),
        })) || [{ description: "", cost: "" }],
        address: selectedBill.address || "",
        doctorName: selectedBill.doctorName || "",
        status: selectedBill.status || "paid",
      });
    }
  }, [isEditing, selectedBill]);

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

  const handleServiceChange = (index, field, value) => {
    const newServices = [...formData.services];
    newServices[index][field] = value;
    setFormData((prev) => ({ ...prev, services: newServices }));

    // Clear service errors when edited
    const errorKey = `services.${index}.${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const addService = () => {
    setFormData((prev) => ({
      ...prev,
      services: [...prev.services, { description: "", cost: "" }],
    }));
  };

  const removeService = (index) => {
    if (formData.services.length <= 1) return;

    const newServices = [...formData.services];
    newServices.splice(index, 1);
    setFormData((prev) => ({ ...prev, services: newServices }));

    // Clear any errors for this service
    const newErrors = { ...errors };
    Object.keys(newErrors).forEach((key) => {
      if (key.startsWith(`services.${index}`)) {
        delete newErrors[key];
      }
    });
    setErrors(newErrors);
  };

  const calculateTotal = () => {
    return formData.services.reduce((sum, service) => {
      const cost = parseFloat(service.cost);
      return sum + (isNaN(cost) ? 0 : cost);
    }, 0);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.patientName.trim()) {
      newErrors.patientName = "Patient name is required";
    }

    if (!formData.patientId.trim()) {
      newErrors.patientId = "Patient ID is required";
    }

    if (!formData.admissionDate) {
      newErrors.admissionDate = "Admission Date is required";
    }

    if (!formData.dischargeDate) {
      newErrors.dischargeDate = "Discharge Date is required";
    }

    if (!formData.status) {
      newErrors.status = "Status is required";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.doctorName.trim()) {
      newErrors.doctorName = "Doctor name is required";
    }

    if (formData.admissionDate && formData.dischargeDate) {
      if (new Date(formData.dischargeDate) < new Date(formData.admissionDate)) {
        newErrors.dischargeDate =
          "Discharge date cannot be before admission date";
      }
    }

    formData.services.forEach((service, index) => {
      if (!service.description.trim()) {
        newErrors[`services.${index}.description`] =
          "Service description is required";
      }
    });

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = "Payment method is required";
    }

    // Add date range validation
    const selectedDate = new Date(formData.admissionDate);
    const minDateTime = new Date(minDate);
    const maxDateTime = new Date(maxDate);

    if (selectedDate < minDateTime || selectedDate > maxDateTime) {
      newErrors.date = `Date must be within the last ${dataEntryDays} days`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      const billData = {
        patientName: formData.patientName,
        patientId: formData.patientId,
        admissionDate: formData.admissionDate,
        dischargeDate: formData.dischargeDate,
        paymentMethod: formData.paymentMethod,
        address: formData.address,
        doctorName: formData.doctorName,
        services: formData.services.map((service) => ({
          description: service.description,
          cost: parseFloat(service.cost),
        })),
        totalAmount: calculateTotal(),
        status: formData.status,
        createdBy: user?.id || "",
      };

      if (isEditing) {
        await updateBill({ id: selectedBill._id, ...billData }).unwrap();
        dispatch(setMessage("Bill updated successfully"));
      } else {
        await createBill(billData).unwrap();
        dispatch(setMessage("Bill created successfully"));
      }

      setShowSuccess(true);
      setFormData({
        patientName: "",
        patientId: "",
        admissionDate: new Date().toISOString().split("T")[0],
        dischargeDate: new Date().toISOString().split("T")[0],
        services: [{ description: "", cost: "" }],
        address: "",
        doctorName: "",
        status: "paid",
      });
      dispatch(clearSelectedBill());
      if (onSuccess) {
        onSuccess();
      }
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error) {
      dispatch(
        setError(
          error?.data?.error ||
            `Failed to ${isEditing ? "update" : "create"} bill: `,
        ),
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? "Edit Patient Bill" : "Generate Patient Bill"}
          </h2>
          <button
            onClick={() => {
              dispatch(clearSelectedBill());
              if (onCancel) onCancel();
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        {showSuccess && (
          <div className="mb-4 p-3 bg-green-50 text-green-800 rounded-md border border-green-200">
            Bill generated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div>
                <Input
                  id="patientName"
                  name="patientName"
                  type="text"
                  value={formData.patientName}
                  onChange={handleChange}
                  icon={<User size={16} className="text-gray-400" />}
                  placeholder="Patient Name"
                  className={`${errors.patientName ? "border-red-300" : "border-gray-300"}`}
                />
              </div>
              {errors.patientName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.patientName}
                </p>
              )}
            </div>

            <div>
              <div>
                <Input
                  id="patientId"
                  name="patientId"
                  type="text"
                  value={formData.patientId}
                  onChange={handleChange}
                  icon={<User size={16} className="text-gray-400" />}
                  placeholder="Patient ID"
                  className={`${errors.patientId ? "border-red-300" : "border-gray-300"}`}
                />
              </div>
              {errors.patientId && (
                <p className="mt-1 text-sm text-red-600">{errors.patientId}</p>
              )}
            </div>
          </div>

          {/* Address field */}
          <div>
            <div className="relative rounded-md shadow-sm">
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`block w-full pl-3 pr-3 py-2 sm:text-sm border ${
                  errors.address ? "border-red-300" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Patient Address"
              />
            </div>
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address}</p>
            )}
          </div>

          {/* Doctor Name field */}
          <div>
            <div className="relative rounded-md shadow-sm">
              <input
                type="text"
                id="doctorName"
                name="doctorName"
                value={formData.doctorName}
                onChange={handleChange}
                className={`block w-full pl-3 pr-3 py-2 sm:text-sm border ${
                  errors.doctorName ? "border-red-300" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Doctor Name"
              />
            </div>
            {errors.doctorName && (
              <p className="mt-1 text-sm text-red-600">{errors.doctorName}</p>
            )}
          </div>

          {/* Admission and Discharge Dates Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="admissionDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Admission Date
              </label>
              <div>
                <Input
                  id="admissionDate"
                  name="admissionDate"
                  type="date"
                  value={formData.admissionDate}
                  min={minDate}
                  max={maxDate}
                  onChange={handleChange}
                  icon={<Calendar size={16} className="text-gray-400" />}
                  className={`${errors.admissionDate ? "border-red-300" : "border-gray-300"}`}
                />
              </div>
              {errors.admissionDate && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.admissionDate}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="dischargeDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Discharge Date
              </label>
              <div>
                <Input
                  id="dischargeDate"
                  name="dischargeDate"
                  type="date"
                  value={formData.dischargeDate}
                  min={formData.admissionDate}
                  max={maxDate}
                  onChange={handleChange}
                  icon={<Calendar size={16} className="text-gray-400" />}
                  className={`${errors.dischargeDate ? "border-red-300" : "border-gray-300"}`}
                />
              </div>
              {errors.dischargeDate && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.dischargeDate}
                </p>
              )}
            </div>
          </div>

          {/* Payment Method and Status Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="paymentMethod"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Payment Method
              </label>
              <div className="flex gap-4 items-center">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={formData.paymentMethod === "cash"}
                    onChange={handleChange}
                    className="form-radio text-blue-600"
                  />
                  <span className="ml-2">Cash</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank"
                    checked={formData.paymentMethod === "bank"}
                    onChange={handleChange}
                    className="form-radio text-blue-600"
                  />
                  <span className="ml-2">UPI/Bank</span>
                </label>
              </div>
              {errors.paymentMethod && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.paymentMethod}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <div className="flex gap-4 items-center">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="paid"
                    checked={formData.status === "paid"}
                    onChange={handleChange}
                    className="form-radio text-blue-600"
                  />
                  <span className="ml-2">Paid</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="due"
                    checked={formData.status === "due"}
                    onChange={handleChange}
                    className="form-radio text-blue-600"
                  />
                  <span className="ml-2">Due</span>
                </label>
              </div>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status}</p>
              )}
            </div>
          </div>

          {/* Services Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">
                Services & Charges
              </label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                icon={<Plus size={16} />}
                onClick={addService}
              >
                Add Service
              </Button>
            </div>

            {formData.services.map((service, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="flex-1">
                  <input
                    type="text"
                    value={service.description}
                    onChange={(e) =>
                      handleServiceChange(index, "description", e.target.value)
                    }
                    className={`block w-full px-3 py-1 sm:text-sm border ${
                      errors[`services.${index}.description`]
                        ? "border-red-300"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Service Description"
                  />
                  {errors[`services.${index}.description`] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors[`services.${index}.description`]}
                    </p>
                  )}
                </div>

                <div className="w-1/3">
                  <div>
                    <Input
                      type="number"
                      value={service.cost}
                      onChange={(e) =>
                        handleServiceChange(index, "cost", e.target.value)
                      }
                      min="0"
                      step="0.01"
                      icon={<IndianRupee size={16} className="text-gray-400" />}
                      placeholder="0.00"
                      className={`${errors[`services.${index}.cost`] ? "border-red-300" : "border-gray-300"}`}
                    />
                  </div>
                  {errors[`services.${index}.cost`] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors[`services.${index}.cost`]}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => removeService(index)}
                  disabled={formData.services.length <= 1}
                  className={`p-2 rounded-md ${
                    formData.services.length <= 1
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-red-500 hover:bg-red-50"
                  }`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-700">
                Total Amount:
              </span>
              <span className="text-lg font-bold text-blue-900">
                ₹{calculateTotal().toFixed(2)}
              </span>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isCreating || isUpdating}
                className="flex-1"
              >
                {isEditing
                  ? isUpdating
                    ? "Updating..."
                    : "Update Bill"
                  : isCreating
                    ? "Generating..."
                    : "Generate Bill"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BillingForm;
