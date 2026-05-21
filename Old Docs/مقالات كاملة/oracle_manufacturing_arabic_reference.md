# Oracle Fusion Cloud Manufacturing: دراسة شاملة لإدارة الإنتاج والتكلفة والمحاسبة داخل ERP

> **طبيعة المقال:** مرجع تحليلي مبني بالكامل على وثائق Oracle الرسمية (Oracle Help Center) في إصدارات 25B / 25C / 25D / 26A / 26B، مكتوب من زاوية المستشار الوظيفي (Functional Consultant) العامل في ERP، وليس من زاوية تسويقية. الهدف ليس ترجمة الوثائق بل تحليلها لاستخراج درس عملي قابل للتطبيق في تصميم أو تقييم نظام إنتاج داخل أي ERP محلي.

---

## 1. مقدمة

### 1.1 ما هو Oracle Fusion Cloud Manufacturing؟

Oracle Fusion Cloud Manufacturing هو جزء من حزمة Oracle Fusion Cloud Supply Chain Management (SCM). يقدّم قدرات تصنيع متقطّع (Discrete) وعمليّاتي (Process) في السحابة، تمكّن الشركة من **إعداد، إدارة، وتنفيذ عمليات الإنتاج**. حسب الوثيقة الرسمية: "Oracle Fusion Cloud Manufacturing, part of Oracle Supply Chain (SCM) & Manufacturing applications, provides core discrete and process manufacturing capabilities in the cloud that enable you to set up, manage, and execute your production operations efficiently."

يدعم النظام في نفس المصنع:
- التصنيع المتقطّع للمنتجات القياسية (Standard Discrete).
- التصنيع العمليّاتي القائم على دفعات (Process / Batch).
- التصنيع المختلط (Mixed-Mode) عبر معاملي المصنع: *Enable Process Manufacturing* و *Default Work Method*.
- التصنيع التعاقدي (Contract Manufacturing) حيث يُسند الإنتاج إلى مصنّع خارجي.
- المعالجة الخارجية (Outside Processing / Supplier Operations) حيث تُسند عمليّة أو أكثر إلى مورّد.

### 1.2 موقع Manufacturing ضمن Oracle Fusion Cloud SCM

Manufacturing ليس وحدة منعزلة، بل عُقدة في شبكة من الوحدات تتكامل معه على مستوى البيانات والعمليات:

| المجال | علاقته بـ Manufacturing |
|--------|--------------------------|
| Product Management / PIM | يوفّر بيانات الأصناف وهياكل المنتج (Item Structures) التي تُبنى عليها Work Definitions |
| Inventory Management | يستقبل ويُرسل حركات صرف المواد، استلام المنتج النهائي، تتبّع Lot/Serial |
| Cost Management | يُسعّر حركات Material Issue، Resource Charges، Product Completion، Scrap، وإغلاق الأمر |
| Supply Chain Planning | يولّد توصيات الإنتاج التي تتحول إلى Work Orders |
| Supply Chain Orchestration | الوسيط الذي يُحوّل الطلب (Sales Order أو Planned Order) إلى Work Order ويحجز المنتج |
| Order Management / Global Order Promising | يُحدّد متى وكيف يُنشأ أمر العمل في سيناريوهات Back-to-Back وConfigure to Order |
| Maintenance | يتكامل مع Manufacturing عبر استثناءات الموارد، وأوامر صيانة لمشاكل الآلات |
| Quality Management / Quality Issues | يدعم تسجيل Production Exceptions و Inspection |
| Procurement / Self Service Procurement | في حالات Outside Processing والشراء المباشر للمواد لأمر عمل محدد |

### 1.3 لماذا الإنتاج في ERP ليس مجرد "أمر تصنيع"؟

في النظرة السطحية يبدو الإنتاج مجرد: "صنف نهائي + كمية + أمر عمل". لكن دراسة Oracle تكشف أنه منظومة:

1. **منظومة بيانات أساسية (Master Data)**: لا يمكن إنشاء Work Order بدون Work Definition، ولا يمكن إنشاء Work Definition بدون Items، Operations، Work Centers، Resources، UOMs، Inventory Organization.
2. **منظومة تشغيلية**: مراحل تنفيذ، استثناءات، تتبع موارد، تتبع Lot/Serial.
3. **منظومة مخزنية**: كل حركة إنتاج هي حركة مخزن (صرف مواد، استلام منتج تام، هالك).
4. **منظومة محاسبية**: كل حركة إنتاج تُولّد Cost Distribution وقد تُولّد Accounting Entry في الأستاذ العام عبر Cost Accounting و Subledger Accounting.
5. **منظومة جودة**: استثناءات إنتاج، فحوصات، رفض، إعادة تشغيل (Rework).
6. **منظومة طلب وعرض**: ارتباط أمر العمل ببيع، بمخزون أمني، بمشروع، أو بطلب نقل.

### 1.4 لماذا دراسة Oracle مفيدة لمن يعمل في ERP محلي؟

Oracle حسم تجريبيًا – عبر عقود – أن نظام الإنتاج الصحيح:
- يفصل **تعريف طريقة الإنتاج (Work Definition)** عن **أمر الإنتاج (Work Order)** عن **التنفيذ الفعلي (Execution)**.
- يفصل **حدث المخزن (Inventory Transaction)** عن **حدث التكلفة (Cost Distribution)**.
- يضع **Cost Accounting** بين Manufacturing وGL، لا يُسمح للإنتاج بإنشاء قيود محاسبية مباشرة.
- يستخدم **حالات (Statuses)** صريحة للأمر، تتحكم بما يُسمح ولا يُسمح به.
- يفرض **Work Order Close** كحدث محاسبي ومخزني وليس مجرد إقفال ورقي.

أي نظام إنتاج محلي يتجاهل أحد هذه الفصول سيُنتج تكلفة غير دقيقة وتقارير لا تُطابق المخزون.

**روابط القسم:**
- https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25a/faips/about-oracle-fusion-cloud-manufacturing.html
- https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25d/faumf/overview-of-manufacturing-in-supply-chain-management-business.html

---

## 2. فلسفة Oracle في إدارة التصنيع

تنظر Oracle إلى التصنيع باعتباره **منظومة طبقات** تبدأ من البيانات الأساسية وتنتهي بالقيود المحاسبية. ولفهم الفرق العملي بين نظام يسجّل الإنتاج ونظام يديره، يمكن وضع المقارنة التالية المستخرجة من الوثائق:

| البُعد | نظام يسجّل الإنتاج | نظام Oracle (يدير الإنتاج) |
|--------|--------------------|------------------------------|
| تعريف طريقة الإنتاج | ملف Excel أو BOM بسيط | Work Definition بإصدارات (Versions) وأولويات (Primary/Alternate) وتواريخ سريان |
| أمر الإنتاج | سجل واحد فيه الكمية | Work Order له حالات، عمليات، موارد، استثناءات، تكلفة فعلية، إغلاق رسمي |
| المخزون | يحدث يدويًا بعد الإنتاج | حركات Inventory مرتبطة مباشرة بحركات Manufacturing Execution |
| التكلفة | تُحسب يدويًا أو شهريًا | Cost Processor مستقل يُسعّر كل حركة بمنهج (Standard / Average / Actual) |
| القيود المحاسبية | يولّدها مستخدم محاسبة | Cost Distributions ثم Subledger Accounting ثم GL |
| الانحرافات | تظهر "عند المطابقة" | مُولَّدة آليًا عند إغلاق أمر العمل (Material Rate / Usage / Substitution / Resource / Yield / Job Close Variances) |
| الجودة والاستثناءات | بريد إلكتروني / ورقي | Production Exceptions مرتبطة بأمر العمل، الموارد، أو المكونات |
| التتبع | غير مدعوم | Lot / Serial Traceability كاملة عبر Genealogy |

### 2.1 مبدأ الفصل بين التصميم والتنفيذ والمحاسبة

Oracle تفصل بوضوح ثلاث وظائف:

1. **Work Definition (التصميم)** — يقوم بها *Manufacturing Engineer*.
2. **Work Order Execution (التنفيذ)** — يقوم بها *Production Operator / Production Supervisor*.
3. **Cost Accounting (المحاسبة)** — يقوم بها *Cost Accountant* عبر جدولات (Scheduled Processes) منفصلة.

هذا الفصل يَفرض حوكمة: المهندس لا يُعدّل التكلفة، والمحاسب لا يُعدّل طريقة الإنتاج، والمشغّل لا يُغلق التكلفة. هذا الدرس وحده يُحوّل أي نظام ERP محلي من "أداة إدخال" إلى "نظام مؤسسي".

**روابط القسم:**
- https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/faumf/overview-of-work-definitions.html
- https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/faumf/overview-of-production-process-design.html

---

## 3. بيانات الإنتاج الأساسية Master Data

البيانات الأساسية في Oracle Manufacturing تأتي من ثلاث جهات: PIM (الأصناف وهياكلها)، Inventory Management (المنظمات، المستودعات، المواقع)، وManufacturing Master Data (الموارد، مراكز العمل، المناطق، العمليات القياسية).

### 3.1 الأصناف (Items)

تتضمن الأصناف المستخدمة في الإنتاج:
- **المواد الخام (Raw Materials)** المُدرجة في Item Structure ضمن Work Definition.
- **المنتجات نصف المصنّعة (Semi-Finished / Subassemblies)** التي قد تكون لها Work Definitions منفصلة.
- **المنتج النهائي (Finished Good / Assembly)** الذي يُمثّل رأس Work Definition.
- **Ad hoc Items** — أصناف ليست في هيكل المنتج لكن يمكن إضافتها إلى عملية في Work Definition بصلاحية خاصة (*Override Item Structure Components in Work Definition*).
- **Outputs**: في Process Manufacturing توجد *Primary Output*، *Co-products*، *By-products*.

**أهمية البيانات الصحيحة للصنف:** خصائص مثل Lot Control، Serial Generation، Costing Enabled، Inventory Asset Value، وSupply Type، تحدد كيف يُسعَّر الصنف، كيف يُتعقّب، وكيف يُصرف.

### 3.2 هيكل المنتج (Item Structure / BOM)

Item Structure يُعرَّف في Product Management ويُستهلَك من قِبل Work Definition. أي تغيير في Item Structure يُمكن أن يُزامَن تلقائيًا أو يدويًا إلى Work Definitions المتأثرة، ويتم إخطار مهندس التصنيع أو محاسب التكلفة الذين يملكون صلاحية *Receive Item Structure Change Notification for Work Definitions*.

### 3.3 وحدات القياس (Units of Measure)

كل صنف، كل مورد، وكل عملية لها UOM. ويُلزم أن تنتمي UOM للمورد إلى فئة UOM Class المحددة في Profile الخاص بـ *SCM Common: Default Service Duration Class*، وعادة ما تكون فئة زمنية (دقائق، ساعات). UOM للمورد لا يمكن تغييره بعد ربط المورد بمركز عمل.

### 3.4 المنظمات (Inventory Organizations & Manufacturing Plants)

كي تُعمل وحدة Manufacturing، يجب أن تكون المنظمة:
1. منظمة مخزون (Inventory Organization).
2. مُعرّفة كـ *Manufacturing Plant* عبر Plant Parameters.

