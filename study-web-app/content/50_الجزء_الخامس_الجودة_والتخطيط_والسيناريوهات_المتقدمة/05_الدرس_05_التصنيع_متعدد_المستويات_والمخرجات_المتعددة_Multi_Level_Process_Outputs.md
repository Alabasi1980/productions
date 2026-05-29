# الدرس 05: التصنيع متعدد المستويات والمخرجات المتعددة Multi Level Process Outputs

## لماذا هذا الدرس مهم

لأن بعض البيئات لا تنتج منتجًا واحدًا بسيطًا من مواد بسيطة. بل توجد مستويات متعددة من التجميعات Multi-level BOM، أو بيئات Process Manufacturing تنتج أكثر من مخرج من نفس الأمر، أو منتجات ثانوية يجب تسجيلها وتكلفتها. هذه المنطقة هي بداية الانتقال من التصنيع الأساسي إلى التصنيع المتقدم.

## الهدف من الدرس

بعد هذا الدرس يجب أن تكون قادرًا على:

- شرح معنى Multi-level BOM أو multi-level product structure.
- فهم الفرق بين المنتج الرئيسي والـ Co-products والـ By-products.
- إدراك متى نستخدم Formula أو Process definition بدل BOM التقليدية.
- تفسير أثر هذه السيناريوهات على التخطيط والتنفيذ والتكلفة.

## الشرح المفاهيمي الأساسي

### Multi-level BOM

عندما يكون المنتج النهائي مكونًا من Subassemblies أو منتجات وسيطة، فنحن لا نتعامل مع BOM ذات مستوى واحد فقط، بل مع عدة مستويات مترابطة.

هذا يعني أن النظام قد يحتاج إلى:

- تفجير الطلب عبر مستويات متعددة
- إنشاء أو اقتراح أوامر فرعية
- تنسيق التوقيت بين المكونات والمنتج النهائي
- حساب تكلفة متدرجة من الأدنى إلى الأعلى

### Co-products

Co-products هي مخرجات رئيسية متعددة تخرج من نفس أمر الإنتاج أو نفس الدفعة التصنيعية.

### By-products

By-products هي مخرجات ثانوية تنتج أثناء العملية، وقد يكون لها قيمة أقل أو استخدام مختلف، لكنها ليست نفاية خالصة بالضرورة.

### Formula وProcess Manufacturing

في بعض الصناعات، BOM التقليدية لا تكفي. تحتاج إلى:

- Formula
- Yield logic
- Operation outputs
- Cost distribution across outputs

وهنا يصبح التفكير مختلفًا عن التصنيع التجميعي Discrete manufacturing.

## كيف يظهر المفهوم في الأنظمة الثلاثة

### Dynamics 365

في Dynamics يظهر Multi-level logic عبر BOM levels وPegged supply وPhantom وMaster Planning. أما في Process manufacturing فتظهر Formula وFormula Version وCo-products وBy-products وBatch balancing وتوزيع التكلفة بين المخرجات.

### Oracle Fusion Cloud

في Oracle يظهر ذلك عبر Item Structure وSubassemblies وProcess Work Definitions وOperation Outputs وCo-products وBy-products. كما أن Process Manufacturing في Oracle يعتمد على تصميم أوضح للمخرجات المتعددة على مستوى العملية والتكلفة.

### SAP S/4HANA

في SAP يظهر Multi-level BOM بقوة في MRP وPlanned Orders وsubassemblies، بينما تظهر Co-products وBy-products وProcess Orders وMaster Recipe في بيئات التصنيع العملياتي. وهنا قد يكون توزيع التكلفة أكثر تعقيدًا من بيئات الإنتاج المنفصل.

## منظور المستشار Functional Consultant View

اسأل العميل:

- هل المنتج النهائي يحتوي Subassemblies تنتج داخليًا؟
- هل توجد أوامر فرعية مستقلة أم يتم التفجير داخل الأمر؟
- هل يوجد أكثر من مخرج رئيسي من نفس العملية؟
- هل توجد منتجات ثانوية يجب تسجيلها وتقييمها؟
- هل البيئة Discrete أم Process أم Mixed-Mode؟

هذه الأسئلة مهمة جدًا لأن فرض نموذج BOM بسيط على بيئة Process أو بيئة متعددة المخرجات سيولد تصميمًا غير دقيق من أول يوم.

## الأخطاء الشائعة Common Mistakes

- تمثيل بيئة Process على أنها BOM تقليدية فقط.
- تجاهل Co-products أو By-products في التصميم.
- إهمال أثر المخرجات المتعددة على التكلفة.
- عدم فهم متى نحتاج order explosion ومتى نحتاج pegged supply أو phantom logic.
- بناء تقارير إنتاج على المنتج الرئيسي فقط وإخفاء بقية المخرجات.

## المراجعة السريعة Quick Review

- Multi-level BOM تعني أن المنتج يتكون عبر مستويات مترابطة.
- Co-products وBy-products ليستا Scrap.
- Process manufacturing يحتاج منطقًا أوسع من BOM التقليدية.
- هذه السيناريوهات تؤثر على التخطيط والتنفيذ والتكلفة معًا.

## مهمة الدرس Study Task

اكتب فقرة تشرح الفرق بين:

- Subassembly
- Co-product
- By-product

ثم وضح لماذا يسبب الخلط بينها مشاكل في التنفيذ والتكلفة.
