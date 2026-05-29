# الدرس 01: البيانات الأساسية Master Data

## لماذا هذا الدرس مهم

أي Production Module قوي أو ضعيف يبدأ فعليًا من جودة البيانات الأساسية Master Data.

كثير من الناس يظنون أن المشكلة في الإنتاج تظهر عند إنشاء Production Order أو Work Order، لكن الحقيقة أن معظم المشاكل الكبيرة تبدأ قبل ذلك بكثير، في:

- الصنف Product / Item / Material
- وحدة القياس Unit of Measure (UoM)
- الموقع Site / Plant / Organization
- المستودع Warehouse / Storage Location / Subinventory
- التتبع Tracking مثل Lot / Batch / Serial
- طريقة التقييم Costing Setup

إذا كانت Master Data ضعيفة، فكل ما بعدها سيبدو متعبًا:

- التخطيط Planning
- الصرف Material Issue / Goods Issue
- الاستلام Receipt / Completion
- WIP
- Variances
- التقارير Reports

## الهدف من الدرس

بعد إنهاء هذا الدرس يجب أن تكون قادرًا على:

1. فهم معنى Master Data في سياق الإنتاج Production.
2. معرفة أهم البيانات الأساسية التي يجب أن تكون مضبوطة قبل التشغيل.
3. ربط Master Data بأثرها على Inventory وCosting وExecution.
4. اكتشاف لماذا تكون كثير من مشاكل الإنتاج أصلها بيانات أساسية، لا التنفيذ فقط.

## ما المقصود بـ Master Data؟

Master Data هي البيانات المرجعية الثابتة أو شبه الثابتة التي يعتمد عليها النظام في تنفيذ دورة الإنتاج.

هي لا تمثل حدثًا Event، بل تمثل الأساس الذي تُبنى عليه الأحداث.

مثلًا:

- المنتج Product ليس حدثًا، بل تعريف أساسي.
- المادة الخام Raw Material ليست حدثًا، بل تعريف أساسي.
- Unit of Measure ليست حدثًا، بل تعريف أساسي.
- Warehouse أو Plant ليس حدثًا، بل سياق أساسي.

## أهم عناصر Master Data في التصنيع

### 1. المنتج Product / Item / Material

هذا هو الكيان الأساسي الذي سيدخل في التخطيط أو الصرف أو الاستلام.

قد يظهر كالتالي:

- Released Product in Dynamics 365
- Item in Oracle Fusion Cloud
- Material Master in SAP S/4HANA

البيانات المهمة هنا:

- Code
- Name
- Type
- UoM
- Costing behavior
- Tracking behavior
- Organizational scope

### 2. المادة الخام Raw Material

هي مادة تدخل في تصنيع المنتج النهائي أو نصف المصنع.

إذا كانت معرفة بشكل خاطئ، فستظهر مشاكل مثل:

- صرف كميات خاطئة
- تقييم تكلفة غير صحيح
- تتبع غير مكتمل
- شراء أو إنتاج غير منضبط

### 3. المنتج نصف المصنع Semi-finished Good / Subassembly

هذا ليس مجرد Component عادي دائمًا.

قد يكون:

- منتجًا وسيطًا ينتج بأمر مستقل
- Phantom ضمن BOM
- عنصرًا متعدد الاستخدام بين أكثر من Finished Good

هذه الفئة مهمة جدًا لأن كثيرًا من الأنظمة المحلية تتعامل معها بسطحية.

### 4. المنتج النهائي Finished Good

هو الناتج الذي يستلم في المخزون عند انتهاء العملية التنفيذية.

لكن تعريفه الصحيح يجب أن يشمل أيضًا:

- أين سيستلم؟
- كيف يقيم؟
- هل يحتاج Lot أو Serial؟
- ما علاقته بالجودة Quality؟

### 5. وحدات القياس Unit of Measure (UoM)

من أكثر النقاط التي يستهين بها غير المتخصصين.

خطأ UoM قد يسبب:

- صرفًا مضاعفًا أو ناقصًا
- فرقًا كبيرًا في التكلفة
- صعوبة في المقارنة بين الشراء والإنتاج والتخزين

المستشار القوي دائمًا يسأل:

- ما Base UoM؟
- هل توجد تحويلات Conversion صحيحة؟
- هل تختلف UoM بين الشراء والإنتاج والمخزون؟

### 6. المواقع والمستودعات والتنظيم Organizational and Inventory Context

يجب أن يكون واضحًا:

