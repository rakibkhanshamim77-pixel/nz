import HeaderAction from "./HeaderAction";
import Logo from "./Logo";
import Nav from "./Nav";
import SearchBox from "./SearchBox";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-bg/85 backdrop-blur border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
        <Logo />
        <Nav />
        <SearchBox />
        <HeaderAction />
      </div>
    </header>
  );
}
