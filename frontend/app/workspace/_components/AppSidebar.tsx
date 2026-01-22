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
import { useAuth, UserButton } from "@clerk/nextjs"
import { Ghost } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export function AppSidebar() {

  const [projectList, setProjectList] = useState([]);
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const [loading, setLoading] = useState(false);
  const { has, getToken } = useAuth();

  useEffect(() => {
    GetProjectList();
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
    setProjectList(result);
    setLoading(false);
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
          <div>
            {(!loading && projectList.length > 0) ? projectList.map((project: any, index) => (
              <Link href={`/playground/${project.projectId}?frameId=${project.frameId}`} key={index} className="my-2 hover:bg-secondary p-2 rounded-lg cursor-pointer">
                <h2 className="line-clamp-1">
                  {project?.chats[0].chatMessage[0]?.content}
                </h2>
              </Link>
            )) :
              [1, 2, 3, 4, 5].map((_, index) => (
                <Skeleton key={index} className="w-full h-10 rounded-lg mt-2" />
              ))
            }
          </div>
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter className="p-2">
        {!hasUnlimitedAccess && <div className="p-3 border rounded-xl space-y-3 bg-secondary">
          <h2 className="flex justify-between items-center">Remaining Credits<span className="font-bold">{userDetail?.credits}</span></h2>
          <Progress value={(userDetail?.credits / 2) * 100} />
          <Link href={'/workspace/pricing'} className="w-full">
            <Button className="w-full">
              Upgrade to Unlimited
            </Button>
          </Link>
        </div>}
        <div className="flex gap-2 item-center">
          <UserButton />
          <Button variant={'ghost'}>Settings</Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}