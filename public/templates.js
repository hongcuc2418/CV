export const TEMPLATES = {
  academic: {
    id: "academic",
    name: "Academic Executive",
    label: "Học thuật · Sang trọng",
    description:
      "Đầu trang đậm, hai cột cân đối và sắc đồng tinh tế. Dành cho hồ sơ trong môi trường đại học.",
    layout: "sidebar",
    badge: "Mẫu mặc định",
    sideSections: [
      "institutions",
      "education",
      "expertise",
      "tools",
      "languages",
      "skills",
      "certificates",
    ],
  },
  modern: {
    id: "modern",
    name: "Modern Professional",
    label: "Hiện đại · Chuyên nghiệp",
    description:
      "Một cột thoáng, phân cấp mạnh và nhịp nội dung rõ. Làm nổi bật hành trình cùng đóng góp chuyên môn.",
    layout: "single",
    badge: "Hiện đại",
    sideSections: [],
  },
  classic: {
    id: "classic",
    name: "Classic ATS",
    label: "Rõ ràng · Tập trung nội dung",
    description:
      "Một cột văn bản, không ảnh và không mảng nền. Ưu tiên thứ tự đọc và khả năng trích xuất chữ.",
    layout: "single",
    badge: "Ưu tiên văn bản",
    sideSections: [],
  },
};
export const templateFor = (data) =>
  TEMPLATES[data.design.template || "academic"] || TEMPLATES.academic;
export const laneFor = (data, key) =>
  templateFor(data).sideSections.includes(key) ? "side" : "main";
export function selectTemplate(data, id) {
  if (!Object.hasOwn(TEMPLATES, id)) throw Error("Mẫu CV không hợp lệ.");
  data.design.template = id;
  return data;
}
