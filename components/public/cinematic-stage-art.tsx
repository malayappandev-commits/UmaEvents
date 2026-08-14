/** Abstract cinematic stage — not stock photography, not a fake event. */
export function CinematicStageArt() {
  return (
    <div className="uma-stage-art" aria-hidden>
      <span className="uma-stage-art-glow uma-stage-art-glow--a" />
      <span className="uma-stage-art-glow uma-stage-art-glow--b" />
      <span className="uma-stage-art-glow uma-stage-art-glow--c" />
      <span className="uma-stage-art-bokeh" />
      <svg className="uma-stage-art-arch" viewBox="0 0 800 900" preserveAspectRatio="xMidYMax meet">
        <path
          d="M140 880 V420 C140 180 280 70 400 70 C520 70 660 180 660 420 V880"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <path
          d="M190 880 V430 C190 220 300 120 400 120 C500 120 610 220 610 430 V880"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.7"
          opacity="0.55"
        />
        <path d="M250 200 C320 140 480 140 550 200" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.4" />
      </svg>
    </div>
  );
}
