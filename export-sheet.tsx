"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import html2canvas from "html2canvas"
import { Download, ImageDown, Sparkles, Layers, CircleCheck, CircleDashed } from "lucide-react"
import { fortniteSprites, variantDefs, type VariantId } from "@/lib/sprites"
import { SpriteCard } from "@/components/sprite-card"
import { ExportSheet, type ExportMode } from "@/components/export-sheet"

type VariantFlags = Record<VariantId, boolean>
type OwnedState = Record<string, VariantFlags>

function buildInitialState(): OwnedState {
  const state: OwnedState = {}
  for (const sprite of fortniteSprites) {
    state[sprite.name] = { base: false, gold: false, gummy: false, galaxy: false, holofoil: false }
  }
  return state
}

export default function Page() {
  const [owned, setOwned] = useState<OwnedState>(buildInitialState)
  const [mastered, setMastered] = useState<OwnedState>(buildInitialState)
  const [exportMode, setExportMode] = useState<ExportMode | null>(null)
  const [busy, setBusy] = useState<ExportMode | null>(null)
  const sheetRef = useRef<HTMLDivElement>(null)

  const toggle = useCallback((spriteName: string, variant: VariantId) => {
    setOwned((prev) => {
      const nextOwned = !prev[spriteName][variant]
      // Un-owning a variant also clears its mastered status.
      if (!nextOwned) {
        setMastered((m) => ({
          ...m,
          [spriteName]: { ...m[spriteName], [variant]: false },
        }))
      }
      return {
        ...prev,
        [spriteName]: { ...prev[spriteName], [variant]: nextOwned },
      }
    })
  }, [])

  const toggleMaster = useCallback((spriteName: string, variant: VariantId) => {
    setMastered((prev) => {
      const nextMastered = !prev[spriteName][variant]
      // Mastering a variant implies you own it.
      if (nextMastered) {
        setOwned((o) => ({
          ...o,
          [spriteName]: { ...o[spriteName], [variant]: true },
        }))
      }
      return {
        ...prev,
        [spriteName]: { ...prev[spriteName], [variant]: nextMastered },
      }
    })
  }, [])

  const stats = useMemo(() => {
    const collectible = variantDefs.filter((v) => !v.comingSoon)
    const total = fortniteSprites.length * collectible.length
    let ownedTotal = 0
    for (const sprite of fortniteSprites) {
      for (const v of collectible) {
        if (owned[sprite.name]?.[v.id]) ownedTotal++
      }
    }
    return { total, ownedTotal, missing: total - ownedTotal }
  }, [owned])

  // When an export mode is set, the off-screen sheet mounts. Snap it, download, then reset.
  useEffect(() => {
    if (!exportMode) return
    let cancelled = false

    const run = async () => {
      try {
        if (typeof document !== "undefined" && "fonts" in document) {
          await (document as Document).fonts.ready
        }
        await new Promise((r) => requestAnimationFrame(() => r(null)))
        const node = sheetRef.current
        if (!node || cancelled) return

        const canvas = await html2canvas(node, {
          backgroundColor: "#0b0a1c",
          scale: 2,
          logging: false,
          useCORS: true,
          // html2canvas 1.4.1 can't parse modern color functions (oklch/lab/color-mix),
          // which our global stylesheet uses via design tokens. The export sheet is styled
          // entirely with inline hex/rgb, so we remove all author stylesheets and inherited
          // color functions from the clone to avoid the parser choking on them.
          onclone: (clonedDoc) => {
            clonedDoc.querySelectorAll("style, link[rel='stylesheet']").forEach((n) => n.remove())
            const root = clonedDoc.documentElement
            root.style.color = "#f2f0ff"
            root.style.backgroundColor = "#0b0a1c"
          },
        })
        if (cancelled) return

        const link = document.createElement("a")
        link.download = `fortnite-sprites-${exportMode}-grid.png`
        link.href = canvas.toDataURL("image/png")
        link.click()
      } catch (err) {
        console.log("[v0] export failed:", err instanceof Error ? err.message : String(err))
      } finally {
        if (!cancelled) {
          setExportMode(null)
          setBusy(null)
        }
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [exportMode])

  const handleExport = (mode: ExportMode) => {
    if (busy) return
    setBusy(mode)
    setExportMode(mode)
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Chapter 7 · Season 3
          </span>
          <h1 className="font-display text-3xl font-extrabold leading-tight text-foreground text-balance text-glow-purple sm:text-5xl">
            Sprite &amp; Variant Tracker
          </h1>
          <p className="max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">
            Toggle the rare variants you own for each base sprite, then export a clean image of your
            owned or missing collection. Tap any variant pill to mark it as owned.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:max-w-xl">
          <StatCard icon={<Layers className="size-4" />} label="Total" value={stats.total} tone="neutral" />
          <StatCard icon={<CircleCheck className="size-4" />} label="Owned" value={stats.ownedTotal} tone="owned" />
          <StatCard icon={<CircleDashed className="size-4" />} label="Missing" value={stats.missing} tone="missing" />
        </div>

        {/* Export controls */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => handleExport("owned")}
            disabled={busy !== null}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-accent/60 bg-accent/15 px-5 py-3 font-display text-sm font-bold uppercase tracking-wide text-accent transition-all hover:bg-accent/25 hover:shadow-[0_0_20px_rgba(94,234,212,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ImageDown className="size-4" aria-hidden="true" />
            {busy === "owned" ? "Exporting…" : "Export Owned Grid"}
          </button>
          <button
            type="button"
            onClick={() => handleExport("missing")}
            disabled={busy !== null}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary/60 bg-primary/15 px-5 py-3 font-display text-sm font-bold uppercase tracking-wide text-foreground transition-all hover:bg-primary/25 hover:shadow-[0_0_20px_rgba(153,85,255,0.4)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="size-4" aria-hidden="true" />
            {busy === "missing" ? "Exporting…" : "Export Missing Grid"}
          </button>
        </div>
      </header>

      <section aria-label="Sprite catalog" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {fortniteSprites.map((sprite) => (
          <SpriteCard
            key={sprite.name}
            sprite={sprite}
            owned={owned[sprite.name]}
            mastered={mastered[sprite.name]}
            onToggle={(variant) => toggle(sprite.name, variant)}
            onToggleMaster={(variant) => toggleMaster(sprite.name, variant)}
          />
        ))}
      </section>

      <footer className="border-t border-border/60 pt-6 text-center text-xs text-muted-foreground">
        Fan-made collection tracker · Not affiliated with Epic Games. Holofoil variant releases July 9th.
      </footer>

      {exportMode ? (
        <ExportSheet ref={sheetRef} mode={exportMode} owned={owned} mastered={mastered} />
      ) : null}
    </main>
  )
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: number
  tone: "neutral" | "owned" | "missing"
}) {
  const toneClass =
    tone === "owned" ? "text-accent" : tone === "missing" ? "text-primary" : "text-foreground"
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-card/60 p-3 backdrop-blur-sm">
      <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <span className={toneClass}>{icon}</span>
        {label}
      </span>
      <span className={`font-display text-2xl font-bold ${toneClass}`}>{value}</span>
    </div>
  )
}
