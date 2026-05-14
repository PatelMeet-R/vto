import { MainLayout } from "./components/layouts/MainLayout";
import { CatalogView } from "./modules/catalog/view/CatalogView";
import { ProductDetailView } from "./modules/pdp/views/ProductDetailView";

export default function App() {
  return (
    <MainLayout>
      <CatalogView />
      <ProductDetailView />
    </MainLayout>
  );
}
