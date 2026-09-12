import axios from "axios"

//const API_BASE_URL = "http://127.0.0.1:8000/api"
const API_BASE_URL = "https://api.ganatech.online/api"
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// --------------------------------------------------
// Attach access token to every authenticated request
// --------------------------------------------------

api.interceptors.request.use(
  (config) => {
    const accessToken =
      localStorage.getItem("access_token")

    if (accessToken) {
      config.headers = config.headers || {}

      config.headers.Authorization =
        `Bearer ${accessToken}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// --------------------------------------------------
// Refresh expired access token
// --------------------------------------------------

let isRefreshing = false

let refreshSubscribers = []

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback)
}

const onRefreshed = (newToken) => {
  refreshSubscribers.forEach(
    (callback) => callback(newToken)
  )

  refreshSubscribers = []
}

const clearAuthentication = () => {
  localStorage.removeItem(
    "access_token"
  )

  localStorage.removeItem(
    "refresh_token"
  )
}

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest =
      error.config

    // Only handle 401 responses.
    if (
      error.response?.status !== 401 ||
      !originalRequest
    ) {
      return Promise.reject(error)
    }

    // Never refresh login or refresh requests.
    if (
      originalRequest.url?.includes(
        "/auth/login/"
      ) ||
      originalRequest.url?.includes(
        "/auth/refresh/"
      )
    ) {
      return Promise.reject(error)
    }

    // Don't retry the same request twice.
    if (originalRequest._retry) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    const refreshToken =
      localStorage.getItem(
        "refresh_token"
      )

    if (!refreshToken) {
      clearAuthentication()

      window.location.href = "/login"

      return Promise.reject(error)
    }

    // Another request is already refreshing.
    if (isRefreshing) {
      return new Promise(
        (resolve, reject) => {
          subscribeTokenRefresh(
            (newToken) => {
              originalRequest.headers =
                originalRequest.headers || {}

              originalRequest.headers.Authorization =
                `Bearer ${newToken}`

              resolve(
                api(originalRequest)
              )
            }
          )

          // Keep rejection behavior predictable.
          setTimeout(() => {
            if (
              !localStorage.getItem(
                "access_token"
              )
            ) {
              reject(error)
            }
          }, 10000)
        }
      )
    }

    isRefreshing = true

    try {
      const response =
        await axios.post(
          `${API_BASE_URL}/auth/refresh/`,
          {
            refresh: refreshToken,
          }
        )

      const newAccessToken =
        response.data.access

      localStorage.setItem(
        "access_token",
        newAccessToken
      )

      onRefreshed(
        newAccessToken
      )

      originalRequest.headers =
        originalRequest.headers || {}

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`

      return api(originalRequest)
    } catch (refreshError) {
      clearAuthentication()

      refreshSubscribers = []

      window.location.href = "/login"

      return Promise.reject(
        refreshError
      )
    } finally {
      isRefreshing = false
    }
  }
)

export default api