ومن أبرز Plant Parameters المؤثرة:
- *Enable Process Manufacturing* و *Default Work Method*.
- *Include operation yield in material and resource requirements* (يؤثر على حسابات الإنتاج التقديري والفاقد).
- *Prevent Issue of Expired Lots* (يمنع صرف Lots منتهية).
- *Enable manual completion of work orders*.

### 3.5 المستودعات والمواقع (Subinventories & Locators)

- **Subinventory**: تقسيم منطقي داخل منظمة المخزون (مثل: Raw Materials، WIP Storage، Finished Goods).
- **Locator**: تقسيم أدق داخل المستودع (رف، صف، خانة).
- في Discrete Work Definition، الـ Completion Subinventory/Locator يُحدَّد على مستوى **رأس** الـ Work Definition.
- في Process Work Definition، يُحدَّد على مستوى **مخرَج العملية** (Operation Output).

### 3.6 Work Areas, Work Centers, Resources

- **Work Area**: منطقة جغرافية أو منطقية في المصنع (مثل: ورشة القص، ورشة التجميع). يجب وجود واحدة على الأقل.
- **Work Center**: وحدة إنتاجية تتكون من أشخاص أو معدات داخل Work Area. تحوي موارد ولها Shifts.
- **Resource**: مورد عمالة (Labor) أو معدّات (Equipment) له Usage UOM. عند إضافته إلى Work Center تُحدَّد له Utilization و Efficiency (افتراضيًا 100%؛ أقل من ذلك يطيل المدة المجدولة).
- **Workstation**: موقع مادي محدد داخل Work Center (آلة معينة أو طاولة)، تُربط به Resource Instances، ويُسجَّل عليه Operator Check-in.

ترتيب الإعداد الموصى به في الوثائق: Work Areas ← Resources ← Work Centers ← ربط الموارد بمراكز العمل ← تخصيص Shifts.

### 3.7 العمليات القياسية (Standard Operations)

عملية معرّفة مرة واحدة مع كل تفاصيلها (المركز، الموارد، الإرشادات) ثم تُستخدم كمرجع داخل Work Definitions. تعديل الموارد لا يمكن من داخل Work Definition بل من Standard Operations نفسها — هذا يضمن اتساق التعريف عبر المنتجات.

### 3.8 الأخطاء الشائعة في إعداد البيانات الأساسية

استنادًا لما تكشفه وثائق Oracle عن المخاطر التشغيلية:
1. عدم ضبط Supply Type صحيحًا (Push/Operation Pull/Assembly Pull/Bulk/Phantom/Supplier) ينتج عنه صرف خاطئ أو إغفال صرف.
2. ربط مورد بـ UOM لا تنتمي للفئة الزمنية → لا يمكن جدولته.
3. عدم تحديد Costing Enabled وInventory Asset Value بشكل صحيح → ضياع قيمة المخزون أو تسعير خاطئ.
4. تفعيل *Enable Process Manufacturing* ثم محاولة الرجوع (الـ opt-in قد لا يكون قابلًا للتعديل بعد ترحيل بعض البيانات).
5. ترك *Issue Types* للاستثناءات على User-defined → تفشل عمليات إنشاء الاستثناءات.

**روابط القسم:**
- https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/faumf/overview-of-work-definitions.html
- https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25d/faims/work-areas-resources-and-work-centers.html
- https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26a/fammi/getting-started-with-your-manufacturing-and-supply-chain-materials-management-implementation.pdf

---

## 4. Work Definitions

تعريف Oracle المحوري: *"A work definition defines the manufacturing process for a product. It is essentially a template to create a work order for the work execution."* بمعنى آخر: Work Definition هو **القالب** الذي تُصبّ فيه أوامر العمل.

### 4.1 ما الذي تحويه Work Definition؟

تتكون من خمسة عناصر:

| العنصر | الوصف |
|--------|-------|
| **Header (الرأس)** | Work Method، الصنف المُنتَج، Production Priority، Costing Priority، Completion Subinventory/Locator (في Discrete) |
| **Operations (العمليات)** | تسلسل خطوات التصنيع، كل عملية مرتبطة بـ Work Center، يمكن تعليمها كـ Count Point أو Auto-Transact أو Optional |
| **Operation Outputs** | (Process فقط) المنتج الأساسي والمنتجات الثانوية (Co-products) والمنتجات العَرَضية (By-products) |
| **Operation Items (المواد)** | المواد المطلوبة عند كل عملية، إما من Item Structure أو Ad hoc |
| **Operation Resources (الموارد)** | الموارد المطلوبة عند كل عملية، يأتي خياراتها من موارد Work Center |

### 4.2 الفرق عن BOM التقليدية

- BOM في النظام التقليدي = قائمة مواد فقط.
- Work Definition في Oracle = **BOM + Routing + Resources + Outputs + Yield + Versions + Priorities** في كيان واحد. حسب الوثيقة: *"The work definition effectively combines an item structure and routing into a single view."*

هذا فرق جوهري: في Oracle لا يمكن إنشاء أمر إنتاج بناء على "مواد فقط" بدون تعريف خطوات التصنيع والموارد، لأن التكلفة تحتاجها لتولِّد Cost Distributions كاملة.

### 4.3 الأنواع المختلفة من Work Definitions

| النوع | الاستخدام |
|--------|-----------|
| **Standard** | الإنتاج العادي، Primary أو Alternate |
| **Rework** | إعادة تشغيل منتج تام معيب لإصلاحه (Discrete فقط) |
| **Transform** | تحويل منتج إلى منتج آخر (Upgrade/Downgrade) (Discrete فقط) |
| **Flow Manufacturing** | إنتاج متدفق على خط إنتاج موحد بمعدّل ثابت (Lean / JIT) |
| **Process** | إنتاج دفعات بكميات (وليس وحدات) — يدعم مخرجات متعددة |

### 4.4 Primary مقابل Alternate

- لكل صنف يجب أن يوجد Work Definition واحد على الأقل بأولوية إنتاج (Production Priority) = 1، وهذا هو **Primary**.
- يمكن تعريف Alternate Work Definitions لتمثيل: استخدام مواد بديلة، خط إنتاج بديل، تتابع عمليات بديل، مورد بديل.
- المخطّط (Supply Chain Planning) يستخدم Primary لتوليد توصيات الإنتاج وحساب مدد التنفيذ (Manufacturing Lead Times).
- محاسب التكلفة قد يختار Work Definition مختلف لأغراض الـ Cost Rollup عبر **Costing Priority**.

### 4.5 Work Definition Versions

كل Work Definition له تاريخ سريان (Effective Start Date) وقد يكون مفتوحًا (Effective End Date = null). تُستخدم الإصدارات لتتبع التغييرات في طريقة الإنتاج عبر الزمن، مع الحفاظ على إمكانية إعادة تسعير أوامر تاريخية بناءً على الإصدار الفعّال وقت إنشائها.

### 4.6 Serial Tracking في Work Definition

إذا كان الصنف مُعرَّفًا بـ *Serial Generation = Predefined*، يمكن جعل Work Definition يفرض تتبّع الأرقام التسلسلية بدءًا من عملية معيّنة. هذا يُلزم العامل بإدخال السيريال عند كل صرف مواد، استخدام مورد، وإكمال عملية. مفيد جدًا للصناعات المنظمة (طبية، عسكرية، إلكترونيات).

### 4.7 أسئلة تحليلية يجب طرحها على العميل قبل إعداد Work Definition

- هل مكوّنات المنتج ثابتة أم تختلف؟
- هل توجد مواد بديلة (Substitute Components)؟
- هل توجد مراحل تصنيع منفصلة (Cut / Assemble / Paint / QC / Pack)؟
- هل خطوات التصنيع نفسها لكل منتج أم تختلف حسب الدفعة / العميل؟
- هل توجد منتجات نصف مصنعة لها Work Definitions مستقلة؟
- هل توجد آلات/خطوط محدّدة لكل مرحلة؟
- هل توجد عمليات تحتاج خدمة خارجية (Outside Processing)؟
- هل توجد عمليات يمكن تجاوزها (Optional Operations)؟
- هل توجد مخرجات ثانوية (Co-products / By-products)؟
- هل توجد نسب فاقد متوقعة لكل عملية (Operation Yield)؟

**روابط القسم:**
- https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/faumf/overview-of-work-definitions.html
- https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/faumf/overview-of-production-process-design.html

---

## 5. Work Orders

### 5.1 تعريف Work Order

Work Order هو **التمثيل التنفيذي** لطلب إنتاج كمية معينة من صنف في تاريخ معيّن. وهو الفرق بين "خطة الإنتاج" و "إنتاج فعلي". أحد التعريفات الواضحة من Oracle: *"A work order header stores some of key attributes of the work order business object. The work order header uniquely identifies the work order, describes the nature of work being carried out, and captures the details of the item being manufactured, the required quantity, the work definition to be used, and the start and completion dates."*

### 5.2 أنواع Work Orders في Oracle

| النوع | الوصف |
|-------|-------|
| **Standard** | يستند إلى Work Definition. هذا هو الافتراضي. |
| **Nonstandard** | لا يستند إلى Work Definition. يُستخدم في حالات إصلاح / إنتاج لمرة واحدة / مهام تجريبية. |
| **Rework / Transform** | لإعادة تشغيل أو تحويل منتجات. |
| **Orderless** | إنتاج بدون أمر عمل، يُسجَّل بالحركة فقط (مناسب للإنتاج المتدفّق Flow). |

### 5.3 من ينشئ Work Order؟

في Oracle يمكن إنشاء Work Order بإحدى الطرق التالية:
1. **يدويًا** من شاشة *Manage Work Orders* في Work Execution.
2. **آليًا من Supply Chain Planning** (Plan-to-Produce).
3. **آليًا من Order Management** عبر Supply Chain Orchestration في حالات Back-to-Back / Configure to Order.
4. **آليًا من Inventory Management** عبر Min-Max Planning (طلبات تجديد المخزون).
5. **عبر REST API / FBDI** للتحميل المُجمَّع.

### 5.4 العلاقات الأساسية لأمر العمل

- مع **المنتج النهائي**: الأمر يُنتج كمية محددة من صنف معيّن.
- مع **المواد**: عبر Operation Items المنسوخة من Work Definition.
- مع **الموارد**: عبر Operation Resources المنسوخة من Work Definition.
- مع **المخزون**: حركات الصرف، الاستلام، والإرجاع.
- مع **التكلفة**: كل حركة تنفيذية تُسعَّر في Cost Accounting.
- مع **الطلب**: قد يكون مرتبطًا بـ Sales Order Reservation (Back-to-Back) أو بمشروع (Project-specific).

**روابط القسم:**
- https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25c/fammi/execute-work-orders.html
- https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/23d/faumf/how-you-manage-a-work-order-header.html

---

## 6. دورة أمر العمل Work Order Lifecycle

تنص الوثيقة الرسمية بوضوح: *"You can use status of a work order to manage the work order through its entire lifecycle. Work orders are generally created in the Unreleased status. After editing the work order details, you can update the status to Released... Once released, you can also update the work order status to On Hold or Canceled. Upon executing the work order, when the last operation is completed, the work order is automatically updated to a Completed status. You then update the status of the work order to Closed."*

