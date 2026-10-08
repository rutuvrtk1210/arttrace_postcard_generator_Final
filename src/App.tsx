// @refresh reset
import {
  Component,
  useEffect,
  useRef,
  useState,
} from "react"
import type {
  PointerEvent as ReactPointerEvent,
  CSSProperties,
  ReactNode,
} from "react"

type Feature = "blob" | "cutout" | "note" | "doodle"
type Screen = "intro" | "upload" | "making" | "final"
type Theme = "day" | "night"

type CutoutResult = {
  x: number
  y: number
  size: number
  image?: string
  rotation?: number
}

type NoteResult = {
  text: string
  width: number
  fontSize: number
  color: string
}

type Results = {
  blob?: string
  cutout?: CutoutResult
  note?: NoteResult
  doodle?: string
}

type CompositionElement = {
  feature: Feature
  x: number
  y: number
  width: number
  height: number
  z: number
  visible: boolean
}

const campusArt = [
  "/assets/14587.webp",
  "/assets/5f166.webp",
  "/assets/bdd23.webp",
  "/assets/db196.webp",
  "/assets/db713.webp",
  "/assets/4bdf5.webp",
  "/assets/266a7.webp",
  "/assets/52c4d.webp",
  "/assets/429c0.webp",
]
const featureNames = ["Color blob", "Photo cutout", "Handwritten note", "Doodle"]
const toolAssets: Record<string, string> = {
  EYEDROPPER: "/assets/0f9d3.svg",
  UPLOAD: "/assets/267db.svg",
  UNDO: "/assets/66631.svg",
  REDO: "/assets/3b00f.svg",
  CUT: "/assets/79ac5.svg",
}

function Icon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={path} />
    </svg>
  )
}

function Button({
  className = "",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`ui-button ${className}`} {...props}>{children}</button>
}

function Brand() {
  return (
    <div className="brand">
      <i />
      <b><strong>art</strong>trace</b>
    </div>
  )
}

function ThemeToggle({
  theme,
  onToggle,
}: {
  theme: Theme
  onToggle: () => void
}) {
  const isNight = theme === "night"
  const sunPath = "M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
  const moonPath = "M20 15.4A8 8 0 0 1 8.6 4 8 8 0 1 0 20 15.4Z"
  return (
    <Button
      className="theme-toggle"
      onClick={onToggle}
      aria-label={`Switch to ${isNight ? "day" : "night"} mode`}
      title={`Switch to ${isNight ? "day" : "night"} mode`}
    >
      <span className="theme-toggle-track">
        <i className="theme-toggle-sun" aria-hidden="true"><Icon path={sunPath} /></i>
        <i className="theme-toggle-moon" aria-hidden="true"><Icon path={moonPath} /></i>
        <i className="theme-toggle-orb">
          <Icon path={isNight ? moonPath : sunPath} />
        </i>
      </span>
      <small>{isNight ? "DAY" : "NIGHT"}</small>
    </Button>
  )
}

