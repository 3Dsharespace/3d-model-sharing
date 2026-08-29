import React from 'react'
import PageMeta from '../components/PageMeta'
import StudioDocument from '../components/StudioDocument'

const Terms = () => (
  <>
    <PageMeta
      title="Terms of Use | 3D ShareSpace"
      description="Terms for using 3D ShareSpace, uploading 3D models, downloading assets, and reporting policy issues."
      url="/terms"
      type="website"
    />
    <StudioDocument
      kicker="Terms"
      title="Terms of use"
      subtitle="Use 3D ShareSpace as a practical library for 3D assets. Upload only content you have rights to share and use downloaded files responsibly."
      actions={[{ label: 'Browse library', to: '/explore', primary: true }, { label: 'Report issue', to: '/report' }]}
      aside={(
        <>
          <h2>Platform rules</h2>
          <ul>
            <li>No stolen or misleading assets.</li>
            <li>No harmful, illegal, or abusive uploads.</li>
            <li>Use accurate titles, categories, tags, and preview images.</li>
            <li>Respect model licenses and creator rights.</li>
          </ul>
        </>
      )}
    >
      <div className="studio-doc-content">
        <section>
          <h2>Using the service</h2>
          <p>By using 3D ShareSpace, you agree to follow these terms, applicable laws, and platform policies. You are responsible for your account activity and uploaded content.</p>
        </section>
        <section>
          <h2>Uploads</h2>
          <p>You must own or have permission to share every model, texture, preview image, and description you upload. Published assets may be visible in Explore, model pages, image pages, search results, and sitemaps.</p>
        </section>
        <section>
          <h2>Downloads</h2>
          <p>Downloaded files must be used according to the license and metadata shown with the model. If license terms are unclear, treat the asset conservatively or contact the creator.</p>
        </section>
        <section>
          <h2>Moderation</h2>
          <p>We may remove, hide, or restrict content that appears infringing, unsafe, misleading, broken, spammy, or otherwise harmful to the library.</p>
        </section>
        <section>
          <h2>Changes</h2>
          <p>We may update these terms as the product changes. Continued use of the site means you accept the current terms.</p>
        </section>
      </div>
    </StudioDocument>
  </>
)

export default Terms
