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

// Build HTML for PDF
export const generateExpenseBillsHTML = (expenses, month, totalAmount) => {
  return `
      <h2>Expenses for ${month}</h2>
      <table border="1" cellpadding="5" cellspacing="0" style="border-collapse:collapse;width:100%;font-size:12px;">
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Incurred By</th>
            <th>Remarks</th>
            <th>Payment Mode</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${expenses
            .map((exp) => {
              return `
            <tr>
              <td>${formatDateForTables(exp.date)}</td>
              <td>${exp.category}</td>
              <td>${
                exp.incurredBy
                  ? `${exp.incurredBy.name} &lt;${exp.incurredBy.email}&gt;`
                  : ""
              }</td>
              <td>${exp.paymentMode}</td>
              <td>${exp.remarks || ""}</td>
               <td>${exp.amount}</td>
            </tr>
          `;
            })
            .join("")}
          <tr>
            <td colspan="7" style="text-align:right;font-weight:bold;">Total</td>
            <td style="font-weight:bold;">${totalAmount}</td>
          </tr>
        </tbody>
      </table>
    `;
};
