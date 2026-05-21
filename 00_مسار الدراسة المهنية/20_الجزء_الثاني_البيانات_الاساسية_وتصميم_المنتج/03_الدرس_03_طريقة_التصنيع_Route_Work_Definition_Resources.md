# الدرس 03: طريقة التصنيع Route / Work Definition / Resources

## لماذا هذا الدرس مهم

بعد أن عرفت ماذا يدخل في المنتج Product Structure، يجب أن تعرف الآن كيف يُصنع هذا المنتج Production Method.

وهنا تبدأ مفاهيم مثل:

- Route / Routing
- Operations
- Resources
- Work Center
- Work Definition
- Activity and Time Standards

هذا الجزء هو الجسر بين التصميم النظري والتنفيذ الفعلي.

## الهدف من الدرس

بعد إنهاء هذا الدرس يجب أن تكون قادرًا على:

1. فهم الفرق بين Product Structure وProduction Method.
2. فهم معنى Route وOperation وResource وWork Center.
3. فهم معنى Work Definition في Oracle ولماذا هو مفهوم محوري.
4. ربط طريقة التصنيع بالجدولة Scheduling والتكلفة Costing والتنفيذ Execution.

## Production Method: كيف يصنع المنتج؟

إذا كانت BOM تقول لك:

What goes into the product?

فإن Route أو Work Definition تقول لك:

How is the product made?

أي:

- ما الخطوات؟
- بأي ترتيب؟
- في أي مركز عمل؟
- بأي موارد؟
- بأي وقت؟
- وبأي أثر تكلفي؟

## Route / Routing

Route أو Routing هي سلسلة العمليات Operations التي يمر بها المنتج.

مثال:

- قص Cutting
- تجميع Assembly
- دهان Painting
- فحص Quality Check
- تعبئة Packing

في الأنظمة القوية، Route ليست وصفًا نصيًا فقط.

بل كيان يحمل:

- Sequence
- Operation logic
- Time standards
- Resource usage
- Cost implications

## Operation

Operation هي خطوة إنتاجية محددة داخل Route.

العملية قد ترتبط بـ:

- Work Center
- Resource
- Duration
- Setup Time
- Run Time
- Cost Category or Activity

كل Operation ليست مجرد سطر، بل نقطة مهمة في:

- Scheduling
- Execution tracking
- Cost accumulation

## Resource

Resource هو ما يستخدم لتنفيذ العملية.

قد يكون:

- Machine
- Labor
- Tool
- External service
- Capacity-related entity

في Oracle يظهر Resource بوضوح ضمن Work Centers وOperation Resources.

في SAP قد يكون المفهوم موزعًا أكثر بين Work Center وActivity Type وCost Center.

في Dynamics يظهر عبر Resources وResource Groups.

## Work Center

Work Center هو المكان أو الوحدة التشغيلية التي تنفذ فيها العملية.

أهميته ليست تشغيلية فقط، بل أيضًا:

- Scheduling
- Capacity
- Costing
- Productivity analysis

## Time Standards

من العناصر المهمة جدًا في طريقة التصنيع:

- Setup Time
- Run Time
- Machine Time
- Labor Time
- Queue / Wait / Move in some systems

هذه الأوقات تؤثر على:

- الجدولة Scheduling
- الموعد المتوقع Lead Time
- تكلفة التشغيل Operation Cost

## Work Definition في Oracle

Work Definition هو أحد أهم مفاهيم Oracle Manufacturing.

لماذا؟

لأنه يجمع في مكان واحد تقريبًا:

- Item Structure side
- Operations
- Resources
- Outputs
- Versioning
- Production Priority
- Costing Priority

بمعنى آخر:

Oracle يميل إلى تقديم تعريف أكثر تكاملًا لطريقة الإنتاج بدل الفصل الحاد بين BOM وRouting كما يظهر بوضوح في أنظمة أخرى.

يجب أن تحفظ هذا جيدًا:

Work Definition is not just another route.

هو Integrated Production Definition.

## كيف يظهر هذا في الأنظمة الثلاثة

| المفهوم | Dynamics 365 | Oracle Fusion Cloud | SAP S/4HANA |
| --- | --- | --- | --- |
| طريقة التصنيع | Route | Work Definition | Routing |
| العملية | Operation | Operation | Operation |
| مورد التنفيذ | Resource | Resource | Activity / Work Center related resource logic |
| مركز العمل | Resource Group / Work Center context | Work Center | Work Center |
| الزمن القياسي | Setup / Run and related times | Operation and resource usage logic | Standard Values |
| الربط بالتكلفة | Cost Categories | Resource charges / costing priorities | Activity Types / Cost Center / KP26 |

## الفرق بين BOM وRoute / Work Definition

- BOM or Structure = What goes in
- Route or Work Definition = How it is made

هذا الفرق يجب أن يصبح بديهيًا عندك.

## أثر Production Method على الجدولة Scheduling

إذا كانت الطريقة غير مضبوطة، ستظهر مشاكل مثل:

- مواعيد غير واقعية
- تحميل خاطئ للموارد
- تضارب في Work Centers
- فهم ناقص للمدة الحقيقية للأمر

## أثر Production Method على التكلفة Costing

تكلفة التشغيل لا تأتي من المواد فقط.

بل من:

- Labor
- Machine
- Setup
- Resource consumption
- External processing when relevant

إذن أي ضعف في Route أو Work Definition أو Resources سيعطي Actual Cost أو Standard Cost غير موثوقة.

## أثر Production Method على التنفيذ Execution

من دون طريقة تصنيع واضحة، يصبح التنفيذ فعليًا:

- صرف مواد فقط
- استلام منتج فقط
- دون منطق Operations
- دون Resource Tracking
- دون فهم حقيقي للفرق بين المتوقع والفعلي

## منظور المستشار Functional Consultant View

اسأل دائمًا:

- هل توجد مراحل واضحة فعلًا؟
- هل هي Operations منطقية أم وصف عام فقط؟
- هل Work Centers وResources حقيقية أم شكلية؟
- هل الزمن القياسي واقعي؟
- هل هذه الطريقة تؤثر على التكلفة فعلًا أم لا؟

إذا لم تكن Production Method واضحة، فالموديول كله سيبقى سطحيًا حتى لو كانت BOM ممتازة.

## الأخطاء الشائعة Common Mistakes

1. الخلط بين BOM وRoute.
2. كتابة العمليات كعناوين فقط دون منطق تنفيذي.
3. تجاهل Resources.
4. استخدام Work Center شكلي بلا أثر على التكلفة أو الجدولة.
5. اعتبار Work Definition في Oracle مجرد اسم بديل لـ Route، وهذا غير دقيق.

## المراجعة السريعة Quick Review

- Production Method تشرح كيف يصنع المنتج.
- Route / Routing وOperations وResources وWork Centers عناصر محورية.
- Oracle يتميز بمفهوم Work Definition كتعريف متكامل.
- ضعف هذا الجانب يعني Scheduling وCosting وExecution أضعف.

## مهمة الدرس Study Task

تخيل منتجًا بسيطًا يمر بثلاث مراحل تصنيع.

اكتب:

1. أسماء العمليات Operations
2. Work Center لكل عملية
3. Resource لكل عملية
4. الزمن المتوقع لكل عملية
5. كيف يمكن أن يؤثر خطأ في إحدى العمليات على Scheduling وCosting؟
