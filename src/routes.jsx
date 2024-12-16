import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon,
  ArchiveBoxArrowDownIcon,
  ArchiveBoxXMarkIcon,
  BanknotesIcon,
  UserGroupIcon,
  DocumentMagnifyingGlassIcon,
  CurrencyDollarIcon,
  WalletIcon,
  ChartBarIcon,
  ArrowDownLeftIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/solid";
import { Home, Costumer, Tables, Notifications, BarangMasuk, BarangKeluar, LaporanInventory, DaftarGaji, PengelolaanGaji, LaporanGaji, Kasir, LaporanPembayaran} from "@/pages/dashboard";
import { SignIn, SignUp } from "@/pages/auth";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "dashboard",
        path: "/home",
        element: <Home />,
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "costumer",
        path: "/costumer",
        element: <Costumer />,
      },
      {
        icon: <ClipboardDocumentCheckIcon {...icon} />,
        name: "Inventory",
        dropdown: true, // Menandakan bahwa ini adalah dropdown
        pages: [
         
          {
            icon: <ArchiveBoxArrowDownIcon {...icon} />,
            name: "Stok barang",
            dropdown: true, 
    
            pages: [
              {
              
                name: "Barang masuk",
                path: "/BarangMasuk",
                element: <BarangMasuk />,
              },
              {
               
                name: "Barang keluar",
                path: "/BarangKeluar",
                element: <BarangKeluar />,
              },
            ],
          },
          {
            icon: <ClipboardDocumentIcon {...icon} />, 
            name: "laporan inventory",
            path: "/LaporanInventory",
            element: <LaporanInventory />,
          },
        ],
      },


      {
        icon: <BanknotesIcon {...icon} />,
        name: "Gaji",
        dropdown: true, // Menandakan bahwa ini adalah dropdown
        pages: [
          {
            icon: <UserGroupIcon {...icon} />, 
            name: "Daftar gaji karyawan",
            path: "/DaftarGaji",
            element: <DaftarGaji />,
          },
       
          {
            icon: <CurrencyDollarIcon {...icon} />, 
            name: "Pengelolaan Gaji",
            path: "/PengelolaanGaji",
            element: <PengelolaanGaji />,
          },
          {
            icon: <ClipboardDocumentIcon {...icon} />, 
            name: "Laporan Gaji",
            path: "/LaporanGaji",
            element: <LaporanGaji  />,
          },
        ],
      },
      {
        icon: <WalletIcon {...icon} />,
        name: "Pembayaran",
        dropdown: true,
        roles: [1, 2, 3], // Role 1, 2, 3 bisa mengakses halaman ini
        pages: [
          {
            icon: <UserGroupIcon {...icon} />,
            name: "Kasir",
            path: "/Kasir",
            element: <Kasir />,
            roles: [1, 2], // Role 1 dan 2 bisa mengakses halaman ini
          },
          {
            icon: <ChartBarIcon {...icon} />,
            name: "Laporan Pembayaran",
            path: "/LaporanPembayaran",
            element: <LaporanPembayaran />,
            roles: [1, 2], // Role 1 dan 2 bisa mengakses halaman ini
          },
        ],
      },
    ],
  },


  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: <ArrowLeftIcon {...icon} />,
        name: "Logout",
        path: "/sign-in",
        element: <SignIn />,
      },
    ],
  },
];

export default routes;
