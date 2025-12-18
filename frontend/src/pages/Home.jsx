"use client"

import { useEffect, useRef, useState } from "react"
import FeaturedCarousel from "../components/products/FeaturedCarousel"
import CategoryCard from "../components/products/CategoryCard"
import { getAllProducts, getCategories } from "../lib/products"

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [categories, setCategories] = useState([])
  const [reviews, setReviews] = useState([])
  const [reviewIndex, setReviewIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching products from API")
        const products = await getAllProducts()
        console.log("Products fetched:", products)

        const cats = await getCategories()
        console.log("Categories fetched:", cats)

        const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 5)
        console.log("Featured products:", featuredProducts.length)

        setFeatured(featuredProducts.length > 0 ? featuredProducts : products.slice(0, 5))
        setCategories(cats)
      } catch (error) {
        console.error("Home fetch error:", error)
        setFeatured([])
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    setReviews([
      {
        name: "Ahmed M.",
        comment:
          "Excellent quality products and fast shipping! I've been a customer for over a year and they never disappoint.",
        rating: 5,
      },
      {
        name: "Fatima S.",
        comment: "Great customer service and competitive prices. Highly satisfied!",
        rating: 5,
      },
      {
        name: "Mohamed B.",
        comment: "Best tech store in Tunisia!",
        rating: 4.5,
      },
      {
        name: "Layla H.",
        comment: "Authentic products, reliable delivery. Always on time!",
        rating: 5,
      },
      {
        name: "Karim T.",
        comment: "Highly recommended!",
        rating: 4,
      },
      {
        name: "Nadia K.",
        comment: "The selection of tech products is incredible. Found exactly what I was looking for at a great price.",
        rating: 4.8,
      },
    ])
  }, [])

  // keep rotating reviewIndex (used to offset animation delays so they loop nicely)
  useEffect(() => {
    if (reviews.length === 0) return
    const timer = setInterval(() => {
      setReviewIndex((prev) => (prev + 1) % reviews.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [reviews.length])

  const categoryIcons = {
    phones: <img src="https://static.thenounproject.com/png/5275877-200.png" width={100} alt="phones" />,
    laptops: <img src="https://cdn-icons-png.flaticon.com/512/22/22935.png" width={100} alt="laptops" />,
    headsets: (
      <img
        src="https://wallpapers.com/images/thumbnail/silhouetteof-over-ear-headphones-9q3gt96o5zkk02so-2.webp"
        width={100}
        alt="headsets"
      />
    ),
    keyboards: <img src="https://cdn-icons-png.flaticon.com/512/770/770232.png" width={100} alt="keyboards" />,
    mouses: <img src="https://cdn-icons-png.flaticon.com/512/46/46536.png" width={100} alt="mouses" />,
    monitors: <img src="https://cdn-icons-png.flaticon.com/512/17/17288.png" width={100} alt="monitors" />,
  }

  // Category drag-to-scroll carousel (click & drag) with momentum
  const carouselRef = useRef(null)
  const isDraggingRef = useRef(false)
  const startXRef = useRef(0)
  const startScrollLeftRef = useRef(0)
  const lastXRef = useRef(0)
  const lastTimeRef = useRef(0)
  const velocityRef = useRef(0)
  const [isDragging, setIsDragging] = useState(false)

  function onPointerDown(e) {
    const el = carouselRef.current
    if (!el) return
    isDraggingRef.current = true
    setIsDragging(true)
    startXRef.current = e.clientX ?? (e.touches && e.touches[0] && e.touches[0].clientX) ?? 0
    startScrollLeftRef.current = el.scrollLeft
    lastXRef.current = startXRef.current
    lastTimeRef.current = performance.now()
    velocityRef.current = 0
    if (e.target.setPointerCapture) {
      try {
        e.target.setPointerCapture(e.pointerId)
      } catch (err) {}
    }
  }

  function onPointerMove(e) {
    if (!isDraggingRef.current) return
    const el = carouselRef.current
    if (!el) return
    const x = e.clientX ?? (e.touches && e.touches[0] && e.touches[0].clientX) ?? 0
    const walk = startXRef.current - x
    el.scrollLeft = startScrollLeftRef.current + walk

    const now = performance.now()
    const dt = Math.max(1, now - lastTimeRef.current)
    const dx = x - lastXRef.current
    velocityRef.current = dx / dt
    lastXRef.current = x
    lastTimeRef.current = now
  }

  function onPointerUp(e) {
    const el = carouselRef.current
    if (!el) {
      isDraggingRef.current = false
      setIsDragging(false)
      return
    }
    isDraggingRef.current = false
    setIsDragging(false)

    const momentumDistance = Math.max(-2000, Math.min(2000, -velocityRef.current * 1200))
    try {
      el.scrollTo({ left: el.scrollLeft + momentumDistance, behavior: "smooth" })
    } catch (err) {
      el.scrollLeft = el.scrollLeft + momentumDistance
    }

    try {
      if (e.target.releasePointerCapture) e.target.releasePointerCapture(e.pointerId)
    } catch (err) {}
  }

  const dragClass = isDragging ? "dragging" : ""

  const movingAnimationDuration = 28
  const movingReviewInstances = []
  if (reviews.length > 0) {
    const loopCount = 2
    for (let loop = 0; loop < loopCount; loop++) {
      for (let i = 0; i < reviews.length; i++) {
        const idx = i
        const scale = 0.9 + (i % 3) * 0.05
        const topOffset = 10 + (i % 4) * 18
        const totalInstances = reviews.length * loopCount
        const instanceIndex = loop * reviews.length + i
        const delay = instanceIndex * (movingAnimationDuration / totalInstances) * -1.2
        movingReviewInstances.push({
          idx,
          scale,
          topOffset,
          delay,
          key: `${loop}-${i}`,
        })
      }
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Featured Carousel */}
          {featured.length > 0 && (
            <div className="featured-carousel-wrapper mb-8" style={{ minHeight: 640 }}>
              <FeaturedCarousel products={featured} cardHeight={640} />
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading featured products...</p>
            </div>
          )}

          <div className="mt-16 py-12 bg-white text-black rounded-2xl shadow-lg border border-gray-200">
            <div className="text-center px-6">
              <h2 className="text-4xl font-bold mb-6">Welcome to GLASSWARE</h2>
              <p className="text-lg max-w-3xl mx-auto leading-relaxed text-gray-700">
                GLASSWARE is Tunisia's leading e-commerce platform for premium technology products. We bring you the
                best in innovation, quality, and service excellence. From flagship smartphones to professional laptops,
                our curated collection features authentic, cutting-edge tech products for everyone.
              </p>
              <div className="mt-8 flex justify-center gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-black">5000+</p>
                  <p className="text-gray-600">Happy Customers</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-black">2000+</p>
                  <p className="text-gray-600">Products</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-black">100%</p>
                  <p className="text-gray-600">Authentic</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section -> draggable carousel */}
      <section className="py-16 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8 text-center text-black">Shop by Category</h2>

          <div
            ref={carouselRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onPointerLeave={onPointerUp}
            className={`categories-carousel scrollbar-hide overflow-x-auto no-scrollbar flex gap-6 px-6 py-6 ${dragClass}`}
            style={{
              WebkitOverflowScrolling: "touch",
              cursor: isDragging ? "grabbing" : "grab",
              scrollSnapType: "x mandatory",
            }}
          >
            {categories.map((cat) => (
              <div
                key={cat}
                className="category-drag-card flex-shrink-0 w-64 md:w-72 lg:w-80 transform transition-all duration-300 scroll-snap-align-start"
                style={{ scrollSnapAlign: "start" }}
              >
                <div className="bg-purple-600 rounded-2xl p-4 h-full shadow-card transition-smooth">
                  <CategoryCard category={cat} icon={categoryIcons[cat.toLowerCase()] || categoryIcons.phones} />
                </div>
              </div>
            ))}
            <div style={{ minWidth: 28 }} />
          </div>
        </div>
      </section>

      {/* Reviews moving left -> right (continuous loop) */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">What Our Customers Say</h2>
            <p className="text-gray-600 text-lg">Trusted by thousands of tech enthusiasts across Tunisia</p>
          </div>

          <div
            className="moving-reviews-container relative overflow-hidden mx-auto"
            style={{ height: 320, maxWidth: "1100px" }}
          >
            {movingReviewInstances.map((inst) => {
              const r = reviews[inst.idx]
              if (!r) return null
              const animStyle = {
                animationDuration: `${movingAnimationDuration}s`,
                animationDelay: `${inst.delay}s`,
                top: `${inst.topOffset}%`,
                transform: `scale(${inst.scale})`,
              }
              return (
                <div
                  key={`moving-${inst.key}-${r.name}`}
                  className="moving-review-card absolute left-0"
                  style={animStyle}
                >
                  <div
                    className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-purple-600"
                    style={{
                      minWidth: 260,
                      maxWidth: 420,
                      boxSizing: "border-box",
                      overflowWrap: "break-word",
                      wordBreak: "break-word",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      {[...Array(Math.floor(r.rating))].map((_, si) => (
                        <span key={si} className="text-yellow-500 text-lg">
                          ★
                        </span>
                      ))}
                      {r.rating % 1 !== 0 && <span className="text-yellow-500 text-lg">★</span>}
                    </div>
                    <p className="text-gray-700 mb-3 leading-relaxed text-sm md:text-base">"{r.comment}"</p>
                    <p className="font-semibold text-black text-sm">{r.name}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Map / Shipping section - GOOGLE MAPS IFRAME */}
      <section className="py-16 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center text-black">We Ship Across Tunisia</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden shadow-lg h-96 border border-gray-300">
              <iframe
                title="Tunis, Tunisia"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d204478.68183562462!2d9.978462907648314!3d36.79504421349236!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12fd337f5e7ef543%3A0xd671924e714a0275!2sTunis!5e0!3m2!1sen!2stn!4v1764277370723!5m2!1sen!2stn"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-black">Fast & Reliable Delivery</h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                We deliver to all major cities across Tunisia with multiple shipping options to suit your needs.
              </p>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">
                      <img src="https://cdn-icons-png.flaticon.com/256/726/726546.png" width={30} alt="truck" />
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-black mb-1">Standard Shipping</h4>
                    <p className="text-gray-600">3-5 business days to most regions</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">
                      <img src="https://cdn-icons-png.flaticon.com/512/31/31520.png" width={30} alt="fast" />
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-black mb-1">Express Shipping</h4>
                    <p className="text-gray-600">1-2 business days available</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">
                      <img
                        src="https://peelerstickers.com.au/cdn/shop/files/WorldShippingIcon_1c3df119-7289-4971-9576-9c834e9a99a3.png?v=1753586082&width=1600"
                        width={30}
                        alt="world"
                      />
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-black mb-1">Free Shipping</h4>
                    <p className="text-gray-600">On orders over 500 DT</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold mb-4">Explore Our Collection</h3>
          <p className="text-lg mb-6 text-black">
            Browse our curated collection for exclusive deals and seasonal discounts
          </p>
          <a
            href="/shop"
            className="inline-block px-8 py-3 bg-black text-white font-bold rounded-lg hover:bg-purple-600 transition-colors transform hover:scale-105"
          >
            Shop Now
          </a>
        </div>
      </section>

      <style jsx>{`
        .featured-carousel-wrapper {
          min-height: 640px;
        }

        .categories-carousel {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .categories-carousel::-webkit-scrollbar {
          display: none;
        }
        .category-drag-card {
          user-select: none;
          -webkit-user-drag: none;
          touch-action: pan-y;
          transition: transform 240ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 240ms ease;
        }
        .category-drag-card:hover {
          transform: translateY(-8px) scale(1.03);
        }
        .categories-carousel.dragging .category-drag-card {
          transform: translateY(-2px) scale(0.995);
          box-shadow: 0 6px 20px rgba(0,0,0,0.08);
        }

        .moving-reviews-container { position: relative; }
        @keyframes moveLeftToRightViewport {
          0% { transform: translateX(-120vw); opacity: 0; }
          6% { opacity: 1; }
          50% { opacity: 1; }
          94% { opacity: 1; }
          100% { transform: translateX(120vw); opacity: 0; }
        }
        .moving-review-card {
          animation-name: moveLeftToRightViewport;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          will-change: transform;
          pointer-events: none;
        }
        .moving-review-card .rounded-xl {
          min-width: 260px;
          max-width: 420px;
          box-sizing: border-box;
        }

        @media (max-width: 768px) {
          .category-drag-card { width: 48% !important; }
          .moving-review-card .rounded-xl { min-width: 200px; }
        }
      `}</style>
    </div>
  )
}
