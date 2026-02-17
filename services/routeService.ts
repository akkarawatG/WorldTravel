// // services/routeService.ts

// const ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImE5YzEwZDVkYzkyZTQyOTZhMmM0ODEzOWM5NTU1NmRmIiwiaCI6Im11cm11cjY0In0='; // สมัครฟรีที่ openrouteservice.org

// export const getRouteData = async (start: [number, number], end: [number, number]) => {
//   try {
//     const response = await fetch(
//       `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${start[1]},${start[0]}&end=${end[1]},${end[0]}`
//     );
    
//     const data = await response.json();
//     const feature = data.features[0];
    
//     return {
//       distance: feature.properties.segments[0].distance, // หน่วยเมตร
//       duration: feature.properties.segments[0].duration, // หน่วยวินาที
//       geometry: feature.geometry.coordinates // เส้นทาง (ต้องสลับ lat/lng ตอนใช้กับ Leaflet)
//     };
//   } catch (error) {
//     console.error("Error calculating route:", error);
//     return null;
//   }
// };