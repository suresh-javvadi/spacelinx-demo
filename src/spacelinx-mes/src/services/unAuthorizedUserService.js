import api from "./api";

export const fetchUsersWithEmail = async (email) => {
  try {
    const response = await api({
      method: "get",
      url: `UserUa/ua/checkuser/${email}`,
      headers: {
        Authorization: undefined,
        "SPACELINX-TENANT-ID": undefined,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};
