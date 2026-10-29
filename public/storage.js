import {
  STORAGE_KEY,
  LEGACY_KEY,
  clone,
  defaults,
  validateData,
} from "./model.js";
export function loadData(storage) {
  try {
    const current = storage.getItem(STORAGE_KEY);
    if (current)
      return {
        data: validateData(JSON.parse(current)),
        migrated: false,
        error: null,
      };
    const legacy = storage.getItem(LEGACY_KEY);
    if (legacy)
      return {
        data: validateData(JSON.parse(legacy)),
        migrated: true,
        error: null,
      };
    return { data: clone(defaults), migrated: false, error: null };
  } catch (e) {
    return {
      data: clone(defaults),
      migrated: false,
      error: e.message || "Không đọc được dữ liệu.",
    };
  }
}
export function saveData(storage, data) {
  const clean = validateData(data);
  storage.setItem(STORAGE_KEY, JSON.stringify(clean));
  return clean;
}
