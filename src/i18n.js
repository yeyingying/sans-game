// 轻量中英切换(2026-07-14 用户确认 v1 边界: 界面壳全英化,叙事层暂保中文)。
// 用法: t("中文", "English") 内联对——中文是源文案,英文跟在旁边,免 key 字典。
// 叙事文本(箴言/死亡台词/回响/章节/梗)不走 t(),等独立批次逐条再创作。
const store = typeof localStorage !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {} };

let lang = store.getItem("lang") === "en" ? "en" : "zh";

export function currentLang() {
  return lang;
}

export function toggleLang() {
  lang = lang === "zh" ? "en" : "zh";
  store.setItem("lang", lang);
  return lang;
}

export function t(zh, en) {
  return lang === "en" && en != null ? en : zh;
}

// 数据对象取本地化字段: pick(obj, "name") → obj.nameEn(EN且存在时) / obj.name
export function pick(obj, field) {
  if (!obj) return "";
  const en = obj[field + "En"];
  return lang === "en" && en != null ? en : obj[field];
}
