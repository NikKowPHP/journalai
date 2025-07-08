import { Button } from "@/components/ui/button"

export function CookieBanner() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 flex justify-between items-center">
      <p className="text-sm">
        We use cookies to enhance your experience. By continuing to visit this site, you agree to our use of cookies.
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          Decline
        </Button>
        <Button size="sm">
          Accept
        </Button>
      </div>
    </div>
  )
}