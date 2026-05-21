# الدرس 02: بنية المنتج BOM / Formula / Item Structure

## لماذا هذا الدرس مهم

إذا كانت Master Data تجيب عن سؤال: ما الذي نستخدمه داخل النظام؟

فإن Product Structure تجيب عن سؤال أدق:

مم يتكون المنتج؟

وهذا هو قلب:

- التخطيط Planning
- الصرف Consumption
- التكلفة Material Cost
- المنتجات النصف مصنعة Subassemblies
- الهالك Scrap
- المنتجات المشتركة أو الجانبية Co-products / By-products

ضعف هذا الجزء يعني أن النظام قد ينتج، لكنه سينتج على منطق خاطئ.

## الهدف من الدرس

بعد إنهاء هذا الدرس يجب أن تكون قادرًا على:

1. فهم معنى BOM وFormula وItem Structure.
2. التمييز بين هذه المفاهيم وبين Route أو Work Definition.
3. فهم أثر Product Structure على Planning وIssue وCost.
4. استيعاب مفاهيم مثل Version وScrap وPhantom وSubassembly.

## ما المقصود ببنية المنتج Product Structure؟

هي التمثيل النظامي للمكونات الداخلة في تصنيع منتج معين.

قد تكون:

- BOM in Dynamics and SAP
- Item Structure in Oracle
- Formula in process-oriented scenarios

هذه البنية تحدد عادة:

- Components
- Quantities
- UoM
- Validity or Versioning
- Scrap
- Alternatives
- Sometimes outputs like Co-products or By-products

## BOM: Bill of Material

BOM هي أشهر تمثيل لبنية المنتج.

هي تجيب عن السؤال:

What goes into the product?

أي:

ما المواد الداخلة؟ وبأي كميات؟

لكن في الأنظمة الكبيرة BOM ليست قائمة مواد بسيطة فقط، بل هي عنصر مؤثر في:

- MRP / Planning
- Material Issue
- Cost Estimate
- Variance logic

## Formula

Formula تظهر غالبًا أكثر في التصنيع العملياتي Process Manufacturing.

تكون مناسبة عندما يكون المنتج قائمًا على وصفة Recipe أكثر من كونه تجميعًا Discrete Assembly.

مثل:

- غذاء
- دواء
- كيماويات
- دهانات

في Formula قد تظهر مفاهيم أقوى في:

- النسب Ratios
- المخرجات المتعددة Multiple Outputs
- Co-products
- By-products

## Item Structure

Item Structure هو المصطلح الأوضح في Oracle لوصف هيكل المكونات.

هو قريب جدًا من BOM من الناحية الوظيفية، لكنه يأتي ضمن منطق Oracle الذي يربطه لاحقًا بـ Work Definition.

فهم هذه النقطة مهم جدًا:

Oracle غالبًا يفصل بين:

- ماذا يدخل في المنتج؟ Item Structure
- كيف يُصنع؟ Work Definition

## عناصر Product Structure الأساسية

### 1. Component

المادة الداخلة في المنتج.

قد تكون:

- Raw Material
- Purchased Part
- Subassembly
- Phantom

### 2. Quantity

كمية المكون المطلوبة لإنتاج كمية مرجعية من المنتج.

أخطر الأخطاء غالبًا تكون هنا، لأن خطأ الكمية ينعكس على:

- التخطيط
- الصرف
- التكلفة
- Variance

### 3. Unit of Measure (UoM)

لا يكفي أن تحدد الكمية رقمًا فقط.

بل يجب أن تكون الوحدة واضحة وصحيحة.

### 4. Version / Validity

الأنظمة الكبيرة لا تتعامل دائمًا مع Structure واحدة ثابتة للأبد.

قد توجد:

- BOM Version
- Alternative BOM
- Effective Dates
- Work Definition Version لاحقًا في Oracle

هذا ضروري عندما يتغير المنتج مع الوقت أو الموقع أو الكمية.

### 5. Scrap

الهالك Scrap قد يكون:

- Constant Scrap
- Variable Scrap
- Component Scrap
- Assembly Scrap
- Operation Scrap في سياقات أخرى

وجود Scrap في Structure مهم لأنه يرفع الاحتياج الحقيقي للمواد، ويقرب التخطيط من الواقع.

### 6. Subassembly

