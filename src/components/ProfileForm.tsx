import { useUpdateProfile } from "@/lib/hooks/data-hooks";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "./ui/skeleton";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";

interface ProfileFormProps {
  email?: string;
  nativeLanguage?: string;
  targetLanguage?: string;
  writingStyle?: string;
  writingPurpose?: string;
  selfAssessedLevel?: string;
  isLoading?: boolean;
}

const ProfileFormSkeleton = () => (
  <Card>
    <CardContent className="p-4 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-11 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-full" />
      </div>
      <Skeleton className="h-12 w-full" />
    </CardContent>
  </Card>
);

export function ProfileForm({
  email,
  nativeLanguage,
  targetLanguage,
  writingStyle,
  writingPurpose,
  selfAssessedLevel,
  isLoading,
}: ProfileFormProps) {
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      nativeLanguage: formData.get("nativeLanguage") as string,
      targetLanguage: formData.get("targetLanguage") as string,
      writingStyle: formData.get("writingStyle") as string,
      writingPurpose: formData.get("writingPurpose") as string,
      selfAssessedLevel: formData.get("selfAssessedLevel") as string,
    };
    updateProfile(data);
  };

  if (isLoading) {
    return <ProfileFormSkeleton />;
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="p-4 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              defaultValue={email}
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label>Native Language</Label>
            <Select name="nativeLanguage" defaultValue={nativeLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Target Language</Label>
            <Select name="targetLanguage" defaultValue={targetLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full"
            size="lg"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}