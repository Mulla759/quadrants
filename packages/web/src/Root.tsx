import { App } from "./App"
import { LandingPage } from "./landing/LandingPage"
import { usePathname } from "./router"

function isAppPath(pathname: string): boolean {
  return pathname === "/app" || pathname.startsWith("/app/")
}

export function Root() {
  const pathname = usePathname()
  return isAppPath(pathname) ? <App /> : <LandingPage />
}
