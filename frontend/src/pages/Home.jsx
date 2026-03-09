import MainLayout from "../layouts/MainLayout";
import Banner from "../components/Banner";
import Produk from "../components/Produk";
import PustakaDokumenDynamic from "../components/PustakaDokumenDynamic";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    document.title = "Patnal Integrity Hub - Konsultasi Aman, Respons Tepat";
  }, []);
  return (
    <MainLayout>
      <Banner />
      <Produk />
      <PustakaDokumenDynamic />
    </MainLayout>
  );
}
