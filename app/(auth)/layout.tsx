import Logo from "../(main)/components/Logo";
import ThemeSwitcher from "../(main)/components/ThemeSwitcher";

export default function authLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header className="border-b border-line bg-bg/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between gap-4">
          <Logo />
          <ThemeSwitcher />
        </div>
      </header>
      {children}
    </>
  );
}
