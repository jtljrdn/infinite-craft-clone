import { InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const LINKS = [
  { label: "GitHub", href: "https://github.com/jtljrdn" },
  { label: "Website", href: "https://jtlee.dev" },
  { label: "Twitter", href: "https://x.com/jtljrdn" },
  { label: "Ko-fi", href: "https://ko-fi.com/jtljrdn" },
];

export function AboutDialog() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="ghost" size="sm" />}>
        <InfoIcon data-icon="inline-start" />
        About
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>About</DialogTitle>
          <DialogDescription>
            Little Alchemy, but it never ends. What will you create? What will you discover? The possibilities are infinite.
          </DialogDescription>
        </DialogHeader>
        <p className="text-muted-foreground">
          Made by{" "}
          <a
            href="https://jtlee.dev"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Jordan Lee
          </a>
          . Inspired by{" "}
          <a
            href="https://neal.fun/infinite-craft"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Infinite Craft
          </a>{" "}
          by Neal Agarwal.
        </p>
        <DialogFooter className="sm:justify-start">
          {LINKS.map((link) => (
            <Button
              key={link.href}
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<a href={link.href} target="_blank" rel="noreferrer" />}
            >
              {link.label}
            </Button>
          ))}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
