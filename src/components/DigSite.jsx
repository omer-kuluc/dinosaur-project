// Where a trackway ends: an invisible anchor above the specimen that the
// footprint trail leads to.
export default function DigSite({ small = false }) {
  return (
    <div className="dig" aria-hidden="true">
      <span className="trail-anchor dig__anchor" data-trail="in" data-trail-small={small ? 'true' : undefined} />
    </div>
  )
}
