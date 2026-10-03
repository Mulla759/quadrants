import { App } from "./App"
import { LandingPage } from "./landing/LandingPage"
import { usePathname } from "./router"

export function Root() {
  const pathname = usePathname()
  return pathname.startsWith("/app") ? <App /> : <LandingPage />
}
