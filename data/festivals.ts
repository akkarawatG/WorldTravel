// src/data/festivals.ts

export interface Festival {
  id: number;
  name: string;
  name_th: string;
  about: string;
  when: string;
  top_spot: string;
  image_url: string;
  country: string;
}

export const THAI_FESTIVALS: Festival[] = [
  // --- JANUARY ---
  {
    id: 6,
    name: "Bo Sang Umbrella Festival",
    name_th: "เทศกาลร่มบ่อสร้าง",
    about: "A colorful celebration of local craftsmanship, featuring parades of beautifully decorated paper umbrellas, cultural performances, and beauty pageants.",
    when: "Third weekend of January",
    top_spot: "San Kamphaeng, Chiang Mai",
    image_url: "https://www.aleenta.com/wp-content/uploads/Bo-Sang-Umbrella-Festival.jpg",
    country: "Thailand"
  },
  {
    id: 7,
    name: "Chinese New Year",
    name_th: "วันตรุษจีน",
    about: "One of the biggest celebrations in Thailand due to the large Thai-Chinese population. Expect vibrant dragon parades, firecrackers, and red decorations everywhere.",
    when: "Late January or Early February",
    top_spot: "Yaowarat (Chinatown), Bangkok",
    image_url: "https://media-cldnry.s-nbcnews.com/image/upload/t_fit-1000w,f_auto,q_auto:best/rockcms/2024-02/240207-lunar-new-year-festival-san-francisco-vl-235p-332c2a.jpg",
    country: "Thailand"
  },
  {
    id: 8,
    name: "National Children's Day",
    name_th: "วันเด็กแห่งชาติ",
    about: "A day dedicated to children, where government offices, military bases, and museums open their doors for free with special activities and gifts.",
    when: "Second Saturday of January",
    top_spot: "Nationwide (Government House, Military Bases)",
    image_url: "https://images.squarespace-cdn.com/content/v1/5d3d5921fa823600016c24ba/56a8b71d-b6aa-4b25-9a25-81b782669899/childrens-day-thailand-2025-kids-playing.jpg?format=1000w",
    country: "Thailand"
  },

  // --- FEBRUARY ---
  {
    id: 9,
    name: "Chiang Mai Flower Festival",
    name_th: "มหกรรมไม้ดอกไม้ประดับเชียงใหม่",
    about: "A spectacular display of floral floats, garden competitions, and blooming flowers, showcasing the rich agricultural heritage of the north.",
    when: "First weekend of February",
    top_spot: "Suan Buak Haad, Chiang Mai",
    image_url: "https://j6m3f5v5.delivery.rocketcdn.me/wp-content/uploads/2024/07/chiang-mai-flower-festival.jpg",
    country: "Thailand"
  },
  {
    id: 10,
    name: "Makha Bucha Day",
    name_th: "วันมาฆบูชา",
    about: "An important Buddhist holiday commemorating the gathering of 1,250 enlightened monks. Buddhists visit temples to make merit and join candlelight processions.",
    when: "Full moon of the 3rd lunar month (February)",
    top_spot: "Wat Phra Kaew (Bangkok), Nationwide",
    image_url: "https://www.expique.com/wp-content/uploads/2021/01/Makha-Bucha-Day-3.jpg",
    country: "Thailand"
  },
  {
    id: 11,
    name: "Trang Underwater Wedding",
    name_th: "พิธีวิวาห์ใต้สมุทร",
    about: "A unique event where couples dive deep into the ocean to register their marriage, promoting tourism and the beauty of Trang's seas.",
    when: "Mid February (Valentine's Day)",
    top_spot: "Pak Meng Beach, Trang",
    image_url: "https://photos.smugmug.com/Experiences/Romance/i-2jnQMTW/0/bd8d7e90/L/Trang-Underwater-Wedding-Ceremony-5-L.jpg",
    country: "Thailand"
  },

  // --- MARCH ---
  {
    id: 12,
    name: "National Elephant Day",
    name_th: "วันช้างไทย",
    about: "A day to honor Thailand's national animal. Elephant camps across the country host special buffets and blessing ceremonies for the gentle giants.",
    when: "13 March",
    top_spot: "Thai Elephant Conservation Center, Lampang",
    image_url: "https://changpuakmagazine.com/images/article/91617CQ9P0356.JPG",
    country: "Thailand"
  },
  {
    id: 13,
    name: "Pattaya Music Festival",
    name_th: "เทศกาลดนตรีพัทยา",
    about: "One of the longest-running beach music festivals in Asia, featuring artists from Thailand and around the world on stages along the beach.",
    when: "Weekends in March",
    top_spot: "Pattaya Beach, Chonburi",
    image_url: "https://www.thailandcarsrentals.com/wp-content/uploads/2016/12/pattaya_music_festival.jpg",
    country: "Thailand"
  },
  {
    id: 14,
    name: "Thao Suranari Fair",
    name_th: "งานฉลองวันแห่งชัยชนะของท้าวสุรนารี",
    about: "A grand commemoration of the local heroine 'Ya Mo'. Features historical processions, folk songs (Pleng Korat), and light & sound shows.",
    when: "23 March - 3 April",
    top_spot: "Thao Suranari Monument, Nakhon Ratchasima",
    image_url: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/13/90/d6/17/thao-suranaree-monument.jpg?w=700&h=-1&s=1",
    country: "Thailand"
  },

  // --- APRIL ---
  {
    id: 1,
    name: "Songkran Festival",
    name_th: "เทศกาลสงกรานต์",
    about: "The world-famous Thai New Year celebration featuring massive water fights, merit-making at temples, and pouring scented water on elders' hands for blessings.",
    when: "13 - 15 April (Annually)",
    top_spot: "Khao San Road (Bangkok), Chiang Mai Old City",
    image_url: "https://blog.bangkokair.com/wp-content/uploads/2025/02/Cover_places-to-visit-songkran.jpg",
    country: "Thailand"
  },
  {
    id: 15,
    name: "Wan Lai Festival",
    name_th: "ประเพณีวันไหล",
    about: "The flowing day or 'Songkran extension' in the eastern region. Famous for sand pagoda competitions on the beach and continued water splashing.",
    when: "16 - 20 April",
    top_spot: "Bang Saen Beach & Pattaya, Chonburi",
    image_url: "https://image.makewebcdn.com/makeweb/m_1920x0/NITjl2JG3/events/songkran_Wan_Lai_Pattaya_thailand.jpg?v=202405291424",
    country: "Thailand"
  },
  {
    id: 16,
    name: "Poi Sang Long",
    name_th: "ประเพณีปอยส่างลอง",
    about: "A colorful novice monk ordination ceremony of the Shan people (Tai Yai). Young boys are dressed as princes and paraded on shoulders.",
    when: "Early April",
    top_spot: "Mae Hong Son",
    image_url: "https://images.pickyourtrail.com/Poy_Sang_Long_Festival_in_Chiang_Mai_ddccbab0eb.jpg?auto=format&fit=crop&w=1200&q=75",
    country: "Thailand"
  },

  // --- MAY ---
  {
    id: 17,
    name: "Bun Bang Fai (Rocket Festival)",
    name_th: "ประเพณีบุญบั้งไฟ",
    about: "An ancient rain-calling ceremony where locals launch giant home-made bamboo rockets into the sky to encourage the gods to send rain for the rice season.",
    when: "Mid May (Before planting season)",
    top_spot: "Yasothon Province",
    image_url: "https://www.discoverythailand.com/storage/img/frontend/newevent/bangfai.jpg",
    country: "Thailand"
  },
  {
    id: 18,
    name: "Royal Ploughing Ceremony",
    name_th: "พระราชพิธีพืชมงคลจรดพระนังคัลแรกนาขวัญ",
    about: "An ancient royal rite to mark the auspicious beginning of the rice-growing season. Sacred oxen predict the year's harvest.",
    when: "May (Date varies by astrologers)",
    top_spot: "Sanam Luang, Bangkok",
    image_url: "https://scontent.fbkk3-1.fna.fbcdn.net/v/t1.6435-9/59667302_2223657097750416_4948088807900577792_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeE7is7AeUtO_LK_XHfPJY4V7sAif0elKO_uwCJ_R6Uo7-3dFBHgq2MiBJMVThWCqF6sYHS2JXQNjiDCt_-MPRYi&_nc_ohc=GZV-AXfuoB8Q7kNvwF9v7jQ&_nc_oc=AdnO1HqEcEsNodV-l4LLcvCRmRFY8cUPYNvENfzJft6eaZDcKeymdzfLaq_1k9gG058&_nc_zt=23&_nc_ht=scontent.fbkk3-1.fna&_nc_gid=ISXF_LXpgJn5y4uC_VpI1Q&oh=00_Afo1tcwtNUoDJb3v6BLwpRIPSDXH8nVtrmXfyS8klFed2A&oe=69967E8E",
    country: "Thailand"
  },
  {
    id: 19,
    name: "Visakha Bucha Day",
    name_th: "วันวิสาขบูชา",
    about: "The holiest day in Buddhism, marking the birth, enlightenment, and death of Buddha. Features temple sermons and evening candlelit processions.",
    when: "Full moon of the 6th lunar month (May)",
    top_spot: "Phutthamonthon (Nakhon Pathom), Nationwide",
    image_url: "https://www.expique.com/wp-content/uploads/2021/01/Visakha-Bucha-2-1.jpg",
    country: "Thailand"
  },

  // --- JUNE ---
  {
    id: 3,
    name: "Phi Ta Khon (Ghost Festival)",
    name_th: "ประเพณีผีตาโขน",
    about: "A colorful and spirited masked procession found only in Loei province. Locals wear large, hand-painted masks made from coconut husks to enact a legend of Buddha's past life.",
    when: "June or July (Dates vary)",
    top_spot: "Dan Sai District, Loei",
    image_url: "https://upload.wikimedia.org/wikipedia/en/5/5c/Ghosts.PeeTaKhon2.jpg",
    country: "Thailand"
  },
  {
    id: 20,
    name: "Rayong Fruit Festival",
    name_th: "เทศกาลผลไม้และของดีเมืองระยอง",
    about: "A celebration of Thailand's tropical fruits like Durian, Mangosteen, and Rambutan. Includes fruit buffets, float parades, and agricultural contests.",
    when: "May - June",
    top_spot: "Tapong Fruit Market, Rayong",
    image_url: "https://3.bp.blogspot.com/-pXeK37ua5yA/VWM42USjNxI/AAAAAAAAOV0/we1uWDGHBUc/s1600/Rayong-Durian-Fest-Dance-3.jpg",
    country: "Thailand"
  },
  {
    id: 21,
    name: "Hua Hin Jazz Festival",
    name_th: "หัวหินแจ๊สเฟสติวัล",
    about: "A relaxed musical event held directly on the sands of Hua Hin beach, featuring world-class jazz musicians and local talents.",
    when: "June (Dates vary)",
    top_spot: "Hua Hin Beach, Prachuap Khiri Khan",
    image_url: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0d/5b/06/37/the-hua-hin-jazz-festival.jpg?w=2000&h=-1&s=1",
    country: "Thailand"
  },

  // --- JULY ---
  {
    id: 5,
    name: "Candle Festival",
    name_th: "ประเพณีแห่เทียนพรรษา",
    about: "Marking the beginning of Buddhist Lent, this festival features magnificent, giant candles carved from beeswax, paraded through the city on elaborately decorated floats.",
    when: "July (Asalha Puja Day)",
    top_spot: "Thung Si Mueang, Ubon Ratchathani",
    image_url: "https://i0.wp.com/www.live-less-ordinary.com/wp-content/uploads/2017/10/Living-in-Rural-Thailand-Isaan-Potato-in-a-Rice-Field-Allan-Wilson-9-765x550.jpg?ssl=1",
    country: "Thailand"
  },
  {
    id: 22,
    name: "Tak Bat Dok Mai",
    name_th: "ประเพณีตักบาตรดอกไม้",
    about: "A floral almsgiving ceremony where locals offer 'Dok Khao Phansa' flowers to monks ascending the temple steps, believed to bring great merit.",
    when: "July (Khao Phansa Day)",
    top_spot: "Wat Phra Phutthabat, Saraburi",
    image_url: "https://img.thaicdn.net/u/2019/sireeporn/travel-16/P1.jpg",
    country: "Thailand"
  },
  {
    id: 23,
    name: "Asalha Puja",
    name_th: "วันอาสาฬหบูชา",
    about: "Commemorates the Buddha's first sermon. It is a day of merit-making, listening to sermons, and evening processions at temples.",
    when: "Full moon of the 8th lunar month (July)",
    top_spot: "Nationwide",
    image_url: "https://blog.bham.ac.uk/culturalcalendar/wp-content/uploads/sites/70/2023/06/asalha-puja-1653071550.jpg",
    country: "Thailand"
  },

  // --- AUGUST ---
  {
    id: 24,
    name: "Mother's Day",
    name_th: "วันแม่แห่งชาติ",
    about: "Celebrated on the birthday of Queen Mother Sirikit. Buildings are decorated with lights and portraits, and children offer jasmine garlands to their mothers.",
    when: "12 August",
    top_spot: "Ratchadamnoen Avenue, Bangkok",
    image_url: "https://www.thaizer.com/wp-content/uploads/2013/08/HM_Queen_Sirikit_Thailand2-3.jpg",
    country: "Thailand"
  },
  {
    id: 25,
    name: "Akha Swing Festival",
    name_th: "ประเพณีโล้ชิงช้า",
    about: "A harvest festival of the Akha hill tribe known as the 'Women's New Year', featuring ritual swinging on giant wooden structures to honor the goddess of fertility.",
    when: "Late August - Early September",
    top_spot: "Akha Villages, Chiang Rai",
    image_url: "https://medias.thansettakij.com/uploads/images/contents/w1024/2022/08/4iaVcPMrfdWcqtTVpR1h.webp?x-image-process=style/lg-webp",
    country: "Thailand"
  },
  {
    id: 26,
    name: "Por Tor Festival (Hungry Ghost)",
    name_th: "งานประเพณีพ้อต่อ",
    about: "An ethnic Chinese tradition in Phuket where ancestors and wandering spirits are honored with food offerings, specifically red turtle-shaped cakes.",
    when: "August - September",
    top_spot: "Phuket Town",
    image_url: "https://photos.smugmug.com/Experiences/Festivals/i-5trgnq4/0/222f2580/XL/Phuket_PorTorHungryGhost_Shukshutterstock_nokhook_2000-XL.jpg",
    country: "Thailand"
  },

  // --- SEPTEMBER ---
  {
    id: 4,
    name: "Phuket Vegetarian Festival",
    name_th: "เทศกาลกินเจภูเก็ต",
    about: "A 9-day Taoist celebration of spiritual cleansing. Famous for its spectacular and intense street processions involving spirit mediums piercing their cheeks with sharp objects.",
    when: "September or October (9th lunar month)",
    top_spot: "Phuket Old Town",
    image_url: "https://cms.dmpcdn.com/travel/2021/10/06/e154cac0-265c-11ec-b383-d3674359bacf_original.jpg",
    country: "Thailand"
  },
  {
    id: 27,
    name: "Phichit Boat Racing Festival",
    name_th: "ประเพณีแข่งขันเรือยาว",
    about: "Exciting long-boat races on the Nan River during the high-tide season, attracting teams from across the country and fostering local unity.",
    when: "September",
    top_spot: "Wat Tha Luang, Phichit",
    image_url: "https://changpuakmagazine.com/images/article/18353702Brace_sep23.jpg",
    country: "Thailand"
  },
  {
    id: 28,
    name: "Sat Thai Festival ",
    name_th: "ประเพณีสารทเดือนสิบ",
    about: "A southern tradition to make merit for deceased ancestors. The highlight is the 'Hing Prets' parade representing spirits seeking merit.",
    when: "Late September",
    top_spot: "Nakhon Si Thammarat",
    image_url: "https://nakhonsithammarat.prd.go.th/th/file/get/file/2021120245c48cce2e2d7fbdea1afc51c7c6ad26090832.jpg",
    country: "Thailand"
  },

  // --- OCTOBER ---
  {
    id: 29,
    name: "Naga Fireball Festival",
    name_th: "บั้งไฟพญานาค",
    about: "A mysterious phenomenon where glowing red balls rise from the Mekong River, believed by locals to be breathed out by the mythical Naga.",
    when: "End of Buddhist Lent (October)",
    top_spot: "Phon Phisai, Nong Khai",
    image_url: "https://media-cdn.tripadvisor.com/media/photo-s/14/b7/92/4c/the-event-grounds-and.jpg",
    country: "Thailand"
  },
  {
    id: 30,
    name: "Chonburi Buffalo Racing",
    name_th: "ประเพณีวิ่งควาย",
    about: "A fast-paced and fun tradition celebrating the water buffalo's role in agriculture. Buffalos are decorated and raced by jockeys.",
    when: "October (Before full moon of 11th month)",
    top_spot: "Chonburi City",
    image_url: "https://jaytindall.asia/wp-content/uploads/2020/03/Buffalo-Races-1.jpg",
    country: "Thailand"
  },
  {
    id: 31,
    name: "Ok Phansa",
    name_th: "วันออกพรรษา",
    about: "The end of the three-month Buddhist Lent. Marked by boat processions (Illuminated Boat Procession) and giving alms to monks.",
    when: "Full moon of October",
    top_spot: "Nakhon Phanom (Illuminated Boats)",
    image_url: "https://static.thairath.co.th/media/dFQROr7oWzulq5Fa6rfcDqzCpQQOzRLIY1Imi0Xzpo3FkETXZPHYllwVjOcL0azg3Ot.webp",
    country: "Thailand"
  },

  // --- NOVEMBER ---
  {
    id: 2,
    name: "Loy Krathong & Yi Peng",
    name_th: "เทศกาลลอยกระทงและยี่เป็ง",
    about: "A festival of lights to pay respect to the Water Goddess. Features floating banana-leaf baskets (Krathongs) on water and releasing sky lanterns (Yi Peng) in the north.",
    when: "Full moon of the 12th lunar month (November)",
    top_spot: "Sukhothai Historical Park, Chiang Mai",
    image_url: "https://d2e5ushqwiltxm.cloudfront.net/wp-content/uploads/sites/286/2024/11/05032317/Loy-Krathong-in-Chiang-Mai.jpeg",
    country: "Thailand"
  },
  {
    id: 32,
    name: "Lopburi Monkey Buffet Festival",
    name_th: "โต๊ะจีนลิงลพบุรี",
    about: "A bizarre but fun feast prepared for the thousands of macaques living in the ruins of Lopburi, thanking them for bringing tourism to the city.",
    when: "Last Sunday of November",
    top_spot: "Phra Prang Sam Yot, Lopburi",
    image_url: "https://news.cgtn.com/news/3d3d774d3255444f30457a6333566d54/img/758d7a1721ef4901aca0288b008d080f/758d7a1721ef4901aca0288b008d080f.jpg",
    country: "Thailand"
  },
  {
    id: 33,
    name: "Surin Elephant Round-up",
    name_th: "งานช้างสุรินทร์",
    about: "A grand showcase of elephants featuring parades, re-enactments of historical battles, and displays of the bond between mahouts and elephants.",
    when: "Third week of November",
    top_spot: "Srinarong Stadium, Surin",
    image_url: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/9c/87/a0/caption.jpg?w=1400&h=800&s=1",
    country: "Thailand"
  },

  // --- DECEMBER ---
  {
    id: 34,
    name: "Ayutthaya World Heritage Fair",
    name_th: "งานยอยศยิ่งฟ้าอยุธยามรดกโลก",
    about: "Celebrating Ayutthaya's UNESCO status with spectacular light and sound shows among the ancient ruins, period costume markets, and cultural shows.",
    when: "Mid December",
    top_spot: "Ayutthaya Historical Park",
    image_url: "https://www.thaitravelcenter.com/thailand/wp-content/uploads/2023/12/Ayutthaya-01.jpg",
    country: "Thailand"
  },
  {
    id: 35,
    name: "Wonderfruit Festival",
    name_th: "วันเดอร์ฟรุ๊ต",
    about: "A sustainable lifestyle festival celebrating art, music, food, and ideas. A modern, globally attractive event promoting eco-conscious living.",
    when: "Mid December",
    top_spot: "The Fields at Siam Country Club, Pattaya",
    image_url: "https://storage.googleapis.com/tagthai-prd-content/image_b79074cc09/image_b79074cc09.webp",
    country: "Thailand"
  },
  {
    id: 36,
    name: "New Year Countdown",
    name_th: "งานเคาท์ดาวน์ปีใหม่",
    about: "Thailand celebrates the global New Year with massive fireworks displays, concerts, and street parties across major cities.",
    when: "31 December",
    top_spot: "Central World (Bangkok), IconSiam",
    image_url: "https://bangkokcountdown.com/images/event/iconsiam-countdown.webp",
    country: "Thailand"
  }
];