# 01_SAP_Production_Terms.md
# قاموس مصطلحات الإنتاج في SAP S/4HANA Manufacturing / PP

## 1. مقدمة قصيرة

هذا الملف مستخرج من دراسة **SAP S/4HANA Manufacturing / PP**. الهدف منه بناء قاموس عملي يساعد مستشار ERP أو Business Analyst على فهم مصطلحات الإنتاج في SAP وربطها بدورة العمل، التخطيط، المخزون، التكلفة، والمالية.

SAP لا يتعامل مع الإنتاج كشاشة أمر إنتاج فقط، بل كمنظومة تربط:

- **Planning**: تخطيط الطلب والمواد والطاقة.
- **Master Data**: Material Master وBOM وRouting وWork Center وProduction Version.
- **Manufacturing Execution**: Production Orders وProcess Orders وREM وKanban.
- **Inventory Movements**: GI وGR والحجوزات وحركات المخزون.
- **Controlling**: Product Cost Controlling وWIP وVariance.
- **Settlement**: تسوية تكلفة الأمر أو الفترة.
- **Universal Journal / FI**: الأثر المالي النهائي في S/4HANA.


## 2. مصطلحات البنية العامة في SAP Manufacturing

| المصطلح | الشرح بالعربية | النوع: عام ERP أم خاص SAP | دوره في الإنتاج | أثره على المخزون/التكلفة/المالية |
| --- | --- | --- | --- | --- |
| SAP S/4HANA Manufacturing | منظومة التصنيع داخل SAP S/4HANA التي تشمل التخطيط والتنفيذ والتكامل مع المخزون والجودة والتكلفة. | خاص SAP | الإطار العام لتشغيل الإنتاج. | يربط PP مع MM وCO وFI. |
| Production Planning — PP | وحدة تخطيط وتنفيذ الإنتاج. | خاص SAP | تدير MRP وProduction Orders وProcess Orders وREM وKanban. | مصدر أحداث GI وGR وWIP وVariance. |
| Production Planning and Detailed Scheduling — PP/DS | تخطيط وجدولة تفصيلية للموارد المحدودة. | خاص SAP | يدعم جدولة متقدمة للموارد والطاقة. | يؤثر على الالتزام بالمواعيد واستخدام الموارد. |
| Materials Management — MM | وحدة المواد والمخزون والمشتريات. | عام ERP باسم SAP | تتعامل مع حركات المواد والاستلام والصرف. | كل GI/GR يمر بمفهوم مخزني. |
| Sales and Distribution — SD | وحدة المبيعات والتوزيع. | خاص SAP | تغذي الطلب في Make-to-Order وSales Order Demand. | قد ينشأ Sales Order Stock وتكلفة مرتبطة بالطلب. |
| Quality Management — QM | وحدة الجودة. | خاص SAP | تنشئ Inspection Lots أثناء الإنتاج أو عند GR. | قد تمنع إتاحة المخزون وتؤثر على الهالك والرفض. |
| Controlling — CO | وحدة التحكم بالتكاليف. | خاص SAP | تستقبل تكلفة المواد والأنشطة على الأمر. | تحسب WIP وVariance وSettlement. |
| Financial Accounting — FI | وحدة المالية. | خاص SAP | تستقبل الأثر المالي النهائي. | يرتبط بـ Universal Journal وGL. |
| Universal Journal | الأستاذ الموحد في S/4HANA. | خاص SAP | يجمع الأثر المالي والتحليلي للحركات. | نهاية الأثر المالي لأحداث الإنتاج. |
| Embedded EWM / WM | إدارة المستودعات المتقدمة/التقليدية. | خاص SAP | تدعم Material Staging وGR وGI. | تحسن دقة الصرف والاستلام. |
| Plant | مصنع أو موقع توزيع تابع لشركة. | عام ERP باسم SAP | معظم بيانات الإنتاج تحفظ على مستوى Plant. | لا إنتاج بدون Plant صحيح. |
| Company Code | الكيان القانوني/المالي. | خاص SAP | يربط المصنع بالمالية. | يحدد نطاق القيود المالية. |
| Storage Location | مستودع داخل Plant. | عام ERP باسم SAP | مكان تخزين المواد والمنتجات. | يؤثر على GI وGR. |
| Production Supply Area — PSA | منطقة تغذية مواد على أرض المصنع. | خاص SAP | مهمة في Kanban وMaterial Staging. | تدعم ضبط تزويد الخط. |
| Manufacturing Execution | تنفيذ الإنتاج على أرض المصنع. | عام ERP | يشمل GI وConfirmation وGR. | ينتج حركات مخزون وتكلفة. |
| Shop Floor Control | رقابة الورشة وأوامر الإنتاج. | عام ERP باسم SAP | يتابع حالة الأمر والتنفيذ. | يربط التشغيل بالتكلفة والتقارير. |
| Product Cost Controlling | مجال تخطيط ومراقبة تكلفة المنتج. | خاص SAP | يشمل Standard Cost وWIP وVariance وSettlement. | أساسي لفهم تكلفة الإنتاج. |
| Cost Object Controlling | تجميع التكلفة على كائن مثل أمر إنتاج أو PCC. | خاص SAP | يحدد أين تتجمع التكلفة. | أساس WIP وVariance وSettlement. |

## 3. مصطلحات أنواع التصنيع في SAP

| المصطلح | الشرح | متى يستخدم؟ | كائن التنفيذ الرئيسي | أثره على التكلفة |
| --- | --- | --- | --- | --- |
| Discrete Manufacturing | تصنيع وحدات منفصلة قابلة للعد. | منتجات مثل الأجهزة والسيارات والمعدات. | Production Order | التكلفة تجمع على الأمر وتقارن بالمخطط. |
| Process Manufacturing | تصنيع دفعي/عملياتي لمواد تقاس بالوزن أو الحجم. | أغذية، أدوية، كيماويات. | Process Order | يدعم Master Recipe وPhases وBatch وCo-products. |
| Repetitive Manufacturing — REM | تصنيع متكرر بكميات كبيرة على خط إنتاج. | منتج موحد ومعدل ثابت. | Run Schedule Quantity / PCC | التكلفة على Product Cost Collector غالبًا. |
| Kanban | نظام Pull لتجديد المواد حسب الاستهلاك. | مواد منخفضة القيمة وعالية التداول. | Control Cycle | لا يستخدم أمر إنتاج تقليدي غالبًا. |
| Make-to-Stock — MTS | إنتاج للتخزين بناء على التنبؤ. | منتجات قياسية تباع من المخزون. | Planned Order ثم Production Order | يؤثر على تقييم المخزون. |
| Make-to-Order — MTO | إنتاج بعد أمر بيع. | منتج موجه لطلب عميل. | Production Order مرتبط بالطلب | قد ينتج Sales Order Stock. |
| Assemble-to-Order — ATO | تجميع بعد الطلب مع مواد قابلة للتشكيل. | منتجات configurable. | Production Order / Sales Order link | يحتاج تحقق إضافي من المصدر الأصلي. |
| Engineer-to-Order — ETO | تصميم وتصنيع حسب طلب فريد. | مشاريع ومنتجات فريدة. | Project/Production integration | يرتبط بتكلفة المشروع غالبًا. |
| Planning Without Final Assembly | إنتاج مكونات للتخزين وتأجيل التجميع النهائي. | عندما يُراد تقصير وقت التسليم. | Planned Orders + final assembly | ينقل جزءًا من التكلفة للمكونات. |
| Production Order | أمر تنفيذ في Discrete Manufacturing. | إنتاج تفصيلي بكمية محددة. | Production Order | يجمع planned/actual cost. |
| Process Order | أمر تنفيذ للصناعات العملياتية. | دفعات ومواد قابلة للقياس. | Process Order | يدعم co/by-products وbatch. |
| Run Schedule Quantity | كائن كمية تشغيل في REM. | الإنتاج المتكرر. | Run Schedule Quantity | يرتبط بـ PCC. |
| Product Cost Collector — PCC | كائن تكلفة للإنتاج المتكرر. | REM أو Product Cost by Period. | PCC | يجمع التكلفة على فترة. |
| Control Cycle | تعريف دورة Kanban. | تجديد Pull بين PSA والمصدر. | Control Cycle | يضبط التزويد لا تكلفة أمر تقليدي. |
| Batch Manufacturing | تصنيع يعتمد على Batch. | Process أو صناعات تتبع دفعات. | Batch / Process Order | مهم للجودة والتتبع. |
| Mixed Manufacturing | استخدام أكثر من نمط تصنيع داخل المؤسسة. | عند وجود Discrete وProcess وREM/Kanban معًا. | حسب النمط | استنتاج وظيفي من تنوع نماذج SAP في المقال. |

