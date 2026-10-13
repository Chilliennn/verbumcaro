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
        聖言成了血肉，寄居在我們中間。 — 若望福音 1:14
      </div>
      <div style={{ marginTop: "1.75rem" }}>
        <button
          type="button"
          onClick={onReadScripture}
          className="save-btn read-scripture-btn"
          style={{
            width: "auto",
            height: "auto",
            minHeight: "42px",
            padding: "0.7rem 2.25rem",
            fontSize: "0.95rem",
            fontWeight: 600,
            letterSpacing: "0.04em",
            borderRadius: "9999px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1.2
          }}
        >
          Read Scripture
        </button>
      </div>
    </section>
  );
}
