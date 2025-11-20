"use client";
import APIService from "@/api/apiService";
import { UserAPI } from "@/api/user";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileCode2,
  // GitFork, // Not currently fetched
  Lock,
  MoreVertical,
  Plus,
  Search,
  // SortAsc, // Not currently used in filter UI
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Project } from "./project.type";
import { ProjectSkeleton } from "./skeleton";
import { formatDate } from "@/helpers/helper";
import { CustomBreadcrumb } from "../custom-breadcrumb/breadcrumb-custom-component";

const TABS = [
  { value: "contributed", label: "Contributed" },
  { value: "starred", label: "Starred" },
  { value: "personal", label: "Personal" },
  { value: "member", label: "Member" },
  { value: "inactive", label: "Inactive" },
];

function getPlaceholderAttributes(project: Project) {
  const isPrivate = project.description ? true : false; //just a placeholder, later will implemet this in backend

  const defaultTab = "contributed";
  const defaultRole = "Member";
  const defaultColor = "gray";

  return {
    tab: defaultTab,
    role: defaultRole,
    color: defaultColor,
    isPrivate: isPrivate,
    stars: 0,
    forks: 0,
    members: 0,
    archives: 0,

    slug:
      project.slug ||
      project.name
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/--+/g, "-"),
  };
}

function getInitial(name: string | undefined): string {
  return name?.charAt(0).toUpperCase() || "?";
}

function getColorClass(color: string) {
  switch (color) {
    case "orange":
      return "bg-orange-100 text-orange-800";
    case "blue":
      return "bg-blue-100 text-blue-800";
    case "green":
      return "bg-green-100 text-green-800";
    case "purple":
      return "bg-purple-100 text-purple-800";
    case "yellow":
      return "bg-yellow-100 text-yellow-800";
    case "red":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function ProjectsContentPage() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name");
  const [fetchedProjects, setFetchedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const enrichedProjects = fetchedProjects.map((project) => ({
    ...project,
    ...getPlaceholderAttributes(project),
  }));

  const tabCounts = TABS.reduce(
    (acc, tab) => {
      acc[tab.value] = enrichedProjects.filter(
        (p) => p.tab === tab.value,
      ).length;
      return acc;
    },
    {} as Record<string, number>,
  );

  const getProjectsForTab = (tab: string) => {
    let filtered = enrichedProjects.filter((p) => p.tab === tab);

    if (search) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (sort === "name") {
      filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "created") {
      filtered = filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    return filtered;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await APIService.get(UserAPI.project.list);

        setFetchedProjects(response.data.data);
        console.log("Projects:", response.data.data);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <ProjectSkeleton />;
  }

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4">
      {/* Breadcrumb */}
      <CustomBreadcrumb
        icon={<FileCode2 className="h-4 w-4" />}
        items={[
          { link: "/project", text: "Projects" },
          { link: "/project", text: "List Projects" },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold">Projects</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Link href="/project/new">
            <Button className="flex-1 sm:flex-none">
              <Plus className="h-4 w-4" />
              New project
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="contributed" className="mb-6">
        <TabsList className="border-b w-full justify-start rounded-none bg-transparent h-auto p-0 overflow-x-auto">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-4 py-2 whitespace-nowrap"
            >
              {tab.label}
              <Badge className="ml-1 bg-gray-200 text-gray-700 hover:bg-gray-200">
                {tabCounts[tab.value] || 0}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 mb-4">
              {/* Consider if sort button is needed here if sort is in dropdown */}
              {/* <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                aria-label="Sort direction"
              >
                <SortAsc className="h-4 w-4" />
              </Button> */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search or filter results..."
                  className="pl-10 h-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              {/* Consider if standalone search button is needed */}
              {/* <Button
                variant="outline"
                className="h-10"
                onClick={() => {}}
                aria-label="Search"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button> */}

              <div className="flex items-center gap-2">
                <Select defaultValue={sort} onValueChange={setSort}>
                  <SelectTrigger className="w-[140px] h-10">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="created">Created date</SelectItem>
                    {/* <SelectItem value="updated">Last updated</SelectItem> */}
                  </SelectContent>
                </Select>
                {/* Consider if sort direction button is needed here */}
                {/* <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  aria-label="Sort order"
                >
                  <SortAsc className="h-4 w-4" />
                </Button> */}
              </div>
            </div>

            {/* Projects List */}
            <div className="border rounded-md overflow-x-auto">
              {getProjectsForTab(tab.value).length === 0 ? (
                <div className="flex justify-center items-center p-8 text-gray-500">
                  <p>
                    {search || sort !== "name"
                      ? "No matching projects found in this tab."
                      : `No ${tab.label.toLowerCase()} projects found.`}
                  </p>
                </div>
              ) : (
                getProjectsForTab(tab.value).map((project) => (
                  <div
                    key={project.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b last:border-b-0 hover:bg-gray-50 gap-4"
                  >
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div
                        className={`${getColorClass(
                          project.color,
                        )} w-8 h-8 flex items-center justify-center rounded font-bold`}
                      >
                        {getInitial(project.name)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1 flex-wrap">
                          <Link
                            href={`/project/${project.slug}`}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {project.name}
                          </Link>
                          {project.isPrivate && (
                            <Lock className="h-4 w-4 text-gray-500" />
                          )}
                          <Badge variant="outline" className="ml-2 text-xs">
                            {project.role}
                          </Badge>{" "}
                          {/* TODO: in backend give role to backend user related to this project e.g : member, maintainer, owner  */}
                        </div>

                        <div className="text-sm text-gray-500 mt-1">
                          Created {formatDate(project.createdAt)}{" "}
                          {/* TODO: will implement date to relative time, e.g 2 weeks ago, 3 months agon */}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                      {/* Hardcoded placeholder counts for now */}
                      {/* <div className="flex items-center gap-1 text-gray-500">
                        <Star className="h-4 w-4" />
                        <span>{project.stars}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <GitFork className="h-4 w-4" />
                        <span>{project.forks}</span>
                      </div> */}
                      <div className="flex items-center gap-1 text-gray-500">
                        <Users className="h-4 w-4" />
                        <span>{project.members || 0}</span>{" "}
                      </div>
                      {/* <div className="flex items-center gap-1 text-gray-500">
                        <Archive className="h-4 w-4" />
                        <span>{project.archives}</span>
                      </div> */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit project</DropdownMenuItem>
                          <DropdownMenuItem>Star project</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Delete project
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
