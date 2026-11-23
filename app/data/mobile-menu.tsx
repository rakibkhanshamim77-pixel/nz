import { Contact, Home, ShoppingCart } from "lucide-react";
const mobileMenu = [
  {
    id: 1,
    title: "Home",
    icon: <Home />,
    target: "/",
  },
  {
    id: 2,
    title: "Shop",
    icon: <ShoppingCart />,
    target: "/shop",
  },
  {
    id: 3,
    title: "Contact",
    icon: <Contact />,
    target: "#contact",
  },
  {
    id: 4,
    title: "Cart",
    icon: <Contact />,
    target: "/cart",
  },
];

export { mobileMenu };
