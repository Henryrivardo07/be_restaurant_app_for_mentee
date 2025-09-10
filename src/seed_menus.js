// src/seed_menus.js
const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");
const prisma = new PrismaClient();

faker.seed(20250911);

const MENU_TYPES = ["main", "side", "drink", "dessert"];
const randInt = (min, max) => faker.number.int({ min, max });

function guessCuisineByName(name = "") {
  const n = name.toLowerCase();
  if (/(pizza|truffle)/.test(n)) return "pizza";
  if (/(sushi)/.test(n)) return "sushi";
  if (/(burger)/.test(n)) return "burger";
  if (/(steak|iga)/.test(n)) return "steak";
  if (/(kopi|patisserie|martabak|kue)/.test(n)) return "dessert";
  if (/(seafood|pempek|dimsum)/.test(n)) return "seafood";
  if (/(ramen|bakmi|kwetiau|bakso|mie)/.test(n)) return "noodle";
  return "rice";
}

function pickImage(cuisine) {
  switch (cuisine) {
    case "pizza":
      return faker.helpers.arrayElement([
        "https://foodish-api.com/images/pizza/pizza4.jpg",
        "https://foodish-api.com/images/pizza/pizza14.jpg",
        "https://foodish-api.com/images/pizza/pizza27.jpg",
      ]);
    case "sushi":
      return faker.helpers.arrayElement([
        "https://foodish-api.com/images/sushi/sushi1.jpg",
        "https://foodish-api.com/images/sushi/sushi8.jpg",
        "https://foodish-api.com/images/sushi/sushi18.jpg",
      ]);
    case "burger":
      return faker.helpers.arrayElement([
        "https://foodish-api.com/images/burger/burger1.jpg",
        "https://foodish-api.com/images/burger/burger13.jpg",
        "https://foodish-api.com/images/burger/burger30.jpg",
      ]);
    case "steak":
      return faker.helpers.arrayElement([
        "https://foodish-api.com/images/steak/steak4.jpg",
        "https://foodish-api.com/images/steak/steak7.jpg",
        "https://foodish-api.com/images/steak/steak17.jpg",
      ]);
    case "dessert":
      return faker.helpers.arrayElement([
        "https://foodish-api.com/images/dessert/cheesecake/cheesecake7.jpg",
        "https://foodish-api.com/images/dessert/icecream/icecream5.jpg",
        "https://foodish-api.com/images/dessert/pastry/pastry8.jpg",
      ]);
    case "seafood":
      return faker.helpers.arrayElement([
        "https://foodish-api.com/images/fish/fish2.jpg",
        "https://foodish-api.com/images/fish/fish11.jpg",
        "https://foodish-api.com/images/prawns/prawns4.jpg",
      ]);
    case "noodle":
      return faker.helpers.arrayElement([
        "https://foodish-api.com/images/ramen/ramen1.jpg",
        "https://foodish-api.com/images/ramen/ramen20.jpg",
        "https://foodish-api.com/images/dosa/dosa8.jpg",
      ]);
    default:
      return faker.helpers.arrayElement([
        "https://foodish-api.com/images/rice/rice5.jpg",
        "https://foodish-api.com/images/biryani/biryani3.jpg",
        "https://foodish-api.com/images/butter-chicken/butter-chicken2.jpg",
      ]);
  }
}

async function main() {
  console.log("🍱 Seeding menus…");

  // Cek apakah tabel menu sudah terisi
  let existing = 0;
  try {
    existing = await prisma.menu.count();
  } catch {
    try {
      existing = await prisma.restoMenu.count();
    } catch {}
  }

  if (existing > 0) {
    console.log(
      `⚠️  Menus already exist (${existing}). Skip to avoid duplicates.`
    );
    return;
  }

  const restos = await prisma.restaurant.findMany({
    select: { id: true, name: true },
  });

  for (const r of restos) {
    const cuisine = guessCuisineByName(r.name);
    const n = randInt(4, 8);

    // Data versi camelCase (Prisma field)
    const dataCamel = Array.from({ length: n }).map(() => ({
      restaurantId: r.id,
      foodName: faker.commerce.productName(),
      price: randInt(15000, 150000),
      type: faker.helpers.arrayElement(MENU_TYPES),
      image: pickImage(cuisine),
    }));

    // Data versi snake_case (kalau Prisma expose nama kolom)
    const dataSnake = dataCamel.map(({ restaurantId, foodName, ...rest }) => ({
      resto_id: restaurantId,
      food_name: foodName,
      ...rest,
    }));

    // Coba create dengan nama model & field yang tersedia
    let created = false;
    try {
      if (prisma.menu) {
        await prisma.menu.createMany({ data: dataCamel });
        created = true;
      }
    } catch {}

    if (!created) {
      try {
        if (prisma.menu) {
          await prisma.menu.createMany({ data: dataSnake });
          created = true;
        }
      } catch {}
    }

    if (!created) {
      try {
        if (prisma.restoMenu) {
          await prisma.restoMenu.createMany({ data: dataCamel });
          created = true;
        }
      } catch {}
    }

    if (!created) {
      try {
        if (prisma.restoMenu) {
          await prisma.restoMenu.createMany({ data: dataSnake });
          created = true;
        }
      } catch {}
    }

    if (!created) {
      console.warn(
        `⚠️  Failed to insert menus for restaurant ${r.id}. Check model/fields.`
      );
    }
  }

  console.log("✅ Done seeding menus");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
