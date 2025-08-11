import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Target, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const ColorGeneticAlgorithm = () => {
  const [population, setPopulation] = useState([]);
  const [generation, setGeneration] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [targetColor, setTargetColor] = useState({ r: 255, g: 100, b: 150 });
  const [speed, setSpeed] = useState(200);
  const [bestFitness, setBestFitness] = useState(0);
  
  const POPULATION_SIZE = 20;
  const MUTATION_RATE = 0.1;

  // Generate random color
  const randomColor = () => ({
    r: Math.floor(Math.random() * 256),
    g: Math.floor(Math.random() * 256),
    b: Math.floor(Math.random() * 256)
  });

  // Calculate fitness (how close a color is to target)
  const calculateFitness = (color) => {
    const dr = Math.abs(color.r - targetColor.r);
    const dg = Math.abs(color.g - targetColor.g);
    const db = Math.abs(color.b - targetColor.b);
    const distance = Math.sqrt(dr * dr + dg * dg + db * db);
    const maxDistance = Math.sqrt(255 * 255 * 3);
    return 1 - (distance / maxDistance);
  };

  // Initialize population
  const initializePopulation = useCallback(() => {
    const newPop = [];
    for (let i = 0; i < POPULATION_SIZE; i++) {
      const color = randomColor();
      newPop.push({
        color,
        fitness: calculateFitness(color),
        id: Math.random()
      });
    }
    setPopulation(newPop);
    setGeneration(0);
    setBestFitness(Math.max(...newPop.map(ind => ind.fitness)));
  }, [targetColor]);

  // Selection (tournament selection)
  const selectParent = (pop) => {
    const tournamentSize = 3;
    let best = pop[Math.floor(Math.random() * pop.length)];
    
    for (let i = 1; i < tournamentSize; i++) {
      const competitor = pop[Math.floor(Math.random() * pop.length)];
      if (competitor.fitness > best.fitness) {
        best = competitor;
      }
    }
    return best;
  };

  // Crossover (blend colors)
  const crossover = (parent1, parent2) => {
    const alpha = Math.random();
    return {
      r: Math.round(parent1.color.r * alpha + parent2.color.r * (1 - alpha)),
      g: Math.round(parent1.color.g * alpha + parent2.color.g * (1 - alpha)),
      b: Math.round(parent1.color.b * alpha + parent2.color.b * (1 - alpha))
    };
  };

  // Mutation
  const mutate = (color) => {
    const mutatedColor = { ...color };
    
    if (Math.random() < MUTATION_RATE) {
      mutatedColor.r = Math.max(0, Math.min(255, mutatedColor.r + (Math.random() - 0.5) * 60));
    }
    if (Math.random() < MUTATION_RATE) {
      mutatedColor.g = Math.max(0, Math.min(255, mutatedColor.g + (Math.random() - 0.5) * 60));
    }
    if (Math.random() < MUTATION_RATE) {
      mutatedColor.b = Math.max(0, Math.min(255, mutatedColor.b + (Math.random() - 0.5) * 60));
    }
    
    return mutatedColor;
  };

  // Evolve one generation
  const evolveGeneration = useCallback(() => {
    if (population.length === 0) return;

    const newPopulation = [];
    
    // Keep best individual (elitism)
    const sortedPop = [...population].sort((a, b) => b.fitness - a.fitness);
    newPopulation.push({
      ...sortedPop[0],
      id: Math.random()
    });

    // Generate rest of population
    while (newPopulation.length < POPULATION_SIZE) {
      const parent1 = selectParent(population);
      const parent2 = selectParent(population);
      
      let childColor = crossover(parent1, parent2);
      childColor = mutate(childColor);
      
      newPopulation.push({
        color: childColor,
        fitness: calculateFitness(childColor),
        id: Math.random()
      });
    }

    setPopulation(newPopulation);
    setGeneration(prev => prev + 1);
    setBestFitness(Math.max(...newPopulation.map(ind => ind.fitness)));
  }, [population, targetColor]);

  // Auto-evolution effect
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(evolveGeneration, speed);
      return () => clearInterval(interval);
    }
  }, [isRunning, speed, evolveGeneration]);

  // Initialize on mount and target change
  useEffect(() => {
    initializePopulation();
  }, [initializePopulation]);

  const colorToHex = (color) => {
    const r = Math.round(color.r).toString(16).padStart(2, '0');
    const g = Math.round(color.g).toString(16).padStart(2, '0');
    const b = Math.round(color.b).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  };

  const setRandomTarget = () => {
    setTargetColor(randomColor());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="w-full px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">🎨 Color Genetic Algorithm</h1>
            <p className="text-gray-600 mt-1">
              Watch evolution optimize colors through selection, crossover, and mutation
            </p>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Home size={16} />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Controls Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Controls */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Controls</h2>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsRunning(!isRunning)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    {isRunning ? <Pause size={18} /> : <Play size={18} />}
                    {isRunning ? 'Pause' : 'Start Evolution'}
                  </button>
                  
                  <button
                    onClick={initializePopulation}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                  >
                    <RotateCcw size={18} />
                    Reset
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-700">Evolution Speed</label>
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Fast (50ms)</span>
                    <span className="font-medium">{speed}ms</span>
                    <span>Slow (1000ms)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Target Color */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Target Color</h2>
              <div 
                className="w-full h-32 rounded-xl border-4 border-gray-200 mb-4 shadow-inner"
                style={{ backgroundColor: colorToHex(targetColor) }}
              />
              <div className="text-center mb-4">
                <div className="text-lg font-mono text-gray-700">
                  RGB({targetColor.r}, {targetColor.g}, {targetColor.b})
                </div>
                <div className="text-sm text-gray-500 font-mono">
                  {colorToHex(targetColor)}
                </div>
              </div>
              <button
                onClick={setRandomTarget}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
              >
                <Target size={16} />
                New Random Target
              </button>
            </div>

            {/* Stats */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Statistics</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Generation:</span>
                  <span className="text-2xl font-bold text-blue-600">{generation}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Population:</span>
                  <span className="text-lg font-semibold text-gray-800">{POPULATION_SIZE}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Best Fitness:</span>
                  <span className="text-lg font-semibold text-green-600">{(bestFitness * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Mutation Rate:</span>
                  <span className="text-lg font-semibold text-orange-600">{(MUTATION_RATE * 100)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Population Grid */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              Population - Generation {generation}
              <span className="text-lg text-gray-500 font-normal ml-2">(Sorted by Fitness)</span>
            </h2>
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-15 xl:grid-cols-20 gap-3">
              {population
                .sort((a, b) => b.fitness - a.fitness)
                .map((individual, index) => (
                <div key={individual.id} className="relative group">
                  <div
                    className="w-16 h-16 rounded-xl border-3 transition-all duration-200 hover:scale-110 shadow-md hover:shadow-lg"
                    style={{ 
                      backgroundColor: colorToHex(individual.color),
                      borderColor: index === 0 ? '#fbbf24' : index < 3 ? '#94a3b8' : '#e5e7eb',
                      borderWidth: index === 0 ? '3px' : '2px'
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-80 text-white text-xs p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center">
                    <div className="font-bold">#{index + 1}</div>
                    <div>{(individual.fitness * 100).toFixed(0)}%</div>
                  </div>
                  {index === 0 && (
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                      👑
                    </div>
                  )}
                  {index === 1 && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                      🥈
                    </div>
                  )}
                  {index === 2 && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                      🥉
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Algorithm Explanation */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-100">
            <h3 className="text-xl font-semibold text-blue-800 mb-4">🧬 How the Genetic Algorithm Works:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-blue-700">
              <div className="space-y-3">
                <div>
                  <strong className="text-blue-800">Population:</strong> 20 random colors compete to match the target color
                </div>
                <div>
                  <strong className="text-blue-800">Fitness:</strong> Measured by RGB color similarity using Euclidean distance
                </div>
                <div>
                  <strong className="text-blue-800">Selection:</strong> Tournament selection picks the fittest individuals as parents
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <strong className="text-blue-800">Crossover:</strong> Child colors blend RGB values from two selected parents
                </div>
                <div>
                  <strong className="text-blue-800">Mutation:</strong> Small random changes to RGB values (10% chance per component)
                </div>
                <div>
                  <strong className="text-blue-800">Elitism:</strong> Best individual always survives to the next generation
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ColorGeneticAlgorithm;