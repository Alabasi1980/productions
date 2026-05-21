# الدرس 01: كيف تتكون تكلفة المنتج Cost Build Up

## لماذا هذا الدرس مهم

لأن كثيرًا من الناس يتعاملون مع تكلفة المنتج كأنها رقم نهائي يخرج من النظام بلا منطق واضح. في الواقع، تكلفة المنتج داخل ERP هي بناء تراكمي Cost Build Up يتكون من مواد وعمليات وموارد وتكاليف غير مباشرة وهالك. إذا لم تفهم هذا البناء، فلن تستطيع تفسير أي رقم تكلفة لاحقًا.

## الهدف من الدرس

بعد هذا الدرس يجب أن تكون قادرًا على:

- شرح المكونات الرئيسية لتكلفة المنتج.
- فهم الفرق بين Material Cost وOperation Cost وResource Cost وOverhead.
- تفسير لماذا تؤدي الأخطاء في Master Data إلى تكلفة مضللة.
- ربط Product Design وExecution Costing في صورة واحدة.

## الشرح المفاهيمي الأساسي

تكلفة المنتج عادة لا تأتي من مصدر واحد، بل من طبقات مترابطة:

| مكون التكلفة | معناه |
| --- | --- |
| Material Cost | تكلفة المواد المباشرة الداخلة في المنتج |
| Operation Cost | تكلفة العمليات والخطوات الإنتاجية |
| Resource Cost | تكلفة العمالة والآلات والموارد المستخدمة |
| Overhead | التكاليف غير المباشرة المحملة على المنتج |
| Scrap Impact | أثر الهالك والفاقد وإعادة التشغيل |

### Material Cost

هي تكلفة ما يدخل فعليًا في المنتج من مواد خام أو نصف مصنعة أو مكونات. مصدرها المنطقي يكون من:

- BOM
- Formula
- Item Structure

أي خطأ في الكمية أو الوحدة أو المادة نفسها ينعكس فورًا على تكلفة المنتج.

### Operation Cost

هي تكلفة الخطوات المطلوبة لصناعة المنتج. هذه التكلفة تعتمد على:

- Route
- Routing
- Work Definition operations
- Setup time
- Run time

### Resource Cost

هي تكلفة استخدام العمل Labor أو الآلة Machine أو المورد الخارجي External resource. هنا يظهر الربط بين التنفيذ الفعلي وبين التكلفة، لأن أي وقت إضافي أو استهلاك أعلى من المخطط يغيّر التكلفة الفعلية.

### Overhead

Overhead أو Indirect Cost هو الجزء الذي لا يظهر كمادة مباشرة أو وقت تشغيل مباشر، لكنه جزء حقيقي من تكلفة الإنتاج مثل:

- تكلفة المصنع العامة
- تكلفة الإشراف
- بعض تكاليف الطاقة أو الدعم
- تكاليف تحميل غير مباشر

### Scrap Impact

الهالك ليس مشكلة جودة فقط، بل جزء من التكلفة. عندما يزداد الفاقد أو يرتفع Rework، فإن تكلفة الوحدة الجيدة Good unit ترتفع غالبًا.

## كيف يظهر المفهوم في الأنظمة الثلاثة

### Dynamics 365

في Dynamics يظهر البناء التكلفي من خلال:

- BOM أو Formula للمواد
- Route وOperations وCost Categories للتشغيل
- Resources للعمالة والآلة
- Costing Sheet للأوفرهيد Overhead
- Scrap handling ضمن BOM أو Route أو Report as Finished

### Oracle Fusion Cloud

في Oracle يظهر البناء عبر:

- Item Structure وOperation Items
- Work Definition operations and resources
- Resource rates داخل Cost Accounting
- Plant Overhead وWork Center Overhead
- Scrap policy وOperation Yield وProduct Completion costing

### SAP S/4HANA

في SAP يظهر المفهوم عبر:

- BOM للمواد
- Routing وWork Center للعمليات
- Cost Center وActivity Type وKP26 لتسعير النشاط
- Overhead costing logic عند الحاجة
- Scrap settings وactual postings وvariance analysis

## منظور المستشار Functional Consultant View

عند الحديث مع العميل عن التكلفة، لا تقبل إجابة عامة مثل: نريد معرفة تكلفة المنتج.

بل اسأل:

- هل المقصود Standard Cost أم Actual Cost؟
- هل تريدون تكلفة على مستوى المنتج أم على مستوى الأمر Order-level cost؟
- هل تريدون تحميل Overhead؟ وعلى أي أساس؟
- هل تريدون عزل تكلفة Scrap وRework أم امتصاصها داخل تكلفة المنتج الجيد؟
- هل تتوقعون اختلاف التكلفة حسب الموقع Site أو المصنع Plant أو طريقة الإنتاج؟

هذه الأسئلة تمنعك من بناء حل شكله جيد لكنه غير قابل للتفسير أمام الإدارة والمالية.

## الأخطاء الشائعة Common Mistakes

- اختزال التكلفة في BOM فقط.
- تجاهل أثر الزمن والموارد على تكلفة المنتج.
- استخدام Overhead بلا منطق عمل واضح.
- عدم التفريق بين تكلفة الصنف Cost of item وتكلفة أمر الإنتاج Cost of order.
- اعتبار الهالك مشكلة جودة فقط لا جزءًا من التكلفة.

## المراجعة السريعة Quick Review

- تكلفة المنتج هي بناء تراكمي لا رقمًا معزولًا.
- المواد والعمليات والموارد والأوفرهيد والهالك كلها تدخل في الصورة.
- Master Data السيئة تعني Cost Build Up سيئًا.
- فهم بنية التكلفة يسبق فهم WIP وVariances.

## مهمة الدرس Study Task

اكتب مخططًا نصيًا يوضح كيف تنتقل تكلفة المنتج من:

- Product structure
- Production method
- Execution events

إلى رقم تكلفة يظهر في التقارير.
