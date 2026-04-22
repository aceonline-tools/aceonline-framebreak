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
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs italic text-neutral-500">
          Lưu ý: công cụ không chính thức, do cá nhân phát triển. Kết quả chỉ mang tính tham
          khảo và có thể sai số nhẹ so với thực tế trong game.
        </p>
        <button
          type="button"
          onClick={openCard}
          aria-expanded={isCardOpen}
          className="shrink-0 cursor-pointer rounded-full border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-100"
        >
          ? Hướng dẫn
        </button>
      </div>

      {isCardOpen && (
        <section
          role="region"
          aria-label="Hướng dẫn sử dụng"
          className="rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm text-neutral-700"
        >
          <div className="mb-2 flex items-start justify-between gap-3">
            <h2 className="text-base font-semibold text-neutral-900">
              Chào mừng đến với Ace Online — Tính đạn AG
            </h2>
            <button
              type="button"
              aria-label="Đóng hướng dẫn"
              onClick={closeCard}
              className="cursor-pointer rounded px-2 py-0.5 text-neutral-500 hover:bg-sky-100 hover:text-neutral-700"
            >
              ✕
            </button>
          </div>
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
              Ô được{" "}
              <span className="rounded bg-amber-200 px-1 font-semibold text-amber-900">
                bôi vàng
              </span>{" "}
              là các mốc tròn đạn. Bấm vào nhiều ô để so sánh chi tiết cùng lúc; bấm lại để bỏ
              chọn.
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
              className="cursor-pointer rounded bg-sky-600 px-3 py-1 text-sm font-medium text-white hover:bg-sky-700"
            >
              Đã hiểu
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
