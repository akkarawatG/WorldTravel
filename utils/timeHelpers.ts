// utils/timeHelpers.ts

// แปลงจาก "13:00:00" (DB) -> { hour: "01", minute: "00", ampm: "PM" } (UI)
export const parseTimeFromDB = (timeStr: string | null) => {
  if (!timeStr) return { hour: "09", minute: "00", ampm: "AM" as "AM" | "PM" }; // Default

  const [h, m] = timeStr.split(':');
  let hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";

  hour = hour % 12;
  hour = hour ? hour : 12; // ถ้าเป็น 0 ให้ปัดเป็น 12

  return {
    hour: hour.toString().padStart(2, '0'),
    minute: m,
    ampm: ampm as "AM" | "PM"
  };
};

// แปลงจาก { hour: "01", ampm: "PM" } (UI) -> "13:00:00" (DB)
export const formatTimeToDB = (hour: string, minute: string, ampm: string) => {
  let h = parseInt(hour);
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;

  return `${h.toString().padStart(2, '0')}:${minute}:00`;
};

// แปลง "13:00:00" -> "01:00 PM" สำหรับแสดงผล text บนหน้าเว็บ
export const formatTimeDisplay = (timeStr: string | null) => {
  if (!timeStr) return "Add time";
  const { hour, minute, ampm } = parseTimeFromDB(timeStr);
  return `${hour}:${minute} ${ampm}`;
};