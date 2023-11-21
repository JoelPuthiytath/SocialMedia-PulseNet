// ReportsFilters.js
import React, { useState } from "react";
import { TextField, Button, Grid } from "@mui/material";

const ReportsFilters = ({ onFilterChange }) => {
  const [reporterId, setReporterId] = useState("");
  const [postId, setPostId] = useState("");

  const handleApplyFilters = () => {
    console.log(postId, "this is teh postId form filter");
    onFilterChange({ reporterId, postId });
  };

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item>
        <TextField
          label="Reporter ID"
          value={reporterId}
          onChange={(e) => setReporterId(e.target.value)}
        />
      </Grid>
      <Grid item>
        <TextField
          label="Post ID"
          value={postId}
          onChange={(e) => setPostId(e.target.value)}
        />
      </Grid>
      <Grid item>
        <Button variant="contained" onClick={handleApplyFilters}>
          Apply Filters
        </Button>
      </Grid>
    </Grid>
  );
};

export default ReportsFilters;
