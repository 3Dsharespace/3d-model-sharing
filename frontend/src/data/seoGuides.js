export const seoGuides = [
  {
    slug: 'how-to-import-fbx-into-blender',
    title: 'How to Import FBX Files into Blender | 3D ShareSpace',
    heading: 'How to Import FBX Files into Blender',
    description: 'Learn the basic steps to import FBX files into Blender, check textures, fix scale, and prepare a free 3D model for rendering or editing.',
    keywords: 'import FBX into Blender, FBX Blender tutorial, free FBX 3D models, Blender 3D models',
    relatedCta: { label: 'Browse free FBX models', path: '/free-3d-model-formats/fbx' },
    sections: [
      {
        heading: 'Download the FBX model',
        body: 'Choose a model that includes preview images, creator notes, and a license you can use. If a model includes texture files, keep them in the same folder before opening Blender.'
      },
      {
        heading: 'Import the file',
        body: 'Open Blender, choose File > Import > FBX, then select the downloaded file. After import, check the model position, scale, and rotation in the viewport.'
      },
      {
        heading: 'Check materials and textures',
        body: 'If textures do not appear, open the Shader Editor or Material settings and reconnect the image files. Some FBX assets need texture paths relinked after download.'
      },
      {
        heading: 'Prepare it for your project',
        body: 'Apply scale, organize objects into collections, rename important parts, and save a Blender copy before editing. This keeps the downloaded source file clean.'
      }
    ],
    faqs: [
      {
        question: 'Can Blender open FBX files?',
        answer: 'Yes. Blender includes an FBX importer, though some materials, rigs, or animations may need small fixes after import.'
      },
      {
        question: 'Why are my FBX textures missing in Blender?',
        answer: 'Texture paths can break when files move folders. Keep textures near the FBX file and relink missing image textures in Blender.'
      }
    ]
  },
  {
    slug: 'obj-vs-fbx-vs-gltf',
    title: 'OBJ vs FBX vs GLTF: Which 3D Format Should You Use? | 3D ShareSpace',
    heading: 'OBJ vs FBX vs GLTF',
    description: 'Compare OBJ, FBX, and GLTF files for games, web previews, animation, and general 3D model exchange.',
    keywords: 'OBJ vs FBX, FBX vs GLTF, 3D file formats, free OBJ models, free GLTF models',
    relatedCta: { label: 'Explore 3D model formats', path: '/free-3d-model-formats/fbx' },
    sections: [
      {
        heading: 'OBJ is simple and widely supported',
        body: 'OBJ is useful when you need a basic mesh format that opens in many 3D tools. It is common for static models, props, and general exchange.'
      },
      {
        heading: 'FBX is common for games and animation',
        body: 'FBX can carry mesh data, hierarchy, materials, animation, and rig information. It is often used in Unity, Unreal Engine, Maya, and Blender workflows.'
      },
      {
        heading: 'GLTF is strong for web and realtime previews',
        body: 'GLTF is designed for efficient runtime delivery. It is a strong choice for web 3D viewers, ecommerce previews, and lightweight interactive scenes.'
      },
      {
        heading: 'Pick based on the target tool',
        body: 'Use OBJ for broad compatibility, FBX for animation and game pipelines, and GLTF for web or realtime viewing.'
      }
    ],
    faqs: [
      {
        question: 'Which format is best for Unity?',
        answer: 'FBX is usually the safest first choice for Unity, especially when the model has hierarchy, animation, or rigging.'
      },
      {
        question: 'Which format is best for websites?',
        answer: 'GLTF or GLB is usually best for websites because it is designed for efficient realtime 3D delivery.'
      }
    ]
  },
  {
    slug: 'best-free-3d-model-formats-for-games',
    title: 'Best Free 3D Model Formats for Games | 3D ShareSpace',
    heading: 'Best Free 3D Model Formats for Games',
    description: 'A simple guide to choosing FBX, GLTF, OBJ, and Blender files for game-ready 3D assets.',
    keywords: 'game-ready 3D models, free game assets, FBX game models, GLTF game models',
    relatedCta: { label: 'Browse game-ready models', path: '/free-3d-model-topics/game-ready' },
    sections: [
      {
        heading: 'FBX for engine pipelines',
        body: 'FBX is a practical choice for Unity and Unreal Engine because it can include transforms, hierarchy, animation, and rig data.'
      },
      {
        heading: 'GLTF for lightweight realtime use',
        body: 'GLTF is useful for web games, previews, and realtime scenes where compact loading and predictable materials matter.'
      },
      {
        heading: 'OBJ for simple static props',
        body: 'OBJ works well for static meshes and simple props. It is easy to convert and widely supported by modeling tools.'
      },
      {
        heading: 'Check optimization before importing',
        body: 'Look at polygon count, texture size, scale, and license. Game-ready does not only mean the file opens; it should also perform well.'
      }
    ],
    faqs: [
      {
        question: 'What makes a 3D model game-ready?',
        answer: 'A game-ready model is usually optimized, correctly scaled, has usable materials, and is exported in a format that works well with game engines.'
      },
      {
        question: 'Are free 3D models safe for commercial games?',
        answer: 'Only if the model license allows it. Always check the creator notes and license before using an asset commercially.'
      }
    ]
  },
  {
    slug: 'free-stl-files-for-3d-printing',
    title: 'Free STL Files for 3D Printing: What to Check First | 3D ShareSpace',
    heading: 'Free STL Files for 3D Printing',
    description: 'Learn what to check before downloading and printing free STL files, including scale, wall thickness, mesh quality, and license.',
    keywords: 'free STL files, 3D printing models, STL 3D models, free printable 3D models',
    relatedCta: { label: 'Find free STL models', path: '/free-3d-model-formats/stl' },
    sections: [
      {
        heading: 'Check the model scale',
        body: 'Open the STL in your slicer and confirm the size before printing. Some models are exported in different unit systems.'
      },
      {
        heading: 'Inspect mesh quality',
        body: 'Look for holes, inverted normals, non-manifold edges, or extremely thin details that may fail during printing.'
      },
      {
        heading: 'Review print orientation',
        body: 'Try different orientations in your slicer to reduce supports, improve strength, and protect visible surfaces.'
      },
      {
        heading: 'Read the license',
        body: 'Some free STL files are for personal use only. Check the license before selling prints, remixing the file, or using it commercially.'
      }
    ],
    faqs: [
      {
        question: 'Can every STL file be 3D printed?',
        answer: 'No. STL is a common print format, but the mesh still needs enough thickness, clean geometry, and a practical scale.'
      },
      {
        question: 'Do STL files include color or textures?',
        answer: 'Usually no. STL mainly stores geometry. Use formats like OBJ or 3MF when color or material data matters.'
      }
    ]
  }
]

export const getSeoGuide = (slug) => (
  seoGuides.find((guide) => guide.slug === slug) || null
)

export const popularGuideLinks = seoGuides.slice(0, 4).map((guide) => ({
  label: guide.heading,
  path: `/guides/${guide.slug}`
}))
