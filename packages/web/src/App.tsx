import { AppShell } from "./components/shell/AppShell"
import { Hotkeys } from "./components/shell/Hotkeys"
import { CategoriesDialog } from "./components/categories/CategoriesDialog"
import { TaskDetail } from "./components/detail/TaskDetail"
import { CommandPalette } from "./components/palette/CommandPalette"
import { PrintSheet } from "./components/print/PrintSheet"
import { SearchDialog } from "./components/palette/SearchDialog"
import { Toaster } from "./components/ui/Toaster"
import { UIProvider } from "./lib/ui"
import { WorkspaceProvider } from "./lib/workspace"

export function App() {
  return (
    <WorkspaceProvider>
      <UIProvider>
        <AppShell />
        <TaskDetail />
        <Hotkeys />
        <CommandPalette />
        <SearchDialog />
        <CategoriesDialog />
        <PrintSheet />
        <Toaster />
      </UIProvider>
    </WorkspaceProvider>
  )
}
