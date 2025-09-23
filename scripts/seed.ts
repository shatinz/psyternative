import { createUser } from '../db/users';
import { createPost } from '../db/posts';

async function seed() {
  // Create sample users
  await createUser({
    uid: 'user-1',
    username: 'کاربر نمونه',
    email: 'sample@example.com',
    avatarUrl: 'https://picsum.photos/seed/user1/100/100',
    hasChangedUsername: false,
  });

  await createUser({
    uid: 'user-2',
    username: 'ذهن کنجکاو',
    email: 'curious@example.com',
    avatarUrl: 'https://picsum.photos/seed/user2/100/100',
    hasChangedUsername: true,
  });

  // Create sample posts
  await createPost({
    postId: 'post-1',
    title: 'اولین تجربه من با مدیتیشن Mindfulness',
    content: 'امروز برای اولین بار مدیتیشن Mindfulness را امتحان کردم. تمرکز بر روی تنفس در ابتدا کمی سخت بود، اما بعد از چند دقیقه، احساس آرامش عجیبی پیدا کردم. انگار تمام افکار مزاحم برای مدتی ناپدید شدند. شما هم چنین تجربه‌ای داشته‌اید؟',
    authorUid: 'user-1',
    sectionSlug: 'meditation',
  });

  await createPost({
    postId: 'post-2',
    title: 'اهمیت "Set and Setting" در تجربیات روانگردان',
    content: 'یکی از مهم‌ترین مفاهیمی که قبل از هر تجربه‌ای باید در نظر گرفت، "Set and Setting" یا آمادگی ذهنی و محیط است. این دو عامل می‌توانند به شدت بر کیفیت و نتیجه تجربه تأثیر بگذارند. تجربیات شما در این زمینه چیست؟',
    authorUid: 'user-2',
    sectionSlug: 'psychedelics',
  });

  await createPost({
    postId: 'post-3',
    title: 'رویای تکراری در مورد پرواز',
    content: 'چندین سال است که به طور متناوب رویای پرواز می‌بینم. همیشه حس آزادی و قدرت زیادی در این رویاها دارم. آیا کسی تفسیر یا تجربه‌ی مشابهی دارد؟',
    authorUid: 'user-1',
    sectionSlug: 'dreams',
  });

  await createPost({
    postId: 'post-4',
    title: 'آیاهواسکا و سنت‌های آمازون',
    content: 'آیاهواسکا، نوشیدنی مقدس شمن‌های آمازون، تاریخچه‌ای غنی و کاربردهای درمانی عمیقی دارد. مطالعه در مورد دانش سنتی پیرامون این گیاه بسیار جذاب است.',
    authorUid: 'user-2',
    sectionSlug: 'ethnobotany',
  });

  console.log('Sample data inserted successfully');
}

seed().catch(console.error);