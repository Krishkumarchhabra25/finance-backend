const irreversibleTypes = ['payment', 'withdrawal', 'fee'];
const irreversibleCategories = [
  'food', 'transport', 'shopping', 'bills',
  'entertainment', 'healthcare', 'salary',
  'investment', 'other'
];

exports.isIrreversible = (type, category) => {
  return irreversibleTypes.includes(type) && irreversibleCategories.includes(category);
};

exports.getTransactionNature = (type) => {
  if (['deposit', 'refund'].includes(type)) return 'Income';
  if (['payment', 'withdrawal', 'fee'].includes(type)) return 'Expense';
  return 'Neutral';
};
