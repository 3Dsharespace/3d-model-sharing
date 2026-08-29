import React from 'react'
import PageMeta from '../components/PageMeta'
import StudioDocument from '../components/StudioDocument'

const GettingStarted = () => (
  <>
    <PageMeta
      title="Getting Started | 3D ShareSpace"
      description="A practical guide to browsing, downloading, and uploading 3D assets on 3D ShareSpace."
      url="/getting-started"
      type="website"
    />
    <StudioDocument
      kicker="Guide"
      title="Start with the library"
      subtitle="3D ShareSpace is built around asset discovery. Browse first, inspect the files, then upload models with clear metadata and useful preview images."
      actions={[
        { label: 'Browse models', to: '/explore', primary: true },
        { label: 'Upload model', to: '/upload' }
      ]}
      aside={(
        <>
          <h2>Good uploads</h2>
          <ul>
            <li>Use clear titles artists can search for.</li>
            <li>Add a real preview render or viewport capture.</li>
            <li>Choose the closest category and file format.</li>
            <li>Keep tags short and practical.</li>
          </ul>
        </>
      )}
    >
      <div className="studio-doc-content">
        <section>
          <h2>Browse assets</h2>
          <p>Use Explore as the main entry point. Filter by category, format, or search terms, then open a model page to inspect preview images, file type, creator, tags, and download information.</p>
        </section>
        <section>
          <h2>Download and review</h2>
          <p>Model pages are designed like product detail pages for 3D assets. Check the preview, metadata, license text, and comments before using a file in a render, game, AR/VR scene, or product mockup.</p>
        </section>
        <section>
          <h2>Upload your own models</h2>
          <div className="studio-doc-grid">
            <div className="studio-doc-tile">
              <h3>Files</h3>
              <p>Upload the model file and include the format users will expect, such as FBX, OBJ, GLB, ZIP, or STL.</p>
            </div>
            <div className="studio-doc-tile">
              <h3>Preview</h3>
              <p>Use preview images that show the shape and material clearly. Avoid vague thumbnails.</p>
            </div>
            <div className="studio-doc-tile">
              <h3>Metadata</h3>
              <p>Write plain descriptions and useful tags. Good metadata makes models easier to find.</p>
            </div>
            <div className="studio-doc-tile">
              <h3>Publishing</h3>
              <p>Published public models appear in Explore and can be indexed into public discovery pages.</p>
            </div>
          </div>
        </section>
      </div>
    </StudioDocument>
  </>
)

export default GettingStarted
