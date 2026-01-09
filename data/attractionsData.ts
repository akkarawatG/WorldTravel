// data/attractionsData.ts

// 1. เพิ่ม Interface สำหรับ Review
export interface Review {
  id: number | string;
  name: string;
  avatar: string;
  date: string;
  rating: number;
  comment: string;
  images: string[];
}

export interface Attraction {
  id: string;
  name: string;
  search_query: string;
  location: {
    continent: string;
    country: string;
    province_state: string;
    lat: number;
    lon: number;
  };
  price_detail?: string;
  category_ids?: string[];
  category_tags?: string[];
  rating: number;
  review_count_approx: number;
  opening_hours_text: string;
  description_short: string;
  description_long: string;
  best_season_to_visit: string;
  images: {
    url: string;
    download_url?: string;
    photographer?: {
      name: string;
      username: string;
      profile_url: string;
    };
    alt_text?: string;
  }[];
  // 2. เพิ่ม field reviews เป็น optional
  reviews?: Review[]; 
}

export const ATTRACTIONS_DATA: Attraction[] = [
  // ... สถานที่อื่นๆ ...
  {
    "id": "grand-palace-wat-phra-kaeo-bangkok",
    "name": "Grand Palace & Wat Phra Kaeo (Temple of the Emerald Buddha)",
    "search_query": "Grand Palace Wat Phra Kaeo Bangkok",
    "location": {
      "continent": "Asia",
      "country": "Thailand",
      "province_state": "Bangkok",
      "lat": 13.75,
      "lon": 100.4917
    },
    "category_ids": [
      "history_culture",
      "landmarks_sightseeing"
    ],
    "category_tags": [
      "palaces_castles",
      "temples_shrines",
      "monuments"
    ],
    "rating": 4.7,
    "review_count_approx": 150000,
    "opening_hours_text": "Daily 08:30 - 15:30",
    "description_short": "A majestic complex housing royal residences and the revered Temple of the Emerald Buddha.",
    "description_long": "The Grand Palace, a former residence of Thai kings, is a sprawling complex of magnificent buildings. It also contains Wat Phra Kaeo, home to the highly revered Emerald Buddha statue, making it a spiritual and architectural marvel.",
    "best_season_to_visit": "Nov-Feb",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1679341778859-ed9a630b36c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwxfHxHcmFuZCUyMFBhbGFjZSUyMFdhdCUyMFBocmElMjBLYWVvJTIwQmFuZ2tva3xlbnwxfDB8fHwxNzY1MTg3MDc5fDA&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/QFWKkKKayLM/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwxfHxHcmFuZCUyMFBhbGFjZSUyMFdhdCUyMFBocmElMjBLYWVvJTIwQmFuZ2tva3xlbnwxfDB8fHwxNzY1MTg3MDc5fDA",
        "photographer": {
          "name": "Noppon Meenuch",
          "username": "noppon_me",
          "profile_url": "https://unsplash.com/@noppon_me?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "a large white wall with a building in the background"
      },
      {
        "url": "https://images.unsplash.com/photo-1703508202823-9b3648ca4f18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwyfHxHcmFuZCUyMFBhbGFjZSUyMFdhdCUyMFBocmElMjBLYWVvJTIwQmFuZ2tva3xlbnwxfDB8fHwxNzY1MTg3MDc5fDA&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/TYjwUfee8ks/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwyfHxHcmFuZCUyMFBhbGFjZSUyMFdhdCUyMFBocmElMjBLYWVvJTIwQmFuZ2tva3xlbnwxfDB8fHwxNzY1MTg3MDc5fDA",
        "photographer": {
          "name": "Jayanth Muppaneni",
          "username": "jay_5",
          "profile_url": "https://unsplash.com/@jay_5?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "a large white building with a blue vase in front of it"
      },
      {
        "url": "https://images.unsplash.com/photo-1763654662352-aa3b7fc97332?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwzfHxHcmFuZCUyMFBhbGFjZSUyMFdhdCUyMFBocmElMjBLYWVvJTIwQmFuZ2tva3xlbnwxfDB8fHwxNzY1MTg3MDc5fDA&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/2vrMeWxbOec/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwzfHxHcmFuZCUyMFBhbGFjZSUyMFdhdCUyMFBocmElMjBLYWVvJTIwQmFuZ2tva3xlbnwxfDB8fHwxNzY1MTg3MDc5fDA",
        "photographer": {
          "name": "Rowan Heuvel",
          "username": "insolitus",
          "profile_url": "https://unsplash.com/@insolitus?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "Ornate thai temple architecture with golden accents"
      }
    ],
    // 3. เพิ่มข้อมูล Reviews ตรงนี้
    "reviews": [
      {
        "id": 1,
        "name": "Elara Winter",
        "avatar": "https://i.pravatar.cc/150?u=elara",
        "date": "18 November 2025",
        "rating": 5,
        "comment": "It's really nice attraction place to visit and learn how they build up prasat. It's amazing.",
        "images": [
          "https://images.unsplash.com/photo-1590623329972-7313098e9862?w=200&h=200&fit=crop",
          "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=200&h=200&fit=crop",
          "https://images.unsplash.com/photo-1598226462723-149b089c2c89?w=200&h=200&fit=crop",
          "https://images.unsplash.com/photo-1528181304800-259b08848526?w=200&h=200&fit=crop"
        ]
      },
      {
        "id": 2,
        "name": "Seraphina",
        "avatar": "https://i.pravatar.cc/150?u=seraphina",
        "date": "28 February 2025",
        "rating": 4,
        "comment": "Prasart Muang Singh is a well preserved historical site. The walls built around two Khmer ruins with vast ground has been well maintained. For visitor that had been through Angkor Wat, this site is relatively small in comparison. However this site remind us the influence of Khmer throughout the region. The whole visit took us about an hour.",
        "images": [
          "https://images.unsplash.com/photo-1629202029707-422409743949?w=200&h=200&fit=crop",
          "https://images.unsplash.com/photo-1599557347353-7319c5c96035?w=200&h=200&fit=crop",
          "https://images.unsplash.com/photo-1558277259-724e8677c726?w=200&h=200&fit=crop",
          "https://images.unsplash.com/photo-1510525009512-ad7fc13eefab?w=200&h=200&fit=crop"
        ]
      },
      {
        "id": 3,
        "name": "Jaxon Reed",
        "avatar": "https://i.pravatar.cc/150?u=jaxon",
        "date": "4 June 2025",
        "rating": 4,
        "comment": "This place was a ruined historical site. Nice to looking at and take some pictures. It was a good stop for 20 mins.",
        "images": [
          "https://images.unsplash.com/photo-1594900742523-939446263096?w=200&h=200&fit=crop",
          "https://images.unsplash.com/photo-1602167727027-e436894be690?w=200&h=200&fit=crop",
          "https://images.unsplash.com/photo-1579979350324-4903332c0c7f?w=200&h=200&fit=crop",
          "https://images.unsplash.com/photo-1523525203375-349079933222?w=200&h=200&fit=crop"
        ]
      }
    ]
  },
  {
    "id": "wat-arun-bangkok",
    "name": "Wat Arun Ratchawararam Ratchawararam Woramahawihan (Temple of Dawn)",
    "search_query": "Wat Arun Temple Dawn Bangkok",
    "location": {
      "continent": "Asia",
      "country": "Thailand",
      "province_state": "Bangkok",
      "lat": 13.745,
      "lon": 100.489
    },
    "category_ids": [
      "history_culture",
      "landmarks_sightseeing"
    ],
    "category_tags": [
      "temples_shrines",
      "monuments",
      "viewpoints"
    ],
    "rating": 4.6,
    "review_count_approx": 120000,
    "opening_hours_text": "Daily 08:00 - 18:00",
    "description_short": "Iconic riverside temple with a stunning prang, especially beautiful at sunrise or sunset.",
    "description_long": "Wat Arun, known as the Temple of Dawn, is a striking landmark on the Chao Phraya River. Its central prang (tower) is adorned with colorful porcelain and seashells, offering breathtaking views from its upper levels.",
    "best_season_to_visit": "Nov-Feb",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1694824995159-2093477bc337?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwxfHxXYXQlMjBBcnVuJTIwVGVtcGxlJTIwRGF3biUyMEJhbmdrb2t8ZW58MXwwfHx8MTc2NTE4NzA4MXww&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/tXbS_0q8b8k/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwxfHxXYXQlMjBBcnVuJTIwVGVtcGxlJTIwRGF3biUyMEJhbmdrb2t8ZW58MXwwfHx8MTc2NTE4NzA4MXww",
        "photographer": {
          "name": "Jake 007",
          "username": "jake007",
          "profile_url": "https://unsplash.com/@jake007?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "a very tall tower sitting over a body of water"
      },
      {
        "url": "https://images.unsplash.com/photo-1553302254-49478fc2bb4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwyfHxXYXQlMjBBcnVuJTIwVGVtcGxlJTIwRGF3biUyMEJhbmdrb2t8ZW58MXwwfHx8MTc2NTE4NzA4MXww&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/SN6xDlNaGkg/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwyfHxXYXQlMjBBcnVuJTIwVGVtcGxlJTIwRGF3biUyMEJhbmdrb2t8ZW58MXwwfHx8MTc2NTE4NzA4MXww",
        "photographer": {
          "name": "vishnu roshan",
          "username": "vishnuroshan",
          "profile_url": "https://unsplash.com/@vishnuroshan?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "low-angle view of building under blue sky during daytime"
      },
      {
        "url": "https://images.unsplash.com/photo-1655815917186-76a5e56b58d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwzfHxXYXQlMjBBcnVuJTIwVGVtcGxlJTIwRGF3biUyMEJhbmdrb2t8ZW58MXwwfHx8MTc2NTE4NzA4MXww&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/uR6MUrhKoMY/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwzfHxXYXQlMjBBcnVuJTIwVGVtcGxlJTIwRGF3biUyMEJhbmdrb2t8ZW58MXwwfHx8MTc2NTE4NzA4MXww",
        "photographer": {
          "name": "Yada Pongsirirushakun",
          "username": "pangyadas",
          "profile_url": "https://unsplash.com/@pangyadas?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "a large building with pointy towers by a body of water with Wat Arun in the background"
      }
    ]
  },
  {
    "id": "wat-pho-bangkok",
    "name": "Wat Pho (Temple of the Reclining Buddha)",
    "search_query": "Wat Pho Reclining Buddha Bangkok",
    "location": {
      "continent": "Asia",
      "country": "Thailand",
      "province_state": "Bangkok",
      "lat": 13.7467,
      "lon": 100.4937
    },
    "category_ids": [
      "history_culture",
      "entertainment"
    ],
    "category_tags": [
      "temples_shrines",
      "spas_wellness"
    ],
    "rating": 4.6,
    "review_count_approx": 100000,
    "opening_hours_text": "Daily 08:00 - 18:30",
    "description_short": "Home to the massive, gold-plated Reclining Buddha and a renowned traditional Thai massage school.",
    "description_long": "Wat Pho is one of Bangkok's oldest and largest temples, famous for its 46-meter-long Reclining Buddha statue. It's also considered the birthplace of traditional Thai massage, offering a unique cultural and wellness experience.",
    "best_season_to_visit": "Nov-Feb",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1650021858406-3222764ea1f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwxfHxXYXQlMjBQaG8lMjBSZWNsaW5pbmclMjBCdWRkaGElMjBCYW5na29rfGVufDF8MHx8fDE3NjUxODcwODR8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/WiHGT3eD7L4/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwxfHxXYXQlMjBQaG8lMjBSZWNsaW5pbmclMjBCdWRkaGElMjBCYW5na29rfGVufDF8MHx8fDE3NjUxODcwODR8MA",
        "photographer": {
          "name": "Mario La Pergola",
          "username": "mlapergolaphoto",
          "profile_url": "https://unsplash.com/@mlapergolaphoto?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "a golden buddha statue sitting in front of a wall"
      },
      {
        "url": "https://images.unsplash.com/photo-1596427982570-bed3b9798c57?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwyfHxXYXQlMjBQaG8lMjBSZWNsaW5pbmclMjBCdWRkaGElMjBCYW5na29rfGVufDF8MHx8fDE3NjUxODcwODR8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/Z9pWf5NK4fY/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwyfHxXYXQlMjBQaG8lMjBSZWNsaW5pbmclMjBCdWRkaGElMjBCYW5na29rfGVufDF8MHx8fDE3NjUxODcwODR8MA",
        "photographer": {
          "name": "Ratt Y.",
          "username": "ratt_snapper",
          "profile_url": "https://unsplash.com/@ratt_snapper?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "gold concrete building during daytime"
      },
      {
        "url": "https://images.unsplash.com/photo-1603247041523-de001bbc440c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwzfHxXYXQlMjBQaG8lMjBSZWNsaW5pbmclMjBCdWRkaGElMjBCYW5na29rfGVufDF8MHx8fDE3NjUxODcwODR8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/AC26ZP1TMgQ/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwzfHxXYXQlMjBQaG8lMjBSZWNsaW5pbmclMjBCdWRkaGElMjBCYW5na29rfGVufDF8MHx8fDE3NjUxODcwODR8MA",
        "photographer": {
          "name": "John Thomas",
          "username": "capturelight",
          "profile_url": "https://unsplash.com/@capturelight?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "people in white shirt standing near gold temple during daytime"
      }
    ]
  },
  {
    "id": "phi-phi-islands",
    "name": "Phi Phi Islands",
    "search_query": "Phi Phi Islands Thailand",
    "location": {
      "continent": "Asia",
      "country": "Thailand",
      "province_state": "Krabi",
      "lat": 7.74,
      "lon": 98.77
    },
    "category_ids": [
      "nature_outdoors",
      "landmarks_sightseeing"
    ],
    "category_tags": [
      "beaches_islands",
      "viewpoints"
    ],
    "rating": 4.7,
    "review_count_approx": 180000,
    "opening_hours_text": "24 Hours",
    "description_short": "A stunning archipelago known for its turquoise waters, dramatic limestone cliffs, and vibrant marine life.",
    "description_long": "The Phi Phi Islands are a group of six islands in Krabi province, famous for their pristine beaches, clear waters, and towering cliffs. They offer incredible opportunities for snorkeling, diving, and island hopping, including the iconic Maya Bay.",
    "best_season_to_visit": "Nov-Apr",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1688647291680-50a962b9c4e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwxfHxQaGklMjBQaGklMjBJc2xhbmRzJTIwVGhhaWxhbmR8ZW58MXwwfHx8MTc2NTE4NzA4Nnww&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/uJoHzT_qN1Y/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwxfHxQaGklMjBQaGklMjBJc2xhbmRzJTIwVGhhaWxhbmR8ZW58MXwwfHx8MTc2NTE4NzA4Nnww",
        "photographer": {
          "name": "Steven Watson",
          "username": "ottz0",
          "profile_url": "https://unsplash.com/@ottz0?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "a couple of boats sitting on top of a sandy beach"
      },
      {
        "url": "https://images.unsplash.com/photo-1688647291819-09e0d69a6af2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwyfHxQaGklMjBQaGklMjBJc2xhbmRzJTIwVGhhaWxhbmR8ZW58MXwwfHx8MTc2NTE4NzA4Nnww&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/aNcGLkprssw/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwyfHxQaGklMjBQaGklMjBJc2xhbmRzJTIwVGhhaWxhbmR8ZW58MXwwfHx8MTc2NTE4NzA4Nnww",
        "photographer": {
          "name": "Steven Watson",
          "username": "ottz0",
          "profile_url": "https://unsplash.com/@ottz0?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "a group of boats sitting on top of a sandy beach"
      },
      {
        "url": "https://images.unsplash.com/photo-1673627114507-1467a403df3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwzfHxQaGklMjBQaGklMjBJc2xhbmRzJTIwVGhhaWxhbmR8ZW58MXwwfHx8MTc2NTE4NzA4Nnww&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/xRw_N4Bgfos/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwzfHxQaGklMjBQaGklMjBJc2xhbmRzJTIwVGhhaWxhbmR8ZW58MXwwfHx8MTc2NTE4NzA4Nnww",
        "photographer": {
          "name": "Vaskar Sam",
          "username": "vaskar_sam",
          "profile_url": "https://unsplash.com/@vaskar_sam?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "a group of boats floating on top of a large body of water"
      }
    ]
  },
  {
    "id": "ayutthaya-historical-park",
    "name": "Ayutthaya Historical Park",
    "search_query": "Ayutthaya ancient ruins Thailand",
    "location": {
      "continent": "Asia",
      "country": "Thailand",
      "province_state": "Phra Nakhon Si Ayutthaya",
      "lat": 14.355,
      "lon": 100.569
    },
    "category_ids": [
      "history_culture",
      "landmarks_sightseeing"
    ],
    "category_tags": [
      "ancient_ruins",
      "historic_old_towns",
      "monuments"
    ],
    "rating": 4.6,
    "review_count_approx": 80000,
    "opening_hours_text": "Daily 08:00 - 18:00",
    "description_short": "Explore the magnificent ruins of the former capital of the Kingdom of Siam, a UNESCO World Heritage site.",
    "description_long": "Ayutthaya Historical Park preserves the remains of the second Siamese capital, founded in 1350. Visitors can wander among ancient temples, palaces, and Buddha statues, witnessing the grandeur of a bygone era.",
    "best_season_to_visit": "Nov-Feb",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1741138439419-26667e8d115e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwxfHxBeXV0dGhheWElMjBhbmNpZW50JTIwcnVpbnMlMjBUaGFpbGFuZHxlbnwxfDB8fHwxNzY1MTg3MDg5fDA&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/cGL482Ouw3k/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwxfHxBeXV0dGhheWElMjBhbmNpZW50JTIwcnVpbnMlMjBUaGFpbGFuZHxlbnwxfDB8fHwxNzY1MTg3MDg5fDA",
        "photographer": {
          "name": "Aleksei Zhivilov",
          "username": "bb009x",
          "profile_url": "https://unsplash.com/@bb009x?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "A headless buddha statue sits in ancient ruins."
      },
      {
        "url": "https://images.unsplash.com/photo-1626197798581-d35c41d9fa27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwyfHxBeXV0dGhheWElMjBhbmNpZW50JTIwcnVpbnMlMjBUaGFpbGFuZHxlbnwxfDB8fHwxNzY1MTg3MDg5fDA&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/Vckf0ZRaxmI/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwyfHxBeXV0dGhheWElMjBhbmNpZW50JTIwcnVpbnMlMjBUaGFpbGFuZHxlbnwxfDB8fHwxNzY1MTg3MDg5fDA",
        "photographer": {
          "name": "Albert Potjes",
          "username": "albertpotjes",
          "profile_url": "https://unsplash.com/@albertpotjes?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "man in white robe statue"
      },
      {
        "url": "https://images.unsplash.com/photo-1761466977759-3685c02d3bd2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwzfHxBeXV0dGhheWElMjBhbmNpZW50JTIwcnVpbnMlMjBUaGFpbGFuZHxlbnwxfDB8fHwxNzY1MTg3MDg5fDA&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/b9kYz_e5Ejk/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwzfHxBeXV0dGhheWElMjBhbmNpZW50JTIwcnVpbnMlMjBUaGFpbGFuZHxlbnwxfDB8fHwxNzY1MTg3MDg5fDA",
        "photographer": {
          "name": "Jeffrey Barr",
          "username": "jmbarr1",
          "profile_url": "https://unsplash.com/@jmbarr1?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "Ancient temple ruins under a cloudy sky"
      }
    ]
  },
  {
    "id": "railay-beach-krabi",
    "name": "Railay Beach",
    "search_query": "Railay Beach Krabi",
    "location": {
      "continent": "Asia",
      "country": "Thailand",
      "province_state": "Krabi",
      "lat": 8.013,
      "lon": 98.839
    },
    "category_ids": [
      "nature_outdoors",
      "landmarks_sightseeing"
    ],
    "category_tags": [
      "beaches_islands",
      "viewpoints"
    ],
    "rating": 4.7,
    "review_count_approx": 90000,
    "opening_hours_text": "24 Hours",
    "description_short": "Secluded peninsula accessible only by boat, famous for rock climbing, stunning beaches, and lush scenery.",
    "description_long": "Railay Beach is a breathtaking paradise known for its towering limestone karsts, white sand beaches, and crystal-clear waters. It's a world-renowned destination for rock climbers and offers serene relaxation for beach lovers.",
    "best_season_to_visit": "Nov-Apr",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1664543219977-ad362c2ec439?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwxfHxSYWlsYXklMjBCZWFjaCUyMEtyYWJpfGVufDF8MHx8fDE3NjUxODcwOTF8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/NPthvE8JpqA/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwxfHxSYWlsYXklMjBCZWFjaCUyMEtyYWJpfGVufDF8MHx8fDE3NjUxODcwOTF8MA",
        "photographer": {
          "name": "Steven Watson",
          "username": "ottz0",
          "profile_url": "https://unsplash.com/@ottz0?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "a boat in the water with Railay Beach in the background"
      },
      {
        "url": "https://images.unsplash.com/photo-1722483537740-2acc865a97ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwyfHxSYWlsYXklMjBCZWFjaCUyMEtyYWJpfGVufDF8MHx8fDE3NjUxODcwOTF8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/qpXVUE_4XH0/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwyfHxSYWlsYXklMjBCZWFjaCUyMEtyYWJpfGVufDF8MHx8fDE3NjUxODcwOTF8MA",
        "photographer": {
          "name": "Mike Anderson",
          "username": "anderson_mike",
          "profile_url": "https://unsplash.com/@anderson_mike?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "A group of three boats sitting on top of a beach"
      },
      {
        "url": "https://images.unsplash.com/photo-1729707691077-b2a567af72bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwzfHxSYWlsYXklMjBCZWFjaCUyMEtyYWJpfGVufDF8MHx8fDE3NjUxODcwOTF8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/IY26_XliyPw/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwzfHxSYWlsYXklMjBCZWFjaCUyMEtyYWJpfGVufDF8MHx8fDE3NjUxODcwOTF8MA",
        "photographer": {
          "name": "Antonio Araujo",
          "username": "antonioaaaraujo",
          "profile_url": "https://unsplash.com/@antonioaaaraujo?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "An aerial view of a beach with a boat in the water"
      }
    ]
  },
  {
    "id": "wat-phra-that-doi-suthep-chiang-mai",
    "name": "Wat Phra That Doi Suthep",
    "search_query": "Wat Doi Suthep Chiang Mai",
    "location": {
      "continent": "Asia",
      "country": "Thailand",
      "province_state": "Chiang Mai",
      "lat": 18.8037,
      "lon": 98.9213
    },
    "category_ids": [
      "history_culture",
      "landmarks_sightseeing"
    ],
    "category_tags": [
      "temples_shrines",
      "viewpoints"
    ],
    "rating": 4.7,
    "review_count_approx": 70000,
    "opening_hours_text": "Daily 06:00 - 18:00",
    "description_short": "A sacred temple perched atop Doi Suthep mountain, offering panoramic views of Chiang Mai.",
    "description_long": "Wat Phra That Doi Suthep is one of northern Thailand's most revered temples, featuring a magnificent gold-plated chedi. Visitors can climb over 300 steps to reach the summit, rewarded with stunning cityscapes and spiritual tranquility.",
    "best_season_to_visit": "Nov-Feb",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1655731734597-7019eab2ebbb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwxfHxXYXQlMjBEb2klMjBTdXRoZXAlMjBDaGlhbmclMjBNYWl8ZW58MXwwfHx8MTc2NTE4NzA5NHww&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/0CDm_lOjFHc/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwxfHxXYXQlMjBEb2klMjBTdXRoZXAlMjBDaGlhbmclMjBNYWl8ZW58MXwwfHx8MTc2NTE4NzA5NHww",
        "photographer": {
          "name": "Bunly Hort",
          "username": "bunly1998",
          "profile_url": "https://unsplash.com/@bunly1998?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "a street sign with a couple of people riding motorcycles"
      },
      {
        "url": "https://images.unsplash.com/photo-1646451098778-9bd27584227e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwyfHxXYXQlMjBEb2klMjBTdXRoZXAlMjBDaGlhbmclMjBNYWl8ZW58MXwwfHx8MTc2NTE4NzA5NHww&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/IMKuwK3rNN8/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwyfHxXYXQlMjBEb2klMjBTdXRoZXAlMjBDaGlhbmclMjBNYWl8ZW58MXwwfHx8MTc2NTE4NzA5NHww",
        "photographer": {
          "name": "Markus Winkler",
          "username": "markuswinkler",
          "profile_url": "https://unsplash.com/@markuswinkler?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "a yellow and blue sign hanging from the side of a building"
      },
      {
        "url": "https://images.unsplash.com/photo-1708885820142-f48f4c3fc1b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwzfHxXYXQlMjBEb2klMjBTdXRoZXAlMjBDaGlhbmclMjBNYWl8ZW58MXwwfHx8MTc2NTE4NzA5NHww&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/aoRY_1qig1k/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwzfHxXYXQlMjBEb2klMjBTdXRoZXAlMjBDaGlhbmclMjBNYWl8ZW58MXwwfHx8MTc2NTE4NzA5NHww",
        "photographer": {
          "name": "Nopparuj Lamaikul",
          "username": "center999",
          "profile_url": "https://unsplash.com/@center999?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "a field of flowers with a statue in the background"
      }
    ]
  },
  {
    "id": "sukhothai-historical-park",
    "name": "Sukhothai Historical Park",
    "search_query": "Sukhothai ancient ruins Thailand",
    "location": {
      "continent": "Asia",
      "country": "Thailand",
      "province_state": "Sukhothai",
      "lat": 17.02,
      "lon": 99.7
    },
    "category_ids": [
      "history_culture",
      "landmarks_sightseeing"
    ],
    "category_tags": [
      "ancient_ruins",
      "historic_old_towns",
      "monuments"
    ],
    "rating": 4.7,
    "review_count_approx": 50000,
    "opening_hours_text": "Daily 06:30 - 19:30",
    "description_short": "UNESCO World Heritage site showcasing the elegant ruins of the first capital of the Sukhothai Kingdom.",
    "description_long": "Sukhothai Historical Park is an archaeological site preserving the remains of the 13th and 14th-century Sukhothai Kingdom. It features impressive temples, Buddha statues, and ponds, best explored by bicycle.",
    "best_season_to_visit": "Nov-Feb",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1503933096761-e89d01ec3704?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwxfHxTdWtob3RoYWklMjBhbmNpZW50JTIwcnVpbnMlMjBUaGFpbGFuZHxlbnwxfDB8fHwxNzY1MTg3MDk2fDA&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/o6pYhLtlecw/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwxfHxTdWtob3RoYWklMjBhbmNpZW50JTIwcnVpbnMlMjBUaGFpbGFuZHxlbnwxfDB8fHwxNzY1MTg3MDk2fDA",
        "photographer": {
          "name": "Mathew Schwartz",
          "username": "cadop",
          "profile_url": "https://unsplash.com/@cadop?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "panoramic photography of brown cone shaped building surrounded by trees"
      },
      {
        "url": "https://images.unsplash.com/photo-1616031744063-cee8249c542d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwyfHxTdWtob3RoYWklMjBhbmNpZW50JTIwcnVpbnMlMjBUaGFpbGFuZHxlbnwxfDB8fHwxNzY1MTg3MDk2fDA&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/Bd7PS3WOsag/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwyfHxTdWtob3RoYWklMjBhbmNpZW50JTIwcnVpbnMlMjBUaGFpbGFuZHxlbnwxfDB8fHwxNzY1MTg3MDk2fDA",
        "photographer": {
          "name": "Alice",
          "username": "thewonderalice",
          "profile_url": "https://unsplash.com/@thewonderalice?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "people walking on brown concrete temple during daytime"
      },
      {
        "url": "https://images.unsplash.com/photo-1636358925227-a725a3e956a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwzfHxTdWtob3RoYWklMjBhbmNpZW50JTIwcnVpbnMlMjBUaGFpbGFuZHxlbnwxfDB8fHwxNzY1MTg3MDk2fDA&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/UI_QTyVr8-c/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwzfHxTdWtob3RoYWklMjBhbmNpZW50JTIwcnVpbnMlMjBUaGFpbGFuZHxlbnwxfDB8fHwxNzY1MTg3MDk2fDA",
        "photographer": {
          "name": "József Szabó",
          "username": "nil_foto",
          "profile_url": "https://unsplash.com/@nil_foto?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "a group of buddha statues sitting next to each other"
      }
    ]
  },
  {
    "id": "james-bond-island-phang-nga",
    "name": "James Bond Island (Khao Phing Kan)",
    "search_query": "James Bond Island Phang Nga",
    "location": {
      "continent": "Asia",
      "country": "Thailand",
      "province_state": "Phang Nga",
      "lat": 8.275,
      "lon": 98.496
    },
    "category_ids": [
      "nature_outdoors",
      "landmarks_sightseeing"
    ],
    "category_tags": [
      "beaches_islands",
      "viewpoints",
      "landmarks"
    ],
    "rating": 4.4,
    "review_count_approx": 60000,
    "opening_hours_text": "Daily 08:00 - 17:00",
    "description_short": "Famous limestone karst island featured in \"The Man with the Golden Gun,\" a popular photo spot.",
    "description_long": "Khao Phing Kan, popularly known as James Bond Island, is a distinctive limestone rock formation in Phang Nga Bay. Its unique shape and cinematic history make it a must-visit destination for boat tours.",
    "best_season_to_visit": "Nov-Apr",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1682517164517-90f56a89743b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwxfHxKYW1lcyUyMEJvbmQlMjBJc2xhbmQlMjBQaGFuZyUyME5nYXxlbnwxfDB8fHwxNzY1MTg3MDk5fDA&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/9mhfEEjKIm8/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwxfHxKYW1lcyUyMEJvbmQlMjBJc2xhbmQlMjBQaGFuZyUyME5nYXxlbnwxfDB8fHwxNzY1MTg3MDk5fDA",
        "photographer": {
          "name": "Martti Salmi",
          "username": "marttisalmi",
          "profile_url": "https://unsplash.com/@marttisalmi?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "A body of water surrounded by trees and rocks"
      },
      {
        "url": "https://images.unsplash.com/photo-1735228043914-09ed81c15480?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwyfHxKYW1lcyUyMEJvbmQlMjBJc2xhbmQlMjBQaGFuZyUyME5nYXxlbnwxfDB8fHwxNzY1MTg3MDk5fDA&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/A4UIUSVZajE/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwyfHxKYW1lcyUyMEJvbmQlMjBJc2xhbmQlMjBQaGFuZyUyME5nYXxlbnwxfDB8fHwxNzY1MTg3MDk5fDA",
        "photographer": {
          "name": "Gergana Ivanova",
          "username": "geri_ivanova",
          "profile_url": "https://unsplash.com/@geri_ivanova?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "A body of water surrounded by mountains and trees"
      },
      {
        "url": "https://images.unsplash.com/photo-1545153976-5d451256a9a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwzfHxKYW1lcyUyMEJvbmQlMjBJc2xhbmQlMjBQaGFuZyUyME5nYXxlbnwxfDB8fHwxNzY1MTg3MDk5fDA&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/ycduJobBI24/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwzfHxKYW1lcyUyMEJvbmQlMjBJc2xhbmQlMjBQaGFuZyUyME5nYXxlbnwxfDB8fHwxNzY1MTg3MDk5fDA",
        "photographer": {
          "name": "Stephen Cook",
          "username": "_stephencook",
          "profile_url": "https://unsplash.com/@_stephencook?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "boy on boat"
      }
    ]
  },
  {
    "id": "chatuchak-weekend-market-bangkok",
    "name": "Chatuchak Weekend Market",
    "search_query": "Chatuchak Weekend Market Bangkok",
    "location": {
      "continent": "Asia",
      "country": "Thailand",
      "province_state": "Bangkok",
      "lat": 13.8,
      "lon": 100.55
    },
    "category_ids": [
      "shopping_lifestyle",
      "food_dining"
    ],
    "category_tags": [
      "local_markets",
      "flea_markets",
      "street_food"
    ],
    "rating": 4.4,
    "review_count_approx": 70000,
    "opening_hours_text": "Sat-Sun 09:00 - 18:00 (some sections Fri evening)",
    "description_short": "One of the world's largest weekend markets, offering an incredible array of goods and street food.",
    "description_long": "Chatuchak Weekend Market is a sprawling labyrinth of over 15,000 stalls, selling everything from clothing and antiques to pets and plants. It's a vibrant hub for shopping, eating, and experiencing local culture.",
    "best_season_to_visit": "Nov-Feb",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1696437492959-b9a8c37df4ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwxfHxDaGF0dWNoYWslMjBXZWVrZW5kJTIwTWFya2V0JTIwQmFuZ2tva3xlbnwxfDB8fHwxNzY1MTg3MTAxfDA&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/U-3htalA93w/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwxfHxDaGF0dWNoYWslMjBXZWVrZW5kJTIwTWFya2V0JTIwQmFuZ2tva3xlbnwxfDB8fHwxNzY1MTg3MTAxfDA",
        "photographer": {
          "name": "Pikacent",
          "username": "pikacent",
          "profile_url": "https://unsplash.com/@pikacent?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "a street sign in a foreign language in front of a building"
      },
      {
        "url": "https://images.unsplash.com/photo-1668589345920-26ebf7facbfc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwyfHxDaGF0dWNoYWslMjBXZWVrZW5kJTIwTWFya2V0JTIwQmFuZ2tva3xlbnwxfDB8fHwxNzY1MTg3MTAxfDA&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/hTMnPNnZc2I/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwyfHxDaGF0dWNoYWslMjBXZWVrZW5kJTIwTWFya2V0JTIwQmFuZ2tva3xlbnwxfDB8fHwxNzY1MTg3MTAxfDA",
        "photographer": {
          "name": "Lucas T.",
          "username": "lbob",
          "profile_url": "https://unsplash.com/@lbob?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "a group of people standing outside a building"
      },
      {
        "url": "https://images.unsplash.com/photo-1668589425978-81089ef9de64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwzfHxDaGF0dWNoYWslMjBXZWVrZW5kJTIwTWFya2V0JTIwQmFuZ2tva3xlbnwxfDB8fHwxNzY1MTg3MTAxfDA&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/lT5B2vANpgw/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwzfHxDaGF0dWNoYWslMjBXZWVrZW5kJTIwTWFya2V0JTIwQmFuZ2tva3xlbnwxfDB8fHwxNzY1MTg3MTAxfDA",
        "photographer": {
          "name": "Lucas T.",
          "username": "lbob",
          "profile_url": "https://unsplash.com/@lbob?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "a store with clothes"
      }
    ]
  },
  {
    "id": "big-buddha-phuket",
    "name": "Phra Phutthamingkhon Ake Nakkhiri (Big Buddha Phuket)",
    "search_query": "Big Buddha Phuket",
    "location": {
      "continent": "Asia",
      "country": "Thailand",
      "province_state": "Phuket",
      "lat": 7.827,
      "lon": 98.312
    },
    "category_ids": [
      "history_culture",
      "landmarks_sightseeing"
    ],
    "category_tags": [
      "monuments",
      "viewpoints"
    ],
    "rating": 4.7,
    "review_count_approx": 60000,
    "opening_hours_text": "Daily 06:00 - 19:00",
    "description_short": "A towering white marble Buddha statue offering breathtaking 360-degree views of Phuket.",
    "description_long": "Perched atop Nakkerd Hill, the Big Buddha is a 45-meter-tall statue visible from much of southern Phuket. It's a significant religious site and a popular viewpoint, providing panoramic vistas of the island and Andaman Sea.",
    "best_season_to_visit": "Nov-Apr",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1577375837944-47617314bfd9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwxfHxCaWclMjBCdWRkaGElMjBQaHVrZXR8ZW58MXwwfHx8MTc2NTE4NzEwNHww&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/kHewWLGsPfA/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwxfHxCaWclMjBCdWRkaGElMjBQaHVrZXR8ZW58MXwwfHx8MTc2NTE4NzEwNHww",
        "photographer": {
          "name": "Syed Ahmad",
          "username": "syedabsarahmad",
          "profile_url": "https://unsplash.com/@syedabsarahmad?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "Buddha statue"
      },
      {
        "url": "https://images.unsplash.com/photo-1586820672103-2272d8490ade?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwyfHxCaWclMjBCdWRkaGElMjBQaHVrZXR8ZW58MXwwfHx8MTc2NTE4NzEwNHww&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/xFOKUJgpQoU/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwyfHxCaWclMjBCdWRkaGElMjBQaHVrZXR8ZW58MXwwfHx8MTc2NTE4NzEwNHww",
        "photographer": {
          "name": "Miltiadis Fragkidis",
          "username": "_miltiadis_",
          "profile_url": "https://unsplash.com/@_miltiadis_?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "gray concrete statue near green trees during daytime"
      },
      {
        "url": "https://images.unsplash.com/photo-1687510015486-c4b7cc992e79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwzfHxCaWclMjBCdWRkaGElMjBQaHVrZXR8ZW58MXwwfHx8MTc2NTE4NzEwNHww&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/sNbUOsX-c5s/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwzfHxCaWclMjBCdWRkaGElMjBQaHVrZXR8ZW58MXwwfHx8MTc2NTE4NzEwNHww",
        "photographer": {
          "name": "Sadiq Ahmad",
          "username": "dearsadiq",
          "profile_url": "https://unsplash.com/@dearsadiq?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "a large buddha statue sitting under a cloudy blue sky"
      }
    ]
  },
  {
    "id": "chiang-mai-night-bazaar",
    "name": "Chiang Mai Night Bazaar",
    "search_query": "Chiang Mai Night Bazaar",
    "location": {
      "continent": "Asia",
      "country": "Thailand",
      "province_state": "Chiang Mai",
      "lat": 18.787,
      "lon": 99
    },
    "category_ids": [
      "shopping_lifestyle",
      "food_dining",
      "entertainment"
    ],
    "category_tags": [
      "night_markets",
      "local_markets",
      "street_food",
      "nightlife"
    ],
    "rating": 4.2,
    "review_count_approx": 55000,
    "opening_hours_text": "Daily 18:00 - 23:00",
    "description_short": "Bustling evening market offering handicrafts, souvenirs, clothing, and delicious street food.",
    "description_long": "The Chiang Mai Night Bazaar is a famous nightly market stretching along Chang Klan Road. It's a lively spot for souvenir hunting, enjoying local delicacies, and soaking in the vibrant atmosphere of northern Thailand.",
    "best_season_to_visit": "Nov-Feb",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1725107179577-27983a9de258?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwxfHxDaGlhbmclMjBNYWklMjBOaWdodCUyMEJhemFhcnxlbnwxfDB8fHwxNzY1MTg3MTA3fDA&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/w6c4B7ttd_0/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwxfHxDaGlhbmclMjBNYWklMjBOaWdodCUyMEJhemFhcnxlbnwxfDB8fHwxNzY1MTg3MTA3fDA",
        "photographer": {
          "name": "Nat Weerawong",
          "username": "nathadej",
          "profile_url": "https://unsplash.com/@nathadej?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "A group of people standing in front of a building"
      },
      {
        "url": "https://images.unsplash.com/photo-1678393068699-0b8244331660?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwyfHxDaGlhbmclMjBNYWklMjBOaWdodCUyMEJhemFhcnxlbnwxfDB8fHwxNzY1MTg3MTA3fDA&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/jTJJKzDOs_A/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwyfHxDaGlhbmclMjBNYWklMjBOaWdodCUyMEJhemFhcnxlbnwxfDB8fHwxNzY1MTg3MTA3fDA",
        "photographer": {
          "name": "Gaurav Bagdi",
          "username": "dfyngrvty",
          "profile_url": "https://unsplash.com/@dfyngrvty?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "a group of people standing outside of a building at night"
      },
      {
        "url": "https://images.unsplash.com/photo-1646850150750-daa2ee138999?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwzfHxDaGlhbmclMjBNYWklMjBOaWdodCUyMEJhemFhcnxlbnwxfDB8fHwxNzY1MTg3MTA3fDA&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/NnlLzraAc7M/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwzfHxDaGlhbmclMjBNYWklMjBOaWdodCUyMEJhemFhcnxlbnwxfDB8fHwxNzY1MTg3MTA3fDA",
        "photographer": {
          "name": "Kittitep Khotchalee",
          "username": "duckman1992",
          "profile_url": "https://unsplash.com/@duckman1992?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "a group of people walking down a street next to a market"
      }
    ]
  },
  {
    "id": "damnoen-saduak-floating-market",
    "name": "Damnoen Saduak Floating Market",
    "search_query": "Damnoen Saduak floating market Thailand",
    "location": {
      "continent": "Asia",
      "country": "Thailand",
      "province_state": "Ratchaburi",
      "lat": 13.52,
      "lon": 99.96
    },
    "category_ids": [
      "shopping_lifestyle",
      "food_dining"
    ],
    "category_tags": [
      "floating_markets",
      "local_markets",
      "street_food"
    ],
    "rating": 3.9,
    "review_count_approx": 50000,
    "opening_hours_text": "Daily 07:00 - 12:00",
    "description_short": "Experience traditional Thai commerce as vendors sell goods from boats along narrow canals.",
    "description_long": "Damnoen Saduak is Thailand's most famous floating market, offering a vibrant glimpse into traditional Thai life. Visitors can take a boat ride to browse local produce, handicrafts, and delicious street food sold directly from vendor boats.",
    "best_season_to_visit": "Nov-Feb",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1736492090594-88f85f405da0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwxfHxEYW1ub2VuJTIwU2FkdWFrJTIwZmxvYXRpbmclMjBtYXJrZXQlMjBUaGFpbGFuZHxlbnwxfDB8fHwxNzY1MTg3MTA5fDA&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/o1GsK2kKDr4/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwxfHxEYW1ub2VuJTIwU2FkdWFrJTIwZmxvYXRpbmclMjBtYXJrZXQlMjBUaGFpbGFuZHxlbnwxfDB8fHwxNzY1MTg3MTA5fDA",
        "photographer": {
          "name": "Dimitar Meddling",
          "username": "dmeddling",
          "profile_url": "https://unsplash.com/@dmeddling?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "A woman sitting in a boat on a body of water"
      },
      {
        "url": "https://images.unsplash.com/photo-1642391326170-0ac7a62f2c14?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwyfHxEYW1ub2VuJTIwU2FkdWFrJTIwZmxvYXRpbmclMjBtYXJrZXQlMjBUaGFpbGFuZHxlbnwxfDB8fHwxNzY1MTg3MTA5fDA&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/t2ZcIzrYJt4/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwyfHxEYW1ub2VuJTIwU2FkdWFrJTIwZmxvYXRpbmclMjBtYXJrZXQlMjBUaGFpbGFuZHxlbnwxfDB8fHwxNzY1MTg3MTA5fDA",
        "photographer": {
          "name": "Norbert Braun",
          "username": "medion4you",
          "profile_url": "https://unsplash.com/@medion4you?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "a woman in a straw hat is serving food to another woman"
      },
      {
        "url": "https://images.unsplash.com/photo-1642391326157-5ec6935dd7c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwzfHxEYW1ub2VuJTIwU2FkdWFrJTIwZmxvYXRpbmclMjBtYXJrZXQlMjBUaGFpbGFuZHxlbnwxfDB8fHwxNzY1MTg3MTA5fDA&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/TIIBjPxozeo/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwzfHxEYW1ub2VuJTIwU2FkdWFrJTIwZmxvYXRpbmclMjBtYXJrZXQlMjBUaGFpbGFuZHxlbnwxfDB8fHwxNzY1MTg3MTA5fDA",
        "photographer": {
          "name": "Norbert Braun",
          "username": "medion4you",
          "profile_url": "https://unsplash.com/@medion4you?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "a person on a boat with some food"
      }
    ]
  },
  {
    "id": "erawan-falls-kanchanaburi",
    "name": "Erawan Falls",
    "search_query": "Erawan Falls Kanchanaburi",
    "location": {
      "continent": "Asia",
      "country": "Thailand",
      "province_state": "Kanchanaburi",
      "lat": 14.379,
      "lon": 99.143
    },
    "category_ids": [
      "nature_outdoors"
    ],
    "category_tags": [
      "waterfalls",
      "national_parks"
    ],
    "rating": 4.7,
    "review_count_approx": 45000,
    "opening_hours_text": "Daily 08:00 - 16:30",
    "description_short": "A magnificent seven-tiered waterfall cascading through lush jungle, perfect for swimming and hiking.",
    "description_long": "Located within Erawan National Park, this stunning waterfall boasts emerald green pools at each of its seven levels. Visitors can hike up the tiers, swim in the natural pools, and enjoy the surrounding rainforest.",
    "best_season_to_visit": "Nov-Feb",
    "images": []
  },
  {
    "id": "elephant-nature-park-chiang-mai",
    "name": "Elephant Nature Park",
    "search_query": "Elephant Nature Park Chiang Mai",
    "location": {
      "continent": "Asia",
      "country": "Thailand",
      "province_state": "Chiang Mai",
      "lat": 19.1,
      "lon": 99.03
    },
    "category_ids": [
      "entertainment",
      "nature_outdoors"
    ],
    "category_tags": [
      "zoos_aquariums",
      "national_parks"
    ],
    "rating": 4.9,
    "review_count_approx": 40000,
    "opening_hours_text": "Daily 08:00 - 17:00 (booking required)",
    "description_short": "An ethical elephant sanctuary dedicated to rescuing and rehabilitating elephants, offering interactive experiences.",
    "description_long": "Elephant Nature Park is a renowned rescue and rehabilitation center for elephants and other animals. Visitors can observe and interact with these gentle giants in a natural and respectful environment, learning about their conservation.",
    "best_season_to_visit": "Nov-Feb",
    "images": [{
      "url": "https://thailandstartshere.com/wp-content/uploads/2023/01/Chiang-Mai-Elephants.jpeg",
      "download_url": "https://thailandstartshere.com/wp-content/uploads/2023/01/Chiang-Mai-Elephants.jpeg",
      "photographer": {
        "name": "",
        "username": "stellaweis_destinationart",
        "profile_url": ""
      },
      "alt_text": ""
    },
    {
      "url": "https://www.elephantnaturepark.org/enp/images/elephant%20sanctuary/Half-Day-Morning-project.jpg",
      "download_url": "https://www.elephantnaturepark.org/enp/images/elephant%20sanctuary/Half-Day-Morning-project.jpg",
      "photographer": {
        "name": "",
        "username": "stellaweis_destinationart",
        "profile_url": ""
      },
      "alt_text": ""
    }
  ]
  },
  {
    "id": "similan-islands",
    "name": "Similan Islands",
    "search_query": "Similan Islands Thailand",
    "location": {
      "continent": "Asia",
      "country": "Thailand",
      "province_state": "Phang Nga",
      "lat": 8.64,
      "lon": 97.64
    },
    "category_ids": [
      "nature_outdoors"
    ],
    "category_tags": [
      "beaches_islands"
    ],
    "rating": 4.8,
    "review_count_approx": 30000,
    "opening_hours_text": "Nov-May 08:00 - 17:00 (closed Jun-Oct)",
    "description_short": "A pristine archipelago renowned for its crystal-clear waters, vibrant coral reefs, and diverse marine life.",
    "description_long": "The Similan Islands are a protected national park, considered one of the world's top diving and snorkeling destinations. Its granite boulders, white sand beaches, and abundant underwater ecosystems attract nature lovers.",
    "best_season_to_visit": "Nov-Apr",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1656939210199-187ac72883a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwxfHxTaW1pbGFuJTIwSXNsYW5kcyUyMFRoYWlsYW5kfGVufDF8MHx8fDE3NjUxODcxMTZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/TBH5V_nkeTI/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwxfHxTaW1pbGFuJTIwSXNsYW5kcyUyMFRoYWlsYW5kfGVufDF8MHx8fDE3NjUxODcxMTZ8MA",
        "photographer": {
          "name": "Stella Weis",
          "username": "stellaweis_destinationart",
          "profile_url": "https://unsplash.com/@stellaweis_destinationart?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "a rocky shoreline with a boat in the water"
      },
      {
        "url": "https://images.unsplash.com/photo-1656939040419-62cb4526142e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwyfHxTaW1pbGFuJTIwSXNsYW5kcyUyMFRoYWlsYW5kfGVufDF8MHx8fDE3NjUxODcxMTZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/gNv4olVVimo/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwyfHxTaW1pbGFuJTIwSXNsYW5kcyUyMFRoYWlsYW5kfGVufDF8MHx8fDE3NjUxODcxMTZ8MA",
        "photographer": {
          "name": "Stella Weis",
          "username": "stellaweis_destinationart",
          "profile_url": "https://unsplash.com/@stellaweis_destinationart?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "a group of large rocks in the water"
      },
      {
        "url": "https://images.unsplash.com/photo-1656939214522-c7428f5e69bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwzfHxTaW1pbGFuJTIwSXNsYW5kcyUyMFRoYWlsYW5kfGVufDF8MHx8fDE3NjUxODcxMTZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/oASC_dGme2I/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwzfHxTaW1pbGFuJTIwSXNsYW5kcyUyMFRoYWlsYW5kfGVufDF8MHx8fDE3NjUxODcxMTZ8MA",
        "photographer": {
          "name": "Stella Weis",
          "username": "stellaweis_destinationart",
          "profile_url": "https://unsplash.com/@stellaweis_destinationart?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "a group of rocks in the water with Similan Islands in the background"
      }
    ]
  },
  {
    "id": "patong-beach-phuket",
    "name": "Patong Beach",
    "search_query": "Patong Beach Phuket",
    "location": {
      "continent": "Asia",
      "country": "Thailand",
      "province_state": "Phuket",
      "lat": 7.894,
      "lon": 98.295
    },
    "category_ids": [
      "nature_outdoors",
      "shopping_lifestyle",
      "entertainment"
    ],
    "category_tags": [
      "beaches_islands",
      "nightlife",
      "shopping_malls"
    ],
    "rating": 4,
    "review_count_approx": 65000,
    "opening_hours_text": "24 Hours",
    "description_short": "Phuket's most famous beach, known for its lively atmosphere, water sports, and vibrant nightlife.",
    "description_long": "Patong Beach is the heart of Phuket's tourism, offering a long stretch of sandy beach for sunbathing and swimming. Behind the beach, Bangla Road comes alive at night with bars, clubs, and entertainment venues.",
    "best_season_to_visit": "Nov-Apr",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1737516465408-c790ed3a78bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwxfHxQYXRvbmclMjBCZWFjaCUyMFBodWtldHxlbnwxfDB8fHwxNzY1MTg3MTE5fDA&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/yNH7orMyqUk/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwxfHxQYXRvbmclMjBCZWFjaCUyMFBodWtldHxlbnwxfDB8fHwxNzY1MTg3MTE5fDA",
        "photographer": {
          "name": "Max Bvp",
          "username": "maxbvp",
          "profile_url": "https://unsplash.com/@maxbvp?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "A scenic view of the ocean from a hill"
      },
      {
        "url": "https://images.unsplash.com/photo-1737515908858-546a6aba73ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwyfHxQYXRvbmclMjBCZWFjaCUyMFBodWtldHxlbnwxfDB8fHwxNzY1MTg3MTE5fDA&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/C7aB1ooIea8/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwyfHxQYXRvbmclMjBCZWFjaCUyMFBodWtldHxlbnwxfDB8fHwxNzY1MTg3MTE5fDA",
        "photographer": {
          "name": "Max Bvp",
          "username": "maxbvp",
          "profile_url": "https://unsplash.com/@maxbvp?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "A beach with a boat in the water"
      },
      {
        "url": "https://images.unsplash.com/photo-1737515908819-c4272f480f01?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwzfHxQYXRvbmclMjBCZWFjaCUyMFBodWtldHxlbnwxfDB8fHwxNzY1MTg3MTE5fDA&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/uSbz-GCD4JM/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwzfHxQYXRvbmclMjBCZWFjaCUyMFBodWtldHxlbnwxfDB8fHwxNzY1MTg3MTE5fDA",
        "photographer": {
          "name": "Max Bvp",
          "username": "maxbvp",
          "profile_url": "https://unsplash.com/@maxbvp?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "A group of people standing on top of a sandy beach"
      }
    ]
  },
  {
    "id": "bridge-over-river-kwai",
    "name": "Bridge over the River Kwai",
    "search_query": "Bridge River Kwai Kanchanaburi",
    "location": {
      "continent": "Asia",
      "country": "Thailand",
      "province_state": "Kanchanaburi",
      "lat": 14.04,
      "lon": 99.5
    },
    "category_ids": [
      "history_culture",
      "landmarks_sightseeing"
    ],
    "category_tags": [
      "monuments",
      "bridges"
    ],
    "rating": 4.3,
    "review_count_approx": 40000,
    "opening_hours_text": "Daily 08:00 - 18:00",
    "description_short": "Historic railway bridge, a poignant reminder of WWII, offering a glimpse into a dark past.",
    "description_long": "The Bridge over the River Kwai is a part of the infamous Death Railway, built by Allied POWs during WWII. It stands as a memorial to the thousands who perished, with a museum nearby detailing its tragic history.",
    "best_season_to_visit": "Nov-Feb",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1624806296367-33e24d6162ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwxfHxCcmlkZ2UlMjBSaXZlciUyMEt3YWklMjBLYW5jaGFuYWJ1cml8ZW58MXwwfHx8MTc2NTE4NzEyMXww&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/638tmoDMd88/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwxfHxCcmlkZ2UlMjBSaXZlciUyMEt3YWklMjBLYW5jaGFuYWJ1cml8ZW58MXwwfHx8MTc2NTE4NzEyMXww",
        "photographer": {
          "name": "Hata Life",
          "username": "hatalife",
          "profile_url": "https://unsplash.com/@hatalife?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "gray concrete bridge over river under blue sky during daytime"
      },
      {
        "url": "https://images.unsplash.com/photo-1613753090396-2feb5bb66273?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwyfHxCcmlkZ2UlMjBSaXZlciUyMEt3YWklMjBLYW5jaGFuYWJ1cml8ZW58MXwwfHx8MTc2NTE4NzEyMXww&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/GuWaBaFTWhs/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwyfHxCcmlkZ2UlMjBSaXZlciUyMEt3YWklMjBLYW5jaGFuYWJ1cml8ZW58MXwwfHx8MTc2NTE4NzEyMXww",
        "photographer": {
          "name": "Hata Life",
          "username": "hatalife",
          "profile_url": "https://unsplash.com/@hatalife?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "bridge over river under blue sky during daytime"
      },
      {
        "url": "https://images.unsplash.com/photo-1701877347534-332eedc11b67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwzfHxCcmlkZ2UlMjBSaXZlciUyMEt3YWklMjBLYW5jaGFuYWJ1cml8ZW58MXwwfHx8MTc2NTE4NzEyMXww&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/AnI_YekMaEU/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwzfHxCcmlkZ2UlMjBSaXZlciUyMEt3YWklMjBLYW5jaGFuYWJ1cml8ZW58MXwwfHx8MTc2NTE4NzEyMXww",
        "photographer": {
          "name": "Guus Gelsing",
          "username": "blackpoet91",
          "profile_url": "https://unsplash.com/@blackpoet91?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "a train traveling over a bridge next to a forest"
      }
    ]
  },
  {
    "id": "koh-lanta-krabi",
    "name": "Koh Lanta",
    "search_query": "Koh Lanta Thailand",
    "location": {
      "continent": "Asia",
      "country": "Thailand",
      "province_state": "Krabi",
      "lat": 7.55,
      "lon": 99.05
    },
    "category_ids": [
      "nature_outdoors",
      "shopping_lifestyle"
    ],
    "category_tags": [
      "beaches_islands",
      "local_markets"
    ],
    "rating": 4.5,
    "review_count_approx": 35000,
    "opening_hours_text": "24 Hours",
    "description_short": "Laid-back island paradise known for its long sandy beaches, clear waters, and relaxed atmosphere.",
    "description_long": "Koh Lanta offers a more tranquil alternative to busier Thai islands, with beautiful beaches, lush mangroves, and excellent diving spots. It's perfect for those seeking relaxation, natural beauty, and a slower pace of life.",
    "best_season_to_visit": "Nov-Apr",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1541077250662-c9cf17e37dde?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwxfHxLb2glMjBMYW50YSUyMFRoYWlsYW5kfGVufDF8MHx8fDE3NjUxODcxMjR8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/qe4NEapPPr8/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwxfHxLb2glMjBMYW50YSUyMFRoYWlsYW5kfGVufDF8MHx8fDE3NjUxODcxMjR8MA",
        "photographer": {
          "name": "YIYUN GE",
          "username": "evelyn205205",
          "profile_url": "https://unsplash.com/@evelyn205205?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "photography of ring tower with bell"
      },
      {
        "url": "https://images.unsplash.com/photo-1690445730813-117d44afa5b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwyfHxLb2glMjBMYW50YSUyMFRoYWlsYW5kfGVufDF8MHx8fDE3NjUxODcxMjR8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/LpQg_norD3w/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwyfHxLb2glMjBMYW50YSUyMFRoYWlsYW5kfGVufDF8MHx8fDE3NjUxODcxMjR8MA",
        "photographer": {
          "name": "Jacob Ekelund",
          "username": "jcbxndr",
          "profile_url": "https://unsplash.com/@jcbxndr?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "a light house on a hill surrounded by trees"
      },
      {
        "url": "https://images.unsplash.com/photo-1732568796206-148d9ea3b2e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwzfHxLb2glMjBMYW50YSUyMFRoYWlsYW5kfGVufDF8MHx8fDE3NjUxODcxMjR8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/KxfY0knruaQ/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwzfHxLb2glMjBMYW50YSUyMFRoYWlsYW5kfGVufDF8MHx8fDE3NjUxODcxMjR8MA",
        "photographer": {
          "name": "Hendrik",
          "username": "premotion",
          "profile_url": "https://unsplash.com/@premotion?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "A sandy beach with a light house in the distance"
      }
    ]
  },
  {
    "id": "khao-yai-national-park",
    "name": "Khao Yai National Park",
    "search_query": "Khao Yai National Park Thailand",
    "location": {
      "continent": "Asia",
      "country": "Thailand",
      "province_state": "Nakhon Ratchasima",
      "lat": 14.43,
      "lon": 101.4
    },
    "category_ids": [
      "nature_outdoors"
    ],
    "category_tags": [
      "national_parks",
      "waterfalls",
      "mountains_volcanoes"
    ],
    "rating": 4.6,
    "review_count_approx": 25000,
    "opening_hours_text": "Daily 06:00 - 18:00",
    "description_short": "Thailand's first national park, a UNESCO site with diverse wildlife, waterfalls, and lush forests.",
    "description_long": "Khao Yai National Park is a vast protected area home to elephants, gibbons, and various bird species. It features stunning waterfalls like Haew Narok and Haew Suwat, along with scenic hiking trails through its evergreen forests.",
    "best_season_to_visit": "Nov-Feb",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1706574458327-73fc8c5fb1a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwxfHxLaGFvJTIwWWFpJTIwTmF0aW9uYWwlMjBQYXJrJTIwVGhhaWxhbmR8ZW58MXwwfHx8MTc2NTE4NzEyN3ww&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/tg-a-VtNFCo/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwxfHxLaGFvJTIwWWFpJTIwTmF0aW9uYWwlMjBQYXJrJTIwVGhhaWxhbmR8ZW58MXwwfHx8MTc2NTE4NzEyN3ww",
        "photographer": {
          "name": "Hongbin",
          "username": "hbsun2013",
          "profile_url": "https://unsplash.com/@hbsun2013?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "a couple of animals that are standing in the grass"
      },
      {
        "url": "https://images.unsplash.com/photo-1748966006818-de095fe1fbd7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwyfHxLaGFvJTIwWWFpJTIwTmF0aW9uYWwlMjBQYXJrJTIwVGhhaWxhbmR8ZW58MXwwfHx8MTc2NTE4NzEyN3ww&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/s9NekTBWMKg/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwyfHxLaGFvJTIwWWFpJTIwTmF0aW9uYWwlMjBQYXJrJTIwVGhhaWxhbmR8ZW58MXwwfHx8MTc2NTE4NzEyN3ww",
        "photographer": {
          "name": "Nopparuj Lamaikul",
          "username": "center999",
          "profile_url": "https://unsplash.com/@center999?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "A dirt path leads through a lush green field."
      },
      {
        "url": "https://images.unsplash.com/photo-1748966006345-ea3c0ca397e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwzfHxLaGFvJTIwWWFpJTIwTmF0aW9uYWwlMjBQYXJrJTIwVGhhaWxhbmR8ZW58MXwwfHx8MTc2NTE4NzEyN3ww&ixlib=rb-4.1.0&q=80&w=1080",
        "download_url": "https://api.unsplash.com/photos/Y91TXOjuMmE/download?ixid=M3w4Mzg4Njl8MHwxfHNlYXJjaHwzfHxLaGFvJTIwWWFpJTIwTmF0aW9uYWwlMjBQYXJrJTIwVGhhaWxhbmR8ZW58MXwwfHx8MTc2NTE4NzEyN3ww",
        "photographer": {
          "name": "Nopparuj Lamaikul",
          "username": "center999",
          "profile_url": "https://unsplash.com/@center999?utm_source=global_tourist_attractions_data&utm_medium=referral"
        },
        "alt_text": "Green field surrounded by lush trees under a cloudy sky."
      }
    ]
  },

  // ================= AFRICA =================
  {
    "id": "pyramids-of-giza-egypt",
    "name": "Pyramids of Giza",
    "search_query": "Pyramids Giza Egypt",
    "location": {
      "continent": "Africa",
      "country": "Egypt",
      "province_state": "Giza",
      "lat": 29.9792,
      "lon": 31.1342
    },
    "category_ids": [
      "history_culture",
      "landmarks_sightseeing"
    ],
    "category_tags": [
      "ancient_ruins",
      "monuments",
      "deserts"
    ],
    "rating": 4.8,
    "review_count_approx": 120000,
    "opening_hours_text": "Daily 08:00 - 17:00",
    "description_short": "The last of the Seven Wonders of the Ancient World, iconic tombs of pharaohs.",
    "description_long": "The Great Pyramids of Giza and the Sphinx are ancient engineering marvels that have stood for thousands of years. They offer a glimpse into the glorious past of ancient Egypt.",
    "best_season_to_visit": "Oct-Apr",
    "images": [
      {
        "url": "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcSgvVS9LhoWtA7EAe6O0aO_rfNXf0vipjuy29zWP85N23gLtezB",
        "download_url": "",
        "photographer": {
          "name": "Ruben Hanssen",
          "username": "ruben",
          "profile_url": ""
        },
        "alt_text": "The Great Sphinx and Pyramids of Giza"
      }
    ]
  },
  {
    "id": "table-mountain-south-africa",
    "name": "Table Mountain",
    "search_query": "Table Mountain Cape Town",
    "location": {
      "continent": "Africa",
      "country": "South Africa",
      "province_state": "Western Cape",
      "lat": -33.9628,
      "lon": 18.4098
    },
    "category_ids": [
      "nature_outdoors",
      "landmarks_sightseeing"
    ],
    "category_tags": [
      "mountains_volcanoes",
      "hiking",
      "viewpoints"
    ],
    "rating": 4.7,
    "review_count_approx": 45000,
    "opening_hours_text": "Daily 08:00 - 18:00 (Cableway)",
    "description_short": "A flat-topped mountain overlooking Cape Town, accessible by cable car or hiking.",
    "description_long": "Table Mountain is a significant tourist attraction, offering panoramic views of Cape Town and the harbor. It hosts a rich diversity of flora and fauna unique to the region.",
    "best_season_to_visit": "Nov-Mar",
    "images": [
      {
        "url": "data:image/jpeg;base64,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",
        "download_url": "",
        "photographer": {
          "name": "Tobias Reich",
          "username": "tobiasreich",
          "profile_url": ""
        },
        "alt_text": "View of Table Mountain with clouds"
      }
    ]
  },
  {
    "id": "victoria-falls-zambia-zimbabwe",
    "name": "Victoria Falls",
    "search_query": "Victoria Falls Zimbabwe",
    "location": {
      "continent": "Africa",
      "country": "Zimbabwe",
      "province_state": "Matabeleland North",
      "lat": -17.9243,
      "lon": 25.8572
    },
    "category_ids": [
      "nature_outdoors"
    ],
    "category_tags": [
      "waterfalls",
      "national_parks"
    ],
    "rating": 4.9,
    "review_count_approx": 30000,
    "opening_hours_text": "Daily 06:00 - 18:00",
    "description_short": "One of the world's largest and most spectacular waterfalls, known as 'The Smoke That Thunders'.",
    "description_long": "Straddling the border between Zambia and Zimbabwe, Victoria Falls presents a curtain of water over a kilometer wide. It is a UNESCO World Heritage site and a hub for adventure activities.",
    "best_season_to_visit": "Feb-May",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1603201236596-eb1a63eb0ede?q=80&w=1080",
        "download_url": "",
        "photographer": {
          "name": "Matthew T Rader",
          "username": "matthewtrader",
          "profile_url": ""
        },
        "alt_text": "Huge waterfall with mist rising"
      }
    ]
  },
  {
    "id": "serengeti-national-park-tanzania",
    "name": "Serengeti National Park",
    "search_query": "Serengeti National Park Tanzania",
    "location": {
      "continent": "Africa",
      "country": "Tanzania",
      "province_state": "Mara",
      "lat": -2.154,
      "lon": 34.6857
    },
    "category_ids": [
      "nature_outdoors"
    ],
    "category_tags": [
      "national_parks",
      "wildlife",
      "safari"
    ],
    "rating": 4.9,
    "review_count_approx": 25000,
    "opening_hours_text": "Daily 06:00 - 18:00",
    "description_short": "Famous for the massive annual migration of wildebeest and zebras.",
    "description_long": "The Serengeti ecosystem is a geographical region in Africa, spanning northern Tanzania. It is renowned for its large lion population and constitutes one of the best places to observe pride life.",
    "best_season_to_visit": "Jun-Oct",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1080",
        "download_url": "",
        "photographer": {
          "name": "Hu Chen",
          "username": "huchenme",
          "profile_url": ""
        },
        "alt_text": "Elephants walking in the savannah"
      }
    ]
  },

  // ================= NORTH AMERICA =================
  {
    "id": "grand-canyon-usa",
    "name": "Grand Canyon National Park",
    "search_query": "Grand Canyon USA",
    "location": {
      "continent": "North America",
      "country": "United States",
      "province_state": "Arizona",
      "lat": 36.1069,
      "lon": -112.1129
    },
    "category_ids": [
      "nature_outdoors",
      "landmarks_sightseeing"
    ],
    "category_tags": [
      "national_parks",
      "canyons",
      "hiking"
    ],
    "rating": 4.9,
    "review_count_approx": 200000,
    "opening_hours_text": "24 Hours",
    "description_short": "Immense canyon with layered bands of red rock, revealing millions of years of geological history.",
    "description_long": "Carved by the Colorado River, the Grand Canyon is one of the most famous natural landmarks in the world. Visitors can hike the rim, descend into the canyon, or take helicopter tours.",
    "best_season_to_visit": "Mar-May, Sep-Nov",
    "images": [
      {
        "url": "data:image/jpeg;base64,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",
        "download_url": "",
        "photographer": {
          "name": "Omer Nezih Gerek",
          "username": "omernezih",
          "profile_url": ""
        },
        "alt_text": "Wide view of the Grand Canyon"
      }
    ]
  },
  {
    "id": "banff-national-park-canada",
    "name": "Banff National Park",
    "search_query": "Banff National Park Canada",
    "location": {
      "continent": "North America",
      "country": "Canada",
      "province_state": "Alberta",
      "lat": 51.4968,
      "lon": -115.9281
    },
    "category_ids": [
      "nature_outdoors"
    ],
    "category_tags": [
      "national_parks",
      "mountains_volcanoes",
      "lakes"
    ],
    "rating": 4.8,
    "review_count_approx": 80000,
    "opening_hours_text": "24 Hours",
    "description_short": "Rocky Mountain peaks, turquoise glacial lakes, and abundant wildlife.",
    "description_long": "Canada's oldest national park is a wonderland of jagged peaks, crystal-clear lakes like Lake Louise and Moraine Lake, and glaciers. It's a paradise for hikers, campers, and skiers.",
    "best_season_to_visit": "Jun-Aug, Dec-Mar",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?q=80&w=1080",
        "download_url": "",
        "photographer": {
          "name": "Jaime Reimer",
          "username": "jaimereimer",
          "profile_url": ""
        },
        "alt_text": "Moraine Lake with mountains"
      }
    ]
  },
  {
    "id": "chichen-itza-mexico",
    "name": "Chichen Itza",
    "search_query": "Chichen Itza Mexico",
    "location": {
      "continent": "North America",
      "country": "Mexico",
      "province_state": "Yucatan",
      "lat": 20.6843,
      "lon": -88.5678
    },
    "category_ids": [
      "history_culture",
      "landmarks_sightseeing"
    ],
    "category_tags": [
      "ancient_ruins",
      "monuments"
    ],
    "rating": 4.6,
    "review_count_approx": 95000,
    "opening_hours_text": "Daily 08:00 - 17:00",
    "description_short": "World-famous complex of Mayan ruins, featuring the massive El Castillo pyramid.",
    "description_long": "Chichen Itza was a major focal point in the Northern Maya Lowlands. The step-pyramid known as El Castillo dominates the ancient city, which also includes the Great Ball Court and the Temple of the Warriors.",
    "best_season_to_visit": "Nov-Mar",
    "images": [
      {
        "url": "data:image/jpeg;base64,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",
        "download_url": "",
        "photographer": {
          "name": "Filip Gielda",
          "username": "filipgielda",
          "profile_url": ""
        },
        "alt_text": "El Castillo pyramid at Chichen Itza"
      }
    ]
  },
  {
    "id": "central-park-usa",
    "name": "Central Park",
    "search_query": "Central Park New York",
    "location": {
      "continent": "North America",
      "country": "United States",
      "province_state": "New York",
      "lat": 40.7851,
      "lon": -73.9683
    },
    "category_ids": [
      "nature_outdoors",
      "entertainment"
    ],
    "category_tags": [
      "parks_gardens",
      "city_landmarks"
    ],
    "rating": 4.8,
    "review_count_approx": 250000,
    "opening_hours_text": "Daily 06:00 - 01:00",
    "description_short": "An urban oasis in the heart of Manhattan, offering lakes, trails, and cultural landmarks.",
    "description_long": "Central Park is one of the most filmed locations in the world. It offers a zoo, ice skating rinks, boating lakes, and vast meadows, serving as a green lung for New York City.",
    "best_season_to_visit": "Apr-Jun, Sep-Nov",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=1080",
        "download_url": "",
        "photographer": {
          "name": "Roberto Nickson",
          "username": "rpnickson",
          "profile_url": ""
        },
        "alt_text": "Central Park aerial view in autumn"
      }
    ]
  },

  // ================= SOUTH AMERICA =================
  {
    "id": "machu-picchu-peru",
    "name": "Machu Picchu",
    "search_query": "Machu Picchu Peru",
    "location": {
      "continent": "South America",
      "country": "Peru",
      "province_state": "Cusco",
      "lat": -13.1631,
      "lon": -72.5450
    },
    "category_ids": [
      "history_culture",
      "nature_outdoors"
    ],
    "category_tags": [
      "ancient_ruins",
      "mountains_volcanoes",
      "hiking"
    ],
    "rating": 4.9,
    "review_count_approx": 150000,
    "opening_hours_text": "Daily 06:00 - 17:30",
    "description_short": "Iconic 15th-century Inca citadel set high in the Andes Mountains.",
    "description_long": "Often referred to as the 'Lost City of the Incas', Machu Picchu is a symbol of the Incan Empire. Its dry-stone walls that fuse huge blocks without mortar, intriguing buildings, and panoramic views are breathtaking.",
    "best_season_to_visit": "Apr-Oct",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1080",
        "download_url": "",
        "photographer": {
          "name": "Willian Justen de Vasconcellos",
          "username": "willianjusten",
          "profile_url": ""
        },
        "alt_text": "Machu Picchu ruins with mountain peak"
      }
    ]
  },
  {
    "id": "christ-the-redeemer-brazil",
    "name": "Christ the Redeemer",
    "search_query": "Christ the Redeemer Rio",
    "location": {
      "continent": "South America",
      "country": "Brazil",
      "province_state": "Rio de Janeiro",
      "lat": -22.9519,
      "lon": -43.2105
    },
    "category_ids": [
      "landmarks_sightseeing",
      "history_culture"
    ],
    "category_tags": [
      "monuments",
      "viewpoints"
    ],
    "rating": 4.7,
    "review_count_approx": 90000,
    "opening_hours_text": "Daily 08:00 - 19:00",
    "description_short": "Colossal Art Deco statue of Jesus Christ atop Mount Corcovado.",
    "description_long": "Standing 30 meters tall, this symbol of Christianity looks over Rio de Janeiro. It is listed as one of the New Seven Wonders of the World and offers stunning views of the city and coastline.",
    "best_season_to_visit": "Dec-Mar",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1564659907532-6b5f98c8e70f?q=80&w=1080",
        "download_url": "",
        "photographer": {
          "name": "Andrea Leopardi",
          "username": "aleopardi",
          "profile_url": ""
        },
        "alt_text": "Christ the Redeemer statue"
      }
    ]
  },
  {
    "id": "iguazu-falls-argentina-brazil",
    "name": "Iguazu Falls",
    "search_query": "Iguazu Falls Argentina",
    "location": {
      "continent": "South America",
      "country": "Argentina",
      "province_state": "Misiones",
      "lat": -25.6953,
      "lon": -54.4367
    },
    "category_ids": [
      "nature_outdoors"
    ],
    "category_tags": [
      "waterfalls",
      "national_parks"
    ],
    "rating": 4.9,
    "review_count_approx": 75000,
    "opening_hours_text": "Daily 08:00 - 18:00",
    "description_short": "A massive system of 275 waterfalls along the border of Argentina and Brazil.",
    "description_long": "The Iguazu Falls are one of the most awe-inspiring natural sights on the planet. The 'Devil's Throat' is the largest and most impressive cascade within the park.",
    "best_season_to_visit": "Mar-May, Sep-Nov",
    "images": [
      {
        "url": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEhUTExMVFRUXGBoYGBcYFxgaGhgaHhoWGBgYGh0ZHiggGBolGxgaITEhJikrLi4vFx8zODMsNygtLisBCgoKDg0OGhAQGy0fHyUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIALcBEwMBIgACEQEDEQH/xAAbAAABBQEBAAAAAAAAAAAAAAAEAAIDBQYBB//EAD4QAAECBAQDBwIDBwMEAwAAAAECEQADEiEEMUFRBSJhBhMycYGRobHwQsHRFBUjUmLh8TOCogckcpIWQ1P/xAAZAQADAQEBAAAAAAAAAAAAAAAAAQIDBAX/xAAjEQACAgICAgIDAQAAAAAAAAAAAQIREiEDMUFRE2EigZFS/9oADAMBAAIRAxEAPwChxSag2fq0Pwzhw7izBma2Vo6URBMcZZx6B5oYUwmgeRNLczPq1h9TE9UIYgTDnhrwngA68ceOQ0wgHQlGI1KhqnhiJK4YVmONHRBYUJic7D72h4TCEcKoVjOvHXiMl46EwxDiYTmEmERCsdC7w6x0KeGmFnk5PSEASiQSHFPlUAfYxIMMoZqQP9xt7Jz1iGRglquASP6UlR62Fx6w6VhZp/CR5kDLoS/xEtlD0yS9yGa1xf8AOJJEt3eYkHyNPvn8QKtChZQI845lBsA3E4ZaA5pUP6CSRq5DOIgSpw4iTD41SRylj9fPf1iHFErCgWBVcqSkBT+lviBAdVEJnpdqkvs4eKiXgkrWULmBSh+F731cl8osF8LCkBBqIyN2J2yaK0InKxHDAeH4OlIWDZwUupnCbOA/ln1iObwgNSpaynQXP6iCwoKmzUgOpQHmRFbjsYFJBkzASCCwIuNQX0iaZwxIA5VTWOTi3W7fWJv3bL//ADb6/Bh2KgOTjgpJKXKhpkSdrwUiaS1jfTXyaGIwYBZEk+ZYD5L/ABCXNUldKpdIKmCswRof6TFZE4koSTeFB6UncwoWYYoHUvoYhmb29YekGOmXvDuhtEQHmXiYA2jiEhMc7x8oAJ3iNSiIYXjhXa94QWd73rHO9iJKgRqdgA5+sOZNtPM+0NiOpm6n2MOVMPiYkbgE/SI1gWuzX+NTDwAQ4UDfMH8oRR1U1t4cgk5Nk9yBDZaHOf3ZodSxaFYDift46DDWjqRCAdaGlQGsT4ZCSoBZITrSz/MWOClSkKfvQkb90CpruKnpFtW8xCyoeNlSbfpqPMRIqUsJCihbKyNJvZx8RvsJwtAXWUgslNMwqcqcXqB1ceVx1gqciUlgoW0u/wAZ+0Zvk9GigecycKpYSpCJigbEhJLEFjYXz0jR8P4OgkpWNjTSAbNclIB9PrGyweGSQCgBum0STcHrlo7DL9Ih8llLjKjhWBlBCTLpYE3AYvkQp7v5wRMwMtlGl/xN1/KOJKJRIdnLkE6nWOifLILG5P36MInQ6PPsbOTUQCFBzk/LfIk5nrFRxDiiUhSUpNY1UQEj3z9No9FnBFIFCVVLALpBs4JJ9jFPx3ASBLUpEkBdykA0urMA6BLm+TNpGsZWZuJk+FYwzUuU+2R+v1i2VhSAC6S+xy6GIOD4ebNSpSEOgEhJfMAsTfIdS0ESalBwCQM+j5RTYqIU4ZILsH8octQAe++r+kHSZCl+FCjuySfpEc/BKHiSUvuGiMvY6M/KlpmqUpUpQbIqUb32izE2FPwTg3ILZjT8oz+Mw0yWSUTtbhR+LxdoWzQAw4LEZ2Vjp7lPd1bKqAHnaLHCrXSO8arVsodWS2WwnpgfFyUzQxf8vOBTMiWUqDEakEScMhCQnnLa1AP6NaFAsybMexDQoWxkZ9IYVw1AJ/V2H35Q1o1MxyyPOG1HcdGjhG335w5CLWDwBRxKjqPb84VO+W+kPEtTOUlhq3pDVnoRAFA85aQGJAe2RPllEqGA5SG94gxHD/x/iINgWOwcDL6wwSgEl+9VyszjMs7X87mCx0PxGFmFINK2UbEAMfNsvXaA8HKnBZBdrgBg27n2+YPwVQBNASgAF3yOoJy1G8GJU+sKxjJTgMSW184RmgRMEPZ4mlcPSSCWJ3hNryFAaw+oMOQFOzW0P9otpfBeXlTYen1zh6cLRYt6ERHyIeLAJeFUenSLbA8HlrDLnlLjRD0n+p7EeUQLmtZIiHGTqU1N5uaWG7xDbLSR6jgcAyAEqCkiwPp0h4wUpYKTSrQhrj00jyfAdpZsoq7takubhJU5dgHTbUtfePRuynH1z5AKy86WVJmFtUm7trSRGG6N1QXI4T3ZUApSQ9jUSQOgyAygpWJsz/5GkSqUX1bMjTpq8AJSQ4z6Z2bL3PxEDKbjeHqNTv8AeUC4FJFjofXpF7isIFZH72+sMRgGi0iWVs5F32dQfchQ/MxXY7Dd60r+cBJ0sfFllyvGkm4MtDcLhKS+uUap0RRFwLhaMJJJmzAUh25QkJS9kAAOov6mGTu0uAVSFAFywSpJY3Dlw6ev6RF2wlqVJQlCVLIWFEJBJAYgFhqCRna5jzqfhZilUoTQ1nNKbgXsTu+tozbvsvpG/wCI8ew6f9OTKZ2JCilzanwZj84ocTPKlFR1zZ2+ST8xmMPhAKu8m22y+pLHyiQSULLAKScgoEkMGP0gTiiey9WobiKvG4CSvYF3sWJ3yziZWD8LG4yfdmf5h8iQc1s4diDpFk0U8jDynaWVofRvllZQT+y7kn76QRieHIUoLcul2v8Ab+UV2LExCrAkHXIfGsaRkyWkwgSukToQwc2igVjZxshqme4caexiGfjMQkupyDmyXtsRcaw5SBcaNJ+2S/5hCjJzMYp/DL9UgH4S0cjK5F4ov1GONfIxHLmAjMeT/EEIX0jqMBJlwRLbJohKjtDglWxiWAYpTeEtFXj0L/CxH4rl21aDTh1EZiAMbLBdFZCtQkhwNzyn6iEiiPDTEBL0FJA1vvkdcoZM4hLIIq+DAc3h65QdJWrV6md9BfPrEsmQQgVgFr3NX1ENMMStxU6kpKZpU34WcZejxJhOLlNlBN72cNYZ7/MR45aVsAPVI0fa/wBiI0YQBL1Gt/Cwb1c/p6xDlTHiWmA4irvXVLqQdOYWcXf0OW8baVjpKEhQBSouzoJdrWubAlMYGWibKUEqSq7EUsQxu4ILEEbFo0WAX3Sga12LlIIc6kGk2DvoYiUtFxiahWFWECZUFu1ylaQp8gCm2+XtaCcLj8Kqorw1JCSSpCqwAkOVU+Gw1aNP2e41hpskK72WFDxJUKQkl7Bx00dox/Duyi0Yo4mXPlTJJK0lKavCq1JDAbAxmnZpVFrL4WFXaXUklgZcuksS4UEqd22GhLaRJipyJM6UEoAQpK3QQGChTfQVNUH2aBg8meQHI5VAvsAD73jvaNAJkqvZaknY1S1AfA+OsFb2K9Hn6eHCVjp0h7Cun3C5f0EekcNkd0mtBYlaphbM1ED1yHvGT4/hj+24WelmmIY9Slx9Ckekb/A4V0hOwb2hz2hRDVHmSpixu22kWWFwwPMdYdhsMGA1EGlhGSRqDrw6doh/Z4KJjhMWFAS5UDqlwdMgVcAqKPtDPUiTNUkEksmzuATc26CPNpoBJJLaXPQ+0bztPxUJSZSDzEiotYDNgRr/AHjIzCVggEgC9m676REoZMhlRNIYl2AuSAQGbd7mABxBDFrtmQRY5s+fzvF73ClJZSz/AMR6EXiH91pcMEsHe1y/UZQ1xpIOjnDOJJWl1ct7Oc+oiwlzw7X9QW98oq1cPQFOxLbkkH5aDe899o1UX5IbJ1I/lv6/Qxxa05Kb1+2iBM4iO/tiSQkkX0zgaaEimVKqmGoJSKtifLMMYlmYcLSqmZUyn6DoGItDOJ4dIBMslVOaHcB/vJ4DwcsEKUJZQbXcgH00zeMnauy1Q3FzFVmmUCLXJLmw3jkQLlzyeWYoDQUg/L3hRl+1/WKy2l8PcpqSlht8xe4LDIBqYBIHhAFyLi5uH6GIpUhxqQzi2mp6iGJxyCqhJc32YNnHdKRCQTKw7KrofRmLa/PNn5Q6RKEq6y1TubB7kkbawCcVNCjQHAzcUjWzmxgqdPlz6JayisAmkkAdehziG/BVBK5sopLS5hDWUpYbzFID6fMNxqU2dQKSB4QxSdE5OWjokJDjTpZoZOwqSSMk33PlmYLQion8PCmKVvnoLvuzMfKAcThioKQ7g72IbyIt6PFji56ZKWIOtKQRdvMOf7iA08QWQKZYcsA7jPrt+usVY0rKmdgEMySUtmdDe+VnvAhwwcsb5eJgfU5fS0XeAmUzQVklrrpBLsXAF2FwLvHVYtKwB3TEKdJIS5FSlJCybLZ2D9YG0OhuO4fOwinIYKDPVZaSKr0llBtLt8xJhOLYcmX30hxUHY0lIccyRlb2+sWPEsbNxASJxKkpAZwAAW6AB4F7ZcMRLlyZktLJKaTcHmZ3cEgvn6EaQkkxN0Qdr5SsHiWlLNCwCC/iY5nTIjLrGh/6a8YK+8QTexytf/HzFT2lw5xGFwk4aJKVHS4DPtcNEf8A0+5cQR097i0VSxoVuz0LGSXKVXquknfX3P6wROkGZKAGYpV6pIt6gN6wYnDO/m/36GLDA4I+x+IxbNEjPS+FpmolH+RZpO249xGjwsgpiwl4UAMRDVACFZaQ+UuJO8gQqjnexIwzvI6VQD3kOE2ACVZih4/xdMsKQlX8VgwbJ9T6RF2k433X8NN1KSX0KQbJUOrv7RjjiBmbwmyWxuNxFRdV1E3JYkwFNnU5KAvkRn5DeO4tb5D3/vECkKdJZIb7226xm7vsjyFIxQUCCAFh+RwT06bRygkQHImUzHWtJHoTfoBaLRMwEOCCNxG8WX4K+YkjP3iMuIsJhiGYiz0udBZ/mNMiMQMDeG0u6d/S0OnsDez56tHZCCpJKGs7OWdrWJ8R8nh2mKqZKiQ2ZF87fERY7DJUkgKpI1DW97RW/vLVXL/SRd7P6xyfjwsGW4FQbPm9LBmjCXKm8Q8gqeHyG5kKJ1O/XlS3tCgJeDpNNE0tZ73bW0KMsZe2K2eghAKRzLDZAkEfQNGcxqEpmOhIUos5SLi4yzv5xssLPlLNAly9QU1Kcu1JDuR8RR8U4HNlpSpMshLtVQBZ8y4Z31IfOOh2WkCzMYAkpoJZnFlG76AmwYvHZmJQliACzAtmkHU9Ihw0hdKq6M/CpvMu3W+nlE3DMM1ZKJYSL1EuTbLK+0O2w0XnD58kiogTFF2SFWZhcne+j5ZiJ5dKXHdAu9lZsWYC/QtrA+AkuEqSBSosNG63GX9oZx/jRKghSqikMwckDqrJ9bfEKxUVuPw4KioEp2TYgbZ3+Yq5uDWCKVJ5mcksw6No0Gzpq1JDIXUvIJBKmFyTQbfo50irmTVkEBKraEGp7aKAce8EpfVjp0TqwZqZCKmBBJWDoSwDWOVrRPhUqSlj4jm4y1Yf5/SI+GzZifHfcgMwJ2Bf2g3Fjv5c1LpUuQkGpJapAKgoWF83ve0JSvoQbgeIpX/26rrKgoTGIKCBy+Yy94suIYD9okqlWqqdLn8QLkerkesY3h05lyl6AAX2CrfH0jbIWUTgo+FTD8wRo7v7RqlRN2UPCZJODxGHVZUsmxzAP9wYB7Dyv+4d7Ul/cNGzVgnnTF2/iS6VN+I3v7FvaM7wbg5kzD3iqLim9z6fecO9Akeq8LQCCTs14sTMAyjBycaofiJizwvEzGFmqZo14mBJmJvaBkYqoRyqJY7J++eEZkRPaKvGY27CBbBlv38dM8DWMqvGKexgXEYlRe5PrFYiyBO12MH7SouLJSkdbOT53+IpjjQoWbq398o1HEuCEhPMhAoTUVK8SlXYgjMEt5ZxHheEyZYWCvDJWzVEuUu/hBLOdyImUUQ1bMwqUQfFtYMoZAs/rfyzjhSdD9+9oP4pwedJYqBWg+BaFAuM8ninUsZF2zulvYkC8ZtP0Kjq0uDUioZ5D5c+sRYPHEZg9QHLD8Pk/veCJkxTXSnobjy8QaBu9IDBidk3e2dvrApv0UmHo4kglqr7axBjMcqmpDnoGJ/9cyPJ4GXw9cwXIRezXV66DyEE4XhVBCip6fCwYg72s/WNVk+wyKvF4or5TzElmbI5AEHLOJcDOmJVRSoCwuBYdGi5l4VAVUQCv+YsVdL5wWEw0qZNmc7QcMRLmMqsWe4KSAXez7/4inkyxKU1TlRDMB0YEXIe3SL/AI9hypY/hlbhifv7vAkvhSpX8UXIvSAM8201G20TWwLkgnLLyhRWycdiiATh1EnXL84Ua39E0bLhuGlS0omT5YSUqJAl1itQLupy2odxmfaw4nxYrSpaAkrKSSASUy021YALUwu7BgBF9jcLKwYKlTCtKh/p0JJLXNzbNiVHbeMRxLFon4imSES5LBRLjMGkkhIJe9ipvQljNpvZq7M7JnEzSTIFTtzAh7hywYAbZZbRreHjDkp72XSabqluxUMhSXd/PpBkjslMmAKkrlzE0hQWRZ9Qksxu+W0ESOAz5Sioy5YzeYouwAuoD9Bm3lD0tWKmRcS4cmXzVJCAPAk893YEF6bauYw2MlrVNmCXKUoAVKZlOAOl7dW/KNNwziMoTVS50xZUplMlgO7LMQVAkllBRslgDGplDDyAqZJQyg9VRckA3/It1hON9hR5RIx5TKpJTKBLh2JBDDKxSLZA6axN+8E1KE1QnrANCg9wkLUACSRekgOCxSxgz/qbwyWomehDLDVU5KQclEaFOTjQ3yjNcOmA4eWWvLm0P0VcD/ks+8XHj0S5UN7S4sommWPBZSS5chQBe3nllFx2NWFTQk3EyUUEb/d4z3HklSMPM/ml0lt0Gn6NBHDJKkpSqqkjYkHT5vb12i0lFE7ZrEdnZyUmpBCEqPM1qXIJfazxbSiRKKNUKb79frA0rtQaE94CaUhQOr3H+5w4brBVSSaklkrQFB7bFL7WYRKlboqi4wpNFewiv4ljkEiukbHV/QfnEYmBx4smIqdPo0CTeGg5VHZnJhOWxpEcjiKaSdAWt8QRhjPK001GoVJASbj6ZQzA4QpVSuWQgkFRFlt0Kg0bnhU5BQEAFgmm+eQe4DXYe0ZyaRSVlTgwpKApRJc7EEbgv1gyXOgvHyXZKGbb9H1jmGwQF128vrEXZVCnB0xn8UsE2EXWPmlIYA3t5xUmQf0i4iYNJlGIOI4hMpSXTUc6XZwDrrvD8ZxdMixSVKzYfDkxm8RjVTV1qd2YWYAbDfOI5J0tEmkRxzDTQTiRNMwvdKSM7JIZrN0s0Z5Hc1AVhYyPKpKiBl4z+UBVFOvW53+u0IgKF2fQ7eWXtEfM4gy/wPHEJBCzOAFv4bKDDdJLNGjVjsL3KZsuWmcDnUgI6XN6b6s2xjzcpSC60pLFibZXOY087WjQ8PmpCTYDlITZ6SRoMm9NY1h+W2F1o1GIn4JElU2XhpdSgUupOSrhg5tmbjPo8YibNBUTSACfCkMB0baCJuJD82hzGrsNdLC2kV87Fofxj0Sf8vGqSRMrZOZoETFdorFLBL1P+cEybhnMNpEhCAYrcRiJqpwSmVygsVEhiCM4PSiHoQ2sSx4sjUhbaern83iLvkp8ZSPU/QwYZoEA4zApmEKKUqIygsVEq8dKBYzA/n+kciJEsgAUt0GXpCgx+wPQO1qVYgGhCFpKClJBIKdSeblNyLjaMhguEHCyVqm0YgUgzJSwHZ2JCwC1NzrY9Y2OJnlSbuWPqzh2GsUqZHed7LILLQpGv/ife0KKNGyy7I8SmoRNlOyELSEBwaUlSakuGydtAzZtFn2nxalIWl2FKhn5gfSKvsXwScXXNRSkoALsQTyn4IP28XH7pM+YpiG6/wC67Z/ih6se6PE8BiAJkk6OpBPmpaPopMemcKmKUlmcKF+gIpt1AEZOR2bSlcxCwsLlLUpDkXJUCkeFhaW7ks5aPR8NNlS0ykKCBZCjd6nSKiqnJTqsOmkXKSIjFlLxDgS50tg5HdLlq3Y2DbxhuzfBCkrkLQqYoqdKEhySm5IcgOwcZvtHruK7XYaWlSZZJWnIN4nN2e1neMPxrtSqYVBJYdDrdzSlg/vrGfyPwU4ogm9mJ8uQoHCopJUtBetUpzzMzpvmwdopcPhiwVUCQWYJc+Z0T6dYLkcUnAOlxfJKQAToTTkWaL/gKzxBMyTOWhCksRMKBWpId0qydiQXzibcg+kZDiCywZVJ+Tuwaw/SDcNiTMkoJDlClSwSRoxHnYj5iLtXwuZhZoQVVpNwr+YPubhrW8ofwDioRJmS1C6iFgsCQdc8ntcQ4RrZNbD5CifsRe8ExiUJeYiojIu13e42itEmQpFXeLIexCAX3SSCKSM22fZ4lQgAcohyeikaHE8YUsmmltikFveC+HYsmxSL6izRm5CSfv6Ro+Cy7kGxy6f3jF0WrLWRhxZRAfQkuw8so5iMUkHrAuKxBRofyHrFfMnKJcwRG2FTHXmbQyfLCUqWckgn0F/eI5WIiDj/ABES5CwWKlgpSPS58g/u0adIg82xmMXOmLVUfFfIgC1vR/iGKngFyu4DtSHbVr6xBi8QoFISxKz4RYXbOClcJC1KISuYUgBVLEs+bNZL7XjJwslEa8ckqs6j1seiWyd265RJMXUlmKerENucviDey/CJdRrExIqPKggrL2Z1Xy82eGY7DJSpywBSCzuUA3ocguQGfrClxJUxoDKEkO/oT+USYLiFNlADJrh26jSBkITkmVUOoqfqCrJPk0cEynKWlB2a3uAzeUHHcfZLLWYZagTMU6WOzvna2cCT5KAwRYt0LdWBy/Qw7HCkIVysoVBKVXLtpoehgOTLClAqrSkEuU0kixcNV5P5xs50+tBsmThyxv6sA3UCHS5ndpa9tSc36mzw2SsKampOYuCAWtBolg3OQi8k1oNk0tQId8/vSJAiK9XFZYYJLvYUxDjOJTACEy76Elh67Rk5pDbLRZG8MChmIqZeIqSO8HNlZy53caf3iCfilJJcJSgBzkfdtYh8u6SGtF7WdD9IUZzvMWck20tppCg+V/X9Js93wvA1XqIDlzvl03JeDxwaXL5kpBNzzHMs3lHeL8T7tPIQWinHHVKWCfDkR+caORtSIR2q7ldE6UwNTlG4Fg2pLNGemdt5ie9IUlcua6UAAJVKKnYWYW13N94b2kmuS5JubggaWzjCqVzeFhu7vpu7k7CBulZDbD5ePnB+elCtASxO5fOHz+IqWmgsWvo51H06RVUHxBRV/SojfXM+mQiaVIVYvu9N3zdy6mH3aMtroRFMnzCWUpQANgkWUNAo6HyL9XIhYOYofgIe5U2bnwgAAm2re8FlIIIJBBs7a6t0aB+I4hkgS5bqqzazNmaTu0Z5vKkSx+IWkfypuzA3URfMpLn1/SLzC4oyUJzLKKpa1DxSix8WrZeb5NfDzsQqYsAjmFrFxbaNb2amGbLmYZXRSHuArJTf+QMdcI0tgmantBgP2jB1EipPOOhAuPUONnEYuTw0pDlx8R6d2akIEod6oWsRnuc8tfmJONYqQQApCTdgSAbMfUDyh5VouvJ5fg8aZDskl9AfvONHgqlyxNpZJJFlBWTF3Ghv7GOrThkqKlSnQoAFiRSCWcPcmzxqcP3f7MFYcFEsZDlIJ1Vym/qxiZ9DSKjDIAUk6jP3/SLwAIeZN8Cb81g2nn0EWWBwktLzAhNTm7P8GwMUvafFhQopC2NTKYuQ92yOZF7XjGtldIyvHuKKE1VJINnuWFrJCSwpvcF4bI4+gsFFic7MPjIRmcVMVUEgAnUqY38oIwWGIAq5iQ975b+kdCjozs2criCSWCw4tn9vGe7QY0zZpBNkCl31zI84HKs/o9/8w1MsMiWhClrYqVm2T3ADgDUl/aJap0KyqwmHJxSClykGoh7coKn2GUb7Hj9kwIQEAzJhHemkKNSgVG/QkAbNHezPZsrUgzkCT+IJBssC7EEBxlcbxL23kvKmhwb3CS5FiWIGRIEU9qh1WzGInzAp0qIIuKSQOh/tF/M7UzpiKZig4AbkQqqzGp9ev9ozcmkoQhTKUUhZcORU6k53ACVJETKlo/pDZKcOD6jfaMFyxhpj8EuMSAipNFVTU0kVHqpOmd7RXGSTTVvUEuogHOwNmcQSJ9Kaaqk55kgN5vfKBk4kqRVSzE5F3D6WvbaLXPDsloNrCUuoJUxKuZ/Ytp0gKdi0rBYgMWIAUG93cvHDipZASpIc2IJZTevS7GIFYFKiTJHdg2FIyboxvn8wOSnpMBi8bQ8uhRe5VSD/AMi6m6Bsojl4hBNAWXOaRU7sOtrRK6g7pakOBXcjc3y6GOYJMmtRCEqWzsGf0eMXKLBDAuWHap92dX2I60tmKwo58ztrlqdbf4gfEFagyEhNw4YpILu7+xEQnhS5hckIAO5UFHNwxyLn3gpe6AKM1IYAhhkah7b/ABpCM8AVFYN3AU/UDUVXycWgVXC0m0xVBBDAMQddnf016wl8NUpSalpIBy/EG6t8QVH2KiGZ2jUk0hCS2vNfr6wotQmXqHOpJD/Dx2D8P8gekfvdda0LACR4SLk2uS9s+oiBS1EpZxWWSwJv5gMMxmRFPxPHpmzSZYQEJDd6eVlDVST4haxyBN3iPh+JmSyQmYShuUJJCb2U975NGyii7NVO4azKWe8HizZSVbJszAaFrxksdw5FYUCpv5GAHxkb6GLnE8TWUgBiTm739tYrMbMDmwNn8TH1GZyaKivYMgRw3uw9CADzCzlI3a++dtI03DMHJnYVNIUpdKnUmWCmouxVV+JIsHIa51iiwfGhJDq/0w5YBLknVyCUkbjUhwcojxfbDEzQBLFEsAMgscmZ3DO4D2HkIbT6GkWuK7IFEoLC2mEgF0C51DAbuRGL7Q8MxGFmtMYKIBStI5VDRnuGcuLHJxlGqwnarEyp0pE2WtKVJcEpQlCmZRUgpGzne4DaxquK4aXipSkKDKLkFnZQ/EnbQkdYSjTtiaR4fLQtBcgjQnz+/iLjgy5ktXfAqGoa5PpqP1jRcR4IVIopdSWdhtvDE8KWG5QepFx5RpJ+iKIZfGZrMCQ+wACekAz+0iiCFKNszbyOQ6xejhvLfOBTwiUQApAUdyBnGeltlEPA8Zi1KlqBqlFVIC2PIXelJc3BI0F49T4cmkpSEju2GSQxVa7ZWtGd4Dw8UClORG3xe8XtS0girLQN9R63jOU7LigjiOLZhkz3fPz6xhu0WOUk8pF9S5L9NPeNWSJfNMN2IAYco3zJJ2jN8Z4vLAUSRQz0sxTZixy9YUXTthJmelYSoOqwz8x9f8xMlKbM9t9P1gKZjCpAKaiD/SLjy9OucRmasWBvsfTMh31taHLnrozssscmVLlhQUKib7JFxoHqdonBw5QgyJhSVIImFYIJJzAdJYaWbzjMTkTAyQipy6llXL15Xc9A20QYnFTEmmWitOSi90W2Fyw0G0SuW9oDX4DtCnDqCglSyl2sDawIfMAsLQyRNXxDEKVLSUSzeZMCQwLgkPqogAXfIWEZviUxYT3nN3QHOhKQF7Eu7N0zYZxDiO0yClIkzZiSohJuU5kO4Zjm9tWjSPIpdFJWH4xIGMnAVU8qU6FKEoRyjbxJ9ukVOKx6Qo0qABckvUSBp6EjTSD5OESuWsqrFJbl8RdipjfQD3gBHBsPQQCoVWu7vpmWdxs0YzccnbCmDLnhTc6g2dklwdKSSx69dYMmcQQAEgnVkjVg9yTAIwMlDgKmun8T26A2ZnL2Ft4hmYJJ5JkxRXdgnPzA384TjFk0On8QRM5lIOgsSxzcKfJukWUiWZjzEkFvCBYNn6l9W9YBk8LWWqZQAvQQUqOygeg06xY4KZMq/wBOhKbCoUs9mz5vKHpdDorMdxSlNCQqom4vmY5w0nvLJUSHJNObm35RopS5KlAslSjsw0B82/SIJ+Jlp0puXcm/lC+SK0kEkiqVxFaypLOdBr5sRvBkuwDkuGDZffvEU+a4KgObQu75G7xVzsdMUXBApzUFC+rOPv3gVy60TZfzEIIdkuL8xBPRi7COzppmACmgNfR/LP7y3inGJUWKkBgm7EVqLZsH13gWbxGYC6kLSGLOFD0uNvrDXG2Bdfu+VqpZ6uP0hRTDir3Y+5/WFFfFIKN5jJQLJJDPcEO4H0h0tkpCUJADW2EBcRkLrPe4aYh/wqASGGWdT6284fiJM1AQ8tIqdqipgBTSlnFyCol2sI30i8WPOJIzMJeKQlP8QFSi9KXJKvMD8oWAntapIKj+AFIO11KV1sNvSL//AOMIwwSvEzilSyEixWokksCTYBr6RVp9AjK4LD/tE4VlKVOGQchsTuemj+segyuAycMhc1X8ZQdmDUEPcWYlwz3DtvGc7VYGVKwyl4ZRrSaioEnkeygMtxoRY5RL2R4ypSRUakKQhRByqYom2GQIALC3MYKYNkuNRVKu1QVVayakhgtAHhC0XYbmLfgk08pzsPixgE4Wn+G5NPKCdUg8pI/8TnFzwOSE+QhvoldljI4AorMwKABLgNfyin4nIoURd/JvSNlIx6QlhpFZxqbUHHq/5RGRo0jGzZZbZ4k4fhT+IPex0+8oNVhHIJNgdPu0WEldF6Q9INsuuf1jKbBI7OliWEqcgEB2Gr5NobdYZNxlAKqiDnzM/ptDMVjG51eIXbQddrbxm+NccrtUbE2aybG5IVq4sB9IlKxt0N41xYsCououWOjfY94ymP4gEhyzvkTm+4u0S4ud3l1oWtJLJSBYAP8ABL3hiMFSXSiWkXJcEm+dzGU5Rv8AIzf2O/bBSLs+RJSxOresDY2emkKsCBqb22I/UQ2bj3ZLBO0wIe2VgCwJe2cQL4cqYT3izQwYAMpfn6h2HR9olRithS8EmGxqVSk3TKI8WatS7nV+rkxJNx6koukKB8NBKgRnezAZZwPKnJQoJGHZrp5Q7m1dr/nE01dYLKQFDwpVygnVw363hOKT60FHVTBiEJCVGWxezA6pKSCW+uWkUs7holLSmXKrXqLFQbwr5nSkH0gqfiZcvlWkKWdkmx3Oh1tfSJUzC3eXdQpQ6i5SNBpndhGkbgrXRUdKyzViKUhCbMNP5ndTnInQZ5DaAsfxWWlbECo7EWtqT+UVWKROWzpBFuYqCS/XbTKAuIynFSl1LYNQMx131v0gXHk9smy4w0yTOXzMpQYC7AJdzn4r29rXMTTsRcmlK0gOlnKiS17M2em0ZzhOIlpBKhWokADQAMSSGy/SDF8ZmU8hAqcJSGJFyQrK+o6RT4mnS6DaZdYZYKXQAKhzHmA31Jv/AHiOYplMVEE2AJJuTYgDMv116CBpSLOtpZKbJBL+u97+sCnFTJSWUzlyDc/IsGGkRVvQNlrLWliC1hS7B3bQ2L52zzitxq0mWElQKleEswbcM99CLG0QyuICa6GZgS5zBd93L3y3gfvjNAlBNLgGoginqBoNLbxrGDT2Sd4PiF95RUWvZidM2e0amRwVBSD3aW6fP+IqcDhxJT4grMqOxZ2frBMniEyS1Vgo25knyBD2hykr0O6ZZYfhKZau8TUM7A2vq2YgfE8Rq5GBAuoEAsLsdntln0hn7wXZQS4VlfLoXyhicYWqUA5N8iAz5biMm/LBysanHMACgf8AqB+UKEMS3/2H0SP0hQ8hWzYTe1wUj9nczgtaQioBKrsAAKSlLnMuTf1iu7ZcOl4VSP2eUlB8KlKUqYaSCoG7BuXwgQoUdC6LbMt2iw0tkrQVvMZVJUSEOOaXf+U5G7htXjdYzHqxPC0LJJKQkqc5lKkA/BVChRpHpEDuArTicGlMwGpVcupy+dDHd7XvkNopOwXFFSZ68PM5wCoAf1JLFjsb/EchRfgD0lWD7xSSkDmDex38jHcRh6DTkRChRDLGSXF3giZPqLdY7CjJjJZaBSW97RXcX4mJSORNSup23e3oIUKFWxsxGL4zNneJTAC4AtvpdrZPtAqkd5yv63977CFCi5JGbFKnKKUhCSzbgAa3cvDMV3pFAS5NvEPrChR53LUZDa6KbmkoUtY25aibOLv+UCzOMUpcZgOzWbK2r557QoUdHFFTVsSOY7jZsyylYHhFw5zJ3z/4iKzB4WZPPPUS7ggpuc2L9NdGyMKFGyioK0aJbLvh+GTJSCtSlKUWYsAl3IsHexfZ4KnIU9SEJXRqrNIyNL+lrax2FHLyN9ikPGIALFIdrhg1y1z6iBcbgEUqXUql3Ve/RtdoUKCOqa+g8jZcmUhQLAag0h6vMHOOTmBcBKXuSBzKOTvpChRciW9gS8aEPYpVmNdfbWD+HTpcwFKkM+QIBtuDoYUKLxWNh5H4zh8hCgDLDqcuHGWtvOCsRgUlD1FiLEG4ZrX84UKJlJpWO9sDm4YBCUpUCRm4IuNbQ3DcPK1NShVi92ucjl5woUKDb7ElY3HIKFAKTUAADdgGBJDak2gXF4qzSwEgFjygZO7AZaxyFG2KE0QI4qUgDmLAXdN+tw8KFCivjj6Ef//Z",
        "download_url": "",
        "photographer": {
          "name": "Dmitry Sigaev",
          "username": "dmitrysigaev",
          "profile_url": ""
        },
        "alt_text": "Powerful waterfalls of Iguazu"
      }
    ]
  },
  {
    "id": "salar-de-uyuni-bolivia",
    "name": "Salar de Uyuni",
    "search_query": "Salar de Uyuni Bolivia",
    "location": {
      "continent": "South America",
      "country": "Bolivia",
      "province_state": "Potosí",
      "lat": -20.1338,
      "lon": -67.4891
    },
    "category_ids": [
      "nature_outdoors"
    ],
    "category_tags": [
      "deserts",
      "natural_wonders"
    ],
    "rating": 4.8,
    "review_count_approx": 30000,
    "opening_hours_text": "24 Hours (Tours recommended)",
    "description_short": "The world's largest salt flat, creating a giant mirror effect during the rainy season.",
    "description_long": "Spanning over 10,000 square kilometers, this prehistoric salt flat is famous for its surreal landscape. When covered with a thin layer of water, it reflects the sky perfectly, making it a dream for photographers.",
    "best_season_to_visit": "Jan-Apr (Mirror effect)",
    "images": [
      {
        "url": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMSEhUSExIVFRUVFRUVFRUVFxcXFRUVFRUWFhUVFRUYHSggGBolGxUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGhAQGy0lHSUtKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAMIBAwMBIgACEQEDEQH/xAAbAAACAwEBAQAAAAAAAAAAAAADBAABAgUGB//EAD4QAAIBAgMEBwYDBgYDAAAAAAECAAMRBBIhEzFBUQUGImFxgZEUQlKhsdEVMsEHM1Ny8PFDYmOCkuEWstL/xAAaAQADAQEBAQAAAAAAAAAAAAAAAQIDBAUG/8QALREAAgIBBAICAgAEBwAAAAAAAAECEQMSITFBBFETYRSRBSIysSNigaHB4fD/2gAMAwEAAhEDEQA/AOItOEVIyMPNCjPQWSJh8bQFUmwsMKcKlC+6DmkNJgBSBl7HvjS4Uy9gZnrXsvS/QsqmFReYhNmeU2qQbTBWBakJXs8b2Z5SZYKTBpCow5lmgeUbAmwI9TJ0oQ2UrZx50mTTlqRlKNCezk2Ub2co05WoihU05RpxrJIFjsVCZpzOyjpUTLUoakFCLU4JkjrLBssqwoUKzBWNlYNhK1BQqwgnWOFZhkhqChBlmCkcanIKMeoKFBTmtnGskpljsBXJMlIyVErJCwoU2cqNbOSPUFHpadIGb2EtaLLG6IvPnZZa3TPbWNPZoRNHulKtp1hQmWwkS8pcMb8Z9C9MAzeyk2JU6RyimYSZZq3RUcV7PkU2cmynQ9nlGiJC8pFvxhIU5RTmI6KQkalNI+SrM5eM+hIUhNrQEKVm0M6VlvhnM8dcoVq0YPZxyqwmbCdUJbHLkSsUNOVs47klZJomY0IlIJlnS2cho90dio4zqYMs07Zo9wgzSHKFhRxSWmCDO0aQ5TBp90djo5OzMvZToskE1OFhQg1OYalH2SCdY0x6REpMlY2yQRSFj0ipEyVjJSVs5SkPSL2lZYcpBMZSkxOKMSTJlRio92lRWkOGB/KbRb2cr+XX6xnD1TxE+XcKVxZ7yyXtJG6akaGGFKFRQd82qDnMJM2Qq2HvxghRZTcTpqg5j1hRQk/I1sPQmI069+Bm7AxhsLyEw2HblI26LTYE078JYoiFWiwm1oNDUMRrYcc4GlhwOInWbC3G6crFYfK06cGRPY58sezFeiJgUxFcXRPBrRI1HXcZ62Kex5WaH8x2TYTDVjynGGOqDfD0sex3gTdM53EfOL7jMnH9xgfaxxEy2KS++Ow0hWx3JZj2w8oF8Wg4E98XqY4X0U2j1INJ0BXJ4Td+6cYV2J0FvWHXNzMlzSKWNj1SLM0pHaaIY8JDzpGscDYCoxg9eUa2BMNTwXMzB+UjePiP0c8LL2M6RpKsBUcRLyJS4KeCMeRJktAuY29oBxNYyfZlJJcCVWLPH3EAyTZZKM3CxS8kZ2Mkf5CH8P0expt4wya8YoiQ9K66zy3BdHQsr7G0wr+60L7JV4tBU8U39AfaF9pY8frMHHJ9GynD7IMO/wAXyM0tGoNzCYXEv/V/vDrimO8D0g4z+gU4fZQNUcptcU/FRC06oPKEFROfyMivcSrXUjC4kcVtNiqDxm12Z/tCrRU7jM5KK6ZSm/YIMPiiXSKjQkzpHCcoPFYQlZMMkIyTKl/NFo4LU0beflBvgVnUGFIHGGbDnLfKJ3LyoI5X482cI4BICp0YvAiPYrEqDYqfKKPjU5GdcZ2tjllBpij4AjcftAVKBj/tKnnMs4HAweWhrG2co0CTp+sYpYJvhE6NHCFzop8Z0aOBC8STOXL50IbXudWPxJS+jl0cGeIjQo24Rx6J4XgzTac/5sX2dP4bXAq1KCqU41Uqke7eKVKjHhK+eMuxfDKPRk6TDFjKJtwMo124LLjOC5InGb4BOIu8bNNjwAgmpEcJb8qC7IXiZHyhU3lbI8YwS3w2gzTYyH5fo0Xh+0CNMQZKibq4Zv7xOrhrb29I45tXY3h09DO0HKSIXX4zJHQWezpOD/YxhUE8YvS9fdc/eE/Gqy8beIB/SV8czkelHsxTm1SeOTrLV4lT/tjNPrTU4oh9R+sXxZfQtUPZ6xacIKU8sOtLfAvqZodan+BfnJ+PL6Hqh7PUijNrSnmaXWo8aY8iR+kP/wCUf6dvFrj6ROOVdAnF9noxTm1QjdPKHrTUubKndv8AvC0utFTjTU+BI+8fx5PQKUfZ6xKhEOK88XW6zONbqv8ANYj10g063vzpHw/vM3gk+jRS+z3O2HEQgrLbhb5TwtbrGXAFSijAajf6xZjRr3VXNInXIf3Vx3309Jh8DT/mjt7NUotbPc9XjauGDlXdAd9jpv74L2TBn36ZufiU3J3ATweNwjIbZs3gbj1ERM7oQtcmM00+D6vhujKNv3YB4XEy2Bog7hfvnh+h+nnpmzu5QCwAsSLCwyk7p6bB9I0aoA2lyQdH0ItwNtJxeThfd/6G2J+jqmkOAmGoLKUJu7PluimNNT3D9f0InlywJcM64W+w9TKOInMxXS9NDYj01jefOmV95HC+/mINcJSUaJu47z844w087mi2W4Cn0grDRCfKU2JHwfSNVNmBcmw57h9YFqVJtzX87793GWn/AJR2vYq1W+6n8xA1C/CkPMzHSGBVv8R1/l4+djOHieiD7uJceOb5mbwWOXO37YpfIuP+DrPtv4a/8oJttyUek434PX4YtvVv/qGp9FVhqcQW8R95tWJdr9Mn/GfT/aHahqjeRFmrsPft4ATLVGHvUT4nX6zmYnpFSbXS/d95pijq4iRkTit5DzuT74/rwideoo3n5GIPTLagb4vUw53TuhBLs4pt+hs4hOZ9JJztgZJvpRhb9BPxJviM1+ItuLmQ4S3ESzhSNbidClj9I5nHJ9ljFeE2MSO71gh4wqGVsRTLbHKouSABxMNTxYIBBBB1B5ieY62Vu0igncSRc232GnkZ6fA22aZBZSoKjWwBF5OpXVBW3IRa8WXpuntTSJIYaa7ieQPON1KjKCb62JG/gLz5xUxDMS7EljqSSbk+Micq6LjGz6WK8V6WSmyF3zDKNCrEHuHLf3RrCYjOiuCbOoYaC9iLzz3W3pMfuFDZhYtoLai4A577wlVcDimcPbd/rDdsKGswB3GxsfO2s5wB5H0juF6Sr0/ys1rWAPaUDh2ToJhRs5HY6v4witaoX0DWFzvANwRx0v5z1ZrjfPnGFxTJUFQgkhsx043vPY9FU3chhUDUggASwubm6sTvBtpbuhsuS1b4Ox7b3H1gamIB4Smot/RMG4bcSfUyaV7Gtut/7FmsIbDdIFDcW8CAQfEGJ7PxPmYWlSY6BSfMxTqtyY3Z0vxs8KdIHmEAPjG6XT+lmUE8wStz3gTknCON6N6tCp0e7C4U28T9pxzji7SOqLl03+h78dfgbeJY28LmDpdNVACM+hvv1OvG51nOfCMBuIt3n9IMUif7mNY8dcA5SGWr981hsc1M3UjUW13REof6JiVLC1NqzFmIK2AvoNbjS3DXXvmumLVMz1STPU0OnNO2Lm+ltNOMynSlNr5lK+dxOImCdhcX323j7SqfR1Q8WHp9pzyxYt96No5Mm21nTqYiiW/Kbc8zDXwBiOJyG4ym38zf9xdsBUBtmb0H2i9Wi4/xD6D7TXHCK4kROUnzE260wNKYJ5szH5aSkqqDcU08NbD11i1QOPf+S/aBIf4/kv2nWoqjmcmnsdGri2I4Dwimc798XCVBe9S9zcaDQct0y2f4vkPtLjBLgic3Lka2vdKifb5/ISS9JFnq16vE+/Cjq2finZXLN01A3G3OxM49U/ZdxfRyV6sD+IIwnVZfjPkJ1aJA3FvNmP1MYWpE5ZPYVH0fNv2h9WhSFLELdgXWkycWvdly95sR5jlM9aMSvR5XDUbVGGvaN9kpsVRgLEnXS53WnqOubuHwWRQ7e1AqrMFUsFOW5tp4xD9oOEoLsqjUAalarTNQgi5CGkrLmJGhUkcNbE7rjSEpbWyHW54Gr1lrswN0GW9rKPeBB334Gcgvrfzn2LqHh6VTAqTQpuy5lGdVN2ADavY6EnvtfdpafMulsNlWsWUK5xAyqCCqoTigyqbbg9MD/aJopW2iWtj6h0Vh1GGpVKmXCrbZhKxyFSl1y3Yi/wCUkcSJ4HrbVQYupYqwslnUgqwyKQQw0Mb6VxzvhMVRQPslrN+9JdlQ1aGRVJckEFRz0J8R5vpB6yk1HXLtKlU7iBmDnaAX00J4E74QTTtscmmtg3tS85VPFKN7Xl4mi9J6C1KirtqdOqxsTskqsbZhfUhAGt32753U6DwzEW6Vo2P+jUB9C0uWVLn+xKg2cCpiFPf3T3nU6rRCHP7i0zlHJ81r/wDE+s85010Xh6NAvTx6V6oYXQIUBQ6HLvu17Hfa156D9klVT7TtMpzbCwY2HZ2t7fL5TDNNSxt/9HRhTjOhvpDGrm7IsIga1+M93iOj8MzZitvPT6QX4Vh/dCc/zH7SYTSS2KyNt8nmujsA1Q23aXvrPR4DotUsbsTY3ta1/WdfDYcZdCo8LbvSW1C/HT+b/qcPkeQt02dOHE+RRcIP7gzGKqKmhHkAZ0AvP63magvy9dZ5s8sXwdsItciiUAVuQAP63zB6PAXKFFjzI4+UJj1JQj5Ccmpt1PZJI/zSoSb4Kce2Hq9X0I0Nj4zGH6JRMxBDcNSNJExNT3h87frBVHY62PkR9bzVSyvZshwxrejbpl0UAelohWq82A8xLxGFDfmVvLT6TnV+jKPEP6zeEF2//fsiU10hhmH8b6QFbCBh+9+kH+H4f/N5kyUcNSXUEjxM2Ua4b/RGpdx/3AVMMwH7xWA3XF4gGcE3VTedtivC3rEq9K/Kb4pS7MsijzESqOh0tbyt+kVZQOMcfBHmInXwzCdcGvZyZL7Ri45/MyoI02lTavsxs+gI8PRN4kg5N+v1k7X8U+QT01E43I0+OjuUqI5wxo6TiIrk32h04Cw9bCMqamvb0PcQfUGc8tV/1HQowr+k87+0XFhVoUlOWttVqIdLIFuuY91yN/I8ol17x77VAWV6QcNTOVbZkyF1ud4zWv6Rb9o9Kz0ahsbqym9yeyQR5doz2HR/RynD0qbBWUKhykKylramzA8b6zo1aYxbZho1SaSPE9B9c6uGpilTRCqm9ypY696t3TzePxAqsuYHs5wLDXt1HqHf31D6CfV8d1epv2si3AbTKAD2SBoNL3trafH2NjuseR08iOE2xSjO2jPJCUas+mdXOrBfDMlRUp06z5zTdXDgC2Udh1svZBsddATPKdfqS06y4ZWZlpZ6moAF8QRUbKbljr8Rn1qioCjXgJ8o6/182MqC2ihF8ewDfx1mHjz+TLybZ4aMfB5apdiL3NgALknRRYAX4AStnDZRyM0AO+el8SOHUCCLPpP7LW2dOuRpmKA/7c1v/Yz54bT3fUnFoqMmuZrNfW1gALX53v6zDPhUo0a4sjjKz1GKqszb+fA/a0TqUmv+b6zVWsnL5mLvjFkrHsJzdjCVXX35kYpwdG8uESfGAxdsRIlgi+UaQzSXDPSYbpk7mjgxoOoM8UuJ843QxxG4Thy/w3G947Hdi/iE1tLc9O+Ptxgz0iZyExd5vbzJeBFcmz81vgcqY9+UAekGgGxHfANVBmi8WC6IfkzfYy2NaY9r5iK57SmrzReNBmb8maGmrL/1pANUXlfyiz1II1rQ/DrhjXmLtDLMh92ZyU+XzMAa4mGseMPgku2Us0JeglRE4GKVU5WlvT74LZnnN4prsxnpfQMq3KSFynmZJetkfGjtCoW4RqjTHfFTWAO/Tu/WT2wnQTFtvgtRS5OoKtpunXvOXTbnC7aYSiapjPSWEp10KVFvyI0Kk8QY1gytJFRb2UWF99u/nOW2J74NK5Y6HSL421vwPWk9uTu+13nxvpIt7RVJ0bbOdRxzk7uU+poQJyukehKVWstVhqLXAOjW3ZuP3l+PkjjbIz45ZEjtdEK1OhSpse0lNFPiqgH6TwPXig/tLVD+VsoXlogB156fOe8285HWfCbegwH5l7S99hqI/HloyavY88NePT6Pm5cTIqCCL90u89tHjMJmvoBrPd9GUHp0US2trt4nfPLdW8Lnqhj+VCCfH3fn9J7jawqxaqEnpuZEpHjGWeCaVpJ1Mzsu+YNLvmip5zDUzzi0oakDaiecEQ43GFKHnMlTJ0FqZExLDfDjGHnAqJq8l4kUsjQZcSZftMVepBGrMpeOmawztHSTFDjDZ1M4pqyxXmL8drg3XkJ8o6dReUAxi4xUjV7yoxkuSJOD4Nu0C1SDepF3rTZRsxboZOIlri5z3qQbVJTwpoFmaOr7SJJyNqZJn+OX+SzvLUJ4w6VLTkjES/aYPC2JZUjse098y2L75xzXlLUvBeN7G/IfR1hVzc43TrACcdcQBNHFTOWG9io5qO0uLmvapw/axLGLkrxfov8AJO6uInJ6wVKzrkpjskdogi5vw13CYXEzRxU1h41OzOfkWqPKt0HWH+GT4ES6fQlcn92fUT1PtUv2ydWmRy/ynM6H6Pq0nu9gtjcZr35bu+do1RFKmIvAmt3y0tjKTHzUEwasR20y1WMke20y2IiBqQbPGOzoGuJk4gTmlzMkmAzpmv3zBqzmljJtDGA+a0raxLayjUipDsbapM7SKmrMmpDSgsaNWYNWLF5kvFpQ9Q1tZhni+aTNHpQ9QUmZvMFpm8dCs3JB5pIE2Mh5eaLhpoNAA+aXmgA0vPAAytLzwBeTNFQ7DipLDwGaQVIUFjYqS9pFNpIakEFobFTvlmp3xMPKZ4xWNGrKLxUPJniJYztJWeLGpIKkKEMF5WeLmpMmpHQDO0mGqQAqTJaAw5aVmgc0yWgAYtKLQGeZLQoYxngy8FmkJjoAm1l7SAvIG74AHzSs8DeTNAAueTPA3kzQoYTaSQWaXHQrDB4QVIkHm1eSMazyZoDPJmjAPeQtA7WVngIYzSi0X2ksVICD55C8Bnl374CDbSVtIEtKzQAPnlZoDPLzQALmlFoItJmgAXPKLQeaZLQALmkzwWaVmgAbaSEwGaXmgM2WkzQZMrNAYQmYDyi0yTCwCXlTBeVmgCN3kvMEyrwALeVmmAZRMYBLyoO8uKwNGWskklFFzUkkAL4ySSQYiNIZJJIzImpJJRDLgmOokkjA2JUqSMCzJKkgIkqSSAypckkAKM0skkOgM8ZZkkk9lFCZaXJF2BlZUqSAFyzJJKQF8IOSSIC5UkkYH//Z",
        "download_url": "",
        "photographer": {
          "name": "Leonardo Rossatti",
          "username": "leorossatti",
          "profile_url": ""
        },
        "alt_text": "Reflection on the salt flats"
      }
    ]
  },

  // ================= EUROPE =================
  {
    "id": "eiffel-tower-paris",
    "name": "Eiffel Tower",
    "search_query": "Eiffel Tower Paris",
    "location": {
      "continent": "Europe",
      "country": "France",
      "province_state": "Île-de-France",
      "lat": 48.8584,
      "lon": 2.2945
    },
    "category_ids": [
      "landmarks_sightseeing"
    ],
    "category_tags": [
      "monuments",
      "viewpoints",
      "city_landmarks"
    ],
    "rating": 4.7,
    "review_count_approx": 300000,
    "opening_hours_text": "Daily 09:30 - 23:45",
    "description_short": "The wrought-iron lattice tower on the Champ de Mars, a global cultural icon of France.",
    "description_long": "Constructed in 1889, the Eiffel Tower is the most-visited paid monument in the world. Visitors can ascend to the top for breathtaking views of Paris.",
    "best_season_to_visit": "Apr-Jun, Sep-Nov",
    "images": [
      {
        "url": "https://media.cntraveler.com/photos/58de89946c3567139f9b6cca/16:9/w_1920,c_limit/GettyImages-468366251.jpg",
        "download_url": "",
        "photographer": {
          "name": "Chris Karidis",
          "username": "chriskaridis",
          "profile_url": ""
        },
        "alt_text": "Eiffel Tower with blue sky"
      }
    ]
  },
  {
    "id": "colosseum-rome",
    "name": "Colosseum",
    "search_query": "Colosseum Rome",
    "location": {
      "continent": "Europe",
      "country": "Italy",
      "province_state": "Lazio",
      "lat": 41.8902,
      "lon": 12.4922
    },
    "category_ids": [
      "history_culture",
      "landmarks_sightseeing"
    ],
    "category_tags": [
      "ancient_ruins",
      "monuments"
    ],
    "rating": 4.8,
    "review_count_approx": 280000,
    "opening_hours_text": "Daily 08:30 - 19:00",
    "description_short": "The largest ancient amphitheatre ever built, situated in the center of Rome.",
    "description_long": "This elliptical amphitheatre held an estimated 50,000 to 80,000 spectators for gladiatorial contests. It remains an iconic symbol of Imperial Rome and one of Italy's most popular tourist attractions.",
    "best_season_to_visit": "Apr-May, Sep-Oct",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1080",
        "download_url": "",
        "photographer": {
          "name": "Michele Bitetto",
          "username": "michelebit",
          "profile_url": ""
        },
        "alt_text": "The Colosseum in Rome"
      }
    ]
  },
  {
    "id": "sagrada-familia-barcelona",
    "name": "La Sagrada Familia",
    "search_query": "Sagrada Familia Barcelona",
    "location": {
      "continent": "Europe",
      "country": "Spain",
      "province_state": "Catalonia",
      "lat": 41.4036,
      "lon": 2.1744
    },
    "category_ids": [
      "history_culture",
      "landmarks_sightseeing"
    ],
    "category_tags": [
      "temples_shrines",
      "architecture"
    ],
    "rating": 4.8,
    "review_count_approx": 190000,
    "opening_hours_text": "Daily 09:00 - 18:00",
    "description_short": "Antoni Gaudí's unfinished masterpiece, a basilica known for its unique organic architecture.",
    "description_long": "Construction began in 1882 and continues to this day. The basilica is famous for its towering spires and intricate facades combining Gothic and curvilinear Art Nouveau forms.",
    "best_season_to_visit": "Apr-Jun, Sep-Oct",
    "images": [
      {
        "url": "https://cdn-imgix.headout.com/mircobrands-content/image/b299bd25f75c1e299c877fed458576fa-Sagrada%20Familia%20-%20Facades.jpg?auto=format&w=1222.3999999999999&h=687.6&q=90&ar=16%3A9&crop=faces&fit=crop",
        "download_url": "",
        "photographer": {
          "name": "Daniel Corneschi",
          "username": "danielcorneschi",
          "profile_url": ""
        },
        "alt_text": "Sagrada Familia exterior"
      }
    ]
  },
  {
    "id": "santorini-greece",
    "name": "Santorini",
    "search_query": "Santorini Greece",
    "location": {
      "continent": "Europe",
      "country": "Greece",
      "province_state": "South Aegean",
      "lat": 36.3932,
      "lon": 25.4615
    },
    "category_ids": [
      "nature_outdoors",
      "landmarks_sightseeing"
    ],
    "category_tags": [
      "beaches_islands",
      "viewpoints"
    ],
    "rating": 4.8,
    "review_count_approx": 100000,
    "opening_hours_text": "24 Hours",
    "description_short": "Famous for its whitewashed houses with blue domes, stunning sunsets, and volcanic beaches.",
    "description_long": "Santorini is a volcanic island in the Cyclades group of the Greek islands. Its towns of Fira and Oia cling to cliffs above an underwater caldera, offering some of the most romantic views in the world.",
    "best_season_to_visit": "May-Jun, Sep-Oct",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=1080",
        "download_url": "",
        "photographer": {
          "name": "Ryan Spencer",
          "username": "ryanspencer",
          "profile_url": ""
        },
        "alt_text": "White houses of Santorini overlooking the sea"
      }
    ]
  },

  // ================= ANTARCTICA =================
  {
    "id": "lemaire-channel-antarctica",
    "name": "Lemaire Channel",
    "search_query": "Lemaire Channel Antarctica",
    "location": {
      "continent": "Antarctica",
      "country": "Antarctica",
      "province_state": "Graham Land",
      "lat": -65.1167,
      "lon": -64.0
    },
    "category_ids": [
      "nature_outdoors"
    ],
    "category_tags": [
      "natural_wonders",
      "viewpoints"
    ],
    "rating": 4.9,
    "review_count_approx": 5000,
    "opening_hours_text": "Access via Expedition Cruise",
    "description_short": "Known as 'Kodak Gap', a photogenic strait packed with icebergs and steep cliffs.",
    "description_long": "One of the most beautiful passages in Antarctica, flanked by steep cliffs and glaciers. The calm waters often reflect the stunning scenery, making it a favorite for photography.",
    "best_season_to_visit": "Dec-Feb",
    "images": [
      {
        "url": "https://www.swoop-antarctica.com/blog/wp-content/uploads/2024/07/Lemaire-Channel-on-Seaventure.jpg",
        "download_url": "",
        "photographer": {
          "name": "Torsten Dederichs",
          "username": "torstendederichs",
          "profile_url": ""
        },
        "alt_text": "Icebergs in Antarctica channel"
      }
    ]
  },
  {
    "id": "deception-island-antarctica",
    "name": "Deception Island",
    "search_query": "Deception Island Antarctica",
    "location": {
      "continent": "Antarctica",
      "country": "Antarctica",
      "province_state": "South Shetland Islands",
      "lat": -62.9408,
      "lon": -60.5559
    },
    "category_ids": [
      "nature_outdoors",
      "history_culture"
    ],
    "category_tags": [
      "mountains_volcanoes",
      "beaches_islands"
    ],
    "rating": 4.7,
    "review_count_approx": 4000,
    "opening_hours_text": "Access via Expedition Cruise",
    "description_short": "An active volcano with a flooded caldera and abandoned whaling station.",
    "description_long": "Deception Island provides a safe natural harbor in its flooded caldera. Visitors can hike the volcanic slopes and see the eerie remains of a historic whaling station.",
    "best_season_to_visit": "Nov-Mar",
    "images": [
      {
        "url": "https://www.barkeuropa.com/sites/barkeuropa/files/styles/keyvisual_inline_large_2160x880/public/2025-01/20B7A9105TPZ.webp?h=81094ff7&itok=7oHc1x8c",
        "download_url": "",
        "photographer": {
          "name": "Cassie Matias",
          "username": "cassiematias",
          "profile_url": ""
        },
        "alt_text": "Snowy landscape of Deception Island"
      }
    ]
  },
  {
    "id": "port-lockroy-antarctica",
    "name": "Port Lockroy",
    "search_query": "Port Lockroy Antarctica",
    "location": {
      "continent": "Antarctica",
      "country": "Antarctica",
      "province_state": "Palmer Archipelago",
      "lat": -64.825,
      "lon": -63.495
    },
    "category_ids": [
      "history_culture",
      "nature_outdoors"
    ],
    "category_tags": [
      "museums",
      "wildlife"
    ],
    "rating": 4.8,
    "review_count_approx": 3500,
    "opening_hours_text": "Summer Season Only",
    "description_short": "A historic British base turned museum and the world's southernmost post office.",
    "description_long": "Home to a colony of Gentoo penguins, Port Lockroy is a favorite stop. Visitors can tour the museum, send a postcard, and observe the penguins close up.",
    "best_season_to_visit": "Nov-Mar",
    "images": [
      {
        "url": "https://images.eu.ctfassets.net/vy34d8u43l9r/16ECxdOn7rGXGFtE9QoYLf/0375f542cb8b48f36101596a2d7d4f3d/port-lockroy-landscape-and-penguins---marsel-van-oosten.jpg?q=75&w=1920&fm=webp",
        "download_url": "",
        "photographer": {
          "name": "Derek Oyen",
          "username": "derekoyen",
          "profile_url": ""
        },
        "alt_text": "Penguins at Port Lockroy"
      }
    ]
  },
  {
    "id": "blood-falls-antarctica",
    "name": "Blood Falls",
    "search_query": "Blood Falls Antarctica",
    "location": {
      "continent": "Antarctica",
      "country": "Antarctica",
      "province_state": "Victoria Land",
      "lat": -77.7167,
      "lon": 162.2667
    },
    "category_ids": [
      "nature_outdoors"
    ],
    "category_tags": [
      "natural_wonders",
      "waterfalls"
    ],
    "rating": 4.6,
    "review_count_approx": 1000,
    "opening_hours_text": "Special Access Required",
    "description_short": "A striking outflow of iron-oxide-tainted saltwater flowing from the Taylor Glacier.",
    "description_long": "This unique geological feature gets its red color from iron-rich saltwater. It flows from a subglacial lake onto the ice-covered surface of West Lake Bonney in the Taylor Valley.",
    "best_season_to_visit": "Dec-Jan",
    "images": [
      {
        "url": "https://th-thumbnailer.cdn-si-edu.com/HLu_OAFkYBlGcsbWaW07cRo48m4=/1026x684/filters:no_upscale():focal(1851x862:1852x863)/https://tf-cmsv2-smithsonianmag-media.s3.amazonaws.com/filer/7d/ac/7dac1b02-397d-416f-aa8c-459a0489a4bd/blood-falls-1.jpg",
        "download_url": "",
        "photographer": {
          "name": "James Eades",
          "username": "jameseades",
          "profile_url": ""
        },
        "alt_text": "Glacial landscape in Antarctica"
      }
    ]
  },

  // ================= AUSTRALIA / OCEANIA =================
  {
    "id": "sydney-opera-house-australia",
    "name": "Sydney Opera House",
    "search_query": "Sydney Opera House",
    "location": {
      "continent": "Oceania",
      "country": "Australia",
      "province_state": "New South Wales",
      "lat": -33.8568,
      "lon": 151.2153
    },
    "category_ids": [
      "landmarks_sightseeing",
      "entertainment"
    ],
    "category_tags": [
      "architecture",
      "monuments",
      "city_landmarks"
    ],
    "rating": 4.8,
    "review_count_approx": 180000,
    "opening_hours_text": "Daily 09:00 - 17:00 (Tours)",
    "description_short": "A masterpiece of 20th-century architecture and a multi-venue performing arts centre.",
    "description_long": "Its unique sail-like design makes the Sydney Opera House one of the most recognizable buildings in the world. It hosts over 1,500 performances annually and is a UNESCO World Heritage Site.",
    "best_season_to_visit": "Sep-Nov, Mar-May",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=1080",
        "download_url": "",
        "photographer": {
          "name": "Keith Zhu",
          "username": "keithzhu",
          "profile_url": ""
        },
        "alt_text": "Sydney Opera House at sunset"
      }
    ]
  },
  {
    "id": "great-barrier-reef-australia",
    "name": "Great Barrier Reef",
    "search_query": "Great Barrier Reef",
    "location": {
      "continent": "Oceania",
      "country": "Australia",
      "province_state": "Queensland",
      "lat": -18.2871,
      "lon": 147.6992
    },
    "category_ids": [
      "nature_outdoors"
    ],
    "category_tags": [
      "natural_wonders",
      "beaches_islands"
    ],
    "rating": 4.7,
    "review_count_approx": 60000,
    "opening_hours_text": "24 Hours (Tours daytime)",
    "description_short": "The world's largest coral reef system, visible from space and teeming with marine life.",
    "description_long": "Stretching over 2,300 kilometers, the Great Barrier Reef is a diver's paradise. It is home to thousands of reefs, hundreds of islands, and countless species of fish, mollusks, and starfish.",
    "best_season_to_visit": "Jun-Oct",
    "images": [
      {
        "url": "https://i.guim.co.uk/img/media/a8869d965d6b1e19d459032bea35aec2069ec84b/0_45_5500_3301/master/5500.jpg?width=620&dpr=2&s=none&crop=none",
        "download_url": "",
        "photographer": {
          "name": "Yulia",
          "username": "yulia_t",
          "profile_url": ""
        },
        "alt_text": "Aerial view of Great Barrier Reef"
      }
    ]
  },
  {
    "id": "milford-sound-new-zealand",
    "name": "Milford Sound",
    "search_query": "Milford Sound New Zealand",
    "location": {
      "continent": "Oceania",
      "country": "New Zealand",
      "province_state": "Southland",
      "lat": -44.6414,
      "lon": 167.8974
    },
    "category_ids": [
      "nature_outdoors"
    ],
    "category_tags": [
      "waterfalls",
      "natural_wonders",
      "mountains_volcanoes"
    ],
    "rating": 4.9,
    "review_count_approx": 45000,
    "opening_hours_text": "24 Hours",
    "description_short": "A fiord in the southwest of New Zealand's South Island, known for towering Mitre Peak.",
    "description_long": "Described by Rudyard Kipling as the 'Eighth Wonder of the World', Milford Sound features sheer rock faces, rainforests, and waterfalls like Stirling and Bowen Falls plummeting down to the water.",
    "best_season_to_visit": "Dec-Mar",
    "images": [
      {
        "url": "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/07/b7/7f/0e/photo0jpg.jpg?w=2000&h=-1&s=1",
        "download_url": "",
        "photographer": {
          "name": "Galen Crout",
          "username": "galencrout",
          "profile_url": ""
        },
        "alt_text": "Mitre Peak in Milford Sound"
      }
    ]
  },
  {
    "id": "bora-bora-french-polynesia",
    "name": "Bora Bora",
    "search_query": "Bora Bora French Polynesia",
    "location": {
      "continent": "Oceania",
      "country": "French Polynesia",
      "province_state": "Leeward Islands",
      "lat": -16.5004,
      "lon": -151.7415
    },
    "category_ids": [
      "nature_outdoors",
      "shopping_lifestyle"
    ],
    "category_tags": [
      "beaches_islands",
      "spas_wellness"
    ],
    "rating": 4.8,
    "review_count_approx": 25000,
    "opening_hours_text": "24 Hours",
    "description_short": "A small South Pacific island northwest of Tahiti, famous for its turquoise lagoon and luxury bungalows.",
    "description_long": "Bora Bora is a major international tourist destination, famous for its aqua-centric luxury resorts. The island is surrounded by a lagoon and a barrier reef, with the extinct volcano Mount Otemanu rising at its center.",
    "best_season_to_visit": "May-Oct",
    "images": [
      {
        "url": "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/13/60/b0/bd/bora-bora.jpg?w=2400&h=1000&s=1",
        "download_url": "",
        "photographer": {
          "name": "Chris Leipelt",
          "username": "leipelt",
          "profile_url": ""
        },
        "alt_text": "Overwater bungalows in Bora Bora"
      }
    ]
  }
];