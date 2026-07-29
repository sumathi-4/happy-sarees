const db = require('./db');

const defaultReviews = [
  {
    reviewer_name: "Manvi Jha",
    rating: 5,
    title: "Pure Elegance",
    comment: "If I ever have to describe love, it would be Happy Sarees Suits ❤️",
    image_data: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop",
    is_approved: true,
    status: 'approved'
  },
  {
    reviewer_name: "Monika Jain",
    rating: 5,
    title: "Timeless Craftsmanship",
    comment: "No words needed, Happy Sarees outfit says it all. 🧿",
    image_data: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop",
    is_approved: true,
    status: 'approved'
  },
  {
    reviewer_name: "Apeksha Jain",
    rating: 5,
    title: "Bollywood Dream",
    comment: "Getting ready felt like a whole bollywood movie scene with Happy Sarees suit ✨💜",
    image_data: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop",
    is_approved: true,
    status: 'approved'
  },
  {
    reviewer_name: "Bharti Jain",
    rating: 5,
    title: "Breezy & Effortless",
    comment: "My summer dresses just got an upgrade 🌸 Breathable, breezy & oh-so-easy on the pocket, Thanks to Happy Sarees.",
    image_data: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop",
    is_approved: true,
    status: 'approved'
  },
  {
    reviewer_name: "Priya Nair",
    rating: 5,
    title: "Loved the collection",
    comment: "Loved the collection! The colors are exactly as shown. Highly recommend Happy Sarees.",
    image_data: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
    is_approved: true,
    status: 'approved'
  }
];

async function seed() {
  try {
    for (const r of defaultReviews) {
      await db.query(
        `INSERT INTO reviews (reviewer_name, rating, title, comment, image_data, is_approved, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [r.reviewer_name, r.rating, r.title, r.comment, r.image_data, r.is_approved, r.status]
      );
    }
    console.log('Successfully seeded approved customer reviews into Neon DB!');
    process.exit(0);
  } catch (err) {
    console.error('Seed reviews error:', err);
    process.exit(1);
  }
}

seed();
