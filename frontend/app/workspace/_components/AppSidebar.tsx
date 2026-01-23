'use client'
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/sidebar"
import Link from "next/link"
import Image from "next/image"
import { useContext, useEffect, useState } from "react"
import { UserDetailContext } from "@/context/UserDetailContext"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@clerk/nextjs"
import { Ghost, Trash2, AlertTriangle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import axios from "axios"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import ProfileSettingsDialog from "./ProfileSettingsDialog"

export function AppSidebar() {

  const [projectList, setProjectList] = useState([]);
  const { userDetail, setUserDetail, refreshCredits } = useContext(UserDetailContext);
  const [loading, setLoading] = useState(false);
  const { has, getToken } = useAuth();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    GetProjectList();
    refreshCredits();
  }, []);

  const hasUnlimitedAccess = has && has({ plan: 'unlimited' });

  const GetProjectList = async () => {
    setLoading(true);
    const token = await getToken();
    const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/projects', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const result = await response.json();
    console.log(result.data);
    setProjectList(result.data || []);
    setLoading(false);
  }

  const handleDeleteProject = async () => {
    if (!deleteId) return;

    try {
      const token = await getToken();
      await axios.delete(process.env.NEXT_PUBLIC_API_URL + `/api/projects/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Project deleted successfully');
      GetProjectList(); // Refresh the list
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    } finally {
      setDeleteId(null);
    }
  }

  return (
    <Sidebar>
      <SidebarHeader className="p-5">
        <Link href='/' className="flex gap-2 items-center">
          <Image src={'/logo.svg'} alt='Logo' width={40} height={40} />
          <h2 className="font-bold text-2xl">Webyrix</h2>
        </Link>
        <Link href={'/workspace'} className="w-full mt-5">
          <Button className="w-full">
            + Add New Project
          </Button>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarGroup >
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          {!loading && projectList.length == 0 &&
            <h2 className="text-sm px-2 text-muted-foreground">No Project Found</h2>
          }
          <div className="flex flex-col gap-1">
            {loading ? (
              [1, 2, 3, 4, 5].map((_, index) => (
                <Skeleton key={index} className="w-full h-10 rounded-lg mt-2" />
              ))
            ) : (
              projectList.map((project: any, index) => (
                <div key={index} className="group relative">
                  <Link href={`/playground/${project.projectId}?frameId=${project.frameId}`} className="flex flex-1 my-1 hover:bg-secondary p-2 rounded-lg cursor-pointer transition-colors pr-10">
                    <h2 className="line-clamp-1 text-sm font-medium">
                      {project?.chats[0]?.chatMessage[0]?.content || 'Untitled Project'}
                    </h2>
                  </Link>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(project.projectId);
                        }}
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-background border-border">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                          <AlertTriangle className="h-5 w-5" />
                          Delete Project
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                          Are you sure you want to delete this project? This will permanently remove all associated frames and chat history. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-secondary hover:bg-secondary/80">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteProject}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete Permanently
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))
            )}
          </div>
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter className="p-2">
        {!hasUnlimitedAccess && <div className="p-3 border rounded-xl space-y-3 bg-secondary">
          <h2 className="flex justify-between items-center text-sm font-medium">Remaining Credits<span className="font-bold">{userDetail?.credits}</span></h2>
          <Progress value={(userDetail?.credits / 2) * 100} />
          <Link href={'/workspace/pricing'} className="w-full">
            <Button className="w-full text-xs" variant="outline">
              Upgrade to Unlimited
            </Button>
          </Link>
        </div>}
        <div className="flex gap-2 items-center pt-2">
          <ProfileSettingsDialog />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}