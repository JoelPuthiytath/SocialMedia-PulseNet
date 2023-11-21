import { apiSlice } from "./ApiSlice";

const MESSAGE_URL = "/api/message";

export const messageApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMessages: builder.mutation({
      query: (data) => ({
        url: `${MESSAGE_URL}/${data.chatId}`,
        method: "GET",
      }),
    }),
    addMessages: builder.mutation({
      query: (data) => ({
        url: `${MESSAGE_URL}/`,
        method: "POST",
        body: data,
      }),
    }),
    deleteMessage: builder.mutation({
      query: (data) => ({
        url: `${MESSAGE_URL}/unsend`,
        method: "DELETE",
        body: data,
      }),
    }),
  }),
});

export const {
  useGetMessagesMutation,
  useAddMessagesMutation,
  useDeleteMessageMutation,
} = messageApiSlice;
