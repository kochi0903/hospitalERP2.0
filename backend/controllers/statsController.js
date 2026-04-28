import Expense from "../models/Expense.js";
import PatientBill from "../models/PatientBilling.js";


export const getFinancialStats = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentMonth = month ? parseInt(month) - 1 : new Date().getMonth();
    const currentYear = year ? parseInt(year) : new Date().getFullYear();

    // Last 6 months data
    const last6Months = [...Array(6)].map((_, i) => {
      const date = new Date(currentYear, currentMonth - i, 1);
      return {
        year: date.getFullYear(),
        month: date.getMonth(),
      };
    });

    // Get expenses for last 6 months
    const expenseStats = await Expense.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(currentYear, currentMonth - 5, 1),
          },
        },
      },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          totalExpense: { $sum: "$amount" },
        },
      },
    ]);

    // Get income (paid bills) for last 6 months
    const incomeStats = await PatientBill.aggregate([
      {
        $match: {
          status: "paid",
          dischargeDate: {
            $gte: new Date(currentYear, currentMonth - 5, 1),
          },
        },
      },
      {
        $group: {
          _id: { year: { $year: "$dischargeDate" }, month: { $month: "$dischargeDate" } },
          totalIncome: { $sum: "$totalAmount" },
        },
      },
    ]);

    // Current month stats
    const currentMonthStart = new Date(currentYear, currentMonth, 1);
    const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0);

    const currentMonthExpenses = await Expense.aggregate([
      {
        $match: {
          date: {
            $gte: currentMonthStart,
            $lte: currentMonthEnd,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const currentMonthBills = await PatientBill.aggregate([
      {
        $match: {
          dischargeDate: {
            $gte: currentMonthStart,
            $lte: currentMonthEnd,
          },
        },
      },
      {
        $group: {
          _id: "$status",
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Format response
    const response = req.query.month ? {
      monthlyStats: last6Months.map(({ year, month }) => ({
        year,
        month: month + 1,
        expense:
          expenseStats.find(
            (stat) => stat._id.year === year && stat._id.month === month + 1
          )?.totalExpense || 0,
        income:
          incomeStats.find(
            (stat) => stat._id.year === year && stat._id.month === month + 1
          )?.totalIncome || 0,
      })),
      currentMonth: {
        month: currentMonth + 1,
        year: currentYear,
        expenses: currentMonthExpenses[0]?.total || 0,
        paid: currentMonthBills.find((bill) => bill._id === "paid")?.total || 0,
        due: currentMonthBills.find((bill) => bill._id === "due")?.total || 0,
        paidBillsCount:
          currentMonthBills.find((bill) => bill._id === "paid")?.count || 0,
        dueBillsCount:
          currentMonthBills.find((bill) => bill._id === "due")?.count || 0,
      }
    } : {
      monthlyStats: last6Months.map(({ year, month }) => ({
        year,
        month: month + 1,
        expense:
          expenseStats.find(
            (stat) => stat._id.year === year && stat._id.month === month + 1
          )?.totalExpense || 0,
        income:
          incomeStats.find(
            (stat) => stat._id.year === year && stat._id.month === month + 1
          )?.totalIncome || 0,
      })),
      currentMonth: {
        month: currentMonth + 1 || new Date().getMonth() + 1,
        year: currentYear || new Date().getFullYear(),
        expenses: currentMonthExpenses[0]?.total || 0,
        paid: currentMonthBills.find((bill) => bill._id === "paid")?.total || 0,
        due: currentMonthBills.find((bill) => bill._id === "due")?.total || 0,
        paidBillsCount:
          currentMonthBills.find((bill) => bill._id === "paid")?.count || 0,
        dueBillsCount:
          currentMonthBills.find((bill) => bill._id === "due")?.count || 0,
      },
    };

    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getDoctorRevenue = async (req, res) => {
  try {
    const {
      period, // 'monthly' | 'half' | 'yearly'
      month, // 'YYYY-MM'
      year,
      half, // '1' or '2'
      startDate,
      endDate,
      status = 'paid',
      page = 1, 
      limit = 30,
    } = req.query;

    let start, end;

    // Custom date range takes highest priority
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else if (period === 'monthly' || month) {
      const m = month || `${year || new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
      if (!/^\d{4}-\d{2}$/.test(m)) {
        return res.status(400).json({ error: "month must be in 'YYYY-MM' format" });
      }
      const [y, mm] = m.split('-').map(Number);
      start = new Date(y, mm - 1, 1);
      end = new Date(y, mm, 0, 23, 59, 59, 999);
    } else if (period === 'half' || period === 'halfYearly' || half) {
      const y = parseInt(year || new Date().getFullYear(), 10);
      const h = parseInt(half || (new Date().getMonth() < 6 ? 1 : 2), 10);
      if (![1, 2].includes(h)) {
        return res.status(400).json({ error: "half must be 1 or 2" });
      }
      start = new Date(y, h === 1 ? 0 : 6, 1);
      end = new Date(y, h === 1 ? 6 : 12, 0, 23, 59, 59, 999);
    } else if (period === 'yearly' || year) {
      const y = parseInt(year || new Date().getFullYear(), 10);
      start = new Date(y, 0, 1);
      end = new Date(y, 11, 31, 23, 59, 59, 999);
    } else {
      // Default to current year
      const y = new Date().getFullYear();
      start = new Date(y, 0, 1);
      end = new Date(y, 11, 31, 23, 59, 59, 999);
    }

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date filters' });
    }

    const match = {
      dischargeDate: { $gte: start, $lte: end },
    };

    if (status) match.status = status;

    const pageNum = Math.max(1, parseInt(page, 10));
    const lim = Math.max(1, Math.min(1000, parseInt(limit, 10)));
    const skip = (pageNum - 1) * lim;

    const pipeline = [
      { $match: match },
      // Normalize doctorName using aggregation operators available on older MongoDB versions
      {
        $addFields: {
          normalizedName: {
            $let: {
              vars: {
                upper: { $toUpper: "$doctorName" }
              },
              in: {
                // Remove dots by splitting on '.' and rejoining with single spaces, then remove extra spaces
                $let: {
                  vars: {
                    joinedNoDots: {
                      $reduce: {
                        input: {
                          $filter: {
                            input: { $split: ["$$upper", "."] },
                            as: "p",
                            cond: { $ne: ["$$p", ""] }
                          }
                        },
                        initialValue: "",
                        in: {
                          $cond: [
                            { $eq: ["$$value", ""] },
                            "$$this",
                            { $concat: ["$$value", " ", "$$this"] }
                          ]
                        }
                      }
                    }
                  },
                  in: {
                    // Split by spaces, remove empty tokens, drop leading 'DR' if present, then rejoin with single spaces and trim
                    $let: {
                      vars: {
                        tokens: {
                          $filter: {
                            input: { $split: ["$$joinedNoDots", " "] },
                            as: "t",
                            cond: { $ne: ["$$t", ""] }
                          }
                        }
                      },
                      in: {
                        $let: {
                          vars: {
                            withoutDr: {
                              $cond: [
                                { $eq: [{ $arrayElemAt: ["$$tokens", 0] }, "DR"] },
                                { $slice: ["$$tokens", 1, { $subtract: [{ $size: "$$tokens" }, 1] }] },
                                "$$tokens"
                              ]
                            }
                          },
                          in: {
                            $trim: {
                              input: {
                                $reduce: {
                                  input: "$$withoutDr",
                                  initialValue: "",
                                  in: {
                                    $cond: [
                                      { $eq: ["$$value", ""] },
                                      "$$this",
                                      { $concat: ["$$value", " ", "$$this"] }
                                    ]
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: "$normalizedName",
          totalRevenue: { $sum: "$totalAmount" },
          billsCount: { $sum: 1 },
          avgRevenue: { $avg: "$totalAmount" },
        },
      },
      {
        $project: {
          doctorName: '$_id',
          totalRevenue: 1,
          billsCount: 1,
          avgRevenue: 1,
          _id: 0,
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $skip: skip },
      { $limit: lim },
    ];

    const results = await PatientBill.aggregate(pipeline);

    // Get total number of unique doctors in range for pagination meta
    const countPipeline = [
      { $match: match },
      {
        $addFields: {
          normalizedName: {
            $let: {
              vars: { upper: { $toUpper: "$doctorName" } },
              in: {
                $let: {
                  vars: {
                    joinedNoDots: {
                      $reduce: {
                        input: {
                          $filter: {
                            input: { $split: ["$$upper", "."] },
                            as: "p",
                            cond: { $ne: ["$$p", ""] }
                          }
                        },
                        initialValue: "",
                        in: {
                          $cond: [
                            { $eq: ["$$value", ""] },
                            "$$this",
                            { $concat: ["$$value", " ", "$$this"] }
                          ]
                        }
                      }
                    }
                  },
                  in: {
                    $let: {
                      vars: {
                        tokens: {
                          $filter: {
                            input: { $split: ["$$joinedNoDots", " "] },
                            as: "t",
                            cond: { $ne: ["$$t", ""] }
                          }
                        }
                      },
                      in: {
                        $let: {
                          vars: {
                            withoutDr: {
                              $cond: [
                                { $eq: [{ $arrayElemAt: ["$$tokens", 0] }, "DR"] },
                                { $slice: ["$$tokens", 1, { $subtract: [{ $size: "$$tokens" }, 1] }] },
                                "$$tokens"
                              ]
                            }
                          },
                          in: {
                            $trim: {
                              input: {
                                $reduce: {
                                  input: "$$withoutDr",
                                  initialValue: "",
                                  in: {
                                    $cond: [
                                      { $eq: ["$$value", ""] },
                                      "$$this",
                                      { $concat: ["$$value", " ", "$$this"] }
                                    ]
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      { $group: { _id: "$normalizedName" } },
      { $count: 'totalDoctors' },
    ];
    const countRes = await PatientBill.aggregate(countPipeline);
    const totalDoctors = countRes[0]?.totalDoctors || 0;

    res.json({
      period: { start: start.toISOString(), end: end.toISOString() },
      filters: { status },
      pagination: {
        page: pageNum,
        limit: lim,
        total: totalDoctors,
        pages: Math.ceil(totalDoctors / lim),
      },
      data: results,
    });
  } catch (err) {
    console.error('getDoctorRevenue error:', err);
    res.status(500).json({ error: err.message });
  }
};