export const formatDateForTables = (dateString) => {
  const date = new Date(dateString);

  // Get the day of the month
  const day = date.getDate();

  // Get the month name (e.g., "July")
  const month = date.toLocaleDateString("en-US", { month: "long" });

  // Get the full year
  const year = date.getFullYear();

  // Function to get the ordinal suffix (st, nd, rd, th)
  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return 'th'; // Handles 11th, 12th, 13th
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  // Format the day with leading zero and ordinal suffix
  const formattedDay = `${day < 10 ? '0' : ''}${day}${getOrdinalSuffix(day)}`;

  // Combine all parts into the desired format
  return `${formattedDay} ${month} ${year}`;
};

export const generateBillHTML = (bill) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hospital Bill</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @media print {
            @page { margin: 0; size: auto; }
            body { 
                margin: 1cm;
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
            }
            .bill-container {
                box-shadow: none;
                border: 2px solid #1e3a8a;
                margin: 0 auto;
                page-break-inside: avoid;
            }
        }
        .bill-container {
            width: 100%;
            max-width: 800px;
            min-height: 100vh;
            margin: 0 auto;
            padding: 12px;
            background: #f8fafc;
            font-family: 'Arial', sans-serif;
        }
        .compact-text {
            font-size: 0.875rem;
            line-height: 1.25;
        }
        .header-bg {
            background: #bfdbfe;
            padding: 8px;
            border-radius: 4px;
            margin-bottom: 12px;
        }
        .table-header {
            background: #93c5fd;
            font-size: 0.875rem;
        }
        .total-row {
            background: #bfdbfe;
            font-weight: 600;
        }
    </style>
</head>
<body class="print:p-0 print:m-0">
    <div class="bill-container">
        <!-- Header Section -->
        <div class="header-bg text-center mb-4">
            <h1 class="text-xl font-bold text-blue-900 mb-1">Santi Clinic and Nursing Home</h1>
            <p class="text-xs text-blue-800">Lenin Sarani, Katwa, West Bengal 713130</p>
            <p class="text-xs text-blue-800">Phone: +91 8017933177 | Email: santiclinickatwa@yahoo.in</p>
        </div>

        <!-- Patient and Bill Info -->
        <div class="grid grid-cols-1 gap-2 mb-4 compact-text">
            <div class="flex justify-between border-b pb-1">
                <div>
                    <p><strong>Patient:</strong> ${bill.patientName}</p>
                    ${
                      bill.address
                        ? `<p class="mt-1"><strong>Address:</strong> ${bill.address}</p>`
                        : ""
                    }
                    <p class="mt-1"><strong>Doctor:</strong> ${
                      bill.doctorName || "N/A"
                    }</p>
                </div>
                <div class="text-right">
                    <p><strong>Admission Date:</strong> ${formatDateForTables(
                      bill.admissionDate
                    )}</p>
                     <p><strong>Discharge Date:</strong> ${formatDateForTables(
                      bill.dischargeDate
                    )}</p>
                    <p><strong>Bill No:</strong> </p>
                </div>
            </div>
        </div>

        <!-- Services Table -->
        <table class="w-full mb-4 compact-text">
            <thead>
                <tr class="table-header">
                    <th class="text-left p-1">Description</th>
                    <th class="text-right p-1">Amount (₹)</th>
                </tr>
            </thead>
            <tbody>
                ${bill.services
                  .map(
                    (item, index) => `
                    <tr class="${index % 2 === 0 ? "bg-blue-50" : ""}">
                        <td class="p-1">${item.description}</td>
                        <td class="p-1 text-right">₹${item.cost.toFixed(2)}</td>
                    </tr>
                `
                  )
                  .join("")}
            </tbody>
            <tfoot>
                <tr class="total-row">
                    <td class="p-1 text-right font-bold">Total:</td>
                    <td class="p-1 text-right font-bold">₹${bill.totalAmount.toFixed(
                      2
                    )}</td>
                </tr>
            </tfoot>
        </table>

        <!-- Footer Section -->
        <div class="mt-auto compact-text">
            <div class="border-t pt-2 text-xs">
                <p class="font-semibold mb-1">Terms & Conditions:</p>
                <ul class="list-disc list-inside">
                    <li>Payment due immediately upon receipt</li>
                    <li>Late payments subject to 1.5% monthly interest</li>
                    <li>Disputes must be raised within 7 days</li>
                </ul>
            </div>
            <div class="mt-4 text-center text-xs">
                <p>Authorized Signature: _________________________</p>
                <p class="mt-2">Thank you for choosing Santi Clinic Nursing Home</p>
            </div>
        </div>
    </div>
</body>
</html>
`;
