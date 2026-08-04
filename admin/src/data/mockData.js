export const initialCategories = [
  {
    id: "cat-1",
    name: "Traditional Sweets",
    description: "Authentic, heritage sweets prepared using pure ghee and traditional recipes.",
    productCount: 3,
    status: "Active",
    slug: "traditional-sweets"
  },
  {
    id: "cat-2",
    name: "Roasted Snacks",
    description: "Light, healthy, and crunchy dry-roasted local specialties.",
    productCount: 2,
    status: "Active",
    slug: "roasted-snacks"
  },
  {
    id: "cat-3",
    name: "Nutritious Flours & Staples",
    description: "Stone-ground traditional grains and healthy flours full of fiber.",
    productCount: 1,
    status: "Active",
    slug: "flours-staples"
  },
  {
    id: "cat-4",
    name: "Festival Specials",
    description: "Seasonal delicacies prepared specifically for auspicious occasions and festivals.",
    productCount: 1,
    status: "Active",
    slug: "festival-specials"
  }
];

export const initialProducts = [
  {
    id: "prod-1",
    name: "Premium Bihar Thekua",
    sku: "RS-THK-001",
    description: "Authentic homemade style Thekua made from whole wheat flour, pure desi ghee, dry coconut, fennel seeds, and high-quality organic jaggery. A traditional dry sweet popular during Chhath Puja.",
    price: 349,
    compareAtPrice: 399,
    category: "Festival Specials",
    stock: 120,
    status: "Active",
    image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=600&q=80",
    rating: 4.8,
    reviewsCount: 84
  },
  {
    id: "prod-2",
    name: "Crispy Sweet Khaja",
    sku: "RS-KHJ-002",
    description: "Layered, crispy fritters dipped in sugar syrup, native to Silao, Bihar. Handcrafted with multiple thin flour sheets cooked to golden perfection and soaked in light sugar syrup.",
    price: 299,
    compareAtPrice: 349,
    category: "Traditional Sweets",
    stock: 85,
    status: "Active",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
    rating: 4.7,
    reviewsCount: 52
  },
  {
    id: "prod-3",
    name: "Organic Roasted Makhana",
    sku: "RS-MKN-003",
    description: "Puffed lotus seeds harvested from Mithila region, lightly dry-roasted with pink salt and pure cow ghee. Packed with protein, magnesium, and essential nutrients.",
    price: 249,
    compareAtPrice: 299,
    category: "Roasted Snacks",
    stock: 210,
    status: "Active",
    image: "https://images.unsplash.com/photo-1599307767316-776533bb941c?auto=format&fit=crop&w=600&q=80",
    rating: 4.9,
    reviewsCount: 135
  },
  {
    id: "prod-4",
    name: "High-Protein Chana Sattu",
    sku: "RS-STU-004",
    description: "Traditional roasted Bengal gram flour ground in natural stone chakki. An energetic superfood ideal for refreshing summer drinks, paratha fillings, and traditional sattu laddoos.",
    price: 149,
    compareAtPrice: 179,
    category: "Nutritious Flours & Staples",
    stock: 350,
    status: "Active",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
    rating: 4.6,
    reviewsCount: 96
  },
  {
    id: "prod-5",
    name: "Gaya Tilkut (Sesame Sweet)",
    sku: "RS-TLK-005",
    description: "Authentic sweet snack made by hammering roasted sesame seeds and organic hot jaggery (Gur) into flaky layers. Prepared during Makar Sankranti by traditional artisans from Gaya.",
    price: 399,
    compareAtPrice: 449,
    category: "Traditional Sweets",
    stock: 45,
    status: "Active",
    image: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=600&q=80",
    rating: 4.9,
    reviewsCount: 78
  },
  {
    id: "prod-6",
    name: "Healthy Dry Fruit Laddoo",
    sku: "RS-DFL-006",
    description: "Sugar-free laddoos packed with premium dates, almonds, cashews, pistachios, raisins, and edible gum (Gond) bound in pure desi ghee. Excellent energy booster for all ages.",
    price: 499,
    compareAtPrice: 599,
    category: "Traditional Sweets",
    stock: 92,
    status: "Active",
    image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80",
    rating: 4.9,
    reviewsCount: 164
  }
];

