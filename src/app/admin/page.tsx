"use client";
import { AdminDashboard } from "@/components/AdminDashboard";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState, useEffect } from "react";

const PAGE_LIMIT = 20;

export default function AdminPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setPage(1); // Reset to first page on new search
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-users", debouncedSearchTerm, page],
    queryFn: () =>
      axios
        .get("/api/admin/users", {
          params: {
            search: debouncedSearchTerm,
            page: page,
            limit: PAGE_LIMIT,
          },
        })
        .then((res) => res.data),
  });

  if (error) {
    return (
      <div className="container mx-auto p-8 space-y-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="p-6 border rounded-lg bg-background">
          <p className="text-red-500">
            Error loading users: {(error as Error).message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <div className="p-6 border rounded-lg bg-background">
        <AdminDashboard
          users={data?.users || []}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          isLoading={isLoading}
          page={page}
          setPage={setPage}
          totalCount={data?.totalCount || 0}
          limit={PAGE_LIMIT}
        />
      </div>
    </div>
  );
}