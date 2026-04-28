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

export const generateIncomeBillsHTML = (bills, month, totalIncome) => {
  return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>Income Report for ${month}</h1>
          <p>Total Income: Rs.${totalIncome.toFixed(2)}</p>
          <table>
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Patient ID</th>
                <th>Doctor Name</th>
                <th>Bill Date</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${bills
                .map(
                  (bill) => `
                <tr>
                  <td>${bill.patientName}</td>
                  <td>${bill.patientId}</td>
                  <td>${bill.doctorName}</td>
                  <td>${formatDateForTables(bill.dischargeDate)}</td>
                  <td>Rs${bill.totalAmount.toFixed(2)}</td>
                </tr>
              `
                )
                .join("")}
                <tr>
                 <td colspan="7" style="text-align:right;font-weight:bold;">Total</td>
                  <td style="font-weight:bold;">${totalIncome}</td>
                 </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;
};
