export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateSeluEmail = (email) => {
  return validateEmail(email) && email.endsWith("@selu.edu");
};

export const validateWNumber = (wNumber) => {
  return /^W\d{7}$/.test(wNumber);
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validateRegistrationForm = (formData) => {
  const errors = {};

  if (!formData.firstName?.trim()) {
    errors.firstName = "First name is required";
  }

  if (!formData.lastName?.trim()) {
    errors.lastName = "Last name is required";
  }

  if (!formData.email) {
    errors.email = "Email is required";
  } else if (!validateSeluEmail(formData.email)) {
    errors.email = "Please use your SELU email address (@selu.edu)";
  }

  if (formData.wNumber && formData.wNumber.trim()) {
    if (!validateWNumber(formData.wNumber.trim().toUpperCase())) {
      errors.wNumber =
        "W-number must be in format W1234567 (W followed by 7 digits)";
    }
  }

  if (!formData.expectedGraduation) {
    errors.expectedGraduation = "Please select your expected graduation";
  }

  if (!formData.classStanding) {
    errors.classStanding = "Please select your current class standing";
  }

  if (!formData.agreeTerms) {
    errors.agreeTerms = "You must agree to the terms and conditions";
  }

  if (!formData.agreeCode) {
    errors.agreeCode = "You must agree to abide by the SELU Code of Conduct";
  }

  return errors;
};
