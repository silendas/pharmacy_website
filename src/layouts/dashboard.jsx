import { Routes, Route, useLocation } from "react-router-dom";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import { IconButton } from "@material-tailwind/react";
import { Sidenav, DashboardNavbar, Configurator, Footer } from "@/widgets/layout";
import routes from "@/routes";
import { useMaterialTailwindController, setOpenConfigurator } from "@/context";

export function Dashboard() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavType } = controller;
  const location = useLocation();

  const roleId = parseInt(localStorage.getItem('roleId'));
  const filteredRoutes = routes(roleId);

  // Fungsi rekursif untuk merender rute, termasuk dropdown dan sub-dropdown
  const renderRoutes = (pages) => {
    return pages.map(({ path, element, dropdown, pages: subpages }) => {
      if (dropdown && subpages) {
        // Jika ada dropdown, rekursif untuk merender subpages
        return renderRoutes(subpages);
      }
      return <Route key={path} path={path} element={element} />;
    });
  };

  return (
    <div className="min-h-screen bg-blue-gray-50/50">
      <Sidenav
        routes={filteredRoutes}
        brandImg={
          sidenavType === "dark" ? "/img/logo-ct.png" : "/img/logo-ct-dark.png"
        }
      />
      <div className="p-4 xl:ml-80">
        <DashboardNavbar />
        <Configurator />
        <IconButton
          size="lg"
          color="white"
          className="fixed bottom-8 right-8 z-40 rounded-full shadow-blue-gray-900/10"
          ripple={false}
          onClick={() => setOpenConfigurator(dispatch, true)}
        >
          <Cog6ToothIcon className="h-5 w-5" />
        </IconButton>

        {/* Render semua Routes */}
        <Routes>
          {filteredRoutes.map(({ layout, pages }) =>
            layout === "dashboard" && renderRoutes(pages)
          )}
        </Routes>

        <Footer />
      </div>
    </div>
  );
}

Dashboard.displayName = "/src/layout/dashboard.jsx";

export default Dashboard;
