import React from "react";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import AdminRevenueReport from "./AdminRevenueReport";

const AdminPage = () => {
  useDocumentTitle("Trang Quản Trị");
  return <AdminRevenueReport />;
};

export default AdminPage;
