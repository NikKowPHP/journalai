import Link from 'next/link';
import Image from 'next/image';

const FeatureCard = ({ icon, title, description }: { icon: string, title: string, description: string }) => (
  <div className="bg-gray-800 p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-600 text-white mb-4">
      {/* Placeholder for an icon */}
      <span className="text-2xl">{icon}</span>
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
);

export default function Home() {
  return (
    <div className="bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="text-center py-20 px-4 sm:py-32">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            Master a Language by Writing
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-300">
            Shift from passive learning to active creation. Get instant, AI-powered feedback on your journal entries and turn every writing session into a personalized lesson.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/signup" legacyBehavior>
              <a className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105">
                Get Started for Free
              </a>
            </Link>
            <Link href="/dashboard" legacyBehavior>
              <a className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105">
                Go to Dashboard
              </a>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">Everything You Need to Succeed</h2>
            <p className="mt-2 text-gray-400">Our platform is packed with features to make you interview-ready.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon="✍️"
              title="AI-Powered Journaling"
              description="Write naturally in your target language and receive instant feedback on grammar, vocabulary, and style."
            />
            <FeatureCard
              icon="🔍"
              title="Contextual Corrections"
              description="Get explanations for corrections that teach you why something was wrong and how to improve."
            />
            <FeatureCard
              icon="📈"
              title="Dynamic Proficiency Tracking"
              description="Our AI tracks your progress across all language skills and adjusts recommendations accordingly."
            />
            <FeatureCard
              icon="🔄"
              title="Spaced Repetition"
              description="Automatically review vocabulary and grammar points at optimal intervals for retention."
            />
            <FeatureCard
              icon="📊"
              title="Progress Analytics"
              description="Visualize your improvement over time with detailed charts and proficiency metrics."
            />
            <FeatureCard
              icon="📄"
              title="Exportable Reports"
              description="Download your writing history and progress reports to share with teachers or for personal review."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">Get Ready in 3 Simple Steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold text-blue-500 bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mb-4">1</div>
              <h3 className="text-xl font-bold mb-2">Select Your Role</h3>
              <p className="text-gray-400">Choose your target job, like "Junior Laravel Developer", to create a new learning objective.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold text-blue-500 bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mb-4">2</div>
              <h3 className="text-xl font-bold mb-2">Practice & Refine</h3>
              <p className="text-gray-400">Answer AI-generated questions with your voice and get instant feedback and analysis.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold text-blue-500 bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mb-4">3</div>
              <h3 className="text-xl font-bold mb-2">Track & Succeed</h3>
              <p className="text-gray-400">Monitor your readiness score, review your progress, and walk into your next interview with confidence.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-blue-600">
        <div className="max-w-4xl mx-auto text-center py-16 px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Ready to Achieve Fluency?
          </h2>
          <p className="text-blue-200 mt-2 mb-6">Transform your language learning through active writing practice.</p>
          <Link href="/signup" legacyBehavior>
            <a className="bg-white text-blue-600 font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105">
              Sign Up and Start Practicing
            </a>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-500">
          <p>© {new Date().getFullYear()} LinguaScribe. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}