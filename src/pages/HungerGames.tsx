import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Sword, Shield, Zap, Eye, Heart, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const HungerGamesSimulator = () => {
  const [population, setPopulation] = useState([]);
  const [generation, setGeneration] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [environment, setEnvironment] = useState('balanced');
  const [lastBattle, setLastBattle] = useState([]);
  const [totalDeaths, setTotalDeaths] = useState(0);
  
  const INITIAL_POPULATION = 24;
  const SURVIVORS_PER_GENERATION = 12;
  const MUTATION_RATE = 0.15;

  const environments = {
    balanced: { 
      name: 'Balanced Arena', 
      combat: 1, stealth: 1, speed: 1, survival: 1, intelligence: 1,
      gradient: 'from-gray-50 to-gray-100',
      border: 'border-gray-200'
    },
    forest: { 
      name: 'Dense Forest', 
      combat: 0.7, stealth: 1.5, speed: 0.8, survival: 1.3, intelligence: 1.1,
      gradient: 'from-green-50 to-green-100',
      border: 'border-green-200'
    },
    desert: { 
      name: 'Desert Wasteland', 
      combat: 1.1, stealth: 0.6, speed: 1.2, survival: 1.8, intelligence: 1.0,
      gradient: 'from-yellow-50 to-orange-100',
      border: 'border-orange-200'
    },
    urban: { 
      name: 'Ruined City', 
      combat: 1.3, stealth: 1.0, speed: 1.4, survival: 0.8, intelligence: 1.3,
      gradient: 'from-slate-50 to-slate-100',
      border: 'border-slate-200'
    },
    arctic: { 
      name: 'Frozen Tundra', 
      combat: 0.9, stealth: 0.8, speed: 0.7, survival: 2.0, intelligence: 1.2,
      gradient: 'from-blue-50 to-cyan-100',
      border: 'border-blue-200'
    }
  };

  const districts = [
    'Agriculture', 'Masonry', 'Technology', 'Fishing', 'Power', 'Transportation',
    'Lumber', 'Textiles', 'Grain', 'Livestock', 'Electronics', 'Mining'
  ];

  // Generate random tribute
  const generateTribute = (id) => {
    const district = districts[Math.floor(Math.random() * districts.length)];
    return {
      id,
      name: `Tribute-${id}`,
      district,
      combat: Math.random() * 100,
      stealth: Math.random() * 100,
      speed: Math.random() * 100,
      survival: Math.random() * 100,
      intelligence: Math.random() * 100,
      alive: true,
      kills: 0,
      age: 0
    };
  };

  // Calculate fitness based on environment
  const calculateFitness = (tribute, env) => {
    const envWeights = environments[env];
    return (
      tribute.combat * envWeights.combat +
      tribute.stealth * envWeights.stealth +
      tribute.speed * envWeights.speed +
      tribute.survival * envWeights.survival +
      tribute.intelligence * envWeights.intelligence
    ) / 5;
  };

  // Initialize population
  const initializePopulation = useCallback(() => {
    const newPop = [];
    for (let i = 1; i <= INITIAL_POPULATION; i++) {
      newPop.push(generateTribute(i));
    }
    setPopulation(newPop);
    setGeneration(0);
    setTotalDeaths(0);
    setLastBattle([]);
  }, []);

  // Battle simulation
  const simulateBattle = (tribute1, tribute2, env) => {
    const fitness1 = calculateFitness(tribute1, env);
    const fitness2 = calculateFitness(tribute2, env);
    
    // Add some randomness to battles
    const luck1 = Math.random() * 30;
    const luck2 = Math.random() * 30;
    
    const finalScore1 = fitness1 + luck1;
    const finalScore2 = fitness2 + luck2;
    
    return finalScore1 > finalScore2 ? tribute1 : tribute2;
  };

  // Run Hunger Games simulation
  const runHungerGames = useCallback(() => {
    if (population.length === 0) return;

    let survivors = [...population.filter(t => t.alive)];
    const battleLog = [];
    
    // Random battles until we have desired number of survivors
    while (survivors.length > SURVIVORS_PER_GENERATION) {
      // Pick two random tributes
      const idx1 = Math.floor(Math.random() * survivors.length);
      let idx2 = Math.floor(Math.random() * survivors.length);
      while (idx2 === idx1) {
        idx2 = Math.floor(Math.random() * survivors.length);
      }
      
      const tribute1 = survivors[idx1];
      const tribute2 = survivors[idx2];
      
      const winner = simulateBattle(tribute1, tribute2, environment);
      const loser = winner === tribute1 ? tribute2 : tribute1;
      
      battleLog.push({
        winner: winner.name,
        loser: loser.name,
        winnerFitness: calculateFitness(winner, environment).toFixed(1),
        loserFitness: calculateFitness(loser, environment).toFixed(1)
      });
      
      // Remove loser
      survivors = survivors.filter(t => t.id !== loser.id);
      
      // Increment winner's kills
      const winnerIndex = survivors.findIndex(t => t.id === winner.id);
      if (winnerIndex !== -1) {
        survivors[winnerIndex] = { ...survivors[winnerIndex], kills: survivors[winnerIndex].kills + 1 };
      }
    }
    
    setLastBattle(battleLog.slice(-5)); // Keep last 5 battles
    setTotalDeaths(prev => prev + battleLog.length);
    
    // Reproduction phase
    const nextGeneration = [];
    let nextId = Math.max(...population.map(t => t.id)) + 1;
    
    // Age survivors and add them to next generation
    survivors.forEach(survivor => {
      nextGeneration.push({ ...survivor, age: survivor.age + 1 });
    });
    
    // Create offspring to reach original population size
    while (nextGeneration.length < INITIAL_POPULATION) {
      const parent1 = survivors[Math.floor(Math.random() * survivors.length)];
      const parent2 = survivors[Math.floor(Math.random() * survivors.length)];
      
      const child = {
        id: nextId++,
        name: `Tribute-${nextId - 1}`,
        district: Math.random() < 0.5 ? parent1.district : parent2.district,
        combat: crossover(parent1.combat, parent2.combat),
        stealth: crossover(parent1.stealth, parent2.stealth),
        speed: crossover(parent1.speed, parent2.speed),
        survival: crossover(parent1.survival, parent2.survival),
        intelligence: crossover(parent1.intelligence, parent2.intelligence),
        alive: true,
        kills: 0,
        age: 0
      };
      
      nextGeneration.push(child);
    }
    
    setPopulation(nextGeneration);
    setGeneration(prev => prev + 1);
  }, [population, environment]);

  // Crossover with mutation
  const crossover = (trait1, trait2) => {
    let result = (trait1 + trait2) / 2; // Average of parents
    
    // Mutation
    if (Math.random() < MUTATION_RATE) {
      result += (Math.random() - 0.5) * 40; // ±20 mutation
    }
    
    return Math.max(0, Math.min(100, result)); // Clamp between 0-100
  };

  // Auto-run effect
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(runHungerGames, speed);
      return () => clearInterval(interval);
    }
  }, [isRunning, speed, runHungerGames]);

  // Initialize on mount
  useEffect(() => {
    initializePopulation();
  }, [initializePopulation]);

  const getTraitColor = (value) => {
    if (value >= 80) return 'bg-red-500';
    if (value >= 60) return 'bg-orange-500';
    if (value >= 40) return 'bg-yellow-500';
    if (value >= 20) return 'bg-green-500';
    return 'bg-gray-400';
  };

  const getTraitIcon = (trait) => {
    const iconClass = "text-gray-600";
    switch (trait) {
      case 'combat': return <Sword size={14} className={iconClass} />;
      case 'stealth': return <Eye size={14} className={iconClass} />;
      case 'speed': return <Zap size={14} className={iconClass} />;
      case 'survival': return <Heart size={14} className={iconClass} />;
      case 'intelligence': return <Shield size={14} className={iconClass} />;
      default: return null;
    }
  };

  const averageTraits = population.reduce((acc, tribute) => {
    if (tribute.alive) {
      acc.combat += tribute.combat;
      acc.stealth += tribute.stealth;
      acc.speed += tribute.speed;
      acc.survival += tribute.survival;
      acc.intelligence += tribute.intelligence;
      acc.count += 1;
    }
    return acc;
  }, { combat: 0, stealth: 0, speed: 0, survival: 0, intelligence: 0, count: 0 });

  if (averageTraits.count > 0) {
    Object.keys(averageTraits).forEach(key => {
      if (key !== 'count') averageTraits[key] /= averageTraits.count;
    });
  }

  const currentEnv = environments[environment];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="w-full px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">🏹 Hunger Games Evolution Simulator</h1>
            <p className="text-gray-600 mt-1">
              Watch tributes evolve through generations of deadly competition
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
          
          {/* Top Stats Bar */}
          <div className={`bg-gradient-to-r ${currentEnv.gradient} rounded-xl p-6 mb-8 ${currentEnv.border} border shadow-lg`}>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800">{generation}</div>
                <div className="text-sm text-gray-600 font-medium">Generation</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{population.filter(t => t.alive).length}</div>
                <div className="text-sm text-gray-600 font-medium">Living Tributes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{totalDeaths}</div>
                <div className="text-sm text-gray-600 font-medium">Total Deaths</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{SURVIVORS_PER_GENERATION}</div>
                <div className="text-sm text-gray-600 font-medium">Survivors/Gen</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{(MUTATION_RATE * 100)}%</div>
                <div className="text-sm text-gray-600 font-medium">Mutation Rate</div>
              </div>
            </div>
          </div>

          {/* Controls Section */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            
            {/* Controls Panel */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Controls</h2>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsRunning(!isRunning)}
                    className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                  >
                    {isRunning ? <Pause size={18} /> : <Play size={18} />}
                    {isRunning ? 'Pause' : 'Start Games'}
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
                  <label className="block text-sm font-medium mb-3 text-gray-700">Arena Environment</label>
                  <select
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    {Object.entries(environments).map(([key, env]) => (
                      <option key={key} value={key}>{env.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-700">Simulation Speed</label>
                  <input
                    type="range"
                    min="500"
                    max="3000"
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Fast</span>
                    <span className="font-medium">{speed}ms</span>
                    <span>Slow</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Population Averages */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Population Averages</h2>
              <div className="space-y-4">
                {['combat', 'stealth', 'speed', 'survival', 'intelligence'].map(trait => (
                  <div key={trait} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getTraitIcon(trait)}
                        <span className="text-gray-700 capitalize font-medium">{trait}</span>
                      </div>
                      <span className="text-gray-800 font-bold">{averageTraits[trait]?.toFixed(0) || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${getTraitColor(averageTraits[trait] || 0)}`}
                        style={{ width: `${averageTraits[trait] || 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Environment Effects */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Environment Effects</h2>
              <div className={`p-4 rounded-lg bg-gradient-to-r ${currentEnv.gradient} ${currentEnv.border} border mb-4`}>
                <h3 className="font-bold text-gray-800 text-center">{currentEnv.name}</h3>
              </div>
              <div className="space-y-3">
                {Object.entries(environments[environment]).map(([key, value]) => {
                  if (key === 'name' || key === 'gradient' || key === 'border') return null;
                  // Ensure value is treated as number for comparison
                  const numValue = typeof value === 'number' ? value : 0;
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getTraitIcon(key)}
                        <span className="text-gray-700 capitalize">{key}</span>
                      </div>
                      <span className={`font-bold px-2 py-1 rounded text-sm ${
                        numValue > 1 ? 'text-green-700 bg-green-100' : 
                        numValue < 1 ? 'text-red-700 bg-red-100' : 'text-gray-700 bg-gray-100'
                      }`}>
                        {numValue.toFixed(1)}x
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Battles */}
            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-500">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                ⚔️ Recent Battles
              </h2>
              {lastBattle.length > 0 ? (
                <div className="space-y-3">
                  {lastBattle.map((battle, i) => (
                    <div key={i} className="bg-red-50 p-3 rounded-lg border border-red-200">
                      <div className="text-gray-800 font-medium mb-1">
                        <span className="text-green-600 font-bold">{battle.winner}</span>
                        <span className="text-gray-600"> defeats </span>
                        <span className="text-red-600">{battle.loser}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Fitness: {battle.winnerFitness} vs {battle.loserFitness}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8 text-sm">
                  No battles yet. Start the simulation to see combat!
                </div>
              )}
            </div>
          </div>

          {/* Tributes Grid */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              👥 Tributes (Generation {generation})
              <span className="text-lg text-gray-500 font-normal ml-2">(Sorted by Fitness)</span>
            </h2>
            
            {population.filter(t => t.alive).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {population
                  .filter(t => t.alive)
                  .sort((a, b) => calculateFitness(b, environment) - calculateFitness(a, environment))
                  .map((tribute, index) => (
                  <div key={tribute.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-200">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-bold text-gray-800">{tribute.name}</div>
                        <div className="text-sm text-gray-600">{tribute.district}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-orange-600 font-bold text-lg">#{index + 1}</div>
                        <div className="text-xs text-gray-500">
                          Fitness: {calculateFitness(tribute, environment).toFixed(1)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      {['combat', 'stealth', 'speed', 'survival', 'intelligence'].map(trait => (
                        <div key={trait} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              {getTraitIcon(trait)}
                              <span className="text-xs text-gray-600 capitalize">{trait}</span>
                            </div>
                            <span className="text-xs text-gray-800 font-semibold">{tribute[trait].toFixed(0)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${getTraitColor(tribute[trait])}`}
                              style={{ width: `${tribute[trait]}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <div className="flex items-center gap-1">
                        <Sword size={12} className="text-red-500" />
                        <span className="text-xs text-gray-700">Kills: {tribute.kills}</span>
                      </div>
                      <div className="text-xs text-gray-500">Age: {tribute.age}</div>
                    </div>
                    
                    {/* Top 3 badges */}
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
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-2">No tributes alive</div>
                <button
                  onClick={initializePopulation}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                  Initialize Population
                </button>
              </div>
            )}
          </div>

          {/* Algorithm Explanation */}
          <div className="mt-8 bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl border border-red-100">
            <h3 className="text-xl font-semibold text-red-800 mb-4">🧬 How the Evolution Works:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-red-700">
              <div className="space-y-3">
                <div>
                  <strong className="text-red-800">Population:</strong> 24 tributes with 5 traits: Combat, Stealth, Speed, Survival, Intelligence
                </div>
                <div>
                  <strong className="text-red-800">Selection:</strong> Tributes battle randomly until 12 survivors remain
                </div>
                <div>
                  <strong className="text-red-800">Fitness:</strong> Calculated based on environment - different arenas favor different traits
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <strong className="text-red-800">Reproduction:</strong> Survivors create offspring by combining their traits
                </div>
                <div>
                  <strong className="text-red-800">Mutation:</strong> 15% chance for trait variation in offspring
                </div>
                <div>
                  <strong className="text-red-800">Environment:</strong> Each arena has multipliers that affect which traits are most valuable
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HungerGamesSimulator;