### أهم الفروقات بين أنواع التصنيع في SAP

- **Discrete**: تكلفة وتنفيذ على أمر إنتاج محدد.
- **Process**: دفعات، Master Recipe، Phases، Batch، Co/By-products.
- **REM**: تكلفة على فترة عبر Product Cost Collector.
- **Kanban**: تجديد Pull للمواد دون أمر إنتاج تقليدي.


## 4. مصطلحات Material Master وبيانات المنتج

| المصطلح | الشرح | أين يظهر في SAP؟ | أثره على الإنتاج | أثر الخطأ فيه |
| --- | --- | --- | --- | --- |
| Material Master | السجل المركزي للصنف. | كل Views الخاصة بالصنف. | يمد PP وMM وCO وFI بالبيانات. | MRP أو تكلفة أو مخزون خاطئ. |
| Material Type | نوع الصنف. | Basic Data. | يميز خام/نصف مصنع/منتج تام. | تصنيف ومعالجة خاطئة. |
| Base Unit of Measure | وحدة القياس الأساسية. | Basic Data. | أساس كل الكميات. | فروقات كمية وتكلفة. |
| MRP Views | شاشات بيانات التخطيط. | MRP 1-4. | تحدد التخطيط والتوريد والاستراتيجيات. | MRP يولد توصيات خاطئة. |
| Work Scheduling View | بيانات الجدولة والتنفيذ. | Material Master. | تحدد scheduler/profile/tolerances. | تشغيل أو استلام غير مضبوط. |
| Quality Management View | بيانات الجودة. | Material Master. | تفعل Inspection Types. | غياب Inspection Lots. |
| Accounting View | بيانات التقييم المالي. | Accounting 1/2. | تحدد valuation class وprice control. | قيود GL أو تقييم خاطئ. |
| Costing View | بيانات التكلفة. | Costing 1/2. | تدعم cost estimate وquantity structure. | Standard Cost خاطئ. |
| MRP Type | طريقة التخطيط مثل PD/VB/ND. | MRP 1. | تحدد كيف يُخطط الصنف. | لا تنتج Planned Orders صحيحة. |
| MRP Controller | مسؤول التخطيط. | MRP Views. | يتابع المادة وMD04. | ضعف مسؤولية التخطيط. |
| Lot Size | قواعد حجم الدفعة. | MRP 1. | تحدد كميات الإنتاج/الشراء. | دفعات غير مناسبة. |
| Procurement Type | داخلي/خارجي/مختلط. | MRP 2. | يحدد هل الصنف يصنع أو يشترى. | شراء بدل تصنيع أو العكس. |
| Special Procurement | توريد خاص مثل phantom أو نقل مصنع. | MRP 2. | يغير مسار التوريد. | مسار خاطئ للمواد. |
| Strategy Group | استراتيجية التخطيط. | MRP 3. | MTS/MTO وغيرها. | ربط طلب العملاء بالإنتاج بشكل خاطئ. |
| Production Storage Location | موقع تخزين الإنتاج. | MRP 2. | مصدر/وجهة حركات الإنتاج. | GI/GR من موقع خاطئ. |
| Safety Stock | مخزون أمان. | MRP 2. | يدخل في net requirements. | نقص أو فائض مخزون. |
| Backflush Indicator | مؤشر الصرف التلقائي. | MRP/BOM/Routing حسب الحالة. | يفعل GI تلقائيًا. | أخطاء COGI إذا غير مضبوط. |
| Individual / Collective Requirements | فصل أو تجميع الاحتياجات. | MRP 4. | مهم في MTO. | خلط احتياجات العملاء. |
| Repetitive Manufacturing Flag | تفعيل REM للصنف. | MRP 4. | يسمح بالإنتاج المتكرر. | REM أو PCC لا يعمل. |
| Valuation Class | تصنيف حسابات التقييم. | Accounting. | يربط الصنف بحسابات GL. | قيود مالية خاطئة. |
| Price Control | S للمعياري أو V للمتوسط. | Accounting. | يحدد طريقة تقييم المخزون. | تقييم لا يناسب سياسة التكلفة. |
| Standard Price | السعر المعياري. | Accounting/Costing. | أساس standard valuation. | Variances غير واقعية. |
| Moving Average Price | السعر المتوسط المتحرك. | Accounting. | يتغير مع الحركات. | تحليل تكلفة مختلف عن standard. |
| Costing Lot Size | كمية أساس للتكلفة. | Costing. | تستخدم في cost estimate. | تكلفة وحدة غير واقعية. |
| Costing Variant | إعداد احتساب التكلفة. | Costing. | يوجه cost estimate. | تكلفة مخالفة للسياسة. |
| Cost Component Structure | هيكل مكونات التكلفة. | Costing. | يفصل مواد/عمالة/آلة/Overhead. | تقارير تكلفة ضعيفة. |
| With Quantity Structure | استخدام BOM/Routing في التكلفة. | Costing. | يسمح بتكلفة مبنية على الكميات. | Standard Cost لا يعكس الواقع. |

## 5. مصطلحات BOM