### 6.1 الحالات الأساسية (System Statuses)

| الحالة | الوصف | الانتقال |
|--------|-------|----------|
| **Unreleased** | الأمر مُنشأ، قابل للتعديل، لا يُسمح بأي حركة عليه | → Released, Canceled |
| **Released** | الأمر جاهز للتنفيذ، يمكن صرف مواد، تسجيل موارد، إكمال عمليات | → On Hold, Completed, Canceled |
| **On Hold** | الأمر موقوف مؤقتًا، الحركات محجوبة | → Released, Canceled |
| **Completed** | تم إكمال العملية الأخيرة (آليًا) | → Closed (يدويًا أو عبر معالج) |
| **Closed** | إقفال نهائي، تُولَّد الانحرافات وتُسوَّى التكلفة | لا يُسمح بتعديل |
| **Canceled** | إلغاء الأمر | لا يُسمح بتعديل |

ملاحظة من Oracle: حالة *Pending Approval* تظهر إذا كانت E-Records/E-Signatures مفعّلة على تغيير حالة Release.

### 6.2 المراحل التفصيلية للدورة

#### 6.2.1 إنشاء الأمر (Create Work Order)
- **ماذا يحدث:** تُنشأ Header الأمر، تُنسخ Operations وItems وResources من Work Definition، تُحجز Reservations إن لزم.
- **البيانات المطلوبة:** Item، Quantity، Start Date (أو Completion Date)، Work Definition.
- **من يستخدمها:** Production Supervisor، أو نظام آليًا (Planning/Orchestration).
- **الأثر المخزني:** لا شيء بعد (الحجوزات فقط في حالات معينة).
- **الأثر على التكلفة:** لا يوجد قيد، لكن الأمر يصبح Cost Object قابلًا لاستقبال حركات لاحقًا.
- **مخاطر شائعة:** اختيار Work Definition خاطئ أو إصدار غير مناسب، عدم انتباه لتاريخ السريان.

#### 6.2.2 الإفراج عن الأمر (Release Work Order)
- **ماذا يحدث:** تتغير الحالة إلى Released، ويصبح الأمر مرئيًا في Dispatch List للمشغّلين.
- **مطلوبات Oracle:** *"Before you execute a work order, ensure that there is sufficient on-hand balance for the components involved."*
- **الأثر:** يبدأ النظام في توقع حركات تنفيذ، ويصبح الأمر قابلًا لإنشاء طلبات شراء عمليات خارجية (Outside Processing) أو شحنة لمعالج خارجي.

#### 6.2.3 صرف المواد (Issue Materials / WIP Material Issue)
- **ماذا يحدث:** تُصرف المواد من المستودع المصدر (Supply Subinventory) إلى أمر العمل.
- **آلية الصرف** تعتمد على Supply Type في Operation Item:
  - **Push**: صرف يدوي صريح.
  - **Operation Pull**: صرف آلي عند إكمال العملية.
  - **Assembly Pull**: صرف آلي عند إكمال المنتج النهائي.
  - **Bulk**: للعرض فقط، لا تُصرف.
  - **Phantom**: تُفجَّر مكوّناتها داخل الأمر.
  - **Supplier**: يقدّمها المورد في Outside Processing.
- **الأثر المخزني:** إنقاص الرصيد في Supply Subinventory.
- **الأثر التكلفي:** زيادة WIP بقيمة المواد المصروفة.

#### 6.2.4 تنفيذ العمليات وتسجيل الموارد (Execute Operations & Resource Charging)
- **ماذا يحدث:** يُسجَّل إكمال كمية في كل عملية، تُسجَّل ساعات العمالة أو الآلات المستخدمة.
- **الأنواع:** *Count Point* (إلزامي تسجيله)، *Auto-Transact* (يُسجَّل تلقائيًا عند إكمال عملية لاحقة)، *Optional* (يمكن تجاوزه).
- **آلية تسجيل المورد:** Manual أو Automatic، أو من Workstation عند Check-in/Check-out.
- **الأثر التكلفي:** زيادة WIP بقيمة الموارد (Resource Rate × Usage).

#### 6.2.5 إرجاع المواد (Material Return)
- يمكن إرجاع جزء من مواد مصروفة إذا اتضح أنها زائدة عن الحاجة.
- **الأثر المخزني:** زيادة الرصيد.
- **الأثر التكلفي:** خصم من قيمة WIP.

#### 6.2.6 إكمال المنتج (Product Completion)
- **ماذا يحدث:** عند إتمام العملية الأخيرة، يُستلَم المنتج النهائي إلى Completion Subinventory المحدد في Work Definition (أو Operation Output في Process).
- **الأثر المخزني:** زيادة رصيد المنتج التام.
- **الأثر التكلفي:** *"All product completions are costed with an estimated cost as provisional completions and their actual cost is calculated when the work order is closed."* — أي يُسعَّر بسعر تقديري ثم يُعدَّل عند الإغلاق.
- ينقل الأمر آليًا إلى حالة Completed بعد إكمال الكمية الكاملة.
- يدعم Oracle الإنتاج الجزئي و *Undercompletion Tolerance* (السماح بإغلاق الأمر بكمية أقل من المخططة).

#### 6.2.7 الإغلاق (Work Order Close)
- يتم يدويًا أو عبر معالج. الحالة تنتقل إلى Closed.
- لا يمكن الإغلاق إذا توجد حركات معلقة.
- **يولّد Cost Accounting** أهم أحداثه عند الإغلاق: تسوية التكلفة، الانحرافات، تسوية الهالك.

### 6.3 المسؤوليات لكل مرحلة

| المرحلة | المسؤول |
|---------|---------|
| Create / Plan | Planner، Production Supervisor، أو نظام Orchestration |
| Release | Production Supervisor |
| Material Issue / Return | Inventory User أو نظام تلقائي (Backflush) |
| Operation Execution | Production Operator |
| Product Completion | Production Operator |
| Close | Production Supervisor / Cost Accountant |
| Cost Accounting Distributions | Cost Accountant |

**روابط القسم:**
- https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25c/fammi/execute-work-orders.html
- https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/23d/faumf/how-you-manage-a-work-order-header.html
- https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25c/fausp/how-supply-planning-considers-additional-work-order-status.html

---

## 7. Operations, Resources, and Work Centers

### 7.1 المفاهيم الأساسية

- **Operation**: خطوة منفصلة في تتابع تصنيع المنتج. ترتبط حصرًا بمركز عمل واحد.
- **Work Center**: وحدة الإنتاج (مكان + معدات + عمالة) داخل Work Area.
- **Resource**: عمل (Labor) أو معدات (Equipment) مع UOM. يُربط بمركز عمل ثم يُستخدم في Operation Resources.

### 7.2 التمييز بين الأنواع

- **Count Point Operation**: لا يُسمح بتجاوزها، يجب تسجيل إكمالها صراحةً.
- **Auto-Transact Operation**: يتم إكمالها تلقائيًا عند إكمال عملية لاحقة.
- **Optional Operation**: ليست Count Point ولا Auto-Transact، يمكن تجاوزها.

### 7.3 كيف تدخل الموارد في التكلفة

استنادًا لوثيقة Cost Accounting الرسمية: *"Resource transactions are costed based on the resource cost set up in Manage Resource Costs and published to cost accounting. For all cost methods, you need to define the resource rates in a cost scenario."*

أي:
1. يُعرَّف Resource Rate في *Cost Scenario* لكل ثنائية (Cost Organization, Cost Book).
2. تُنشَر الأسعار عبر *Publish Costs*.
3. عند تسجيل استخدام المورد في الأمر، يضرب Cost Processor (Usage × Rate) ويُضيف القيمة إلى WIP.

### 7.4 الفرق بين تكلفة المواد وتكلفة الموارد

| البُعد | تكلفة المواد | تكلفة الموارد |
|--------|--------------|---------------|
| المصدر | تكلفة الصنف (Standard / Average / Actual) | Resource Rate في Cost Scenario |
| المُحفِّز | حركة Material Issue/Return | حركة Resource Charging/Reversal |
| تأثير المنهج | تختلف بمنهج التكلفة | كلها بناء على Rate المنشور |
| النوع | متغيرة | يمكن أن تكون عمالة (Labor) أو معدات (Equipment) |

### 7.5 الجدولة والطاقة الإنتاجية

الموارد لها *Utilization* و *Efficiency*، وعند الجدولة تُضرَب المدة المقدّرة في معامل الكفاءة. كما تُعرَّف *Shifts* للموارد التي تحدد الطاقة المتاحة. يمكن استخدام جدولة *Unconstrained* أو *External* (عبر تطبيق Production Scheduling) أو *User* (يدوي بـ Firm).

### 7.6 مثال عملي

منتج يمر بخمس عمليات:

| Op # | العملية | Work Center | Resource | Type |
|------|---------|-------------|----------|------|
| 10 | قص (Cutting) | WC-CUT | Cutter Machine (1.5 hr) + Operator (1.5 hr) | Count Point |
| 20 | تجميع (Assembly) | WC-ASM | Assembly Line (2 hr) + 2 Operators | Count Point |
| 30 | دهان (Painting) | WC-PAINT | Paint Booth (1 hr) | Count Point |
| 40 | فحص جودة (QC Inspection) | WC-QC | QC Inspector (0.5 hr) | Optional |
| 50 | تغليف (Packing) | WC-PACK | Packer (0.5 hr) | Count Point |

عند تنفيذ أمر إنتاج لـ 100 وحدة:
- مواد القص تُصرف عند العملية 10 (Operation Pull).
- مواد التجميع تُصرف عند العملية 20.
- الدهان يضيف Resource Cost = Paint Booth Rate × 1 hr.
- إذا كانت Operation 40 Optional ولم تُسجَّل، لا تُحتسب أي تكلفة لها.
- العملية 50 (الأخيرة) — عند إتمامها بكمية 100، تنتقل الكمية من WIP إلى Finished Goods Subinventory.

**روابط القسم:**
- https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/faumf/overview-of-work-definitions.html
- https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25b/fapma/managing-overhead-rates.html
- https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25d/faims/work-areas-resources-and-work-centers.html

---

## 8. Material Issue and Material Return

### 8.1 صرف المواد (Material Issue)

في Oracle، صرف المواد لأمر العمل يأتي من **Supply Subinventory** المحدد في Operation Item ضمن Work Definition. سلوك الصرف يتحكم به Supply Type:

| Supply Type | السلوك |
|-------------|--------|
| Push | صرف يدوي صريح من شاشة Report Material Transactions أو Mobile |
| Operation Pull | Backflush تلقائي عند إكمال العملية المعنية |
| Assembly Pull | Backflush تلقائي عند إكمال المنتج النهائي |
| Bulk | تظهر في التقارير، لا تُصرف نظاميًا |
| Phantom | تُفجَّر مكونات الـ Phantom وتُضاف للأمر |
| Supplier | تأتي من المورد في حالة Outside Processing |

### 8.2 صرف المواد الفعلي vs المخطط

