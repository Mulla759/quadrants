import { Circle } from "lucide-react"
import { Container } from "../ui/Container"
import { MonoLabel } from "../ui/MonoLabel"
import { cn } from "../../lib/utils"

type Category = { index: string; name: string; color: string; description: string }

const CATEGORIES: Category[] = [
  { index: "01", name: "School", color: "#4E8A7E", description: "Essays, readings, exams" },
  { index: "02", name: "Website", color: "#5B7CBA", description: "The side project" },
  { index: "03", name: "Career", color: "#9A5C8F", description: "Applications, interviews" },
  { index: "04", name: "Finance", color: "#B98A2F", description: "Bills, budget, forms" },
  { index: "05", name: "Private", color: "#C05F45", description: "Family and friends" },
  { index: "06", name: "Scouts", color: "#6E9163", description: "Troop meetings, trips" },
  { index: "07", name: "Health", color: "#BC5B6B", description: "Runs, sleep, check-ups" },
  { index: "08", name: "Admin", color: "#64748B", description: "Errands and paperwork" },
]

function CategoryCell({ category, first }: { category: Category; first: boolean }) {
  return (
    <div
      className={cn(
        "flex h-[177px] flex-1 flex-col gap-[20px] border-r border-line py-[28px] pr-[24px]",
        first ? "pl-0" : "pl-[24px]",
      )}
    >
      <div className="whitespace-nowrap font-mono text-[12px] text-faint">{category.index}</div>
      <div className="flex w-fit shrink-0 flex-row items-center gap-[14px]">
        <span
          className="h-[14px] w-[14px] shrink-0 rounded-full"
          style={{ backgroundColor: category.color }}
        />
        <div className="whitespace-nowrap text-[36px] font-medium tracking-[-1.2px] text-ink">
          {category.name}
        </div>
      </div>
      <div className="whitespace-nowrap text-[14px] text-muted">{category.description}</div>
    </div>
  )
}

export function CategoriesSection() {
  const rows = [CATEGORIES.slice(0, 4), CATEGORIES.slice(4, 8)]
  return (
    <section id="categories" className="w-full scroll-mt-[72px] bg-bg">
      <Container className="flex flex-col gap-[80px] border-t border-line pt-[136px] pb-[144px]">
        <div className="flex w-full flex-row items-end justify-between">
          <div className="flex w-fit shrink-0 flex-col gap-[20px]">
            <MonoLabel>04 — CATEGORIES</MonoLabel>
            <h2 className="whitespace-nowrap text-[52px]/[55px] font-semibold tracking-[-1.8px] text-ink">
              Color means life area.
              <br />
              Nothing else.
            </h2>
          </div>
          <p className="w-[420px] shrink-0 text-[17px]/[27px] text-muted">
            Tag tasks with up to eight muted colors — whatever your life is made of. The quadrants
            stay neutral, so a glance at the dots shows when one part of your life is crowding out
            the rest.
          </p>
        </div>

        <div className="flex w-full flex-col border-t border-line">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex w-full flex-row border-b border-line">
              {row.map((category, cellIndex) => (
                <CategoryCell
                  key={category.name}
                  category={category}
                  first={cellIndex === 0}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="flex w-full flex-row items-center gap-[40px]">
          <MonoLabel>ON A TASK</MonoLabel>
          <div className="flex h-[36px] w-[520px] shrink-0 flex-row items-center gap-[10px] rounded-[6px] border border-line bg-surface px-[12px]">
            <Circle size={16} className="shrink-0 text-muted" />
            <div className="flex-1 text-[15px] text-ink">Prepare interview notes</div>
            <div className="flex w-fit shrink-0 flex-row items-center gap-[6px]">
              <span className="h-[6px] w-[6px] shrink-0 rounded-full bg-[#9A5C8F]" />
              <div className="whitespace-nowrap text-[12px] text-muted">Career · Fri</div>
            </div>
          </div>
          <div className="text-[15px] text-muted">
            One small dot, right before the tag. That’s all the color you’ll see.
          </div>
        </div>
      </Container>
    </section>
  )
}
