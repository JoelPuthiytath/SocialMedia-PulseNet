import { apiSlice } from "./ApiSlice";

const USERS_URL = "/api/users";

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/auth`,
        method: "POST",
        body: data,
      }),
    }),
    register: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/register`,
        method: "POST",
        body: data,
      }),
    }),
    logout: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/logout`,
        method: "POST",
        body: data,
      }),
    }),
    updateUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/login-profile`,
        method: "PUT",
        body: data,
      }),
    }),
    updateUserProfilePic: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/image`,
        method: "PUT",
        body: data,
        formData: true,
      }),
    }),
    getUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/user`,
        method: "GET",
        params: data,
      }),
    }),
    getUserById: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/getUser?id=${data.userId}`,
        method: "GET",
      }),
    }),
    getFriends: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/friends?userId=${data.userId}`,
        method: "GET",
      }),
    }),
    addFriend: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/addFriends`,
        method: "PATCH",
        params: {
          friendId: data.friendId,
        },
      }),
    }),
    removeFriend: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/removeFriends`,
        method: "PATCH",
        params: {
          friendId: data.friendId,
        },
      }),
    }),
    generateOTP: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/generateOTP`,
        method: "GET",
        params: {
          userName: data,
        },
      }),
    }),
    registerMail: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/registerMail`,
        method: "POST",
        body: data,
      }),
    }),
    otpVerify: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/verifyOTP`,
        method: "GET",
        params: {
          userName: data.userName,
          code: data.code,
        },
      }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/resetPassword`,
        method: "PUT",
        body: data,
      }),
    }),
    emailVerify: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/verify-email`,
        method: "POST",
        body: data,
      }),
    }),
    searchUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/search-user?user=${data.searchTerm}`,
        method: "GET",
      }),
    }),
    reportUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/reportUser`,
        method: "POST",
        body: data,
      }),
    }),
    blockUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/blockUser`,
        method: "PUT",
        body: data,
      }),
    }),
    unblockUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/unblockUser`,
        method: "PUT",
        body: data,
      }),
    }),
    addSocialProfile: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/socialProfile`,
        method: "PUT",
        body: data,
      }),
    }),
    fetchBlockedUsers: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/fetchBlockedUsers`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useAddSocialProfileMutation,
  useAddFriendMutation,
  useRemoveFriendMutation,
  useSearchUserMutation,
  useOtpVerifyMutation,
  useLogoutMutation,
  useRegisterMailMutation,
  useRegisterMutation,
  useEmailVerifyMutation,
  useUpdateUserMutation,
  useGetUserMutation,
  useGetUserByIdMutation,
  useGenerateOTPMutation,
  useResetPasswordMutation,
  useUpdateUserProfilePicMutation,
  useGetFriendsMutation,
  useReportUserMutation,
  useBlockUserMutation,
  useUnblockUserMutation,
  useFetchBlockedUsersMutation,
} = usersApiSlice;
