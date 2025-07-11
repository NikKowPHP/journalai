import { useMutation, useQueryClient } from "@tanstack/react-query";
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

interface ProfileFormProps {
  email?: string;
  nativeLanguage?: string;
  targetLanguage?: string;
  writingStyle?: string;
  writingPurpose?: string;
  selfAssessedLevel?: string;
}

export function ProfileForm({
  email,
  nativeLanguage,
  targetLanguage,
  writingStyle,
  writingPurpose,
  selfAssessedLevel,
}: ProfileFormProps) {
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<ProfileFormProps>) => {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateProfileMutation.mutate({
      nativeLanguage: formData.get('nativeLanguage') as string,
      targetLanguage: formData.get('targetLanguage') as string,
      writingStyle: formData.get('writingStyle') as string,
      writingPurpose: formData.get('writingPurpose') as string,
      selfAssessedLevel: formData.get('selfAssessedLevel') as string,
    });
  };

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
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="spanish">Spanish</SelectItem>
                <SelectItem value="french">French</SelectItem>
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
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="spanish">Spanish</SelectItem>
                <SelectItem value="french">French</SelectItem>
              </SelectContent>
            </Select>
          </div>
        
          <Button 
            type="submit" 
            disabled={updateProfileMutation.isPending}
            className="w-full"
            size="lg"
          >
            {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}