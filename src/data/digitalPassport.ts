export type PassportDataset = {
  id: string
  type: string
  title: string
  description: string
  fields: { label: string; value: string }[]
  children?: PassportDataset[]
}

export type DigitalProductPassport = {
  schemaVersion: string
  regulation: string
  passportId: string
  productId: string
  productNumber: string
  productName: string
  productCategory: string
  status: 'Draft' | 'In review' | 'Published'
  validFrom: string
  datasets: PassportDataset[]
}

export const samplePassportDatasets: PassportDataset[] = [
  {
    id: 'identity',
    type: 'ProductIdentity',
    title: 'Product identity',
    description: 'Unique product information required to identify and access the passport.',
    fields: [
      { label: 'Unique product ID', value: 'urn:atlas:product:AX-4401' },
      { label: 'GTIN / product number', value: 'AX-4401' },
      { label: 'Model and batch', value: 'EDH-2026 / Batch 09A' },
      { label: 'Passport access URL', value: 'https://atlas.example/passports/AX-4401' },
    ],
  },
  {
    id: 'operators',
    type: 'EconomicOperator',
    title: 'Economic operators',
    description: 'Manufacturer and responsible parties in the product value chain.',
    fields: [
      { label: 'Manufacturer', value: 'Axiom Mobility GmbH' },
      { label: 'Manufacturer identifier', value: 'VAT DE123456789' },
      { label: 'Manufacturing site', value: 'Leipzig, Germany' },
      { label: 'Responsible contact', value: 'dpp@axiom-mobility.example' },
    ],
    children: [{
      id: 'supplier-housing',
      type: 'Supplier',
      title: 'Housing supplier',
      description: 'Nested supplier record linked to the product component.',
      fields: [
        { label: 'Organisation', value: 'NordWerk Components GmbH' },
        { label: 'Component', value: 'Cast aluminium housing' },
        { label: 'Country of origin', value: 'Germany' },
      ],
    }],
  },
  {
    id: 'composition',
    type: 'MaterialComposition',
    title: 'Material composition',
    description: 'Materials and components supporting circularity, recycling, and due-diligence information.',
    fields: [
      { label: 'Primary material', value: 'Aluminium alloy 6061, 12.1 kg' },
      { label: 'Recycled content', value: '42% post-consumer and pre-consumer aluminium' },
      { label: 'Critical raw materials', value: 'None declared' },
      { label: 'Disassembly guidance', value: 'Remove fasteners before separating the housing halves' },
    ],
    children: [{
      id: 'electronics',
      type: 'Component',
      title: 'Power electronics insert',
      description: 'Nested component passport reference.',
      fields: [
        { label: 'Component ID', value: 'AX-4401-PE-01' },
        { label: 'Mass', value: '1.8 kg' },
        { label: 'Separate passport', value: 'urn:atlas:component:AX-4401-PE-01' },
      ],
    }],
  },
  {
    id: 'circularity',
    type: 'CircularityAndEndOfLife',
    title: 'Circularity and end of life',
    description: 'Repair, reuse, remanufacturing, recycling, and disposal information.',
    fields: [
      { label: 'Expected service life', value: '15 years / 250,000 km' },
      { label: 'Repairability class', value: 'B - serviceable with trained operator' },
      { label: 'Spare parts availability', value: '10 years after last market placement' },
      { label: 'Recyclability', value: '95% by mass, excluding process losses' },
      { label: 'Take-back instruction', value: 'Return through authorised automotive recycler' },
    ],
  },
  {
    id: 'environmental',
    type: 'EnvironmentalAndCompliance',
    title: 'Environmental and compliance evidence',
    description: 'Environmental performance and conformity evidence linked to this passport.',
    fields: [
      { label: 'Product carbon footprint', value: '184.6 kg CO2e per product' },
      { label: 'PCF method', value: 'ISO 14067:2018, cradle-to-gate' },
      { label: 'Energy efficiency data', value: 'Not applicable to passive housing' },
      { label: 'Conformity status', value: 'In review' },
      { label: 'Evidence reference', value: 'urn:atlas:evidence:AX-4401:2026-09' },
    ],
  },
]

export function createSamplePassport(productId: string, productNumber: string, productName: string, productCategory: string): DigitalProductPassport {
  return {
    schemaVersion: 'ESPR-DPP-0.1',
    regulation: 'EU Ecodesign for Sustainable Products Regulation (ESPR)',
    passportId: `urn:atlas:dpp:${productNumber}`,
    productId,
    productNumber,
    productName,
    productCategory,
    status: 'In review',
    validFrom: '2026-09-21',
    datasets: samplePassportDatasets,
  }
}
