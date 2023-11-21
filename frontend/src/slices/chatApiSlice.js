import { apiSlice } from "./ApiSlice";

const CHAT_URL = "/api/chat";

export const chatApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createChat: builder.mutation({
      query: (data) => ({
        url: `${CHAT_URL}/`,
        method: "POST",
        body: data,
      }),
    }),
    userChats: builder.mutation({
      query: (data) => ({
        url: `${CHAT_URL}/${data.userId}`,
        method: "GET",
      }),
    }),
  }),
});

export const { useCreateChatMutation, useUserChatsMutation } = chatApiSlice;