| المصطلح | الشرح | علاقته بـ BOM | أثره على MRP | أثره على التكلفة |
| --- | --- | --- | --- | --- |
| Bill of Material — BOM | قائمة مكونات المنتج وكمياتها. | الكيان الرئيسي للمكونات. | MRP يفجر احتياجات المكونات. | Cost Rollup يعتمد عليها. |
| BOM Header | رأس BOM. | يحمل Base Quantity وUsage وStatus وValidity. | يحدد صلاحية BOM. | اختيار BOM خاطئة = تكلفة خاطئة. |
| BOM Item | سطر مكون. | يحدد المادة والكمية والفئة. | ينتج dependent requirement. | يدخل في material cost. |
| Base Quantity | الكمية الأساس. | تنسب إليها كميات المكونات. | تؤثر على الاحتياج. | تؤثر على تكلفة الوحدة. |
| BOM Usage | غرض BOM مثل Production أو Costing. | يضبط مجال الاستخدام. | MRP يحتاج BOM صالحة. | Costing قد يستخدم BOM محددة. |
| BOM Status | حالة BOM. | يضبط release/use. | قد يمنع الاستخدام. | تكلفة غير معتمدة إذا خاطئة. |
| Alternative BOM | BOM بديلة. | تمثل مواد أو طرق مختلفة. | تختار عبر Production Version. | تكلفة مختلفة. |
| Validity Period | تاريخ السريان. | يضبط التغييرات. | MRP يستخدم النسخة الفعالة. | Cost Estimate يعتمد على التاريخ. |
| Change Master | سجل تغيير هندسي. | يحكم تغييرات BOM. | يدعم تغييرات مستقبلية. | Audit للتكلفة. |
| Component Material | المادة المكونة. | سطر BOM. | ينتج احتياج. | يدخل في التكلفة. |
| Component Quantity | كمية المكون. | الاستهلاك النظري. | يحدد dependent requirement. | يحدد material cost. |
| Item Category | نوع سطر BOM. | Stock/Non-stock/Text... | يؤثر على التوريد. | قد يؤثر على التكلفة. |
| Issue Storage Location | مخزن الصرف. | على BOM item. | يوجه الصرف. | GI من مخزن خاطئ إذا غير صحيح. |
| Component Scrap | فاقد المكون. | يزيد الكمية المطلوبة. | MRP يرفع الاحتياج. | يزيد تكلفة المواد. |
| Assembly Scrap | فاقد الصنف الأم. | يرتبط غالبًا بـ Material Master. | يزيد احتياج الإنتاج. | يزيد التكلفة المستهدفة. |
| Operation Scrap | فاقد العملية. | مرتبط بـ Routing. | يؤثر على الكميات عند العملية. | يؤثر على variance. |
| Operation Assignment | ربط المكون بعملية. | يربط BOM بـ Routing. | يحدد توقيت الحاجة. | يربط التكلفة بمرحلة. |
| Multi-Level BOM | BOM متعددة المستويات. | لـ subassemblies. | MRP يفجر كل المستويات. | Costed BOM تجمع كل المستويات. |
| BOM Explosion | تفجير BOM. | قراءة كل المكونات. | أساس MRP. | أساس Cost Rollup. |
| Phantom Item | تجميع منطقي لا يُنتج مستقلاً. | يفجر مكوناته مباشرة. | لا ينشئ أمر للـ Phantom. | يؤثر على هيكل التكلفة. |
| Co-product | منتج مشترك. | يمثل بكمية سالبة مع indicator. | مرتبط بـ Process. | يحتاج توزيع تكلفة. |
| By-product | منتج جانبي. | كمية سالبة غالبًا. | ينتج مع العملية. | قد يخفض تكلفة المنتج الرئيسي. |
| Apportionment Structure | هيكل توزيع تكلفة Co-products. | مرتبط بالمنتجات المشتركة. | غير مباشر. | يوزع التكلفة. |
| BOM Selection Method | طريقة اختيار BOM. | تحدد alternative. | يستخدمها MRP. | تكلفة تختلف حسب الاختيار. |
| Costed Multilevel BOM | BOM متعددة المستويات مع تكلفة. | تحليل تكلفة. | غير مباشر. | يكشف تكلفة كل مستوى. |

### أهم مصطلحات BOM التي يجب حفظها في SAP

**BOM Header، BOM Item، Base Quantity، BOM Usage، Alternative BOM، Validity Period، Component Quantity، Operation Assignment، Phantom Item، Co-product، BOM Explosion**.


## 6. مصطلحات Routing / Work Centers / Operations

| المصطلح | الشرح | دوره التشغيلي | أثره على الجدولة | أثره على التكلفة |
| --- | --- | --- | --- | --- |
| Routing | تسلسل خطوات التصنيع. | يحدد كيف يصنع المنتج. | أساس Lead Time Scheduling. | مصدر Activity Quantities. |
| Routing Header | رأس Routing. | يحمل الاستخدام والصلاحية. | يضبط السريان. | يحدد routing المستخدم في التكلفة. |
| Operation | خطوة إنتاجية. | تنفيذ عمل معين. | لها أزمنة ومركز عمل. | تحمل activities. |
| Operation Number | رقم تسلسل العملية. | يضبط الترتيب. | يحدد التسلسل. | يربط المكونات والتكلفة. |
| Work Center | موقع تنفيذ العملية. | أين ينفذ العمل. | يحمل capacity وcalendar. | مرتبط بـ Cost Center وActivity Types. |
| Control Key | مفتاح التحكم بالعملية. | يحدد confirmation/costing/external. | يؤثر على الجدولة. | يحدد هل العملية مكلفة. |
| Standard Value Key | مفتاح القيم القياسية. | يحدد setup/machine/labor. | يدعم حساب المدة. | يدعم حساب النشاط. |
| Standard Values | قيم زمنية/كمية. | Setup/Machine/Labor. | أساس مدة العملية. | تضرب في Activity Rate. |
| Setup Time | وقت التهيئة. | قبل التشغيل. | يزيد lead time. | يدخل النشاط إن كان مربوطًا. |
| Machine Time | وقت الآلة. | زمن تشغيل آلة. | يؤثر على مدة العملية. | يضرب في machine rate. |
| Labor Time | وقت العمالة. | زمن العامل. | يؤثر على الموارد. | يضرب في labor rate. |
| Processing Time | زمن المعالجة. | زمن تشغيل عام. | جزء من الجدولة. | قد يدخل التكلفة حسب الإعداد. |
| Queue Time | انتظار قبل العملية. | انتظار. | يزيد lead time. | غالبًا غير مكلف. |
| Wait Time | انتظار بعد العملية. | انتظار. | يزيد المدة. | غالبًا غير مكلف. |
| Move Time | نقل بين المراكز. | نقل المنتج. | يزيد lead time. | غالبًا غير مكلف. |
| Operation Quantity | كمية العملية. | كمية تمر بالعملية. | تدخل حساب الزمن. | تؤثر على activity cost. |
| Base Quantity | كمية أساس العملية. | أساس standard values. | تدخل الصيغ. | تحسب تكلفة الوحدة. |
| Component Allocation | ربط BOM بالعملية. | يحدد متى تستهلك المادة. | يؤثر على توقيت الحاجة. | يربط الاستهلاك بمرحلة. |
| Activity Type | نوع نشاط مثل آلة/عمالة. | يمثل ما يقدمه cost center. | غير مباشر. | يضرب في rate. |
| Cost Center | مركز تكلفة. | مرتبط بـ Work Center. | غير مباشر. | مصدر Activity Rates. |
| Activity Rate | سعر النشاط. | تكلفة وحدة النشاط. | غير مباشر. | quantity × rate. |
| KP26 | إعداد أسعار Activity Types. | CO. | غير مباشر. | إذا السعر صفر فتكلفة الأمر ناقصة. |
| Formula | صيغة حساب زمن/نشاط. | تطبق على standard values. | تحدد scheduling. | تحدد كمية النشاط المكلفة. |
| Capacity | الطاقة المتاحة. | قدرة Work Center. | أساس capacity planning. | أثر غير مباشر. |
| Scheduling | جدولة العمليات. | تحديد تواريخ البداية والنهاية. | أساس التنفيذ. | غير مباشر. |
| Lead Time Scheduling | جدولة زمنية تفصيلية. | تحسب تواريخ العمليات. | مباشر. | غير مباشر. |
| Rate Routing | Routing للإنتاج المتكرر. | REM. | يدعم معدلات الإنتاج. | يرتبط بـ PCC. |

