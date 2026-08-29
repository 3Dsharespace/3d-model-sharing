import React from 'react'
import PageMeta from '../components/PageMeta'
import StudioDocument from '../components/StudioDocument'

const About = () => (
  <>
    <PageMeta
      title="About 3D ShareSpace"
      description="3D ShareSpace is a free asset library for 3D artists, game developers, archviz artists, students, and small studios."
      keywords="3D ShareSpace, free 3D models, 3D asset library"
      url="/about"
      type="website"
    />
    <StudioDocument
      kicker="About"
      title="A practical library for free 3D assets"
      subtitle="3D ShareSpace is built for artists, students, developers, and small studios who need usable models without a noisy marketplace experience."
      actions={[
        { label: 'Browse models', to: '/explore', primary: true },
        { label: 'Upload model', to: '/upload' }
      ]}
      aside={
        <>
          <h2>Platform focus</h2>
          <p>Free downloads, clear model pages, creator profiles, and straightforward upload tools.</p>
          <p>No fake marketplace numbers. No decorative landing-page claims. Just the library and the people adding to it.</p>
        </>
      }
    >
      <div className="studio-doc-content">
        <h2>What the site is for</h2>
        <p>
          The site hosts free 3D models for renders, games, AR/VR, product scenes, learning projects, and portfolio work.
          The interface is designed around browsing, previewing, downloading, and uploading assets with as little friction as possible.
        </p>

        <h2>Who it supports</h2>
        <div className="studio-doc-grid">
          <div className="studio-doc-tile">
            <h3>3D artists</h3>
            <p>Publish personal models, organize profile work, and make assets easy to inspect.</p>
          </div>
          <div className="studio-doc-tile">
            <h3>Developers</h3>
            <p>Find props, characters, vehicles, and environment pieces for prototypes and production scenes.</p>
          </div>
          <div className="studio-doc-tile">
            <h3>Students</h3>
            <p>Use free assets while learning modeling, rendering, game engines, and scene layout.</p>
          </div>
          <div className="studio-doc-tile">
            <h3>Studios</h3>
            <p>Scan categories quickly and download models that fit real project needs.</p>
          </div>
        </div>

        <h2>How the library stays useful</h2>
        <p>
          Model pages show previews, formats, categories, tags, creator details, download notes, and related models.
          Creators can update profiles and upload new assets while admins manage visibility and content quality.
        </p>
      </div>
    </StudioDocument>
  </>
)

export default About