export const initialCustomers = [
  {
    id: "cust-1",
    name: "Ananya Sharma",
    email: "ananya.sharma@gmail.com",
    phone: "+91 98765 43210",
    status: "Active",
    totalOrders: 8,
    totalSpending: 3840,
    registrationDate: "2025-09-12",
    addresses: [
      {
        id: "addr-1",
        tag: "Home",
        line: "B-402, Shanti Vihar Apartments, Kankarbagh",
        city: "Patna",
        state: "Bihar",
        zip: "800020",
        isDefault: true
      },
      {
        id: "addr-2",
        tag: "Office",
        line: "Techno-Hub, Sector 62",
        city: "Noida",
        state: "Uttar Pradesh",
        zip: "201301",
        isDefault: false
      }
    ]
  },
  {
    id: "cust-2",
    name: "Rajesh Kumar",
    email: "rajesh.k@yahoo.com",
    phone: "+91 87654 32109",
    status: "Active",
    totalOrders: 5,
    totalSpending: 2150,
    registrationDate: "2025-10-05",
    addresses: [
      {
        id: "addr-3",
        tag: "Home",
        line: "Flat No. 12, Rosewood Society, Bandra West",
        city: "Mumbai",
        state: "Maharashtra",
        zip: "400050",
        isDefault: true
      }
    ]
  },
  {
    id: "cust-3",
    name: "Priyanka Verma",
    email: "priyanka.verma@outlook.com",
    phone: "+91 76543 21098",
    status: "Active",
    totalOrders: 12,
    totalSpending: 6890,
    registrationDate: "2025-06-20",
    addresses: [
      {
        id: "addr-4",
        tag: "Home",
        line: "House No. 154, Sector 15",
        city: "Gurugram",
        state: "Haryana",
        zip: "122001",
        isDefault: true
      }
    ]
  },
  {
    id: "cust-4",
    name: "Vikram Malhotra",
    email: "vikram.m@gmail.com",
    phone: "+91 99988 77665",
    status: "Inactive",
    totalOrders: 2,
    totalSpending: 748,
    registrationDate: "2025-11-18",
    addresses: [
      {
        id: "addr-5",
        tag: "Home",
        line: "45, Park Street, Flat 3B",
        city: "Kolkata",
        state: "West Bengal",
        zip: "700016",
        isDefault: true
      }
    ]
  },
  {
    id: "cust-5",
    name: "Sunita Gupta",
    email: "gupta.sunita@gmail.com",
    phone: "+91 88877 66554",
    status: "Active",
    totalOrders: 18,
    totalSpending: 10450,
    registrationDate: "2025-01-10",
    addresses: [
      {
        id: "addr-6",
        tag: "Home",
        line: "C-112, Green Park Extension",
        city: "New Delhi",
        state: "Delhi",
        zip: "110016",
        isDefault: true
      }
    ]
  }
];

