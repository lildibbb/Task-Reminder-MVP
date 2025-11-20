"use client";

import { columns } from "@/components/users/columns";
import { UsersDataTable } from "@/components/users/users-data-table";

import { AdminAPI } from "@/api/admin";
import APIService from "@/api/apiService";
import { AddMember } from "@/components/users/add-member";
import { CircleUserRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CustomBreadcrumb } from "@/components/custom-breadcrumb/breadcrumb-custom-component";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await APIService.get(AdminAPI.users.list);

        setUsers(response.data.data);
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
      }
    };

    getUsers();
  }, []);

  return (
    <div className="container mx-auto py-6 px-4">
      <CustomBreadcrumb
        icon={<CircleUserRound className="h-4 w-4" />}
        items={[
          { link: "/", text: "Users" },
          { link: "/users", text: "List Users" },
        ]}
      />

      <div className="max-w-screen mx-auto">
        <div className="flex justify-between ">
          <h1 className="text-3xl font-bold mb-2">Users</h1>
          <AddMember />
        </div>
        <p className="text-gray-600 mb-8">
          You can view and manage all users here.
        </p>
        <UsersDataTable columns={columns} data={users} />
      </div>
    </div>
  );
}
