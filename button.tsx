import { forwardRef } from "react"
import { fortniteSprites, variantDefs, type VariantId } from "@/lib/sprites"

export type ExportMode = "owned" | "missing"

interface ExportSheetProps {
  mode: ExportMode
  owned: Record<string, Record<VariantId, boolean>>
  mastered: Record<string, Record<VariantId, boolean>>
}

// All colors are explicit hex/rgb — html2canvas cannot parse oklch() tokens.
const variantColors: Record<VariantId, { bg: string; border: string; text: string; dot: string }> = {
  base: { bg: "#1e2438", border: "#8fa4d4", text: "#cdd8f5", dot: "#8fa4d4" },
  gold: { bg: "#3a2f00", border: "#ffcf3f", text: "#ffe27a", dot: "#ffcf3f" },
  gummy: { bg: "#0d2e1c", border: "#4dffb0", text: "#8affd0", dot: "#4dffb0" },
  galaxy: { bg: "#26103f", border: "#b980ff", text: "#d9b3ff", dot: "#b980ff" },
  holofoil: { bg: "#1b1f2e", border: "#c9d4ff", text: "#e8ecff", dot: "#c9d4ff" },
}

export const ExportSheet = forwardRef<HTMLDivElement, ExportSheetProps>(function ExportSheet(
  { mode, owned, mastered },
  ref,
) {
  const isOwned = mode === "owned"

  const rows = fortniteSprites
    .map((sprite) => {
      const spriteState = owned[sprite.name] ?? {}
      const variants = variantDefs.filter((v) => {
        // Holofoil is unreleased: it can never be "owned", so it only appears in the missing grid.
        if (v.comingSoon) return !isOwned
        return isOwned ? spriteState[v.id] : !spriteState[v.id]
      })
      return { sprite, variants }
    })
    .filter((row) => row.variants.length > 0)

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        top: 0,
        left: -20000,
        width: 900,
        padding: 40,
        backgroundColor: "#0b0a1c",
        backgroundImage: "linear-gradient(160deg, #14082e 0%, #0b0a1c 55%, #061223 100%)",
        fontFamily: "var(--font-rajdhani), sans-serif",
        color: "#f2f0ff",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div>
          <div
            style={{
              fontFamily: "var(--font-orbitron), sans-serif",
              fontSize: 30,
              fontWeight: 800,
              letterSpacing: 1,
              color: isOwned ? "#4dffb0" : "#ff6b81",
            }}
          >
            {isOwned ? "OWNED COLLECTION" : "MISSING COLLECTION"}
          </div>
          <div style={{ fontSize: 15, color: "#a99fd6", marginTop: 4 }}>
            Fortnite Chapter 7 Season 3 &middot; Sprite &amp; Variant Tracker
          </div>
        </div>
        <div
          style={{
            fontFamily: "var(--font-orbitron), sans-serif",
            fontSize: 13,
            fontWeight: 700,
            padding: "8px 14px",
            borderRadius: 999,
            border: `1px solid ${isOwned ? "#4dffb0" : "#ff6b81"}`,
            color: isOwned ? "#4dffb0" : "#ff6b81",
          }}
        >
          {rows.reduce((n, r) => n + r.variants.length, 0)} {isOwned ? "OWNED" : "MISSING"}
        </div>
      </div>

      <div style={{ height: 2, background: "linear-gradient(90deg,#7b2ff7,#38bdf8,transparent)", marginBottom: 24 }} />

      {rows.length === 0 ? (
        <div style={{ fontSize: 18, color: "#a99fd6", padding: "48px 0", textAlign: "center" }}>
          {isOwned
            ? "No variants marked as owned yet."
            : "Nothing missing — every available variant is owned!"}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {rows.map(({ sprite, variants }) => (
            <div
              key={sprite.name}
              style={{
                border: "1px solid rgba(155,120,255,0.35)",
                borderRadius: 12,
                padding: "14px 16px",
                backgroundColor: "rgba(30,18,60,0.55)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-orbitron), sans-serif",
                  fontSize: 15,
                  fontWeight: 700,
                  marginBottom: 10,
                  color: "#f2f0ff",
                }}
              >
                {sprite.name}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {variants.map((v) => {
                  const c = variantColors[v.id]
                  return (
                    <div
                      key={v.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "5px 12px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        backgroundColor: isOwned ? c.bg : "rgba(0,0,0,0.25)",
                        border: `1px solid ${isOwned ? c.border : "rgba(255,255,255,0.18)"}`,
                        color: isOwned ? c.text : "#b7aee0",
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 999,
                          backgroundColor: isOwned ? c.dot : "#6b6494",
                          display: "inline-block",
                        }}
                      />
                      {v.label}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
})
