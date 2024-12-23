import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import { ChevronDownIcon, ChevronUpIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button, IconButton, Typography } from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";

export function Sidenav({ brandImg, brandName, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavColor, sidenavType, openSidenav } = controller;

  const sidenavTypes = {
    dark: "bg-gradient-to-br from-black to-blue-800",
    white: "bg-black",
    transparent: "bg-transparent",
  };

  const [dropdownState, setDropdownState] = useState({}); // To track which dropdown is open

  // Toggle dropdown state
  const toggleDropdown = (name) => {
    setDropdownState((prevState) => ({
      ...prevState,
      [name]: !prevState[name],
    }));
  };

  return (
    <aside
      className={`${sidenavTypes[sidenavType]} ${
        openSidenav ? "translate-x-0" : "-translate-x-80"
      } fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-xl transition-transform duration-300 xl:translate-x-0 border border-blue-gray-100`}
    >
      <div className="relative">
        {/* Brand Image and Name */}
        <Link to="/" className="py-6 px-8 text-center">
          {brandImg && <img src={brandImg} alt={brandName} className="h-10 mx-auto" />}
          <Typography variant="h6" color="white">
            {brandName}
          </Typography>
        </Link>
        <IconButton
          variant="text"
          color="white"
          size="sm"
          ripple={false}
          className="absolute right-0 top-0 grid rounded-br-none rounded-tl-none xl:hidden"
          onClick={() => setOpenSidenav(dispatch, false)}
        >
          <XMarkIcon strokeWidth={2.5} className="h-5 w-5 text-white" />
        </IconButton>
      </div>
      <div className="m-4">
        {routes.map(({ layout, title, pages }, key) => (
          <ul key={key} className="mb-4 flex flex-col gap-1">
            {title && (
              <li className="mx-3.5 mt-4 mb-2">
                <Typography
                  variant="small"
                  color={sidenavType === "dark" ? "white" : "blue-gray"}
                  className="font-black uppercase opacity-75"
                >
                  {title}
                </Typography>
              </li>
            )}
            {pages.map(({ icon, name, path, dropdown, pages: subPages }, index) => (
              <li key={index}>
                {dropdown ? (
                  <div>
                    <Button
                      variant="text"
                      color="blue-gray" // Changed color to blue-gray
                      className="flex items-center gap-4 px-4 capitalize text-white"
                      onClick={() => toggleDropdown(name)}
                      fullWidth
                    >
                      {icon}
                      <Typography color="inherit" className="font-medium capitalize">
                        {name}
                      </Typography>
                      {dropdownState[name] ? (
                        <ChevronUpIcon className="h-5 w-5" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5" />
                      )}
                    </Button>
                    {/* Sub-menu for the first level dropdown */}
                    {dropdownState[name] && (
                      <ul className="ml-4 mt-2 space-y-2">
                        {subPages.map(({ icon, name, path, dropdown, pages: subSubPages }) => (
                          <li key={name}>
                            {dropdown ? (
                              <div>
                                <Button
                                  variant="text"
                                  color="blue-gray" // Changed color to blue-gray
                                  className="flex items-center gap-4 px-4 capitalize text-white"
                                  onClick={() => toggleDropdown(name + "-sub")}
                                  fullWidth
                                >
                                  {icon}
                                  <Typography color="inherit" className="font-medium capitalize">
                                    {name}
                                  </Typography>
                                  {dropdownState[name + "-sub"] ? (
                                    <ChevronUpIcon className="h-5 w-5" />
                                  ) : (
                                    <ChevronDownIcon className="h-5 w-5" />
                                  )}
                                </Button>
                                {/* Sub-sub-menu */}
                                {dropdownState[name + "-sub"] && (
                                  <ul className="ml-4 mt-2 space-y-2">
                                    {subSubPages.map(({ icon, name, path }) => (
                                      <li key={name}>
                                        <NavLink to={`/${layout}${path}`}>
                                          {({ isActive }) => (
                                            <Button
                                              variant={isActive ? "gradient" : "text"}
                                              color={isActive ? "lime" : "blue-gray"} // Changed to blue-gray
                                              className="flex items-center gap-4 px-4 capitalize text-white"
                                              fullWidth
                                            >
                                              {icon}
                                              <Typography color="inherit" className="font-medium capitalize">
                                                {name}
                                              </Typography>
                                            </Button>
                                          )}
                                        </NavLink>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ) : (
                              <NavLink to={`/${layout}${path}`}>
                                {({ isActive }) => (
                                  <Button
                                    variant={isActive ? "gradient" : "text"}
                                    color={isActive ? "lime" : "blue-gray"} // Changed to blue-gray
                                    className="flex items-center gap-4 px-4 capitalize text-white"
                                    fullWidth
                                  >
                                    {icon}
                                    <Typography color="inherit" className="font-medium capitalize">
                                      {name}
                                    </Typography>
                                  </Button>
                                )}
                              </NavLink>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <NavLink to={`/${layout}${path}`}>
                    {({ isActive }) => (
                      <Button
                        variant={isActive ? "gradient" : "text"}
                        color={isActive ? "lime" : "blue-gray"} // Changed to blue-gray
                        className="flex items-center gap-4 px-4 capitalize text-white"
                        fullWidth
                      >
                        {icon}
                        <Typography color="inherit" className="font-medium capitalize">
                          {name}
                        </Typography>
                      </Button>
                    )}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </aside>
  );
}

Sidenav.defaultProps = {
  brandImg: "/img/logo-ct.png",
  brandName: "Life Care Pharmacy",
};

Sidenav.propTypes = {
  brandImg: PropTypes.string,
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Sidenav.displayName = "Sidenav"; // Ensure correct display name

export default Sidenav;
