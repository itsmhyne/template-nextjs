// ✅ Fungsi untuk mendapatkan inisial dari nama
export const getInitials = (name: string, email: string) => {
  if (name && name.trim()) {
    // Ambil huruf pertama dari setiap kata (max 2 huruf)
    const words = name.trim().split(" ");
    if (words.length === 1) {
      // Jika hanya 1 kata, ambil 2 huruf pertama
      return words[0].slice(0, 2).toUpperCase();
    }
    // Ambil huruf pertama dari kata pertama dan kedua
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  // Fallback ke email
  return email.charAt(0).toUpperCase();
};

// ✅ Fungsi untuk mendapatkan warna background berdasarkan nama
export const getAvatarColor = (name: string, email: string) => {
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-orange-500",
    "bg-cyan-500",
    "bg-emerald-500",
    "bg-violet-500",
  ];

  const str = name || email;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};
