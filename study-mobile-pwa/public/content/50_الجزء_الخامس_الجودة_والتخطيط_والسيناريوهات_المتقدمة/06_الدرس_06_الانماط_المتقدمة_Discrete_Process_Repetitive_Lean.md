# الدرس 06: الأنماط المتقدمة Discrete Process Repetitive Lean

## لماذا هذا الدرس مهم

لأن كلمة Manufacturing لا تعني نمطًا واحدًا. بعض العملاء يصنعون منتجات منفصلة Discrete، وبعضهم يعملون بوصفات ودفعات Process، وبعضهم إنتاجهم متكرر ومستقر Repetitive، وبعضهم يعتمدون منطق Lean أو تدفقات مبسطة. إذا لم تميز بين هذه الأنماط، فستقترح تصميمًا جيدًا لنوع مصنع وخاطئًا لمصنع آخر.

## الهدف من الدرس

بعد هذا الدرس يجب أن تكون قادرًا على:

- شرح الفروق الأساسية بين Discrete وProcess وRepetitive وLean patterns.
- فهم أثر كل نمط على Master Data والتنفيذ والتكلفة.
- معرفة لماذا لا تصلح نفس درجة التفصيل لكل البيئات.
- طرح أسئلة discovery تكشف نمط التصنيع الحقيقي عند العميل.

## الشرح المفاهيمي الأساسي

### Discrete Manufacturing

يناسب المنتجات المنفصلة التي يمكن عدها كوحدات واضحة، مثل الأجهزة أو القطع أو التجميعات.

يركز عادة على:

- BOM
- Routing
- Production Order
- Component issue
- Operation confirmation

### Process Manufacturing

يناسب الصناعات التي تقوم على وصفة أو Formula أو Batch، مثل الأغذية أو الكيماويات أو الصناعات التي تنتج بمقادير ونسب وعوائد Yield مختلفة.

يركز عادة على:

- Formula
- Yield
- Batch tracking
- Co-products / By-products
- Process orders or batch-style logic

### Repetitive Manufacturing

يناسب البيئات ذات الإنتاج العالي المتكرر والمنتجات المستقرة وخطوط الإنتاج المنتظمة، حيث تكون الحاجة إلى أوامر تفصيلية لكل وحدة أقل، وتصبح السرعة والبساطة أهم.

### Lean Patterns

تشير إلى منطق تشغيل يركز على التدفق Flow وتقليل الهدر وتقليل التعقيد الإداري، وقد يعتمد على آليات أبسط من أوامر الإنتاج التقليدية في بعض السيناريوهات.

## ما الذي يتغير بين هذه الأنماط؟

| الجانب | Discrete | Process | Repetitive / Lean |
| --- | --- | --- | --- |
| تعريف المنتج | BOM | Formula / Process structure | أبسط أو أكثر تكرارًا |
| التنفيذ | Order-centric | Batch / process-centric | Flow-centric أو repetitive |
| المخرجات | غالبًا منتج رئيسي واحد | قد توجد Co/By-products | تركيز على التدفق والكميات |
| التتبع | Component / serial / order | Batch / yield / genealogy | حسب الصناعة والنضج |
| التكلفة | Order-based غالبًا | Output distribution أكثر تعقيدًا | قد تكون دورية أو مبسطة نسبيًا |

## كيف يظهر المفهوم في الأنظمة الثلاثة

### Dynamics 365

Dynamics يتميز بقدرته على دعم أكثر من نمط، مثل Discrete وProcess وLean. وهذا يجعله مرنًا، لكنه يفرض على المستشار أن يعرف متى يستخدم BOM وRoute، ومتى ينتقل إلى Formula وBatch order، ومتى تكون ميزات متقدمة مثل Lean ذات معنى فعلي.

### Oracle Fusion Cloud

Oracle يفرق بوضوح بين Discrete وProcess وMixed-Mode عبر Work Method وPlant Parameters وOperation Outputs وProcess Work Definitions. لذلك فإن اكتشاف نمط العميل مبكرًا أمر حاسم في التصميم.

### SAP S/4HANA

في SAP تظهر الفروق بين Production Orders وProcess Orders وRepetitive Manufacturing، ويصبح اختيار النموذج مرتبطًا بقوة بـ Material Master وMRP وMaster Recipe وProduction Version وطرق التسوية والتكلفة.

## منظور المستشار Functional Consultant View

اسأل العميل:

- هل المنتج يعد كوحدات منفصلة أم يصنع كوصفة أو دفعة؟
- هل توجد خطوط إنتاج مستقرة ومتكررة جدًا؟
- هل تحتاجون أوامر تفصيلية لكل عملية أم تدفقًا أبسط؟
- هل المخرجات متعددة أم مفردة؟
- هل التتبع يركز على order history أم lot genealogy أم output flow؟

هذه الأسئلة تمنعك من تحميل العميل تعقيدًا لا يحتاجه، أو من تبسيط مفرط يخفي متطلبات حقيقية.

## الأخطاء الشائعة Common Mistakes

- افتراض أن كل التصنيع هو discrete manufacturing.
- التعامل مع process environment بمنطق order BOM التقليدي فقط.
- فرض تعقيد order-level عالٍ على بيئة repetitive مستقرة.
- استخدام مصطلحات Lean كشعار من دون فهم أثرها على المعاملات الفعلية.
- عدم مراجعة أثر النمط المختار على التكلفة والتتبع والجودة.

## المراجعة السريعة Quick Review

- لا يوجد Manufacturing pattern واحد يناسب الجميع.
- Discrete وProcess وRepetitive وLean تختلف في المنطق والبيانات والتنفيذ.
- اختيار النمط الصحيح ينعكس على كل شيء بعده.
- discovery الجيد يبدأ من فهم نمط التصنيع الحقيقي لا من اسم الموديول.

## مهمة الدرس Study Task

اكتب مقارنة مختصرة بين مصنع تجميع إلكتروني ومصنع أغذية ومصنع إنتاج متكرر عالي الحجم، ثم حدد أي نمط أقرب لكل واحد ولماذا.
