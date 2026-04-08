import React, { createContext, useState } from "react";
import PropTypes from "prop-types";
export const ProductContext = createContext();

export const ProductContextProvider = ({ children }) => {
  const [selectedProductId, setSelectedProductId] = useState(null);

  return (
    <ProductContext.Provider
      value={{
        selectedProductId,
        setSelectedProductId,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

ProductContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