- **المخطط:** يحسب النظام كمية المواد المتوقعة = (Operation Item Quantity × Work Order Quantity).
- **الفعلي:** ما يُصرف فعلاً قد يختلف. إذا كان أكثر/أقل، تنشأ:
  - **Material Usage Variance** (في Standard Cost).
  - أو يُضاف للتكلفة الفعلية مباشرة (في Actual Cost).
- إذا صُرف صنف ليس في Work Definition (Substitute)، تنشأ **Material Substitution Variance**.

### 8.3 إرجاع المواد (Material Return)

يمكن إرجاع جزء من مواد مصروفة (إذا تبيّن أنها زائدة، أو معيبة، أو خاطئة):
- **حركة عكسية:** زيادة الرصيد في Supply Subinventory، خصم من WIP.
- **الأثر التكلفي:** عكس حركة الصرف الأصلية بنفس قيمة التسعير.
- إن كانت لـ Lot Control، يجب تحديد نفس Lot الأصلي.

### 8.4 تتبع Lot/Serial في الصرف

- المواد ذات تحكم Lot أو Serial تتطلب إدخال Lot/Serial Number عند الصرف.
- إذا كان Work Order نفسه Serial-Tracked (المنتج النهائي serial-controlled)، يربط النظام كل سيريال مكوّن بسيريال أمر إنتاج معين.
- يدعم النظام منع صرف Lots منتهية الصلاحية عبر *Prevent Issue of Expired Lots* في Plant Parameters.

### 8.5 العلاقة مع Inventory Transactions

كل صرف مواد يُولّد:
1. **حركة مخزون** من نوع *WIP Material Issue*.
2. **حدث تكلفة** يُلتقط عبر *Transfer Transactions from Inventory to Costing*.
3. ثم **توزيع تكلفة (Cost Distribution)** عبر *Create Cost Accounting Distributions*.

أي حركة الصرف الواحدة تمر بثلاث طبقات قبل أن تظهر في الأستاذ العام: Manufacturing Execution → Inventory → Cost Accounting → GL.

**روابط القسم:**
- https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25c/fapma/cost-accounting-for-manufacturing-work-orders.html
- https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25c/fammi/execute-work-orders.html

---

## 9. Product Completion

### 9.1 ماذا يعني "Product Completion" في Oracle

عملية إكمال المنتج تعني: تأكيد إنتاج كمية من المنتج النهائي وإيداعها في المخزون. تحدث عادة عند العملية الأخيرة في Work Definition.

### 9.2 آلية الاستلام

- يُستلم المنتج في **Completion Subinventory/Locator** المحدد:
  - في Discrete Work Definition: في **رأس** Work Definition.
  - في Process Work Definition: على **مستوى المخرج (Operation Output)**.
- إذا كان المنتج Lot/Serial-Controlled، يجب إدخال Lot/Serial.

### 9.3 الإنتاج الجزئي والتسامح

- يدعم Oracle إكمال أمر العمل **بكميات جزئية** متعددة.
- يمكن تعريف *Undercompletion Tolerance* بحيث يُغلَق الأمر تلقائيًا حتى لو لم تُكمل الكمية الكاملة، وتعتبره Supply Planning كمكتمل.
- يمكن تعريف *Overcompletion* بسماحية معيّنة.

### 9.4 الأثر التكلفي

نص Oracle حرفيًا: *"All product completions are costed with an estimated cost as provisional completions and their actual cost is calculated when the work order is closed."*

هذا يعني:
1. عند الإكمال، يُحسب سعر **تقديري** بناءً على *Provisional Completions Option* في Cost Profile للصنف:

| Cost Method | الخيارات المتاحة |
|-------------|------------------|
| Standard Cost | Value at standard cost |
| Perpetual Average | Last actual cost / Perpetual average cost / Standard cost / Work order close / Accumulated WIP balances |
| Actual Cost | Last actual cost / Standard cost / Work order close / Accumulated WIP balances |

2. عند إغلاق Work Order، يُعاد حساب التكلفة الفعلية وتُولَّد *Work in Process Product Cost Adjustment* للفرق (في Actual/Perpetual Average).
3. في Standard Cost، تُولَّد الانحرافات عند الإغلاق (Material Rate, Usage, Substitution, Resource, Yield, Job Close).
4. لو اختير "Value at work order close"، لا يُسعَّر الإكمال حتى يُغلق الأمر — تظل الحركات Uncosted.

### 9.5 الأثر على WIP

- إكمال المنتج = **خصم من WIP** بقيمة التقديرية، **إضافة إلى Finished Goods Inventory** بنفس القيمة.
- إذا لم يُكمَل الأمر بالكامل أو وجدت حركات معلّقة، يبقى رصيد WIP موجبًا حتى الإغلاق.

**روابط القسم:**
- https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25c/fapma/cost-accounting-for-manufacturing-work-orders.html

---

## 10. Work Order Close

إغلاق أمر العمل هو **أهم حدث محاسبي** في دورة الإنتاج، وليس مجرد تغيير حالة. ينص Oracle: *"When the work order is closed, costing ensures that all the transactions reported for the work order are successfully costed."*

### 10.1 متى يُغلَق الأمر؟

- بعد إتمام كل الكميات (الأمر في حالة Completed).
- أو بقرار يدوي مع *backdate* إلى تاريخ آخر حركة (مفيد للإقفال الشهري).
- يمكن إغلاق الأمر بكمية أقل (Undercompleted) مع تسامح مُعرَّف.

### 10.2 لماذا الإغلاق مهم؟

من وثيقة Period Close Validation: *"If you don't close the work orders, the product cost adjustments in the case of actual, perpetual average, and periodic average cost methods and variances in the case of standard cost method might get created in a different period than the product completions."*

أي: عدم الإغلاق = **مزامنة خاطئة بين الفترات المحاسبية** = تكاليف تظهر في فترة ومبيعاتها في فترة أخرى = هامش ربح غير دقيق.

### 10.3 ما يحدث عند الإغلاق

1. **Cost Processor** يتأكد أن كل الحركات معالَجة.
2. تُولَّد أحداث محاسبية:
   - في Standard Cost: **Variances** (Material Rate, Material Substitution, Material Usage, Resource Rate, Resource Substitution, Resource Efficiency, Batch Size, Job Close, Yield).
   - في Actual / Perpetual Average: **Product Cost Adjustments** للفرق بين التكلفة التقديرية والتكلفة الفعلية.
3. **إعادة حساب تكلفة الهالك (Scrap):**
   - عند الإغلاق، يُعاد حساب تكاليف Scrap.
   - حركات الهالك المُسجَّلة في عمليات لها Yield تُسعَّر دومًا بـ Operation Scrap Accounting = Expense عند الإغلاق، بغض النظر عن إعداد Profile.
4. تُسوَّى موازنة WIP إلى صفر لهذا الأمر.

### 10.4 ما يجب التحقق منه قبل الإغلاق

- عدم وجود حركات معلقة (Pending Transactions).
- جميع العمليات Count Point تم إكمالها.
- المواد المعلقة في WIP (إن وُجدت زيادة في الصرف بدون استهلاك) تم إرجاعها.
- استثناءات الإنتاج المؤثرة على الأمر مغلقة.

### 10.5 إعادة فتح الأمر المغلق

يدعم Oracle إعادة فتح أمر مغلق ثم إغلاقه مجددًا. عند ذلك: *"these transactions will be recreated to identify if any new resource or material transaction is reported since the last time the work order was reopened."* أي تُعاد توليد حركات Cost Accounting لالتقاط أي تغيير منذ الإغلاق السابق.

**روابط القسم:**
- https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25c/fapma/cost-accounting-for-manufacturing-work-orders.html
- https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25a/fapma/why-the-completed-work-orders-not-closed-error-on-period-close-validation.html

---

## 11. تكلفة الإنتاج في Oracle

> هذا هو أعمق وأهم قسم في الدراسة، لأن الإنتاج بدون تكلفة دقيقة = إنتاج أعمى.

### 11.1 العمارة العامة لـ Cost Management

Oracle يفصل التكلفة عن الإنتاج عبر طبقات:

```
Manufacturing Execution
        │
        ▼
Inventory Transactions (مخزون)
        │
        ▼
Transfer to Costing (Scheduled Process)
        │
        ▼
Cost Processor (يُسعّر) ─┬─► Cost Distributions
                         ├─► Variance Calculations
                         └─► Adjustments
        │
        ▼
Subledger Accounting (يولّد القيود)
        │
        ▼
General Ledger
```

### 11.2 الكيانات الأساسية في Cost Accounting

| الكيان | الوصف |
|--------|-------|
| **Cost Organization** | كيان محاسبي للتكلفة، يضم منظمة مخزون واحدة أو أكثر. |
| **Cost Book** | السجل المالي للتكلفة. منظمة قد يكون لها عدة Cost Books (Primary، Secondary، Statutory). |
| **Cost Element** | عنصر التكلفة: Material / Resource / Overhead / Overhead Absorption / Profit in Inventory ... إلخ. |
| **Cost Component Group** | مجموعة من Cost Components تنسَّق إلى Cost Element واحد. |
| **Cost Profile** | يحدد لكل صنف: Cost Method، Valuation Structure، Provisional Completion Option، Operation Scrap Valuation/Accounting. |
| **Valuation Structure / Valuation Unit** | يحددان مستوى تفصيل التكلفة: على مستوى الصنف، أو الـ Lot، أو الـ Subinventory، أو غيره. |
| **Cost Scenario** | حاوية لأسعار الموارد والـ Overhead Rates للـ Standard Cost. |

### 11.3 مناهج التكلفة الرئيسية

| Cost Method | الوصف |
|-------------|-------|
| **Standard Cost** | تكلفة محددة سلفًا (Rolled-up Cost). كل الفروق تُحسب كانحرافات (Variances). |
| **Perpetual Average** | متوسط مرجّح يتم تحديثه مع كل حركة. |
| **Actual Cost** | تكلفة طبقة الاستلام الفعلية (مثلًا FIFO/Layer-based). |
| **Periodic Average** | متوسط الفترة، يُحسب بشكل تكراري للوصول للتقارب. |

### 11.4 عناصر تكلفة المنتج المُصنَّع

تشمل تكلفة المنتج النهائي عناصر مثل (مأخوذة من Cost Management):
- **Material**: تكلفة المواد عند أدنى مستوى في BOM.
- **Material Overhead**: عام إضافي على المواد (مثل: شراء، شحن، رسوم).
- **Resource**: تكلفة الموارد المباشرة (عمال، آلات).
- **Outside Processing**: تكلفة الخدمات الخارجية.
- **Overhead**: عام على الموارد أو الإنتاج عمومًا.

### 11.5 Overhead Rates: Plant vs Work Center

من وثيقة *Managing Overhead Rates* الرسمية:

- **Plant Overheads** (مثل الإضاءة والتبريد): تُحسب على أساس **تكلفة المواد**، إما **Fixed** أو **Percentage**.
- **Work Center Overheads** (مثل الأمن): تُحسب على أساس **معدّل ثابت أو نسبة من تكلفة المورد** المتكبَّدة في مركز العمل.

