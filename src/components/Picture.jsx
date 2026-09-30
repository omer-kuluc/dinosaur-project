// AVIF first, WebP fallback, with sizes matched to the layout so phones pick
// the 360/540 renditions instead of the 1024 one.
export default function Picture({ data, sizes, alt = '', className = '', imgClassName = '', eager = false }) {
  return (
    <picture className={className}>
      <source type="image/avif" srcSet={data.avif} sizes={sizes} />
      <source type="image/webp" srcSet={data.webp} sizes={sizes} />
      <img
        className={imgClassName}
        src={data.src}
        width={data.width}
        height={data.height}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : undefined}
        decoding="async"
      />
    </picture>
  )
}
