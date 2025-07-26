const User = require('../models/User');
const Lawyer = require('../models/Lawyer');
const Report = require('../models/Report');
const Payment = require('../models/payment');

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

    // Loop Users
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
        // Fake usage breakdown
        months[month][plan].daily += 1;
        months[month][plan].weekly += 1;
        months[month][plan].monthly += 1;
      }
    }

    // Loop Lawyers
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

    // Loop Reports
    for (const r of reports) {
      const month = getMonthLabel(r.createdAt);
      if (!months[month]) {
        months[month] = initMonthData(month);
      }

      months[month].reports++;
    }

    // Loop Payments (optional if you want real revenue)
    for (const p of payments) {
      const month = getMonthLabel(p.paymentDate);
      if (!months[month]) {
        months[month] = initMonthData(month);
      }

      const plan = normalizePlan(p.plan);
      if (plan === 'basic' || plan === 'premium') {
        // Estimate usage if needed
        months[month][plan].total++;
        months[month][plan].daily += 1;
        months[month][plan].weekly += 1;
        months[month][plan].monthly += 1;
      }
    }

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
