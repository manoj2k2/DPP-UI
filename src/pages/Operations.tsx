import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Download,
  Filter,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { products } from "../data";
import { Link, useSearchParams } from "react-router-dom";
import {
  companyApi,
  demoProducts,
  getApiItems,
  materialApi,
  productApi,
  type CompanyRequest,
  type ProductRequest,
} from "../api/client";
import { StatusBadge } from "../components/StatusBadge";
import { SectionHeader } from "../components/SectionHeader";

const content = {
  companies: {
    title: "Companies",
    eyebrow: "TENANT MANAGEMENT",
    description:
      "Manage the companies and manufacturing organizations in your workspace.",
    columns: ["Company", "Country", "Industry", "Employees", "Status"],
    rows: [["Axiom Mobility", "Germany", "Automotive", "1,240", "Ready"]],
  },
  products: {
    title: "Products",
    eyebrow: "PRODUCT CATALOG",
    description: "Manage product records and keep passport readiness moving.",
    columns: ["Product", "Category", "Weight", "Status", "Passport"],
    rows: products.map((p) => [
      p.name,
      p.category,
      p.weight,
      p.status,
      p.passport,
    ]),
  },
  materials: {
    title: "Materials",
    eyebrow: "BILL OF MATERIALS",
    description: "Track material composition, origin, and recycled content.",
    columns: ["Material", "Type", "Weight", "Recycled content", "Origin"],
    rows: [
      ["Aluminium 6061", "Metal", "12.6 kg", "42%", "Germany"],
      ["PA66 GF30", "Polymer", "1.8 kg", "18%", "Belgium"],
      ["Copper C110", "Metal", "3.2 kg", "76%", "Poland"],
      ["EPDM Rubber", "Elastomer", "0.8 kg", "12%", "Italy"],
    ],
  },
  suppliers: {
    title: "Suppliers",
    eyebrow: "SUPPLY NETWORK",
    description: "Keep supplier relationships and data requests in one place.",
    columns: ["Supplier", "Code", "Country", "Email", "Status"],
    rows: [
      [
        "NordWerk Components GmbH",
        "NWC-044",
        "Germany",
        "data@nordwerk.de",
        "Ready",
      ],
      [
        "Valence Metals SAS",
        "VMS-018",
        "France",
        "compliance@valence.fr",
        "In review",
      ],
      ["Kitec Polymers", "KTP-102", "Belgium", "hello@kitec.eu", "Ready"],
      [
        "Sanko Precision",
        "SKP-087",
        "Japan",
        "dpp@sanko.jp",
        "Needs attention",
      ],
    ],
  },
  compliance: {
    title: "Compliance documents",
    eyebrow: "EVIDENCE LIBRARY",
    description:
      "A clear view of evidence, expiry dates, and missing documents.",
    columns: ["Document", "Product", "Type", "Expiry date", "Status"],
    rows: [
      [
        "REACH declaration 2026",
        "Battery Cooling Plate",
        "Declaration",
        "14 Apr 2027",
        "Ready",
      ],
      [
        "Conflict minerals report",
        "E-Drive Housing",
        "Report",
        "30 Nov 2026",
        "In review",
      ],
      [
        "RoHS certificate",
        "Charge Port Assembly",
        "Certificate",
        "08 Jan 2027",
        "Ready",
      ],
      [
        "LCA verification letter",
        "Steering Module",
        "Verification",
        "Expired",
        "Needs attention",
      ],
    ],
  },
};

