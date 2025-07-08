import { AdminDashboard } from "@/components/AdminDashboard"

const mockUsers = [
  { email: "user1@example.com", tier: "Pro", status: "Active" },
  { email: "user2@example.com", tier: "Free", status: "Inactive" },
  { email: "user3@example.com", tier: "Expert", status: "Active" },
]

export default function AdminPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <AdminDashboard users={mockUsers} />
    </div>
  )
}