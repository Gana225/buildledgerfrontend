import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react"

import api from "../api/axios"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] =
    useState(() =>
      localStorage.getItem("access_token")
    )

  const [refreshToken, setRefreshToken] =
    useState(() =>
      localStorage.getItem("refresh_token")
    )

  const [user, setUser] = useState(null)

  const [loading, setLoading] = useState(true)

  /*
   * Login
   */
  const login = (access, refresh) => {
    localStorage.setItem(
      "access_token",
      access
    )

    localStorage.setItem(
      "refresh_token",
      refresh
    )

    setAccessToken(access)
    setRefreshToken(refresh)
  }

  /*
   * Logout
   */
  const logout = () => {
    localStorage.removeItem(
      "access_token"
    )

    localStorage.removeItem(
      "refresh_token"
    )

    setAccessToken(null)
    setRefreshToken(null)
    setUser(null)
  }

  /*
   * Load authenticated user
   *
   * Runs:
   * 1. When the app starts with an existing token
   * 2. Immediately after login when accessToken changes
   */
  useEffect(() => {
    let cancelled = false

    const loadUser = async () => {
      /*
       * No access token means there is
       * no authenticated session.
       */
      if (!accessToken) {
        if (!cancelled) {
          setUser(null)
          setLoading(false)
        }

        return
      }

      /*
       * While checking the token/user,
       * keep the application in loading state.
       */
      setLoading(true)

      try {
        const response = await api.get(
          "/auth/me/"
        )

        if (!cancelled) {
          console.log(
            "Authenticated user:",
            response.data
          )

          setUser(response.data)
        }
      } catch (error) {
        console.error(
          "Failed to load user:",
          error
        )

        if (!cancelled) {
          logout()
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadUser()

    return () => {
      cancelled = true
    }
  }, [accessToken])

  const isAuthenticated =
    Boolean(accessToken)

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        refreshToken,
        user,
        loading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}