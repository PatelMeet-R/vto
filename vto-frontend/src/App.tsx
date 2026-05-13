import { MainLayout } from "./components/layouts/MainLayout";
import { CatalogView } from "./modules/catalog/view/CatalogView";

export default function App() {
  return (
    <MainLayout>
      <CatalogView />
    </MainLayout>
  );
}