function UploadScreen({ onSelect }: { onSelect: (image: string) => void }) {
  const [image, setImage] = useState<string | null>(null)
  const [showLibrary, setShowLibrary] = useState(true)
  const fileRef = useRef<HTMLInputElement>(null)

  const chooseFile = (file?: File) => {
    if (!file) return
    setImage(URL.createObjectURL(file))
  }

  return (
    <main className="upload-screen trace-screen">
      <header><Brand /><span>HOME</span></header>
      <section className="upload-intro">
        <h1>Hey <strong>CAL STATE Long Beach</strong> students!</h1>
        <p>HAVE YOU NOTICED THESE SCULPTURES BEFORE? SELECT ONE YOU SEE AROUND CAMPUS EVERYDAY.</p>
      </section>

      <section className={`upload-stage ${image ? "has-image" : ""} ${showLibrary ? "show-library" : ""}`}>
        {showLibrary ? (
          <div className="trace-gallery">
            {campusArt.map((art, index) => (
              <Button
                key={art}
                onClick={() => {
                  setImage(art)
                  setShowLibrary(false)
                }}
                aria-label={`Select campus artwork ${index + 1}`}
              >
                <img src={art} alt="" />
              </Button>
            ))}
          </div>
        ) : image ? (
          <img src={image} alt="Selected campus artwork" />
        ) : (
          <button onClick={() => setShowLibrary(true)} className="upload-empty" aria-label="Open the campus artwork library" />
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={(event) => chooseFile(event.target.files?.[0])}
        />
        {image && <div className="trace-stage-actions">
          <Button onClick={() => onSelect(image)}>Retrace</Button>
        </div>}
      </section>

      <aside className="trace-tools trace-left-tools">
        <WorkspaceTool assetSrc="/assets/6eb26.svg" label="UNDO" path="M9 7 4 12l5 5M5 12h9a5 5 0 0 1 5 5" disabled />
        <WorkspaceTool assetSrc="/assets/4efa9.svg" label="REDO" path="m15 7 5 5-5 5M19 12h-9a5 5 0 0 0-5 5" disabled />
      </aside>
      <Button className="trace-back nav-circle" disabled><Icon path="M15 18l-6-6 6-6" /><small>BACK</small></Button>
      <Button className="trace-next nav-circle" disabled={!image} onClick={() => image && onSelect(image)}><Icon path="M9 6l6 6-6 6" /><small>NEXT</small></Button>
    </main>
  )
}

function FeatureChrome({
  step,
  onNext,
  onSkip: _onSkip,
  onBack,
  className = "",
  children,
  nextDisabled = false,
  nextLabel = "Next",
}: {
  step: number
  onNext: () => void
  onSkip: () => void
  onBack?: () => void
  className?: string
  children: ReactNode
  nextDisabled?: boolean
  nextLabel?: string
}) {
  return (
    <main className={`feature-screen ${className}`}>
      <header className="feature-progress">
        <Brand />
      </header>
      {children}
      <footer className="feature-nav">
        <Button className="back-button nav-circle" onClick={onBack}>
          <Icon path="M15 18l-6-6 6-6" /><small>BACK</small>
        </Button>
        <Button className="next-button nav-circle" onClick={onNext} disabled={nextDisabled}>
          <Icon path="M9 6l6 6-6 6" /><small>{nextLabel === "Next" ? "NEXT" : nextLabel.toUpperCase()}</small>
        </Button>
      </footer>
    </main>
  )
}

function WorkspaceTool({
  label,
  path,
  assetSrc,
  className = "",
  ...props
}: {
  label: string
  path: string
  assetSrc?: string
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const source = assetSrc ?? toolAssets[label]
  return (
    <Button className={`workspace-tool ${className}`} {...props}>
      <span className={source && label !== "UPLOAD" ? "full-asset" : ""}>
        {source ? <img src={source} alt="" /> : <Icon path={path} />}
      </span>
      <small>{label}</small>
    </Button>
  )
}

function BlobFeature({
  image,
  onNext,
  onSkip,
  onBack,
}: {
  image: string
  onNext: (result?: string) => void
  onSkip: () => void
  onBack: () => void
}) {
  type BlobStamp = {
    id: number
    x: number
    y: number
    size: number
    opacity: number
    rotation: number
  }

  const paintCanvasRef = useRef<HTMLCanvasElement>(null)
  const referenceCanvasRef = useRef<HTMLCanvasElement>(null)
  const referenceImageRef = useRef<HTMLImageElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const referenceBounds = useRef({ x: 0, y: 0, width: 0, height: 0 })
  const undoHistory = useRef<BlobStamp[][]>([])
  const redoHistory = useRef<BlobStamp[][]>([])
  const stampId = useRef(0)
  const sampleRedo = useRef<string[]>([])
  const painting = useRef(false)
  const lastPaintPoint = useRef({ x: 0, y: 0 })
  const [stage, setStage] = useState<"select" | "create" | "paint">("select")
  const [referenceImage, setReferenceImage] = useState(image)
  const [palette, setPalette] = useState<string[]>([])
  const [stamps, setStamps] = useState<BlobStamp[]>([])
  const [selectedStamp, setSelectedStamp] = useState<number | null>(null)
  const [brushSize, setBrushSize] = useState(104)
  const [brushOpacity, setBrushOpacity] = useState(82)
  const [cursor, setCursor] = useState({ x: 50, y: 50, visible: true })
  const [renderVersion, setRenderVersion] = useState(0)
  const [paintTool, setPaintTool] = useState<"add" | "move">("add")
  const [saved, setSaved] = useState(false)
  const movingStamp = useRef<number | null>(null)

  const drawReference = () => {
    const canvas = referenceCanvasRef.current
    const photo = referenceImageRef.current
    if (!canvas || !photo || !photo.naturalWidth) return
    const rect = canvas.getBoundingClientRect()
    const ratio = window.devicePixelRatio
    canvas.width = rect.width * ratio
    canvas.height = rect.height * ratio
    const context = canvas.getContext("2d", { willReadFrequently: true })
    if (!context) return
    context.fillStyle = "#242720"
    context.fillRect(0, 0, canvas.width, canvas.height)
    const scale = Math.max(canvas.width / photo.naturalWidth, canvas.height / photo.naturalHeight)
    const width = photo.naturalWidth * scale
    const height = photo.naturalHeight * scale
    const x = (canvas.width - width) / 2
    const y = (canvas.height - height) / 2
    context.drawImage(photo, x, y, width, height)
    referenceBounds.current = { x, y, width, height }
  }

  const sizePaintCanvas = () => {
    const canvas = paintCanvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const width = Math.round(rect.width * window.devicePixelRatio)
    const height = Math.round(rect.height * window.devicePixelRatio)
    if (!width || !height || (canvas.width === width && canvas.height === height)) return false
    canvas.width = width
    canvas.height = height
    return true
  }

  const drawBlob = (
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    opacity: number,
    rotation: number,
  ) => {
    if (palette.length !== 4) return
    const shape = new Path2D("M454.019 273.215C416.895 424.754 402.256 500 231.287 500C60.3176 500 65.0241 384.518 8.55488 273.215C-47.9144 161.913 192.193 -107.677 231.287 46.431C270.381 200.539 491.143 121.677 454.019 273.215Z")
    context.save()
    context.translate(x, y)
    context.rotate(rotation)
    context.scale(size / 458.208, size / 500)
    context.translate(-229.104, -250)
    context.globalAlpha = opacity
    context.clip(shape)
    const gradient = context.createRadialGradient(346, 182, 12, 244, 260, 355)
    palette.forEach((color, index) => {
      gradient.addColorStop([0, .28, .58, 1][index], color)
    })
    context.fillStyle = gradient
    context.fillRect(-50, -110, 560, 660)
    context.restore()
  }

  const renderComposition = () => {
    const canvas = paintCanvasRef.current
    const context = canvas?.getContext("2d")
    if (!canvas || !context) return
    const ratio = window.devicePixelRatio
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = "#fff7e8"
    context.fillRect(0, 0, canvas.width, canvas.height)
    stamps.forEach((stamp) => {
      drawBlob(
        context,
        stamp.x * canvas.width,
        stamp.y * canvas.height,
        stamp.size * ratio,
        stamp.opacity,
        stamp.rotation,
      )
    })
    const selected = stamps.find((stamp) => stamp.id === selectedStamp)
    if (selected) {
      context.save()
      context.strokeStyle = "rgba(41,43,39,.55)"
      context.lineWidth = ratio
      context.setLineDash([5 * ratio, 5 * ratio])
      context.beginPath()
      context.arc(
        selected.x * canvas.width,
        selected.y * canvas.height,
        selected.size * ratio * .55,
        0,
        Math.PI * 2,
      )
      context.stroke()
      context.restore()
    }
  }

  useEffect(() => {
    const sync = () => {
      drawReference()
      setRenderVersion((current) => current + 1)
    }
    const frame = requestAnimationFrame(sync)
    window.addEventListener("resize", sync)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("resize", sync)
    }
  }, [])

  useEffect(() => {
    sizePaintCanvas()
    renderComposition()
  }, [palette, stamps, selectedStamp, renderVersion, stage])

  useEffect(() => {
    if (stage !== "create") return
    const timer = window.setTimeout(() => {
      sizePaintCanvas()
      setStage("paint")
    }, 900)
    return () => window.clearTimeout(timer)
  }, [stage])

  const sampleColor = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (palette.length >= 4) return
    const canvas = event.currentTarget
    const rect = canvas.getBoundingClientRect()
    const ratio = window.devicePixelRatio
    const x = (event.clientX - rect.left) * ratio
    const y = (event.clientY - rect.top) * ratio
    const bounds = referenceBounds.current
    if (x < bounds.x || x > bounds.x + bounds.width || y < bounds.y || y > bounds.y + bounds.height) return
    const pixel = canvas.getContext("2d", { willReadFrequently: true })?.getImageData(x, y, 1, 1).data
    if (!pixel) return
    const sampled = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`
    const next = [...palette, sampled]
    sampleRedo.current = []
    setPalette(next)
    if (next.length === 4) {
      setStage("create")
    }
  }

  const selectReference = (source: string) => {
    setReferenceImage(source)
    setPalette([])
    sampleRedo.current = []
  }

  const commitStamps = (next: BlobStamp[]) => {
    undoHistory.current.push(stamps)
    redoHistory.current = []
    setStamps(next)
    setSelectedStamp(null)
  }

  const undo = () => {
    const previous = undoHistory.current.pop()
    if (!previous) return
    redoHistory.current.push(stamps)
    setStamps(previous)
    setSelectedStamp(null)
  }

  const redo = () => {
    const next = redoHistory.current.pop()
    if (!next) return
    undoHistory.current.push(stamps)
    setStamps(next)
    setSelectedStamp(null)
  }

  const cursorGradient = palette.length === 4
    ? `radial-gradient(circle at 68% 34%, ${palette[0]} 0%, ${palette[1]} 28%, ${palette[2]} 58%, ${palette[3]} 100%)`
    : "transparent"

  const undoSample = () => {
    setPalette((current) => {
      const removed = current.at(-1)
      if (removed) sampleRedo.current.push(removed)
      return current.slice(0, -1)
    })
  }

  const redoSample = () => {
    const restored = sampleRedo.current.pop()
    if (restored) setPalette((current) => [...current, restored])
  }

  const stampBlob = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height
    const existing = [...stamps].reverse().find((stamp) => {
      const distance = Math.hypot((stamp.x - x) * rect.width, (stamp.y - y) * rect.height)
      return distance < stamp.size * .48
    })
    if (paintTool === "move") {
      painting.current = false
      if (!existing) {
        setSelectedStamp(null)
        return
      }
      undoHistory.current.push(stamps)
      redoHistory.current = []
      movingStamp.current = existing.id
      setSelectedStamp(existing.id)
      event.currentTarget.setPointerCapture(event.pointerId)
      return
    }
    undoHistory.current.push(stamps)
    redoHistory.current = []
    painting.current = true
    lastPaintPoint.current = { x: event.clientX, y: event.clientY }
    event.currentTarget.setPointerCapture(event.pointerId)
    stampId.current += 1
    setStamps([...stamps, {
      id: stampId.current,
      x,
      y,
      size: brushSize,
      opacity: brushOpacity / 100,
      rotation: ((stampId.current * 47) % 360) * Math.PI / 180,
    }])
  }

  const continuePainting = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setCursor({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
      visible: true,
    })
    if (paintTool === "move" && movingStamp.current) {
      const movingId = movingStamp.current
      setStamps((current) => current.map((stamp) => (
        stamp.id === movingId
          ? {
              ...stamp,
              x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
              y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)),
            }
          : stamp
      )))
      return
    }
    if (!painting.current) return
    if (Math.hypot(event.clientX - lastPaintPoint.current.x, event.clientY - lastPaintPoint.current.y) < brushSize * .34) return
    lastPaintPoint.current = { x: event.clientX, y: event.clientY }
    stampId.current += 1
    const nextStamp: BlobStamp = {
      id: stampId.current,
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
      size: brushSize,
      opacity: brushOpacity / 100,
      rotation: ((stampId.current * 47) % 360) * Math.PI / 180,
    }
    setStamps((current) => [...current, nextStamp])
  }

  return (
    <FeatureChrome
      step={0}
      className="reference-feature-screen studio-feature-screen blob-feature-screen"
      onBack={onBack}
      onSkip={onSkip}
      onNext={() => stage === "paint"
        ? onNext(stamps.length ? paintCanvasRef.current?.toDataURL("image/png") : undefined)
        : setStage("paint")}
      nextDisabled={stage === "create" || (stage === "select" && palette.length !== 4)}
    >
      <section className={`reference-workspace blob-reference-workspace stage-${stage}`}>
        <div className="reference-title">
          <h1>
            {stage === "paint" ? (
              <>Paint with your <span className="accent-pink">ColorBlob</span> Brush...</>
            ) : (
              <>Build your <span className="accent-pink">ColorBlob</span> Brush...</>
            )}
          </h1>
          <p>{stage === "paint" ? "TAP OR DRAG THE BLOB ACROSS THE BLANK CANVAS" : "PICK ANY 4 COLORS YOU WANT FROM THE PHOTOGRAPH BELOW."}</p>
        </div>

        <aside className="workspace-tools left-tools">
          <WorkspaceTool label="EYEDROPPER" path="m19 3 2 2-4 4-2-2 4-4ZM16 8 6 18l-3 3 3-1 11-11" disabled={stage === "paint"} />
          <WorkspaceTool
            label="UNDO"
            path="M9 7 4 12l5 5M5 12h9a5 5 0 0 1 5 5"
            onClick={stage === "paint" ? undo : undoSample}
            disabled={stage === "paint" ? !undoHistory.current.length : !palette.length}
          />
          <WorkspaceTool
            label="REDO"
            path="m15 7 5 5-5 5M19 12h-9a5 5 0 0 0-5 5"
            onClick={stage === "paint" ? redo : redoSample}
            disabled={stage === "paint" ? !redoHistory.current.length : !sampleRedo.current.length}
          />
        </aside>

        <div className="reference-canvas-shell">
          {stage === "paint" ? (
            <div className="blob-postcard">
              <canvas
                ref={paintCanvasRef}
                onPointerEnter={() => setCursor((current) => ({ ...current, visible: true }))}
                onPointerMove={continuePainting}
                onPointerDown={stampBlob}
                onPointerUp={() => {
                  painting.current = false
                  movingStamp.current = null
                }}
                onPointerCancel={() => {
                  painting.current = false
                  movingStamp.current = null
                }}
                aria-label="Blank postcard canvas. Tap to stamp the four-color blob."
              />
              <span
                className={`brush-cursor organic-blob ${cursor.visible ? "visible" : ""}`}
                style={{
                  left: `${cursor.x}%`,
                  top: `${cursor.y}%`,
                  width: `${brushSize}px`,
                  height: `${brushSize * 1.09}px`,
                  background: cursorGradient,
                  opacity: brushOpacity / 100,
                }}
              />
            </div>
          ) : (
            <>
              <img ref={referenceImageRef} src={referenceImage} onLoad={drawReference} alt="" hidden />
              <canvas
                ref={referenceCanvasRef}
                onPointerDown={sampleColor}
                aria-label="Reference image. Tap to sample a color."
              />
              {stage === "create" && (
                <div className="blob-loading" role="status">
                  <div className="blob-orbit" aria-hidden="true">
                    {palette.map((color, index) => <i key={color + index} style={{ background: color }} />)}
                    <span className="generated-blob" style={{ background: cursorGradient }} />
                  </div>
                  <b>Hold on… creating your Color Blob</b>
                </div>
              )}
            </>
          )}
        </div>

        <aside className="workspace-tools right-tools">
          {stage === "paint" ? (
            <>
              <WorkspaceTool
                label="ADD BLOB"
                className={paintTool === "add" ? "active" : ""}
                path="M12 3c4 4 7 7 7 11a7 7 0 0 1-14 0c0-4 3-7 7-11ZM12 9v7M8.5 12.5h7"
                onClick={() => {
                  setPaintTool("add")
                  setSelectedStamp(null)
                  setCursor((current) => ({ ...current, visible: true }))
                }}
              />
              <WorkspaceTool
                label="MOVE BLOB"
                className={paintTool === "move" ? "active" : ""}
                path="m5 3 12 8-5 1 3 6-2 1-3-6-3 4Z"
                onClick={() => {
                  setPaintTool("move")
                  setSelectedStamp(null)
                  setCursor((current) => ({ ...current, visible: false }))
                }}
              />
            </>
          ) : (
            <>
              <div className="rail-swatches" aria-label={`${palette.length} of 4 colors selected`}>
                {[0, 1, 2, 3].map((index) => (
                  <i key={index} className={palette[index] ? "filled" : ""} style={{ background: palette[index] }} />
                ))}
                <Button
                  className="add-color"
                  onClick={() => setStage(palette.length === 4 ? "create" : "select")}
                  disabled={palette.length !== 4}
                  aria-label="Add color blob"
                >
                  <Icon path="M12 5v14M5 12h14" />
                </Button>
              </div>
            </>
          )}
        </aside>

        {stage === "paint" ? (
          <div className="blob-slider-panel">
            <label>
              <span>BLOB SIZE</span>
              {(() => {
                const sizeValue = selectedStamp ? stamps.find((stamp) => stamp.id === selectedStamp)?.size ?? brushSize : brushSize
                const sizeFill = ((sizeValue - 48) / (190 - 48)) * 100
                return (
                  <input
                    type="range"
                    min="48"
                    max="190"
                    value={sizeValue}
                    style={{ "--fill": `${sizeFill}%` } as CSSProperties}
                    onChange={(event) => {
                      const value = Number(event.target.value)
                      setBrushSize(value)
                      if (selectedStamp) setStamps((current) => current.map((stamp) => stamp.id === selectedStamp ? { ...stamp, size: value } : stamp))
                    }}
                  />
                )
              })()}
            </label>
            <label>
              <span>BLOB OPACITY</span>
              {(() => {
                const opacityValue = selectedStamp ? Math.round((stamps.find((stamp) => stamp.id === selectedStamp)?.opacity ?? brushOpacity / 100) * 100) : brushOpacity
                const opacityFill = ((opacityValue - 20) / (100 - 20)) * 100
                return (
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={opacityValue}
                    style={{ "--fill": `${opacityFill}%` } as CSSProperties}
                    onChange={(event) => {
                      const value = Number(event.target.value)
                      setBrushOpacity(value)
                      if (selectedStamp) setStamps((current) => current.map((stamp) => stamp.id === selectedStamp ? { ...stamp, opacity: value / 100 } : stamp))
                    }}
                  />
                )
              })()}
            </label>
            <Button className="save-button" onClick={() => { setSaved(true); window.setTimeout(() => setSaved(false), 1600) }}>{saved ? "SAVED \u2713" : "SAVE"}</Button>
          </div>
        ) : (
          <div className="blob-palette-panel">
            <span className="palette-count">{palette.length} / 4 COLORS SELECTED</span>
            {palette.length > 0 && <span className="palette-blob organic-blob" style={{ background: cursorGradient }} />}
            <Button className="choose-image" onClick={() => fileRef.current?.click()}>CHOOSE IMAGE</Button>
          </div>
        )}

        <input
          ref={fileRef}
          className="workspace-file-input"
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) selectReference(URL.createObjectURL(file))
          }}
        />
        {stage === "select" && palette.length === 0 && (
          <div className="reference-carousel" aria-label="Artwork references">
            {campusArt.map((art, index) => (
              <Button key={art} className={referenceImage === art ? "active" : ""} onClick={() => selectReference(art)} aria-label={`Use artwork ${index + 1}`}>
                <img src={art} alt="" />
              </Button>
            ))}
          </div>
        )}
      </section>
    </FeatureChrome>
  )
}

function StampCutout({ image, crop }: { image: string; crop: CutoutResult }) {
  return (
    <span
      className="stamp-cutout"
      style={{
        width: `${crop.size}%`,
        transform: crop.rotation ? `rotate(${crop.rotation}deg)` : undefined,
      }}
    >
      <img src={crop.image ?? image} style={{ objectPosition: `${crop.x}% ${crop.y}%` }} alt="" />
    </span>
  )
}

function CutoutFeature({
  image,
  onNext,
  onSkip,
  onBack,
}: {
  image: string
  onNext: (result?: CutoutResult) => void
  onSkip: () => void
  onBack: () => void
}) {
  const [crop, setCrop] = useState<CutoutResult>({ x: 50, y: 48, size: 45 })
  const [stage, setStage] = useState<"select" | "masked" | "placed">("select")
  const [placedAt, setPlacedAt] = useState({ x: 50, y: 50 })
  const [rotation, setRotation] = useState(0)
  const [cutoutImage, setCutoutImage] = useState(image)
  const fileRef = useRef<HTMLInputElement>(null)
  const cropUndo = useRef<CutoutResult[]>([])
  const cropRedo = useRef<CutoutResult[]>([])
  const dragging = useRef(false)
  const movingPlaced = useRef(false)

  const rememberCrop = () => {
    cropUndo.current.push(crop)
    cropRedo.current = []
  }

  const undoCrop = () => {
    const previous = cropUndo.current.pop()
    if (!previous) return
    cropRedo.current.push(crop)
    setCrop(previous)
  }

  const redoCrop = () => {
    const next = cropRedo.current.pop()
    if (!next) return
    cropUndo.current.push(crop)
    setCrop(next)
  }

  const finishCutout = () => onNext({
    ...crop,
    image: cutoutImage,
    rotation,
  })

  const advanceCutout = () => {
    if (stage === "select") setStage("masked")
    else if (stage === "masked") setStage("placed")
    else finishCutout()
  }

  const goBack = () => {
    if (stage === "placed") setStage("masked")
    else if (stage === "masked") setStage("select")
    else onBack()
  }

  return (
    <FeatureChrome
      step={1}
      className="reference-feature-screen studio-feature-screen cutout-feature-screen"
      onBack={goBack}
      onSkip={onSkip}
      onNext={advanceCutout}
      nextLabel={stage === "placed" ? "Finish" : "Next"}
    >
      <section className={`reference-workspace cut-workspace cut-stage-${stage}`}>
        <div className="reference-title">
          <h1>CutOut this image into a <span className="accent-purple">Stamp...</span></h1>
          <p>
            {stage === "select" && "MOVE OR RESIZE THE BLANK STAMP TO SELECT ANY ELEMENT IN YOUR IMAGE"}
            {stage === "masked" && "MOVE OR RESIZE THE BLANK STAMP TO SELECT ANY ELEMENT IN YOUR IMAGE"}
            {stage === "placed" && "THIS LOOKS GREAT! RESIZE YOUR STAMP IF YOU\u2019D LIKE!"}
          </p>
        </div>
        <aside className="workspace-tools left-tools">
          <WorkspaceTool assetSrc="/assets/64327.svg" label="UNDO" path="M9 7 4 12l5 5M5 12h9a5 5 0 0 1 5 5" onClick={undoCrop} disabled={!cropUndo.current.length} />
          <WorkspaceTool assetSrc="/assets/ae3db.svg" label="REDO" path="m15 7 5 5-5 5M19 12h-9a5 5 0 0 0-5 5" onClick={redoCrop} disabled={!cropRedo.current.length} />
        </aside>

        <div className="reference-canvas-shell">
          {stage !== "placed" ? (
            <>
              <img className="cutout-background" src={cutoutImage} alt="Sculpture selected for the photo cutout" />
              {stage === "masked" && <span className="cutout-dim" />}
              <div
                className={`crop-boundary ${stage === "masked" ? "revealed" : "blank"}`}
                style={{ left: `${crop.x}%`, top: `${crop.y}%`, width: `${crop.size}%` }}
                onPointerDown={(event) => {
                  if (stage !== "select") return
                  rememberCrop()
                  dragging.current = true
                  event.currentTarget.setPointerCapture(event.pointerId)
                }}
                onPointerMove={(event) => {
                  if (!dragging.current || stage !== "select") return
                  const canvas = event.currentTarget.parentElement
                  if (!canvas) return
                  const rect = canvas.getBoundingClientRect()
                  setCrop((current) => ({
                    ...current,
                    x: Math.max(18, Math.min(82, ((event.clientX - rect.left) / rect.width) * 100)),
                    y: Math.max(18, Math.min(82, ((event.clientY - rect.top) / rect.height) * 100)),
                  }))
                }}
                onPointerUp={() => { dragging.current = false }}
              >
                {stage === "masked" && (
                  <StampCutout image={cutoutImage} crop={{ ...crop, size: 100, rotation: 0 }} />
                )}
              </div>
            </>
          ) : (
            <div className="cutout-postcard">
              <div
                className="placed-cutout"
                style={{
                  left: `${placedAt.x}%`,
                  top: `${placedAt.y}%`,
                  width: `${crop.size}%`,
                  transform: `translate(-50%,-50%) rotate(${rotation}deg)`,
                }}
                onPointerDown={(event) => {
                  movingPlaced.current = true
                  event.currentTarget.setPointerCapture(event.pointerId)
                }}
                onPointerMove={(event) => {
                  if (!movingPlaced.current) return
                  const canvas = event.currentTarget.parentElement
                  if (!canvas) return
                  const rect = canvas.getBoundingClientRect()
                  setPlacedAt({
                    x: Math.max(12, Math.min(88, ((event.clientX - rect.left) / rect.width) * 100)),
                    y: Math.max(14, Math.min(86, ((event.clientY - rect.top) / rect.height) * 100)),
                  })
                }}
                onPointerUp={() => { movingPlaced.current = false }}
              >
                <StampCutout image={cutoutImage} crop={{ ...crop, size: 100 }} />
              </div>
            </div>
          )}
        </div>

        <aside className="workspace-tools right-tools">
          <WorkspaceTool label={stage === "placed" ? "DONE" : "CUT"} path="M6 3l12 18M18 3 6 21M8 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm14 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" onClick={advanceCutout} />
        </aside>

        <div className="cutout-controls">
          {/* ADD STAMP (left) · STAMP SIZE (center) · CONFIRM (right), per frames 7/8 */}
          <Button
            className="cut-add-stamp"
            onClick={() => { if (stage === "select") setStage("masked"); else if (stage === "masked") setStage("placed") }}
            disabled={stage === "placed"}
          >ADD STAMP</Button>
          <label className="cut-size-label">
            <span>STAMP SIZE</span>
            {(() => {
              const stampFill = ((crop.size - 25) / (72 - 25)) * 100
              return (
                <input
                  type="range"
                  min="25"
                  max="72"
                  value={crop.size}
                  style={{ "--fill": `${stampFill}%` } as CSSProperties}
                  onPointerDown={rememberCrop}
                  onChange={(event) => setCrop((current) => ({ ...current, size: Number(event.target.value) }))}
                />
              )
            })()}
          </label>
          <Button className="place-button cut-confirm" onClick={advanceCutout}>
            {stage === "placed" ? "DONE" : "CONFIRM"}
          </Button>
        </div>
        <input
          ref={fileRef}
          className="workspace-file-input"
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) {
              const source = URL.createObjectURL(file)
              setCutoutImage(source)
              setCrop((current) => ({ ...current, image: source }))
            }
          }}
        />
      </section>
    </FeatureChrome>
  )
}

function NoteFeature({
  onNext,
  onSkip,
  onBack,
}: {
  onNext: (result?: NoteResult) => void
  onSkip: () => void
  onBack: () => void
}) {
  const noteRef = useRef<HTMLTextAreaElement>(null)
  const [note, setNote] = useState<NoteResult>({
    text: "",
    width: 54,
    fontSize: 28,
    color: "#bbbcac",
  })
  const [saved, setSaved] = useState(false)

  return (
    <FeatureChrome
      step={2}
      className="reference-feature-screen studio-feature-screen note-feature-screen"
      onBack={onBack}
      onSkip={onSkip}
      onNext={() => onNext(note.text.trim() ? note : undefined)}
    >
      <section className="reference-workspace note-studio-workspace">
        <div className="reference-title">
          <h1>Write a <span className="accent-mint">Handwritten Note...</span></h1>
          <p>WRITE A SHORT MEMORY OR ANY FEELING YOU HAD DURING YOUR WALK TODAY.</p>
        </div>

        <aside className="workspace-tools left-tools note-tool-rail">
          <WorkspaceTool label="WRITE" path="M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4" onClick={() => noteRef.current?.focus()} />
        </aside>

        <div className="reference-canvas-shell note-canvas-shell">
          <div className="note-postcard">
            <textarea
              ref={noteRef}
              value={note.text}
              onChange={(event) => setNote((current) => ({ ...current, text: event.target.value }))}
              placeholder="Write what stayed with you…"
              style={{
                width: `${note.width}%`,
                fontSize: `${note.fontSize}px`,
                background: note.color,
              }}
              maxLength={100}
              autoFocus
            />
          </div>
        </div>

        <aside className="workspace-tools right-tools note-color-rail">
          <span className="rail-label">PAPER</span>
          <div className="paper-colors">
            {["#bbbcac", "#c699aa", "#f7f1e3", "#f4d9a8", "#d6e4ed"].map((color) => (
              <Button key={color} style={{ background: color }} className={color === note.color ? "active" : ""} onClick={() => setNote((current) => ({ ...current, color }))} aria-label={`Use ${color} paper`} />
            ))}
          </div>
        </aside>

        <div className="note-controls studio-controls">
          <label>
            <span>NOTE SIZE</span>
            <input
              type="range"
              min="35"
              max="80"
              value={note.width}
              style={{ "--fill": `${((note.width - 35) / (80 - 35)) * 100}%` } as CSSProperties}
              onChange={(event) => setNote((current) => ({ ...current, width: Number(event.target.value) }))}
            />
          </label>
          <label>
            <span>TEXT SIZE</span>
            <input
              type="range"
              min="18"
              max="44"
              value={note.fontSize}
              style={{ "--fill": `${((note.fontSize - 18) / (44 - 18)) * 100}%` } as CSSProperties}
              onChange={(event) => setNote((current) => ({ ...current, fontSize: Number(event.target.value) }))}
            />
          </label>
          <Button className="save-button" onClick={() => { setSaved(true); window.setTimeout(() => setSaved(false), 1600) }}>{saved ? "SAVED \u2713" : "SAVE"}</Button>
        </div>
      </section>
    </FeatureChrome>
  )
}

function DoodleFeature({
  onNext,
  onSkip,
  onBack,
}: {
  onNext: (result?: string) => void
  onSkip: () => void
  onBack: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const history = useRef<string[]>([])
  const redo = useRef<string[]>([])
  // Frame 10 is freehand ("draw freely on the canvas") with no mode toggle.
  const mode: "guided" | "freehand" = "freehand"
  const [color, setColor] = useState("#df745b")
  const [size, setSize] = useState(5)
  const [hasDrawing, setHasDrawing] = useState(false)
  const [saved, setSaved] = useState(false)

  const context = () => canvasRef.current?.getContext("2d")
  const snapshot = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    history.current.push(canvas.toDataURL())
    redo.current = []
  }
  const restore = (source?: string) => {
    const canvas = canvasRef.current
    const ctx = context()
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (!source) return
    const image = new Image()
    image.onload = () => ctx.drawImage(image, 0, 0)
    image.src = source
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
  }, [])

  const point = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    return {
      x: (event.clientX - rect.left) * window.devicePixelRatio,
      y: (event.clientY - rect.top) * window.devicePixelRatio,
    }
  }

  const undoDoodle = () => {
    const current = canvasRef.current?.toDataURL()
    const previous = history.current.pop()
    if (current) redo.current.push(current)
    restore(previous)
  }

  const redoDoodle = () => {
    const next = redo.current.pop()
    if (next && canvasRef.current) history.current.push(canvasRef.current.toDataURL())
    restore(next)
  }

  const clearDoodle = () => {
    snapshot()
    restore()
    setHasDrawing(false)
  }

  return (
    <FeatureChrome
      step={3}
      className="reference-feature-screen studio-feature-screen doodle-feature-screen"
      onBack={onBack}
      onSkip={onSkip}
      onNext={() => onNext(hasDrawing ? canvasRef.current?.toDataURL() : undefined)}
      nextLabel="Finish"
    >
      <section className="reference-workspace doodle-studio-workspace">
        <div className="reference-title">
          <h1><span className="accent-blue">Doodle</span> your interpretation of the Sculpture</h1>
          <p>USE YOUR CREATIVITY. AND DRAW FREELY ON THE CANVAS</p>
        </div>

        <aside className="workspace-tools left-tools">
          <WorkspaceTool label="DRAW" path="M4 20c4-1 3-6 6-7l7-7 3 3-7 7c-1 3-6 2-7 4H4Z" />
          <WorkspaceTool label="UNDO" path="M9 7 4 12l5 5M5 12h9a5 5 0 0 1 5 5" onClick={undoDoodle} />
          <WorkspaceTool label="REDO" path="m15 7 5 5-5 5M19 12h-9a5 5 0 0 0-5 5" onClick={redoDoodle} />
        </aside>

        <div className="reference-canvas-shell doodle-canvas-shell">
          {mode === "guided" && (
            <svg className="guide-path" viewBox="0 0 800 700" aria-hidden="true">
              <path d="M102 501c34-178 180-336 332-325 116 9 240 118 232 241-10 151-190 231-323 188-118-38-179-157-117-255 47-74 154-88 225-31 54 44 61 133 9 180-44 39-121 26-151-29" />
            </svg>
          )}
          <canvas
            ref={canvasRef}
            onPointerDown={(event) => {
              snapshot()
              drawing.current = true
              event.currentTarget.setPointerCapture(event.pointerId)
              const next = point(event)
              const ctx = context()
              if (!ctx) return
              ctx.beginPath()
              ctx.moveTo(next.x, next.y)
            }}
            onPointerMove={(event) => {
              if (!drawing.current) return
              const ctx = context()
              if (!ctx) return
              const next = point(event)
              ctx.strokeStyle = color
              ctx.lineWidth = size * window.devicePixelRatio
              ctx.lineCap = "round"
              ctx.lineJoin = "round"
              ctx.lineTo(next.x, next.y)
              ctx.stroke()
              setHasDrawing(true)
            }}
            onPointerUp={() => { drawing.current = false }}
          />
        </div>

        <aside className="workspace-tools right-tools">
          <WorkspaceTool label="CLEAR" path="M6 7h12M9 7V4h6v3M8 7l1 13h6l1-13" onClick={clearDoodle} />
          <label className="doodle-color-tool">
            <span><Icon path="M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11Z" /></span>
            <small>COLOR</small>
            <input type="color" value={color} onChange={(event) => setColor(event.target.value)} />
          </label>
        </aside>

        {/* CLEAR (left) · STROKE SIZE (center) · SAVE (right), per frame 10 */}
        <div className="doodle-controls studio-controls">
          <Button className="doodle-clear" onClick={clearDoodle}>CLEAR</Button>
          <label>
            <span>STROKE SIZE</span>
            <input
              type="range"
              min="2"
              max="14"
              value={size}
              style={{ "--fill": `${((size - 2) / (14 - 2)) * 100}%` } as CSSProperties}
              onChange={(event) => setSize(Number(event.target.value))}
            />
          </label>
          <Button className="save-button" onClick={() => { setSaved(true); window.setTimeout(() => setSaved(false), 1600) }}>{saved ? "SAVED \u2713" : "SAVE"}</Button>
        </div>
      </section>
    </FeatureChrome>
  )
}

function ResultArtwork({
  feature,
  result,
  image,
}: {
  feature: Feature
  result: Results
  image: string
}) {
  if (feature === "blob" && result.blob) return <img className="result-overlay" src={result.blob} alt="" />
  if (feature === "cutout" && result.cutout) return <StampCutout image={image} crop={result.cutout} />
  if (feature === "note" && result.note) return <span className="result-note" style={{ width: `${result.note.width}%`, fontSize: `${result.note.fontSize * .8}px`, background: result.note.color }}>{result.note.text}</span>
  if (feature === "doodle" && result.doodle) return <img className="result-doodle" src={result.doodle} alt="" />
  return null
}

const featureLabels: Record<Feature, string> = {
  blob: "Color Blob",
  cutout: "Photo Cutout",
  note: "Handwritten Note",
  doodle: "Doodle",
}

// Frame-13 ("13.svg" / "15_FINAL PREVIEW.svg") treemap layout, as percentages of the
// inner white board (SVG rect x=283 y=275 w=715 h=433). Each feature drops into its
// real slot from the design: ColorBlob fills the wide top band, Doodle the lower-left,
// Note the lower-right strip, and the Photo Cutout stamp overlays the centre.
const frame13Slots: Record<Feature, Omit<CompositionElement, "feature" | "visible">> = {
  // Red region #8E3557 — rect 298.25,291.25 .. 981.75,576.75
  blob: { x: 2.1, y: 3.8, width: 95.6, height: 65.9, z: 1 },
  // Blue region #005682 — rect 298.25,463.25 .. 543.75,692.75
  doodle: { x: 2.1, y: 43.5, width: 34.3, height: 53, z: 2 },
  // Green region #BBBCAC — rect 545,578 .. 983,694
  note: { x: 36.6, y: 70, width: 61.3, height: 26.8, z: 3 },
  // Stamp blob #404361 — overlays the centre, x≈469..652 y≈495..621
  cutout: { x: 26, y: 50.8, width: 25.6, height: 29.1, z: 4 },
}

function defaultComposition(completed: Feature[]): CompositionElement[] {
  // Preserve the design's stacking order regardless of the order features were finished.
  const order: Feature[] = ["blob", "doodle", "note", "cutout"]
  return order
    .filter((feature) => completed.includes(feature))
    .map((feature) => ({ feature, ...frame13Slots[feature], visible: true }))
}

function PostcardComposition({
  elements,
  results,
  image,
  selected,
  editable = false,
  onSelect,
  onChange,
}: {
  elements: CompositionElement[]
  results: Results
  image: string
  selected?: Feature
  editable?: boolean
  onSelect?: (feature: Feature) => void
  onChange?: (feature: Feature, changes: Partial<CompositionElement>) => void
}) {
  const interaction = useRef<{
    feature: Feature
    mode: "move" | "resize"
    startX: number
    startY: number
    element: CompositionElement
  } | null>(null)

  const begin = (
    event: ReactPointerEvent<HTMLElement>,
    element: CompositionElement,
    mode: "move" | "resize",
  ) => {
    if (!editable) return
    event.preventDefault()
    event.stopPropagation()
    interaction.current = {
      feature: element.feature,
      mode,
      startX: event.clientX,
      startY: event.clientY,
      element: { ...element },
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    onSelect?.(element.feature)
  }

  const move = (event: ReactPointerEvent<HTMLElement>) => {
    const active = interaction.current
    const canvas = event.currentTarget.closest(".treemap-canvas")
    if (!active || !canvas) return
    const bounds = canvas.getBoundingClientRect()
    const dx = ((event.clientX - active.startX) / bounds.width) * 100
    const dy = ((event.clientY - active.startY) / bounds.height) * 100
    if (active.mode === "move") {
      onChange?.(active.feature, {
        x: Math.max(0, Math.min(100 - active.element.width, active.element.x + dx)),
        y: Math.max(0, Math.min(100 - active.element.height, active.element.y + dy)),
      })
      return
    }
    onChange?.(active.feature, {
      width: Math.max(8, Math.min(100 - active.element.x, active.element.width + dx)),
      height: Math.max(8, Math.min(100 - active.element.y, active.element.height + dy)),
    })
  }

  return (
    <div className={`treemap-canvas ${editable ? "editable" : ""}`}>
      {elements.filter((element) => element.visible).map((element) => (
        <article
          key={element.feature}
          className={`composition-region region-${element.feature} ${selected === element.feature ? "selected" : ""}`}
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            width: `${element.width}%`,
            height: `${element.height}%`,
            zIndex: element.z,
          }}
          onPointerDown={(event) => begin(event, element, "move")}
          onPointerMove={move}
          onPointerUp={() => { interaction.current = null }}
          onPointerCancel={() => { interaction.current = null }}
          onClick={() => onSelect?.(element.feature)}
        >
          <ResultArtwork feature={element.feature} result={results} image={image} />
          {!editable && <span className="region-corner" aria-hidden="true" />}
          {editable && (
            <>
              <span className="region-label">{featureLabels[element.feature]}</span>
              <button
                className="region-resize"
                aria-label={`Resize ${featureLabels[element.feature]}`}
                onPointerDown={(event) => begin(event, element, "resize")}
              />
            </>
          )}
        </article>
      ))}
    </div>
  )
}

function FinalScreen({
  image,
  results,
  onRestart,
  onBack,
}: {
  image: string
  results: Results
  onRestart: () => void
  onBack: () => void
}) {
  const completed = (Object.keys(results) as Feature[]).filter((feature) => results[feature])
  const [stage, setStage] = useState<"choose" | "separate" | "edit" | "sign" | "finished">("choose")
  // Remember which stage the sign step was reached from so BACK returns there
  // (the merge flow enters sign from "edit"; the separate flow enters from "separate").
  const [signFrom, setSignFrom] = useState<"edit" | "separate">("edit")
  const [elements, setElements] = useState(() => defaultComposition(completed))
  const [selected, setSelected] = useState<Feature>(completed[0] ?? "blob")
  const [composerEditable, setComposerEditable] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [name, setName] = useState("")
  const [actionState, setActionState] = useState<"idle" | "downloaded" | "shared">("idle")

  const updateElement = (feature: Feature, changes: Partial<CompositionElement>) => {
    setElements((current) => current.map((element) => (
      element.feature === feature ? { ...element, ...changes } : element
    )))
  }
  const ordered = [...elements].sort((a, b) => a.z - b.z)

  const createPostcardBlob = async () => {
    const canvas = document.createElement("canvas")
    canvas.width = 1800
    canvas.height = 1240
    const context = canvas.getContext("2d")
    if (!context) return null
    context.fillStyle = "#ffffff"
    context.fillRect(0, 0, canvas.width, canvas.height)
    const inset = 54
    const artWidth = canvas.width - inset * 2
    const artHeight = canvas.height - 170
    context.fillStyle = "#f7f4e9"
    context.fillRect(inset, inset, artWidth, artHeight)

    const loadImage = (source: string) => new Promise<HTMLImageElement>((resolve, reject) => {
      const artwork = new Image()
      artwork.onload = () => resolve(artwork)
      artwork.onerror = reject
      artwork.src = source
    })

    for (const element of ordered.filter((item) => item.visible)) {
      const x = inset + (element.x / 100) * artWidth
      const y = inset + (element.y / 100) * artHeight
      const width = (element.width / 100) * artWidth
      const height = (element.height / 100) * artHeight
      context.save()
      context.beginPath()
      context.rect(x, y, width, height)
      context.clip()
      context.fillStyle = "#f7f4e9"
      context.fillRect(x, y, width, height)
      try {
        if (element.feature === "note" && results.note) {
          context.fillStyle = results.note.color
          context.fillRect(x, y, width, height)
          context.fillStyle = "#30453d"
          context.font = `700 ${Math.max(24, Math.min(62, width / 8))}px "Figma Hand:Bold", cursive`
          context.textAlign = "center"
          context.textBaseline = "middle"
          context.fillText(results.note.text, x + width / 2, y + height / 2, width * .86)
        } else {
          const source = element.feature === "blob"
            ? results.blob
            : element.feature === "doodle"
              ? results.doodle
              : image
          if (source) {
            const artwork = await loadImage(source)
            const scale = Math.max(width / artwork.naturalWidth, height / artwork.naturalHeight)
            const drawnWidth = artwork.naturalWidth * scale
            const drawnHeight = artwork.naturalHeight * scale
            context.drawImage(artwork, x + (width - drawnWidth) / 2, y + (height - drawnHeight) / 2, drawnWidth, drawnHeight)
          }
        }
      } catch {
        context.fillStyle = "#e9e9df"
        context.fillRect(x, y, width, height)
      }
      context.restore()
    }
    context.strokeStyle = "#292b27"
    context.lineWidth = 3
    context.strokeRect(inset, inset, artWidth, artHeight)
    context.fillStyle = "#30453d"
    context.font = '700 42px "Figma Hand:Bold", cursive'
    context.textAlign = "left"
    context.fillText(name.trim(), inset, canvas.height - 54)
    context.fillStyle = "#77796f"
    context.font = '500 18px "Inter:Medium", sans-serif'
    context.textAlign = "right"
    context.fillText("ART—TRACE · A WALK REMADE", canvas.width - inset, canvas.height - 54)
    return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"))
  }

  const download = async () => {
    const blob = await createPostcardBlob()
    if (!blob) return
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "art-trace-postcard.png"
    link.click()
    URL.revokeObjectURL(link.href)
    setActionState("downloaded")
  }

  const share = async () => {
    const blob = await createPostcardBlob()
    if (!blob) return
    const file = new File([blob], "art-trace-postcard.png", { type: "image/png" })
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ title: "My ArtTrace postcard", files: [file] })
      setActionState("shared")
    } else {
      await download()
    }
  }

  if (stage === "separate") {
    return (
      <main className="separate-screen">
        <header><Brand /><span>{completed.length} SEPARATE POSTCARDS</span></header>
        <section className="separate-heading">
          <p className="eyebrow">ONE FEATURE, ONE COMPOSITION</p>
          <h1>Choose a postcard to preview.</h1>
        </section>
        <article className="separate-preview">
          <PostcardComposition elements={elements} results={results} image={image} />
        </article>
        <nav className="separate-tabs" aria-label="Postcard previews">
          {completed.map((feature, index) => (
            <Button
              key={feature}
              className={selected === feature ? "active" : ""}
              onClick={() => {
                setSelected(feature)
                setElements(defaultComposition([feature]))
              }}
            >
              <i className={`feature-dot dot-${feature}`} />
              <span>{String(index + 1).padStart(2, "0")}</span>
              <b>{featureLabels[feature]}</b>
            </Button>
          ))}
        </nav>
        <div className="separate-actions">
          <Button onClick={() => setStage("choose")}>Back</Button>
          <Button className="active" onClick={() => { setSignFrom("separate"); setStage("sign") }}>Finish selected postcard</Button>
        </div>
      </main>
    )
  }

  if (stage === "edit") {
    return (
      <main className="composer-screen">
        <header><Brand /><span>POSTCARD COMPOSER</span></header>
        <section className="composer-heading">
          <div><h1><strong>Personalize</strong> your <strong>Postcard...</strong></h1></div>
          <p>CREATE A VISUAL DIARY AND USE THIS POSTCARD AS YOUR DAILY REFLECTION CARD.</p>
        </section>
        <section className="composer-stage">
          <aside className="composer-rail rail-left">
            {elements.some((element) => element.feature === "blob") && (
              <button
                type="button"
                className={`rail-card card-blob ${selected === "blob" ? "active" : ""}`}
                onClick={() => setSelected("blob")}
              ><span>COLORBLOB</span></button>
            )}
            {elements.some((element) => element.feature === "doodle") && (
              <button
                type="button"
                className={`rail-card card-doodle ${selected === "doodle" ? "active" : ""}`}
                onClick={() => setSelected("doodle")}
              ><span>DOODLE</span></button>
            )}
            <Button
              className="rail-pill layer-forward-pill"
              disabled={!elements.some((element) => element.feature === selected)}
              onClick={() => updateElement(selected, { z: Math.max(...elements.map((element) => element.z)) + 1 })}
            >BRING FORWARD</Button>
          </aside>

          <div className={`composer-board ${showPreview ? "is-preview" : ""} ${composerEditable ? "is-editing" : ""}`}>
            <PostcardComposition
              elements={elements}
              results={results}
              image={image}
              selected={showPreview ? undefined : selected}
              editable={composerEditable && !showPreview}
              onSelect={setSelected}
              onChange={updateElement}
            />
            {showPreview && <span className="preview-flag" aria-hidden="true">PREVIEW</span>}
          </div>

          <aside className="composer-rail rail-right">
            {elements.some((element) => element.feature === "cutout") && (
              <button
                type="button"
                className={`rail-card card-cutout ${selected === "cutout" ? "active" : ""}`}
                onClick={() => setSelected("cutout")}
              ><span>STAMP</span></button>
            )}
            {elements.some((element) => element.feature === "note") && (
              <button
                type="button"
                className={`rail-card card-note ${selected === "note" ? "active" : ""}`}
                onClick={() => setSelected("note")}
              ><span>NOTE</span></button>
            )}
            <Button
              className="rail-pill layer-backward-pill"
              disabled={!elements.some((element) => element.feature === selected)}
              onClick={() => updateElement(selected, { z: Math.min(...elements.map((element) => element.z)) - 1 })}
            >SEND BACKWARD</Button>
          </aside>

          <div className="composer-tools">
            <Button
              className={`composer-pill tool-edit ${composerEditable ? "is-active" : ""}`}
              onClick={() => { setShowPreview(false); setComposerEditable((value) => !value) }}
            >EDIT</Button>
            <Button
              className={`composer-pill tool-preview ${showPreview ? "is-active" : ""}`}
              onClick={() => { setComposerEditable(false); setShowPreview((value) => !value) }}
            >SHOW PREVIEW</Button>
            <Button
              className="composer-pill tool-reset"
              onClick={() => { setElements(defaultComposition(completed)); setComposerEditable(false); setShowPreview(false) }}
            >RESET</Button>
          </div>
        </section>
        <Button className="composer-back nav-circle" onClick={() => setStage("choose")}><Icon path="M15 18l-6-6 6-6" /><small>BACK</small></Button>
        <Button className="composer-continue nav-circle" onClick={() => { setSignFrom("edit"); setStage("sign") }}><Icon path="M9 6l6 6-6 6" /><small>NEXT</small></Button>
      </main>
    )
  }

  if (stage === "sign") {
    return (
      <main className="sign-screen">
        <header><Brand /><span>FINAL TOUCH</span></header>
        <section className="sign-heading">
          <h1><strong>Personalize</strong> your <strong>Postcard...</strong></h1>
          <p>ADD YOUR NAME OR WRITE SOMETHING THAT DESCRIBES YOUR POSTCARD</p>
        </section>
        {/* One large cream card: the name is typed directly as a big, centered
            handwriting field; a single SHOW PREVIEW pill sits at the bottom. */}
        <section className="sign-card">
          <input
            className="sign-name-input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={32}
            placeholder="Write your Name..."
            autoFocus
          />
          <Button className="sign-show-preview" disabled={!name.trim()} onClick={() => setStage("finished")}>SHOW PREVIEW</Button>
        </section>
        <Button className="sign-back nav-circle" onClick={() => setStage(signFrom)}><Icon path="M15 18l-6-6 6-6" /><small>BACK</small></Button>
        <Button className="sign-next nav-circle" disabled={!name.trim()} onClick={() => setStage("finished")}><Icon path="M9 6l6 6-6 6" /><small>NEXT</small></Button>
      </main>
    )
  }

  if (stage === "finished") {
    return (
      <main className="finished-screen">
        <header><Brand /><span>POSTCARD COMPLETE</span></header>
        <article className="print-postcard">
          <header className="postcard-stats">
            <span className="stat stat-start"><b>1802</b><small>steps</small></span>
            <span className="postcard-title">{(name.trim() ? `${name.trim()}'s` : "rutu's")} walk</span>
            <span className="stat stat-end"><b>18:09</b><small>min</small></span>
          </header>
          <div className="postcard-rotator">
            {/* Live composition of the user's actual selected features, laid out
                in the frame-13 treemap (ColorBlob / Doodle / Note / Photo Cutout). */}
            <PostcardComposition elements={elements} results={results} image={image} />
          </div>
          <footer><b>{name}</b><span>ART—TRACE · A WALK REMADE</span></footer>
        </article>
        <section className="final-actions">
          <Button className="finished-pill act-download" onClick={download}>DOWNLOAD</Button>
          <Button className="finished-pill act-share" onClick={share}>SHARE</Button>
          <Button className="finished-pill act-edit" onClick={() => setStage("edit")}>EDIT</Button>
        </section>
        <button type="button" className="finished-restart-link" onClick={onRestart}>Start another postcard</button>
        {actionState !== "idle" && (
          <p className="action-confirmation" role="status">
            {actionState === "shared" ? "Your postcard was shared." : "Your postcard was downloaded."}
          </p>
        )}
      </main>
    )
  }

  return (
    <main className="final-screen">
      <header><Brand /><span>YOUR INTERPRETATIONS</span></header>
      <section className="final-heading">
        <h1><strong>Preview</strong> your <strong>ArtWorks...</strong></h1>
        <p>THIS LOOKS AMAZING! READY TO MERGE ALL OF YOUR CREATIONS, TAP NEXT</p>
      </section>
      <section className={`postcard-results count-${completed.length}`}>
        {completed.map((feature) => (
          <article key={feature} className={`final-postcard card-${feature}`}>
            <div>
              <ResultArtwork feature={feature} result={results} image={image} />
            </div>
            <footer><span>{feature === "blob" ? "COLORBLOB" : feature === "cutout" ? "STAMP" : feature === "note" ? "NOTE" : "DOODLE"}</span></footer>
          </article>
        ))}
      </section>
      {/* Single centered MERGE ALL pill (frame "Preview your ArtWorks..."). */}
      <section className="composition-actions">
        <Button className="merge-all" disabled={!completed.length} onClick={() => setStage("edit")}>MERGE ALL</Button>
      </section>
      <Button className="preview-back nav-circle" onClick={onBack}><Icon path="M15 18l-6-6 6-6" /><small>BACK</small></Button>
      <Button className="preview-next nav-circle" disabled={!completed.length} onClick={() => setStage("edit")}><Icon path="M9 6l6 6-6 6" /><small>NEXT</small></Button>
    </main>
  )
}

