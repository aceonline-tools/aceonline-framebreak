// app/components/WelcomeCard.tsx
"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "framebreak:onboarded";

export function WelcomeCard() {
  const [hasMounted, setHasMounted] = useState(false);
  const [isCardOpen, setIsCardOpen] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const hasOnboarded = window.localStorage.getItem(STORAGE_KEY) === "true";
    if (!hasOnboarded) {
      setIsCardOpen(true);
    }
  }, []);

  const closeCard = () => {
    window.localStorage.setItem(STORAGE_KEY, "true");
    setIsCardOpen(false);
  };

  const openCard = () => {
    setIsCardOpen(true);
  };

  if (!hasMounted) return null;

  return (
    <div className="mb-6 flex flex-col gap-3">
      <button
        type="button"
        onClick={openCard}
        aria-expanded={isCardOpen}
        className="fixed right-3 top-3 z-40 cursor-pointer rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs font-medium text-neutral-600 shadow-sm hover:bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
      >
        ? Hướng dẫn
      </button>
      <p className="text-xs italic text-neutral-500 dark:text-neutral-400">
        Lưu ý: công cụ không chính thức, do cá nhân phát triển. Kết quả chỉ mang tính tham khảo
        và có thể sai số nhẹ so với thực tế trong game.
      </p>

      {isCardOpen && (
        <section
          role="region"
          aria-label="Hướng dẫn sử dụng"
          className="relative rounded-lg border border-sky-200 bg-sky-50 p-4 pr-10 text-sm text-neutral-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-neutral-200"
        >
          <button
            type="button"
            aria-label="Đóng hướng dẫn"
            onClick={closeCard}
            className="absolute right-2 top-2 cursor-pointer rounded px-2 py-0.5 text-neutral-500 hover:bg-sky-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-sky-900/40 dark:hover:text-neutral-200"
          >
            ✕
          </button>
          <h2 className="mb-2 text-base font-semibold text-neutral-900 dark:text-neutral-50">
            Chào mừng đến với Ace Online — Tính đạn AG
          </h2>
          <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed">
            <li>
              Nhập <strong className="font-semibold">Tck cơ bản</strong> của vũ khí (ví dụ BS:
              0.45, Rante: 0.3).
            </li>
            <li>
              Chọn <strong className="font-semibold">sup đầu</strong> và{" "}
              <strong className="font-semibold">sup đuôi</strong>.
            </li>
            <li>
              <strong className="font-semibold">Enchant khác</strong>: tự động enchant các thẻ
              còn dư theo XP, CX, hoặc Cự ly.
            </li>
            <li>
              Hàng ngang là <strong className="font-semibold">Tck thường</strong>, hàng dọc là{" "}
              <strong className="font-semibold">Tck DB</strong>.
            </li>
            <li>
              Bấm vào nhiều ô để so sánh chi tiết cùng lúc; bấm lại để bỏ chọn.
            </li>
            <li>
              Nên chọn các mốc có số dư bé (ví dụ{" "}
              <strong className="font-semibold">15.12</strong> thay vì{" "}
              <strong className="font-semibold">15.89</strong>).
            </li>
            <li>
              Bấm <strong className="font-semibold">+ Add build</strong> để so sánh nhiều build,
              và <strong className="font-semibold">Copy link</strong> để chia sẻ cấu hình hiện
              tại.
            </li>
          </ul>
          <div className="mt-3 text-right">
            <button
              type="button"
              onClick={closeCard}
              className="cursor-pointer rounded bg-sky-600 px-3 py-1 text-sm font-medium text-white hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400"
            >
              Đã hiểu
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
