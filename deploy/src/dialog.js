// UT 风格 DOM 对话框:替代原生 prompt/alert(原生弹窗强制显示
// "site.com says" 且无法移除;真实 <input> 才能用中文输入法)。
// 全站共用:排行榜改名、存档码导出/导入。

import { t } from "./i18n.js";

function baseBox(title, hint) {
  const wrap = document.createElement("div");
  wrap.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center;z-index:9999";
  const box = document.createElement("div");
  box.style.cssText = "background:#0e0b16;border:3px solid #f2ead8;border-radius:4px;padding:20px 24px;width:min(440px,88vw);font-family:monospace;color:#f2ead8";
  const titleEl = document.createElement("div");
  titleEl.style.cssText = "color:#ffd166;font-weight:bold;font-size:17px;margin-bottom:10px";
  titleEl.textContent = title;
  const hintEl = document.createElement("div");
  hintEl.style.cssText = "font-size:12px;color:#9a93ab;white-space:pre-line;margin-bottom:12px;line-height:1.6";
  hintEl.textContent = hint;
  box.append(titleEl, hintEl);
  wrap.append(box);
  return { wrap, box };
}

function mkBtn(label, primary) {
  const b = document.createElement("button");
  b.textContent = label;
  b.style.cssText = `font-family:monospace;font-weight:bold;font-size:14px;padding:8px 18px;border-radius:3px;cursor:pointer;border:2px solid ${primary ? "#ffd166" : "#5a5468"};background:${primary ? "#241a10" : "#1d1828"};color:${primary ? "#ffd166" : "#9a93ab"}`;
  return b;
}

// 输入框对话框 -> Promise<string|null>;opts.copy 加「复制」按钮
export function utPrompt({ title, hint, value = "", maxLength = 8, copy = false, secret = false }) {
  return new Promise((resolve) => {
    const { wrap, box } = baseBox(title, hint);
    const input = document.createElement("input");
    input.type = secret ? "password" : "text";
    input.maxLength = maxLength;
    input.value = value;
    // 16px+ or iOS zooms the whole page on focus
    input.style.cssText = "width:100%;box-sizing:border-box;background:#1d1828;border:2px solid #8fd6ff;border-radius:3px;color:#f2ead8;font-family:monospace;font-size:16px;padding:8px 10px;outline:none";
    const row = document.createElement("div");
    row.style.cssText = "display:flex;gap:10px;justify-content:flex-end;margin-top:16px";
    const done = (v) => {
      wrap.remove();
      resolve(v);
    };
    if (copy) {
      const copyBtn = mkBtn(t("复制", "Copy"), false);
      copyBtn.onclick = async () => {
        try {
          await navigator.clipboard.writeText(input.value);
          copyBtn.textContent = t("✓ 已复制", "✓ Copied");
        } catch {
          input.focus();
          input.select(); // clipboard blocked: at least leave it selected
        }
      };
      row.append(copyBtn);
    }
    const cancel = mkBtn(t("取消", "Cancel"), false);
    const ok = mkBtn(t("确定", "OK"), true);
    cancel.onclick = () => done(null);
    ok.onclick = () => done(input.value.trim() || null);
    input.onkeydown = (e) => {
      if (e.key === "Enter") ok.onclick();
      if (e.key === "Escape") done(null);
      e.stopPropagation(); // don't let the game's key handler see typing
    };
    wrap.onclick = (e) => {
      if (e.target === wrap) done(null);
    };
    row.append(cancel, ok);
    box.append(input, row);
    document.body.appendChild(wrap);
    input.focus();
    input.select();
  });
}

// 纯提示对话框 -> Promise<void>
export function utNotice({ title, hint }) {
  return new Promise((resolve) => {
    const { wrap, box } = baseBox(title, hint);
    const row = document.createElement("div");
    row.style.cssText = "display:flex;justify-content:flex-end;margin-top:16px";
    const ok = mkBtn(t("确定", "OK"), true);
    const done = () => {
      wrap.remove();
      resolve();
    };
    ok.onclick = done;
    wrap.onclick = (e) => {
      if (e.target === wrap) done();
    };
    row.append(ok);
    box.append(row);
    document.body.appendChild(wrap);
    ok.focus();
  });
}
