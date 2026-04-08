import React, { useState, useEffect } from "react";
import "./CurrencyConverter.css";
import { formatAmount } from "../../utils/numberFormatter";

const CurrencyConverter = ({ totalAmount }) => {
  const [currency, setCurrency] = useState("INR");
  const [conversionRate, setConversionRate] = useState(84);

  useEffect(() => {
    async function fetchUsdInrRate() {
      try {
        const response = await fetch("https://open.er-api.com/v6/latest/USD");
        const data = await response.json();
        if (data && data.rates && data.rates.INR) {
          setConversionRate(data.rates.INR);
        }
      } catch (error) {
        console.error("Error fetching USD/INR rate:", error);
      }
    }
    fetchUsdInrRate();
  }, []);

  const formatCurrencyAmount = (amount, code) => {
    if (code === "USD") {
      const convertedAmount = amount / conversionRate;

      if (convertedAmount >= 1_000_000) {
        const millions = convertedAmount / 1_000_000;

        return `$ ${formatAmount(millions).toLocaleString("en-US")} M`;
      }

      return formatAmount(convertedAmount).toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      });
    }

    return formatAmount(amount).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
    });
  };
  return (
    <div className="total-amount-container">
      <p>
        <span className="label">Total Amount :</span>

        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="currency-dropdown"
        >
          <option value="INR">₹ INR</option>
          <option value="USD">$ USD</option>
        </select>

        <span className="value">
          {formatCurrencyAmount(totalAmount || 0, currency)}
        </span>
      </p>
    </div>
  );
};

export default CurrencyConverter;
