import React from 'react'
import PageMeta from '../components/PageMeta'
import StudioDocument from '../components/StudioDocument'

const CommunityGuidelines = () => (
  <>
    <PageMeta
      title="Community Guidelines | 3D ShareSpace"
      description="Rules for uploading, downloading, reporting, and participating on 3D ShareSpace."
      keywords="community guidelines, 3D model rules, content policy"
      url="/community-guidelines"
      type="website"
    />
    <StudioDocument
      kicker="Guidelines"
      title="Keep the asset library useful and safe"
      subtitle="These rules keep 3D ShareSpace practical for creators, students, developers, and studios."
      actions={[
        { label: 'Report content', to: '/report', primary: true },
        { label: 'Contact support', to: '/contact' }
      ]}
      aside={
        <>
          <h2>Review standard</h2>
          <p>Reports are reviewed for ownership, safety, misleading metadata, spam, and policy violations.</p>
          <p>Content may be removed when it creates legal, safety, or trust issues for the library.</p>
        </>
      }
    >
      <div className="studio-doc-content">
        <h2>Allowed uploads</h2>
        <ul>
          <li>Original 3D models, textures, materials, preview renders, and supporting files you can legally share.</li>
          <li>Accurate titles, categories, tags, file formats, and licensing information.</li>
          <li>Educational, portfolio, game-ready, archviz, product, and general production assets.</li>
        </ul>

        <h2>Not allowed</h2>
        <ul>
          <li>Files you do not own or do not have permission to redistribute.</li>
          <li>Adult, hateful, harassing, violent, illegal, malware, spam, or misleading content.</li>
          <li>Fake creator profiles, impersonation, deceptive downloads, or repeated low-quality uploads.</li>
        </ul>

        <h2>Creator conduct</h2>
        <p>
          Keep comments and profile information professional. Give useful feedback, credit other creators when required,
          and do not publish private information about another person.
        </p>

        <h2>Copyright and takedowns</h2>
        <p>
          If your work appears without permission, use the report form or contact support with the model link, proof of ownership,
          and a clear explanation. Valid reports can result in removal or account action.
        </p>

        <h2>Age and safety</h2>
        <p>
          Users must meet the account age requirements for the service. If you believe a profile belongs to an underage user,
          report it so it can be reviewed.
        </p>
      </div>
    </StudioDocument>
  </>
)

export default CommunityGuidelines
