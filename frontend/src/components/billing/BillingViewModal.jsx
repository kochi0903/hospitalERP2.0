import React from "react";
import { X, Calendar, User, FileText, IndianRupee } from "lucide-react";
import {
  formatCurrency,
  convertDateToReadableString,
} from "../../utils/formatter";
import { FaAddressBook } from "react-icons/fa";

const BillingViewModal = ({ isOpen, bill, onClose }) => {
  if (!isOpen || !bill) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative flex flex-col">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={18} />
        </button>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Bill Details
        </h2>

        <div className="space-y-4 overflow-y-auto flex-1">
          {/* Patient Information */}
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-lg">{bill.patientName}</span>
            </div>
            <div className="text-sm text-gray-600 ml-7">
              Patient ID: {bill.patientId}
            </div>
          </div>

          {/* Bill Amount */}
          <div className="flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-green-600" />
            <span className="font-bold text-lg">
              {formatCurrency(bill.totalAmount)}
            </span>
          </div>

          {/* Date */}
          <div className="flex items-center gap-4 text-gray-700">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                Adm:{" "}
                {bill.admissionDate
                  ? convertDateToReadableString(bill.admissionDate)
                  : "-"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span>
                Dis:{" "}
                {bill.dischargeDate
                  ? convertDateToReadableString(bill.dischargeDate)
                  : "-"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <FaAddressBook className="w-4 h-4" />
            <span>{bill.address ? bill.address : "N/A"}</span>
          </div>

          {/* Status */}
          <div className="flex items-center gap-4 text-gray-700">
            <div className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              <span
                className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full
              ${
                bill.status === "paid"
                  ? "bg-green-100 text-green-800"
                  : bill.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
              >
                {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Payment:</span>
              <span className="inline-flex px-2 text-xs font-semibold leading-5 rounded-full bg-green-100 text-green-800">
                {bill.paymentMethod
                  ? bill.paymentMethod.charAt(0).toUpperCase() +
                    bill.paymentMethod.slice(1): "N/A"}
              </span>
            </div>
          </div>
          {/* Services */}
          <div className="mt-4">
            <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Services</span>
            </h3>
            <div className="border rounded-md overflow-hidden max-h-[40vh] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Description
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Cost
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bill.services &&
                    bill.services.map((service, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {service.description}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatCurrency(service.cost)}
                        </td>
                      </tr>
                    ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      Total
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      {formatCurrency(bill.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingViewModal;
