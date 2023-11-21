import webpack from "webpack";

export default {
  // ... other configurations

  plugins: [
    new webpack.ProvidePlugin({
      global: ["global", "window"],
    }),
  ],
};
