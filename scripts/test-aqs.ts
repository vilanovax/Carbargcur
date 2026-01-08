/**
 * Test script for Answer Quality Engine (AQS)
 *
 * این اسکریپت برای تست End-to-End سیستم کیفیت پاسخ‌ها استفاده می‌شود
 */

import { db } from "../src/lib/db";
import { questions, answers, users, answerQualityMetrics, answerReactions, answerFlags } from "../src/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { recomputeAnswerQuality, getAnswerQualityDebug } from "../src/services/answerQuality.service";

async function main() {
  console.log("🧪 شروع تست Answer Quality Engine...\n");

  // 1. پیدا کردن یک سؤال
  const [question] = await db
    .select()
    .from(questions)
    .orderBy(desc(questions.createdAt))
    .limit(1);

  if (!question) {
    console.error("❌ هیچ سؤالی پیدا نشد!");
    process.exit(1);
  }

  console.log(`📝 سؤال انتخاب شده: "${question.title}" (ID: ${question.id})`);

  // 2. پیدا کردن یک کاربر (غیر از نویسنده سؤال)
  const [answerer] = await db
    .select()
    .from(users)
    .where((users) => eq(users.isAdmin, true))
    .limit(1);

  if (!answerer) {
    console.error("❌ هیچ کاربری برای پاسخ‌دهی پیدا نشد!");
    process.exit(1);
  }

  console.log(`👤 کاربر پاسخ‌دهنده: ${answerer.fullName || answerer.email}`);

  // 3. ایجاد یک پاسخ تست با محتوای غنی
  const testAnswerBody = `
برای محاسبه حقوق سال جدید باید به چند نکته توجه کنید:

۱. **حداقل دستمزد**: طبق مصوبه شورای عالی کار، حداقل دستمزد سال ۱۴۰۴ اعلام می‌شود.

۲. **حق مسکن و بن**: این موارد جداگانه محاسبه می‌شوند و مشمول کسورات نیستند.

۳. **فرمول محاسبه**:
   - حقوق پایه × ضریب سنوات
   - اضافه‌کاری = حقوق ساعتی × ۱.۴ × ساعات اضافی

۴. **مثال عملی**:
   اگر حقوق پایه ۱۵ میلیون تومان باشد و ۲۰ ساعت اضافه‌کاری داشته باشید:
   حقوق ساعتی = ۱۵,۰۰۰,۰۰۰ ÷ ۱۷۶ = ۸۵,۲۲۷ تومان
   اضافه‌کاری = ۸۵,۲۲۷ × ۱.۴ × ۲۰ = ۲,۳۸۶,۳۵۶ تومان

امیدوارم این توضیحات کمک‌تان کند.
`.trim();

  console.log("\n📤 در حال ایجاد پاسخ تست...");

  const [newAnswer] = await db
    .insert(answers)
    .values({
      questionId: question.id,
      authorId: answerer.id,
      body: testAnswerBody,
      helpfulCount: 0,
      expertBadgeCount: 0,
    })
    .returning();

  console.log(`✅ پاسخ ایجاد شد (ID: ${newAnswer.id})`);

  // 4. محاسبه AQS
  console.log("\n⚙️ در حال محاسبه AQS...");

  const aqsResult = await recomputeAnswerQuality(newAnswer.id, "SUBMIT");

  if (aqsResult) {
    console.log("\n📊 نتیجه AQS:");
    console.log(`   امتیاز کل: ${aqsResult.aqs}`);
    console.log(`   برچسب: ${aqsResult.label}`);
    if (aqsResult.breakdown) {
      console.log(`   Content Score: ${aqsResult.breakdown.content}`);
      console.log(`   Engagement Score: ${aqsResult.breakdown.engagement}`);
      console.log(`   Expert Score: ${aqsResult.breakdown.expert}`);
      console.log(`   Trust Score: ${aqsResult.breakdown.trust}`);
    }
  }

  // 5. دریافت اطلاعات دیباگ
  console.log("\n🔍 اطلاعات دیباگ:");
  const debugInfo = await getAnswerQualityDebug(newAnswer.id);

  if (debugInfo && debugInfo.signals) {
    console.log(`   طول متن: ${debugInfo.signals.content?.bodyLength || 0} کاراکتر`);
    console.log(`   دارای bullets: ${debugInfo.signals.content?.hasBullets || false}`);
    console.log(`   دارای مثال: ${debugInfo.signals.content?.hasExample || false}`);
    console.log(`   دارای کلمات تخصصی: ${debugInfo.signals.content?.hasDomainKeywords || false}`);
  }

  // 6. شبیه‌سازی واکنش سؤال‌کننده (helpful)
  console.log("\n👍 در حال ثبت واکنش helpful از طرف سؤال‌کننده...");

  await db.insert(answerReactions).values({
    answerId: newAnswer.id,
    userId: question.authorId,
    type: "helpful",
  });

  // محاسبه مجدد AQS بعد از واکنش
  const aqsAfterReaction = await recomputeAnswerQuality(newAnswer.id, "REACTION");

  if (aqsAfterReaction) {
    console.log(`   امتیاز جدید: ${aqsAfterReaction.aqs} (قبلی: ${aqsResult?.aqs})`);
    console.log(`   Engagement جدید: ${aqsAfterReaction.breakdown?.engagement || 0}`);
  }

  // 7. شبیه‌سازی accept پاسخ
  console.log("\n✅ در حال انتخاب به عنوان بهترین پاسخ...");

  await db.update(answers)
    .set({
      isAccepted: true,
      acceptedAt: new Date()
    })
    .where(eq(answers.id, newAnswer.id));

  // محاسبه مجدد AQS بعد از accept
  const aqsAfterAccept = await recomputeAnswerQuality(newAnswer.id, "ACCEPT");

  if (aqsAfterAccept) {
    console.log(`   امتیاز نهایی: ${aqsAfterAccept.aqs}`);
    console.log(`   برچسب نهایی: ${aqsAfterAccept.label}`);
  }

  // 8. خلاصه تست
  console.log("\n" + "=".repeat(50));
  console.log("📋 خلاصه تست:");
  console.log("=".repeat(50));
  console.log(`   سؤال ID: ${question.id}`);
  console.log(`   پاسخ ID: ${newAnswer.id}`);
  console.log(`   AQS اولیه: ${aqsResult?.aqs || 0}`);
  console.log(`   AQS بعد از واکنش: ${aqsAfterReaction?.aqs || 0}`);
  console.log(`   AQS نهایی (با accept): ${aqsAfterAccept?.aqs || 0}`);
  console.log(`   برچسب: ${aqsAfterAccept?.label || "NORMAL"}`);
  console.log("=".repeat(50));

  console.log("\n✅ تست با موفقیت انجام شد!");
  console.log(`\n🔗 صفحه دیباگ ادمین: http://localhost:3001/admin/qa/answers/${newAnswer.id}`);
  console.log(`🔗 صفحه سؤال: http://localhost:3001/app/qa/${question.id}`);

  process.exit(0);
}

main().catch((error) => {
  console.error("❌ خطا:", error);
  process.exit(1);
});
