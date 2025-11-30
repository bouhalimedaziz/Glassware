import { Link } from "react-router-dom"

export default function CategoryCard({ category, icon }) {
  return (
    <Link
      to={`/shop?category=${category}`}
      className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all h-48 bg-gradient-to-br from-purple-500 to-purple-700"
    >
      <div className="absolute inset-0 opacity-0 bg-white transition-opacity" />
      <div className="flex flex-col items-center justify-center h-full text-white relative z-10">
        <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">{icon}</div>
        <h3 className="text-xl font-bold capitalize group-hover:translate-y-1 transition-transform">{category}</h3>
      </div>
    </Link>
  )
}
