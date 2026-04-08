import api from "./api";

const apiUrl = "/BankAccount";
export const createCompanyBankAccount = async (bankAccount) => {
  const response = await api.post(
    `${apiUrl}/company-bank-account?companyId=${bankAccount.id}`,
    bankAccount
  );
  return response.data;
};
export const UpdateCompanyBankAccount = async (id, bankAccountData) => {
  const response = await api.put(
    `${apiUrl}/company-bank-account/${id}`,
    bankAccountData
  );
  return response.data;
};
