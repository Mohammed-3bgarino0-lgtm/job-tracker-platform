// Generic Form Adapter Module - Qaddem AI
window.QaddemGenericAdapter = {
  name: "Generic Form Adapter",
  version: "1.4.0",
  detectFormFields: function() {
    const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
    const detected = [];

    inputs.forEach(input => {
      const name = (input.name || input.id || input.getAttribute('placeholder') || '').toLowerCase();
      let fieldType = 'unknown';

      if (name.includes('name') || name.includes('الاسم')) fieldType = 'full_name';
      else if (name.includes('email') || name.includes('بريد')) fieldType = 'email';
      else if (name.includes('phone') || name.includes('mobile') || name.includes('جوال')) fieldType = 'phone';
      else if (name.includes('city') || name.includes('مدينة')) fieldType = 'city';

      detected.push({ element: input, name, fieldType });
    });

    return detected;
  }
};
