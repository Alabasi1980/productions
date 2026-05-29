// Hand-curated cross-system equivalents.
// This is ERP-specific knowledge — kept in modules/erp by design.

export type SystemAlias = {
  concept: string
  arabic: string
  dynamics: string
  oracle: string
  sap: string
  note?: string
  category: string
}

export const SYSTEM_ALIASES: SystemAlias[] = [
  {
    concept: 'Production Order',
    arabic: 'أمر الإنتاج',
    dynamics: 'Production Order',
    oracle: 'Work Order',
    sap: 'Production Order / Process Order',
    note: 'في SAP يختلف الاسم حسب نوع التصنيع (Discrete vs Process)',
    category: 'التنفيذ',
  },
  {
    concept: 'BOM / Product Structure',
    arabic: 'بنية المنتج',
    dynamics: 'BOM / Formula',
    oracle: 'Item Structure / BOM',
    sap: 'Bill of Materials',
    category: 'تصميم المنتج',
  },
  {
    concept: 'Routing / Operations',
    arabic: 'مسار التصنيع',
    dynamics: 'Route',
    oracle: 'Work Definition',
    sap: 'Routing',
    note: 'في Oracle يجمع Work Definition بين Route و BOM',
    category: 'تصميم المنتج',
  },
  {
    concept: 'Finished Goods Receipt',
    arabic: 'استلام المنتج النهائي',
    dynamics: 'Report as Finished',
    oracle: 'Product Completion',
    sap: 'Goods Receipt for Order',
    category: 'التنفيذ',
  },
  {
    concept: 'Material Issue',
    arabic: 'صرف المواد',
    dynamics: 'Picking List',
    oracle: 'Material Issue',
    sap: 'Goods Issue',
    category: 'التنفيذ',
  },
  {
    concept: 'WIP (Work in Process)',
    arabic: 'العمل تحت التشغيل',
    dynamics: 'WIP Account',
    oracle: 'WIP Valuation',
    sap: 'Work in Process',
    note: 'مفهوم محاسبي مشترك بأسماء متطابقة تقريباً',
    category: 'التكاليف',
  },
  {
    concept: 'Standard Cost',
    arabic: 'التكلفة المعيارية',
    dynamics: 'Standard Cost',
    oracle: 'Standard Cost Method',
    sap: 'Standard Price',
    category: 'التكاليف',
  },
  {
    concept: 'Actual Cost',
    arabic: 'التكلفة الفعلية',
    dynamics: 'Actual Costing',
    oracle: 'Actual Cost Method',
    sap: 'Actual Costing / Material Ledger',
    category: 'التكاليف',
  },
  {
    concept: 'Variance',
    arabic: 'الانحراف',
    dynamics: 'Variance Analysis',
    oracle: 'Cost Variance',
    sap: 'Order Variance Categories',
    note: 'SAP يقسّم الانحرافات إلى فئات (Input Price, Quantity, Mixed، إلخ)',
    category: 'التكاليف',
  },
  {
    concept: 'Settlement / Close',
    arabic: 'التسوية والإغلاق',
    dynamics: 'End Order',
    oracle: 'Close Work Order',
    sap: 'Order Settlement + TECO + CLSD',
    note: 'SAP يفصل بين الإغلاق التشغيلي (TECO) والإغلاق المحاسبي (CLSD)',
    category: 'التكاليف',
  },
  {
    concept: 'Master Data — Item',
    arabic: 'المنتج / الصنف',
    dynamics: 'Released Product',
    oracle: 'Item',
    sap: 'Material Master',
    category: 'البيانات الأساسية',
  },
  {
    concept: 'Work Center',
    arabic: 'مركز العمل',
    dynamics: 'Resource / Resource Group',
    oracle: 'Work Center',
    sap: 'Work Center',
    category: 'تصميم المنتج',
  },
]

export function aliasCategories(): string[] {
  const set = new Set<string>()
  for (const alias of SYSTEM_ALIASES) set.add(alias.category)
  return Array.from(set)
}
