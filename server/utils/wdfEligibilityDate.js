exports.wdfEligibilityDate = () => {
  // calculate the effective from date
  const today = new Date();
  const yearStartMonth = 3;           // April (months start at 0)
  if (today.getMonth() < yearStartMonth) {
      return new Date(Date.UTC(today.getFullYear()-1, 3, 1));
  } else {
      return new Date(Date.UTC(today.getFullYear(), 3, 1));
  }
};
