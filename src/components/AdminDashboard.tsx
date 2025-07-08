import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const mockUsers = [
  { email: "user1@example.com", tier: "Pro", status: "Active" },
  { email: "user2@example.com", tier: "Free", status: "Inactive" },
  { email: "user3@example.com", tier: "Expert", status: "Active" },
]

export function AdminDashboard() {
  return (
    <div className="space-y-4">
      <Input placeholder="Search users by email..." />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Subscription Tier</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockUsers.map((user) => (
            <TableRow key={user.email}>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.tier}</TableCell>
              <TableCell>{user.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}