"use client";
import { useState, useMemo, useEffect } from "react";
import { ClipboardList, Plus, Filter, SortAsc, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomBreadcrumb } from "@/components/custom-breadcrumb/breadcrumb-custom-component";
import { TaskCard } from "@/components/task/taskCard";
import { Spinner } from "@/components/spinner/spinner";
import { BREADCRUMB_ITEMS, TAB_ITEMS } from "@/constants/taskViewConfig";
import { TaskPriority, TaskStatus } from "@/enums/task.enum";
import * as Case from "case";
import APIService from "@/api/apiService";
import { UserAPI } from "@/api/user";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { TaskCardSkeletonList } from "@/components/task/skeleton/skeletonTaskList";

interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  comment_count: number;
  assigneeUser?: { name: string };
  assigneeId?: string;
  createdByUser?: { name: string };
  dueDate?: string;
  createdAt: string;
}

interface MappedTask {
  id: string;
  name: string;
  slug: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  assigneeId: string;
  createdBy: string;
  dueDate?: string;
  createdAt: string;
}

interface PaginationMetadata {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

type SortOption = "default" | "newest" | "oldest" | "priority" | "dueDate";

const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const response = await APIService.get(UserAPI.task.list);
        const data = response.data?.data;

        let fetchedTasks: Task[] = [];

        if (Array.isArray(data)) {
          fetchedTasks = data;
        } else if (typeof data === "object" && data !== null) {
          fetchedTasks = Object.values(data.tasks || data);
        } else {
          fetchedTasks = [];
        }

        setTasks(fetchedTasks);
      } catch (error) {
        setError("Failed to load tasks");
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  return { tasks, loading, error };
};

const mapTasks = (tasks: Task[]): MappedTask[] => {
  return tasks.map((task) => ({
    id: task.id,
    name: task.title,
    slug: task.title ? Case.kebab(task.title) : task.id,
    status: task.status || TaskStatus.DOING,
    priority: (task.priority || TaskPriority.LOW).toLowerCase() as TaskPriority,
    assignee: task.assigneeUser?.name || "",
    assigneeId: task.assigneeId || "",
    createdBy: task.createdByUser?.name || "",
    dueDate: task.dueDate,
    createdAt: task.createdAt,
  }));
};

const TaskFilterSort = ({
  searchQuery,
  setSearchQuery,
  activeFilter,
  setActiveFilter,
  sortOption,
  setSortOption,
  resetPage,
}: {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  activeFilter: TaskPriority | null;
  setActiveFilter: (value: TaskPriority | null) => void;
  sortOption: SortOption;
  setSortOption: (value: SortOption) => void;
  resetPage: () => void;
}) => (
  <div className="flex flex-col sm:flex-row gap-2">
    <motion.div
      className="relative"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        className="pl-10"
        placeholder="Search tasks..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          resetPage();
        }}
      />
    </motion.div>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="sm"
            className={activeFilter ? "bg-blue-50 dark:bg-blue-900/20" : ""}
          >
            <Filter className="h-4 w-4 mr-2" /> {activeFilter || "Filter"}
          </Button>
        </motion.div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {Object.values(TaskPriority).map((priority) => (
          <DropdownMenuItem
            key={priority}
            onClick={() => {
              setActiveFilter(activeFilter === priority ? null : priority);
              resetPage();
            }}
          >
            {Case.capital(priority)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="outline" size="sm">
            <SortAsc className="h-4 w-4 mr-2" /> Sort
          </Button>
        </motion.div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={() => {
            setSortOption("default");
            resetPage();
          }}
        >
          Default (by Priority)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setSortOption("newest");
            resetPage();
          }}
        >
          Newest First
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setSortOption("oldest");
            resetPage();
          }}
        >
          Oldest First
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setSortOption("priority");
            resetPage();
          }}
        >
          Priority
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setSortOption("dueDate");
            resetPage();
          }}
        >
          Due Date
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);

