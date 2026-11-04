import React from 'react';
import { Hotel, Phone, Mail, MapPin, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Hotel className="w-4 h-4" />
              </div>
              <span>LuxeStay Hotel</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Hashamat va qulaylik uyg‘unlashgan mehmonxona. Biz bilan unutilmas dam oling.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-semibold uppercase tracking-wider text-[11px]">
              Bog‘lanish
            </h4>
            <div className="space-y-1.5">
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-indigo-400" />
                <span>+998 (90) 123-45-67</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>support@luxestay.uz</span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span>Toshkent sh., Amir Temur shox ko‘chasi, 1-uy</span>
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-semibold uppercase tracking-wider text-[11px]">
              Xizmatlarimiz
            </h4>
            <ul className="space-y-1">
              <li>24/7 Xona xizmati</li>
              <li>Restoran & Lounge bar</li>
              <li>SPA & Basseyn</li>
              <li>Konferensiya zallari</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-semibold uppercase tracking-wider text-[11px]">
              Xavfsizlik & Sifat
            </h4>
            <p className="text-slate-400 leading-relaxed">
              Barcha to‘lovlar va bronlar eng zamonaviy xavfsizlik standartlari (JWT, HTTPS) bilan himoyalangan.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© {new Date().getFullYear()} LuxeStay Hotel Management System. Barcha huquqlar himoyalangan.</p>
          <p className="flex items-center gap-1">
            Yaratildi <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> DeepMind Antigravity yordamida
          </p>
        </div>
      </div>
    </footer>
  );
}
