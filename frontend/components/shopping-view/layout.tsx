import ShoppingHeader from "./header";

export default function ShoppingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ShoppingHeader />
      <main className="w-full flex flex-col">{children}</main>
    </>
  );
}