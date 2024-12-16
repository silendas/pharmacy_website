import React, { useState } from "react";

export function LaporanInventory() {
  // State untuk menyimpan data inventory
  const [inventory, setInventory] = useState([
    { id: 1, name: "Barang A", category: "Kategori 1", quantity: 50, status: "Tersedia" },
    { id: 2, name: "Barang B", category: "Kategori 2", quantity: 30, status: "Tersedia" },
    { id: 3, name: "Barang C", category: "Kategori 1", quantity: 0, status: "Habis" },
    { id: 4, name: "Barang D", category: "Kategori 3", quantity: 100, status: "Tersedia" },
  ]);

  // State untuk filter
  const [filter, setFilter] = useState({
    category: "",
    status: "",
  });

  // Fungsi untuk menangani perubahan filter
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prevFilter) => ({
      ...prevFilter,
      [name]: value,
    }));
  };

  // Fungsi untuk mendapatkan data yang sudah difilter
  const filteredInventory = inventory.filter((item) => {
    return (
      (filter.category ? item.category === filter.category : true) &&
      (filter.status ? item.status === filter.status : true)
    );
  });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Laporan Inventory</h1>

      {/* Filter Form */}
      <div className="mb-6 flex gap-4">
        <select
          name="category"
          value={filter.category}
          onChange={handleFilterChange}
          className="p-2 border border-gray-300"
        >
          <option value="">Pilih Kategori</option>
          <option value="Kategori 1">Kategori 1</option>
          <option value="Kategori 2">Kategori 2</option>
          <option value="Kategori 3">Kategori 3</option>
        </select>
        <select
          name="status"
          value={filter.status}
          onChange={handleFilterChange}
          className="p-2 border border-gray-300"
        >
          <option value="">Pilih Status</option>
          <option value="Tersedia">Tersedia</option>
          <option value="Habis">Habis</option>
        </select>
      </div>

      {/* Tabel Inventory */}
      <table className="min-w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border px-4 py-2">Nama Barang</th>
            <th className="border px-4 py-2">Kategori</th>
            <th className="border px-4 py-2">Jumlah</th>
            <th className="border px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredInventory.length > 0 ? (
            filteredInventory.map((item) => (
              <tr key={item.id}>
                <td className="border px-4 py-2">{item.name}</td>
                <td className="border px-4 py-2">{item.category}</td>
                <td className="border px-4 py-2">{item.quantity}</td>
                <td className="border px-4 py-2">{item.status}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="border px-4 py-2 text-center">
                Tidak ada data yang ditemukan
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Optional: Chart untuk Visualisasi Stok */}
      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-4">Grafik Stok Barang</h2>
        {/* Grafik bisa menggunakan charting library seperti Chart.js atau Recharts */}
        {/* Di sini hanya sebagai placeholder */}
        <div className="bg-gray-200 p-6 text-center">Grafik Stok Barang</div>
      </div>
    </div>
  );
}

export default LaporanInventory;