export function Operations({ type }: { type: keyof typeof content }) {
  const [search, setSearch] = useState("");
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [companyForm, setCompanyForm] = useState<CompanyRequest>({
    companyName: "",
    vatNumber: "",
    country: "",
    industry: "",
    employeeCount: undefined,
  });
  const [companyError, setCompanyError] = useState("");
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productForm, setProductForm] = useState<ProductRequest>({
    companyId: "",
    productNumber: "",
    productName: "",
    productCategory: "",
    description: "",
    weight: undefined,
  });
  const [productError, setProductError] = useState("");
  const [searchParams] = useSearchParams();
  const productFilterId = searchParams.get("productId") ?? undefined;
  const queryClient = useQueryClient();
  const data = content[type];
  const productQuery = useQuery({
    queryKey: ["products"],
    queryFn: async () => (await productApi.list()).data,
    enabled: type === "products",
  });
  const materialQuery = useQuery({
    queryKey: ["materials", productFilterId],
    queryFn: async () => getApiItems((await materialApi.list(productFilterId)).data),
    enabled: type === "materials",
  });
  const companyQuery = useQuery({
    queryKey: ["companies"],
    queryFn: async () => (await companyApi.list()).data,
    enabled: type === "companies",
  });
  const companyMutation = useMutation({
    mutationFn: ({ id, payload }: { id?: string; payload: CompanyRequest }) =>
      id ? companyApi.update(id, payload) : companyApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      closeCompanyModal();
    },
    onError: () =>
      setCompanyError(
        "The company could not be saved. Check the values and try again.",
      ),
  });
  const productMutation = useMutation({
    mutationFn: (payload: ProductRequest) => productApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      closeProductModal();
    },
    onError: () =>
      setProductError(
        "The product could not be saved. Check the company ID and values, then try again.",
      ),
  });
  const productDeleteMutation = useMutation({
    mutationFn: (id: string) => productApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
    onError: () => setProductError("The product could not be deleted. Check your permissions and try again."),
  });
  const demoProductMutation = useMutation({
    mutationFn: async () => {
      const companiesResponse = await companyApi.list();
      const existingCompany = getApiItems(companiesResponse.data)[0] as Record<string, unknown> | undefined;
      let companyId = existingCompany?.id ?? existingCompany?.companyId;
      if (!companyId) {
        const createdCompany = await companyApi.create({ companyName: "Axiom Mobility Demo", country: "Germany", industry: "Automotive", employeeCount: 1240 });
        const created = createdCompany.data as Record<string, unknown>;
        companyId = created.id ?? created.companyId;
      }
      if (typeof companyId !== "string" || !companyId) throw new Error("A company ID is required to seed products.");
      return Promise.all(demoProducts.map((product) => productApi.create({ ...product, companyId })));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
    onError: () =>
      setProductError(
        "Demo products could not be created. Confirm the API is running and the demo company ID exists.",
      ),
  });
  const productsFromApi = getApiItems(productQuery.data);
  const filteredProducts = useMemo(
    () => productsFromApi.filter((product) => Object.values(product).join(" ").toLowerCase().includes(search.toLowerCase())),
    [productsFromApi, search],
  );
  const apiRows =
    type === "products"
      ? filteredProducts.map((product: Record<string, unknown>) => [
          String(
            product.name ??
              product.productName ??
              product.productNumber ??
              "Unnamed product",
          ),
          String(product.category ?? "Uncategorized"),
          String(product.weight ?? "—"),
          String(product.status ?? "Draft"),
          String(product.passportStatus ?? "Not started"),
        ])
      : [];
  const companies = type === "companies" ? getApiItems(companyQuery.data) : [];
  const filteredCompanies = useMemo(
    () =>
      companies.filter((company) =>
        Object.values(company)
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [companies, search],
  );
  const companyRows =
    filteredCompanies.length > 0
      ? filteredCompanies.map((company: Record<string, unknown>) => [
          String(company.companyName ?? "Unnamed company"),
          String(company.country ?? "—"),
          String(company.industry ?? "—"),
          String(company.employeeCount ?? "—"),
          "Ready",
        ])
      : [];
  const materialRows =
    type === "materials"
      ? getApiItems(materialQuery.data).map((material: Record<string, unknown>) => [
          String(material.materialName ?? material.name ?? "Unnamed material"),
          String(material.materialType ?? material.type ?? "—"),
          String(material.weightKg ?? material.weight ?? "—"),
          String(material.recycledContentPercent ?? "—"),
          String(material.countryOfOrigin ?? material.origin ?? "—"),
        ])
      : [];
  const rows: string[][] =
    type === "companies"
      ? companyRows
      : type === "materials"
        ? materialRows.length > 0
          ? materialRows
          : data.rows.map((row) => row.map(String))
        : apiRows.length > 0
          ? apiRows
          : data.rows.map((row) => row.map(String));
  const filtered = useMemo(
    () =>
      rows.filter((row) =>
        row.join(" ").toLowerCase().includes(search.toLowerCase()),
      ),
    [rows, search],
  );
  function closeCompanyModal() {
    setCompanyModalOpen(false);
    setEditingCompany(null);
    setCompanyError("");
  }
  function openCompanyModal(company?: Record<string, unknown>) {
    setEditingCompany(company ?? null);
    setCompanyForm({
      companyName: String(company?.companyName ?? ""),
      vatNumber: String(company?.vatNumber ?? ""),
      country: String(company?.country ?? ""),
      industry: String(company?.industry ?? ""),
      employeeCount:
        typeof company?.employeeCount === "number"
          ? company.employeeCount
          : undefined,
    });
    setCompanyError("");
    setCompanyModalOpen(true);
  }
  function submitCompany(event: FormEvent) {
    event.preventDefault();
    if (!companyForm.companyName.trim()) {
      setCompanyError("Company name is required.");
      return;
    }
    companyMutation.mutate({
      id: (editingCompany?.id ?? editingCompany?.companyId) as
        string | undefined,
      payload: { ...companyForm, companyName: companyForm.companyName.trim() },
    });
  }
  function closeProductModal() {
    setProductModalOpen(false);
    setProductError("");
  }
  function openProductModal() {
    setProductForm({
      companyId: "",
      productNumber: "",
      productName: "",
      productCategory: "",
      description: "",
      weight: undefined,
    });
    setProductError("");
    setProductModalOpen(true);
  }
  function submitProduct(event: FormEvent) {
    event.preventDefault();
    if (
      !productForm.companyId.trim() ||
      !productForm.productName.trim() ||
      !productForm.productNumber.trim()
    ) {
      setProductError(
        "Company ID, product number, and product name are required.",
      );
      return;
    }
    productMutation.mutate({
      ...productForm,
      companyId: productForm.companyId.trim(),
      productNumber: productForm.productNumber.trim(),
      productName: productForm.productName.trim(),
    });
  }
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">{data.eyebrow}</span>
          <h1>{data.title}</h1>
          <p>
            {data.description}
            {type === "materials" && productFilterId && (
              <span style={{ display: "block", marginTop: "0.5rem", opacity: 0.8 }}>
                Product filter: {productFilterId}
              </span>
            )}
          </p>
        </div>
        {type === "materials" && productFilterId && (
          <div className="heading-actions">
            <Link className="button secondary" to={`/products/${productFilterId}`}>
              <ArrowLeft size={16} />Back to product
            </Link>
          </div>
        )}
        <div className="heading-actions">
          <button className="button secondary">
            <Download size={16} />
            Export
          </button>
          {type === "products" && <Link className="button secondary" to="/products/new"><Plus size={16} />Create DPP</Link>}
          {type === "products" && productsFromApi.length === 0 && !productQuery.isFetching && (
            <button className="button secondary" onClick={() => demoProductMutation.mutate()} disabled={demoProductMutation.isPending}>
              {demoProductMutation.isPending ? "Loading demo data..." : "Load demo data"}
            </button>
          )}
          <button
            className="button primary"
            onClick={() => type === "companies" ? openCompanyModal() : type === "products" ? openProductModal() : undefined}
          >
            <Plus size={17} />
            Add{" "}
            {type === "compliance"
              ? "document"
              : type === "companies"
                ? "company"
                : type.slice(0, -1)}
          </button>
        </div>
      </div>
      <section className="panel table-panel">
        {type === "products" && productError && <p className="form-error catalog-error">{productError}</p>}
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={17} />
            <input
              aria-label={`Search ${data.title}`}
              placeholder={`Search ${data.title.toLowerCase()}...`}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="toolbar-actions">
            <button className="button ghost">
              <Filter size={16} />
              Filter
            </button>
            <button className="icon-button">
              <SlidersHorizontal size={17} />
            </button>
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                {data.columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, rowIndex) => (
                <tr key={`${row[0]}-${rowIndex}`}>
                  {row.map((cell, cellIndex) => (
                    <td key={`${cell}-${cellIndex}`}>
                      {cellIndex === 0 ? (
                        <div className="table-primary">
                          <div className="table-icon">
                            {type === "products"
                              ? "P"
                              : type === "suppliers"
                                ? "S"
                                : type === "materials"
                                  ? "M"
                                  : type === "companies"
                                    ? "C"
                                    : "D"}
                          </div>
                          <strong>{cell}</strong>
                        </div>
                      ) : cellIndex === row.length - 1 ? (
                        <StatusBadge>{cell}</StatusBadge>
                      ) : (
                        cell
                      )}
                    </td>
                  ))}
                  <td>
                    {type === "companies" ? (
                      <button
                        className="icon-button"
                        title="Edit company"
                        onClick={() => openCompanyModal(companies[rowIndex])}
                      >
                        <Pencil size={16} />
                      </button>
                    ) : type === "products" ? (
                      <div className="row-actions"><button className="icon-button" title="Delete product" disabled={productDeleteMutation.isPending} onClick={() => { const product = filteredProducts[rowIndex]; const id = String(product?.id ?? product?.productId ?? ""); if (id && window.confirm(`Delete ${String(product.productName ?? product.name ?? product.productNumber ?? "this product")}?`)) productDeleteMutation.mutate(id); }}><Trash2 size={16} /></button></div>
                    ) : (
                      <button className="icon-button">
                        <MoreHorizontal size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="empty-state">
            <Sparkles size={20} />
            No matching records found.
          </div>
        )}
        <div className="table-footer">
          <span>
            {productQuery.isFetching || companyQuery.isFetching
              ? `Loading ${data.title.toLowerCase()} from API...`
              : `Showing ${filtered.length} of ${rows.length} records`}
          </span>
          <div>
            <button className="page-button active">1</button>
            <button className="page-button">2</button>
            <button className="page-button">3</button>
          </div>
        </div>
      </section>
      {companyModalOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) =>
            event.target === event.currentTarget && closeCompanyModal()
          }
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="company-modal-title"
          >
            <div className="modal-header">
              <div>
                <span className="eyebrow">TENANT MANAGEMENT</span>
                <h2 id="company-modal-title">
                  {editingCompany ? "Edit company" : "Add company"}
                </h2>
              </div>
              <button
                className="icon-button"
                title="Close"
                onClick={closeCompanyModal}
              >
                <X size={18} />
              </button>
            </div>
            <form className="company-form" onSubmit={submitCompany}>
              <label>
                Company name
                <input
                  required
                  value={companyForm.companyName}
                  onChange={(event) =>
                    setCompanyForm({
                      ...companyForm,
                      companyName: event.target.value,
                    })
                  }
                />
              </label>
              <label>
                VAT number
                <input
                  value={companyForm.vatNumber}
                  onChange={(event) =>
                    setCompanyForm({
                      ...companyForm,
                      vatNumber: event.target.value,
                    })
                  }
                />
              </label>
              <div className="form-grid">
                <label>
                  Country
                  <input
                    value={companyForm.country}
                    onChange={(event) =>
                      setCompanyForm({
                        ...companyForm,
                        country: event.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  Industry
                  <input
                    value={companyForm.industry}
                    onChange={(event) =>
                      setCompanyForm({
                        ...companyForm,
                        industry: event.target.value,
                      })
                    }
                  />
                </label>
              </div>
              <label>
                Employees
                <input
                  type="number"
                  min="0"
                  value={companyForm.employeeCount ?? ""}
                  onChange={(event) =>
                    setCompanyForm({
                      ...companyForm,
                      employeeCount: event.target.value
                        ? Number(event.target.value)
                        : undefined,
                    })
                  }
                />
              </label>
              {companyError && <p className="form-error">{companyError}</p>}
              <div className="modal-actions">
                <button
                  type="button"
                  className="button secondary"
                  onClick={closeCompanyModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button primary"
                  disabled={companyMutation.isPending}
                >
                  {companyMutation.isPending
                    ? "Saving..."
                    : editingCompany
                      ? "Save changes"
                      : "Add company"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {productModalOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closeProductModal()}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
            <div className="modal-header">
              <div>
                <span className="eyebrow">PRODUCT CATALOG</span>
                <h2 id="product-modal-title">Add product</h2>
              </div>
              <button className="icon-button" title="Close" onClick={closeProductModal}><X size={18} /></button>
            </div>
            <form className="company-form" onSubmit={submitProduct}>
              <label>Company ID<input required value={productForm.companyId} onChange={(event) => setProductForm({ ...productForm, companyId: event.target.value })} placeholder="00000000-0000-0000-0000-000000000000" /></label>
              <div className="form-grid">
                <label>Product number<input required value={productForm.productNumber} onChange={(event) => setProductForm({ ...productForm, productNumber: event.target.value })} /></label>
                <label>Product name<input required value={productForm.productName} onChange={(event) => setProductForm({ ...productForm, productName: event.target.value })} /></label>
              </div>
              <div className="form-grid">
                <label>Category<input value={productForm.productCategory} onChange={(event) => setProductForm({ ...productForm, productCategory: event.target.value })} /></label>
                <label>Weight (kg)<input type="number" min="0" step="0.01" value={productForm.weight ?? ""} onChange={(event) => setProductForm({ ...productForm, weight: event.target.value ? Number(event.target.value) : undefined })} /></label>
              </div>
              <label>Description<textarea value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} /></label>
              {productError && <p className="form-error">{productError}</p>}
              <div className="modal-actions"><button type="button" className="button secondary" onClick={closeProductModal}>Cancel</button><button type="submit" className="button primary" disabled={productMutation.isPending}>{productMutation.isPending ? "Saving..." : "Add product"}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