const TaskPagination = ({
  pagination,
  setPage,
}: {
  pagination: PaginationMetadata;
  setPage: (page: number) => void;
}) => {
  const { currentPage, totalPages, totalItems, pageSize } = pagination;

  const maxVisiblePages = 5;
  const startPage = Math.max(
    1,
    Math.min(
      currentPage - Math.floor(maxVisiblePages / 2),
      totalPages - maxVisiblePages + 1,
    ),
  );
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  const visiblePages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i,
  );

  return (
    <motion.div
      className="mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-sm text-muted-foreground mb-2">
        Showing {(currentPage - 1) * pageSize + 1} to{" "}
        {Math.min(currentPage * pageSize, totalItems)} of {totalItems} tasks
      </div>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <motion.div whileHover={{ x: -2 }} whileTap={{ scale: 0.95 }}>
              <PaginationPrevious
                onClick={
                  currentPage === 1
                    ? undefined
                    : () => setPage(Math.max(1, currentPage - 1))
                }
                aria-disabled={currentPage === 1}
                className={
                  currentPage === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </motion.div>
          </PaginationItem>
          {visiblePages.map((page) => (
            <PaginationItem key={page}>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <PaginationLink
                  onClick={() => setPage(page)}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              </motion.div>
            </PaginationItem>
          ))}
          <PaginationItem>
            <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.95 }}>
              <PaginationNext
                onClick={
                  currentPage === totalPages
                    ? undefined
                    : () => setPage(Math.min(totalPages, currentPage + 1))
                }
                aria-disabled={currentPage === totalPages}
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </motion.div>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </motion.div>
  );
};

export default function TasksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<TaskPriority | null>(null);
  // MODIFIED: Set initial state to 'default'
  const [sortOption, setSortOption] = useState<SortOption>("default");
  const [activeTab, setActiveTab] = useState(TAB_ITEMS[0]!.value);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { user } = useAuth();

  const currentUserId = user?.id;

  const { tasks, loading, error } = useTasks();
  const mappedTasks = useMemo(() => mapTasks(tasks), [tasks]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, searchQuery, activeFilter, sortOption]);

  const filteredTasks = useMemo(() => {
    const filteredAndTabbedTasks = mappedTasks.filter((task) => {
      if (activeTab === "my-tasks" && task.assigneeId !== currentUserId) {
        return false;
      }
      if (activeTab === "completed" && task.status !== TaskStatus.CLOSED) {
        return false;
      }
      if (activeFilter && task.priority !== activeFilter) {
        return false;
      }
      return !(
        searchQuery &&
        !task.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

    if (sortOption === "default") {
      return filteredAndTabbedTasks;
    }

    return [...filteredAndTabbedTasks].sort((a, b) => {
      if (sortOption === "newest") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      if (sortOption === "oldest") {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
      if (sortOption === "dueDate") {
        return (
          new Date(a.dueDate || "9999-12-31").getTime() -
          new Date(b.dueDate || "9999-12-31").getTime()
        );
      }
      if (sortOption === "priority") {
        const priorityOrder = {
          [TaskPriority.CRITICAL]: 4,
          [TaskPriority.HIGH]: 3,
          [TaskPriority.MEDIUM]: 2,
          [TaskPriority.LOW]: 1,
        };
        return (
          (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
        );
      }
      return 0;
    });
  }, [
    mappedTasks,
    searchQuery,
    activeFilter,
    sortOption,
    activeTab,
    currentUserId,
  ]);

  const totalItems = filteredTasks.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedTasks = filteredTasks.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const resetPage = () => setPage(1);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <CustomBreadcrumb
        icon={<ClipboardList className="h-4 w-4" />}
        items={BREADCRUMB_ITEMS}
      />

      <div className="mx-auto">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div
            className="flex flex-col sm:flex-row justify-between gap-4 mb-6"
            variants={headerVariants}
          >
            <div>
              <h1 className="text-3xl font-bold">Tasks</h1>
              <p className="text-muted-foreground">
                Manage and track your team's tasks
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Button asChild>
                <Link href="/task/new">
                  <Plus className="mr-2 h-4 w-4" /> New Task
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <motion.div
              className="flex flex-col sm:flex-row justify-between gap-4 mb-6"
              variants={headerVariants}
            >
              <TabsList>
                {TAB_ITEMS.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.title}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TaskFilterSort
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                sortOption={sortOption}
                setSortOption={setSortOption}
                resetPage={resetPage}
              />
            </motion.div>

            {TAB_ITEMS.map((tab) => (
              <TabsContent key={tab.value} value={tab.value}>
                {loading ? (
                  <motion.div
                    className="text-center py-10 text-muted-foreground "
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <TaskCardSkeletonList />
                  </motion.div>
                ) : error ? (
                  <motion.div
                    className="text-center py-10 text-red-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {error}
                  </motion.div>
                ) : paginatedTasks.length ? (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${activeTab}-${page}-${searchQuery}-${activeFilter}-${sortOption}`}
                      className="grid gap-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {paginatedTasks.map((task, index) => (
                        <TaskCard key={task.id} task={task} index={index} />
                      ))}
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <motion.div
                    className="text-center py-10 text-muted-foreground"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {tab.emptyMessage}
                  </motion.div>
                )}
                <TaskPagination
                  pagination={{
                    totalItems,
                    totalPages,
                    currentPage: page,
                    pageSize,
                  }}
                  setPage={setPage}
                />
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
