import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"
import WritingNav from "./WritingNav"
import { FileSystemNode } from "@/app/writings/api/blog";

interface AppSideBarProps {
  node: FileSystemNode[]
  isMobile: boolean
}

export function AppSidebar({ node, isMobile }: AppSideBarProps) {
  return (
    <Sidebar className="mt-10">
      <SidebarHeader>
        Check
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <WritingNav isMobile={isMobile} nodes={node} />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}

