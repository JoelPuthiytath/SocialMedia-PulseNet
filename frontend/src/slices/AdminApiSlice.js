import { apiSlice } from "./ApiSlice";

const ADMIN_URL = "/api/admin";

export const AdminApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    AdminLogin: builder.mutation({
      query: (data) => ({
        url: `${ADMIN_URL}/login`,
        method: "POST",
        body: data,
      }),
    }),
    AdminLogout: builder.mutation({
      query: () => ({
        url: `${ADMIN_URL}/logout`,
        method: "POST",
      }),
    }),
    postReports: builder.mutation({
      query: (data) => ({
        url: `${ADMIN_URL}/postReports`,
        method: "GET",
        params: data,
      }),
    }),
    patchBlock: builder.mutation({
      query: (userId) => ({
        url: `${ADMIN_URL}/patchBlock`,
        method: "GET",
        params: userId,
      }),
    }),

    CreateUser: builder.mutation({
      query: (data) => ({
        url: `${ADMIN_URL}/users`,
        method: "POST",
        body: data,
      }),
    }),
    ListUsers: builder.mutation({
      query: () => ({
        url: `${ADMIN_URL}/users`,
        method: "GET",
      }),
    }),
    EditUser: builder.mutation({
      query: (id) => ({
        url: `${ADMIN_URL}/edit`,
        method: "GET",
        params: { id },
      }),
    }),

    UpdateUser: builder.mutation({
      query: (data) => ({
        url: `${ADMIN_URL}/edit`,
        method: "PUT",
        body: data,
      }),
    }),
    RemoveUsers: builder.mutation({
      query: (id) => ({
        url: `${ADMIN_URL}/users`,
        method: "DELETE",
        params: { id },
      }),
    }),
  }),
});

export const {
  useAdminLoginMutation,
  useAdminLogoutMutation,
  usePatchBlockMutation,
  useCreateUserMutation,
  useRemoveUsersMutation,
  useListUsersMutation,
  usePostReportsMutation,
  useEditUserMutation,
  useUpdateUserMutation,
} = AdminApiSlice;
