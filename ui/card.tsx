import { Cinzel } from "next/font/google";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-cinzel",
});

export default async function Card({title, pairs}: {title: string, pairs: [string, any][]}) {
  return (
    <div className="flex flex-col rounded-xl p-3 shadow-sm bg-purple-50 min-w-[16rem]">
      <h3 className={`flex justify-center text-lg font-medium text-purple-800 ${cinzel.className}`}>{title}</h3>

      {pairs.map(([label, value]) => (
        <div key={label} className="flex justify-between space-x-6">
          <span className="text-purple-800">{label}</span>
          <span className="text-purple-500">{value}</span>
        </div>
      ))}
    </div>
  );
}