```text
Routing Operation → Work Center → Cost Center → Activity Type → Activity Rate → Production Order Cost
```


## 7. مصطلحات Production Version

| المصطلح | الشرح | لماذا مهم في SAP؟ | أثر غيابه أو خطئه |
| --- | --- | --- | --- |
| Production Version | عقد يربط BOM محددة مع Routing/Master Recipe وLot Size وValidity. | إلزامي في S/4HANA لاختيار طريقة التصنيع. | فشل MRP أو أمر أو تكلفة خاطئة. |
| BOM Alternative | BOM بديلة داخل PV. | تحدد مكونات التصنيع. | مواد خاطئة. |
| Routing Alternative | Routing بديل داخل PV. | تحدد خطوات التصنيع. | جدولة وتكلفة خاطئة. |
| Master Recipe Alternative | بديل Master Recipe. | مهم في Process. | وصفة غير صحيحة. |
| Lot Size Range | مدى الكميات. | اختيار طريقة حسب كمية الإنتاج. | استخدام طريقة غير مناسبة. |
| Valid From / Valid To | تاريخ السريان. | يمنع استخدام نسخة غير صالحة. | فشل audit والتكلفة. |
| Production Line | خط الإنتاج في REM. | يربط PV بخط الإنتاج. | REM غير مضبوط. |
| Production Version in MRP | استخدام PV في التخطيط. | MRP يعرف BOM/Routing. | Planned Orders غير دقيقة. |
| Production Version in Cost Estimate | استخدام PV في التكلفة. | Cost Estimate يختار quantity structure. | Standard Cost خاطئ. |
| Production Version in Order Creation | استخدام PV عند إنشاء الأمر. | ينسخ BOM/Routing Snapshot. | أمر غير مطابق. |
| Production Version Selection | آلية اختيار PV. | تحسم الغموض. | تعريف متضارب. |

### لماذا Production Version هو العقد بين الهندسة والإنتاج والتكلفة؟

لأنه يحدد **أي BOM + أي Routing/Master Recipe + لأي كمية + لأي فترة**. بدونه لا يعرف MRP ماذا يخطط، ولا يعرف الإنتاج ماذا ينفذ، ولا تعرف التكلفة أي Quantity Structure تُسعّر.


## 8. مصطلحات MRP والتخطيط

| المصطلح | الشرح | دوره في التخطيط | علاقته بالإنتاج |
| --- | --- | --- | --- |
| Material Requirements Planning — MRP | حساب احتياجات المواد. | ينتج Planned Orders أو PRs. | يمهد لإنشاء Production Orders. |
| MRP Live | MRP على HANA مباشرة. | أسرع في S/4HANA. | ينتج مقترحات توريد. |
| Classic MRP | MRP التقليدي. | نمط أقدم/لبعض الحالات. | نفس الهدف العام. |
| Planned Independent Requirements — PIR | طلب تنبؤي. | يمثل forecast. | ينتج احتياجات إنتاج. |
| Sales Order Demand | طلب من أمر بيع. | أساسي في MTO. | قد ينتج أمر خاص بالعميل. |
| Dependent Requirements | احتياجات مكونات من BOM Explosion. | تحدد احتياج المواد. | تصرف لاحقًا في GI. |
| Planned Order | كائن تخطيطي مؤقت. | قابل للتعديل والحذف. | يتحول إلى Production/Process Order. |
| Purchase Requisition | طلب شراء مخطط. | للأصناف الخارجية. | بديل توريد للمكونات. |
| MRP Area | نطاق تخطيط. | يفصل التخطيط. | يوجه التوريد. |
| Firming Indicator | تثبيت Planned Order. | يمنع MRP من تغييره. | يحفظ قرار المخطط. |
| Stock / Requirements List — MD04 | قائمة المخزون والاحتياجات. | أداة MRP Controller. | تعرض الأوامر والطلبات. |
| Reorder Point Planning | تخطيط نقطة إعادة الطلب. | مواد منخفضة القيمة. | قد ينتج شراء/إنتاج. |
| Forecast-Based Planning | تخطيط مبني على التنبؤ. | يعتمد على forecast. | ينتج supply proposals. |
| Time-Phased Planning | تخطيط دوري. | ينظم planning dates. | يؤثر على توقيت الأوامر. |
| Planning Strategy | استراتيجية تخطيط. | تحدد MTS/MTO وغيرها. | تغير علاقة الطلب بالإنتاج. |
| Strategy 10 | Net Requirements Planning. | MTS. | إنتاج للتخزين. |
| Strategy 20 | Make-to-Order. | لكل أمر بيع. | إنتاج خاص بالطلب. |
| Strategy 40 | Planning with Final Assembly. | Forecast + Sales. | تخطيط على النهائي. |
| Strategy 50 | Planning Without Final Assembly. | تأجيل التجميع النهائي. | إنتاج مكونات للتخزين. |
| Conversion | تحويل Planned Order إلى أمر تنفيذ. | نقطة فصل التخطيط عن التنفيذ. | بعده لا يغير MRP الأمر. |
| MRP Controller | مسؤول التخطيط. | يراجع MD04. | يتخذ قرار التحويل. |
| Safety Stock | مخزون أمان. | يدخل net requirements. | يقلل نقص الإنتاج. |
| Net Requirements Calculation | حساب الطلب الصافي. | قلب MRP. | ينتج مقترحات التوريد. |

### الفرق بين Planned Order وProduction Order

| البعد | Planned Order | Production Order |
|---|---|---|
| الطبيعة | تخطيطي | تنفيذي |
| قابلية التعديل من MRP | نعم | لا بعد التحويل |
| التكلفة | تقديرية | فعلية تتجمع |
| المخزون | احتياجات مخططة | Reservations وGI/GR |
| الهدف | اقتراح توريد | تنفيذ إنتاج |


## 9. مصطلحات Production Order Lifecycle

