// Owner: Leonardo (Task LEO-02) — Deep-space cutout backdrop
export function Starfield() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-space-ink"
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            "radial-gradient(#F8FAFC 1.5px, transparent 1.5px), radial-gradient(#94A3B8 1px, transparent 1px)",
          backgroundSize: "72px 72px, 43px 43px",
          backgroundPosition: "0 0, 21px 17px",
        }}
      />
      <div
        className="absolute -right-16 -top-16 h-56 w-56 rounded-full border-4 border-ink-black bg-blueprint-navy opacity-70"
        style={{ boxShadow: "6px 6px 0px #0F172A" }}
      />
    </div>
  );
}

export default Starfield;
