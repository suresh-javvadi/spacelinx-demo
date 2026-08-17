import React, { createContext, useContext, useState, useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { fetchUsersWithEmail } from "../../services/unAuthorizedUserService";
import { useNavigate } from "react-router-dom";
import { fetchRolePermissionByRoleId } from "../../services/rolePermissionService";
import { fetchOptionSetByName } from "../../services/optionSetService";
import { getLocalUserEmail } from "../../services/localAuth";

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

  // The signed-in user's email, whichever way they signed in: MSAL populates
  // `accounts` for Azure AD, while password sign-in carries the email in the
  // SpaceLinx token. Everything downstream keys off email, so the two are
  // interchangeable from here on.
  const signedInEmail = accounts[0]?.username || getLocalUserEmail();

  // Active-role selection is persisted in localStorage (not sessionStorage) so the
  // user's chosen role survives a browser/tab close — matching how MSAL persists the
  // login (cacheLocation: "localStorage"). Previously it lived in sessionStorage, so
  // closing the browser wiped it and the next load silently fell back to the default
  // role (dropping a Super Admin to a low-privilege role). The key is scoped per user
  // so a shared browser can't leak one account's active role into another's.
  const activeRoleStorageKey = (email) =>
    `slx.activeRole.${(email || "").toLowerCase()}`;

  const updateActiveRole = (role) => {
    const matchedRole = userRolesAndPermissions.find(
      (roleObj) => roleObj.role?.roleName === role.roleName
    );
    if (matchedRole) {
      setActiveRole(matchedRole);
      const email = signedInEmail;
      localStorage.setItem(
        activeRoleStorageKey(email),
        matchedRole.role.roleName
      );
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
      if (signedInEmail) {
        const email = signedInEmail;
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

        // Pick the org-assigned default. Exactly one user_role should be flagged
        // default; if the data has more than one (a known inconsistency), choose
        // deterministically (lowest roleNumber — sortedRoles is already sorted) and
        // warn, rather than masking it by silently jumping to a higher-privilege role.
        const defaultUserRoles = sortedRoles.filter((item) => item.isDefault);
        if (defaultUserRoles.length > 1) {
          console.warn(
            `[UserContext] ${email} has ${defaultUserRoles.length} roles flagged default ` +
              `(${defaultUserRoles
                .map((r) => r.role.roleName)
                .join(", ")}); defaulting to "${defaultUserRoles[0].role.roleName}". ` +
              `Exactly one default is expected — fix the user_role data.`
          );
        }
        const matchedSavedRole = defaultUserRoles[0] || null;
        const defaultRoleObj =
          rolesWithPermissions.find(
            (item) => item.role.id === matchedSavedRole?.role?.id
          ) || rolesWithPermissions[0];

        // Restore the user's last explicitly chosen role from the per-user
        // localStorage key, falling back to the legacy sessionStorage key for
        // sessions saved before this change. The auto-resolved default is NOT
        // persisted here — only an explicit switch (updateActiveRole) writes it —
        // otherwise the first fallback would lock the user to the default forever.
        const savedRoleName =
          localStorage.getItem(activeRoleStorageKey(email)) ||
          sessionStorage.getItem("activeRole");

        const savedRoleObj = savedRoleName
          ? rolesWithPermissions.find(
              (item) => item.role.roleName === savedRoleName
            )
          : null;

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
  }, [accounts, signedInEmail]);

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