| المصطلح/الحالة | الشرح | ما يسمح به؟ | ما يمنع؟ | الأثر المخزني/المالي |
| --- | --- | --- | --- | --- |
| Production Order | أمر إنتاج تنفيذي. | GI/Confirmation/GR بعد REL. | التنفيذ قبل Release. | يجمع actual cost. |
| Create Production Order | إنشاء الأمر. | نسخ BOM/Routing. | لا تنفيذ قبل REL. | Planned cost. |
| Convert Planned Order | تحويل التخطيط إلى تنفيذ. | إنشاء أمر. | MRP لا يغيره لاحقًا. | فصل التخطيط عن التنفيذ. |
| CRTD — Created | الأمر منشأ. | التعديل والمراجعة. | GI/Confirmation/GR. | لا أثر مخزني فعلي. |
| REL — Released | الأمر مُطلق. | GI وConfirmation وGR. | التنفيذ قبله. | Reservations وحركات لاحقة. |
| PCNF — Partially Confirmed | تأكيد جزئي. | استكمال التنفيذ. | اعتباره منتهيًا. | تكلفة أنشطة جزئية. |
| CNF — Confirmed | تأكيد نهائي. | GR/TECO/Settlement حسب الحالة. | تأكيد إضافي إلا بضوابط. | تكلفة أنشطة نهائية. |
| PDLV — Partially Delivered | استلام جزئي. | استلام باقي الكمية. | اعتباره delivered كامل. | Finished Goods جزئي. |
| DLV — Delivered | استلام نهائي. | TECO/Settlement. | GR إضافي إلا بسماحية. | Finished Goods مكتمل. |
| TECO — Technically Completed | إغلاق فني. | Settlement ومراجعة. | حركات إنتاج إضافية غالبًا. | تحرير Reservations وتمهيد settlement. |
| CLSD — Closed | إغلاق نهائي. | عرض وتقارير فقط. | تعديلات وتسويات لاحقة. | نهاية مالية. |
| User Status | حالة يضيفها العميل. | ضوابط إضافية. | حسب profile. | تحسين الرقابة. |
| System Status | حالة SAP النظامية. | تتحكم في العمليات. | لا تغير تعريفها. | أساس workflow. |
| Reservation | حجز مكونات للأمر. | تخصيص مواد. | استخدامها لأمر آخر. | يمهد GI. |
| Material Staging | تجهيز المواد للأمر. | نقل/تجهيز. | بدء دون مواد. | يدعم الصرف الصحيح. |
| Pull List | قائمة سحب المواد. | تجهيز من المستودع. | نقص تجهيز. | تحسن توفر المواد. |
| Goods Issue | صرف المواد. | بعد Release. | قبل Release. | ينقص المواد ويزيد WIP. |
| Confirmation | تسجيل الوقت والكمية والهالك. | بعد التنفيذ. | بيانات غير منطقية. | يحمل activity cost. |
| Goods Receipt | استلام المنتج النهائي. | بعد/مع التأكيد. | استلام خاطئ. | يزيد FG ويخفض WIP. |
| Settlement | تسوية تكلفة الأمر. | بعد period-end/TECO. | إذا البيانات ناقصة. | ينقل WIP/Variance ماليًا. |

## 10. مصطلحات Process Order وMaster Recipe

| المصطلح | الشرح | الفرق عن Discrete Manufacturing | أثره على التكلفة/الجودة |
| --- | --- | --- | --- |
| Process Order | أمر إنتاج للصناعات العملياتية. | يستخدم Master Recipe. | يدعم Batch وCo/By-products. |
| Master Recipe | تعريف طريقة التصنيع العملياتية. | Operations وPhases. | أساس التكلفة والجودة. |
| Operation | عملية كبرى. | تحتوي phases. | تجمع تنفيذ على Resource. |
| Phase | خطوة تفصيلية. | التأكيد غالبًا عليها. | تحمل قيم نشاط وجودة. |
| Resource | مورد في Process. | بديل Work Center. | مرتبط بـ Cost Center وActivity Types. |
| Primary Resource | المورد الأساسي. | أساسي للعملية. | مصدر تكلفة وطاقة. |
| Secondary Resource | مورد مساعد. | إضافي. | قد يضيف تكلفة. |
| Material List | قائمة مواد Phase. | بديل component allocation. | تؤثر على GI والتكلفة. |
| Phase Relationship | علاقات phases. | أكثر مرونة. | تؤثر على الجدولة. |
| Process Instruction | تعليمات تنفيذية. | خاصة بـ Process. | تدعم الجودة. |
| PI Sheet | ورقة/شاشة تعليمات. | تجمع بيانات الورشة. | رقابة تنفيذية. |
| Control Recipe | مخرج لنظام التحكم. | تكامل المصنع. | يحتاج تحقق إضافي من المصدر الأصلي. |
| Batch Management | إدارة الدفعات. | مركزية في Process. | Traceability وجودة. |
| Batch Determination | اختيار الدفعة المناسبة. | حسب خصائص ومعايير. | جودة وتكلفة. |
| Batch Where-Used List | تتبع استخدام الدفعة. | أقوى في Process. | استدعاء وتحقيق. |
| Co-product | منتج مشترك. | أكثر شيوعًا. | توزيع تكلفة. |
| By-product | منتج جانبي. | ينتج مع العملية. | قد يخفض تكلفة الأساسي. |
| Apportionment Structure | هيكل توزيع co-products. | خاص بالتكلفة. | يوزع التكلفة. |

## 11. مصطلحات Repetitive Manufacturing وKanban

| المصطلح | الشرح | متى يستخدم؟ | أثره على التنفيذ والتكلفة |
| --- | --- | --- | --- |
| Repetitive Manufacturing — REM | إنتاج متكرر بدون أمر لكل دفعة. | خط ثابت ومنتج موحد. | يعتمد على Backflush وPCC. |
| Run Schedule Quantity | كمية تشغيل في REM. | نتيجة MRP لـ REM. | تنفذ على خط الإنتاج. |
| Product Cost Collector — PCC | كائن تكلفة الفترة. | REM/Product Cost by Period. | يجمع WIP/Variance period-based. |
| Period-Based Costing | تكلفة على الفترة. | REM. | تسوية شهرية/فترية. |
| Reporting Point | نقطة تقرير في REM. | لتسجيل تقدم مراحل. | متابعة التنفيذ. |
| Backflush | صرف تلقائي. | REM وحالات محددة. | ينقص المخزون تلقائيًا. |
| Auto Goods Receipt | استلام تلقائي. | REM أو profile. | يزيد FG تلقائيًا. |
| Production Line | خط الإنتاج. | REM. | يرتبط بـ Production Version. |
| Kanban | نظام Pull. | مواد منخفضة القيمة. | يبسط التنفيذ. |
| Pull Replenishment | تجديد بالسحب. | عند استهلاك الحاوية. | يطلق التوريد. |
| Control Cycle | دورة Kanban. | بين PSA والمصدر. | يضبط تدفق المواد. |
| Container | حاوية Kanban. | كمية تجديد. | حالتها تحرك التوريد. |
| Full | حاوية ممتلئة. | المادة متوفرة. | لا تحتاج تزويد. |
| Empty | حاوية فارغة. | تبدأ طلب تجديد. | تطلق التوريد. |
| In Process | قيد التجديد. | التوريد جارٍ. | متابعة. |
| Wait | انتظار. | حالة بينية. | يحتاج تحقق إضافي من المصدر الأصلي. |
| Replenishment Strategy | طريقة التزويد. | Kanban. | شراء/إنتاج/نقل. |
| Production Supply Area — PSA | منطقة تزويد الإنتاج. | Kanban/Staging. | تربط المستودع بالخط. |

