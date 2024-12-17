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
import { Costumer, Tables, Notifications, BarangMasuk, BarangKeluar, LaporanInventory, DaftarGaji, PengelolaanGaji, LaporanGaji, Kasir, LaporanPembayaran } from "@/pages/dashboard";
import { SignIn, SignUp } from "@/pages/auth";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = (roleId) => {
  const allMenus = [
    {
      layout: "dashboard",
      pages: [
        {
          icon: <UserCircleIcon {...icon} />,
          name: "Costumer",  // Corrected to match your requirement
          path: "/costumer",  // This is where the user will land after login
          element: <Costumer />,  // Directly going to Costumer
        },
        {
          icon: <ClipboardDocumentCheckIcon {...icon} />,
          name: "Inventory",
          dropdown: true,
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
              name: "Laporan inventory",
              path: "/LaporanInventory",
              element: <LaporanInventory />,
            },
          ],
        },
        {
          icon: <BanknotesIcon {...icon} />,
          name: "Gaji",
          dropdown: true,
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
              element: <LaporanGaji />,
            },
          ],
        },
        {
          icon: <WalletIcon {...icon} />,
          name: "Pembayaran",
          dropdown: true,
          pages: [
            {
              icon: <UserGroupIcon {...icon} />,
              name: "Kasir",
              path: "/Kasir",
              element: <Kasir />,
            },
            {
              icon: <ChartBarIcon {...icon} />,
              name: "Laporan Pembayaran",
              path: "/LaporanPembayaran",
              element: <LaporanPembayaran />,
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

  // Filter menus based on roleId
  switch(roleId) {
    case 1:
      return allMenus;
    case 2:
      return [
        {
          ...allMenus[0],
          pages: allMenus[0].pages.filter(page => page.name === "Pembayaran")
        },
        allMenus[1]
      ];
    case 3:
      return [
        {
          ...allMenus[0],
          pages: allMenus[0].pages.filter(page => page.name === "Inventory")
        },
        allMenus[1]
      ];
    default:
      return allMenus;
  }
};

export default routes;
