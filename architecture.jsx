import React, { useState } from 'react';
import { Database, Globe, Users, BarChart3, BookOpen, Brain, Server, Lock } from 'lucide-react';

export default function SignLanguageArchitecture() {
  const [selectedLayer, setSelectedLayer] = useState(null);

  const layers = {
    frontend: {
      title: "Frontend Layer",
      icon: Globe,
      color: "bg-blue-500",
      components: [
        { name: "index.html", desc: "Main HTML structure with sections: Home, Lessons, Practice, Progress" },
        { name: "styles.css", desc: "Styling and responsive design" },
        { name: "script.js", desc: "Client-side logic, quiz engine, flashcard navigation" },
        { name: "Launch Slide", desc: "NEW: Splash screen entry point" }
      ]
    },
    firebase: {
      title: "Firebase Backend",
      icon: Database,
      color: "bg-orange-500",
      components: [
        { name: "Authentication", desc: "User login/signup (Google, Email, Anonymous)" },
        { name: "Firestore Database", desc: "Store user progress, scores, achievements, learned signs" },
        { name: "Cloud Storage", desc: "Optional: Store sign language images/videos" },
        { name: "Hosting", desc: "Deploy your app (free tier available)" }
      ]
    },
    data: {
      title: "Data Structure",
      icon: Server,
      color: "bg-green-500",
      components: [
        { name: "Users Collection", desc: "userId, email, displayName, createdAt" },
        { name: "Progress Collection", desc: "userId, category, signsLearned[], totalScore, quizzesTaken" },
        { name: "Achievements Collection", desc: "userId, achievementId, unlockedAt, category" },
        { name: "Lessons (Static)", desc: "Alphabet, Numbers, Greetings, Common Words - can be in JSON or Firestore" }
      ]
    },
    features: {
      title: "Key Features",
      icon: Brain,
      color: "bg-purple-500",
      components: [
        { name: "User Profiles", desc: "Track individual progress across devices" },
        { name: "Real-time Sync", desc: "Progress saved automatically to cloud" },
        { name: "Leaderboard", desc: "Compare scores with other learners (optional)" },
        { name: "Offline Support", desc: "Cache lessons for offline learning" }
      ]
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 p-8 overflow-auto">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">🤟 Sign Language Learner</h1>
          <h2 className="text-2xl text-slate-600 mb-4">Software Architecture</h2>
          <p className="text-slate-500">Click on any layer to see details</p>
        </div>

        {/* Architecture Diagram */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(layers).map(([key, layer]) => {
              const Icon = layer.icon;
              const isSelected = selectedLayer === key;
              
              return (
                <div
                  key={key}
                  onClick={() => setSelectedLayer(selectedLayer === key ? null : key)}
                  className={`
                    relative cursor-pointer rounded-lg border-2 p-6 transition-all duration-300
                    ${isSelected 
                      ? 'border-blue-500 shadow-xl scale-105' 
                      : 'border-slate-200 hover:border-blue-300 hover:shadow-md'}
                  `}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`${layer.color} p-3 rounded-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">{layer.title}</h3>
                  </div>
                  
                  {isSelected && (
                    <div className="mt-4 space-y-3 animate-fadeIn">
                      {layer.components.map((component, idx) => (
                        <div key={idx} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                          <h4 className="font-semibold text-slate-700 mb-1">{component.name}</h4>
                          <p className="text-sm text-slate-600">{component.desc}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Data Flow */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Data Flow
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-semibold min-w-[120px]">User Action</div>
              <div className="text-slate-400">→</div>
              <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg font-semibold min-w-[120px]">script.js</div>
              <div className="text-slate-400">→</div>
              <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-semibold min-w-[120px]">Firebase SDK</div>
              <div className="text-slate-400">→</div>
              <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-semibold min-w-[120px]">Firestore</div>
            </div>
            <p className="text-sm text-slate-600 ml-2">Example: User completes quiz → Update score → Save to Firebase → Sync across devices</p>
          </div>
        </div>

        {/* Implementation Steps */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            Implementation Steps
          </h3>
          <ol className="space-y-4">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">1</span>
              <div>
                <h4 className="font-semibold text-slate-800">Set up Firebase Project</h4>
                <p className="text-slate-600 text-sm">Create project at console.firebase.google.com, enable Authentication & Firestore</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">2</span>
              <div>
                <h4 className="font-semibold text-slate-800">Add Firebase SDK to HTML</h4>
                <p className="text-slate-600 text-sm">Include Firebase scripts before your script.js</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">3</span>
              <div>
                <h4 className="font-semibold text-slate-800">Initialize Firebase in script.js</h4>
                <p className="text-slate-600 text-sm">Configure with your Firebase project credentials</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">4</span>
              <div>
                <h4 className="font-semibold text-slate-800">Create Database Collections</h4>
                <p className="text-slate-600 text-sm">Set up Firestore collections for users, progress, achievements</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">5</span>
              <div>
                <h4 className="font-semibold text-slate-800">Update script.js Logic</h4>
                <p className="text-slate-600 text-sm">Replace localStorage with Firestore read/write operations</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">6</span>
              <div>
                <h4 className="font-semibold text-slate-800">Add Launch Slide</h4>
                <p className="text-slate-600 text-sm">Implement splash screen with smooth transition to main app</p>
              </div>
            </li>
          </ol>
        </div>

        {/* Security Note */}
        <div className="mt-8 bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Lock className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-amber-900 mb-2">Security Best Practices</h4>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• Set up Firestore Security Rules to protect user data</li>
                <li>• Enable authentication before allowing database writes</li>
                <li>• Use Firebase App Check to prevent abuse</li>
                <li>• Keep API keys in environment variables (for production)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}