import type { User, Section, Post, Reply } from './types';
import { BrainCircuit, Dna, Leaf, Moon } from 'lucide-react';

export const mockUser: User = {
  id: 'user-1',
  name: 'کاربر نمونه',
  avatarUrl: 'https://picsum.photos/seed/user1/100/100',
  hasChangedUsername: false,
};

export const anotherUser: User = {
  id: 'user-2',
  name: 'ذهن کنجکاو',
  avatarUrl: 'https://picsum.photos/seed/user2/100/100',
  hasChangedUsername: true,
};

export const sections: Section[] = [
  {
    name: 'مدیتیشن',
    slug: 'meditation',
    description: 'گفتگو در مورد تکنیک‌ها، تجربیات و فواید مدیتیشن.',
    icon: Moon,
  },
  {
    name: 'روانگردان‌ها',
    slug: 'psychedelics',
    description: 'بحث در مورد استفاده ایمن، کاهش آسیب و اکتشافات علمی.',
    icon: Dna,
  },
  {
    name: 'رویاها',
    slug: 'dreams',
    description: 'اشتراک‌گذاری رویاها، رویاهای شفاف و تفسیر آنها.',
    icon: BrainCircuit,
  },
  {
    name: 'اتنوبوتانی',
    slug: 'ethnobotany',
    description: 'کاوش در گیاهان مقدس و دانش سنتی فرهنگ‌های مختلف.',
    icon: Leaf,
  },
];

const replies: Reply[] = [
  {
    id: 'reply-1',
    author: anotherUser,
    content:
      'تجربه بسیار جالبی بود! من هم اخیراً مدیتیشن را شروع کرده‌ام و تأثیرات مثبتی در کاهش استرسم دیده‌ام. از چه تکنیکی بیشتر استفاده می‌کنی؟',
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
  },
];

export const posts: Post[] = [
  {
    id: 'post-1',
    title: 'اولین تجربه من با مدیتیشن Mindfulness',
    author: mockUser,
    content:
      'امروز برای اولین بار مدیتیشن Mindfulness را امتحان کردم. تمرکز بر روی تنفس در ابتدا کمی سخت بود، اما بعد از چند دقیقه، احساس آرامش عجیبی پیدا کردم. انگار تمام افکار مزاحم برای مدتی ناپدید شدند. شما هم چنین تجربه‌ای داشته‌اید؟',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    sectionSlug: 'meditation',
    replies: replies,
  },
  {
    id: 'post-2',
    title: 'اهمیت "Set and Setting" در تجربیات روانگردان',
    author: anotherUser,
    content:
      'یکی از مهم‌ترین مفاهیمی که قبل از هر تجربه‌ای باید در نظر گرفت، "Set and Setting" یا آمادگی ذهنی و محیط است. این دو عامل می‌توانند به شدت بر کیفیت و نتیجه تجربه تأثیر بگذارند. تجربیات شما در این زمینه چیست؟',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    sectionSlug: 'psychedelics',
    replies: [],
  },
  {
    id: 'post-3',
    title: 'رویای تکراری در مورد پرواز',
    author: mockUser,
    content:
      'چندین سال است که به طور متناوب رویای پرواز می‌بینم. همیشه حس آزادی و قدرت زیادی در این رویاها دارم. آیا کسی تفسیر یا تجربه‌ی مشابهی دارد؟',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    sectionSlug: 'dreams',
    replies: [],
  },
  {
    id: 'post-4',
    title: 'آیاهواسکا و سنت‌های آمازون',
    author: anotherUser,
    content:
      'آیاهواسکا، نوشیدنی مقدس شمن‌های آمازون، تاریخچه‌ای غنی و کاربردهای درمانی عمیقی دارد. مطالعه در مورد دانش سنتی پیرامون این گیاه بسیار جذاب است.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
    sectionSlug: 'ethnobotany',
    replies: [],
  },
];