export const initialOrders = [
  {
    id: "ORD-9281",
    customerId: "cust-1",
    customerName: "Ananya Sharma",
    customerEmail: "ananya.sharma@gmail.com",
    customerPhone: "+91 98765 43210",
    date: "2026-06-25",
    items: [
      {
        productId: "prod-1",
        productName: "Premium Bihar Thekua",
        price: 349,
        quantity: 2,
        image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=60&q=80"
      },
      {
        productId: "prod-3",
        productName: "Organic Roasted Makhana",
        price: 249,
        quantity: 3,
        image: "https://images.unsplash.com/photo-1599307767316-776533bb941c?auto=format&fit=crop&w=60&q=80"
      }
    ],
    subtotal: 1445,
    tax: 72,
    shipping: 50,
    total: 1567,
    paymentMethod: "UPI",
    paymentStatus: "Paid",
    orderStatus: "Processing",
    shippingAddress: {
      line: "B-402, Shanti Vihar Apartments, Kankarbagh",
      city: "Patna",
      state: "Bihar",
      zip: "800020"
    },
    timeline: [
      { status: "Pending", date: "2026-06-25 14:22" },
      { status: "Processing", date: "2026-06-25 16:30" }
    ]
  },
  {
    id: "ORD-9280",
    customerId: "cust-3",
    customerName: "Priyanka Verma",
    customerEmail: "priyanka.verma@outlook.com",
    customerPhone: "+91 76543 21098",
    date: "2026-06-24",
    items: [
      {
        productId: "prod-6",
        productName: "Healthy Dry Fruit Laddoo",
        price: 499,
        quantity: 2,
        image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=60&q=80"
      },
      {
        productId: "prod-5",
        productName: "Gaya Tilkut (Sesame Sweet)",
        price: 399,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=60&q=80"
      }
    ],
    subtotal: 1397,
    tax: 70,
    shipping: 0, // Free shipping
    total: 1467,
    paymentMethod: "Credit Card",
    paymentStatus: "Paid",
    orderStatus: "Shipped",
    shippingAddress: {
      line: "House No. 154, Sector 15",
      city: "Gurugram",
      state: "Haryana",
      zip: "122001"
    },
    timeline: [
      { status: "Pending", date: "2026-06-24 09:15" },
      { status: "Processing", date: "2026-06-24 11:30" },
      { status: "Shipped", date: "2026-06-24 18:00" }
    ]
  },
  {
    id: "ORD-9279",
    customerId: "cust-2",
    customerName: "Rajesh Kumar",
    customerEmail: "rajesh.k@yahoo.com",
    customerPhone: "+91 87654 32109",
    date: "2026-06-22",
    items: [
      {
        productId: "prod-4",
        productName: "High-Protein Chana Sattu",
        price: 149,
        quantity: 4,
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=60&q=80"
      }
    ],
    subtotal: 596,
    tax: 30,
    shipping: 50,
    total: 676,
    paymentMethod: "COD",
    paymentStatus: "Pending",
    orderStatus: "Delivered",
    shippingAddress: {
      line: "Flat No. 12, Rosewood Society, Bandra West",
      city: "Mumbai",
      state: "Maharashtra",
      zip: "400050"
    },
    timeline: [
      { status: "Pending", date: "2026-06-22 18:45" },
      { status: "Processing", date: "2026-06-23 09:30" },
      { status: "Shipped", date: "2026-06-23 14:00" },
      { status: "Delivered", date: "2026-06-24 16:20" }
    ]
  },
  {
    id: "ORD-9278",
    customerId: "cust-5",
    customerName: "Sunita Gupta",
    customerEmail: "gupta.sunita@gmail.com",
    customerPhone: "+91 88877 66554",
    date: "2026-06-21",
    items: [
      {
        productId: "prod-2",
        productName: "Crispy Sweet Khaja",
        price: 299,
        quantity: 3,
        image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=60&q=80"
      },
      {
        productId: "prod-6",
        productName: "Healthy Dry Fruit Laddoo",
        price: 499,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=60&q=80"
      }
    ],
    subtotal: 1396,
    tax: 70,
    shipping: 0,
    total: 1466,
    paymentMethod: "Net Banking",
    paymentStatus: "Paid",
    orderStatus: "Delivered",
    shippingAddress: {
      line: "C-112, Green Park Extension",
      city: "New Delhi",
      state: "Delhi",
      zip: "110016"
    },
    timeline: [
      { status: "Pending", date: "2026-06-21 11:10" },
      { status: "Processing", date: "2026-06-21 13:00" },
      { status: "Shipped", date: "2026-06-22 10:15" },
      { status: "Delivered", date: "2026-06-23 15:45" }
    ]
  },
  {
    id: "ORD-9277",
    customerId: "cust-4",
    customerName: "Vikram Malhotra",
    customerEmail: "vikram.m@gmail.com",
    customerPhone: "+91 99988 77665",
    date: "2026-06-18",
    items: [
      {
        productId: "prod-1",
        productName: "Premium Bihar Thekua",
        price: 349,
        quantity: 2,
        image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=60&q=80"
      }
    ],
    subtotal: 698,
    tax: 35,
    shipping: 50,
    total: 783,
    paymentMethod: "UPI",
    paymentStatus: "Failed",
    orderStatus: "Cancelled",
    shippingAddress: {
      line: "45, Park Street, Flat 3B",
      city: "Kolkata",
      state: "West Bengal",
      zip: "700016"
    },
    timeline: [
      { status: "Pending", date: "2026-06-18 17:30" },
      { status: "Cancelled", date: "2026-06-18 17:40" }
    ]
  }
];

