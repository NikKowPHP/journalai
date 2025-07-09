import { AdminDashboard } from "@/components/AdminDashboard";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function AdminPage() {
  const { data: users, isLoading, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => axios.get("/api/admin/users").then(res => res.data),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-8 space-y-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="p-6 border rounded-lg bg-background">
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 space-y-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="p-6 border rounded-lg bg-background">
          <p className="text-red-500">Error loading users: {error.message}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <div className="p-6 border rounded-lg bg-background">
        <AdminDashboard users={users || []} />
      </div>
    </div>
  );
}