- أين يتم الإنتاج؟
- من أي مستودع تصرف المواد؟
- إلى أي مستودع أو موقع يستلم الناتج؟

هذه النقطة تظهر في الأنظمة الثلاثة بأسماء مختلفة:

- Site / Warehouse / Location in Dynamics
- Inventory Organization / Subinventory / Locator in Oracle
- Plant / Storage Location in SAP

### 7. التتبع Tracking

وهذا يشمل:

- Lot
- Batch
- Serial Number

التتبع ليس رفاهية.

بل قد يكون شرطًا رقابيًا أو تشغيليًا أو قانونيًا حسب نوع الصناعة.

### 8. إعدادات التكلفة Costing Setup

بعض الناس يظنون أن Costing تبدأ فقط في قسم التكلفة.

لكن الحقيقة أن جزءًا من Costing يبدأ من Master Data، مثل:

- Item Groups and Model Groups in Dynamics
- Costing Enabled / Inventory Asset Value in Oracle
- Price Control / Valuation Class / Costing Views in SAP

## كيف تظهر Master Data في الأنظمة الثلاثة

| المفهوم | Dynamics 365 | Oracle Fusion Cloud | SAP S/4HANA |
| --- | --- | --- | --- |
| تعريف الصنف | Released Product | Item | Material Master |
| السياق التنظيمي | Site / Warehouse / Location | Inventory Organization / Subinventory / Locator | Plant / Storage Location |
| وحدة القياس | UoM and conversions | UoM | Base UoM and conversions |
| التتبع | Tracking Dimensions | Lot / Serial Control | Batch / Serial |
| إعدادات التكلفة | Item Group / Item Model Group | Costing Enabled / Asset behavior | Valuation Class / Price Control / Costing Views |

## كيف تؤثر Master Data على التشغيل؟

### على التخطيط Planning

إذا كان المنتج أو المادة أو الموقع غير مضبوط، فسيعطي النظام نتائج تخطيط غير صحيحة.

### على الصرف Material Issue / Goods Issue

إذا كانت UoM أو Storage Location أو Supply Context غير واضحة، فسيكون الصرف مضطربًا.

### على الاستلام Receipt / Completion

إذا لم يكن Finished Good مضبوطًا أو Completion Location غير واضحة، سيفشل الاستلام أو يذهب إلى مكان خاطئ.

### على التكلفة Costing

إذا كانت بيانات التقييم أو السعر أو المجموعة المحاسبية خاطئة، ستظهر تكلفة أو قيود مالية غير موثوقة.

## أمثلة على أخطاء Master Data الشائعة

1. صنف خام معرف كخدمة Service.
2. UoM غير متطابقة بين الشراء والإنتاج.
3. Finished Good لا يملك Tracking بينما الواقع يتطلب ذلك.
4. مادة خام تصرف من مستودع خاطئ دائمًا.
5. إعدادات Costing غير متوافقة مع طريقة تقييم الشركة.
6. Plant أو Inventory Organization غير صحيحة.

## منظور المستشار Functional Consultant View

عندما ترى مشكلة في الإنتاج، لا تبدأ مباشرة بالقول إن Workflow ضعيف.

اسأل أولًا:

- هل Product مضبوط؟
- هل UoM صحيحة؟
- هل Warehouse / Plant / Organization واضحة؟
- هل Costing setup صحيح؟
- هل Tracking مطلوب ومفعل؟

كثير من مشاكل التنفيذ هي في الحقيقة Master Data Problems متنكرة.

## الأخطاء الشائعة Common Mistakes

1. اعتبار Master Data مجرد إدخال إداري.
2. التقليل من أهمية UoM.
3. نسيان ربط Master Data بالتكلفة.
4. الخلط بين Raw Material وSubassembly وFinished Good.
5. تجاهل البعد التنظيمي Plant / Site / Organization.

## المراجعة السريعة Quick Review

- Master Data هي أساس دورة الإنتاج.
- Product وMaterial وUoM وWarehouse وTracking وCosting Setup عناصر محورية.
- خطأ بسيط في Master Data قد يظهر لاحقًا كمشكلة إنتاج أو تكلفة أو تقرير.
- المستشار القوي يفحص البيانات الأساسية قبل أن يحكم على التنفيذ.

## مهمة الدرس Study Task

اختر منتجًا صناعيًا بسيطًا، ثم اكتب له:

1. Finished Good
2. Raw Materials
3. Semi-finished Goods إن وجدت
4. Base UoM
5. موقع صرف المواد
6. موقع استلام المنتج
7. هل يحتاج Lot أو Serial؟ ولماذا؟
