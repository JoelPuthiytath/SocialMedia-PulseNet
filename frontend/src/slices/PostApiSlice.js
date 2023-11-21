import { apiSlice } from "./ApiSlice";

const POST_URL = "/api/post";

export const postApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createPost: builder.mutation({
      query: (data) => ({
        url: `${POST_URL}/createPost`,
        method: "POST",
        body: data,
        formData: true,
      }),
    }),
    getPost: builder.mutation({
      query: (data) => ({
        url: `${POST_URL}/posts/${data.postId}`,
        method: "GET",
      }),
    }),
    getFeedPost: builder.mutation({
      query: (data) => ({
        url: `${POST_URL}/`,
        method: "GET",
      }),
    }),
    getUserPost: builder.mutation({
      query: (data) => ({
        url: `${POST_URL}/getPosts?userId=${data.userId}`,
        method: "GET",
      }),
    }),
    likeAndUnlikePost: builder.mutation({
      query: (data) => ({
        url: `${POST_URL}/like`,
        method: "PATCH",
        body: data,
      }),
    }),
    addPostComment: builder.mutation({
      query: (data) => ({
        url: `${POST_URL}/comment`,
        method: "PUT",
        body: data,
      }),
    }),
    deletePost: builder.mutation({
      query: (data) => ({
        url: `${POST_URL}/delete`,
        method: "PUT",
        body: data,
      }),
    }),
    reportPost: builder.mutation({
      query: (data) => ({
        url: `${POST_URL}/reportPost`,
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useCreatePostMutation,
  useLikeAndUnlikePostMutation,
  useGetPostMutation,
  useGetFeedPostMutation,
  useGetUserPostMutation,
  useAddPostCommentMutation,
  useDeletePostMutation,
  useReportPostMutation,
} = postApiSlice;
