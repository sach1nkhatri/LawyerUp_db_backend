const User = require('../models/User');
const Lawyer = require('../models/Lawyer');
const Report = require('../models/Report');
const Payment = require('../models/payment'); // ✅ make sure this is correct

const getMonthLabel = (date) => {
  const d = new Date(date);
  return d.toLocaleString('default', { month: 'long' });
};

exports.getAnalyticsData = async (req, res) => {
  try {
    const users = await User.find();
    const lawyers = await Lawyer.find();
    const reports = await Report.find();
    const payments = await Payment.find({ status: 'approved' });

    const months = {};

    // 🔁 Users
    for (const u of users) {
      const month = getMonthLabel(u.createdAt);
      if (!months[month]) {
        months[month] = initMonthData(month);
      }

      months[month].registeredUsers++;
      const plan = normalizePlan(u.plan);

      if (plan === 'free') months[month].free++;
      if (plan === 'basic' || plan === 'premium') {
        months[month][plan].total++;
        // Fake usage (fallback if no payment)
        months[month][plan].daily += 1;
        months[month][plan].weekly += 1;
        months[month][plan].monthly += 1;
      }
    }

    // 🔁 Lawyers
    for (const l of lawyers) {
      const user = await User.findById(l.user);
      if (!user) continue;
      const month = getMonthLabel(user.createdAt);
      if (!months[month]) {
        months[month] = initMonthData(month);
      }

      months[month].lawyers.total++;
      if (l.role === 'junior') months[month].lawyers.junior++;
      else months[month].lawyers.senior++;
    }

    // 🔁 Reports
    for (const r of reports) {
      const created = r.createdAt || r.updatedAt || new Date(); // fallback if missing
      const month = getMonthLabel(created);
    
      if (!months[month]) {
        months[month] = initMonthData(month);
      }
    
      months[month].reports++;
    }
    

    // 🔁 Payments (real usage breakdown)
    for (const p of payments) {
      const month = getMonthLabel(p.paymentDate);
      if (!months[month]) {
        months[month] = initMonthData(month);
      }

      const plan = normalizePlan(p.plan);
      if (plan === 'basic' || plan === 'premium') {
        const durationInDays = Math.ceil(
          (new Date(p.validUntil) - new Date(p.paymentDate)) / (1000 * 60 * 60 * 24)
        );

        months[month][plan].total++;

        if (durationInDays <= 2) {
          months[month][plan].daily += 1;
        } else if (durationInDays <= 10) {
          months[month][plan].weekly += 1;
        } else {
          months[month][plan].monthly += 1;
        }
      }
    }

    // ⏱ Sort by month order
    const sorted = Object.values(months).sort((a, b) =>
      new Date(`01 ${a.month} 2025`) - new Date(`01 ${b.month} 2025`)
    );

    res.json({ months: sorted });
  } catch (err) {
    console.error('Analytics Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

function initMonthData(month) {
  return {
    month,
    free: 0,
    basic: { total: 0, daily: 0, weekly: 0, monthly: 0 },
    premium: { total: 0, daily: 0, weekly: 0, monthly: 0 },
    registeredUsers: 0,
    lawyers: { total: 0, junior: 0, senior: 0 },
    reports: 0
  };
}

function normalizePlan(plan) {
  if (!plan) return 'free';
  const p = plan.toLowerCase();
  if (p.includes('premium')) return 'premium';
  if (p.includes('basic')) return 'basic';
  return 'free';
}
