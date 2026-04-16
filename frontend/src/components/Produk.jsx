import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export default function Produk() {
  const [role, setRole] = useState(null);
  const [siteImages, setSiteImages] = useState({
    konsultasi_image: null,
    produk_image: null,
    produk_image_1: null,
    produk_image_2: null,
    produk_image_3: null,
    produk_image_4: null,
  });

  useEffect(() => {
    setRole(localStorage.getItem('auth_user_role'));
  }, []);

  useEffect(() => {
    console.log('Fetching site settings from:', `${API_BASE}/site-settings`);
    fetch(`${API_BASE}/site-settings`)
      .then((r) => {
        console.log('Site settings response status:', r.status);
        return r.json();
      })
      .then((data) => {
        console.log('Site settings data:', data);
        console.log('Produk images from API:', {
          produk_image_1: data.produk_image_1,
          produk_image_2: data.produk_image_2,
          produk_image_3: data.produk_image_3,
          produk_image_4: data.produk_image_4
        });
        setSiteImages(data);
      })
      .catch((error) => {
        console.error('Error fetching site settings:', error);
        /* keep defaults */
      });
  }, []);

  const showChat = role === 'User' || role === 'Psikolog';

  return (
    <section
      className="
    relative w-full overflow-hidden 
    bg-gradient-to-r from-white to-blue-50 
    mt-4
  "
    >
      <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center gap-10">
        {/* === Kiri: Teks & Tombol Produk === */}
        <div
          className="
      flex-1 
      text-center md:text-left 
      pt-10 md:pt-20 
      pb-10 md:pb-20
    "
        >
          <p className="text-blue-600 font-semibold text-sm md:text-base">
            PATNAL siap melayani dengan arahan cepat dan akurat.
          </p>

          <h2 className="text-3xl md:text-5xl font-bold text-blue-600 leading-snug mt-4 md:mt-6"><br />
            Saatnya bertindak tegas demi integritas dan kepatuhan.
          </h2>

        

          <div className={`flex md:justify-start justify-center mt-6 gap-4 flex-wrap`}>
            {/* ── Chat Cards (User & Psikolog only) ── */}
            {showChat ? (
              <>
                <Link
                  to="/chat?expert=psikolog"
                  className={`
                group relative rounded-2xl px-6 py-5
                flex items-center justify-between
                w-full md:w-[48%] lg:w-[45%]
                bg-gradient-to-br from-purple-50 to-indigo-50
                border border-purple-200/70 shadow-sm
                hover:shadow-lg hover:border-purple-300
                transition-all duration-300
              `}
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-100/40 to-indigo-100/40 opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none"></div>

                  <div className="text-left relative z-10 space-y-1.5">
                    <p className="text-purple-600 font-semibold text-sm">🧠 Layanan Psikologis</p>

                    <h3 className="text-purple-700 font-bold text-xl tracking-tight group-hover:text-purple-800 transition-colors">
                      Konsultasi Psikolog
                    </h3>

                    <p className="text-gray-700 text-xs leading-relaxed">
                      Dukungan psikologis profesional untuk kesehatan mental dan wellbeing.<br />
                      <span className="text-purple-600 font-medium">• Psikolog bersertifikat</span><br />
                      <span className="text-purple-600 font-medium">• Konseling & terapi</span><br />
                      <span className="text-gray-500">(Setelah profiling awal)</span>
                    </p>

                    <div className="flex items-center gap-1 text-purple-700 text-sm font-medium pt-1">
                      <span className="transition-all duration-300 group-hover:translate-x-1">Mulai Konsultasi</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="size-4 transition-all duration-300 opacity-80 group-hover:opacity-100 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  <div className="relative z-10 w-14 h-14 flex items-center justify-center text-4xl flex-shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-0.5 bg-purple-100 rounded-full">
                    🧠
                  </div>
                </Link>

                <Link
                  to="/konsultasi-teknis"
                  className={`
                group relative rounded-2xl px-6 py-5
                flex items-center justify-between
                w-full md:w-[48%] lg:w-[45%]
                bg-gradient-to-br from-blue-50 to-cyan-50
                border border-blue-200/70 shadow-sm
                hover:shadow-lg hover:border-blue-300
                transition-all duration-300
              `}
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-100/40 to-cyan-100/40 opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none"></div>

                  <div className="text-left relative z-10 space-y-1.5">
                    <p className="text-blue-600 font-semibold text-sm">⚙️ Layanan PATNAL</p>

                    <h3 className="text-blue-700 font-bold text-xl tracking-tight group-hover:text-blue-800 transition-colors">
                      Konsultasi Teknis PATNAL
                    </h3>

                    <p className="text-gray-700 text-xs leading-relaxed">
                      Layanan konsultasi teknis untuk integritas dan kepatuhan internal.<br />
                      <span className="text-blue-600 font-medium">• Fasilitasi Advokasi & Investigasi</span><br />
                      <span className="text-blue-600 font-medium">• Pencegahan & Pengendalian</span><br />
                      <span className="text-blue-600 font-medium">• Konsultasi Regulasi & SOP</span>
                    </p>

                    <div className="flex items-center gap-1 text-blue-700 text-sm font-medium pt-1">
                      <span className="transition-all duration-300 group-hover:translate-x-1">Mulai Konsultasi</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="size-4 transition-all duration-300 opacity-80 group-hover:opacity-100 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  <div className="relative z-10 w-14 h-14 flex items-center justify-center text-4xl flex-shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-0.5 bg-blue-100 rounded-full">
                    ⚙️
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/consultation?type=psikolog"
                  className="
                group relative rounded-2xl px-6 py-5
                flex items-center justify-between
                bg-gradient-to-br from-purple-50 to-indigo-50
                border border-purple-200/70 shadow-sm
                hover:shadow-lg hover:border-purple-300
                transition-all duration-300
                w-full md:w-[48%] lg:w-[45%]
              "
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-100/40 to-indigo-100/40 opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none"></div>

                  <div className="text-left relative z-10 space-y-1.5">
                    <p className="text-purple-600 font-semibold text-sm">🧠 Layanan Psikologis</p>

                    <h3 className="text-purple-700 font-bold text-xl tracking-tight group-hover:text-purple-800 transition-colors">
                      Konsultasi Psikolog
                    </h3>

                    <p className="text-gray-700 text-sm leading-relaxed">
                      Dukungan psikologis profesional untuk kesehatan mental dan wellbeing.
                    </p>

                    <div className="flex items-center gap-1 text-purple-700 text-sm font-medium pt-1">
                      <span className="transition-all duration-300 group-hover:translate-x-1">Pilih</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="size-4 transition-all duration-300 opacity-80 group-hover:opacity-100 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  <div className="relative z-10 w-14 h-14 flex items-center justify-center text-4xl flex-shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-0.5 bg-purple-100 rounded-full">
                    🧠
                  </div>
                </Link>

                <Link
                  to="/konsultasi-teknis"
                  className="
                group relative rounded-2xl px-6 py-5
                flex items-center justify-between
                bg-gradient-to-br from-blue-50 to-cyan-50
                border border-blue-200/70 shadow-sm
                hover:shadow-lg hover:border-blue-300
                transition-all duration-300
                w-full md:w-[48%] lg:w-[45%]
              "
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-100/40 to-cyan-100/40 opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none"></div>

                  <div className="text-left relative z-10 space-y-1.5">
                    <p className="text-blue-600 font-semibold text-sm">⚙️ Layanan PATNAL</p>

                    <h3 className="text-blue-700 font-bold text-xl tracking-tight group-hover:text-blue-800 transition-colors">
                      Konsultasi Teknis PATNAL
                    </h3>

                    <p className="text-gray-700 text-sm leading-relaxed">
                      Layanan konsultasi teknis untuk integritas dan kepatuhan internal.<br />
                      <span className="text-blue-600 font-medium">• Fasilitasi Advokasi & Investigasi</span><br />
                      <span className="text-blue-600 font-medium">• Pencegahan & Pengendalian</span><br />
                      <span className="text-blue-600 font-medium">• Konsultasi Regulasi & SOP</span>
                    </p>

                    <div className="flex items-center gap-1 text-blue-700 text-sm font-medium pt-1">
                      <span className="transition-all duration-300 group-hover:translate-x-1">Pilih</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="size-4 transition-all duration-300 opacity-80 group-hover:opacity-100 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  <div className="relative z-10 w-14 h-14 flex items-center justify-center text-4xl flex-shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-0.5 bg-blue-100 rounded-full">
                    ⚙️
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* === Kanan: Gambar Ilustrasi === */}
        <div
          className="
    flex-1 flex justify-center md:justify-end
    pt-10 md:pt-20 lg:pt-24
  "
        >
          <div
            className="
    relative 
    w-full

    translate-y-[8px]          /* HP kecil */
    sm:translate-y-[12px]      /* HP besar */
    md:translate-y-[16px]      /* Tablet */
    lg:translate-y-[20px]      /* Desktop 1024–1279 */
    xl:translate-y-[18px]      /* Desktop 1280–1440 (1366 masuk sini) */
    2xl:translate-y-[16px]     /* Layar sangat besar (≥1536) */

    max-w-[380px]
    sm:max-w-[480px]
    md:max-w-[720px]
    lg:max-w-[920px]
    xl:max-w-[1100px]
    2xl:max-w-[1280px]
  "
          >
            {/* Glow */}
            <div
              className="
        absolute inset-0 
        bg-gradient-to-br from-blue-100/40 to-blue-50/0 
        rounded-3xl blur-2xl 
        opacity-60 pointer-events-none
      "
            ></div>

            {/* 4 Images Grid */}
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((num) => {
                const imageUrl = siteImages[`produk_image_${num}`];
                return (
                  <div key={num} className="relative group">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={`Produk Patnal Integrity Hub ${num}`}
                        className="
                  relative z-10
                  w-full
                  h-auto
                  object-contain
                  transition-all duration-500 
                  drop-shadow-lg
                  group-hover:scale-[1.05]
                  group-hover:-translate-y-1
                  rounded-lg
                "
                        onLoad={(e) => {
                          console.log(`Successfully loaded image ${num}:`, imageUrl);
                          console.log(`Image natural size: ${e.target.naturalWidth}x${e.target.naturalHeight}`);
                        }}
                        onError={(e) => {
                          console.error(`Failed to load image ${num}:`, imageUrl);
                          console.error('Image element error:', e.target);
                          console.error('Network state:', e.target.naturalWidth === 0 ? 'Failed to load' : 'Loaded but error');
                          e.target.src = `/images/produk-${num}.png`;
                        }}
                        onLoadStart={() => {
                          console.log(`Starting to load image ${num}:`, imageUrl);
                        }}
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-gray-400 text-2xl mb-2">📷</div>
                          <div className="text-gray-500 text-xs">Produk {num}</div>
                        </div>
                      </div>
                    )}
                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 to-indigo-100/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
