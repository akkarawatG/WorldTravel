// src/data/mockData.ts

export const CONTINENTS = [
  "Asia",
  "Africa",
  "North America",
  "South America",
  "Europe",
  "Oceania"
];

// ข้อมูลประเทศ Top Visited Countries 2025
// อัปเดต: ตัดประเทศตามรายการที่ระบุ (รวมถึง Hong Kong, Macau, Maldives ฯลฯ)
export const COUNTRIES_DATA: Record<string, any[]> = {
  "Asia": [
    { rank: 3, name: "China", capital: "Beijing", image: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=600&q=80" },
    // Excluded: Hong Kong (10)
    { rank: 13, name: "Thailand", capital: "Bangkok", image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&q=80" },
    // Excluded: Macau (15)
    { rank: 16, name: "Malaysia", capital: "Kuala Lumpur", image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=600&q=80" },
    { rank: 21, name: "Japan", capital: "Tokyo", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80" },
    { rank: 22, name: "United Arab Emirates", capital: "Abu Dhabi", image: "https://d1bv4heaa2n05k.cloudfront.net/user-images/1534946164225/shutterstock-281768141_destinationMain_1534946181386.jpeg" },
    { rank: 24, name: "Saudi Arabia", capital: "Riyadh", image: "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=600&q=80" },
    { rank: 26, name: "Singapore", capital: "Singapore", image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&q=80" },
    { rank: 27, name: "Vietnam", capital: "Hanoi", image: "https://images.unsplash.com/photo-1528127269322-539801943592?w=600&q=80" },
    { rank: 28, name: "India", capital: "New Delhi", image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=80" },
    { rank: 29, name: "South Korea", capital: "Seoul", image: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=600&q=80" },
    { rank: 31, name: "Indonesia", capital: "Jakarta", image: "https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?w=600&q=80" },
    { rank: 39, name: "Taiwan", capital: "Taipei", image: "https://images.unsplash.com/photo-1552993873-0dd1110e025f?w=600&q=80" },
    { rank: 43, name: "Bahrain", capital: "Manama", image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/33/fb/89/bahrain.jpg?w=2400&h=-1&s=1&cx=2368&cy=517&chk=v1_427c23761d46f39623e8" },
    { rank: 48, name: "Iran", capital: "Tehran", image: "https://t1.gstatic.com/licensed-image?q=tbn:ANd9GcRNX6K8TqJ5vYPXI0zNXvl0kQizLyre54WnKS8QJzbXXWRsXsoL4gPje3ExYfoadVQW" },
    // Excluded: Iran (48)
    { rank: 49, name: "Kuwait", capital: "Kuwait City", image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/06/44/b1/ae/al-kout-beach.jpg?w=2400&h=-1&s=1" },
    { rank: 50, name: "Kazakhstan", capital: "Astana", image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/33/fb/6b/kazakhstan.jpg?w=2400&h=-1&s=1" },
    // Excluded: Kyrgyzstan (51)
    { rank: 53, name: "Philippines", capital: "Manila", image: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=600&q=80" },
    { rank: 59, name: "Uzbekistan", capital: "Tashkent", image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/33/fb/78/uzbekistan.jpg?w=2400&h=-1&s=1" },
    { rank: 60, name: "Cambodia", capital: "Phnom Penh", image: "https://www.eyeonasia.gov.sg/images/asean-countries/Cambodia%20snapshot%20cover.jpg" },
    { rank: 67, name: "Jordan", capital: "Amman", image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/05/e1/4c/27/im-siq.jpg?w=2400&h=-1&s=1" },
    // Excluded: Israel (70)
    { rank: 71, name: "Laos", capital: "Vientiane", image: "https://lp-cms-production.imgix.net/2025-09/LPT0917057.jpg?auto=format,compress&q=72&w=1440&h=810&fit=crop" },
    { rank: 73, name: "Brunei", capital: "Bandar Seri Begawan", image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0b/58/93/1e/sultan-omar-ali-saifuddin.jpg?w=2400&h=-1&s=1" },
    // Excluded: Myanmar (75)
    // Excluded: Palestine (81)
    { rank: 83, name: "Oman", capital: "Muscat", image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0c/3d/58/aa/photo-provided-by-the.jpg?w=2400&h=-1&s=1" },
    // Excluded: Syria (92)
    { rank: 98, name: "Qatar", capital: "Doha", image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/16/5a/4b/51/i-m-in-qatar-i-flew-la.jpg?w=2400&h=-1&s=1" },
    { rank: 104, name: "Sri Lanka", capital: "Colombo", image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0f/ed/85/6b/um-palacio-no-topo-da.jpg?w=1400&h=800&s=1" },
    // Excluded: Lebanon (107)
    // Excluded: Maldives (111)
  ],
  "Europe": [
    { rank: 1, name: "France", capital: "Paris", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80" },
    { rank: 4, name: "Spain", capital: "Madrid", image: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=600&q=80" },
    { rank: 6, name: "Italy", capital: "Rome", image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=600&q=80" },
    { rank: 7, name: "Poland", capital: "Warsaw", image: "https://media.cnn.com/api/v1/images/stellar/prod/181018143148-krakow-2.jpg?q=w_1160,c_fill/f_webp" },
    { rank: 8, name: "Hungary", capital: "Budapest", image: "https://images.unsplash.com/photo-1565426873118-a17ed65d74b9?w=600&q=80" },
    { rank: 9, name: "Croatia", capital: "Zagreb", image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/33/fc/cc/croatia.jpg?w=2400&h=-1&s=1" },
    { rank: 11, name: "Turkey", capital: "Ankara", image: "https://images.unsplash.com/photo-1527838832700-5059252407fa?w=600&q=80" },
    { rank: 12, name: "United Kingdom", capital: "London", image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80" },
    { rank: 14, name: "Germany", capital: "Berlin", image: "https://images.unsplash.com/photo-1599946347371-68eb71b16afc?w=600&q=80" },
    { rank: 17, name: "Greece", capital: "Athens", image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&q=80" },
    { rank: 18, name: "Denmark", capital: "Copenhagen", image: "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=600&q=80" },
    { rank: 20, name: "Austria", capital: "Vienna", image: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=600&q=80" },
    // Excluded: Russia (23)
    { rank: 25, name: "Netherlands", capital: "Amsterdam", image: "https://wowiwalkers.com/wp-content/uploads/2023/01/Bicycles_Netherlands_blog.jpg" },
    { rank: 30, name: "Portugal", capital: "Lisbon", image: "https://assets.apps.onegrandvacation.com/hgvdotcom-mkt-assets/media/images/main/blogs/2022/11/how-to-spend-5_header_resize_nov_22/image.jpeg?h=417&iar=0&w=627&hash=ECA272FDF86709FB90E6442B0A2550B0" },
    // Excluded: Slovakia (32)
    // Excluded: Ukraine (34)
    { rank: 37, name: "Romania", capital: "Bucharest", image: "https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=600&q=80" },
    // Excluded: Bulgaria (38)
    // Excluded: Belarus (40)
    { rank: 41, name: "Switzerland", capital: "Bern", image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=600&q=80" },
    // Excluded: Ireland (44)
    { rank: 47, name: "Belgium", capital: "Brussels", image: "https://lp-cms-production.imgix.net/2025-03/GettyImages-2194124510-16.9.jpg?auto=format,compress&q=72&w=1440&h=810&fit=crop" },
    { rank: 52, name: "Latvia", capital: "Riga", image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0d/d5/b8/5e/20161209-161308-largejpg.jpg?w=2400&h=-1&s=1" },
    // Excluded: Andorra (54)
    { rank: 55, name: "Georgia", capital: "Tbilisi", image: "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=600&q=80" },
    { rank: 56, name: "Sweden", capital: "Stockholm", image: "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=600&q=80" },
    // Excluded: Albania (61)
    { rank: 63, name: "Lithuania", capital: "Vilnius", image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/33/fa/e3/lithuania.jpg?w=2400&h=-1&s=1" },
    { rank: 64, name: "Estonia", capital: "Tallinn", image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0f/d4/7f/a2/photo4jpg.jpg?w=2000&h=-1&s=1" },
    { rank: 65, name: "Norway", capital: "Oslo", image: "https://dtcslo72w0h2o.cloudfront.net/assetbank/Geirangerfjord_1011971.jpg" },
    // Excluded: Slovenia (72)
    // Excluded: Cyprus (79)
    // Excluded: Malta (82)
    { rank: 86, name: "Finland", capital: "Helsinki", image: "https://images.unsplash.com/photo-1539667468225-eebb663053e6?w=600&q=80" },
    // Excluded: Azerbaijan (87)
    // Excluded: Montenegro (90)
    { rank: 97, name: "Iceland", capital: "Reykjavik", image: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=600&q=80" },
    // Excluded: San Marino (108)
    // Excluded: Armenia (109)
    // Excluded: Serbia (110)
  ],
  "North America": [
    { rank: 2, name: "United States", capital: "Washington, D.C.", image: "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=600&q=80" },
    { rank: 5, name: "Mexico", capital: "Mexico City", image: "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=600&q=80" },
    { rank: 19, name: "Canada", capital: "Ottawa", image: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=600&q=80" },
    { rank: 57, name: "Dominican Republic", capital: "Santo Domingo", image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&q=80" },
    { rank: 58, name: "Bahamas", capital: "Nassau", image: "https://images.unsplash.com/photo-1548574505-5e239809ee19?w=600&q=80" },
    // Excluded: Puerto Rico (69)
    { rank: 77, name: "Cuba", capital: "Havana", image: "https://images.unsplash.com/photo-1500759285222-a95626b934cb?w=600&q=80" },
    { rank: 78, name: "Jamaica", capital: "Kingston", image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2c/78/df/5c/sandals-montego-bay-resort.jpg?w=1200&h=-1&s=1" },
    { rank: 85, name: "Costa Rica", capital: "San Jose", image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1b/33/ea/a5/caption.jpg?w=1400&h=-1&s=1" },
    // Excluded: El Salvador (88)
    { rank: 89, name: "Guatemala", capital: "Guatemala City", image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/33/fb/30/guatemala.jpg?w=2400&h=-1&s=1" },
    { rank: 91, name: "Panama", capital: "Panama City", image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/f8/77/37/dia-en-playa-libertad.jpg?w=2400&h=-1&s=1" },
    // Excluded: Cayman Islands (94)
    // Excluded: Honduras (95)
    // Excluded: United States Virgin Islands (100)
    // Excluded: Sint Maarten (105)
    // Excluded: Aruba (106)
    // Excluded: Belize (112)
    // Excluded: Guam (113)
    // Excluded: Turks and Caicos Islands (116)
  ],
  "South America": [
    { rank: 42, name: "Argentina", capital: "Buenos Aires", image: "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=600&q=80" },
    { rank: 62, name: "Brazil", capital: "Brasilia", image: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=600&q=80" },
    { rank: 66, name: "Chile", capital: "Santiago", image: "https://pohcdn.com/sites/default/files/styles/big_gallery_image/public/text_gallery/chile-4.jpg" },
    { rank: 68, name: "Peru", capital: "Lima", image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=600&q=80" },
    { rank: 74, name: "Paraguay", capital: "Asuncion", image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0e/3f/60/91/img-20170119-093320069.jpg?w=2400&h=-1&s=1" },
    { rank: 76, name: "Colombia", capital: "Bogota", image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=600&q=80" },
    { rank: 84, name: "Uruguay", capital: "Montevideo", image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/33/fb/92/uruguay.jpg?w=2400&h=-1&s=1" },
    { rank: 99, name: "Ecuador", capital: "Quito", image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/01/16/50/8d/verdant-valley.jpg?w=800&h=-1&s=1" }
  ],
  "Africa": [
    { rank: 33, name: "South Africa", capital: "Cape Town", image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/04/6e/45/64/caption.jpg?w=2400&h=-1&s=1" },
    { rank: 35, name: "Morocco", capital: "Rabat", image: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=600&q=80" },
    { rank: 36, name: "Egypt", capital: "Cairo", image: "https://www.gokite.travel/wp-content/uploads/2024/09/1.-Visit-the-Pyramids-of-Giza-and-the-Sphinx.webp" },
    // Excluded: Tunisia (46)
    // Excluded: Algeria (93)
    // Excluded: Zimbabwe (96)
    // Excluded: Ivory Coast (101)
    { rank: 102, name: "Kenya", capital: "Nairobi", image: "https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=600&q=80" },
    // Excluded: Mozambique (103)
    { rank: 114, name: "Namibia", capital: "Windhoek", image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/10/a8/85/4d/view-from-the-balloon.jpg?w=2000&h=-1&s=1" },
    // Excluded: Rwanda (115)
    // Excluded: Uganda (117)
    { rank: 118, name: "Tanzania", capital: "Dodoma", image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/33/fb/43/tanzania.jpg?w=2400&h=-1&s=1" }
  ],
  "Oceania": [
    { rank: 45, name: "Australia", capital: "Canberra", image: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=600&q=80" },
    { rank: 80, name: "New Zealand", capital: "Wellington", image: "https://s3.amazonaws.com/iexplore_web/images/assets/000/005/358/original/dreamstime_m_50545156.jpg?1442002281" }
  ],
  "Antarctica": []
};

// ... (ส่วน TOP_LOCATIONS, Interfaces, MY_TRIPS, ITINERARIES, SAVED_PLACES คงเดิม) ...

export const TOP_LOCATIONS = [
  { id: 1, name: "Shibuya", location: "Tokyo, Japan", image: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=600&q=80", continent: "Asia" },
  { id: 2, name: "Victoria Harbour", location: "Tsim Sha Tsui, Hong Kong", image: "https://images.unsplash.com/photo-1506318137071-a8bcbf6755dd?w=600&q=80", continent: "Asia" },
  { id: 3, name: "Phi Phi Islands", location: "Krabi, Thailand", image: "https://images.unsplash.com/photo-1537956965359-357803990278?w=600&q=80", continent: "Asia" },
  { id: 4, name: "Eiffel Tower", location: "Paris, France", image: "https://images.unsplash.com/photo-1511739001486-6bfe10ce7859?w=600&q=80", continent: "Europe" },
];

export interface Attraction {
  id: number;
  name: string;
  kind: string;
  lat: number;
  lon: number;
  rating?: number;
  reviews?: number;
  image?: string; 
  wikidataId?: string;
  description?: string;
}

export interface UserProfile {
  name: string;
  email: string;
}

export interface Trip {
  id: number;
  title: string;
  date: string;
  flagImage: string;
  stats: {
    regions: number;
    places: number;
    photos: number;
  };
}

export const MY_TRIPS: Trip[] = [
  { 
    id: 1, 
    title: "My trip to Thailand", 
    date: "Today", 
    flagImage: "https://flagcdn.com/w320/th.png", 
    stats: { regions: 1, places: 1, photos: 0 } 
  },
  { 
    id: 2, 
    title: "USA 2023 ✈️", 
    date: "Last Month", 
    flagImage: "https://flagcdn.com/w320/us.png", 
    stats: { regions: 2, places: 5, photos: 12 } 
  },
  { 
    id: 3, 
    title: "Japan Adventure", 
    date: "Oct 2023", 
    flagImage: "https://flagcdn.com/w320/jp.png", 
    stats: { regions: 3, places: 15, photos: 42 } 
  }
];

export const ITINERARIES = [
  {
    id: 1,
    title: "Summer in Santorini",
    date: "10-20 Dec 2025",
    status: "Upcoming",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80"
  }
];

export const SAVED_PLACES = [
  {
    id: 1,
    name: "Colosseum",
    location: "Rome, Italy",
    type: "Landmark",
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80"
  },
  {
    id: 2,
    name: "Arabica Kyoto",
    location: "Kyoto, Japan",
    type: "Café",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80"
  }
];