
import { getExperiences, getUserByUsername } from "@/lib/data";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ExperienceCard from "@/components/experiences/experience-card";
import ProfileEditForm from "@/components/profile/profile-edit-form";

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const userProfile = await getUserByUsername(params.username);

  if (!userProfile) {
    notFound();
  }

  const userExperiences = await getExperiences().then(experiences => 
    experiences.filter(exp => exp.authorId === userProfile.uid)
  );

  const formattedJoinDate = new Date(userProfile.createdAt).toLocaleDateString("fa-IR", {
    year: 'numeric', month: 'long'
  });

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Card className="mb-12">
        <CardHeader className="flex flex-row items-center gap-6 space-y-0">
          <Avatar className="h-24 w-24">
            <AvatarFallback className="text-4xl">
              {userProfile.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="grid gap-1">
            <CardTitle className="font-headline text-4xl">{userProfile.displayName}</CardTitle>
            <p className="text-muted-foreground">@{userProfile.username}</p>
            <p className="text-sm text-muted-foreground">عضو از {formattedJoinDate}</p>
          </div>
        </CardHeader>
        <CardContent>
          {/* The ProfileEditForm is now a client component that handles its own auth check */}
          <ProfileEditForm userProfile={userProfile} />
        </CardContent>
      </Card>

      <section>
        <h2 className="font-headline text-3xl font-bold mb-6">تجربیات ثبت شده</h2>
        {userExperiences.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {userExperiences.map((exp) => (
              <ExperienceCard key={exp.id} experience={exp} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card rounded-lg">
            <p className="text-muted-foreground text-lg">
              این کاربر هنوز تجربه‌ای ثبت نکرده است.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