منتج وسيط قد يدخل في Finished Good.

قد يعامل بأحد شكلين:

- Order-based subassembly
- Phantom / exploded subassembly

### 7. Phantom

كيان منطقي أو تجميعي لا يُنتج دائمًا بأمر مستقل، بل تُفجر مكوناته داخل المنتج الأب Parent.

هذا مفيد لتبسيط الهندسة، لكنه يحتاج فهمًا جيدًا حتى لا يسبب التباسًا.

### 8. Co-product / By-product

هذه مفاهيم أكثر تقدمًا، لكنها مهمة في بعض الصناعات.

- Co-product: ناتج رئيسي إضافي يشارك في التكلفة
- By-product: ناتج جانبي ثانوي قد يؤثر على التكلفة أو المخزون

## كيف يظهر هذا في الأنظمة الثلاثة

| المفهوم | Dynamics 365 | Oracle Fusion Cloud | SAP S/4HANA |
| --- | --- | --- | --- |
| البنية الأساسية | BOM / Formula | Item Structure / BOM | BOM |
| النسخ | BOM Version | Structure plus Work Definition versioning context | Alternative BOM / Validity |
| الهالك | Constant / Variable Scrap | Depends on structure and execution design | Component / Assembly / Operation Scrap |
| المنتجات المشتركة | Formula with Co-products / By-products | Process-oriented definitions and outputs | Process manufacturing concepts |
| Phantom | Phantom handling in BOM logic | Structure behavior with design choices | Phantom Item |

## الفرق بين Product Structure وProduction Method

هذا تفريق حاسم:

- Product Structure = What goes into the product
- Production Method = How the product is made

إذا خلطت بينهما، سيتشوش عندك لاحقًا الفرق بين:

- BOM وRoute
- Item Structure وWork Definition
- Components وOperations

## أثر Product Structure على التخطيط Planning

النظام يستخدم هذه البنية ليعرف:

- ما المواد المطلوبة
- كم الكمية المطلوبة
- ما إذا كانت هناك منتجات نصف مصنعة
- هل يوجد احتياج إضافي بسبب Scrap

لذلك أي خطأ هنا سيظهر في MRP أو Master Planning أو Supply Proposals.

## أثر Product Structure على الصرف Material Issue

عند التنفيذ، النظام أو المستخدم ينظر إلى Structure ليعرف:

- ماذا سيصرف
- كم سيصرف
- هل توجد بدائل أو مواد وسيطة
- هل الصرف يدوي أو تلقائي يرتبط لاحقًا بالتصميم التنفيذي

## أثر Product Structure على التكلفة Costing

تكلفة المواد Material Cost تبدأ من هنا.

إذا كانت Structure ناقصة أو مضخمة أو تحتوي كميات خاطئة، فالتكلفة ستكون خاطئة حتى لو كان التنفيذ جيدًا.

## منظور المستشار Functional Consultant View

اسأل دائمًا:

- هل هذه BOM أو Structure تمثل الواقع فعلًا؟
- هل يوجد Subassembly غير مفهوم؟
- هل الهالك Scrap محسوب؟
- هل توجد Versions أو Alternatives؟
- هل الكميات ووحدات القياس منطقية؟

أغلب الانحرافات الكبيرة تبدأ من Product Structure غير دقيقة.

## الأخطاء الشائعة Common Mistakes

1. كتابة BOM كقائمة مواد نظرية فقط.
2. نسيان Scrap.
3. إهمال Subassemblies.
4. الخلط بين Phantom وSubassembly المستقل.
5. اعتبار Formula مجرد اسم آخر لـ BOM في كل الحالات.

## المراجعة السريعة Quick Review

- BOM وItem Structure وFormula كلها تدور حول مكونات المنتج.
- Structure تؤثر على Planning وIssue وCosting.
- Quantity وUoM وVersion وScrap عناصر حاسمة.
- Product Structure لا تشرح كيف يُصنع المنتج، بل ماذا يدخل فيه.

## مهمة الدرس Study Task

اختر منتجًا بسيطًا، ثم اكتب له Structure مصغرة تشمل:

1. 3 إلى 5 Components
2. Quantity and UoM لكل مكون
3. هل يوجد Scrap؟
4. هل يوجد Subassembly أو Phantom؟
5. ما أثر خطأ واحد في الكمية على Planning وCosting؟