## 12. مصطلحات Goods Issue / Material Consumption

| المصطلح | الشرح | أثره على المخزون | أثره على WIP/التكلفة |
| --- | --- | --- | --- |
| Goods Issue — GI | صرف مواد من المخزون للأمر. | ينقص مخزون المواد. | يزيد WIP/تكلفة الأمر. |
| Material Consumption | استهلاك المواد. | ناتج GI. | جزء من actual cost. |
| Movement Type 261 | حركة صرف لأمر إنتاج. | ينقص المخزون. | يحمل المواد على الأمر. |
| Movement Type 262 | عكس 261. | يزيد المخزون. | يعكس تكلفة الصرف. |
| Reservation | حجز مكونات. | لا ينقص المخزون فعليًا. | يمهد GI. |
| Manual Issue | صرف يدوي. | يعتمد على المستخدم. | أدق إذا انضبط. |
| Backflush | صرف تلقائي. | ينقص المخزون عند التأكيد/GR. | قد يولد COGI. |
| Pick List | قائمة التقاط مواد. | توجه المستودع. | تقلل أخطاء الصرف. |
| Pull List | قائمة سحب مواد. | تجهز للخط. | تدعم staging. |
| Material Staging | تجهيز مواد. | ينقل أو يخصص. | يمنع توقف الإنتاج. |
| Production Storage Location | موقع تخزين الإنتاج. | مصدر الصرف. | خطؤه يسبب GI خاطئ. |
| Batch / Serial Issue | صرف بBatch/Serial. | يحفظ traceability. | مهم للجودة. |
| Substitute Material | مادة بديلة. | تصرف بدل الأصل. | قد تسبب variance. |
| Excess Issue | صرف زائد. | ينقص أكثر. | يزيد WIP وUsage Variance. |
| Under Issue | صرف أقل. | ينقص أقل. | نقص تنفيذ أو variance. |
| COGI | أخطاء حركات بضائع تلقائية. | حركات فاشلة. | تمنع دقة التكلفة. |
| CO1P | معالجة postprocessing لبعض الأخطاء. | يعالج حركات معلقة. | مهم قبل الإغلاق. |
| Failed Material Movements | حركات فاشلة. | مخزون غير محدث. | تكلفة غير صحيحة. |
| Pending Cost Postings | ترحيلات تكلفة معلقة. | لا تغير المخزون بالضرورة. | تؤثر على WIP/Settlement. |

## 13. مصطلحات Confirmation

| المصطلح | الشرح | ماذا يسجل؟ | أثره على التكلفة والتقارير |
| --- | --- | --- | --- |
| Confirmation | تأكيد ما حدث في الإنتاج. | كمية، وقت، هالك، أنشطة. | يحمل activity cost ويؤثر على status. |
| Operation Confirmation | تأكيد عملية. | وقت وكمية لكل Operation. | دقة أعلى للتكلفة. |
| Order Header Confirmation | تأكيد رأس الأمر. | تنفيذ إجمالي. | أبسط وأقل تفصيلاً. |
| Time Ticket | تأكيد وقت. | زمن العمل. | يدعم تكلفة النشاط. |
| Milestone Confirmation | تأكيد عند نقطة milestone. | مرحلة رئيسية. | قد يسجل السابق تلقائيًا. |
| Progress Confirmation | تأكيد تقدم نسبي. | نسبة أو تقدم. | يحتاج تحقق إضافي من المصدر الأصلي. |
| Partial Confirmation | تأكيد جزئي. | جزء من الكمية/الوقت. | PCNF وتكلفة جزئية. |
| Final Confirmation | تأكيد نهائي. | إكمال العملية/الأمر. | CNF وقد يفعل GR/GI. |
| Yield Quantity | كمية جيدة. | كمية صالحة. | تؤثر على GR والvariance. |
| Scrap Quantity | كمية هالك. | كمية تالفة. | Scrap variance. |
| Rework Quantity | كمية إعادة تشغيل. | كمية تحتاج معالجة. | تكلفة إضافية. |
| Activity Quantities | كميات الأنشطة. | ساعات/وحدات نشاط. | تضرب في activity rate. |
| Personnel Number | رقم الموظف. | من نفذ العمل. | رقابة وتحليل. |
| Posting Date | تاريخ الترحيل. | الفترة. | يؤثر على الفترة المالية. |
| Reason for Variance | سبب الانحراف. | سبب فرق. | تحليل. |
| Auto Goods Receipt | GR تلقائي. | استلام تلقائي. | يزيد FG ويخفض WIP. |
| Automatic Goods Issue | GI تلقائي. | صرف تلقائي. | يزيد WIP وقد ينتج COGI. |
| Actual Activity Posting | ترحيل نشاط فعلي. | Activity quantities. | يحمل تكلفة الموارد. |
| Process Control Key | مفتاح تحكم Process. | سلوك العملية. | يحتاج تحقق إضافي. |
| CO11N | تأكيد عملية. | Operation Confirmation. | أداة تنفيذ. |
| CO15 | تأكيد رأس الأمر. | Order Confirmation. | أداة تنفيذ. |
| CO13 | إلغاء Confirmation. | عكس تأكيد. | يصحح تكلفة وتقارير. |

## 14. مصطلحات Goods Receipt والجودة

| المصطلح | الشرح | أثره على المخزون | أثره على الجودة/التكلفة |
| --- | --- | --- | --- |
| Goods Receipt — GR | استلام المنتج النهائي. | يزيد Finished Goods. | يخفض WIP غالبًا. |
| Movement Type 101 | حركة GR. | زيادة مخزون المنتج. | أثر مالي على FG/WIP. |
| Movement Type 102 | عكس GR. | ينقص المنتج النهائي. | يعكس الأثر المالي. |
| Finished Goods Inventory | مخزون المنتج النهائي. | يزيد عند GR. | يتأثر بالتكلفة. |
| Auto Goods Receipt | استلام تلقائي. | يزيد المخزون تلقائيًا. | خطر إذا قبل الجودة. |
| Production Scheduling Profile | ملف جدولة/تنفيذ. | غير مباشر. | قد يحدد Auto GR/Release. |
| Quality Inspection Stock | مخزون تحت الفحص. | غير متاح بالكامل. | يتطلب Usage Decision. |
| Inspection Lot | دفعة فحص. | تنشأ عند release أو GR. | تحكم الجودة. |
| Inspection Type 03 | فحص أثناء الإنتاج. | ليس GR فقط. | رقابة خلال الإنتاج. |
| Inspection Type 04 | فحص عند GR. | يوجه إلى inspection stock. | يمنع إتاحة غير معتمدة. |
| Usage Decision | قرار استخدام. | ينقل للمخزون المقبول/المرفوض. | قبول أو رفض. |
| Batch | دفعة مخزون. | تتبع كمية متجانسة. | جودة وتتبع. |
| Serial Number | رقم تسلسلي. | تتبع وحدة. | مهم للمنتجات الحساسة. |
| PDLV | استلام جزئي. | FG جزئي. | WIP لا يزال مفتوحًا. |
| DLV | استلام كامل. | FG كامل. | يمهد TECO/Settlement. |

