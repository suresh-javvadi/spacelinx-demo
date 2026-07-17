const INR_CODE = "INR";

// Resolves the live rate (1 unit of currencyCode -> INR) at the moment of the call.
export const resolveConversionRateToInr = async (currencyCode) => {
  if (!currencyCode || currencyCode === INR_CODE) {
    return 1;
  }

  try {
    const response = await fetch(
      `https://open.er-api.com/v6/latest/${currencyCode}`,
    );
    const data = await response.json();
    return data?.rates?.[INR_CODE] ?? 1;
  } catch (error) {
    console.error("Error resolving conversion rate:", error);
    return 1;
  }
};
