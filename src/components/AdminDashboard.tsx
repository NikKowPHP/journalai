"use client";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

interface User {
  id: string;
  email: string;
  tier: string;
  status: string;
}

interface AdminDashboardProps {
  users: User[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export function AdminDashboard({ users, searchTerm, onSearchChange }: AdminDashboardProps) {

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
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
            <Link key={user.id} href={`/admin/users/${user.id}`}>
              <TableRow className="hover:bg-muted/50 cursor-pointer">
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.tier}</TableCell>
                <TableCell>
                  <span
                    className={
                      user.status === "Active" ? "text-green-600" : "text-red-600"
                    }
                  >
                    {user.status}
                  </span>
                </TableCell>
              </TableRow>
            </Link>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