function IntroScreen({ onDone }: { onDone: () => void }) {
  const reducedMotion =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches

  // Finish exactly once, whether via click, Enter, or the auto-advance timer.
  const finished = useRef(false)
  const finish = () => {
    if (finished.current) return
    finished.current = true
    onDone()
  }

  useEffect(() => {
    const duration = reducedMotion ? 1200 : 4200
    const timer = window.setTimeout(finish, duration)
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") finish()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener("keydown", onKeyDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main
      className={`intro-screen ${reducedMotion ? "intro-static" : "intro-animate"}`}
      role="button"
      tabIndex={0}
      aria-label="ArtTrace intro. Click or press Enter to continue."
      onClick={finish}
    >
      <svg
        className="intro-stage"
        viewBox="0 0 1280 832"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <rect width="1280" height="832" fill="white" />
        <path
          className="intro-blob"
          d="M272.77 147.705C299.792 147.131 327.397 147.937 353.481 153.97C376.382 159.259 397.662 168.331 419.304 176.679C530.673 219.633 659.479 228.738 777.412 201.738C848.285 185.508 914.651 156.766 986.635 144.573C1126.75 120.844 1271.34 161.35 1413.7 151.62C1457.48 148.625 1501.64 141.489 1545.35 145.356C1589.05 149.222 1634.05 167.196 1651.92 201.738C1670.7 238.064 1654.12 281.044 1629.19 314.502C1569.89 394.164 1468.68 443.926 1365.9 477.384C1263.09 510.863 1154.78 531.25 1054.81 570.571C976.335 601.438 904.587 643.427 826.779 675.505C748.972 707.582 661.995 729.539 576.809 717.791C498.508 707 429.191 669.231 353.481 648.88C219.903 612.979 63.5384 631.511 -50.0757 561.174C-143.306 503.477 -181.133 401.629 -213.066 306.671C-251.439 192.468 -173.969 174.188 -61.0462 178.245C49.8041 182.239 160.933 150.105 272.77 147.705Z"
          fill="#8E3557"
        />
        <g className="intro-wordmark" fill="white">
          <text x="80" y="435.625" fontSize="150" fontWeight={800} letterSpacing="-0.05em">art</text>
          <text x="300.664" y="435.625" fontSize="150" letterSpacing="-0.05em">trace</text>
        </g>
        <text className="intro-tagline" x="80" y="489.09" fill="white" fontSize="36" letterSpacing="-0.025em">move through place, connect through art</text>
      </svg>
    </main>
  )
}

class App extends Component<
  Record<string, never>,
  { screen: Screen; image: string; step: number; results: Results; theme: Theme; menuOpen: boolean }
> {
  state = {
    screen: "intro" as Screen,
    image: campusArt[0],
    step: 0,
    results: {} as Results,
    theme: "day" as Theme,
    menuOpen: false,
  }

  componentDidMount() {
    const stored = window.localStorage.getItem("arttrace-theme")
    if (stored === "day" || stored === "night") {
      this.setState({ theme: stored })
    }
  }

  toggleTheme = () => {
    this.setState((state) => {
      const theme = state.theme === "day" ? "night" : "day"
      window.localStorage.setItem("arttrace-theme", theme)
      return { theme }
    })
  }

  toggleMenu = () => {
    this.setState((state) => ({ menuOpen: !state.menuOpen }))
  }

  // Jump to a feature (or the preview) from the header menu. Work is preserved
  // because feature results live in App state and each feature seeds from them.
  // If no image is chosen yet, a feature jump first routes through upload.
  navigate = (target: "blob" | "cutout" | "note" | "doodle" | "preview") => {
    this.setState((state) => {
      if (target === "preview") {
        return { menuOpen: false, screen: "final" as Screen, step: state.step }
      }
      const stepFor = { blob: 0, cutout: 1, note: 2, doodle: 3 }[target]
      if (state.screen === "intro" || state.screen === "upload") {
        // haven't picked an image yet — go pick one first
        return { menuOpen: false, screen: "upload" as Screen, step: state.step }
      }
      return { menuOpen: false, screen: "making" as Screen, step: stepFor }
    })
  }

  advance = (feature: Feature, value?: string | CutoutResult | NoteResult) => {
    this.setState((state) => ({
      results: value ? { ...state.results, [feature]: value } : state.results,
      step: Math.min(3, state.step + 1),
      screen: state.step === 3 ? "final" : "making",
    }))
  }

  skip = () => {
    this.setState((state) => ({
      step: Math.min(3, state.step + 1),
      screen: state.step === 3 ? "final" : "making",
    }))
  }

  render() {
    const { screen, image, step, results, theme } = this.state
    let content: ReactNode
    if (screen === "intro") {
      content = <IntroScreen onDone={() => this.setState({ screen: "upload" })} />
    } else if (screen === "upload") {
      content = <UploadScreen onSelect={(selected) => this.setState({ image: selected, screen: "making", step: 0, results: {} })} />
    } else if (screen === "final") {
      content = (
        <FinalScreen
          image={image}
          results={results}
          onRestart={() => this.setState({ screen: "upload", step: 0, results: {} })}
          onBack={() => this.setState({ screen: "making", step: 3 })}
        />
      )
    } else if (step === 0) {
      content = <BlobFeature image={image} onNext={(value) => this.advance("blob", value)} onSkip={this.skip} onBack={() => this.setState({ screen: "upload" })} />
    } else if (step === 1) {
      content = <CutoutFeature image={image} onNext={(value) => this.advance("cutout", value)} onSkip={this.skip} onBack={() => this.setState({ step: 0 })} />
    } else if (step === 2) {
      content = <NoteFeature onNext={(value) => this.advance("note", value)} onSkip={this.skip} onBack={() => this.setState({ step: 1 })} />
    } else {
      content = <DoodleFeature onNext={(value) => this.advance("doodle", value)} onSkip={this.skip} onBack={() => this.setState({ step: 2 })} />
    }
    const { menuOpen } = this.state
    const menuItems: { key: "blob" | "cutout" | "note" | "doodle" | "preview"; label: ReactNode; color: string; icon: string }[] = [
      { key: "blob", label: <>COLOR <strong>BLOB</strong></>, color: "#8E3557", icon: "M18.5 11.8c-.9 3.4-1.3 5.1-5.3 5.1s-3.9-2.6-5.2-5.1c-1.3-2.5 4.3-8.6 5.2-5.2.9 3.5 6.2 1.8 5.3 5.2Z" },
      { key: "cutout", label: <>PHOTO <strong>STAMP</strong></>, color: "#404361", icon: "M5 6.5a1.5 1.5 0 0 0 3 0h2a1.5 1.5 0 0 0 3 0h2a1.5 1.5 0 0 0 3 0 1.5 1.5 0 0 0 0 3v2a1.5 1.5 0 0 0 0 3 1.5 1.5 0 0 0-3 0h-2a1.5 1.5 0 0 0-3 0H8a1.5 1.5 0 0 0-3 0 1.5 1.5 0 0 0 0-3v-2a1.5 1.5 0 0 0 0-3Z" },
      { key: "doodle", label: <><strong>DOODLE</strong> ART</>, color: "#005682", icon: "M16.5 15.8c-1.4 0-2.5-1.1-2.5-2.5 0-.7.3-1.3.7-1.8l3.3-3.3c.4-.4.1-1.1-.5-1.1-.3 0-.5.1-.7.3l-5.6 5.6c-.6.6-1.6.6-2.2 0-.6-.6-.6-1.6 0-2.2l4.2-4.2c.4-.4.1-1.1-.5-1.1-.3 0-.5.1-.7.3l-3 3c-.3.3-.8.3-1.1 0-.3-.3-.3-.8 0-1.1l3-3c1.1-1.1 2.9-1.1 4 0 1.1 1.1 1.1 2.9 0 4l-4.2 4.2c-.3.3-.1.5.1.5s.4-.1.5-.1l5.6-5.6c1.1-1.1 2.9-1.1 4 0 1.1 1.1 1.1 2.9 0 4l-3.3 3.3c-.2.2-.3.5-.3.8 0 .6.5 1.1 1.1 1.1.8 0 1.9-.6 2.5-1 .3-.2.7-.1.9.2.2.3.1.7-.2.9-.9.6-2.3 1.4-3.4 1.4Z" },
      { key: "note", label: <>WRITE A <strong>NOTE</strong></>, color: "#787A5B", icon: "M15.6 7.1 9.5 13.2c-.3.3-.5.6-.6 1l-.4 1.6 1.6-.4c.4-.1.7-.3 1-.6l6.1-6.1c.6-.6.6-1.5 0-2.1-.6-.5-1.5-.5-2.1.1ZM17.5 11.5v4a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h4" },
      { key: "preview", label: <>PREVIEW <strong>POSTCARDS</strong></>, color: "#2F2F2F", icon: "M8 11h2v2H8zM14 11h2v2h-2zM9 16H8a2 2 0 0 1-2-2v-1M9 8H8a2 2 0 0 1 2-2h1M15 8h1a2 2 0 0 1 2 2v1M15 16h1a2 2 0 0 1 2-2v-1M11 12h2" },
    ]
    return (
      <div className="app-root" data-theme={theme}>
        <ThemeToggle theme={theme} onToggle={this.toggleTheme} />
        <button
          type="button"
          className="app-hamburger"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={this.toggleMenu}
        >
          <span /><span /><span />
        </button>
        {content}
        {menuOpen && (
          <nav className="app-menu" aria-label="Sections">
            <div className="app-menu-top">
              <Brand />
              <button type="button" className="app-menu-close" aria-label="Close menu" onClick={this.toggleMenu}>
                <Icon path="M6 6l12 12M18 6 6 18" />
              </button>
            </div>
            <ul className="app-menu-list">
              {menuItems.map((item) => (
                <li key={item.key}>
                  <button type="button" className="app-menu-item" style={{ color: item.color }} onClick={() => this.navigate(item.key)}>
                    <span className="app-menu-label">{item.label}</span>
                    <span className="app-menu-icon" aria-hidden="true" style={{ color: item.color }}><Icon path={item.icon} /></span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    )
  }
}

export default App
