"use client";

import { useState, useEffect, useCallback } from "react";

const parceiroImagens = [
  "https://static.wixstatic.com/media/240889_82b1d86584c540888f57a76934ec38dd~mv2.png",
  "https://static.wixstatic.com/media/240889_fcf58f87d5b34608a3cb508d063e3690~mv2.png",
  "https://static.wixstatic.com/media/240889_1c08cc8bfbb54d388355df86348e1a2f~mv2.png",
  "https://static.wixstatic.com/media/240889_11fe110de7f64244952bba19ed1409c6~mv2.png",
  "https://static.wixstatic.com/media/240889_967470bceed2476cb2e707a2607ec174~mv2.png",
  "https://static.wixstatic.com/media/240889_5bc790771937436d8afd01ba96be8393~mv2.png",
  "https://static.wixstatic.com/media/240889_8fc122a50a00459b9ff1dedfb72ef7d0~mv2.png",
  "https://static.wixstatic.com/media/240889_29fcc357e5844fc19c3f0ae5ed15f9b9~mv2.png",
  "https://static.wixstatic.com/media/240889_c305072b88024aab8fd3cdb558823156~mv2.png",
  "https://static.wixstatic.com/media/240889_97ca950731df4996abac8864d9bda6c9~mv2.png",
  "https://static.wixstatic.com/media/240889_6f717ab569a84e27998ef18582e96328~mv2.png",
  "https://static.wixstatic.com/media/240889_a9ea3fc15c2943b99eaf347a96455220~mv2.png",
  "https://static.wixstatic.com/media/240889_81a5419a5aa14471b4664b40754c0e4b~mv2.png",
];

const VISIBLE = 4;
const TOTAL = parceiroImagens.length;

export default function CarouselParceiros() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const maxIndex = TOTAL - VISIBLE;

  const prev = useCallback(() => {
    setCurrent(c => (c <= 0 ? maxIndex : c - 1));
  }, [maxIndex]);

  const next = useCallback(() => {
    setCurrent(c => (c >= maxIndex ? 0 : c + 1));
  }, [maxIndex]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 3000);
    return () => clearInterval(id);
  }, [paused, next]);

  const dotCount = maxIndex + 1;

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Arrow left */}
      <button
        onClick={prev}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-10 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
        style={{ background: "#ffcd07", border: "none" }}
        aria-label="Anterior"
      >
        <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>

      {/* Track */}
      <div className="overflow-hidden rounded-2xl">
        <div
          className="flex gap-5 transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(calc(-${current} * (100% / ${VISIBLE}) - ${current} * 20px / ${VISIBLE}))` }}
        >
          {parceiroImagens.map((url, i) => (
            <div
              key={i}
              className="flex-shrink-0 rounded-2xl overflow-hidden bg-white flex items-center justify-center"
              style={{
                width: `calc(${100 / VISIBLE}% - ${(VISIBLE - 1) * 20 / VISIBLE}px)`,
                height: 160,
                border: "1px solid #e5e7eb",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              <img
                src={url}
                alt="Professor parceiro"
                style={{ maxHeight: 130, maxWidth: "90%", objectFit: "contain", display: "block" }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Arrow right */}
      <button
        onClick={next}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-10 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
        style={{ background: "#ffcd07", border: "none" }}
        aria-label="Próximo"
      >
        <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
        </svg>
      </button>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-5">
        {Array.from({ length: dotCount }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === current ? 24 : 8,
              height: 8,
              background: i === current ? "#ffcd07" : "#d1d5db",
              border: "none",
              padding: 0,
            }}
            aria-label={`Ir para slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
