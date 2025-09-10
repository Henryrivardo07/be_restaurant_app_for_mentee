const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");
const prisma = new PrismaClient();

faker.seed(20250911);

// --- Konfigurasi ---
const NUM_RESTAURANTS = 24;
const AREAS = [
  "Jakarta Selatan",
  "Jakarta Barat",
  "Jakarta Pusat",
  "Jakarta Timur",
  "Jakarta Utara",
  "Tangerang",
  "Depok",
  "Bekasi",
];

const CUISINE_IMAGES = {
  Burger: [
    "https://foodish-api.com/images/burger/burger1.jpg",
    "https://foodish-api.com/images/burger/burger13.jpg",
    "https://foodish-api.com/images/burger/burger30.jpg",
  ],
  Pizza: [
    "https://foodish-api.com/images/pizza/pizza4.jpg",
    "https://foodish-api.com/images/pizza/pizza14.jpg",
    "https://foodish-api.com/images/pizza/pizza27.jpg",
  ],
  Sushi: [
    "https://foodish-api.com/images/sushi/sushi1.jpg",
    "https://foodish-api.com/images/sushi/sushi8.jpg",
    "https://foodish-api.com/images/sushi/sushi18.jpg",
  ],
  Pasta: [
    "https://foodish-api.com/images/pasta/pasta3.jpg",
    "https://foodish-api.com/images/pasta/pasta12.jpg",
    "https://foodish-api.com/images/pasta/pasta19.jpg",
  ],
  Steak: [
    "https://foodish-api.com/images/steak/steak4.jpg",
    "https://foodish-api.com/images/steak/steak7.jpg",
    "https://foodish-api.com/images/steak/steak17.jpg",
  ],
  "Rice & Curry": [
    "https://foodish-api.com/images/rice/rice5.jpg",
    "https://foodish-api.com/images/biryani/biryani3.jpg",
    "https://foodish-api.com/images/butter-chicken/butter-chicken2.jpg",
  ],
  "Noodle / Mie": [
    "https://foodish-api.com/images/ramen/ramen1.jpg",
    "https://foodish-api.com/images/ramen/ramen20.jpg",
    "https://foodish-api.com/images/dosa/dosa8.jpg",
  ],
  "Fried Chicken": [
    "https://foodish-api.com/images/tandoori-chicken/tandoori-chicken3.jpg",
    "https://foodish-api.com/images/chicken/chicken65/chicken65_7.jpg",
    "https://foodish-api.com/images/chicken/chicken_tikka/chicken_tikka2.jpg",
  ],
  Seafood: [
    "https://foodish-api.com/images/fish/fish2.jpg",
    "https://foodish-api.com/images/fish/fish11.jpg",
    "https://foodish-api.com/images/prawns/prawns4.jpg",
  ],
  "Dessert / Coffee": [
    "https://foodish-api.com/images/dessert/cheesecake/cheesecake7.jpg",
    "https://foodish-api.com/images/dessert/icecream/icecream5.jpg",
    "https://foodish-api.com/images/dessert/pastry/pastry8.jpg",
  ],
};

const NAME_BANK = [
  ["Sate Senopati", "Rice & Curry"],
  ["Bakmi Blok M", "Noodle / Mie"],
  ["Gading Steakhouse", "Steak"],
  ["Kopi Kuningan", "Dessert / Coffee"],
  ["Pizza Kemang Co.", "Pizza"],
  ["Sushi Senayan", "Sushi"],
  ["Padang Sudirman", "Rice & Curry"],
  ["Seafood Pluit 88", "Seafood"],
  ["Burger Tebet Lab", "Burger"],
  ["Pasta Thamrin", "Pasta"],
  ["Ayam Panggang Cikini", "Fried Chicken"],
  ["Ramen Radio Dalam", "Noodle / Mie"],
  ["Kue Menteng Patisserie", "Dessert / Coffee"],
  ["Iga Panglima", "Steak"],
  ["Bakso Bendungan Hilir", "Noodle / Mie"],
  ["Kwetiau Kota", "Noodle / Mie"],
  ["Nasi Uduk Palmerah", "Rice & Curry"],
  ["Pempek Permata Hijau", "Seafood"],
  ["Martabak Matraman", "Dessert / Coffee"],
  ["Dimsum Daan Mogot", "Seafood"],
  ["Gyu Don Gunawarman", "Rice & Curry"],
  ["Truffle Pizza SCBD", "Pizza"],
  ["Sushi Citos Bar", "Sushi"],
  ["Es Kopi Tomang", "Dessert / Coffee"],
];

function randomGeo() {
  return {
    lat: Number(faker.location.latitude({ min: -6.45, max: -6.05 }).toFixed(6)),
    long: Number(
      faker.location.longitude({ min: 106.65, max: 107.05 }).toFixed(6)
    ),
  };
}

function makeLogoDataURI(name) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const bg = [
    "#111827",
    "#1F2937",
    "#0EA5E9",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#14B8A6",
  ][Math.floor(Math.random() * 8)];
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>
      <rect width='100%' height='100%' rx='24' fill='${bg}'/>
      <text x='50%' y='54%' font-family='Inter,Arial,sans-serif' font-size='88' text-anchor='middle' fill='white' font-weight='700'>${initials}</text>
    </svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

// Bangun record sesuai schema Kyra
function buildRestaurantRecords() {
  const picks = faker.helpers.shuffle(NAME_BANK).slice(0, NUM_RESTAURANTS);
  return picks.map(([name, cuisine]) => {
    const place = faker.helpers.arrayElement(AREAS);
    const { lat, long } = randomGeo();
    const star = Number(
      faker.number.float({ min: 3.8, max: 5, precision: 0.1 }).toFixed(1)
    );
    const images = CUISINE_IMAGES[cuisine] || CUISINE_IMAGES["Rice & Curry"];
    return {
      name,
      star,
      place,
      lat,
      long,
      logo: makeLogoDataURI(name),
      images,
    };
  });
}

async function main() {
  console.log("🌱 Clearing old restaurants…");
  await prisma.restaurant.deleteMany();

  console.log("🍽 Inserting context-aware restaurants…");
  const data = buildRestaurantRecords();
  await prisma.restaurant.createMany({ data });

  const total = await prisma.restaurant.count();
  console.log(`✅ Done. Seeded ${total} restaurants`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
