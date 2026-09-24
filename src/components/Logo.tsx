// A white isometric cube (a nod to Blender's default cube).
// Each face uses a different opacity to fake lighting from the top left.
export default function Logo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      viewBox="0 0 256 256"
      fill="none"
      role="img"
      aria-label="Joseph Adebiyi"
    >
      <path d="M128 16 L224 72 L128 128 L32 72 Z" fill="white" />
      <path d="M32 72 L128 128 L128 240 L32 184 Z" fill="white" fillOpacity="0.7" />
      <path d="M128 128 L224 72 L224 184 L128 240 Z" fill="white" fillOpacity="0.45" />
    </svg>
  )
}
