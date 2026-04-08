import React, { createContext, useContext, useState, useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { fetchUsersWithEmail } from "../../services/unAuthorizedUserService";
import { useNavigate } from "react-router-dom";
import { fetchRolePermissionByRoleId } from "../../services/rolePermissionService";
import { fetchOptionSetByName } from "../../services/optionSetService";

const UserContext = createContext();

export const useUserContext = () => {
  return useContext(UserContext);
};

export const UserContextProvider = ({ children }) => {
  const { accounts } = useMsal();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isUserActive, setIsUserActive] = useState(true);
  const [userAuthenticated, setUserAuthenticated] = useState(true);
  const [userRolesAndPermissions, setUserRolesAndPermissions] = useState([]);
  const [activeRole, setActiveRole] = useState(null);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [defaultRole, setDefaultRole] = useState(null);
  const [permissionSet, setPermissionSet] = useState(null);

  const updateActiveRole = (role) => {
    const matchedRole = userRolesAndPermissions.find(
      (roleObj) => roleObj.role?.roleName === role.roleName
    );
    if (matchedRole) {
      setActiveRole(matchedRole);
      sessionStorage.setItem("activeRole", matchedRole.role.roleName);
    }
  };

  const updateRolesAndPermissions = (userRoles) => {
    const rolesWithPermissions = userRoles.map((role) => {
      return {
        role: role.role,
        permissions: role.permissions || null,
      };
    });
    setUserRolesAndPermissions(rolesWithPermissions);
  };

  const fetchUserRoles = async () => {
    setLoadingRoles(true);
    try {
      if (accounts.length > 0) {
        const email = accounts[0].username;
        const user = await fetchUsersWithEmail(email);
        const pathsData = await fetchOptionSetByName("Path_Permissions");
        setPermissionSet(pathsData);
        setIsUserActive(user.isActive);

        const sortedRoles = [...user?.userRoles].sort(
          (a, b) => a.role.roleNumber - b.role.roleNumber
        );

        if (!sortedRoles || sortedRoles.length === 0) {
          setUserAuthenticated(false);
          navigate("/unauthorized");
          return;
        }

        const rolesWithPermissions = await Promise.all(
          sortedRoles.map(async (roleObj) => {
            const permissions = await fetchRolePermissionByRoleId(
              roleObj.role.id
            );
            return {
              role: roleObj.role,
              permissions: permissions || [],
            };
          })
        );

        setUserRolesAndPermissions(rolesWithPermissions);

        const matchedSavedRole = sortedRoles.find((item) => item.isDefault);
        const defaultRoleObj =
          rolesWithPermissions.find(
            (item) => item.role.id === matchedSavedRole?.role?.id
          ) || rolesWithPermissions[0];

        const savedRoleName = sessionStorage.getItem("activeRole");

        const savedRoleObj = rolesWithPermissions.find(
          (item) => item.role.roleName === savedRoleName
        );

        setDefaultRole(matchedSavedRole || null);
        setActiveRole(savedRoleObj || defaultRoleObj);

        console.log("User Permissions:", (savedRoleObj || defaultRoleObj)?.permissions);

        setUserData({
          email: email,
          ...user,
          userRoles: sortedRoles,
        });
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setUserAuthenticated(false);
        navigate("/unauthorized");
      }
      console.error("Error fetching user data:", error);
    } finally {
      setLoadingRoles(false);
    }
  };

  useEffect(() => {
    fetchUserRoles();
  }, [accounts]);

  useEffect(() => {
    setIsSuperAdmin(activeRole?.role?.roleName === "Super Admin");
  }, [activeRole]);

  const hasPermission = (permissionString) => {
    if (!isUserActive) {
      return false;
    }
    if (isSuperAdmin) {
      return true;
    }
    if (!activeRole?.permissions) {
      return false;
    }

    const hasAccess = activeRole.permissions.some(
      (permissionObj) =>
        permissionObj.permission === permissionString &&
        permissionObj.isActive === true
    );

    return hasAccess;
  };

  return (
    <UserContext.Provider
      value={{
        userData,
        isUserActive,
        userAuthenticated,
        userRolesAndPermissions,
        activeRole,
        updateActiveRole,
        updateRolesAndPermissions,
        fetchUserRoles,
        loadingRoles,
        setLoadingRoles,
        isSuperAdmin,
        defaultRole,
        permissionSet,
        hasPermission,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
