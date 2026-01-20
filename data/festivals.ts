// src/data/festivals.ts

export interface Festival {
  id: number;
  name: string;
  name_th: string;
  about: string;
  when: string;
  top_spot: string;
  image_url: string;
  country: string; // ✅ เพิ่ม field country
}

export const THAI_FESTIVALS: Festival[] = [
  {
    id: 1,
    name: "Songkran Festival",
    name_th: "เทศกาลสงกรานต์",
    about: "The world-famous Thai New Year celebration featuring massive water fights, merit-making at temples, and pouring scented water on elders' hands for blessings.",
    when: "April 13 - 15 (Annually)",
    top_spot: "Khao San Road (Bangkok), Chiang Mai Old City",
    image_url: "https://blog.bangkokair.com/wp-content/uploads/2025/02/Cover_places-to-visit-songkran.jpg",
    country: "Thailand" // ✅ ระบุประเทศ
  },
  {
    id: 2,
    name: "Loy Krathong & Yi Peng",
    name_th: "เทศกาลลอยกระทงและยี่เป็ง",
    about: "A festival of lights to pay respect to the Water Goddess. Features floating banana-leaf baskets (Krathongs) on water and releasing sky lanterns (Yi Peng) in the north.",
    when: "Full moon of the 12th lunar month (Usually November)",
    top_spot: "Sukhothai Historical Park, Chiang Mai",
    image_url: "https://d2e5ushqwiltxm.cloudfront.net/wp-content/uploads/sites/286/2024/11/05032317/Loy-Krathong-in-Chiang-Mai.jpeg",
    country: "Thailand"
  },
  {
    id: 3,
    name: "Phi Ta Khon (Ghost Festival)",
    name_th: "ประเพณีผีตาโขน",
    about: "A colorful and spirited masked procession found only in Loei province. Locals wear large, hand-painted masks made from coconut husks to enact a legend of Buddha's past life.",
    when: "June or July (Dates vary by lunar calendar)",
    top_spot: "Dan Sai District, Loei",
    image_url: "https://upload.wikimedia.org/wikipedia/en/5/5c/Ghosts.PeeTaKhon2.jpg",
    country: "Thailand"
  },
  {
    id: 4,
    name: "Phuket Vegetarian Festival",
    name_th: "เทศกาลกินเจภูเก็ต",
    about: "A 9-day Taoist celebration of spiritual cleansing. Famous for its spectacular and intense street processions involving spirit mediums piercing their cheeks with sharp objects.",
    when: "September or October (9th lunar month of Chinese calendar)",
    top_spot: "Phuket Old Town",
    image_url: "https://cms.dmpcdn.com/travel/2021/10/06/e154cac0-265c-11ec-b383-d3674359bacf_original.jpg",
    country: "Thailand"
  },
  {
    id: 5,
    name: "Candle Festival",
    name_th: "ประเพณีแห่เทียนพรรษา",
    about: "Marking the beginning of Buddhist Lent, this festival features magnificent, giant candles carved from beeswax, paraded through the city on elaborately decorated floats.",
    when: "July (Asalha Puja Day)",
    top_spot: "Thung Si Mueang, Ubon Ratchathani",
    image_url: "https://i0.wp.com/www.live-less-ordinary.com/wp-content/uploads/2017/10/Living-in-Rural-Thailand-Isaan-Potato-in-a-Rice-Field-Allan-Wilson-9-765x550.jpg?ssl=1",
    country: "Thailand"
  }
];