# الدرس 04: النسخ والاعتماد والحوكمة Versions, Approvals, and Governance

## لماذا هذا الدرس مهم

يمكنك أن تملك Product Structure جيدة وProduction Method جيدة، لكن إذا لم تكن النسخ Versions والاعتماد Approvals والحوكمة Governance مضبوطة، فسيظل النظام معرضًا للفوضى.

هذا الدرس مهم لأنه يشرح لماذا الأنظمة الكبيرة لا تكتفي بوجود BOM أو Route أو Work Definition، بل تهتم أيضًا بـ:

- Versioning
- Effective Dates
- Approval
- Activation
- Priority
- Change Control

## الهدف من الدرس

بعد إنهاء هذا الدرس يجب أن تكون قادرًا على:

1. فهم لماذا تحتاج الأنظمة الكبيرة إلى Versions وApprovals.
2. فهم معنى Effective Dates وAlternative definitions.
3. معرفة أثر غياب الحوكمة على Planning وExecution وCosting.
4. ربط هذا الموضوع بمسؤوليات المستشار عند التطبيق والتحليل.

## لماذا لا تكفي نسخة واحدة ثابتة دائمًا؟

المنتجات تتغير.

قد يتغير:

- مكون Material
- كمية Quantity
- مورد Resource
- طريقة تصنيع Method
- موقع Plant / Site / Organization
- صلاحية زمنية Effective Period
- بديل Production Alternative

إذا لم يكن النظام قادرًا على ضبط هذه التغيرات، فسيخلط بين القديم والجديد، ويخرج:

- Planning خاطئ
- Costing خاطئة
- أوامر إنتاج لا تمثل الواقع

## مفهوم Version

Version هي نسخة صالحة من تعريف معين، مثل:

- BOM Version in Dynamics
- Work Definition Version in Oracle
- Alternative BOM / Validity / Production Version context in SAP

النسخة Version تساعدك على الإجابة عن:

أي تعريف يستخدم؟
ومتى؟
ولأي منتج أو موقع أو كمية؟

## مفهوم Approval

Approval يعني أن التعريف لم يعد مجرد Draft أو اجتهاد شخصي.

بل أصبح معتمدًا للاستخدام التشغيلي أو التخطيطي أو التكاليفي.

في الأنظمة القوية، الاعتماد مهم جدًا لأن:

- BOM غير المعتمدة لا ينبغي أن تحكم التخطيط
- Route غير المعتمدة لا ينبغي أن تحدد التكلفة
- Work Definition غير المعتمدة لا ينبغي أن تنشئ Work Orders عشوائيًا

## مفهوم Activation

بعض الأنظمة لا تكتفي بالاعتماد Approval، بل تحتاج أيضًا إلى تفعيل Activation أو جعل النسخة هي الفعالة Effective / Active.

هذا يعني:

- ليست كل نسخة معتمدة هي النسخة المستخدمة افتراضيًا
- وقد توجد نسخة معتمدة لكن غير فعالة بعد

هذا مهم جدًا في Dynamics وفي فهم Alternative logic عمومًا.

## Effective Dates

Effective Start Date وEffective End Date تمنعان النظام من استخدام تعريف قديم أو مستقبلي في وقت غير مناسب.

هذا ضروري عندما:

- يتغير المنتج مع الوقت
- تتغير المواد من تاريخ معين
- تتغير طريقة التصنيع بعد مشروع تحسين
- تتغير السياسة بعد Go-Live

## Alternative Definitions

قد توجد بدائل مثل:

- Alternative BOM
- Alternate Work Definition
- Different routing path
- Different production option by quantity or site

البديل ليس دائمًا رفاهية.

قد يكون ضرورة حقيقية إذا اختلف:

- المصنع Plant
- الكمية Lot size
- المورد Resource availability
- المواد Material availability

## الحوكمة Governance

الحوكمة هنا تعني ببساطة:

من يملك الحق في:

- إنشاء التعريف؟
- تعديله؟
- اعتماده؟
- تفعيله؟
- إلغاءه أو استبداله؟

إذا لم تكن هذه الأدوار واضحة، ستظهر مشاكل مثل:

- تغييرات غير معلنة
- BOM مختلفة عن الواقع
- Costing لا تطابق التنفيذ
- أوامر إنتاج مبنية على نسخ قديمة

## كيف يظهر هذا في الأنظمة الثلاثة

| المفهوم | Dynamics 365 | Oracle Fusion Cloud | SAP S/4HANA |
| --- | --- | --- | --- |
| النسخ | BOM Version / Route Version | Work Definition Version | Alternative BOM / Validity / Production Version |
| الاعتماد | Approved | governed approval logic | release and validity logic |
| التفعيل | Active | effective version selection | valid version selection via production rules |
| الصلاحية الزمنية | Valid dates | Effective Start / End Dates | Validity Dates |
| البدائل | Alternative BOM / route possibilities | Alternate Work Definitions | Alternative BOM and Production Version logic |

## Production Version في SAP

هذه نقطة تستحق تثبيتًا خاصًا.

Production Version في SAP ليست مجرد رقم نسخة.

بل هي الرابط المنضبط بين:

- BOM
- Routing or Master Recipe
- Lot Size
- Validity Period

لذلك هي نقطة حوكمة وربط، لا مجرد وصف.

## Work Definition Version في Oracle

في Oracle، Versioning مهم جدًا لأن Work Definition نفسها كيان محوري.

إذا تغيرت طريقة الإنتاج، فمن الطبيعي أن تحتاج Version جديدة مع:

- Effective dates
- Priorities
- Controlled usage

## BOM Version في Dynamics

في Dynamics، BOM Version وApproved وActive من أهم المفاهيم لفهم لماذا قد تكون BOM موجودة في النظام لكن لا تستخدم فعليًا كما يتوقع المستخدم.

## منظور المستشار Functional Consultant View

عندما ترى مشكلة في الموديول، اسأل:

- هل التعريف الحالي هو النسخة الصحيحة؟
- هل هو Approved؟
- هل هو Active / Effective؟
- هل توجد Alternative definitions؟
- من عدله؟ ومتى؟
- هل التغيير وصل إلى التنفيذ والتكلفة معًا؟

هذه الأسئلة تفرق بين المستشار المنظم والمستشار الذي يكتفي بوصف المشكلة.

## الأخطاء الشائعة Common Mistakes

1. الاعتقاد أن وجود BOM واحدة يكفي دائمًا.
2. تجاهل Effective Dates.
3. عدم التفريق بين Approved وActive.
4. عدم وجود مالك Data Owner للتغيير.
5. تغيير Structure أو Method دون فهم أثره على Costing.

## المراجعة السريعة Quick Review

- Versions وApprovals وGovernance ليست أمورًا إدارية شكلية.
- هي وسيلة لحماية Planning وExecution وCosting من الفوضى.
- Dynamics وOracle وSAP تختلف في التطبيق، لكنها تشترك في الحاجة إلى التحكم في النسخ والصلاحية والاعتماد.
- غياب الحوكمة يؤدي إلى نظام غير موثوق حتى لو كان غنيًا بالوظائف.

## مهمة الدرس Study Task

اكتب سيناريو قصيرًا من 6 إلى 10 أسطر يشرح:

- كيف يمكن أن يؤدي استخدام نسخة BOM أو Work Definition قديمة إلى مشكلة في التخطيط أو التكلفة أو التنفيذ.

ثم اكتب تحت ذلك:

ما القواعد الثلاث التي يجب فرضها لمنع هذه المشكلة؟