## 15. مصطلحات Product Cost Controlling

| المصطلح | الشرح | متى يظهر؟ | أثره على WIP/Variance/Settlement |
| --- | --- | --- | --- |
| Product Cost Planning | تخطيط تكلفة المنتج. | قبل الإنتاج. | ينتج Standard Cost. |
| Product Cost by Order | تكلفة على أمر. | Discrete/Process. | WIP/Variance/Settlement للأمر. |
| Product Cost by Period | تكلفة على فترة. | REM/PCC. | WIP/Variance period-based. |
| Product Cost Collector — PCC | كائن تكلفة للفترة. | REM. | يستقبل التكاليف والتسوية. |
| Cost Object Controlling | تحكم بالتكلفة على كائن. | أمر أو PCC. | قلب WIP/Variance. |
| Standard Cost Estimate | تقدير تكلفة معيارية. | قبل التنفيذ. | أساس GR وVariance. |
| Cost Rollup | تجميع تكلفة BOM/Routing. | التكلفة المعيارية. | أي خطأ ينتقل للمخزون. |
| Cost Component Split | تفصيل التكلفة. | تقارير التكلفة. | مواد/عمالة/Overhead. |
| Costing Variant | إعداد احتساب التكلفة. | Cost Estimate. | يحدد منهج الحساب. |
| Valuation Variant | مصادر الأسعار. | Costing. | يحدد أسعار المواد والأنشطة. |
| Costing Type | نوع التكلفة. | Costing. | يحتاج تحقق إضافي. |
| Quantity Structure | BOM + Routing + PV. | Cost Estimate. | أساس الكمية والتكلفة. |
| Cost Element | عنصر تكلفة. | CO. | يصنف التكلفة. |
| Secondary Cost Element | عنصر تكلفة داخلي. | Activity Allocation. | ينقل تكلفة Activity Type. |
| Activity Allocation | تحميل نشاط. | Confirmation. | يزيد تكلفة الأمر. |
| Overhead Costing Sheet | تحميل Overhead. | Costing/Actual. | يزيد target/actual cost. |
| Target Cost | تكلفة مستهدفة. | Variance Analysis. | مقارنة مع actual. |
| Actual Cost | تكلفة فعلية. | GI/Confirmation/GR. | أساس WIP/Variance. |
| Planned Cost | تكلفة مخططة. | إنشاء/Release. | تقارن لاحقًا. |
| Standard Cost | تكلفة معيارية. | GR وتقييم المنتج. | ينتج variance عند الفرق. |
| Moving Average Price | متوسط متحرك. | تقييم V. | يختلف عن standard. |
| WIP Calculation | احتساب WIP. | Period-end. | يبقي تكلفة غير مكتملة. |
| Variance Calculation | احتساب الانحرافات. | بعد اكتمال/TECO. | يفسر الفرق. |
| Settlement | تسوية الأمر/PCC. | Period-end. | ينقل WIP/Variance. |
| Settlement Profile | قواعد التسوية. | Cost Object. | يحدد مستقبل التسوية. |
| Result Analysis | تحليل نتيجة/تحديد WIP. | يحتاج تحقق إضافي. | قد يرتبط بـ WIP. |
| Event-Based Production Cost Posting | ترحيل تكلفة حسب الحدث. | Cloud أو UPA حسب المقال. | يغير توقيت WIP/Variance. |
| Universal Parallel Accounting — UPA | محاسبة متوازية. | إصدارات محددة. | تؤثر على event-based posting. |
| Universal Journal | الأستاذ الموحد. | كل القيود. | نهاية الترحيل المالي. |

### أهم 15 مصطلح تكلفة يجب حفظها في SAP

Product Cost Planning، Standard Cost Estimate، Quantity Structure، Cost Rollup، Cost Component Split، Activity Type، Activity Rate، Cost Center، Product Cost by Order، Product Cost by Period، WIP Calculation، Variance Calculation، Settlement، Product Cost Collector، Universal Journal.


## 16. مصطلحات WIP وVariance وSettlement

| المصطلح | الشرح | سبب ظهوره | من يراجعه؟ | أثره المالي |
| --- | --- | --- | --- | --- |
| Work in Process — WIP | قيمة الإنتاج غير المكتمل. | GI/Activities دون اكتمال وتسوية. | CO/FI. | يبقى كقيمة تحت التشغيل. |
| WIP at Actual Cost | WIP حسب الفعلي. | تكاليف فعلية لأمر غير مكتمل. | CO/FI. | يعكس actual cost. |
| WIP at Target Cost | WIP حسب المستهدف. | حسب الإعداد. | CO. | يحتاج تحقق إضافي. |
| Result Analysis | تحليل لتحديد WIP/نتائج. | Period-end. | CO. | يحتاج تحقق إضافي. |
| Variance | فرق بين target/standard وactual. | عند الاكتمال/التسوية. | CO والإدارة. | ينتقل ماليًا. |
| Input Quantity Variance | فرق كمية المدخلات. | استهلاك أعلى/أقل. | الإنتاج وCO. | يكشف BOM/تنفيذ. |
| Input Price Variance | فرق سعر المدخلات. | سعر فعلي مختلف. | الشراء/CO. | أثر مالي. |
| Resource Usage Variance | فرق استخدام المورد. | وقت فعلي مختلف. | الإنتاج وCO. | يكشف Routing/Execution. |
| Resource Price Variance | فرق سعر المورد. | Activity Rate مختلف. | CO. | أثر مالي. |
| Scrap Variance | فرق الهالك. | Scrap أعلى/أقل. | الجودة والإنتاج. | تكلفة هالك. |
| Lot Size Variance | فرق حجم الدفعة. | كمية تختلف عن أساس التكلفة. | CO. | يؤثر على fixed setup. |
| Remaining Variance | فرق متبقٍ. | عند التسوية. | CO. | يحتاج تحليل. |
| Settlement | تسوية تكلفة الأمر. | Period-end/TECO. | Cost Accountant. | ينقل WIP/Variance. |
| Settlement Receiver | مستقبل التسوية. | حسب القاعدة. | CO/FI. | Material/COPA/GL... |
| Settlement Rule | قاعدة التسوية. | إعداد الأمر/التكلفة. | CO. | تحدد المستقبل. |
| Profitability Analysis — COPA | تحليل الربحية. | بعد settlement/SD. | الإدارة والمالية. | يستقبل نتائج/انحرافات. |
| FI Posting | قيد مالي. | GI/GR/Settlement. | المالية. | يظهر في Universal Journal. |
| Period-End Closing | إغلاق نهاية الفترة. | شهريًا غالبًا. | CO/FI. | WIP/Variance/Settlement. |
| TECO | إغلاق فني. | بعد التنفيذ. | الإنتاج/CO. | يمهد للتسوية. |
| CLSD | إغلاق نهائي. | بعد التسوية. | CO. | لا حركات لاحقة. |

## 17. مصطلحات التقارير والرقابة