نص حرفي: *"Plant overheads, such as lighting and cooling, can be absorbed on the basis of the material cost... Work center overheads, such as security, are absorbed by the finished goods on the basis of a fixed rate or a percentage of resource cost incurred in the work center."*

- **التأثير المتغير حسب التاريخ:** *"Overhead absorption rates are date-effective, enabling you to set different absorption rates for each quarter."*
- **مستويات الـ Overhead:** يمكن تعريفها على مستوى Inventory Organization، Item Category، أو Item.
- **شرط التطبيق:** *"Overhead rates will be applied only if the finished product is rolled up."* — أي لا تنطبق Overhead Rates إلا إذا تم Cost Rollup للمنتج.

### 11.6 WIP محاسبيًا

Work in Process هو **حساب تجميعي** يستقبل التكاليف المتكبَّدة على أمر العمل قبل إكمال المنتج:

- **يُدبَّن WIP** بـ:
  - Material Issues (مواد مصروفة).
  - Resource Charging (موارد مستخدمة).
  - Overhead Absorption (أوفرهيد ممتص).
  - Estimated Scrap Absorption (هالك تقديري ينتقل قيمته إلى WIP من العمليات السابقة).

- **يُدائَن WIP** بـ:
  - Material Returns.
  - Resource Reversals.
  - Product Completions (نقل القيمة إلى Finished Goods).
  - Scrap Expense (إن كانت سياسة Operation Scrap = Expense).

- **يُسوّى WIP** عند Work Order Close.

### 11.7 Cost Distributions

كل حركة تنفيذ في الإنتاج تنتج Cost Distribution واحد أو أكثر. تشير وثيقة *Create Cost Accounting Distributions* إلى أن المعالج:
1. يخرّط Cost Components الواردة إلى Cost Elements.
2. يحسب التكلفة بناءً على Cost Method.
3. يطبّق Overhead Rules.
4. يحسب الفروق (Variances).
5. يستخدم Acquisition Cost Processor و Trade Accounting Processor و COGS Recognition Processor.
6. يبني تقارير التقييم.

### 11.8 الانحرافات في Standard Cost

من وثيقة Cost Accounting for Manufacturing Work Orders:

| الانحراف | السبب |
|----------|-------|
| **Material Rate Variance** | السعر المستخدم في Rollup ≠ السعر الفعلي لحركة الصرف. |
| **Material Substitution Variance** | استخدام صنف خارج Work Definition، أو عدم استخدام صنف موجود فيها. |
| **Material Usage Variance** | الكمية الفعلية ≠ الكمية المحددة في Work Definition. |
| **Resource Rate Variance** | معدل المورد في Rollup ≠ المعدل في حركة الموارد. |
| **Resource Substitution Variance** | استخدام مورد ليس في Work Definition أو إغفال مورد موجود فيها. |
| **Resource Efficiency Variance** | الاستخدام الفعلي ≠ المحدد في Work Definition. |
| **Batch Size Variance** | للأصناف والموارد ذات Usage Basis = Fixed عندما تختلف الكمية. |
| **Yield Variance** | الإنتاج الفعلي ≠ المتوقع (بناء على Operation Yield). |
| **Job Close Variance** | أي فرق متبقٍ غير مصنّف. أو الكل في حالة Standard Cost المُعرَّفة يدويًا. |

### 11.9 Work in Process Cost Adjustments

عند الإغلاق أيضًا تظهر تسويات الـ WIP:

- **WIP Material Standard Cost Adjustment**: عند تغيّر standard cost لمكون في حالة Released/Completed.
- **WIP Resource Cost Adjustment**: عند تغيّر تكلفة مورد.
- **WIP Product Cost Adjustment**: الفرق بين التكلفة التقديرية الكاملة والفعلية بعد الإغلاق (Actual/Perpetual Average فقط).
- **WIP Scrap Cost Adjustment**: عند اختلاف قيمة الهالك المُسجَّلة عن إعادة الحساب.

### 11.10 مثال رقمي مبسّط

**معطيات:**
- منتج "X" — تُنتَج 100 وحدة.
- المواد:
  - مادة A: 2 كغ/وحدة × سعر 5 = 10/وحدة → 1,000 للأمر.
  - مادة B: 1 لتر/وحدة × سعر 8 = 8/وحدة → 800 للأمر.
- الموارد:
  - عملية القص: آلة، 0.2 ساعة/وحدة × معدّل 30 = 6/وحدة → 600 للأمر.
  - عملية التجميع: عامل، 0.3 ساعة/وحدة × معدّل 20 = 6/وحدة → 600 للأمر.
- Overhead على Work Center للتجميع: 50% من تكلفة المورد = 300.
- Plant Overhead: 5% من تكلفة المواد = 90.
- هالك متوقع 5% (Operation Yield = 95%) — Estimated Scrap quantity ≈ 5.26 → يُمتص في تكلفة الجيد.

**تكلفة الأمر الإجمالية:**
- مواد: 1,800
- موارد: 1,200
- WC Overhead: 300
- Plant Overhead: 90
- **المجموع: 3,390 لـ 100 وحدة**
- **تكلفة الوحدة: 33.90**

عند Standard Cost: لو كان Standard المرحَّل = 33، فالفرق 90 يظهر كمزيج من Material Usage / Resource / Yield Variances حسب التحليل.

### 11.11 Cost Profiles للأصناف

عند تسعير الصنف:
- يحدد Cost Profile **منهج التكلفة** (Standard/Actual/Average).
- يحدد **مستوى التقييم** (على مستوى Lot؟ Subinventory؟ Item فقط؟).
- يحدد **سياسة Provisional Completions**.
- يحدد **سياسة Operation Scrap Valuation** (متى تُحسب: عند الإغلاق، فورًا، أم في Cost Cutoff Date).
- يحدد **سياسة Operation Scrap Accounting** (Include in Inventory أو Expense).

نص حرفي: *"You can define different cost profiles for asset items and expense items."* وأن Cost Processor يحدد Cost Profile بناءً على *Inventory Asset Value* على الصنف و *Asset Subinventory* على المستودع.

**روابط القسم:**
- https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25c/fapma/cost-accounting-for-manufacturing-work-orders.html
- https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25b/fapma/managing-overhead-rates.html
- https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/23c/fapma/create-cost-accounting-distributions.html
- https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/24b/faims/items-valuation-units-and-cost-profiles.html

---

## 12. العلاقة المالية والمحاسبية

> **تنبيه:** الوثائق الرسمية لا تُفصح عن جميع القيود التفصيلية كما هي في الأستاذ العام، لأن القيود النهائية تتولد عبر **Subledger Accounting** المعتمد على Accounting Rules القابلة للتخصيص. ما يلي مفهوم عام مُستند إلى ما تنشره Oracle، ودون اختراع قيود.

### 12.1 الأحداث المحاسبية الناتجة عن الإنتاج

من وثيقة Cost Accounting Manufacturing Work Orders:

> *"After a work order is released in manufacturing execution, it can be interfaced to cost accounting. These transactions reported for the work orders get interfaced to costing and are processed by costing:*
> - *Component issues and returns*
> - *Resource charging and reversals*
> - *Product completions and returns*
> - *Scrap transactions*
> - *Work order close*
> - *Work in Process Cost Adjustments"*

### 12.2 التدفق المحاسبي المفاهيمي

| الحدث في الإنتاج | الأثر المحاسبي العام (مفهوميًا) |
|------------------|--------------------------------|
| Material Issue إلى WO | تنخفض قيمة المخزون الخام، وترتفع قيمة WIP بقيمة المواد المصروفة |
| Resource Charging | يُمتص Resource Cost في WIP عن طريق Resource Absorption |
| Overhead Absorption | يُمتص Overhead في WIP من Overhead Expense Pool |
| Estimated Scrap | يدبَّن WIP، ويُدائن Estimated Scrap Absorption (موضح في الوثيقة) |
| Product Completion | تنخفض WIP، وترتفع قيمة Finished Goods Inventory بقيمة المنتج التام |
| Scrap (Expense) | تنخفض WIP، وتُسجَّل المصروف على Scrap Expense |
| Work Order Close (Standard) | تظهر الانحرافات على حسابات Variance المختلفة |
| Work Order Close (Actual/Avg) | تُولَّد Product Cost Adjustments لمواءمة التكلفة التقديرية مع الفعلية |
| Material Return | حركة عكسية للصرف |

> **القيد المفصح به في الوثيقة لـ Estimated Scrap:** *Debit Work in Process، Credit Estimated Scrap Absorption*. وعند العكس: *Debit Estimated Scrap Absorption، Credit Work in Process*.

### 12.3 ما معنى WIP محاسبيًا

WIP هو **حساب أصول** (Asset) يُمثّل قيمة المنتجات تحت التشغيل التي لم تكتمل بعد. وجوده على الميزانية يعكس استثمارًا فعليًا في الإنتاج لكنه لم يُحوّل بعد إلى مخزون قابل للبيع. إغلاق WIP في نهاية الفترة يجب أن يطابق:
1. أرصدة WIP في الـ Inventory Valuation Report.
2. قيم Cost Distributions الموزَّعة.
3. رصيد حساب WIP في GL بعد ترحيل Subledger Accounting.

### 12.4 كيف تنتقل التكلفة

```
Raw Materials Inventory
        │ (Material Issue)
        ▼
        WIP ◄── Resource Cost
                Overhead Absorption
                Estimated Scrap Absorption
        │ (Product Completion)
        ▼
Finished Goods Inventory
        │ (Shipment / COGS Recognition)
        ▼
Cost of Goods Sold (P&L)
```

### 12.5 ماذا يحتاج المحاسب من نظام الإنتاج؟

- **اكتمال البيانات**: ألا يُترك أمر مفتوح بدون داعٍ.
- **التطابق الزمني**: حركة المخزون وحدث التكلفة في نفس الفترة.
- **القابلية للتتبع**: أي رقم في GL يمكن تتبعه إلى Cost Distribution إلى حركة إنتاج إلى أمر عمل.
- **الانحرافات الواضحة**: معرفة سبب أي انحراف (Rate / Usage / Substitution / Yield...).
- **سياسة Provisional Completion ثابتة**: لتجنّب قفزات في تكلفة المنتج النهائي.

**روابط القسم:**
- https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25c/fapma/cost-accounting-for-manufacturing-work-orders.html
- https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25a/fapma/why-the-completed-work-orders-not-closed-error-on-period-close-validation.html

---

## 13. العلاقة مع المخزون

### 13.1 الإنتاج لا يُغيّر فقط المخزون، بل يُحرّكه بأنواع حركات محددة

كل عملية في Work Order تُمَس فيها حركة مخزون مُعرَّفة بنوعها:

| حدث الإنتاج | نوع حركة المخزون |
|-------------|-------------------|
| Material Issue | WIP Material Issue |
| Material Return | WIP Material Return |
| Product Completion | WIP Product Completion |
| Product Return | WIP Product Return |
| Scrap | WIP Scrap |
| Outside Processing Delivery | OSP-related transactions |

### 13.2 المواد الخام

