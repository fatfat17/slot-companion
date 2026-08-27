import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { CatalogImportClient } from "./CatalogImportClient";
export default function CatalogImportPage(){if(process.env.NODE_ENV==="production")notFound();return<><PageHeader title="Catalog Importer" eyebrow="Development Admin"/><CatalogImportClient/></>}