export const initialBanners = [
  {
    id: "ban-1",
    title: "Savor the Heritage: Handcrafted Traditional Delicacies",
    subtitle: "Made with authentic ingredients, stone-ground flours, and organic jaggery.",
    image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=1200&q=80",
    buttonText: "Shop Sweets",
    buttonLink: "/category/traditional-sweets",
    status: "Active",
    placement: "Main Hero",
    startDate: "2026-06-01",
    endDate: "2026-08-31"
  },
  {
    id: "ban-2",
    title: "Light & Nutritious: Monsoon Snack Specials",
    subtitle: "Get up to 15% off on high-protein roasted lotus seed Makhana bags.",
    image: "https://images.unsplash.com/photo-1599307767316-776533bb941c?auto=format&fit=crop&w=1200&q=80",
    buttonText: "Browse Roasted",
    buttonLink: "/category/roasted-snacks",
    status: "Active",
    placement: "Promo Sidebar",
    startDate: "2026-06-15",
    endDate: "2026-07-15"
  },
  {
    id: "ban-3",
    title: "Sattu Power: Clean Energy Superfood Drinks",
    subtitle: "Stone-ground roasted gram flour for high performance naturally.",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80",
    buttonText: "Explore Sattu",
    buttonLink: "/product/prod-4",
    status: "Inactive",
    placement: "Homepage Banner 2",
    startDate: "2026-05-01",
    endDate: "2026-05-31"
  }
];

export const initialSettings = {
  storeName: "ReetSutra Traditional Foods",
  storeTagline: "Savor the Legacy of Taste and Health",
  storeLogo: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=100&q=80",
  storeFavicon: "",
  contactEmail: "care@reetsutra.com",
  contactPhone: "+91 800 123 4567",
  contactAddress: "ReetSutra Food Ventures, Block D, Sector 63, Noida, Uttar Pradesh, India - 201301",
  socialFacebook: "https://facebook.com/reetsutra.foods",
  socialInstagram: "https://instagram.com/reetsutra.foods",
  socialYoutube: "https://youtube.com/reetsutra",
  socialPinterest: "https://pinterest.com/reetsutra",
  currency: "INR (₹)",
  timezone: "IST (UTC+05:30)",
  taxRate: 5,
  orderPrefix: "ORD-",
  seoTitle: "ReetSutra | Authentic Traditional Sweets & Healthy Indian Roasted Snacks",
  seoMetaDescription: "Shop authentic handcrafted Indian traditional foods, sweets, Sattu, Tilkut, Thekua, and roasted Makhanas. Made from organic ingredients, pure cow ghee, and ancient recipes.",
  seoKeywords: "Thekua, Sattu, Khaja, Tilkut, Makhana, Traditional Sweets, Roasted Snacks, Bihar Delicacies, Healthy Snacks, Buy Sweets Online",
  robotsTxt: "User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /checkout/"
};

export const initialAdminProfile = {
  name: "Nikhil Dev",
  role: "Super Admin",
  email: "admin@reetsutra.com",
  phone: "+91 99887 76655",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
  lastLogin: "2026-06-26 10:15 IST"
};


