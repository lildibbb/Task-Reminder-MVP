import axios, { AxiosPromise, AxiosRequestConfig } from "axios";

import { API } from "./index";

import localStorageConfig from "@/configs/localStorage";
import { getItem, setItem } from "@/utility/localStorageControl";

import { store } from "@/store";
import {
  handleLogout,
  handleMaintenanceMode,
  handleOffline,
} from "@/store/apps/common";

const { dispatch } = store;

let repeatCount = 0;

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

// Add platform as header of API request - for maintenance mode specific platform
const client = axios.create({
  baseURL: API_ENDPOINT + "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

class APIService {
  static get(path = "", params = {}): AxiosPromise {
    return client({
      method: "GET",
      url: path,
      params,
    });
  }

  static post(path = "", data = {}, optionalHeader = {}): AxiosPromise {
    // Check if data is FormData and remove Content-Type if not explicitly provided
    // This allows axios to set the correct boundary for multipart/form-data
    const headers: Record<string, string> = { ...optionalHeader };

    if (data instanceof FormData) {
      // For FormData, let the browser set the content type and boundary
      return client({
        method: "POST",
        url: path,
        data,
        headers,
        // This is crucial for proper multipart/form-data handling
        transformRequest: [
          (data, requestHeaders) => {
            // TypeScript-safe way to delete the Content-Type header
            if (requestHeaders && typeof requestHeaders === "object") {
              delete requestHeaders["Content-Type"];
            }
            return data;
          },
        ],
      });
    }

    // Regular JSON request
    return client({
      method: "POST",
      url: path,
      data,
      headers,
    });
  }

  static patch(path = "", data = {}, optionalHeader = {}): AxiosPromise {
    const headers: Record<string, string> = { ...optionalHeader };

    if (data instanceof FormData) {
      return client({
        method: "PATCH",
        url: path,
        data,
        headers,
        transformRequest: [
          (data, requestHeaders) => {
            if (requestHeaders && typeof requestHeaders === "object") {
              delete requestHeaders["Content-Type"];
            }
            return data;
          },
        ],
      });
    }

    return client({
      method: "PATCH",
      url: path,
      data,
      headers,
    });
  }

  static put(path = "", data = {}): AxiosPromise {
    return client({
      method: "PUT",
      url: path,
      data: data,
    });
  }

  static delete(path = "", data = {}): AxiosPromise {
    return client({
      method: "DELETE",
      url: path,
      data: JSON.stringify(data),
    });
  }

  static download(path = ""): AxiosPromise {
    return client({
      method: "GET",
      url: path,
      responseType: "blob", // important
    });
  }
}

// this holds any in-progress token refresh requests
let refreshTokenPromise: Promise<string> | null = null;

const getNewAccessToken = (): any => {
  return axios
    .post(
      API_ENDPOINT + "/api/v1/" + API.auth.refresh,
      {},
      {
        // headers: {
        //   Authorization: `Bearer ${getItem(localStorageConfig.auth.storageRefreshTokenKeyName)}`,
        // },
        withCredentials: true, //using cookie for refresh token
      },
    )
    .then((res) => {
      setItem(
        localStorageConfig.auth.storageTokenKeyName,
        res.data.data.access_token,
      );

      return res.data.data.access_token;
    })
    .catch((error) => {
      console.error("Refresh token failed:", error); // Log the error
      // Increase repeat count
      repeatCount++;

      dispatch(handleLogout());
    });
};

/**
 * axios interceptors runs before and after a request, letting the developer modify req,req more
 * For more details on axios interceptor see https://github.com/axios/axios#interceptors
 */
client.interceptors.request.use((config) => {
  // do something before executing the request
  // For example tag along the bearer access token to request header or set a cookie
  const requestConfig = config;
  const { headers } = config;

  const accessToken = getItem(localStorageConfig.auth.storageTokenKeyName);
  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return config;
});
const excludedFromRefreshEndpoints = [API.auth.login, API.auth.refresh];
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    // originalRequest will hold the config of the request that failed
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean; // Custom property to prevent infinite retries
    };
    const { response } = error; // The error response object

    // Handle network error (no response from server)
    if (error.toJSON && error.toJSON().message === "Network Error") {
      dispatch(handleOffline());
      return Promise.reject(error); // Reject immediately
    }

    // Proceed if we have a response object from the server
    if (response) {
      // Check if the URL of the failed request is one of the excluded endpoints
      const isExcludedEndpoint = excludedFromRefreshEndpoints.some(
        (endpoint) => {
          // Ensure originalRequest.url is defined and endpoint is a string
          if (originalRequest.url && typeof endpoint === "string") {
            return originalRequest.url.includes(endpoint);
          }
          return false;
        },
      );

      // Handle 401 Unauthorized errors
      if (response.status === 401) {
        if (isExcludedEndpoint) {
          // If it's an excluded endpoint (like login or refresh itself),
          // a 401 is final. Don't attempt to refresh token.
          // For login, this means invalid credentials.
          // For refresh, this means the refresh token is invalid/expired.
          if (originalRequest.url?.includes(API.auth.refresh)) {
            // If the refresh token call itself fails with 401, logout.
            console.error(
              "Refresh token request failed with 401. Logging out.",
            );
            dispatch(handleLogout());
          }
          return Promise.reject(error);
        }

        // If it's a 401 on a protected route (not excluded) and not already a retry
        if (!originalRequest._retry) {
          if (repeatCount > 3) {
            // Too many refresh attempts, logout
            dispatch(handleLogout());
            return Promise.reject(error);
          }

          originalRequest._retry = true; // Mark as a retry attempt

          if (!refreshTokenPromise) {
            // No refresh token request in progress, start one
            refreshTokenPromise = getNewAccessToken().finally(() => {
              refreshTokenPromise = null; // Clear promise once settled
            });
          }

          try {
            const newAccessToken = await refreshTokenPromise;
            if (newAccessToken && originalRequest.headers) {
              originalRequest.headers["Authorization"] =
                `Bearer ${newAccessToken}`;
              // Reset repeatCount as we are attempting a retry with a new token
              repeatCount = 0;
              return client(originalRequest); // Retry the original request with new token
            } else {
              // If newAccessToken is null/undefined (e.g., refresh failed and returned nothing)
              // This case should ideally be handled by getNewAccessToken rejecting
              dispatch(handleLogout());
              return Promise.reject(error); // Or a more specific error indicating refresh failure
            }
          } catch (refreshError) {
            // getNewAccessToken() itself rejected (e.g., network error, or it dispatched logout)
            // The logout should ideally be handled within getNewAccessToken's catch block.
            // If not already handled, dispatch logout here.
            // dispatch(handleLogout()); // Potentially redundant if getNewAccessToken handles it
            return Promise.reject(refreshError);
          }
        } else {
          // If it's already a retry that failed with 401, something is wrong.
          // This could mean the new token was also invalid or another issue.
          console.error("Retried request failed with 401. Logging out.");
          dispatch(handleLogout());
          return Promise.reject(error);
        }
      }

      // Handle 429 Rate Limit
      if (response.status === 429) {
        console.log("Rate limit exceeded. Please try again later.");
        // Optionally, dispatch an action to inform the user
      }

      // Handle 503 Service Unavailable (Maintenance Mode)
      if (response.status === 503) {
        dispatch(
          handleMaintenanceMode({
            etaTime: response.data.etaTime
              ? new Date(response.data.etaTime)
              : null,
          }),
        );
      }

      // Handle other error statuses if needed (e.g., 500)
      // if (response.status === 500) {
      //   // Do something for server errors
      // }
    }

    // For any other errors or if response is not defined (and not network error)
    return Promise.reject(error);
  },
);

export default APIService;

export { client };
