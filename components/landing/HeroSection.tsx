interface HeroSectionProps {
  onReadScripture: () => void;
}

export function HeroSection({ onReadScripture }: HeroSectionProps) {
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
      <div style={{ marginTop: "2rem" }}>
        <button
          type="button"
          onClick={onReadScripture}
          className="save-btn"
          style={{
            width: "auto",
            padding: "0.75rem 2rem",
            fontSize: "0.95rem",
            letterSpacing: "0.04em",
            borderRadius: "9999px"
          }}
        >
          Read Scripture
        </button>
      </div>
    </section>
  );
}
