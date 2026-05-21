import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  Upload, 
  Compass, 
  Users, 
  Download, 
  Search,
  ArrowRight,
  Star,
  Zap,
  Globe,
  Shield,
  Heart,
  Sparkles
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { motion, useScroll, useTransform } from 'framer-motion'
import PageMeta from '../components/PageMeta'

const Home = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, 100])
  const y2 = useTransform(scrollY, [0, 300], [0, -100])

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setIsSearching(true)
      // Navigate to explore page with search query (use 'q' param)
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleTagClick = (tag) => {
    // Map popular tags to Explore category filter
    navigate(`/explore?category=${encodeURIComponent(tag)}`)
  }

  const popularTags = [
    'Architecture',
    'Characters',
    'Vehicles',
    'Furniture',
    'Nature',
    'Technology',
    'Gaming',
    'Sci-Fi',
    'Product Design',
    'Interior Design',
    'Medical',
    'Toys'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-luxury-bg-primary via-luxury-bg-secondary to-luxury-bg-primary dark:from-black dark:via-zinc-950 dark:to-black overflow-x-hidden">
      <PageMeta
        title="Free 3D Models Download | 3D ShareSpace"
        description="Download free 3D models for Blender, Unity, Unreal Engine, games, architecture, 3D printing, product renders, and creative projects."
        keywords="free 3D models, 3D model download, free 3D assets, Blender models, FBX models, OBJ models, GLTF models, STL files, game assets, architecture 3D models"
        url="/"
        image="/favicon.svg"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "3D ShareSpace",
          "alternateName": ["3DShareSpace", "3D Share Space", "Free 3D Models Download"],
          "url": (typeof window!== 'undefined' ? window.location.origin : 'https://3dsharespace.com'),
          "potentialAction": {
            "@type": "SearchAction",
            "target": (typeof window!== 'undefined' ? window.location.origin : 'https://3dsharespace.com') + "/explore?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }}
      />
      
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          style={{ y: y1 }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"
        />
        <motion.div 
          style={{ y: y2 }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: mousePosition.x * 0.01,
            y: mousePosition.y * 0.01,
          }}
          transition={{ type: "spring", stiffness: 50, damping: 30 }}
          className="absolute top-1/4 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl"
        />
      </div>

      {/* Hero Section */}
      <section className="luxury-dark-hero relative py-24 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-indigo-50/30 dark:from-black/80 dark:via-zinc-950/70 dark:to-black/80"></div>
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        
        <div className="relative max-w-7xl mx-auto text-center">
          {/* Floating Icons */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-20 left-10 text-gray-500/30"
            >
              <Sparkles className="w-8 h-8" />
            </motion.div>
            <motion.div
              animate={{ 
                y: [0, 10, 0],
                rotate: [0, -5, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
              className="absolute top-32 right-20 text-gray-500/30"
            >
              <Star className="w-6 h-6" />
            </motion.div>
            <motion.div
              animate={{ 
                y: [0, -8, 0],
                x: [0, 5, 0]
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
              className="absolute bottom-20 left-20 text-gray-500/30"
            >
              <Zap className="w-7 h-7" />
            </motion.div>
          </div>

          {/* Main heading */}
          <motion.div
            initial={{opacity:0, y:30}}
            animate={{opacity:1,y:0}}
            transition={{duration:.8}}
            className="relative"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-luxury-text-primary dark:text-white mb-6 leading-tight">
              Discover and share{' '}
              <span className="relative inline-block">
                <span className="text-gray-200">
                  3D models
                </span>
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute -inset-2 bg-white/10 blur-xl -z-10 rounded-lg"
                />
              </span>{' '}
              with creators worldwide
            </h1>
            <motion.p
              initial={{opacity:0, y:20}}
              animate={{opacity:1,y:0}}
              transition={{duration:.8, delay:.2}}
              className="text-lg sm:text-xl text-luxury-text-secondary dark:text-gray-300 mb-8 max-w-3xl mx-auto"
            >
              Join the largest community of 3D artists and creators. Share your models, discover amazing content, and connect with talent from around the globe.
            </motion.p>
          </motion.div>
          
          {/* Hero search bar */}
          <motion.div
            initial={{opacity:0, y:20}}
            animate={{opacity:1,y:0}}
            transition={{duration:.8, delay:.4}}
            className="max-w-4xl mx-auto mb-12"
          >
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-zinc-700 to-black rounded-3xl blur opacity-40 group-hover:opacity-60 transition duration-300"></div>
              <div className="relative flex items-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-white/30 dark:border-gray-700/50 rounded-2xl p-6 shadow-2xl shadow-blue-500/10">
                <div className="flex items-center justify-center w-12 h-12 bg-zinc-700 rounded-full mr-4">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for 3D models, creators, categories..."
                  className="flex-1 bg-transparent text-luxury-text-primary dark:text-white placeholder-luxury-text-muted dark:placeholder-gray-400 text-lg outline-none"
                />
                <Button 
                  type="submit" 
                  className="ml-4 h-12 px-8 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg" 
                  disabled={isSearching || !searchQuery.trim()}
                >
                  <span className="flex items-center gap-2">
                    {isSearching ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        Searching...
                      </>
                    ) : (
                      <>
                        Search
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </span>
                </Button>
              </div>
            </form>
          </motion.div>
          
          {/* Popular tags */}
          <motion.div
            initial={{opacity:0, y:20}}
            animate={{opacity:1,y:0}}
            transition={{duration:.8, delay:.6}}
            className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto"
          >
            <span className="text-luxury-text-secondary dark:text-gray-400 text-sm font-medium mb-2 w-full text-center">
              Popular categories:
            </span>
            {popularTags.map((tag, index) => (
              <motion.div
                key={tag}
                initial={{opacity:0, scale:0.8}}
                animate={{opacity:1, scale:1}}
                transition={{duration:.3, delay:.7 + index * 0.1}}
                whileHover={{scale:1.05}}
                whileTap={{scale:0.95}}
              >
                <Button
                  onClick={() => handleTagClick(tag)}
                  className="px-6 py-3 bg-white/20 dark:bg-white/10 backdrop-blur-sm border border-white/30 dark:border-white/20 rounded-full text-luxury-text-primary dark:text-white text-sm font-medium hover:bg-white/30 dark:hover:bg-white/20 hover:border-white/50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {tag}
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Start Sharing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-luxury-bg-primary dark:bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-luxury-text-primary dark:text-white mb-4">
              Start Sharing Your 3D Models
            </h2>
            <p className="text-xl text-luxury-text-secondary dark:text-gray-400 max-w-3xl mx-auto">
              Join our community and start uploading your 3D models today. Share your creativity with the world.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Upload Models Card */}
            <motion.div initial={{opacity:0, y:8}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:.25}} className="bg-luxury-bg-card dark:bg-zinc-900 rounded-xl p-8 text-center hover:bg-luxury-bg-hover dark:hover:bg-zinc-800 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-gray-200/70 dark:shadow-none">
              <div className="w-16 h-16 bg-zinc-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-luxury-text-primary dark:text-white mb-4">Upload Your Models</h3>
              <p className="text-luxury-text-secondary dark:text-gray-400 mb-8">
                Share your 3D models with the community. Support multiple formats including Blender, OBJ, FBX, STL, and more.
              </p>
              <Link to="/upload">
                <Button className="px-8 py-3">Start Uploading</Button>
              </Link>
            </motion.div>
            
            {/* Explore Models Card */}
            <motion.div initial={{opacity:0, y:8}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:.25, delay:.05}} className="bg-luxury-bg-card dark:bg-zinc-900 rounded-xl p-8 text-center hover:bg-luxury-bg-hover dark:hover:bg-zinc-800 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-gray-200/70 dark:shadow-none">
              <div className="w-16 h-16 bg-zinc-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Compass className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-luxury-text-primary dark:text-white mb-4">Explore Models</h3>
              <p className="text-luxury-text-secondary dark:text-gray-400 mb-8">
                Discover amazing 3D models created by talented artists. Find the perfect model for your next project.
              </p>
              <Link to="/explore">
                <Button className="px-8 py-3" color="secondary">Browse Models</Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-luxury-bg-secondary dark:bg-zinc-950 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-20 h-20 bg-white/5 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-10 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{opacity:0, y:30}}
            whileInView={{opacity:1, y:0}}
            viewport={{once:true}}
            transition={{duration:.8}}
            className="text-center mb-20"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-luxury-text-primary dark:text-white mb-6">
              Why Choose{' '}
              <span className="text-gray-100">
                3D ShareSpace?
              </span>
            </h2>
            <p className="text-xl text-luxury-text-secondary dark:text-gray-300 max-w-3xl mx-auto">
              A platform built for the 3D community, by the 3D community. Experience the future of 3D model sharing.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
    {
      icon: Upload,
      title: 'Easy Upload',
      description: 'Upload your 3D models in multiple formats with just a few clicks',
      color: 'from-zinc-700 to-zinc-500',
      bgColor: 'bg-zinc-800/40'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Showcase your work to creators and artists worldwide',
      color: 'from-zinc-700 to-zinc-500',
      bgColor: 'bg-zinc-800/40'
    },
    {
      icon: Download,
      title: 'Free Access',
      description: 'Download high-quality models completely free for your projects',
      color: 'from-zinc-700 to-zinc-500',
      bgColor: 'bg-zinc-800/40'
    },
    {
      icon: Heart,
      title: 'Community',
      description: 'Join a supportive community of passionate 3D artists and creators',
      color: 'from-zinc-700 to-zinc-500',
      bgColor: 'bg-zinc-800/40'
    }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{opacity:0, y:20}}
                whileInView={{opacity:1, y:0}}
                viewport={{once:true}}
                transition={{duration:.5, delay:index * 0.1}}
                whileHover={{y:-10, scale:1.02}}
                className="group"
              >
                <div className={`${feature.bgColor} backdrop-blur-sm rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 border border-white/10 dark:border-gray-700/50 relative overflow-hidden`}>
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl`}></div>
                  
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-luxury-text-primary dark:text-white mb-4 transition-all duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-luxury-text-secondary dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-luxury-bg-primary dark:bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-luxury-text-primary dark:text-white mb-4">
              Join our growing community of creators
            </h2>
            <p className="text-lg text-luxury-text-secondary dark:text-gray-400 max-w-3xl mx-auto">
              Connect with fellow 3D artists, share your work, and discover amazing models from talented creators around the world.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
    {
      icon: Users,
      title: 'Share Your Work',
                description: 'Upload and showcase your 3D models to the community',
                color: 'bg-zinc-700',
                link: '/upload'
    },
    {
      icon: Compass,
      title: 'Discover Models',
      description: 'Find high-quality models for your next project',
                color: 'bg-zinc-700',
                link: '/explore'
    },
    {
      icon: Download,
      title: 'Download Free',
      description: 'All models are completely free to download and use',
                color: 'bg-zinc-700',
                link: '/explore'
              }
            ].map((feature, index) => (
              <Link key={index} to={feature.link} className="text-center group">
                <div className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-luxury-text-primary dark:text-white mb-4 group-hover:text-gray-300 transition-colors">{feature.title}</h3>
                <p className="text-luxury-text-secondary dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">{feature.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-black relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -top-40 -left-40 w-80 h-80 bg-zinc-700/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.1, 1, 1.1],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -bottom-40 -right-40 w-96 h-96 bg-zinc-700/20 rounded-full blur-3xl"
          />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{opacity:0, y:30}}
            whileInView={{opacity:1, y:0}}
            viewport={{once:true}}
            transition={{duration:.8}}
          >
            <div className="mb-8">
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="inline-block text-6xl mb-4"
              >
                🚀
              </motion.div>
            </div>
            
            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Ready to{' '}
              <span className="text-gray-200">
                Create Magic?
              </span>
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-12 leading-relaxed">
              Join thousands of talented 3D artists and creators who are already sharing their incredible work on 3D ShareSpace.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              {user ? (
                <motion.div whileHover={{scale:1.05}} whileTap={{scale:0.95}}>
                  <Link
                    to="/upload"
                    className="group inline-flex items-center gap-3 bg-zinc-100 text-zinc-900 hover:text-black px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 shadow-2xl hover:shadow-white/25 hover:bg-white"
                  >
                    <Upload className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    Start Creating
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              ) : (
                <motion.div whileHover={{scale:1.05}} whileTap={{scale:0.95}}>
                  <Link
                    to="/signup"
                    className="group inline-flex items-center gap-3 bg-zinc-100 text-zinc-900 hover:text-black px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 shadow-2xl hover:shadow-white/25 hover:bg-white"
                  >
                    <Sparkles className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    Join Community
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              )}
              
              <motion.div whileHover={{scale:1.05}} whileTap={{scale:0.95}}>
                <Link
                  to="/explore"
                  className="group inline-flex items-center gap-3 bg-zinc-900/80 backdrop-blur-sm text-white hover:bg-zinc-800 px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 border border-zinc-700 hover:border-zinc-500"
                >
                  <Compass className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  Explore Models
                </Link>
              </motion.div>
            </div>
            
            <motion.div
              initial={{opacity:0}}
              whileInView={{opacity:1}}
              viewport={{once:true}}
              transition={{duration:1, delay:0.5}}
              className="mt-12 text-white/80 text-sm"
            >
              ✨ Free forever • No hidden fees • Instant access
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home