| التقرير/الأداة | الشرح | من يستخدمه؟ | لماذا مهم؟ |
| --- | --- | --- | --- |
| MD04 | Stock/Requirements List. | MRP Controller. | يرى الطلب والعرض وPlanned Orders. |
| COOIS | Order Information System. | الإنتاج وCO. | متابعة أوامر الإنتاج. |
| Order Information System | نظام معلومات الأوامر. | مشرف الإنتاج. | رقابة تنفيذية. |
| Missing Parts List | قائمة المواد الناقصة. | المخازن/الإنتاج. | تمنع التنفيذ بلا مواد. |
| Dispatch List | قائمة تنفيذ يومية. | المشغلون. | توجيه العمل على الأرض. |
| Capacity Load Report | تقرير حمل الطاقة. | التخطيط. | يكشف overload. |
| COGI | أخطاء backflush/material movements. | المخازن/ERP. | يجب تنظيفها قبل الإغلاق. |
| CO1P | Postprocessing لبعض الحركات. | ERP/الإنتاج. | يعالج أخطاء تأكيد/حركات. |
| Cost Analysis | تحليل التكلفة. | محاسب التكاليف. | يفسر planned/actual/variance. |
| Order Cost Display | عرض تكلفة الأمر. | CO/الإنتاج. | يرى تكلفة الأمر. |
| WIP Report | تقرير WIP. | CO/FI. | يتابع الإنتاج غير المكتمل. |
| Variance Report | تقرير الانحرافات. | CO/الإدارة. | يكشف أسباب الفروقات. |
| Settlement Report | تقرير التسوية. | CO/FI. | يتحقق من settlement. |
| Stock / Requirements List | MD04. | MRP. | رقابة التخطيط. |
| Batch Where-Used List | تتبع استخدام الدفعات. | الجودة. | استدعاء وتحقيق. |
| Inspection Lot Report | تقرير دفعات الفحص. | الجودة. | متابعة الفحص والقرار. |
| Production Order Status Report | تقرير حالات أوامر الإنتاج. | الإنتاج. | يكشف CRTD/REL/CNF/DLV/TECO/CLSD. |
| Production-to-FI Reconciliation | مطابقة الإنتاج مع المالية. | CO/FI. | يتحقق من وصول الأثر للمالية. |

## 18. ملخص تنفيذي للمصطلحات الأكثر أهمية

| الأولوية | المصطلح | لماذا مهم؟ |
| --- | --- | --- |
| 1 | Material Master | مصدر التخطيط والتكلفة والمخزون. |
| 2 | BOM | يحدد مكونات المنتج. |
| 3 | Routing | يحدد خطوات التصنيع. |
| 4 | Work Center | يربط العملية بالطاقة والتكلفة. |
| 5 | Production Version | العقد بين BOM وRouting والتكلفة. |
| 6 | MRP | يحول الطلب إلى مقترحات. |
| 7 | Planned Order | كائن تخطيطي قبل التنفيذ. |
| 8 | Production Order | كائن التنفيذ والتكلفة. |
| 9 | Process Order | كائن التنفيذ للصناعات العملياتية. |
| 10 | Goods Issue | صرف المواد وزيادة WIP. |
| 11 | Confirmation | تسجيل الوقت والكمية والهالك. |
| 12 | Goods Receipt | استلام المنتج النهائي. |
| 13 | WIP | قيمة الإنتاج غير المكتمل. |
| 14 | Variance | تحليل الفرق. |
| 15 | Settlement | تسوية WIP/Variance. |
| 16 | Universal Journal | نهاية الأثر المالي. |
| 17 | Activity Type | مصدر تكلفة العمل/الآلة. |
| 18 | Cost Center | مصدر أسعار الأنشطة. |
| 19 | KP26 | إعداد Activity Rates. |
| 20 | Standard Cost Estimate | تكلفة معيارية. |
| 21 | Cost Component Split | تفصيل عناصر التكلفة. |
| 22 | Backflush | صرف تلقائي. |
| 23 | COGI | أخطاء الصرف التلقائي. |
| 24 | TECO | إغلاق فني. |
| 25 | CLSD | إغلاق نهائي. |
| 26 | Product Cost Collector | كائن تكلفة REM. |
| 27 | Kanban Control Cycle | ضبط Pull Replenishment. |
| 28 | Inspection Lot | كائن فحص الجودة. |
| 29 | Batch | تتبع الدفعات. |
| 30 | Production-to-FI Reconciliation | مطابقة الإنتاج مع المالية. |

## 19. مصطلحات يجب مقارنتها لاحقًا مع نظام ناتج

| المصطلح | سؤال المقارنة مع نظام ناتج |
| --- | --- |
| Production Version | هل يدعم ناتج مفهوم Production Version أو ما يعادله؟ |
| Planned Order | هل يوجد فصل بين Planned Order وProduction Order؟ |
| Production Order Statuses | هل توجد حالات واضحة لأمر الإنتاج؟ |
| BOM | هل يدعم BOM متعددة المستويات وبدائل وتواريخ سريان؟ |
| Routing | هل يدعم خطوات إنتاج وربطها بمراكز عمل؟ |
| Work Center | هل يدعم مراكز عمل مرتبطة بتكلفة وطاقة؟ |
| Activity Type | هل يدعم تحميل تكلفة العمالة/الآلة؟ |
| Goods Issue | هل يدعم GI بحركة مخزون واضحة؟ |
| Goods Receipt | هل يدعم GR للمنتج النهائي؟ |
| Confirmation | هل يدعم تسجيل الوقت والكمية والهالك؟ |
| Backflush | هل يدعم الصرف التلقائي؟ |
| COGI-like errors | هل توجد آلية لمعالجة فشل الحركات التلقائية؟ |
| WIP | هل يدعم WIP أو بديل مالي واضح؟ |
| Variance | هل يدعم تحليل الانحرافات؟ |
| Settlement | هل يدعم تسوية أو إغلاق تكلفة الأمر؟ |
| Product Cost Collector | هل يدعم بديلًا للإنتاج المتكرر؟ |
| Batch / Serial Traceability | هل يدعم تتبع الدفعات والأرقام التسلسلية؟ |
| Quality Inspection | هل يدعم فحص الجودة أثناء أو بعد الإنتاج؟ |
| TECO / CLSD | هل يفرق بين الإغلاق الفني والإغلاق النهائي؟ |
| Universal Journal / FI Link | هل يوجد ربط واضح بين الإنتاج والمالية؟ |

## 20. خاتمة قصيرة

فهم مصطلحات SAP Manufacturing / PP ضروري قبل دراسة دورة العمل والتكلفة، لأن SAP يعتمد على ربط دقيق بين:

- بيانات الأساس.
- التخطيط.
- التنفيذ.
- حركات المخزون.
- التحكم بالتكلفة.
- WIP والانحرافات.
- التسوية المالية.
- Universal Journal.

القيمة العملية لهذا القاموس ليست حفظ المصطلحات، بل فهم العلاقة بينها.  
مثال: لا يمكن فهم تكلفة الإنتاج دون فهم **Material Master + BOM + Routing + Production Version + GI + Confirmation + GR + WIP + Variance + Settlement**.

وهذا هو الدرس الأهم عند استخدام SAP كمرجع لتقييم أو تطوير نظام ERP محلي مثل ناتج.