- تتأثر برصيد Supply Subinventory المعرَّف في Work Definition.
- إذا كان نوع الصرف Pull، يُجري النظام Backflush تلقائيًا.
- تتأثر بالـ Reservations إن وُجدت (في Back-to-Back، يُحجَز إنتاج الأمر لعميل محدد).

### 13.3 المنتج النصف المصنّع

- إن كان له Work Definition مستقل، يُنتَج كأمر إنتاج منفصل ثم يُصرَف للأمر الأعلى.
- بديل: يُمَثَّل كـ Phantom في الـ Work Definition، فتُفجَّر مكوّناته داخل الأمر الأعلى دون إنشاء أمر مستقل.

### 13.4 المنتج التام

- يُستلَم في Completion Subinventory/Locator.
- قابل للبيع فورًا بعد الاستلام.
- في Back-to-Back، مرتبط بحجز Sales Order — يُشحَن مباشرة بعد الاستلام.

### 13.5 الإنتاج الجزئي

- يُسمح بإكمال المنتج النهائي على دفعات.
- كل دفعة = حركة Product Completion مستقلة.
- تُسعَّر كل دفعة بـ Provisional Cost ثم تُعدَّل عند الإغلاق.

### 13.6 Lot / Serial Tracking

- المواد ذات Lot/Serial تُلزَم بإدخال الرقم عند الصرف.
- المنتج النهائي ذو Lot/Serial يُلزَم بإدخال الرقم عند الإكمال.
- في Genealogy، يربط النظام كل Lot/Serial مكوّن بكل Lot/Serial منتج → **تتبع كامل من المواد الخام إلى المنتج المباع**.
- يدعم Oracle منع صرف Lots منتهية الصلاحية.

### 13.7 Subinventory / Locator

- يُسمح بتعريف **Supply Subinventory** على مستوى Operation Item: من أين تُصرَف.
- يُسمح بتعريف **Completion Subinventory** على مستوى رأس Work Definition (Discrete) أو مخرج العملية (Process).
- Locators تزيد التفصيل (رفّ، خانة) إن كانت المنظمة Locator-Controlled.

### 13.8 التكامل بين حركات التصنيع وInventory Management

- Process: **Transfer Transactions from Inventory to Costing** و **Transfer Transactions from Production to Costing** هما الجدولتان اللتان تنقلان الحركات من قواعد بيانات التشغيل إلى Cost Accounting.
- بدونهما، تظل حركات التصنيع غير مُسعَّرة.

**روابط القسم:**
- https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25c/fammi/execute-work-orders.html
- https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/24d/inv24d/24D-inventory-wn-f34064.htm

---

## 14. الجودة والاستثناءات

### 14.1 Production Exceptions

من وثيقة Oracle: *"As a production operator or the production manager, you can report the problems that occur on the shop floor. These might be problems that can affect the smooth progress of a work order and are thus reported as production exceptions."*

أنواع الاستثناءات المُعرَّفة سلفًا (Predefined، غير قابلة للتوسيع):

| النوع | متى يُستخدم |
|-------|-------------|
| **Work Area** | مشكلة عامة في منطقة عمل |
| **Work Center** | تعطّل مركز عمل |
| **Resources** | عطل آلة / غياب عامل |
| **Components** | نقص مواد |
| **Miscellaneous** | متفرقات |
| **Supplier Operations** | في حال Outside Processing (يُولَّد آليًا) |

### 14.2 ربط عدة أوامر باستثناء واحد

إذا أثَّر النقص في مادة على عدة أوامر إنتاج، يمكن ربطها جميعًا بنفس الاستثناء، مما يساعد المشرف على رؤية الأثر الكلي وحَلِّه دفعة واحدة.

### 14.3 Scrap and Rework

- **Scrap (هالك)**: كمية أتلفت ولا يمكن إصلاحها. تُسجَّل عند عملية محددة.
  - **Operation Scrap Valuation Options**: عند الإغلاق فقط / فورًا وعند الإغلاق / في Cost Cutoff Date.
  - **Operation Scrap Accounting Options**:
    - *Include in Inventory*: قيمة الهالك تتوزع على المنتج التام (تمتصها الوحدات السليمة).
    - *Expense*: تذهب قيمة الهالك إلى حساب مصروف منفصل، فلا تثقل تكلفة المنتج.

- **Estimated Scrap**:
  - عند تعريف Operation Yield (مثلاً 95%)، يحسب النظام كمية الهالك المتوقعة تلقائيًا:
    `Estimated Scrap Qty = Operation Completion Qty × (1 − Yield) / Yield`
  - تُسعَّر بقيد *Debit WIP، Credit Estimated Scrap Absorption*.

- **Rework**:
  - إذا أمكن إصلاح المنتج المرفوض، يُنشأ Rework Work Order قائم على Rework Work Definition (Discrete فقط).
  - يدعم النظام Disposition Assistant (وكيل ذكي) لاقتراح التصرف: Scrap / Rework / Repair / Return.

### 14.4 Inspection و Quality Checks

- يدعم Oracle تكامل مع Quality Issues / Quality Management.
- يمكن تعريف **Inspection Operations** كعمليات في Work Definition.
- تظهر Inspection Rejections كمؤشر في لوحات أداء المشرفين.

### 14.5 Lot / Serial Traceability

تتبع شامل من المواد إلى المنتج:
- يُتيح **Genealogy Tracking** عرض شجرة كاملة: ما هي Lots المواد التي ذهبت إلى Lot المنتج النهائي رقم X.
- يُستخدم في:
  - Recall Management (سحب منتجات معيبة).
  - الامتثال (FDA، ISO).
  - تحليل الأسباب الجذرية للعيوب.

### 14.6 الأثر التكلفي للجودة

- Scrap حسب السياسة: إما يُحمَّل على المنتج التام أو على حساب مصروف.
- Rework: الـ Rework Order له تكلفة منفصلة، تُضاف إلى تكلفة الصنف المعاد.
- Rejected Quantity: تنتقل إلى Scrap أو Rework حسب قرار الـ Disposition.

**روابط القسم:**
- https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25d/faumf/overview-of-production-exceptions.html
- https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25c/fapma/cost-accounting-for-manufacturing-work-orders.html

---

## 15. التخطيط والجدولة

### 15.1 Plan-to-Produce vs Back-to-Back

من وثيقة Manufacturing in Supply Chain Management Business Processes:

| النموذج | الوصف |
|---------|-------|
| **Plan-to-Produce** | المنتج يُنتَج بناء على التنبؤ (Make to Stock). الطلب يُلبَّى من المخزون، والأمر يُنشأ لتجديد المخزون. |
| **Back-to-Back** | المنتج يُنتَج بعد طلب البيع فقط. أمر العمل يُحجَز مباشرة لطلب البيع. (مدعوم لـ Discrete فقط) |
| **Configure to Order (CTO)** | حالة خاصة من Back-to-Back لمنتجات قابلة للتشكيل (ATO Model). |
| **Contract Manufacturing** | الإنتاج يُسنَد لمصنّع خارجي مع تتبع كامل. |
| **Outside Processing** | عملية واحدة أو أكثر من أمر العمل تُنفَّذ بواسطة مورّد. |
| **Min-Max Replenishment** | الإنتاج يُنشأ تلقائيًا عند هبوط الرصيد عن حد أدنى. |
| **Project-Specific** | الإنتاج مرتبط بمشروع وتُخصَّص تكاليفه ومواده عليه. |

### 15.2 جدولة Work Orders

طرق الجدولة (Scheduling Methods):

- **Default Scheduling**: النظام يُجدول بناءً على قواعد المركز ومواعيد المناوبات.
- **Unconstrained**: في Planning Central (لا قيود طاقة).
- **External**: من نظام Production Scheduling خارجي.
- **User**: جدولة يدوية مع Firm Flag.

ملاحظة: عند اختيار User أو External، يتم تفعيل Firm تلقائيًا، فيحترم Planning الجدولة اليدوية ولا يُقترح إعادة جدولتها.

### 15.3 Operation Yield وأثره على الطلب على المواد والموارد

- إذا فُعِّل Plant Parameter: *Include operation yield in material and resource requirements*، يحسب النظام احتياجات المواد والموارد **شاملة الفاقد المتوقع** في كل عملية.
- في Back-to-Back، يجب **ألا تُحدَّد Yield Values** في Work Definition، وألا يُفعَّل هذا الـ Parameter، لكي يبقى مطابقًا للطلب 1:1.

**روابط القسم:**
- https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25d/faumf/overview-of-manufacturing-in-supply-chain-management-business.html
- https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25c/fausp/how-supply-planning-considers-additional-work-order-status.html

---

## 16. التقارير والرقابة

تقارير Oracle Manufacturing و Cost Management تُغطّي عدة طبقات. أهم التقارير ومستخدميها:

| التقرير | المحتوى | مَن يحتاجه |
|---------|---------|------------|
| **Work Order Listing / Status** | الأوامر، حالاتها، الكميات | مدير الإنتاج، التخطيط، الإدارة العليا |
| **Dispatch List** | الأوامر المنتظرة في كل Work Center / Workstation | المشغّل، المشرف |
| **Material Transactions Report** | حركات الصرف والإرجاع لكل أمر | المستودعات، الإنتاج، التكلفة |
| **Production Exceptions Report** | الاستثناءات وحالتها | المشرف، الإدارة |
| **Work Order Costs Page / Report** | تكاليف المواد + الموارد + الـ Overhead لكل أمر | محاسب التكلفة، مدير الإنتاج |
| **Review Cost Accounting Distributions** | كل التوزيعات المحاسبية الناتجة عن الإنتاج | محاسب التكلفة |
| **Period Inventory Valuation Report** | قيمة المخزون كاملاً (RM + WIP + FG) | المحاسبة، المالية |
| **Variances Report** | الانحرافات (Material Rate/Usage/Sub، Resource، Yield، Job Close) | محاسب التكلفة، الإدارة |
| **Resource Usage / Performance** | استخدام الموارد، الكفاءة | الإنتاج، الموارد البشرية |
| **Genealogy Report / Lot Trace** | Lot/Serial Traceability | الجودة، الامتثال |
| **Production Performance (OTBI Subject Areas)** | تحليلات مرنة عبر BI | الإدارة، التخطيط |

**روابط القسم:**
- https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25d/faspc/period-inventory-valuation-report.html
- https://docs.oracle.com/en/cloud/saas/analytics/25r2/fascm/scm-manufacturing-faqs.html

---

## 17. نقاط القوة في Oracle Fusion Cloud Manufacturing

### 17.1 وضوح Work Orders ودورة الحياة

النموذج (Unreleased → Released → Completed → Closed) صريح ومحوكَم بحالات نظامية لا يستطيع المستخدم تجاوزها — هذا يمنع الفوضى الشائعة في الأنظمة المحلية حيث "أمر مفتوح للأبد" أو "أمر مغلق فيه حركات معلقة".

### 17.2 قوة Work Definitions

- BOM + Routing في كيان واحد.
- إصدارات، أولويات، بدائل، Rework، Transform، Flow.
- ربط مباشر بـ Item Structure مع مزامنة آلية.
- ad hoc items مع صلاحيات منفصلة.

### 17.3 التكامل المالي العميق

