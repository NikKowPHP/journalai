import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  FileSignature,
  Sparkles,
  TrendingUp,
  Repeat,
  BarChart3,
  Download,
} from "lucide-react";

const FeatureCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <div className="bg-secondary/50 p-6 rounded-2xl flex flex-col items-start gap-4 transition-transform transform hover:scale-105">
    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary">
      <Icon className="h-6 w-6" />
    </div>
    <div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  </div>
);

export default function Home() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="text-center py-20 px-4 sm:py-32">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent pb-4">
            Master a Language by Writing
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Shift from passive learning to active creation. Get instant,
            AI-powered feedback on your journal entries and turn every writing
            session into a personalized lesson.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button asChild size="lg">
              <Link href="/signup">Get Started for Free</Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-title-1">Everything You Need to Succeed</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Our platform is packed with features designed to accelerate your
              fluency and build lasting knowledge.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={FileSignature}
              title="AI-Powered Journaling"
              description="Write naturally in your target language and receive instant feedback on grammar, vocabulary, and style."
            />
            <FeatureCard
              icon={Sparkles}
              title="Contextual Corrections"
              description="Get explanations for corrections that teach you why something was wrong and how to improve."
            />
            <FeatureCard
              icon={TrendingUp}
              title="Dynamic Proficiency Tracking"
              description="Our AI tracks your progress across all language skills and adjusts recommendations accordingly."
            />
            <FeatureCard
              icon={Repeat}
              title="Spaced Repetition"
              description="Automatically review vocabulary and grammar points at optimal intervals for retention."
            />
            <FeatureCard
              icon={BarChart3}
              title="Progress Analytics"
              description="Visualize your improvement over time with detailed charts and proficiency metrics."
            />
            <FeatureCard
              icon={Download}
              title="Exportable Reports"
              description="Download your writing history and progress reports to share with teachers or for personal review."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-title-1">Get Fluent in 3 Simple Steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center relative">
            {/* Dashed line connecting the steps */}
            <div className="hidden md:block absolute top-8 left-0 w-full h-px">
              <svg
                width="100%"
                height="2"
                className="absolute top-1/2 -translate-y-1/2"
              >
                <line
                  x1="0"
                  y1="1"
                  x2="100%"
                  y2="1"
                  strokeWidth="2"
                  strokeDasharray="8 8"
                  className="stroke-border"
                />
              </svg>
            </div>

            <div className="flex flex-col items-center relative z-10">
              <div className="text-4xl font-bold text-primary bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mb-4 border-4 border-background">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Write & Submit</h3>
              <p className="text-muted-foreground">
                Start a journal entry on any topic. Express your thoughts freely
                in your target language.
              </p>
            </div>
            <div className="flex flex-col items-center relative z-10">
              <div className="text-4xl font-bold text-primary bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mb-4 border-4 border-background">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">Get AI Analysis</h3>
              <p className="text-muted-foreground">
                Receive instant, detailed feedback on your writing, from grammar
                to phrasing and vocabulary.
              </p>
            </div>
            <div className="flex flex-col items-center relative z-10">
              <div className="text-4xl font-bold text-primary bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mb-4 border-4 border-background">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Review & Grow</h3>
              <p className="text-muted-foreground">
                Add corrections to your personalized study deck and track your
                proficiency as it improves over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-secondary/30">
        <div className="max-w-4xl mx-auto text-center py-20 px-4">
          <h2 className="text-title-1">Ready to Achieve Fluency?</h2>
          <p className="text-muted-foreground mt-4 mb-8 max-w-2xl mx-auto">
            Transform your language learning through active writing practice.
            Start for free, no credit card required.
          </p>
          <Button asChild size="lg">
            <Link href="/signup">Sign Up and Start Writing</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
