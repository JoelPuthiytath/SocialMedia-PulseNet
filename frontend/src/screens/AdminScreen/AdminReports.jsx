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
import { usePostReportsMutation } from "../../slices/AdminApiSlice";
import Loader from "../../loader/GridLoader";
import { format } from "timeago.js";

import ReportsFilters from "../../components/reportsFilter";
import { Link } from "react-router-dom";
const AdminReports = () => {
  const [postReports, { isLoading }] = usePostReportsMutation();
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [filters, setFilters] = useState({});
  const [totalReports, setTotalReports] = useState(0);

  const fetchReports = async () => {
    try {
      const data = await postReports({ ...pagination, ...filters }).unwrap();
      setReports(data);
      setTotalReports(data.length);
    } catch (error) {
      console.log(error);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  useEffect(() => {
   
    fetchReports();
  }, [pagination, filters]);

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
          <div className="my-3">
            <ReportsFilters onFilterChange={handleFilterChange} />
          </div>
          {reports.length === 0 ? (
            <span>No reports available.</span>
          ) : (
            <>
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
                      <TableCell>Report Reason</TableCell>
                      <TableCell>Reported Time</TableCell>
                      <TableCell>Post Link</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report._id}>
                        <TableCell>{report.reporterId}</TableCell>
                        <TableCell>{report.postId}</TableCell>
                        <TableCell>{report.reportReason}</TableCell>
                        <TableCell>{format(report.timestamp)}</TableCell>

                        <TableCell>
                          {
                            <Link
                              to={`http://localhost:5000/posts/${report.postId}`}
                              style={{
                                fontSize: "1.2rem",
                                textDecoration: "none",
                              }}
                            >
                              Link
                            </Link>
                          }
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
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AdminReports;
