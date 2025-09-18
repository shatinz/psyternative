import type { ExperienceReport, Comment, ExperienceCategory } from "@/types";

let experiences: ExperienceReport[] = [
  {
    id: "1",
    title: "اولین سفر من با سیلوسایبین",
    author: "آریا",
    createdAt: new Date("2023-04-12T10:00:00Z"),
    reportText: "این یک تجربه عمیق و دگرگون کننده بود. رنگ ها بسیار زنده بودند و حس عمیقی از ارتباط با طبیعت داشتم. در ابتدا کمی اضطراب داشتم اما به تدریج آرامش یافتم و سفری درونی را آغاز کردم. مفاهیم پیچیده ای در مورد زندگی و جهان هستی برایم آشکار شد که هنوز در حال پردازش آنها هستم.",
    experienceType: "psychedelics",
    summary: "تجربه اول با سیلوسایبین که منجر به درک عمیق‌تر طبیعت و ارتباط با جهان شد.",
    comments: [
      { id: "c1", author: "سارا", createdAt: new Date("2023-04-12T12:30:00Z"), text: "خیلی جالب بود! من هم تجربه مشابهی داشتم." },
      { id: "c2", author: "نیما", createdAt: new Date("2023-04-13T09:15:00Z"), text: "ممنون که به اشتراک گذاشتی. به نظر قدرتمند میاد." },
    ],
  },
  {
    id: "2",
    title: "رویای پرواز بر فراز شهر",
    author: "لیلا",
    createdAt: new Date("2023-05-20T23:00:00Z"),
    reportText: "در خواب دیدم که می‌توانم پرواز کنم. از پنجره اتاقم بیرون پریدم و بر فراز شهر شناور شدم. همه چیز از بالا کوچک و آرام به نظر می‌رسید. حس آزادی و رهایی داشتم که هرگز در بیداری تجربه نکرده بودم. به سمت ابرها رفتم و در میان آنها چرخیدم. وقتی بیدار شدم، هنوز حس سبکی و شادی با من بود.",
    experienceType: "dreams",
    summary: "تجربه رویای پرواز که حس آزادی و رهایی بی‌نظیری را به همراه داشت.",
    comments: [],
  },
  {
    id: "3",
    title: "ده روز مدیتیشن ویپاسانا",
    author: "بهنام",
    createdAt: new Date("2023-06-01T18:00:00Z"),
    reportText: "شرکت در دوره ده روزه ویپاسانا چالش برانگیزترین و در عین حال پربارترین کاری بود که انجام دادم. روزهای اول با درد فیزیکی و آشفتگی ذهنی همراه بود. به تدریج یاد گرفتم که چگونه مشاهدگر افکار و احساساتم باشم بدون اینکه درگیر آنها شوم. در روزهای پایانی به آرامش عمیقی دست یافتم و نگاهم به زندگی تغییر کرد.",
    experienceType: "meditation",
    summary: "گزارش یک دوره ده روزه مدیتیشن ویپاسانا و تاثیرات عمیق آن بر ذهن و آرامش درونی.",
    comments: [
      { id: "c3", author: "مریم", createdAt: new Date("2023-06-02T11:00:00Z"), text: "همیشه دوست داشتم ویپاسانا رو امتحان کنم. ممنون از گزارشت." },
    ],
  },
];

// --- Data Access Functions ---

export function getExperiences(query?: string, category?: ExperienceCategory): ExperienceReport[] {
    let filteredExperiences = [...experiences];

    if (category) {
        filteredExperiences = filteredExperiences.filter(e => e.experienceType === category);
    }
    
    if (query) {
        const lowercasedQuery = query.toLowerCase();
        filteredExperiences = filteredExperiences.filter(e => 
            e.title.toLowerCase().includes(lowercasedQuery) ||
            e.reportText.toLowerCase().includes(lowercasedQuery) ||
            e.author.toLowerCase().includes(lowercasedQuery)
        );
    }

    return filteredExperiences.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function getExperienceById(id: string): ExperienceReport | undefined {
  return experiences.find((e) => e.id === id);
}

export function createExperience(data: { title: string; reportText: string; experienceType: ExperienceCategory; summary: string }): ExperienceReport {
  const newExperience: ExperienceReport = {
    id: (experiences.length + 1).toString(),
    author: "کاربر جدید", // In a real app, this would come from auth
    createdAt: new Date(),
    comments: [],
    ...data,
  };
  experiences.unshift(newExperience);
  return newExperience;
}

export function addComment(experienceId: string, data: { text: string }): Comment | null {
    const experience = getExperienceById(experienceId);
    if (!experience) return null;

    const newComment: Comment = {
        id: `c${Math.random().toString(36).substring(2, 9)}`,
        author: "ناشناس", // In a real app, this would come from auth
        createdAt: new Date(),
        ...data,
    };
    experience.comments.push(newComment);
    return newComment;
}
