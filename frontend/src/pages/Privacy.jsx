import React from 'react'
import PageMeta from '../components/PageMeta'
import StudioDocument from '../components/StudioDocument'

const Privacy = () => (
  <>
    <PageMeta
      title="Privacy Policy | 3D ShareSpace"
      description="Privacy policy for 3D ShareSpace, including account data, uploaded models, analytics, and contact information."
      url="/privacy"
      type="website"
    />
    <StudioDocument
      kicker="Policy"
      title="Privacy policy"
      subtitle="We collect the information needed to run a 3D asset library: accounts, uploads, downloads, basic analytics, and support reports."
      actions={[{ label: 'Contact support', to: '/contact' }, { label: 'Report content', to: '/report' }]}
      aside={(
        <>
          <h2>Last updated</h2>
          <p>{new Date().toLocaleDateString()}</p>
          <ul>
            <li>Account data is used to provide creator and download features.</li>
            <li>Uploaded public models and previews are visible to visitors.</li>
            <li>Reports are reviewed for safety, IP, and policy enforcement.</li>
          </ul>
        </>
      )}
    >
      <div className="studio-doc-content">
        <section>
          <h2>Information we collect</h2>
          <ul>
            <li>Account information such as email, username, display name, profile details, and avatar.</li>
            <li>Uploaded models, preview images, categories, tags, file metadata, comments, likes, views, and downloads.</li>
            <li>Technical information such as browser, device, IP address, cookies, and usage logs.</li>
          </ul>
        </section>
        <section>
          <h2>How we use it</h2>
          <p>We use this information to operate the library, process uploads and downloads, maintain creator profiles, improve search and discovery, prevent abuse, and respond to support or report requests.</p>
        </section>
        <section>
          <h2>Public content</h2>
          <p>Models, previews, names, categories, tags, creator details, and related metadata may be public when you publish an asset. Do not upload files or descriptions you do not want visitors to inspect.</p>
        </section>
        <section>
          <h2>Security and retention</h2>
          <p>We use Firebase and related infrastructure to store account, model, report, and analytics data. We keep data while it is needed for platform operation, legal compliance, safety review, or account support.</p>
        </section>
        <section>
          <h2>Your choices</h2>
          <p>You can edit your profile, manage uploads, remove public content where available, and contact us for privacy or account questions.</p>
        </section>
      </div>
    </StudioDocument>
  </>
)

export default Privacy
