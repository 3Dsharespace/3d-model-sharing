import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { firebaseHelpers } from '../lib/firebase'
import { getModelAltText, getModelUrl } from '../lib/modelLinks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import CreatorBadge from '../components/ui/CreatorBadge'
import AdvancedAdSense from '../components/ads/AdvancedAdSense'
import PageMeta from '../components/PageMeta'
import { 
  ExternalLink, 
  Heart, 
  Download, 
  Eye, 
  Calendar,
  Star,
  Share,
  ShoppingBag,
  Layers as Collection,
  Globe,
  Twitter,
  Instagram,
  Youtube
} from 'lucide-react'

const PLATFORM_ACCOUNT_EMAILS = ['threedsharespace@gmail.com']
const PLATFORM_ACCOUNT_IDS = ['Bit2fGqznKheFgEg2dTEPCIIKw32']

const isPlatformAccount = (creator) => {
  const email = (creator?.email || '').toLowerCase()
  const id = creator?.uid || creator?.id
  const username = (creator?.username || '').toLowerCase()
  const displayName = (creator?.displayName || '').toLowerCase()
  return PLATFORM_ACCOUNT_EMAILS.includes(email) ||
    PLATFORM_ACCOUNT_IDS.includes(id) ||
    username === 'admin' ||
    displayName === 'admin' ||
    creator?.isPlatformAccount === true
}

