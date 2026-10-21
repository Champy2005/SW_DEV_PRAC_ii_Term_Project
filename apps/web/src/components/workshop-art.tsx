export function WorkshopArt({ index = 0, large = false }: { index?: number; large?: boolean }) {
  const style = ((index % 4) + 4) % 4;
  return <div className={`workshop-art art-${style}${large ? ' art-large' : ''}`} aria-hidden="true">
    <span className="art-grid"/><span className="art-shape shape-one"/><span className="art-shape shape-two"/><span className="art-shape shape-three"/><span className="art-spark">✳</span><span className="art-caption">A LITTLE TIME. SOMETHING NEW.</span>
  </div>;
}
