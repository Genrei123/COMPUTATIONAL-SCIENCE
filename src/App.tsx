import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Github, Palette, Sword, Zap } from 'lucide-react';
import ColorEvolution from './pages/ColorEvolution';
import HungerGames from './pages/HungerGames';

interface GameCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

const GameCard: React.FC<GameCardProps> = ({ title, description, icon, path, color }) => {
  return (
    <Link
      to={path}
      className={`group block p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-l-4 ${color}`}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${color.replace('border-l-', 'from-')} to-gray-100`}>
          {icon}
        </div>
        <h2 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
          {title}
        </h2>
      </div>
      <p className="text-gray-600 leading-relaxed">
        {description}
      </p>
      <div className="mt-4 flex items-center text-blue-600 font-medium">
        <span>Play Now</span>
        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
    </Link>
  );
};

const Homepage: React.FC = () => {
  const games = [
    {
      title: "Color Evolution",
      description: "Watch a genetic algorithm evolve random colors toward a target. Demonstrates selection, crossover, and mutation in a beautiful visual way.",
      icon: <Palette className="w-6 h-6 text-blue-600" />,
      path: "/color-evolution",
      color: "border-l-blue-500"
    },
    {
      title: "Hunger Games Simulator", 
      description: "Survive the arena! Tributes with different traits compete in various environments. See how natural selection shapes populations over generations.",
      icon: <Sword className="w-6 h-6 text-red-600" />,
      path: "/hunger-games",
      color: "border-l-red-500"
    },
    {
      title: "GitHub Repository",
      description: "Explore the source code that runs this project. Co-generated using Claude 4",
      icon: <Github className="w-6 h-6 text-purple-600" />,
      path: "https://github.com/turing-patterns", 
      color: "border-l-purple-500"
    }
  ];

  return (
    <div className="min-h-screen min-w-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="w-full px-6 py-4">
          <h1 className="text-3xl font-bold text-gray-800">
            🧬 Algorithm Playground
          </h1>
          <p className="text-gray-600 mt-2">
            Interactive simulations of evolutionary algorithms and pattern generation
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Explore the Beauty of Algorithms
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Discover how simple rules can create complex behaviors through three interactive simulations. 
            From genetic evolution to natural pattern formation, see mathematics come alive.
          </p>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {games.map((game, index) => (
            <GameCard
              key={index}
              title={game.title}
              description={game.description}
              icon={game.icon}
              path={game.path}
              color={game.color}
            />
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 bg-white rounded-xl shadow-lg p-8 max-w-7xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            What You'll Learn
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Palette className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Genetic Algorithms</h4>
              <p className="text-sm text-gray-600">
                How evolution optimizes solutions through selection, crossover, and mutation
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Sword className="w-6 h-6 text-red-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Natural Selection</h4>
              <p className="text-sm text-gray-600">
                How environmental pressures shape populations and drive adaptation
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Code Examples</h4>
              <p className="text-sm text-gray-600">
                How we can leverage code to simulate evolution and natural selection
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="w-full px-6 text-center">
          <p className="text-gray-300">
            Built with React, TypeScript, and a passion for making algorithms accessible
          </p>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        {/* Uncomment and modify these routes based on your actual component paths */}
        <Route path="/color-evolution" element={<ColorEvolution />} />
        <Route path="/hunger-games" element={<HungerGames />} />
        {/* <Route path="/turing-patterns" element={<TuringPatterns />} /> */}
      </Routes>
    </Router>
  );
};

export default App;