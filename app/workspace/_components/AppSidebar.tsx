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
import { useContext, useState } from "react"
import { UserDetailContext } from "@/context/UserDetailContext"
import { Progress } from "@/components/ui/progress"
import { UserButton } from "@clerk/nextjs"
import { Ghost } from "lucide-react"

export function AppSidebar() {

const [projectList, setProjectList] = useState([]);
const { userDetail, setUserDetail } = useContext(UserDetailContext);

  return (
    <Sidebar>
        <SidebarHeader className="p-5">
            <div className="flex items-center gap-2">
                <Image src={'/logo.svg'} alt='Logo' width={40} height={40} />
                <h2 className="font-bold text-2xl">Webyrix</h2>
            </div>
            <Link href={'/workspace'} className="w-full mt-5">
            <Button className="w-full">
                + Add New Project
            </Button>
        </Link>
        </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarGroup >
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          {projectList.length == 0 && 
             <h2 className="text-sm px-2 text-gray-500">No Project Found</h2>}
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter className="p-2">
        <div className="p-3 border rounded-xl space-y-3 bg-secondary">
            <h2 className="flex justify-between items-center">Remaining Credits<span className="font-bold">{userDetail?.credits}</span></h2>
            <Progress value={33} />
            <Button className="w-full">
                Upgrade to Unlimited
            </Button>
        </div>
        <div className="flex gap-2 item-center">
            <UserButton />
            <Button variant={'ghost'}>Settings</Button>
        </div>
     </SidebarFooter>
    </Sidebar>
  )
}