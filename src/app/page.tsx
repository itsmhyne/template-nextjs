// import { CloudArrowUpIcon, LockClosedIcon, ServerIcon } from '@heroicons/react/20/solid'

import { AppleIcon, CloudDownload, LockIcon, ServerIcon } from "lucide-react";

const features = [
  {
    name: "Clone to developent",
    description:
      "Silakan clone website ini jika tertarik menggunakannya!.(tidak ada penjelesan detail tetang kodingan ini, PAHAMI SENDIRI)",
    icon: CloudDownload,
  },
  {
    name: "Note",
    description:
      "Sebenearnya ini untuk projek pribadi, kalau anda berminat silakan di clone!",
    icon: AppleIcon,
  },
  {
    name: "Database",
    description:
      "Database menggunakan PostgreSQL dikominasi dengan Prisma. Kenapa menggunakan PostgreSQL?, biar bisa migrasi ke Supabase 🤣",
    icon: ServerIcon,
  },
];

export default function Example() {
  return (
    <div className="overflow-hidden h-screen flex flex-col justify-center items-center">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="lg:pt-4 lg:pr-8">
            <div className="lg:max-w-lg">
              <h2 className="text-base/7 font-semibold text-indigo-400">
                Template NextJs with Bun 🧅
              </h2>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty  sm:text-5xl">
                A better template<sup className="text-xs">kali</sup>
              </p>
              <p className="mt-6 text-lg/8 ">
                Sebuah template autentikasi yang dibangun dengan NextJs, Prisma,
                PostgreSQL, dan state manajemen Zustand.
              </p>
              <dl className="mt-10 max-w-xl space-y-8 text-base/7 lg:max-w-none">
                {features.map((feature) => (
                  <div key={feature.name} className="relative pl-9">
                    <dt className="inline font-semibold ">
                      <feature.icon
                        aria-hidden="true"
                        className="absolute top-1 left-1 size-5 text-indigo-400"
                      />
                      {feature.name}
                    </dt>{" "}
                    <dd className="inline">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <img
            alt="Product screenshot"
            src="https://tailwindcss.com/plus-assets/img/component-images/dark-project-app-screenshot.png"
            width={2432}
            height={1442}
            className="w-3xl max-w-none rounded-xl shadow-xl ring-1 ring-white/10 sm:w-228 md:-ml-4 lg:ml-0"
          />
        </div>
      </div>
    </div>
  );
}
