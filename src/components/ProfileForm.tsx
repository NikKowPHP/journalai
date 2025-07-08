import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ProfileForm() {
  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Display Name</Label>
        <Input id="name" placeholder="Enter your display name" />
      </div>

      <div className="space-y-2">
        <Label>Native Language</Label>
        <Select>
          <SelectTrigger className="hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value="english"
              className="focus:bg-accent focus:text-accent-foreground"
            >
              English
            </SelectItem>
            <SelectItem
              value="spanish"
              className="focus:bg-accent focus:text-accent-foreground"
            >
              Spanish
            </SelectItem>
            <SelectItem
              value="french"
              className="focus:bg-accent focus:text-accent-foreground"
            >
              French
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Target Language</Label>
        <Select>
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
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="Enter your email" />
      </div>

      <div className="pt-4 border-t">
        <h3 className="text-lg font-medium mb-2">Data Management</h3>
        <Button variant="outline">
          Export My Data
        </Button>
      </div>
    </Card>
  )
}