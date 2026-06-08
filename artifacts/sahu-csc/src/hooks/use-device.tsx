import * as React from "react"

type DeviceType = "mobile" | "tablet" | "desktop"

export function useDevice(): DeviceType {
  const [device, setDevice] = React.useState<DeviceType>("desktop")

  React.useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      if (w < 640) setDevice("mobile")
      else if (w < 1024) setDevice("tablet")
      else setDevice("desktop")
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  return device
}

export function useIsMobile() {
  const device = useDevice()
  return device === "mobile"
}

export function useIsDesktop() {
  const device = useDevice()
  return device === "desktop"
}
