# الدرس 01: من الطلب إلى أمر الإنتاج Production Order and Statuses

## لماذا هذا الدرس مهم

لأن كثيرًا من المتعلمين يفهمون الإنتاج على أنه يبدأ من صرف المواد Material Issue، بينما الحقيقة أن التنفيذ يبدأ منطقيًا قبل ذلك بكثير: عند تحويل الطلب أو الخطة إلى أمر إنتاج Production Order أو Work Order قابل للإدارة.

إذا لم تفهم حالات الأمر Statuses، فستختلط عليك الأسئلة التالية:

- متى يكون الأمر مجرد نية تنفيذ وليس تنفيذًا فعليًا؟
- متى يصبح الأمر جاهزًا للصالة أو shop floor؟
- متى يسمح النظام بالحركات المخزنية أو التشغيلية؟
- كيف نفرق بين التأخر في التخطيط وبين التأخر في التنفيذ؟

## الهدف من الدرس

بعد هذا الدرس يجب أن تكون قادرًا على:

- شرح معنى Production Order وWork Order وPlanned Order.
- التمييز بين مرحلة التخطيط ومرحلة التنفيذ.
- فهم الحالات الأساسية مثل Created وUnreleased وReleased وStarted وCompleted وClosed.
- تفسير لماذا لا يعني إنشاء الأمر أن التكلفة أو WIP قد بدأت فعليًا.

## الشرح المفاهيمي الأساسي

أمر الإنتاج Production Order هو الوعاء التنفيذي الذي يجمع بين:

- المنتج المطلوب تصنيعه.
- الكمية Quantity.
- التواريخ Dates.
- المواد المطلوب استهلاكها Components.
- العمليات Operations.
- الموارد Resources.
- الأثر التشغيلي والمخزني والتكلفي لاحقًا.

لكن يجب أن تفرق بين ثلاثة مستويات:

### 1. الطلب Demand

هو الحاجة التجارية أو التخطيطية، مثل:

- Sales Order
- Forecast
- Planned demand
- Replenishment need

### 2. المقترح التخطيطي Planning Proposal

قد يظهر على شكل:

- Planned Order في SAP
- Planned production أو planned supply concept في أنظمة أخرى
- Supply suggestion من التخطيط

هذا المستوى لم يدخل التنفيذ بعد.

### 3. الأمر التنفيذي Execution Order

قد يظهر باسم:

- Production Order
- Work Order
- Process Order

وهنا تبدأ دورة تنفيذ حقيقية يمكن مراقبتها وتشغيليًا ومحاسبيًا.

## دورة الحالات Status Lifecycle

رغم اختلاف الأسماء بين الأنظمة، فالفكرة العامة تكاد تكون واحدة:

| الحالة العامة | المعنى العملي | هل يسمح بالتنفيذ؟ |
| --- | --- | --- |
| Planned | اقتراح تخطيطي | لا |
| Created / Unreleased | أمر أُنشئ لكنه لم يطلق | لا أو بشكل محدود جدًا |
| Released | أمر جاهز للتنفيذ | نعم |
| Started / In Process | بدأ التنفيذ الفعلي | نعم |
| Completed / RAF / GR done | تم إنتاج الكمية أو جزء منها | جزئيًا حسب ما بقي |
| Closed | انتهت الدورة التشغيلية والحوكمية | لا |

الفكرة المهمة هنا هي أن Status ليست مجرد حقل شكلي، بل Gate أو Workflow Guard يحدد:

- ما الذي يسمح به النظام.
- ما الذي يمنعه.
- من المخول بالتقدم إلى المرحلة التالية.
- ما التقارير التي يجب أن تراقب الأوامر العالقة في كل حالة.

## كيف يظهر المفهوم في الأنظمة الثلاثة

### Dynamics 365

في Dynamics 365 تمر الأوامر عادة عبر:

- Created
- Estimated
- Scheduled
- Released
- Started
- Report as finished
- End / Close

Dynamics يضيف مرحلتي Estimated وScheduled بوضوح، وهذا يفيدك كمستشار لفصل:

- التقدير والتكلفة التقديرية Estimated cost
- الجاهزية الزمنية Scheduling readiness
- الجاهزية التشغيلية الفعلية Release

### Oracle Fusion Cloud

في Oracle يظهر الأمر باسم Work Order، وتكون الحالات المحورية عادة:

- Unreleased
- Released
- Completed
- Closed
- Canceled عند الحاجة

جوهر Oracle هنا أن Work Definition يسبق Work Order، وأن الأمر في حالة Unreleased ما زال في منطقة المراجعة وليس التنفيذ.

### SAP S/4HANA

في SAP توجد طبقة تخطيطية قوية قبل الأمر التنفيذي:

- Demand
- MRP
- Planned Order
- Conversion to Production Order
- CRTD / REL
- Confirmation / GR
- TECO / CLSD

قوة SAP هنا أنه يربط بوضوح بين التخطيط MRP وبين التنفيذ Production Order، فلا ينبغي لمستشار الإنتاج أن يشرح الأمر التنفيذي بمعزل عن Planned Orders.

## منظور المستشار Functional Consultant View

المستشار الجيد لا يسأل فقط: هل نستطيع إنشاء أمر إنتاج؟

بل يسأل:

- ما الحدث الذي أنشأ الأمر: Forecast أم Sales Order أم Min-Max أم MRP؟
- ما الحالات التي يجب أن يمر بها الأمر عند العميل؟
- هل يوجد Approval أو Review قبل Release؟
- من يملك صلاحية Release وStart وClose؟
- ما الحالات المعلقة التي يجب مراقبتها يوميًا؟

ومن زاوية Gap Analysis، يجب الانتباه إلى أن بعض العملاء يقولون:

- نحن نبدأ الإنتاج فور إنشاء الأمر.
- نحن لا نستخدم Planned Orders.
- نحن نريد تجاوز Release.

هذه ليست مجرد تفضيلات تشغيلية، بل قرارات تؤثر على:

- الرقابة الداخلية Internal Control.
- دقة المتابعة.
- قابلية التتبع Traceability.
- تحليل التأخير Bottlenecks.

## الأخطاء الشائعة Common Mistakes

- الخلط بين Planned Order وProduction Order.
- الاعتقاد أن Created يعني أن الإنتاج بدأ.
- بناء تقارير متابعة على الأوامر المغلقة فقط وإهمال الأوامر العالقة في حالات وسطية.
- عدم تعريف مسؤوليات واضحة بين من ينشئ الأمر ومن يطلقه ومن يغلقه.
- تجاهل أثر الحالة على الحركات المسموحة داخل النظام.

## المراجعة السريعة Quick Review

- الطلب Demand ليس أمرًا تنفيذيًا.
- المقترح التخطيطي Planning proposal ليس تنفيذًا فعليًا.
- Production Order أو Work Order هو الوعاء التنفيذي.
- الحالة Status تحدد ما إذا كان الأمر قابلًا للصرف والتنفيذ أو لا.
- فهم Lifecycle مهم قبل دراسة Material Issue وConfirmation وGoods Receipt.

## مهمة الدرس Study Task

اكتب مقارنة قصيرة تشرح فيها الفرق بين:

- Demand
- Planned Order
- Production Order / Work Order

ثم اشرح كيف يمكن أن يضلل تقرير ضعيف الإدارة إذا جمع هذه الكيانات الثلاثة في قائمة واحدة دون تمييز.
