"use client"

import { Sparkles, Crown } from "lucide-react"
import { variantDefs, type Sprite, type VariantId } from "@/lib/sprites"
import { VariantBadge } from "@/components/variant-badge"

interface SpriteCardProps {
  sprite: Sprite
  owned: Record<VariantId, boolean>
  mastered: Record<VariantId, boolean>
  onToggle: (variant: VariantId) => void
  onToggleMaster: (variant: VariantId) => void
}

export function SpriteCard({ sprite, owned, mastered, onToggle, onToggleMaster }: SpriteCardProps) {
  const ownedCount = variantDefs.filter((v) => !v.comingSoon && owned[v.id]).length
  const totalCount = variantDefs.filter((v) => !v.comingSoon).length
  const masteredCount = variantDefs.filter((v) => !v.comingSoon && mastered[v.id]).length

  return (
    <article className="group relative flex flex-col gap-4 overflow-hidden rounded-xl border border-border bg-card/70 p-5 backdrop-blur-sm transition-all duration-300 hover:border-primary/60 hover:shadow-[0_0_28px_rgba(153,85,255,0.25)]">
      <div
        className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-primary/20 blur-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-60"
        aria-hidden="true"
      />

      <header className="flex items-center gap-3">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-primary/50 bg-gradient-to-br from-primary/20 to-accent/10 shadow-[0_0_16px_rgba(153,85,255,0.35)]">
          <img
            src={sprite.image || "/placeholder.svg"}
            alt={`${sprite.name} artwork`}
            className="size-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-base font-bold leading-tight text-foreground text-balance">
            {sprite.name}
          </h3>
          <span className="flex flex-wrap items-center gap-x-2 text-xs font-medium text-accent">
            <span>
              {ownedCount}/{totalCount} owned
            </span>
            {masteredCount > 0 ? (
              <span className="inline-flex items-center gap-1 text-[#ffe27a]">
                <Crown className="size-3 fill-current" aria-hidden="true" />
                {masteredCount} mastered
              </span>
            ) : null}
          </span>
        </div>
      </header>

      <p className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
        <Sparkles className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
        <span>{sprite.perk}</span>
      </p>

      <div className="mt-auto flex flex-wrap gap-x-2 gap-y-3 border-t border-border/60 pt-4">
        {variantDefs.map((variant) => (
          <VariantBadge
            key={variant.id}
            variant={variant}
            owned={owned[variant.id]}
            mastered={mastered[variant.id]}
            onToggle={() => onToggle(variant.id)}
            onToggleMaster={() => onToggleMaster(variant.id)}
          />
        ))}
      </div>
    </article>
  )
}
