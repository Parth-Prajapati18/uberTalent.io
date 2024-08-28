import Footer from "@/app/components/ui/Footer";
import Nav from "@/app/components/ui/nav/LandingPageNav";

export default function GeneralPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="mx-auto max-w-7xl px-6 py-32 sm:py-40 lg:px-8">
        <Nav />
        <div>{children}</div>
      </div>
      <Footer />
    </>
  );
}
