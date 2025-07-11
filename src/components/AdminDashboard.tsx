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
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface User {
  id: string;
  email: string;
  subscriptionTier: string;
  subscriptionStatus: string;
}

interface AdminDashboardProps {
  users: User[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  isLoading: boolean;
}

const SkeletonRow = () => (
  <TableRow>
    <TableCell>
      <Skeleton className="h-5 w-48" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-5 w-16" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-5 w-24" />
    </TableCell>
  </TableRow>
);

export function AdminDashboard({ users, searchTerm, onSearchChange, isLoading }: AdminDashboardProps) {
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
          {isLoading ? (
            <>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </>
          ) : (
            users.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/50 cursor-pointer">
                    <TableCell><Link href={`/admin/users/${user.id}`} className="block w-full h-full">{user.email}</Link></TableCell>
                    <TableCell><Link href={`/admin/users/${user.id}`} className="block w-full h-full">{user.subscriptionTier}</Link></TableCell>
                    <TableCell>
                    <Link href={`/admin/users/${user.id}`} className="block w-full h-full">
                        <span className={user.subscriptionStatus === "ACTIVE" ? "text-green-600" : "text-red-600"}>
                            {user.subscriptionStatus}
                        </span>
                    </Link>
                    </TableCell>
                </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}