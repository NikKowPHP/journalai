import { AdminDashboard } from "@/components/AdminDashboard"

const mockUsers = [
  { email: "user1@example.com", tier: "Pro", status: "Active" },
  { email: "user2@example.com", tier: "Free", status: "Inactive" },
  { email: "user3@example.com", tier: "Expert", status: "Active" },
]

export default function AdminPage() {
  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <div className="p-6 border rounded-lg bg-background">
        <AdminDashboard users={mockUsers} />
      </div>
    </div>
  )
}