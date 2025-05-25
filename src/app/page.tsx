import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  Code,
  LayoutDashboard,
  Lock,
  Paintbrush,
  Settings,
  Shield,
  Users,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center mb-20">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Next.js <span className="text-primary">Starter Template</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mb-8">
          A production-ready foundation for your next web application with
          authentication, UI components, and essential tooling pre-configured.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/dashboard">
              Get Started
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link
              href="https://github.com/Nuri1977/my-nextjs-template"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Code className="mr-2 h-4 w-4" />
              View on GitHub
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-12">Core Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Authentication */}
          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Authentication</CardTitle>
              <CardDescription>
                Complete authentication system with login, registration, and
                password reset
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Uses Better Auth for secure, passwordless authentication with
                email verification and more.
              </p>
            </CardContent>
          </Card>

          {/* UI Components */}
          <Card>
            <CardHeader>
              <Paintbrush className="h-8 w-8 text-primary mb-2" />
              <CardTitle>UI Components</CardTitle>
              <CardDescription>
                Beautiful, accessible components built with Radix UI and
                Tailwind
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Includes shadcn/ui components that are customizable and ready
                for production use.
              </p>
            </CardContent>
          </Card>

          {/* Database Integration */}
          <Card>
            <CardHeader>
              <Settings className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Database Ready</CardTitle>
              <CardDescription>
                Preconfigured with Prisma ORM and PostgreSQL support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Easily connect to your database with Prisma's type-safe client
                and schema management.
              </p>
            </CardContent>
          </Card>

          {/* Admin Dashboard */}
          <Card>
            <CardHeader>
              <LayoutDashboard className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Admin Dashboard</CardTitle>
              <CardDescription>
                Ready-made admin interface with user management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Control your application with an intuitive admin dashboard
                that's easy to extend.
              </p>
            </CardContent>
          </Card>

          {/* User Management */}
          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Complete user profile and settings system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Manage user accounts, roles, and permissions with ready-to-use
                components.
              </p>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <Lock className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Security First</CardTitle>
              <CardDescription>
                Built with security best practices from the start
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Implements security best practices for authentication, API
                routes, and data handling.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-12">Tech Stack</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {[
            "Next.js 15.2",
            "React 18.3",
            "TypeScript",
            "Tailwind CSS",
            "shadcn/ui",
            "Prisma ORM",
            "PostgreSQL",
            "Better Auth",
            "UploadThing",
            "React Hook Form",
            "Zod",
            "Lucide Icons",
          ].map((tech) => (
            <Badge key={tech} variant="outline" className="text-sm py-2 px-4">
              {tech}
            </Badge>
          ))}
        </div>
      </section>

      {/* Getting Started */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Ready to Get Started?</CardTitle>
            <CardDescription>
              Start building your next project with this template
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              This template provides everything you need to quickly launch a
              production-ready web application. Clone the repository, install
              the dependencies, and start coding.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild size="lg">
              <Link href="/dashboard">
                Explore Template Features
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </section>
    </div>
  );
}
