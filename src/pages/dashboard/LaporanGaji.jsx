import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardBody, CardHeader, Typography } from '@material-tailwind/react';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { FaDownload, FaSearch, FaFileExcel, FaCalendarAlt } from 'react-icons/fa'; // Icons

const LaporanGaji = () => {
  const [gaji, setGaji] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredGaji, setFilteredGaji] = useState([]);

  const API_URL = 'https://api-pharmacy.silendas.my.id/api';
  const token = localStorage.getItem('authToken');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    fetchGaji();
  }, []);

  useEffect(() => {
    let filteredData = gaji;
    if (selectedMonth) {
      filteredData = filteredData.filter((salary) => salary.period === selectedMonth);
    }
    if (searchQuery) {
      filteredData = filteredData.filter((salary) =>
        salary.Employee?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredGaji(filteredData);
  }, [selectedMonth, gaji, searchQuery]);

  const fetchGaji = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/salaries`, { headers });
      setGaji(response.data || []);
    } catch (error) {
      toast.error('Failed to load salaries');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Laporan Gaji Karyawan', 105, 20, { align: 'center' });

    let yPosition = 30;

    filteredGaji.forEach((salary) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Nama Karyawan: ${salary.Employee?.name || '-'}`, 20, yPosition);
      doc.text(`Gaji: Rp ${salary.amount.toLocaleString('id-ID')}`, 20, yPosition + 10);
      doc.text(`Periode: ${salary.period}`, 20, yPosition + 20);
      doc.text(`Tanggal Pembayaran: ${salary.payment_date || '-'}`, 20, yPosition + 30);

      const paymentStatus = salary.payment_date ? 'Paid' : 'Not Paid';
      const paymentStatusColor = salary.payment_date ? 'green' : 'red';
      doc.setTextColor(paymentStatusColor === 'green' ? 0 : 255, paymentStatusColor === 'green' ? 128 : 0, 0);
      doc.text(`Status: ${paymentStatus}`, 20, yPosition + 40);

      yPosition += 50;
    });

    doc.save('Laporan-Gaji-Karyawan.pdf');
  };

  const generateExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredGaji.map(salary => ({
      'Nama Karyawan': salary.Employee?.name || '-',
      'Gaji': salary.amount,
      'Periode': salary.period,
      'Tanggal Pembayaran': salary.payment_date || '-',
      'Status': salary.payment_date ? 'Paid' : 'Not Paid'
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan Gaji');
    XLSX.writeFile(wb, 'Laporan_Gaji_Karyawan.xlsx');
  };

  return (
    <div className="container mx-auto p-6">
      {/* Filter and Buttons Section */}
      <div className="flex justify-between items-center my-6">
        {/* Search Input and Period Filter */}
        <div className="flex items-center space-x-4">
          {/* Search Input with Icon */}
          <div className="flex items-center space-x-2 w-1/3">
            <FaSearch className="text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by employee name..."
              className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Month Filter with Calendar Icon */}
          <div className="flex items-center space-x-2 w-1/3">
            <FaCalendarAlt className="text-gray-500" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>

        {/* Buttons for PDF, Excel, and Reload */}
        <div className="flex space-x-4">
          <button
            onClick={generatePDF}
            className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition duration-300"
            title="Download PDF"
          >
            <FaDownload />
          </button>
          <button
            onClick={generateExcel}
            className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 transition duration-300"
            title="Download Excel"
          >
            <FaFileExcel />
          </button>
          <button
            onClick={() => fetchGaji()}
            className="bg-yellow-600 text-white p-3 rounded-full hover:bg-yellow-700 transition duration-300"
            title="Reload Data"
          >
            <FaSearch />
          </button>
        </div>
      </div>

      {/* Salary Report Table */}
      <Card className="shadow-xl rounded-lg">
        <CardHeader variant="gradient" color="gray" className="mb-4 p-4 text-center">
          <Typography variant="h5" color="white">Laporan Gaji Karyawan</Typography>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex justify-center py-8">
              <span className="loader"></span> {/* Add a loader/spinner */}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-separate border-spacing-2">
                <thead>
                  <tr className="text-left text-sm font-semibold text-gray-700">
                    <th className="px-4 py-2">Employee</th>
                    <th className="px-4 py-2">Salary</th>
                    <th className="px-4 py-2">Period</th>
                    <th className="px-4 py-2">Payment Date</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGaji.length > 0 ? (
                    filteredGaji.map((salary) => (
                      <tr key={salary.id} className="border-b border-gray-300">
                        <td className="px-4 py-2">{salary.Employee?.name || '-'}</td>
                        <td className="px-4 py-2">Rp {salary.amount.toLocaleString('id-ID')}</td>
                        <td className="px-4 py-2">{salary.period}</td>
                        <td className="px-4 py-2">{salary.payment_date || '-'}</td>
                        <td className="px-4 py-2">
                          <span
                            className={`px-3 py-1 rounded-full text-white ${
                              salary.payment_date ? 'bg-green-500' : 'bg-red-500'
                            }`}
                          >
                            {salary.payment_date ? 'Paid' : 'Not Paid'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-gray-500">No data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default LaporanGaji;