Cost Accounting ليس وحدة منفصلة بل **قلب النظام**. لكل حركة إنتاج Cost Distribution، ولكل توزيع قيد عبر Subledger Accounting، ولكل قيد ترحيل آلي إلى GL. الانحرافات مُولَّدة بنظام عند الإغلاق.

### 17.4 مرونة في مناهج التكلفة

دعم Standard وActual وPerpetual Average وPeriodic Average في نفس الوقت لأصناف مختلفة، مع خيارات Provisional Completion لكل صنف.

### 17.5 Traceability كاملة

Lot / Serial / Genealogy على مستوى المنتج النهائي وكل المكوّنات، مع منع صرف Lots منتهية.

### 17.6 تكامل واسع مع المنظومة

- Planning ← Orchestration ← Manufacturing.
- Manufacturing ← Inventory ← Cost ← GL.
- Manufacturing ← Maintenance ← IoT (للاستثناءات الآلية).

### 17.7 دعم سيناريوهات معقدة

Configure to Order، Project-Specific Manufacturing، Contract Manufacturing، Outside Processing، Mixed Mode.

---

## 18. التعقيد والمخاطر

### 18.1 عمق Master Data

ضعف أو تأخر إعداد البيانات الأساسية (الأصناف، Work Definitions، Resources، Cost Profiles، Overhead Rates) ينتج إنتاجًا غير ذا قيمة محاسبية. وقت الإعداد قد يساوي أو يفوق وقت التطوير.

### 18.2 خطورة عدم إغلاق Work Orders

عدم الإغلاق يؤدي إلى:
- ظهور انحرافات في فترة لاحقة لفترة المبيعات → هامش ربح غير دقيق.
- تضخم WIP في الميزانية بقيم لا تعكس واقع المنشأة.
- صعوبة في إقفال الفترات المحاسبية.

### 18.3 خطورة سوء فهم Cost Accounting

اختيارات Cost Profile مثل Provisional Completion Option، Operation Scrap Valuation/Accounting، تؤثر بقوة في **متى وأين** تظهر التكلفة. قرار خاطئ يحوّل التكلفة من **Asset (WIP)** إلى **Expense (Scrap)** أو العكس.

### 18.4 خطورة إدخال نموذج تكلفة معقد لعميل غير جاهز

كثير من العملاء المتوسطين لا يحتاجون Periodic Average أو Actual Cost بمستوى التفصيل الذي تقدّمه Oracle. اقتراح نموذج Standard Cost مع Variances واضحة كافٍ في 80% من الحالات.

### 18.5 الفجوة بين الإنتاج والمستودعات والمحاسبة

أكبر مشكلة في تطبيقات الإنتاج هي **اللاوضوح في المسؤوليات**:
- من يصرف؟ (الإنتاج أم المستودع؟)
- من يُكمل؟ (المشغّل أم المشرف؟)
- من يُغلق؟ (المشرف أم المحاسب؟)
- من يراجع التكلفة؟ (المحاسب أم المالية؟)

Oracle يوزّعها عبر أدوار وصلاحيات صارمة (Privileges)، وأي ERP محلي يجب أن يحاكي هذا الفصل ولو على مستوى الأدوار.

### 18.6 ضرورة التدريب

دورة الإنتاج تمسّ 5-6 أدوار، كل دور يجب أن يفهم أثر فعله على الأدوار الأخرى. عدم التدريب = حركات معلقة + استثناءات لا تُحلّ + تكلفة غير دقيقة.

---

## 19. أسئلة تحليل العميل المستخرجة من دراسة Oracle

### 19.1 معلومات عامة

- ماذا تنتجون؟ (منتج تام أم سلسلة منتجات؟)
- هل الإنتاج للتخزين (Make to Stock) أم حسب الطلب (Make to Order)؟
- هل لديكم Configure to Order؟
- هل يوجد أكثر من مصنع / موقع إنتاج / منظمة مخزون؟
- هل يوجد أكثر من خط إنتاج داخل المصنع الواحد؟
- هل تنتجون لمشاريع محددة (Project-Specific)؟
- هل تستعينون بمصنّعين خارجيين (Contract Manufacturing)؟
- هل توجد عمليات تتم خارجيًا (Outside Processing)؟

### 19.2 Work Definitions

- هل لكل منتج طريقة تصنيع ثابتة؟
- هل توجد مراحل إنتاج (Operations) متعددة؟
- هل توجد مواد بديلة؟
- هل تختلف طريقة التصنيع حسب العميل / الدفعة / الموسم؟
- هل توجد منتجات نصف مصنعة؟
- هل تحتاجون Routings (سلسلة عمليات) أم BOM فقط؟
- هل توجد Yield متوقعة (نسبة فاقد) لكل عملية؟
- هل توجد Co-products أو By-products؟
- هل توجد طرق إنتاج بديلة (Alternate Work Definitions)؟

### 19.3 Work Orders

- من ينشئ أمر العمل؟ (يدوي / من التخطيط / من المبيعات؟)
- من يعتمد الأمر؟ هل تحتاجون E-Signatures؟
- هل يتم الإنتاج جزئيًا؟
- هل يمكن تعديل الأمر بعد البدء؟ (تغيير الكمية، حذف عملية، إضافة مادة)
- هل يوجد إغلاق رسمي للأمر أم لا؟
- هل تُغلق الأوامر شهريًا قبل إقفال الفترة؟

### 19.4 المواد والمخزون

- متى يتم صرف المواد؟ (يدوي / تلقائي عند الإكمال / عند إكمال المنتج النهائي)
- هل يوجد مرتجع مواد؟
- هل يوجد مستودع منفصل للإنتاج (WIP Storage)؟
- هل لديكم تتبع Lot؟
- هل لديكم تتبع Serial؟
- هل لديكم Genealogy بين المواد والمنتج النهائي؟
- هل توجد مواد منتهية صلاحية تتطلب منع الصرف؟

### 19.5 الموارد والتشغيل

- هل تستخدمون آلات محددة أم خط إنتاج واحد؟
- هل يتم تسجيل وقت العمال أو الآلات؟ (يدوي / Check-in)
- هل تكلفة التشغيل تدخل في تكلفة المنتج؟
- هل توجد Work Centers محددة؟ ما عددها؟
- هل توجد Mناوبات (Shifts) محددة؟
- هل توجد Workstations مرتبطة بآلات بعينها؟
- هل توجد Outside Processing للموارد؟

### 19.6 التكلفة والمحاسبة

- هل تريدون تكلفة مواد فقط أم تكلفة كاملة (مواد + موارد + Overhead)؟
- هل تدخل العمالة والآلات في التكلفة؟
- هل تستخدمون Plant Overhead؟ Work Center Overhead؟
- هل تحتاجون WIP في الميزانية؟
- هل تريدون Cost Distributions لكل حركة؟
- هل المنهج المناسب: Standard Cost أم Actual Cost أم Perpetual Average؟
- هل المحاسبة تريد قيودًا تلقائية عبر Subledger Accounting أم مراجعة يدوية؟
- متى تُغلق التكلفة شهريًا؟
- هل تحتاجون انحرافات منفصلة بأنواعها (Rate/Usage/Substitution/Yield/Job Close)؟
- ما سياسة Provisional Completion المرغوبة؟
- ما سياسة الهالك: Include in Inventory أم Expense؟

### 19.7 الجودة والهالك

- هل يوجد فحص جودة (Inspection Operation)؟
- هل يوجد هالك طبيعي يجب توقعه (Operation Yield)؟
- كيف يُسجَّل الهالك؟ مع سبب؟
- هل لديكم Rework لمنتج معيب؟
- هل ترفضون منتجات بعد الإنتاج؟
- ما سياسة التصرف بالمنتج المرفوض؟ (Scrap / Rework / Return)
- هل تحتاجون تتبع Lots منتهية الصلاحية ومنع صرفها؟

### 19.8 التقارير

- ما أهم تقارير الإنتاج التي تحتاجونها؟
- هل تريدون تقرير تكلفة Work Order مفصّل؟
- هل تريدون تقرير WIP؟
- هل تريدون تقرير استهلاك مواد؟
- هل تريدون تقرير موارد ومدى الكفاءة؟
- هل تريدون Lot/Serial Traceability؟
- هل تريدون تقارير انحرافات؟
- هل تحتاجون KPIs (مثل OEE، Cycle Time، Yield)؟

---

## 20. ماذا يمكن أن نستفيد من Oracle في تطوير أو تقييم نظام ERP محلي

### 20.1 تصميم Work Orders واضحة

- استيراد فلسفة "Header + Operations + Items + Resources" بدل سجل واحد مسطّح.
- جعل الحالات (Unreleased → Released → Completed → Closed) **حالات نظامية** لا يستطيع المستخدم تجاوزها.
- منع الحركات إذا كان الأمر ليس Released.
- منع التعديل إذا كان الأمر Closed.

### 20.2 بناء Work Definitions بدل BOM البسيط

- BOM وحده غير كافٍ. لا بد من Routing (تتابع العمليات) + Resources.
- إصدارات مع تواريخ سريان لكي يمكن تتبع تغيير طريقة الإنتاج عبر الزمن.
- دعم Primary وAlternate.
- دعم Phantom للأصناف الوسيطة التي لا نريد إنشاء أمر منفصل لها.

### 20.3 ربط الإنتاج بالمخزون

- كل حركة إنتاج يجب أن تُترجم إلى حركة مخزون مُعرَّفة النوع (WIP Issue / WIP Completion / WIP Scrap...).
- منع الصرف بدون رصيد.
- دعم Supply Type Push/Pull.
- دعم Lot/Serial Tracking في الصرف والإكمال.

### 20.4 ربط الإنتاج بالتكلفة والمحاسبة

- وجود **طبقة Cost Accounting** بين الإنتاج والمحاسبة (وحدة وسيطة).
- لا تتولد القيود من الإنتاج مباشرة، بل من Cost Distributions.
- دعم Standard Cost كحد أدنى مع توليد الانحرافات.
- جدولة (Scheduled Process) لنقل الحركات إلى التكلفة بشكل دوري.

### 20.5 آلية إغلاق Work Orders

- جعل الإغلاق حدثًا له آثار: تحرير WIP، توليد الانحرافات، تسوية الهالك.
- إقفال الفترة المحاسبية يجب أن يفشل إذا كانت توجد أوامر Completed غير مغلقة.

### 20.6 تقارير Cost Distributions و WIP

- تقرير يعرض كل التوزيعات المحاسبية الناتجة عن الإنتاج، مرتبطة بأمر العمل والحركة الأصلية.
- تقرير WIP يربط رصيد الأستاذ العام بأرصدة أوامر العمل المفتوحة.

### 20.7 تحسين متابعة الموارد والعمليات

- تعريف Work Centers مع Resources لها معدلات.
- تسجيل ساعات الموارد لكل أمر.
- ربط الموارد بمعدلات Cost Scenario.

### 20.8 ضبط العلاقة بين الإنتاج والمستودعات والمحاسبة

- أدوار منفصلة بصلاحيات (Privileges).
- فصل صلاحية الإفراج عن صلاحية الإغلاق.
- فصل صلاحية تسجيل الحركة عن صلاحية إنشاء التوزيع المحاسبي.