export default function CreatorStorefront() {
  const { creatorId, customUrl } = useParams()
  const { user } = useAuth()
  const [storefront, setStorefront] = useState(null)
  const [creator, setCreator] = useState(null)
  const [models, setModels] = useState([])
  const [collections, setCollections] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('models')
  const [creating, setCreating] = useState(false)
  const [tierError, setTierError] = useState(null)

  // Check if current user is viewing their own storefront
  const isOwnStorefront = user && creatorId === user.uid

  useEffect(() => {
    if (creatorId || customUrl) {
      fetchStorefront()
    }
  }, [creatorId, customUrl])

  const fetchStorefront = async () => {
    try {
      const result = await firebaseHelpers.getCreatorStorefront({ 
        creatorId, 
        customUrl 
      })
      
      setStorefront(result.storefront)
      setCreator(result.creator)
      setModels(result.models)
      setCollections(result.collections)
      setStats(result.stats)
    } catch (error) {
      console.error('Error fetching storefront:', error)
      // If this is the user's own storefront and it doesn't exist, we'll show create option
    } finally {
      setLoading(false)
    }
  }

  const createStorefront = async () => {
    if (!user) return
    
    setCreating(true)
    setTierError(null)
    
    try {
      const profile = await firebaseHelpers.getUserProfile(user.uid)
      
      const storefrontData = {
        name: `${profile.profile?.displayName || user.displayName || 'My'} 3D Store`,
        description: 'Welcome to my 3D model collection. Discover amazing designs and creations!',
        customUrl: '',
        theme: 'modern',
        branding: {
          primaryColor: '#3B82F6',
          logoUrl: profile.profile?.avatar || user.photoURL || '',
          bannerUrl: ''
        },
        featuredModels: [],
        socialLinks: {}
      }

      await firebaseHelpers.createCreatorStorefront(storefrontData)
      
      // Refresh the storefront data
      await fetchStorefront()
    } catch (error) {
      console.error('Error creating storefront:', error)
      
      // Check if it's a tier requirement error
      if (error.message.includes('Pro tier') || error.message.includes('tier required')) {
        setTierError('pro')
      } else {
        setTierError('general')
      }
    } finally {
      setCreating(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${creator.displayName}'s 3D Store`,
          text: storefront.description,
          url: window.location.href
        })
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Store link copied to clipboard!')
    }
  }

  const getSocialIcon = (platform) => {
    const icons = {
      twitter: Twitter,
      instagram: Instagram,
      youtube: Youtube,
      website: Globe
    }
    return icons[platform] || ExternalLink
  }

  const isPlatformStorefront = isPlatformAccount(creator)
  const creatorName = isPlatformStorefront ? '3D ShareSpace' : (creator?.displayName || creator?.username || '3D Creator')
  const storeUrl = customUrl ? `/store/url/${customUrl}` : `/store/${creatorId || creator?.id || ''}`
  const storeDescription = isPlatformStorefront
    ? 'Explore official 3D ShareSpace platform models and free 3D assets.'
    : (storefront?.description || `Explore free 3D models, downloads, and creator collections from ${creatorName} on 3D ShareSpace.`)
  const storeImage = isPlatformStorefront ? '/favicon.svg' : (creator?.photoURL || storefront?.branding?.logoUrl || storefront?.branding?.bannerUrl || '/favicon.svg')
  const storeJsonLd = storefront && creator ? [
    {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      name: `${creatorName} 3D Model Store`,
      description: storeDescription,
      url: `${typeof window !== 'undefined' ? window.location.origin : 'https://3dsharespace.com'}${storeUrl}`,
      mainEntity: {
        '@type': 'Person',
        name: creatorName,
        image: isPlatformStorefront ? undefined : (creator?.photoURL || undefined),
        description: storeDescription,
        url: `${typeof window !== 'undefined' ? window.location.origin : 'https://3dsharespace.com'}${storeUrl}`
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `${creatorName} 3D Models`,
      numberOfItems: models.length,
      itemListElement: models.slice(0, 10).map((model, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${typeof window !== 'undefined' ? window.location.origin : 'https://3dsharespace.com'}${getModelUrl(model)}`,
        name: model.title
      }))
    }
  ] : null

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!storefront) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">
              {isOwnStorefront ? 'Create Your Storefront' : 'Storefront Not Found'}
            </h2>
            <p className="text-gray-600 mb-6">
              {isOwnStorefront 
                ? 'Set up your personalized 3D model storefront to showcase your creations and connect with your audience.'
                : 'This creator doesn\'t have a custom storefront yet.'
              }
            </p>
            
            {isOwnStorefront ? (
              <div className="space-y-4">
                {tierError === 'pro' ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-amber-600">🏆</span>
                      <h3 className="font-semibold text-amber-800">Pro Tier Required</h3>
                    </div>
                    <p className="text-amber-700 text-sm mb-3">
                      Custom storefronts are available for Pro tier creators and above. 
                      Upload more models and gain more downloads to unlock this feature!
                    </p>
                    <Link to="/creator-tier">
                      <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-100">
                        View Tier Progress
                      </Button>
                    </Link>
                  </div>
                ) : tierError === 'general' ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-700 text-sm">
                      There was an error creating your storefront. Please try again later.
                    </p>
                  </div>
                ) : null}
                
                <Button 
                  onClick={createStorefront} 
                  disabled={creating || tierError === 'pro'}
                  size="lg"
                  className="w-full max-w-md"
                >
                  {creating ? 'Creating Storefront...' : 'Create My Storefront'}
                </Button>
                
                {!tierError && (
                  <p className="text-sm text-gray-500">
                    Your storefront will be available at: /store/{user?.uid}
                  </p>
                )}
              </div>
            ) : (
              <Link to="/explore" className="inline-block mt-4">
                <Button>Browse All Models</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageMeta
        title={`${creatorName} 3D Model Store | 3D ShareSpace`}
        description={storeDescription}
        keywords={`${creatorName} 3D models, free 3D models, creator store, 3D ShareSpace`}
        url={storeUrl}
        image={storeImage}
        type="profile"
        jsonLd={storeJsonLd}
      />

      {/* Header/Banner */}
      <div 
        className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600"
        style={{
          backgroundColor: storefront.branding?.primaryColor || '#3B82F6',
          backgroundImage: storefront.branding?.bannerUrl ? `url(${storefront.branding.bannerUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="relative container mx-auto px-4 h-full flex items-end pb-8">
          <div className="flex items-center space-x-6 text-white">
            {/* Creator Avatar */}
            <div className="relative">
              <img
                src={storeImage}
                alt={creatorName}
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
              />
              <div className="absolute -bottom-2 -right-2">
                <CreatorBadge tier={creator.creatorTier} size="sm" />
              </div>
            </div>
            
            {/* Creator Info */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{isPlatformStorefront ? '3D ShareSpace' : storefront.name}</h1>
              <p className="text-lg opacity-90 mb-2">{storeDescription}</p>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-1">
                  <Download className="w-4 h-4" />
                  <span>{stats.totalViews} views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ShoppingBag className="w-4 h-4" />
                  <span>{stats.totalModels} models</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Download className="w-4 h-4" />
                  <span>{creator.totalDownloads} downloads</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="ml-auto flex items-center space-x-3">
            <Button variant="secondary" onClick={handleShare}>
              <Share className="w-4 h-4 mr-2" />
              Share Store
            </Button>
            {!isPlatformStorefront && (
              <Link to={`/profile/${creator.id}`}>
                <Button variant="outline" className="bg-white bg-opacity-20 border-white text-white hover:bg-white hover:text-gray-900">
                  View Profile
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Social Links */}
            {!isPlatformStorefront && Object.entries(storefront.socialLinks).some(([key, value]) => value) && (
              <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
                <h3 className="font-semibold mb-4">Connect with {creatorName}</h3>
                <div className="flex items-center space-x-4">
                  {Object.entries(storefront.socialLinks).map(([platform, url]) => {
                    if (!url) return null
                    const Icon = getSocialIcon(platform)
                    return (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <Icon className="w-5 h-5" />
                        <span className="capitalize">{platform}</span>
                      </a>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Featured Models */}
            {storefront.featuredModels && storefront.featuredModels.length > 0 && (
              <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
                <h3 className="font-semibold mb-4 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-500" />
                  Featured Models
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {models.filter(model => storefront.featuredModels.includes(model.id)).map(model => (
                    <ModelCard key={model.id} model={model} />
                  ))}
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('models')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'models'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    All Models ({stats.totalModels})
                  </button>
                  <button
                    onClick={() => setActiveTab('collections')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'collections'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Collections ({collections.length})
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'models' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {models.map(model => (
                      <ModelCard key={model.id} model={model} />
                    ))}
                    {models.length === 0 && (
                      <div className="col-span-full text-center py-8 text-gray-500">
                        No models available
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'collections' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {collections.map(collection => (
                      <CollectionCard key={collection.id} collection={collection} />
                    ))}
                    {collections.length === 0 && (
                      <div className="col-span-full text-center py-8 text-gray-500">
                        No collections available
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Creator Stats */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Creator Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Models</span>
                    <span className="font-semibold">{creator.totalModels}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Downloads</span>
                    <span className="font-semibold">{creator.totalDownloads}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Store Views</span>
                    <span className="font-semibold">{stats.totalViews}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tier</span>
                    <CreatorBadge tier={creator.creatorTier} size="sm" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ad Placement */}
            <div className="mb-6">
              <AdvancedAdSense 
                placement="profile_header"
                creatorId={creator.id}
              />
            </div>

            {/* Support Creator */}
            {!isPlatformStorefront && <Card>
              <CardHeader>
                <CardTitle>Support {creatorName}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Love their work? Show your support!
                </p>
                <Link to={`/profile/${creator.id}`}>
                  <Button className="w-full mb-3">
                    <Heart className="w-4 h-4 mr-2" />
                    Send Tip
                  </Button>
                </Link>
                <Link to={`/profile/${creator.id}`}>
                  <Button variant="outline" className="w-full">
                    Follow Creator
                  </Button>
                </Link>
              </CardContent>
            </Card>}
          </div>
        </div>
      </div>
    </div>
  )
}

// Model Card Component
function ModelCard({ model }) {
  return (
    <Link to={getModelUrl(model)}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
          <img
            src={model.imageUrl || '/placeholder-model.jpg'}
            alt={getModelAltText(model, 'creator store preview')}
            className="w-full h-full object-cover hover:scale-105 transition-transform"
          />
        </div>
        <CardContent className="p-4">
          <h4 className="font-semibold truncate mb-1">{model.title}</h4>
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">{model.description}</p>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Download className="w-3 h-3" />
                <span>{model.downloadCount || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="w-3 h-3" />
                <span>{model.likes || 0}</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(model.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

// Collection Card Component
function CollectionCard({ collection }) {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
        <img
          src={collection.coverImageUrl || '/placeholder-collection.jpg'}
          alt={collection.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform"
        />
      </div>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold truncate">{collection.name}</h4>
          <Badge variant="secondary">
            <Collection className="w-3 h-3 mr-1" />
            {collection.modelCount}
          </Badge>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2 mb-2">{collection.description}</p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Eye className="w-3 h-3" />
              <span>{collection.views || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Download className="w-3 h-3" />
              <span>{collection.downloads || 0}</span>
            </div>
          </div>
          <Badge variant={collection.type === 'featured' ? 'default' : 'secondary'}>
            {collection.type}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
