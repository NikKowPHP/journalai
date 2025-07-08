import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useState } from "react"

interface User {
  email: string
  tier: string
  status: string
}

interface AdminDashboardProps {
  users: User[]
}

export function AdminDashboard({ users }: AdminDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm focus-visible:ring-2 focus-visible:ring-primary"
      />
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Tier</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.email} className="hover:bg-muted/50">
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.tier}</TableCell>
              <TableCell>
                <span className={user.status === "Active" ? "text-green-600" : "text-red-600"}>
                  {user.status}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}