### 20.9 تصميم أسئلة تحليل قوية للعميل

استخدام قائمة الأسئلة في القسم 19 كنموذج لاستبيان تحليل احتياجات للعميل في أي تطبيق ERP محلي.

---

## 21. مقارنة مختصرة بين Oracle ومنطق ERP المحلي

| البُعد | Oracle Fusion Cloud Manufacturing | حد أدنى يجب أن يدعمه ERP محلي |
|--------|-----------------------------------|--------------------------------|
| Work Order Statuses | حالات نظامية صارمة مع منع تعديل | حد أدنى: Unreleased / Released / Completed / Closed |
| Work Definition | BOM + Routing + Resources + Outputs + Versions | BOM + Routing بسيطين، مع إصدار واحد |
| Cost Methods | Standard / Actual / Perpetual Average / Periodic Average | Standard Cost كافي للبداية |
| Overhead | Plant + Work Center، Date-Effective، مستويات Org/Category/Item | معدل Overhead بسيط على مستوى المصنع |
| WIP | حساب أصول مُولَّد آليًا، رصيد قابل للتسوية | حساب وسيط يستقبل التكاليف ويُسوّى عند الإغلاق |
| Variances | 9 أنواع تلقائية عند الإغلاق | على الأقل: Material Usage و Job Close |
| Lot/Serial | مدعوم كامل + Genealogy | Lot على الأقل في المنتج النهائي |
| Production Exceptions | 6 أنواع، مرتبطة بعدة أوامر، تكامل IoT | سجل ملاحظات على الأمر، حالات قليلة |
| Outside Processing | تكامل كامل مع Procurement | يمكن تأجيله أو معالجته يدويًا |
| Configure to Order | مدعوم | غير ضروري للعملاء العاديين |
| Contract Manufacturing | مدعوم | غير ضروري عمومًا |
| Process Manufacturing | مدعوم بالكامل | يُؤجَّل إن لم يكن العميل صناعة كيميائية/غذائية |

### 21.1 أين يكون Oracle قويًا جدًا؟

في:
- بيئات التصنيع المعقدة متعددة المصانع.
- الصناعات المنظمة (دوائية، غذائية، طبية، عسكرية).
- البيئات التي تحتاج Cost Accounting دقيقًا بمناهج مختلفة لأصناف مختلفة.
- البيئات التي تحتاج Traceability كاملة لأغراض Recall.
- بيئات Make to Order و Configure to Order.

### 21.2 أين قد يكون معقدًا للعملاء الصغار والمتوسطين؟

- إعداد Cost Profiles وCost Scenarios.
- مفهوم Provisional Completion Options.
- التمييز بين Cost Organization و Cost Book و Valuation Unit.
- إعداد Subledger Accounting Rules.
- 9 أنواع انحرافات قد تكون مرهقة بدون فهم محاسبي عميق.

### 21.3 ما يمكن تأجيله في تطبيق محلي؟

- Process Manufacturing.
- Configure to Order.
- Contract Manufacturing.
- Project-Specific Manufacturing.
- IoT Integration.
- AI Agents (Completion Assistant، Disposition Assistant).
- Workstation Check-in/Check-out.

---

## 22. خلاصة تنفيذية

### 22.1 أهم ما يميز Oracle في الإنتاج

أن الإنتاج عنده **منظومة مترابطة**: بيانات أساسية → أوامر عمل → تنفيذ → تكلفة → محاسبة → تقارير. لا يُسمح بقفز طبقة. ولا يُسمح بإغلاق أمر بحركات معلقة. ولا يُسمح بصرف بدون رصيد. ولا تظهر أرقام في GL بدون توزيع تكلفة. هذا الانضباط هو الفرق بين نظام إنتاج "يُسجّل" ونظام إنتاج "يُدير".

### 22.2 أهم درس متعلق بـ Work Orders

أن دورة حياة أمر العمل (Unreleased → Released → Completed → Closed) ليست عناوين بل **بوابات حوكمة**. كل انتقال يُعطّل حركات وينشّط أخرى. النظام المحلي الجيد يجب أن يحاكي هذه البوابات حتى لو بأبسط طريقة.

### 22.3 أهم درس متعلق بـ Cost Accounting

أن التكلفة لا تتكوّن لحظة الإكمال بل **عند الإغلاق**. ما يحدث عند الإكمال هو **تقدير (Provisional)**، وما يحدث عند الإغلاق هو **التسوية النهائية**. هذا الفصل بين التقدير والفعلي يحمي تكلفة المنتج من القفزات ويوفّر آلية واضحة للانحرافات.

### 22.4 أهم درس متعلق بالمخزون

أن **كل حركة إنتاج هي حركة مخزون مُعرَّفة النوع**. لا يوجد "إنتاج بدون مخزون" ولا "مخزون بدون قيمة". الإنتاج يُحرّك المخزون عبر أنواع محددة (WIP Material Issue، WIP Product Completion، WIP Scrap...) كل منها له أثر تكلفي محدد.

### 22.5 أهم درس متعلق بالعميل

أن أسئلة تحليل الإنتاج ليست عن "ماذا تنتجون" فقط، بل عن:
- **من** يفعل ماذا؟
- **متى** يحدث كل شيء؟
- **كيف** يُسعَّر كل شيء؟
- **أين** يظهر الأثر في المالية؟

العميل الذي لا يفرّق بين Materials Cost و Resource Cost و Overhead، يحتاج تثقيف قبل تطبيق. وإلا فإن النظام سيُولّد أرقامًا لا يفهمها.

### 22.6 الاستفادة العملية لمستشار ERP

من هذه الدراسة يمكن لمستشار ERP أن:
1. **يبني استبيان تحليل احتياجات إنتاج** متين (القسم 19).
2. **يميّز بين الحد الأدنى المطلوب والحد المتقدم** عند تقييم نظام محلي (القسم 21).
3. **يفهم عمارة الفصل بين Manufacturing و Inventory و Cost** ولماذا هي ضرورية.
4. **يصمم Work Definitions بدلاً من BOM بسيط** ويُقنع العميل بفائدتها.
5. **يخطط لدورة إغلاق شهرية صحيحة** تربط إغلاق أوامر العمل بإقفال الفترة المحاسبية.
6. **يُجنّب العميل أخطاء كلاسيكية**: أوامر مفتوحة، حركات معلقة، WIP متضخم، انحرافات غير مفسَّرة.
7. **يضع تقارير ذات قيمة** ترتبط بقرارات (Cost Distributions، WIP، Variances، Genealogy) لا بمجرد طباعة بيانات.

---

## 23. المصادر الرسمية

جميع المراجع التالية من Oracle Help Center و Oracle Cloud Documentation الرسميين:

### Manufacturing Core

1. **Execute Work Orders (25C)**
   https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25c/fammi/execute-work-orders.html

2. **Overview of Production Process Design (26B)**
   https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/faumf/overview-of-production-process-design.html

3. **Overview of Work Definitions (26B)**
   https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/faumf/overview-of-work-definitions.html

4. **How You Manage a Work Order Header (23D)**
   https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/23d/faumf/how-you-manage-a-work-order-header.html

5. **Overview of Manufacturing in Supply Chain Management Business Processes (25D)**
   https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25d/faumf/overview-of-manufacturing-in-supply-chain-management-business.html

6. **About Oracle Fusion Cloud Manufacturing (25A)**
   https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25a/faips/about-oracle-fusion-cloud-manufacturing.html

7. **Work Areas, Resources, and Work Centers (25D)**
   https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25d/faims/work-areas-resources-and-work-centers.html

8. **Getting Started with Manufacturing Implementation (26A)**
   https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26a/fammi/getting-started-with-your-manufacturing-and-supply-chain-materials-management-implementation.pdf

### Cost Accounting

9. **Cost Accounting for Manufacturing Work Orders (25C)**
   https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25c/fapma/cost-accounting-for-manufacturing-work-orders.html

10. **Cost Accounting for Manufacturing Work Orders (26A)**
    https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26a/fapma/cost-accounting-for-manufacturing-work-orders.html

11. **Managing Overhead Rates (25B)**
    https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25b/fapma/managing-overhead-rates.html

12. **Create Cost Accounting Distributions (23C)**
    https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/23c/fapma/create-cost-accounting-distributions.html

13. **Items, Valuation Units, and Cost Profiles (24B)**
    https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/24b/faims/items-valuation-units-and-cost-profiles.html

14. **Why do I see the Completed work orders not closed error on period close validation (25A)**
    https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25a/fapma/why-the-completed-work-orders-not-closed-error-on-period-close-validation.html

15. **Period Inventory Valuation Report (25D)**
    https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25d/faspc/period-inventory-valuation-report.html

### Production Exceptions & Quality

16. **Overview of Production Exceptions (25D)**
    https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25d/faumf/overview-of-production-exceptions.html

### Supply Planning Integration

17. **How Supply Planning Considers Additional Work Order Status (25C)**
    https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25c/fausp/how-supply-planning-considers-additional-work-order-status.html

### What's New (References for Recent Features)

18. **Manufacturing 25A — Report Scrap at Workstation**
    https://docs.oracle.com/en/cloud/saas/readiness/scm/25a/mfg25a/25A-mfg-wn-f35478.htm

19. **Manufacturing 25C — Account for Issuing and Consuming the Same Item in Process Manufacturing**
    https://docs.oracle.com/en/cloud/saas/readiness/scm/25c/inv25c/25C-inventory-wn-f38935.htm

20. **Manufacturing 26A — Delete Operations from Released Work Order**
    https://docs.oracle.com/en/cloud/saas/readiness/scm/26a/mfg26a/26A-mfg-wn-f41739.htm

21. **Manufacturing 26A — Prevent Issue of Expired Lots**
    https://docs.oracle.com/en/cloud/saas/readiness/scm/26a/mfg26a/26A-mfg-wn-f41689.htm

22. **Manufacturing 26B — Work Order Completion Assistant**
    https://docs.oracle.com/en/cloud/saas/readiness/scm/26b/mfg26b/26B-mfg-wn-f43104.htm

### Analytics

23. **Manufacturing Frequently Asked Questions (BI)**
    https://docs.oracle.com/en/cloud/saas/analytics/25r2/fascm/scm-manufacturing-faqs.html

### Documentation Search Entry Points

24. **Oracle Fusion Cloud SCM Documentation (Main Page)**
    https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/

25. **Documentation Search (Work Orders)**
    https://docs.oracle.com/search/?q=Oracle%20Fusion%20Cloud%20Manufacturing%20work%20orders

---

> **ملاحظة ختامية:** هذه الدراسة تبني فهمًا مرجعيًا، لكن أي تطبيق فعلي على بيئة Oracle Fusion يجب أن يُراجع مع وثائق إصدار العميل المحدد (Quarterly Updates) لأن Oracle تصدر تحسينات كل ربع سنة في Cloud. كذلك القيود المحاسبية التفصيلية تتولد من Subledger Accounting وفق Accounting Rules خاصة بكل تنفيذ، فلا يجب افتراض قيود ثابتة دون مراجعة إعداد العميل.
