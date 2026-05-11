export interface Item {
  id: string;
  name: string;
  category: string;
  description: string;
  price: string;
  image: string;
  link: string;
  details: string;
}

export const categories = [
  { id: "all", name: "All Items" },
  { id: "furniture", name: "Furniture" },
  { id: "tech", name: "Tech" },
  { id: "fashion", name: "Fashion" },
  { id: "lifestyle", name: "Lifestyle" },
  { id: "accessories", name: "Accessories" }
];

export const items: Item[] = [
  {
    id: "1",
    name: "Herman Miller Aeron Chair",
    category: "furniture",
    description: "Legendary ergonomic office chair",
    price: "$1,495",
    image: "/aeron-chair.jpg",
    link: "https://www.hermanmiller.com/products/seating/office-chairs/aeron-chairs/",
    details: "The iconic Aeron chair combines unparalleled ergonomic support with timeless design. Features PostureFit SL support, adjustable arms, and breathable Pellicle mesh. A true investment in your workspace."
  },
  {
    id: "2",
    name: "Apple Studio Display",
    category: "tech",
    description: "27-inch 5K Retina display",
    price: "$1,599",
    image: "/studio-display.jpg",
    link: "https://www.apple.com/studio-display/",
    details: "Immersive 27-inch 5K Retina display with 14.7 million pixels, 600 nits of brightness, True Tone technology, and anti-reflective coating. The perfect companion for creative professionals."
  },
  {
    id: "3",
    name: "Arc'teryx Veilance Monitor Coat",
    category: "fashion",
    description: "Minimalist waterproof coat",
    price: "$1,150",
    image: "/veilance-coat.jpg",
    link: "https://veilance.com/",
    details: "Clean, technical design with GORE-TEX fabric. Articulated patterning for freedom of movement, laminated hood, and minimal branding. Urban functionality meets refined aesthetics."
  },
  {
    id: "4",
    name: "Aesop Resurrection Hand Balm",
    category: "lifestyle",
    description: "Premium hydrating hand balm",
    price: "$29",
    image: "/aesop-balm.jpg",
    link: "https://www.aesop.com/",
    details: "A rich, intensive formula with Mandarin rind and Rosemary leaf. Softens and moisturizes the hands while offering a subtle, sophisticated scent. Perfect for daily ritual."
  },
  {
    id: "5",
    name: "Bellroy Slim Sleeve Wallet",
    category: "accessories",
    description: "Minimalist leather wallet",
    price: "$89",
    image: "/bellroy-wallet.jpg",
    link: "https://bellroy.com/",
    details: "Holds 4-12 cards plus cash with an ingenious pull-tab system. Premium full-grain leather that ages beautifully. Slim profile designed for front pocket carry."
  },
  {
    id: "6",
    name: "Muji Aroma Diffuser",
    category: "lifestyle",
    description: "Ultrasonic aroma diffuser",
    price: "$65",
    image: "/muji-diffuser.jpg",
    link: "https://www.muji.com/",
    details: "Minimalist design with LED lighting options. Ultrasonic technology disperses essential oils efficiently. Two timer settings and automatic shut-off for peace of mind."
  },
  {
    id: "7",
    name: "Teenage Engineering OP-1 Field",
    category: "tech",
    description: "Portable synthesizer workstation",
    price: "$1,999",
    image: "/op1-field.jpg",
    link: "https://teenage.engineering/",
    details: "The ultimate portable production studio. Synthesizer, sampler, and controller in one sleek aluminum body. Revolutionary interface and pristine audio quality."
  },
  {
    id: "8",
    name: "String Shelving System",
    category: "furniture",
    description: "Modular Scandinavian shelving",
    price: "$425",
    image: "/string-shelving.jpg",
    link: "https://string.se/",
    details: "Timeless modular shelving system designed in 1949. Customizable configuration with ash wood shelves and steel side panels. The definition of Scandinavian minimalism."
  },
  {
    id: "9",
    name: "Common Projects Achilles Low",
    category: "fashion",
    description: "Premium leather sneakers",
    price: "$425",
    image: "/common-projects.jpg",
    link: "https://www.commonprojects.com/",
    details: "Italian leather low-top sneakers with gold foil serial number. Minimalist design with exceptional craftsmanship. The sneaker that elevates any outfit."
  }
];
