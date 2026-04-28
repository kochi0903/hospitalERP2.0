import Income from "../models/Income.js";

export const getAllIncome = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) > 0 ? parseInt(req.query.page, 10) : 1;
    const limit = parseInt(req.query.limit, 10) > 0 ? parseInt(req.query.limit, 10) : 20;
    const skip = (page - 1) * limit;

    const total = await Income.countDocuments();
    const income = await Income.find().sort({ createdAt: -1 }).skip(skip).limit(limit);

    res.json({
      data: income,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getIncomeSummary = async (req, res) => {
  try {
    const summary = await Income.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      {
        $group: {
          _id: { month: { $month: "$date" }, year: { $year: "$date" } },
          totalIncome: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
    ]);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
