import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Clock, Utensils, Sparkles, ChefHat, ArrowRight, X, CheckCircle, Search, Share2 } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { API_BASE_URL, BACKEND_URL } from "../config";

export default function RecipesBlog() {
  const [recipes, setRecipes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/recipes`);
      const data = await res.json();
      if (data && data.success) {
        setRecipes(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch public recipes:", err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ["All", "Sweets", "Snacks", "Beverages", "Pickles", "Healthy Living"];

  const filteredRecipes = recipes.filter((rec) => {
    const matchesCat = selectedCategory === "All" || rec.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = !searchQuery || rec.title?.toLowerCase().includes(searchQuery.toLowerCase()) || (rec.shortDescription || rec.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getImageUrl = (url) => {
    if (!url) return "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=700&q=80";
    if (url.startsWith("data:") || url.startsWith("http")) return url;
    return `${BACKEND_URL}${url}`;
  };

  return (
    <div className="min-h-screen bg-brand-ivory flex flex-col font-sans">
      {/* Hero Section */}
      <section className="bg-[#143021] text-brand-ivory py-16 md:py-24 px-4 relative overflow-hidden border-b border-brand-gold/20">
        <div className="max-w-6xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-brand-gold/15 border border-brand-gold/30 px-4 py-1.5 rounded-full text-brand-gold font-bold text-xs uppercase tracking-widest">
            <ChefHat className="w-4 h-4 text-brand-gold" />
            <span>AUTHENTIC HERITAGE KITCHEN</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold serif-header text-brand-gold">
            Traditional Recipes & Culinary Blog
          </h1>

          <p className="text-sm md:text-base text-brand-cream/80 max-w-2xl mx-auto font-sans leading-relaxed">
            Discover time-honored traditional recipes passed down through generations. Prepared with pure natural ingredients and local culinary secrets.
          </p>

          {/* Search Input */}
          <div className="pt-4 max-w-md mx-auto relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recipes, ingredients, sweets..."
              className="w-full pl-11 pr-4 py-3 bg-white/10 border border-brand-gold/30 rounded-xl text-xs md:text-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-brand-gold transition-all"
            />
            <Search className="w-4 h-4 text-brand-gold absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-12 w-full space-y-10">

        {/* Category Pills Filter */}
        <div className="flex items-center justify-center flex-wrap gap-2 md:gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-brand-green text-brand-gold shadow-md scale-105"
                  : "bg-white text-brand-charcoal hover:bg-brand-gold/10 border border-brand-gold/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Recipes Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-80 bg-white/50 rounded-2xl border border-brand-gold/10" />
            ))}
          </div>
        ) : filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRecipes.map((rec) => (
              <div
                key={rec._id || rec.id}
                className="bg-white rounded-2xl shadow-premium border border-brand-gold/15 overflow-hidden flex flex-col justify-between group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div>
                  {/* Card Image */}
                  <div className="relative h-56 w-full overflow-hidden bg-brand-cream">
                    <img
                      src={getImageUrl(rec.image)}
                      alt={rec.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=700&q=80";
                      }}
                    />
                    <div className="absolute top-3 left-3 bg-brand-green/90 text-brand-gold px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                      {rec.category || "Recipe"}
                    </div>
                    {rec.tag && (
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-brand-green px-3 py-1 rounded-full text-[10px] font-bold shadow-sm border border-brand-gold/30">
                        {rec.tag}
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center space-x-4 text-xs text-brand-gold font-bold uppercase tracking-wider">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Prep: {rec.prepTime || "15 Mins"}</span>
                      </span>
                      <span>•</span>
                      <span>Cook: {rec.cookTime || "25 Mins"}</span>
                    </div>

                    <h3 className="text-xl font-extrabold text-brand-green serif-header group-hover:text-brand-gold transition-colors leading-snug">
                      {rec.title}
                    </h3>

                    <p className="text-xs md:text-sm text-brand-charcoalLight leading-relaxed line-clamp-3">
                      {rec.shortDescription}
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-6 pt-0 border-t border-brand-gold/10 mt-4 flex items-center justify-between">
                  <span className="text-xs text-brand-charcoal/70 italic font-serif">
                    By {rec.author || "ReetSutra Kitchen"}
                  </span>
                  <button
                    onClick={() => setSelectedRecipe(rec)}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-brand-green hover:text-brand-gold transition-colors cursor-pointer"
                  >
                    <span>View Recipe</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-2xl shadow-md border border-brand-gold/20 text-center max-w-lg mx-auto space-y-4">
            <Utensils className="w-12 h-12 text-brand-gold mx-auto" />
            <h3 className="text-xl font-extrabold text-brand-green serif-header">No Recipes Found</h3>
            <p className="text-xs sm:text-sm text-brand-charcoalLight">
              No recipe or blog cards found matching your category filter. Try selecting "All" or search for another recipe.
            </p>
            <button
              onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}
              className="px-6 py-2.5 bg-brand-green text-brand-gold font-bold text-xs uppercase tracking-wider rounded-lg shadow-md"
            >
              Reset Filters
            </button>
          </div>
        )}

      </main>

      {/* FULL RECIPE DETAILS MODAL */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-[9999] bg-brand-green/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-brand-ivory rounded-2xl border border-brand-gold/30 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 relative">
            <button
              onClick={() => setSelectedRecipe(null)}
              className="absolute top-4 right-4 p-2 text-brand-charcoal hover:text-brand-green bg-white/80 rounded-full shadow-md transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Image Header */}
            <div className="relative h-64 md:h-80 rounded-xl overflow-hidden shadow-md">
              <img
                src={getImageUrl(selectedRecipe.image)}
                alt={selectedRecipe.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-green/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                <span className="bg-brand-gold text-brand-green px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {selectedRecipe.category}
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold serif-header text-brand-ivory">
                  {selectedRecipe.title}
                </h2>
              </div>
            </div>

            {/* Recipe Meta Info */}
            <div className="grid grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-brand-gold/20 text-center text-xs">
              <div>
                <span className="text-[10px] text-brand-gold font-bold uppercase block">Prep Time</span>
                <span className="font-bold text-brand-green">{selectedRecipe.prepTime || "15 Mins"}</span>
              </div>
              <div>
                <span className="text-[10px] text-brand-gold font-bold uppercase block">Cook Time</span>
                <span className="font-bold text-brand-green">{selectedRecipe.cookTime || "25 Mins"}</span>
              </div>
              <div>
                <span className="text-[10px] text-brand-gold font-bold uppercase block">Yield</span>
                <span className="font-bold text-brand-green">{selectedRecipe.servings || "4 Persons"}</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-brand-gold uppercase tracking-wider">About This Recipe</h4>
              <p className="text-xs md:text-sm text-brand-charcoalLight leading-relaxed">
                {selectedRecipe.shortDescription}
              </p>
            </div>

            {/* Ingredients Checklist */}
            {selectedRecipe.ingredients && selectedRecipe.ingredients.length > 0 && (
              <div className="bg-white p-5 rounded-xl border border-brand-gold/20 space-y-3">
                <h4 className="text-sm font-bold text-brand-green serif-header flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-brand-gold" />
                  <span>Key Ingredients</span>
                </h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-brand-charcoal">
                  {selectedRecipe.ingredients.map((ing, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                      <span>{ing}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Cooking Method / Instructions */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-brand-green serif-header">Step-by-Step Preparation Method</h4>
              <div className="bg-white p-5 rounded-xl border border-brand-gold/20 text-xs md:text-sm text-brand-charcoal whitespace-pre-line leading-relaxed font-sans">
                {selectedRecipe.instructions}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="pt-4 border-t border-brand-gold/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-brand-charcoal/70 italic">
                Recipe Curated by {selectedRecipe.author || "ReetSutra Kitchen"}
              </span>
              <Link
                to="/shop"
                className="w-full sm:w-auto px-6 py-3 bg-brand-green hover:bg-[#0E2317] text-brand-gold font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all text-center"
              >
                Shop Organic Ingredients
              </Link>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
