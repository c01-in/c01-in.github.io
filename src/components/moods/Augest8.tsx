import { useEffect, useMemo, useRef, useState } from "react"
import { Card } from "../ui/card"
import { ArrowLeftRight, ScanLine, Monitor, Layers, SquareStack, ScrollText, Gpu, Blocks } from "lucide-react"

type NodeId =
  | "appRender"
  | "macBypass"
  | "afxdp"
  | "decoder"
  | "displayCtrl"
  | "uiOverlay"
  | "composition"
  | "panel"

type FlowNode = {
  id: NodeId
  title: string
  label: string
  subtitle?: string
  x: number
  y: number
  w: number
  h: number
  icon: "click" | "swap" | "blocks" | "xdp" | "scan" | "monitor" | "layers" | "stack"
  shape?: "circle" | "square"
  neon?: "magenta" | "cyan" | "none"
  iconScale?: number
}

type FlowLink = {
  from: NodeId
  to: NodeId
  dashed?: boolean
  color?: string
  excluded?: boolean
}

// Interactive, animated SVG flow based on the research outline
export default function Mood() {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [hovered, setHovered] = useState<NodeId | null>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null)

  // Use a stable virtual canvas for clean scaling
  const view = { width: 1024, height: 768 }
  const vbWidth = view.width + 0
  const vbHeight = view.height + 0

  // Initial, canonical layout used for first render and centering reference
  const initialNodes: FlowNode[] = useMemo(
    () => [
      // New default layout matching the current visual arrangement
      { id: "appRender", title: "App Render Trigger", label: "App Trigger", subtitle: "sender app", x: 10, y: 100, w: 156, h: 176, icon: "click", shape: "square", neon: "magenta", iconScale: 1.2 },
      { id: "macBypass", title: "Wi‑Fi MAC Bypass", label: "MAC Bypass", subtitle: "MAC path", x: 20, y: 350, w: 136, h: 156, icon: "swap" },
      { id: "afxdp", title: "AF_XDP Zero‑Copy", label: "AF_XDP", subtitle: "user‑space", x: 220, y: 350, w: 136, h: 156, icon: "xdp" },
      { id: "decoder", title: "Line‑based Decoder", label: "Line Decoder", subtitle: "decode", x: 420, y: 350, w: 136, h: 156, icon: "scan" },
      { id: "displayCtrl", title: "Display Controller", label: "Display Ctrl", subtitle: "KMS plane", x: 620, y: 350, w: 136, h: 156, icon: "blocks" },
      { id: "uiOverlay", title: "UI Overlay (GPU)", label: "Independent UI", subtitle: "UI plane (GPU)", x: 720, y: 550, w: 136, h: 156, icon: "layers" },
      { id: "composition", title: "Final Composition", label: "Composition", subtitle: "composer", x: 820, y: 350, w: 136, h: 156, icon: "stack" },
      { id: "panel", title: "Display Panel", label: "Panel", subtitle: "panel", x: 810, y: 100, w: 156, h: 176, icon: "monitor", shape: "square", neon: "cyan", iconScale: 1.2 },
    ],
    []
  )

  // Draggable state of nodes
  const [nodes, setNodes] = useState<FlowNode[]>(initialNodes)

  const links: FlowLink[] = useMemo(
    () => [
      { from: "appRender", to: "macBypass", excluded: true },
      { from: "macBypass", to: "afxdp" },
      { from: "afxdp", to: "decoder" },
      { from: "decoder", to: "displayCtrl" },
      // Vertical branch: display controller down to composition
      { from: "displayCtrl", to: "composition" },
      // UI overlay into composition (accent color)
      { from: "uiOverlay", to: "composition", excluded: true },
      // Composition to panel
      { from: "composition", to: "panel" },
    ],
    []
  )

  // Compute center point for a node (used to route links)
  const centerOf = (n: FlowNode) => ({ cx: n.x + n.w / 2, cy: n.y + n.h / 2 })

  // Build a cubic path that adapts entry/exit sides based on relative positions
  const buildAdaptivePath = (from: FlowNode, to: FlowNode): string => {
    const { cx: fx, cy: fy } = centerOf(from)
    const { cx: tx, cy: ty } = centerOf(to)
    const dx = tx - fx
    const dy = ty - fy
    const horizontal = Math.abs(dx) >= Math.abs(dy)

    // Source anchor on the side facing the target
    let sx = fx
    let sy = fy
    let sNx = 0
    let sNy = 0
    if (horizontal) {
      if (dx >= 0) {
        sx = from.x + from.w
        sNx = 1
      } else {
        sx = from.x
        sNx = -1
      }
    } else {
      if (dy >= 0) {
        sy = from.y + from.h
        sNy = 1
      } else {
        sy = from.y
        sNy = -1
      }
    }

    // Target anchor on the side facing the source
    let txa = tx
    let tya = ty
    let tNx = 0
    let tNy = 0
    if (horizontal) {
      if (dx >= 0) {
        txa = to.x
        tNx = -1
      } else {
        txa = to.x + to.w
        tNx = 1
      }
    } else {
      if (dy >= 0) {
        tya = to.y
        tNy = -1
      } else {
        tya = to.y + to.h
        tNy = 1
      }
    }

    // Control distance proportional to segment length, clamped
    const dist = Math.hypot((txa - sx), (tya - sy))
    const k = Math.min(120, Math.max(40, dist / 3))
    const c1x = sx + sNx * k
    const c1y = sy + sNy * k
    const c2x = txa + tNx * k
    const c2y = tya + tNy * k

    return `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${txa} ${tya}`
  }

  // Compute horizontal bounds and centering offset so the diagram is visually centered
  const offsetX = useMemo(() => {
    const minX = Math.min(...initialNodes.map((n) => n.x))
    const maxX = Math.max(...initialNodes.map((n) => n.x + n.w))
    const contentWidth = maxX - minX
    return (vbWidth - contentWidth) / 2 - minX
  }, [initialNodes, vbWidth])

  // Dragging helpers
  const draggingRef = useRef<{ id: NodeId | null; dx: number; dy: number }>(
    { id: null, dx: 0, dy: 0 }
  )

  const clientToSvg = (evt: PointerEvent | React.PointerEvent) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const ctm = svg.getScreenCTM()
    if (!ctm) return { x: 0, y: 0 }
    const point = new DOMPoint(evt.clientX, evt.clientY).matrixTransform(ctm.inverse())
    return { x: point.x, y: point.y }
  }

  useEffect(() => {
    const handleMove = (evt: PointerEvent) => {
      const drag = draggingRef.current
      if (!drag.id) return
      const pt = clientToSvg(evt)
      const localX = pt.x - offsetX
      setNodes((prev) =>
        prev.map((n) =>
          n.id === drag.id
            ? { ...n, x: localX - drag.dx, y: pt.y - drag.dy }
            : n
        )
      )
    }
    const handleUp = () => {
      draggingRef.current = { id: null, dx: 0, dy: 0 }
    }
    window.addEventListener("pointermove", handleMove)
    window.addEventListener("pointerup", handleUp)
    return () => {
      window.removeEventListener("pointermove", handleMove)
      window.removeEventListener("pointerup", handleUp)
    }
  }, [offsetX])

  // Tooltip helpers
  const showTooltip = (evt: React.MouseEvent, text: string) => {
    const host = containerRef.current
    if (!host) return
    const rect = host.getBoundingClientRect()
    setTooltip({ x: evt.clientX - rect.left + 12, y: evt.clientY - rect.top + 12, text })
  }
  const hideTooltip = () => setTooltip(null)

  // Animated dash speed sync with refresh rate
  useEffect(() => {
    // No JS animation required; CSS keyframes are used below.
  }, [])

  // Title and help text
  const title = "Sub-2 ms Video Pipeline"
  const subtitle = "Wi-Fi MAC-Level Bypass to Direct Display"

  return (
    <Card>
      <div ref={containerRef} className="relative w-full aspect-[16/9] select-none">
        {/* Only keep keyframes; all other styles shifted to Tailwind classes */}
        <style>{`@keyframes dashMove { to { stroke-dashoffset: -16; } }`}</style>

        <svg
          ref={svgRef}
          viewBox={`0 0 ${vbWidth} ${vbHeight}`}
          className="w-full h-full"
          role="img"
          aria-label="Interactive pipeline diagram"
          onMouseLeave={() => {
            setHovered(null)
            hideTooltip()
          }}
        >
          {/* Title */}
          <text x={vbWidth / 2} y={42} textAnchor="middle" className="label fill-current font-bold text-4xl">
            {title}
          </text>
          <text x={vbWidth / 2} y={70} textAnchor="middle" className="label fill-current text-muted-foreground text-lg">
            {subtitle}
          </text>

          {/* Group the diagram content and translate horizontally to center it */}
          <g transform={`translate(${offsetX}, 0)`}>
            {/* Draw links first, so nodes appear above */}
            {links.map((link, idx) => {
              const from = nodes.find((n) => n.id === link.from)!
              const to = nodes.find((n) => n.id === link.to)!
              const path = buildAdaptivePath(from, to)
              const hoveredEdge = hovered === from.id || hovered === to.id

              return (
                <g key={idx} className="drop-shadow">
                  <path
                    d={path}
                    className={`fill-none stroke-current ${
                      link.color ? "text-primary" : ""
                    } ${
                      link.excluded
                        ? "opacity-50 text-muted-foreground [stroke-dasharray:2_6]"
                        : "animate-[dashMove_1.2s_linear_infinite] [stroke-dasharray:6_8]"
                    }`}
                    strokeWidth={hoveredEdge ? 3.5 : 2.5}
                    markerEnd="url(#arrow)"
                  />
                </g>
              )
            })}

          {/* Arrowhead marker */}
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" className="fill-current" />
            </marker>
          </defs>

          {/* Node badges: draggable icons with labels */}
          {nodes.map((n) => {
            const isHovered = hovered === n.id

            // Common icon size and center placement
            const iconSize = Math.round(100 * (n.iconScale ?? 1))
            // Make circle tightly wrap the icon with very small padding
            const circleRadius = Math.max(iconSize / 2 + 6, Math.min(n.w, n.h) / 2 - 4)
            const centerX = n.x + n.w / 2
            const centerY = n.y + n.h / 2 - 10
            const labelY = Math.min(n.y + n.h + 6, centerY + iconSize / 2 + 48)

            return (
              <g
                key={n.id}
                className="cursor-pointer"
                onPointerDown={(e) => {
                  const start = clientToSvg(e)
                  draggingRef.current = {
                    id: n.id,
                    dx: start.x - (n.x + offsetX),
                    dy: start.y - n.y,
                  }
                }}
                onMouseEnter={(e) => {
                  setHovered(n.id)
                  showTooltip(e, `${n.title}${n.subtitle ? " — " + n.subtitle : ""}`)
                }}
                onMouseMove={(e) => showTooltip(e, `${n.title}${n.subtitle ? " — " + n.subtitle : ""}`)}
                onMouseLeave={() => {
                  setHovered(null)
                  hideTooltip()
                }}
              >
                {/* Circular or square badge */}
                {n.shape === "square" ? (
                  <rect
                    x={centerX - circleRadius}
                    y={centerY - circleRadius}
                    width={circleRadius * 2}
                    height={circleRadius * 2}
                    rx={14}
                    ry={14}
                    className={`drop-shadow-md ${
                      isHovered
                        ? "fill-[#dbe9ff] stroke-blue-600"
                        : "fill-[#eaf1fb] stroke-slate-400"
                    } ${
                      n.neon === "magenta"
                        ? "drop-shadow-[0_0_16px_rgba(255,43,214,.45)]"
                        : n.neon === "cyan"
                        ? "drop-shadow-[0_0_16px_rgba(0,229,255,.45)]"
                        : ""
                    }`}
                  />
                ) : (
                  <circle
                    cx={centerX}
                    cy={centerY}
                    r={circleRadius}
                    className={`drop-shadow-md ${
                      isHovered
                        ? "fill-[#dbe9ff] stroke-blue-600"
                        : "fill-[#eaf1fb] stroke-slate-400"
                    }`}
                  />
                )}

                {/* Icon centered inside circle */}
                {n.icon === "click" && (
                  <Gpu x={centerX - iconSize / 2} y={centerY - iconSize / 2} size={iconSize} className="text-foreground" />
                )}
                {n.icon === "swap" && (
                  <ArrowLeftRight x={centerX - iconSize / 2} y={centerY - iconSize / 2} size={iconSize} className="text-foreground" />
                )}
                {n.icon === "xdp" && (
                  <svg x={centerX - iconSize / 2} y={centerY - iconSize / 2} width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" className="stroke-current text-foreground" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12h6l3 6 3-12 3 6h3" />
                  </svg>
                )}
                {n.icon === "scan" && (
                  <ScanLine x={centerX - iconSize / 2} y={centerY - iconSize / 2} size={iconSize} className="text-foreground" />
                )}
                {n.icon === "monitor" && (
                  <Monitor x={centerX - iconSize / 2} y={centerY - iconSize / 2} size={iconSize} className="text-foreground" />
                )}
                {n.icon === "blocks" && (
                  <Blocks x={centerX - iconSize / 2} y={centerY - iconSize / 2} size={iconSize} className="text-foreground" />
                )}
                {n.icon === "layers" && (
                  <Layers x={centerX - iconSize / 2} y={centerY - iconSize / 2} size={iconSize} className="text-foreground" />
                )}
                {n.icon === "stack" && (
                  <SquareStack x={centerX - iconSize / 2} y={centerY - iconSize / 2} size={iconSize} className="text-foreground" />
                )}

                {/* Enlarged short label below */}
                <text x={centerX} y={labelY} textAnchor="middle" className="label fill-current font-bold text-[28px]">
                  {n.label}
                </text>
              </g>
            )
          })}

          {/* Sub-2 ms sine wave from App -> Panel */}
          {(() => {
            const app = nodes.find(n=>n.id==="appRender")!
            const disp = nodes.find(n=>n.id==="panel")!
            const sx = app.x + app.w/2 + 80, sy = app.y + app.h/2 - 10
            const tx = disp.x + disp.w/2 - 80, ty = disp.y + disp.h/2 - 10
            const samples = 80
            const amplitude = 18
            const pathCmd: string[] = []
            for (let i=0;i<=samples;i++) {
              const t = i / samples
              const x = sx + (tx - sx) * t
              const yBase = sy + (ty - sy) * t
              const y = yBase + Math.sin(t * Math.PI * 6) * amplitude
              pathCmd.push(i===0 ? `M ${x} ${y}` : `L ${x} ${y}`)
            }
            return (
              <g>
                <path d={pathCmd.join(" ")} 
                    strokeWidth={2} 
                    className="fill-none stroke-current text-primary animate-[dashMove_1.6s_linear_infinite] [stroke-dasharray:8_10]" 
                    markerEnd="url(#arrow_primary)" />
                <text x={(sx+tx)/2} y={(sy+ty)/2 - amplitude - 8} textAnchor="middle" className="label fill-current text-primary font-bold text-3xl">
                  ≤ 2 ms
                </text>
              </g>
            )
          })()}

          {/* Arrowhead marker */}
          <defs>
            <marker id="arrow_primary" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" className="fill-primary" />
            </marker>
          </defs>
          
          {/* Visual note to clarify excluded network transport segment */}
          <g>
            {/* Place under App Trigger */}
            <text x={80} y={310} textAnchor="middle" className="label fill-current text-muted-foreground text-xs">
              Network Transport Excluded
            </text>
          </g>
          </g>
        </svg>

         {/* Tooltip overlay (HTML for crisp text) */}
        {tooltip && (
          <div
            className="absolute bg-white/95 border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-700 pointer-events-none shadow-md"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            {tooltip.text}
          </div>
        )}

        {/* GitHub link badge (bottom-left) */}
        <a
          href="https://github.com/c01-in/sub2ms-video-pipeline"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-2 left-3 inline-flex items-center gap-2 px-2 py-1 rounded-md border bg-white/95 text-xs text-slate-700 shadow-sm hover:bg-white"
          title="Open the project on GitHub"
        >
          <ScrollText className="w-4 h-4" />
          <span className="text-slate-700">GitHub</span>
        </a>

        {/* Footer note */}
        <div className="absolute bottom-0 right-4 text-[11px] text-muted-foreground">
          Hover nodes to highlight paths.
        </div>
      </div>
    </Card>
  )
}
