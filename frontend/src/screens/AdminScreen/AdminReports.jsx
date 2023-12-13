import React, { useEffect, useState } from "react";
import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Pagination,
} from "@mui/material";
import { Box, useMediaQuery } from "@mui/material";
import {
  usePostDeleteMutation,
  usePostReportsMutation,
} from "../../slices/AdminApiSlice";
import Loader from "../../loader/GridLoader";
import { format } from "timeago.js";
import { toast } from "react-toastify";

import ReportsFilters from "../../components/reportsFilter";
import { Link, useNavigate } from "react-router-dom";
const AdminReports = () => {
  const [postReports, { isLoading }] = usePostReportsMutation();
  const [postDelete] = usePostDeleteMutation();
  const [reports, setReports] = useState([]);
  const [criticalReports, setCriticalReports] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 4 });
  const [filters, setFilters] = useState({});
  const [totalReports, setTotalReports] = useState(0);
  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");
  const navigate = useNavigate();
  // const fetchReports = async () => {
  //   try {
  //     const data = await postReports({ ...pagination, ...filters }).unwrap();
  //     setReports(data);
  //     setTotalReports(data.length);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };
  const fetchReports = async () => {
    try {
      const data = await postReports({ ...pagination, ...filters }).unwrap();
      console.log(data, "reports");
      setReports(data.reports);

      setTotalReports(data.totalReports);

      const postIdsWithMoreThan3Reports = new Map();

      data.reports.forEach((report) => {
        const postIdCount = data.reports.filter(
          (r) => r.postId === report.postId
        ).length;
        if (postIdCount > 2) {
          postIdsWithMoreThan3Reports.set(report.postId, postIdCount);
        }
      });

      console.log(postIdsWithMoreThan3Reports, "postIdsWithMoreThan3Reports");

      const filteredReports = data.reports.filter((report) =>
        postIdsWithMoreThan3Reports.has(report.postId)
      );

      console.log(filteredReports, "filteredReports");

      // Remove duplicates based on postId
      const uniqueCriticalReports = Array.from(
        new Set(filteredReports.map((report) => report.postId))
      ).map((postId) => {
        const firstMatchingReport = filteredReports.find(
          (report) => report.postId === postId
        );
        const count = postIdsWithMoreThan3Reports.get(postId);
        return { ...firstMatchingReport, count };
      });

      console.log(uniqueCriticalReports, "uniqueCriticalReports");

      setCriticalReports(uniqueCriticalReports);
    } catch (error) {
      console.log(error);
    }
  };
  console.log(totalReports, "totalreports.s");
  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  useEffect(() => {
    fetchReports();
  }, [pagination, filters]);

  // useEffect(() => {
  //   const postIdsWithMoreThan3Reports = new Set();

  //   reports.forEach((report) => {
  //     const postIdCount = reports.filter(
  //       (r) => r.postId === report.postId
  //     ).length;
  //     if (postIdCount > 3) {
  //       postIdsWithMoreThan3Reports.add(report.postId);
  //     }
  //   });

  //   const filteredReports = reports.filter((report) =>
  //     postIdsWithMoreThan3Reports.has(report.postId)
  //   );

  //   // Remove duplicates based on postId
  //   const uniqueCriticalReports = Array.from(
  //     new Set(filteredReports.map((report) => report.postId))
  //   ).map((postId) =>
  //     filteredReports.find((report) => report.postId === postId)
  //   );

  //   console.log(uniqueCriticalReports, "uniqueCriticalReports");

  //   setCriticalReports(uniqueCriticalReports);
  // }, []);
  console.log(criticalReports, "crititcalReports.s");

  const handleDelete = async (postId) => {
    console.log("inside the deleted post");
    const data = await postDelete({ postId }).unwrap();
    console.log(data);
    if (data.success) {
      toast.success("Post Deleted successfully");
      fetchReports();
    }
  };
  const handleButtonClick = (postId) => {
    navigate(`/admin/posts/${postId}`, { state: { isAdmin: true } });
  };

  return (
    <div>
      {isLoading ? (
        <>
          <div
            style={{
              height: "50vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Loader size={30} color="	#0d98ba" />
          </div>
        </>
      ) : (
        <>
          <div className="my-2">
            <ReportsFilters onFilterChange={handleFilterChange} />
          </div>
          {reports.length === 0 ? (
            <span>No reports available.</span>
          ) : (
            <>
              <Box
                width="100%"
                display={isNonMobileScreens ? "flex" : "block"}
                gap="0.5rem"
                justifyContent="space-between"
                style={{
                  maxHeight: "calc(100vh - 6rem)",
                  overflowY: "auto",
                }}
              >
                <Box>
                  <Typography variant="h5" gutterBottom>
                    Reports
                  </Typography>
                  <TableContainer component={Paper} className="my-3">
                    <Table>
                      <TableHead
                        sx={{
                          backgroundColor: "lightblue",
                          fontFamily: "sans-serif",
                        }}
                      >
                        <TableRow>
                          <TableCell>Reporter ID</TableCell>
                          <TableCell>Post ID</TableCell>
                          <TableCell scope="60">Report Reason</TableCell>
                          <TableCell>Reported Time</TableCell>
                          <TableCell>Post Link</TableCell>
                          <TableCell>Options</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reports.map((report) => (
                          <TableRow key={report._id}>
                            <TableCell>{report.reporterId}</TableCell>
                            <TableCell>{report.postId}</TableCell>
                            <TableCell scope="60">
                              {report.reportReason}
                            </TableCell>
                            <TableCell>{format(report.timestamp)}</TableCell>

                            <TableCell>
                              {
                                <button
                                  style={{
                                    fontSize: "1.2rem",
                                    textDecoration: "none",
                                  }}
                                  onClick={() => {
                                    handleButtonClick(report.postId);
                                  }}
                                >
                                  Link
                                </button>
                              }
                            </TableCell>
                            <TableCell>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDelete(report.postId)}
                              >
                                Delete
                              </button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Pagination
                    count={Math.ceil(totalReports / pagination.pageSize)}
                    page={pagination.page}
                    onChange={(event, newPage) => handlePageChange(newPage)}
                  />
                </Box>
                {criticalReports.length > 0 && (
                  <Box style={isNonMobileScreens ? { marginLeft: 90 } : {}}>
                    <Typography
                      variant="h4"
                      gutterBottom
                      className="text-center"
                    >
                      Critical Posts
                    </Typography>
                    <TableContainer
                      component={Paper}
                      className="my-3"
                      sx={{ width: "100%" }}
                    >
                      <Table>
                        <TableHead
                          sx={{
                            backgroundColor: "lightblue",
                            fontFamily: "sans-serif",
                          }}
                        >
                          <TableRow>
                            <TableCell>Post Link</TableCell>
                            <TableCell>Count</TableCell>
                            <TableCell>Options</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {criticalReports.map((report) => (
                            <TableRow key={report._id}>
                              <TableCell>
                                {
                                  <button
                                    style={{
                                      fontSize: "1.2rem",
                                      textDecoration: "none",
                                    }}
                                    onClick={() => {
                                      handleButtonClick(report.postId);
                                    }}
                                  >
                                    Link
                                  </button>
                                }
                              </TableCell>
                              <TableCell>{report.count}</TableCell>
                              <TableCell>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleDelete(report.postId)}
                                >
                                  Delete
                                </button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
              </Box>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AdminReports;
