interface HeroSectionProps {
  onOpenReader?: () => void;
}

export function HeroSection({ onOpenReader }: HeroSectionProps) {
  return (
    <section className="hero-banner">
      <div className="hero-pretitle">The Adoration of the Shepherds by Caravaggio</div>
      <h1 className="hero-heading">
        <span className="line-roman">Et Verbum caro factum est,</span>
        <span className="line-italic">et habitavit in nobis</span>
      </h1>
      <div className="hero-divider-rule" />
      <div className="hero-subscript">
        "And the Word was made flesh, and dwelt among us" — John 1:14
      </div>
      <div className="hero-cjk">
        聖言成了血肉，寄居在我們中間 — 若望福音 1:14
      </div>
      {onOpenReader && (
        <div style={{ marginTop: "2rem", display: "flex", justifyContent: "center" }}>
          <button
            type="button"
            onClick={onOpenReader}
            className="save-btn"
            style={{
              padding: "0.75rem 1.75rem",
              fontSize: "1rem",
              letterSpacing: "0.05em",
              cursor: "pointer"
            }}
          >
            Read Scripture
          </button>
        </div>
      )}
    </section>
  );
}
