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
        &ldquo;And the Word was made flesh, and dwelt among us&rdquo; &mdash; John 1:14
      </div>
      <div className="hero-cjk">
        話成了血肉，寄居在我們中間 &mdash; 若望福音 1:14
      </div>
      <div className="hero-cta-wrapper">
        <button
          type="button"
          onClick={onReadScripture}
          className="save-btn read-scripture-btn"
        >
          Read Scripture
        </button>
      </div>
    </section>
  );
}
